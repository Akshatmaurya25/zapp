NitroliteRPC
The NitroliteRPC provides a secure, reliable real-time communication protocol for state channel applications. It enables off-chain message exchange, state updates, and channel management. This system is built around the NitroliteRPC class, which provides the foundational methods for message construction, signing, parsing, and verification.

Message Creation API
Detailed reference for functions that create specific RPC request messages.

RPC Type Definitions
Comprehensive documentation of all TypeScript types and interfaces used by the RPC system.

Core Logic: The NitroliteRPC Class
The NitroliteRPC class is central to the RPC system. It offers a suite of static methods to handle the low-level details of the NitroliteRPC protocol.

Message Creation
createRequest
createAppRequest
createResponse
createErrorResponse
Message Signing
signRequestMessage
signResponseMessage
Message Parsing & Validation
parseResponse
These methods ensure that all communication adheres to the defined RPC structure and security requirements.

Generic Message Structure
The NitroliteRPC class operates on messages adhering to the following general structures. For precise details on each field and for specific message types, please refer to the RPC Type Definitions.

// Generic Request message structure
{
  "req": [requestId, method, params, timestamp], // Core request tuple
  "int"?: Intent,          // Optional intent for state changes
  "acc"?: AccountID,       // Optional account scope (channel/app ID)
  "sig": [signature]       // Array of signatures
}

// Generic Response message structure
{
  "res": [requestId, method, dataPayload, timestamp], // Core response tuple
  "acc"?: AccountID,       // Optional account scope
  "int"?: Intent,          // Optional intent
  "sig"?: [signature]      // Optional signatures for certain response types
}

Next Steps
Dive deeper into the specifics of the RPC system:

Message Creation API Details
Explore the high-level functions for constructing various RPC requests.

Browse All RPC Types
Examine the detailed data structures and type definitions used in NitroliteRPC.

---

RPC Message Creation API
The functions detailed below are part of the @erc7824/nitrolite SDK and provide a convenient way to create fully formed, signed, and stringified JSON RPC request messages. These messages are ready for transmission over a WebSocket or any other transport layer communicating with a Nitrolite-compatible broker.

Each function typically takes a MessageSigner (a function you provide to sign messages, usually integrating with a user's wallet) and other relevant parameters, then returns a Promise<string> which resolves to the JSON string of the signed RPC message.

Authentication
These functions are used for the client authentication flow with the broker. The typical sequence is:

Client sends an auth_request (using createAuthRequestMessage).
Broker responds with an auth_challenge.
Client signs the challenge and sends an auth_verify (using createAuthVerifyMessageFromChallenge or createAuthVerifyMessage).
Broker responds with auth_success or auth_failure.
Broker
Client
Broker
Client
auth_request (via createAuthRequestMessage)
auth_challenge (response)
auth_verify (via createAuthVerifyMessage or createAuthVerifyMessageFromChallenge)
auth_success / auth_failure (response)
createAuthRequestMessage
createAuthVerifyMessageFromChallenge
createAuthVerifyMessage
General & Keep-Alive
Functions for general RPC interactions like keep-alive messages.

createPingMessage
Query Operations
Functions for retrieving information from the broker.

createGetConfigMessage
createGetLedgerBalancesMessage
createGetAppDefinitionMessage
createGetChannelsMessage
Application Session Management
Functions for creating and closing application sessions (state channels).

createAppSessionMessage
createCloseAppSessionMessage
Application-Specific Messaging
Function for sending messages within an active application session.

createApplicationMessage
Ledger Channel Management
Functions for managing the underlying ledger channels (direct channels with the broker).

createCloseChannelMessage
createResizeChannelMessage
Advanced: Creating a Local Signer for Development
To begin, you'll often need a fresh key pair (private key, public key, and address). The generateKeyPair utility can be used for this:

import { ethers } from "ethers"; // Make sure ethers is installed

// Definition (as provided in your example)
interface CryptoKeypair {
    privateKey: string;
    publicKey: string;
    address: string;
}

export const generateKeyPair = async (): Promise<CryptoKeypair> => {
    try {
        const wallet = ethers.Wallet.createRandom();
        const privateKeyHash = ethers.utils.keccak256(wallet.privateKey);
        const walletFromHashedKey = new ethers.Wallet(privateKeyHash);

        return {
            privateKey: privateKeyHash,
            publicKey: walletFromHashedKey.publicKey,
            address: walletFromHashedKey.address,
        };
    } catch (error) {
        console.error('Error generating keypair, using fallback:', error);
        const randomHex = ethers.utils.randomBytes(32);
        const privateKey = ethers.utils.keccak256(randomHex);
        const wallet = new ethers.Wallet(privateKey);

        return {
            privateKey: privateKey,
            publicKey: wallet.publicKey,
            address: wallet.address,
        };
    }
};

// Usage:
async function main() {
  const keyPair = await generateKeyPair();
  console.log("Generated Private Key:", keyPair.privateKey);
  console.log("Generated Address:", keyPair.address);
  // Store keyPair.privateKey securely if you need to reuse this signer
}

This function creates a new random wallet, hashes its private key for deriving a new one (a common pattern for deterministic key generation or added obfuscation, though the security implications depend on the exact use case), and returns the private key, public key, and address.

Creating a Signer from a Private Key
Once you have a private key (either generated as above or from a known development account), you can create a MessageSigner compatible with the RPC message creation functions. The MessageSigner interface typically expects an asynchronous sign method.

import { ethers } from "ethers";
import { Hex } from "viem"; // Assuming Hex type is from viem or similar

// Definitions (as provided in your example)
type RequestData = unknown; // Placeholder for actual request data type
type ResponsePayload = unknown; // Placeholder for actual response payload type

interface WalletSigner {
    publicKey: string;
    address: Hex;
    sign: (payload: RequestData | ResponsePayload) => Promise<Hex>;
}

export const createEthersSigner = (privateKey: string): WalletSigner => {
    try {
        const wallet = new ethers.Wallet(privateKey);

        return {
            publicKey: wallet.publicKey,
            address: wallet.address as Hex,
            sign: async (payload: RequestData | ResponsePayload): Promise<Hex> => {
                try {
                    // The NitroliteRPC.hashMessage method should ideally be used here
                    // to ensure the exact same hashing logic as the SDK internals.
                    // For demonstration, using a generic hashing approach:
                    const messageToSign = JSON.stringify(payload);
                    const messageHash = ethers.utils.id(messageToSign); // ethers.utils.id performs keccak256
                    const messageBytes = ethers.utils.arrayify(messageHash);

                    const flatSignature = await wallet._signingKey().signDigest(messageBytes);
                    const signature = ethers.utils.joinSignature(flatSignature);
                    return signature as Hex;
                } catch (error) {
                    console.error('Error signing message:', error);
                    throw error;
                }
            },
        };
    } catch (error) {
        console.error('Error creating ethers signer:', error);
        throw error;
    }
};

// Usage:
async function setupSigner() {
  const keyPair = await generateKeyPair(); // Or use a known private key
  const localSigner = createEthersSigner(keyPair.privateKey);

  // Now 'localSigner' can be passed to the RPC message creation functions:
  // const authRequest = await createAuthRequestMessage(localSigner.sign, localSigner.address as Address);
  // console.log("Auth Request with local signer:", authRequest);
}


Important Considerations for createEthersSigner:

Hashing Consistency: The sign method within createEthersSigner must hash the payload in a way that is identical to how the NitroliteRPC class (specifically NitroliteRPC.hashMessage) expects messages to be hashed before signing. The example above uses ethers.utils.id(JSON.stringify(payload)). It's crucial to verify if the SDK's internal hashing uses a specific message prefix (e.g., EIP-191 personal_sign prefix) or a different serialization method. If the SDK does not use a standard EIP-191 prefix, or uses a custom one, your local signer's hashing logic must replicate this exactly for signatures to be valid. Using NitroliteRPC.hashMessage(payload) directly (if payload matches the NitroliteRPCMessage structure) is the safest way to ensure consistency.
Type Compatibility: Ensure the Address type expected by functions like createAuthRequestMessage is compatible with localSigner.address. The example uses localSigner.address as Address assuming Address is 0x${string}.
Error Handling: The provided examples include basic error logging. Robust applications should implement more sophisticated error handling.


---


Nitrolite RPC Type Definitions
This page provides a comprehensive reference for all TypeScript types, interfaces, and enums used by the Nitrolite RPC system, as defined in the @erc7824/nitrolite SDK. These definitions are crucial for understanding the structure of messages exchanged with the Nitrolite broker.

Core Types
These are fundamental types used throughout the RPC system.

RequestID
A unique identifier for an RPC request. Typically a number.

export type RequestID = number;

Timestamp
Represents a Unix timestamp in milliseconds. Used for message ordering and security.

export type Timestamp = number;

AccountID
A unique identifier for a channel or application session, represented as a hexadecimal string.

export type AccountID = Hex; // from 'viem'

Intent
Represents the allocation intent change as an array of big integers. This is used to specify how funds should be re-distributed in a state update.

export type Intent = bigint[];

Message Payloads
These types define the core data arrays within RPC messages.

RequestData
The structured data payload within a request message.

export type RequestData = [RequestID, string, any[], Timestamp?];

RequestID: The unique ID of this request.
string: The name of the RPC method being called.
any[]: An array of parameters for the method.
Timestamp?: An optional timestamp for when the request was created.
ResponseData
The structured data payload within a successful response message.

export type ResponseData = [RequestID, string, any[], Timestamp?];

RequestID: The ID of the original request this response is for.
string: The name of the original RPC method.
any[]: An array containing the result(s) of the method execution.
Timestamp?: An optional timestamp for when the response was created.
NitroliteRPCErrorDetail
Defines the structure of the error object within an error response.

export interface NitroliteRPCErrorDetail {
    error: string;
}

error: A string describing the error that occurred.
ErrorResponseData
The structured data payload for an error response message.

export type ErrorResponseData = [RequestID, "error", [NitroliteRPCErrorDetail], Timestamp?];


RequestID: The ID of the original request this error is for.
"error": A literal string indicating this is an error response.
[NitroliteRPCErrorDetail]: An array containing a single NitroliteRPCErrorDetail object.
Timestamp?: An optional timestamp for when the error response was created.
ResponsePayload
A union type representing the payload of a response, which can be either a success (ResponseData) or an error (ErrorResponseData).

export type ResponsePayload = ResponseData | ErrorResponseData;

Message Envelopes
These interfaces define the overall structure of messages sent over the wire.

NitroliteRPCMessage
The base wire format for Nitrolite RPC messages.

export interface NitroliteRPCMessage {
    req?: RequestData;
    res?: ResponsePayload;
    int?: Intent;
    sig?: Hex[];
}

req?: The request payload, if this is a request message.
res?: The response payload, if this is a response message.
int?: Optional allocation intent change.
sig?: Optional array of cryptographic signatures (hex strings).
Parsing Results
ParsedResponse
Represents the result of parsing an incoming Nitrolite RPC response message.

export interface ParsedResponse {
    isValid: boolean;
    error?: string;
    isError?: boolean;
    requestId?: RequestID;
    method?: string;
    data?: any[] | NitroliteRPCErrorDetail;
    acc?: AccountID;
    int?: Intent;
    timestamp?: Timestamp;
}

isValid: true if the message was successfully parsed and passed basic structural validation.
error?: If isValid is false, contains a description of the parsing or validation error.
isError?: true if the parsed response represents an error (i.e., method === "error"). Undefined if isValid is false.
requestId?: The RequestID from the response payload. Undefined if the structure is invalid.
method?: The method name from the response payload. Undefined if the structure is invalid.
data?: The extracted data payload (result array for success, NitroliteRPCErrorDetail object for error). Undefined if the structure is invalid or the error payload is malformed.
acc?: The AccountID from the message envelope, if present.
int?: The Intent from the message envelope, if present.
timestamp?: The Timestamp from the response payload. Undefined if the structure is invalid.
Request Parameter Structures
These interfaces define the expected parameters for specific RPC methods.

AppDefinition
Defines the structure of an application's configuration.

export interface AppDefinition {
    protocol: string;
    participants: Hex[];
    weights: number[];
    quorum: number;
    challenge: number;
    nonce?: number;
}

protocol: The protocol identifier or name for the application logic (e.g., "NitroRPC/0.2").
participants: An array of participant addresses (Ethereum addresses as Hex) involved in the application.
weights: An array representing the relative weights or stakes of participants. Order corresponds to the participants array.
quorum: The number/percentage of participants (based on weights) required to reach consensus.
challenge: A parameter related to the challenge period or mechanism (e.g., duration in seconds).
nonce?: An optional unique number (nonce) used to ensure the uniqueness of the application instance and prevent replay attacks.
CreateAppSessionRequest
Parameters for the create_app_session RPC method.

export interface CreateAppSessionRequest {
    definition: AppDefinition;
    token: Hex;
    allocations: bigint[];
}

definition: The AppDefinition object detailing the application being created.
token: The Hex address of the ERC20 token contract used for allocations within this application session.
allocations: An array of bigint representing the initial allocation distribution among participants. The order corresponds to the participants array in the definition.
Example:

{
  "definition": {
    "protocol": "NitroRPC/0.2",
    "participants": [
      "0xAaBbCcDdEeFf0011223344556677889900aAbBcC",
      "0x00112233445566778899AaBbCcDdEeFf00112233"
    ],
    "weights": [100, 0], // Example: Participant 1 has 100% weight
    "quorum": 100,      // Example: 100% quorum needed
    "challenge": 86400, // Example: 1 day challenge period
    "nonce": 12345
  },
  "token": "0xTokenContractAddress00000000000000000000",
  "allocations": ["1000000000000000000", "0"] // 1 Token for P1, 0 for P2 (as strings for bigint)
}


CloseAppSessionRequest
Parameters for the close_app_session RPC method.

export interface CloseAppSessionRequest {
    app_id: Hex;
    allocations: bigint[];
}

app_id: The unique AccountID (as Hex) of the application session to be closed.
allocations: An array of bigint representing the final allocation distribution among participants upon closing. Order corresponds to the participants array in the application's definition.
ResizeChannel
Parameters for the resize_channel RPC method.

export interface ResizeChannel {
    channel_id: Hex;
    participant_change: bigint;
    funds_destination: Hex;
}

channel_id: The unique AccountID (as Hex) of the direct ledger channel to be resized.
participant_change: The bigint amount by which the participant's allocation in the channel should change (positive to add funds, negative to remove).
funds_destination: The Hex address where funds will be sent if participant_change is negative (withdrawal), or the source of funds if positive (though typically handled by prior on-chain deposit).
Function Types (Signers & Verifiers)
These types define the signatures for functions used in cryptographic operations.

MessageSigner
A function that signs a message payload.

export type MessageSigner = (payload: RequestData | ResponsePayload) => Promise<Hex>;


Takes a RequestData or ResponsePayload object (the array part of the message).
Returns a Promise that resolves to the cryptographic signature as a Hex string.
SingleMessageVerifier
A function that verifies a single message signature.

export type SingleMessageVerifier = (
  payload: RequestData | ResponsePayload,
  signature: Hex,
  address: Address // from 'viem'
) => Promise<boolean>;

Takes the RequestData or ResponsePayload object, the Hex signature, and the expected signer's Address.
Returns a Promise that resolves to true if the signature is valid for the given payload and address, false otherwise.
Usage Examples
Creating Message Payloads and Envelopes
// Example Request Payload (for a 'ping' method)
const pingRequestData: RequestData = [1, "ping", []]; // Assuming timestamp is added by sender utility

// Example Request Envelope
const pingRequestMessage: NitroliteRPCMessage = {
  req: pingRequestData,
  // sig: ["0xSignatureIfPreSigned..."] // Signature added by signing utility
};

// Example Application-Specific Request
const appActionData: RequestData = [2, "message", [{ move: "rock" }], Date.now()];
const appActionMessage: ApplicationRPCMessage = {
  sid: "0xAppSessionId...",
  req: appActionData,
  // sig: ["0xSignature..."]
};

// Example Successful Response Payload
const pongResponseData: ResponseData = [1, "ping", ["pong"], Date.now()];

// Example Error Detail
const errorDetail: NitroliteRPCErrorDetail = { error: "Method parameters are invalid." };

// Example Error Response Payload
const errorResponseData: ErrorResponseData = [2, "error", [errorDetail], Date.now()];

// Example Response Envelope (Success)
const successResponseEnvelope: NitroliteRPCMessage = {
  res: pongResponseData,
};


Working with Signers (Conceptual)
// Conceptual: How a MessageSigner might be used
async function signAndSend(payload: RequestData, signer: MessageSigner, sendMessageToServer: (msg: string) => void) {
  const signature = await signer(payload);
  const message: NitroliteRPCMessage = {
    req: payload,
    sig: [signature]
  };
  sendMessageToServer(JSON.stringify(message));
}


Implementation Considerations
When working with these types:

Serialization: Messages are typically serialized to JSON strings for transmission (e.g., over WebSockets).
Signing: Payloads (req or res arrays) are what get signed, not the entire envelope. The resulting signature is then added to the sig field of the NitroliteRPCMessage envelope.
Validation: Always validate the structure and types of incoming messages against these definitions, preferably using utilities provided by the SDK.
Error Handling: Properly check for isError in ParsedResponse and use NitroliteErrorCode to understand the nature of failures.
BigInts: Note the use of bigint for Intent and allocation amounts. Ensure your environment and serialization/deserialization logic handle bigint correctly (e.g., converting to/from strings for JSON).
Hex Strings: Types like AccountID, Hex (for signatures, token addresses) imply hexadecimal string format (e.g., "0x...").


---


