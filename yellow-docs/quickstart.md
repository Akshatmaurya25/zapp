Quick Start
Nitrolite is our official SDK for creating high-performance decentralized applications. It provides a comprehensive set of functions and types to establish WebSocket connections with ClearNode and manage application sessions.

Prerequisites
Before you begin working with Nitrolite, ensure that you have:

Node.js: Version 16 or later
Package Manager: npm, yarn, or pnpm
Development Environment:
For frontend: React, Vue, or similar framework
For backend: Node.js environment
Channel Setup: Create a channel from your account at apps.yellow.com
Installation
You can install Nitrolite using your preferred package manager:

npm
yarn
pnpm
npm install @erc7824/nitrolite

ClearNode WebSocket
ClearNode WebSocket URL: wss://clearnet.yellow.com/ws

Build with AI
We have generated a llms-full.txt file that converts all our documentation into a single markdown document following the https://llmstxt.org/ standard.

Complete Workflow
Initialize Channel

Connect to ClearNode

Create Application Session

Perform Operations

Close Session

Next steps
Building applications with Nitrolite involves these key steps:

Channel Creation: Create a channel from your account at apps.yellow.com
ClearNode Connection: Establish WebSocket connection for off-chain messaging
Application Sessions: Create sessions to run specific applications
Session Closure: Properly close application sessions when finished
We recommend working through these guides in sequence to understand the complete application workflow. Each guide builds on concepts from previous sections.

Start with the Channel Creation guide to begin your journey with Nitrolite applications.

---

Create a Channel
Before you can start building with Nitrolite, you need to create a channel from your account. This is done through apps.yellow.com, similar to how you would set up an app in other development platforms.

Getting Started
To get started, visit apps.yellow.com and create an account. You can use the platform to manage your apps, configurations, channels, and more.

Creating Your First Channel
Sign up or log in to apps.yellow.com
Navigate to your channels where you can manage them
Create a new channel by clicking the appropriate button
That's it! After creating your channel, you can start building your app with your business logic. You don't need to worry about channel credentials - the ClearNode will handle channel identification automatically when you connect.

Channel Configuration
When creating a channel, you'll be able to configure:

Channel name and description for easy identification
Application settings specific to your use case
Access permissions and participant management
Integration settings for your development environment
Next Steps
Once your channel is created at apps.yellow.com, you're ready to:

Start building your App - Connect to ClearNode and begin development
Create application sessions to implement your business logic


---

Connect to the ClearNode
A ClearNode is a specialized service that facilitates off-chain communication, message relay, and state validation in the Nitrolite ecosystem. This guide explains how to establish and manage connections to a ClearNode using the NitroliteRPC protocol.

What is a ClearNode?
A ClearNode is an implementation of a message broker for the Clearnet protocol. It serves as a critical infrastructure component in the Nitrolite ecosystem, providing several important functions in the state channel network:

Multi-Chain Support: Connect to multiple EVM blockchains (Polygon, Celo, Base)
Off-Chain Payments: Efficient payment channels for high-throughput transactions
Virtual Applications: Create multi-participant applications
Quorum-Based Signatures: Support for multi-signature schemes with weight-based quorums
Understanding NitroliteRPC
NitroliteRPC is a utility in our SDK that standardizes message creation for communication with ClearNodes. It's not a full protocol implementation but rather a set of helper functions that ensure your application constructs properly formatted messages for ClearNode interaction.

Key functions of NitroliteRPC include:

Message Construction: Creates properly formatted request messages
Signature Management: Handles the cryptographic signing of messages
Standard Format Enforcement: Ensures all messages follow the required format for ClearNode compatibility
Authentication Flow Helpers: Simplifies the authentication process
Under the hood, NitroliteRPC provides functions that generate message objects with the correct structure, timestamps, and signature formatting so you don't have to build these messages manually when communicating with ClearNodes.

Connecting to a ClearNode
After initializing your client and creating a channel, you need to establish a WebSocket connection to a ClearNode. It's important to understand that the Nitrolite SDK doesn't provide its own transport layer - you'll need to implement the WebSocket connection yourself using your preferred library.

WebSocket Connection
With Reconnection Logic
// Import your preferred WebSocket library
import WebSocket from 'ws'; // Node.js
// or use the browser's built-in WebSocket

// Create a WebSocket connection to the ClearNode
const ws = new WebSocket('wss://clearnode.example.com');

// Set up basic event handlers
ws.onopen = () => {
  console.log('WebSocket connection established');
  // Connection is open, can now proceed with authentication
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received message:', message);
  // Process incoming messages
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = (event) => {
  console.log(`WebSocket closed: ${event.code} ${event.reason}`);
};

Authentication Flow
When connecting to a ClearNode, you need to follow a specific authentication flow using the NitroliteRPC utility to create properly formatted and signed messages:

Initial Connection: The client establishes a WebSocket connection to the ClearNode's URL
Auth Request: On the first connection client sends an auth_request message with its identity information
Challenge: The ClearNode responds with an auth_challenge containing a random nonce
Signature Verification: The client signs the challenge along with session key and allowances using EIP712 signature and sends an auth_verify message
Auth Result: The ClearNode verifies the signature and responds with auth_success or auth_failure
Reconnection: On success ClearNode will return the JWT Token, which can be used for subsequent reconnections without needing to re-authenticate.
This flow ensures that only authorized participants with valid signing keys can connect to the ClearNode and participate in channel operations.

ClearNode
Your Application
ClearNode
Your Application
Client is now authenticated
Connection remains but unauthorized
alt
[Authentication Success]
[Authentication Failure]
WebSocket Connection Request
Connection Established
Create auth_request
Send auth_request
Generate random challenge nonce
Send auth_challenge with nonce
Sign challenge using EIP712
Send auth_verify with signature
Verify signature against address
Send auth_success
Can now send channel operations
Send auth_failure
Authentication Process
Manual Challenge Handling
Reconnect
import {
  createAuthRequestMessage, 
  createAuthVerifyMessage, 
  createEIP712AuthMessageSigner, 
  parseRPCResponse,
  RPCMethod,
} from '@erc7824/nitrolite';
import { ethers } from 'ethers';

// Create and send auth_request
const authRequestMsg = await createAuthRequestMessage({
  wallet: '0xYourWalletAddress',
  participant: '0xYourSignerAddress',
  app_name: 'Your Domain',
  expire: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiration
  scope: 'console',
  application: '0xYourApplicationAddress',
  allowances: [],
});

// After WebSocket connection is established
ws.onopen = async () => {
  console.log('WebSocket connection established');
  
  ws.send(authRequestMsg);
};

// Handle incoming messages
ws.onmessage = async (event) => {
  try {
    const message = parseRPCResponse(event.data);
    
    // Handle auth_challenge response
    switch (message.method) {
      case RPCMethod.AuthChallenge:
        console.log('Received auth challenge');

        // Create EIP-712 message signer function
        const eip712MessageSigner = createEIP712AuthMessageSigner(
          walletClient, // Your wallet client instance
          {  
            // EIP-712 message structure, data should match auth_request
            scope: authRequestMsg.scope,
            application: authRequestMsg.application,
            participant: authRequestMsg.participant,
            expire: authRequestMsg.expire,
            allowances: authRequestMsg.allowances,
          },
          { 
            // Domain for EIP-712 signing
            name: 'Your Domain',
          },
        )
        
        // Create and send auth_verify with signed challenge
        const authVerifyMsg = await createAuthVerifyMessage(
          eip712MessageSigner, // Our custom eip712 signer function
          message,
        );
        
        ws.send(authVerifyMsg);
        break;
      // Handle auth_success or auth_failure
      case RPCMethod.AuthVerify:
        if (!message.params.success) {
          console.log('Authentication failed');
          return;
        }
        console.log('Authentication successful');
        // Now you can start using the channel

        window.localStorage.setItem('clearnode_jwt', message.params.jwtToken); // Store JWT token for future use
        break;
      case RPCMethod.Error: {
        console.error('Authentication failed:', message.params.error);
      }
    }
  } catch (error) {
    console.error('Error handling message:', error);
  }
};


EIP-712 Signature
In the authentication process, the client must sign messages using EIP-712 structured data signatures. This ensures that the messages are tamper-proof and verifiable by the ClearNode.

The format of the EIP-712 message is as follows:

{
  "types": {
    "EIP712Domain": [
      { "name": "name", "type": "string" }
    ],
    "Policy": [
      { "name": "challenge", "type": "string" },
      { "name": "scope", "type": "string" },
      { "name": "wallet", "type": "address" },
      { "name": "application", "type": "address" },
      { "name": "participant", "type": "address" },
      { "name": "expire", "type": "uint256" },
      { "name": "allowances", "type": "Allowances[]" }
    ],
    "Allowance": [
      { "name": "asset", "type": "string" },
      { "name": "amount", "type": "uint256" }
    ]
  },
  // Domain and primary type
  domain: {
    name: 'Your Domain'
  },
  primaryType: 'Policy',
  message: {
    challenge: 'RandomChallengeString',
    scope: 'console',
    wallet: '0xYourWalletAddress',
    application: '0xYourApplicationAddress',
    participant: '0xYourSignerAddress',
    expire: 100500,
    allowances: []
  }
}

Message Signer
In methods that require signing messages, that are not part of the authentication flow, you should use a custom message signer function MessageSigner. This function takes the payload and returns a signed message that can be sent to the ClearNode using ECDSA signature.

There are also, several things to consider: this method SHOULD sign plain JSON payloads and NOT ERC-191 data, because it allows signatures to be compatible with non-EVM chains. Since most of the libraries, like ethers or viem, use EIP-191 by default, you will need to overwrite the default behavior to sign plain JSON payloads. The other thing to consider is that providing an EOA private key directly in the code is not recommended for production applications. Instead, we are recommending to generate session keys -- temporary keys that are used for signing messages during the session. This way, you can avoid exposing your main wallet's private key and reduce the risk of compromising your funds.

The simplest implementation of a message signer function looks like this:

Warning For this example use ethers library version 5.7.2. The ethers library version 6.x has breaking changes that are not allowed in this example.

import { MessageSigner, RequestData, ResponsePayload } from '@erc7824/nitrolite';
import { ethers } from 'ethers';
import { Hex } from 'viem';

const messageSigner = async (payload: RequestData | ResponsePayload): Promise<Hex> => {
    try {
        const wallet = new ethers.Wallet('0xYourPrivateKey');

        const messageBytes = ethers.utils.arrayify(ethers.utils.id(JSON.stringify(payload)));

        const flatSignature = await wallet._signingKey().signDigest(messageBytes);

        const signature = ethers.utils.joinSignature(flatSignature);

        return signature as Hex;
    } catch (error) {
        console.error('Error signing message:', error);
        throw error;
    }
}


Getting Channel Information
After authenticating with a ClearNode, you can request information about your channels. This is useful to verify your connection is working correctly and to retrieve channel data.

import { createGetChannelsMessage, parseRPCResponse, RPCMethod } from '@erc7824/nitrolite';

// Example of using the function after authentication is complete
ws.addEventListener('message', async (event) => {
  const message = parseRPCResponse(event.data);
  
  // Check if this is a successful authentication message
  if (message.method === RPCMethod.AuthVerify && message.params.success) {
    console.log('Successfully authenticated, requesting channel information...');
    
    // Request channel information using the built-in helper function
    const getChannelsMsg = await createGetChannelsMessage(
      messageSigner, // Provide message signer function from previous example
      client.stateWalletClient.account.address
    );
    
    ws.send(getChannelsMsg);
  }
  
  // Handle get_channels response
  if (message.method === RPCMethod.GetChannels) {
    console.log('Received channels information:');
    const channelsList = message.params;
    
    if (channelsList && channelsList.length > 0) {
      channelsList.forEach((channel, index) => {
        console.log(`Channel ${index + 1}:`);
        console.log(`- Channel ID: ${channel.channel_id}`);
        console.log(`- Status: ${channel.status}`);
        console.log(`- Participant: ${channel.participant}`);
        console.log(`- Token: ${channel.token}`);
        console.log(`- Amount: ${channel.amount}`);
        console.log(`- Chain ID: ${channel.chain_id}`);
        console.log(`- Adjudicator: ${channel.adjudicator}`);
        console.log(`- Challenge: ${channel.challenge}`);
        console.log(`- Nonce: ${channel.nonce}`);
        console.log(`- Version: ${channel.version}`);
        console.log(`- Created: ${channel.created_at}`);
        console.log(`- Updated: ${channel.updated_at}`);
      });
    } else {
      console.log('No active channels found');
    }
  }
});


Response Format
The response to a get_channels request includes detailed information about each channel:

{
  "res": [1, "get_channels", [[  // Notice the nested array structure
    {
      "channel_id": "0xfedcba9876543210...",
      "participant": "0x1234567890abcdef...",
      "status": "open", // Can be "open", "closed", "settling", etc.
      "token": "0xeeee567890abcdef...", // ERC20 token address
      "amount": "100000", // Current channel balance
      "chain_id": 137, // Chain ID (e.g., 137 for Polygon)
      "adjudicator": "0xAdjudicatorContractAddress...", // Contract address
      "challenge": 86400, // Challenge period in seconds
      "nonce": 1,
      "version": 2,
      "created_at": "2023-05-01T12:00:00Z",
      "updated_at": "2023-05-01T12:30:00Z"
    }
  ]], 1619123456789],
  "sig": ["0xabcd1234..."]
}

Framework-Specific Integration
Here are examples of integrating ClearNode WebSocket connections with various frameworks. Since the Nitrolite SDK doesn't provide its own transport layer, these examples show how to implement WebSocket connections and the NitroliteRPC message format in different frameworks.

React
Angular
Vue
Node.js
import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { 
  createAuthRequestMessage, 
  createAuthVerifyMessage,
  createGetChannelsMessage,
  createGetLedgerBalancesMessage,
  createGetConfigMessage,
  generateRequestId, 
  getCurrentTimestamp 
} from '@erc7824/nitrolite';

// Custom hook for ClearNode connection
function useClearNodeConnection(clearNodeUrl, stateWallet) {
  const [ws, setWs] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);
  
  // Message signer function
  const messageSigner = useCallback(async (payload) => {
    if (!stateWallet) throw new Error('State wallet not available');
    
    try {
      const message = JSON.stringify(payload);
      const digestHex = ethers.id(message);
      const messageBytes = ethers.getBytes(digestHex);
      const { serialized: signature } = stateWallet.signingKey.sign(messageBytes);
      return signature;
    } catch (error) {
      console.error("Error signing message:", error);
      throw error;
    }
  }, [stateWallet]);
  
  // Create a signed request
  const createSignedRequest = useCallback(async (method, params = []) => {
    if (!stateWallet) throw new Error('State wallet not available');
    
    const requestId = generateRequestId();
    const timestamp = getCurrentTimestamp();
    const requestData = [requestId, method, params, timestamp];
    const request = { req: requestData };
    
    // Sign the request
    const message = JSON.stringify(request);
    const digestHex = ethers.id(message);
    const messageBytes = ethers.getBytes(digestHex);
    const { serialized: signature } = stateWallet.signingKey.sign(messageBytes);
    request.sig = [signature];
    
    return JSON.stringify(request);
  }, [stateWallet]);
  
  // Send a message to the ClearNode
  const sendMessage = useCallback((message) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      setError('WebSocket not connected');
      return false;
    }
    
    try {
      ws.send(typeof message === 'string' ? message : JSON.stringify(message));
      return true;
    } catch (error) {
      setError(`Error sending message: ${error.message}`);
      return false;
    }
  }, [ws]);
  
  // Connect to the ClearNode
  const connect = useCallback(() => {
    if (ws) {
      ws.close();
    }
    
    setConnectionStatus('connecting');
    setError(null);
    
    const newWs = new WebSocket(clearNodeUrl);
    
    newWs.onopen = async () => {
      setConnectionStatus('connected');
      
      // Start authentication process
      try {
        const authRequest = await createAuthRequestMessage(
          messageSigner,
          stateWallet.address
        );
        newWs.send(authRequest);
      } catch (err) {
        setError(`Authentication request failed: ${err.message}`);
      }
    };
    
    newWs.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);
        
        // Handle authentication flow
        if (message.res && message.res[1] === 'auth_challenge') {
          try {
            const authVerify = await createAuthVerifyMessage(
              messageSigner,
              message,
              stateWallet.address
            );
            newWs.send(authVerify);
          } catch (err) {
            setError(`Authentication verification failed: ${err.message}`);
          }
        } else if (message.res && message.res[1] === 'auth_success') {
          setIsAuthenticated(true);
        } else if (message.res && message.res[1] === 'auth_failure') {
          setIsAuthenticated(false);
          setError(`Authentication failed: ${message.res[2]}`);
        }
        
        // Additional message handling can be added here
      } catch (err) {
        console.error('Error handling message:', err);
      }
    };
    
    newWs.onerror = (error) => {
      setError(`WebSocket error: ${error.message}`);
      setConnectionStatus('error');
    };
    
    newWs.onclose = () => {
      setConnectionStatus('disconnected');
      setIsAuthenticated(false);
    };
    
    setWs(newWs);
  }, [clearNodeUrl, messageSigner, stateWallet]);
  
  // Disconnect from the ClearNode
  const disconnect = useCallback(() => {
    if (ws) {
      ws.close();
      setWs(null);
    }
  }, [ws]);
  
  // Connect when the component mounts
  useEffect(() => {
    if (clearNodeUrl && stateWallet) {
      connect();
    }
    
    // Clean up on unmount
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [clearNodeUrl, stateWallet, connect]);
  
  // Create helper methods for common operations
  const getChannels = useCallback(async () => {
    // Using the built-in helper function from NitroliteRPC
    const message = await createGetChannelsMessage(
      messageSigner,
      stateWallet.address
    );
    return sendMessage(message);
  }, [messageSigner, sendMessage, stateWallet]);
  
  const getLedgerBalances = useCallback(async (channelId) => {
    // Using the built-in helper function from NitroliteRPC
    const message = await createGetLedgerBalancesMessage(
      messageSigner,
      channelId
    );
    return sendMessage(message);
  }, [messageSigner, sendMessage]);
  
  const getConfig = useCallback(async () => {
    // Using the built-in helper function from NitroliteRPC
    const message = await createGetConfigMessage(
      messageSigner,
      stateWallet.address
    );
    return sendMessage(message);
  }, [messageSigner, sendMessage, stateWallet]);
  
  return {
    connectionStatus,
    isAuthenticated,
    error,
    ws,
    connect,
    disconnect,
    sendMessage,
    getChannels,
    getLedgerBalances,
    getConfig,
    createSignedRequest
  };
}

// Example usage in a component
function ClearNodeComponent() {
  const stateWallet = /* your state wallet initialization */;
  const {
    connectionStatus,
    isAuthenticated,
    error,
    getChannels
  } = useClearNodeConnection('wss://clearnode.example.com', stateWallet);
  
  return (
    <div>
      <p>Status: {connectionStatus}</p>
      <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
      {error && <p className="error">Error: {error}</p>}
      
      <button 
        onClick={getChannels} 
        disabled={!isAuthenticated}
      >
        Get Channels
      </button>
    </div>
  );
}

Security Considerations
When working with ClearNodes and state channels, keep these security best practices in mind:

Secure State Wallet Storage: Properly encrypt and secure the private key for your state wallet
Verify Message Signatures: Always verify that received messages have valid signatures from expected sources
Monitor Connection Status: Implement monitoring to detect unexpected disconnections or authentication failures
Implement Timeout Handling: Add timeouts for operations to prevent hanging on unresponsive connections
Validate Channel States: Verify that channel states are valid before processing or saving them
Use Secure WebSocket Connections: Always use wss:// (WebSocket Secure) for ClearNode connections, never ws://
Implement Rate Limiting: Add protection against excessive message sending to prevent abuse
Troubleshooting Common Issues
Issue	Possible Causes	Solution
Connection timeout	Network latency, ClearNode unavailable	Implement retry logic with exponential backoff
Authentication failure	Invalid state wallet, incorrect signing	Verify your state wallet is properly initialized and signing correctly
Frequent disconnections	Unstable network, server-side issues	Monitor connection events and implement automatic reconnection
Message delivery failures	Connection issues, invalid message format	Add message queuing and confirmation mechanism
Invalid signature errors	EIP-191 prefix issues	Ensure you're signing raw message bytes without the EIP-191 prefix
Next Steps
After successfully connecting to a ClearNode, you can:

View and manage channel assets
Create an application session


---

Channel Asset Management
After connecting to a ClearNode, you'll need to monitor the off-chain balances in your state channels. This guide explains how to retrieve and work with off-chain balance information using the NitroliteRPC protocol.

Understanding Off-Chain Balances
Off-chain balances in Nitrolite represent:

Your current funds in the state channel
Balances that update in real-time as transactions occur
The source of truth for application operations
Assets that are backed by on-chain deposits
Checking Off-Chain Balances
To monitor your channel funds, you need to retrieve the current off-chain balances from the ClearNode.

Understanding the Ledger Balances Request
The get_ledger_balances request is used to retrieve the current off-chain balances for a specific participant from the ClearNode:

Request params: [{ participant: "0xAddress" }] where 0xAddress is the participant's address
Response: Array containing the balances for different assets held by the participant
The response contains a list of assets and their amounts for the specified participant. The balances are represented as strings with decimal precision, making it easier to display them directly without additional conversion.

// Example response format for get_ledger_balances
{
  "res": [1, "get_ledger_balances", [[  // The nested array contains balance data
    {
      "asset": "usdc",  // Asset identifier
      "amount": "100.0"  // Amount as a string with decimal precision
    },
    {
      "asset": "eth",
      "amount": "0.5"
    }
  ]], 1619123456789],  // Timestamp
  "sig": ["0xabcd1234..."]
}

To retrieve these balances, use the get_ledger_balances request with the ClearNode:

Using SDK Helper
Manual Request
import { createGetLedgerBalancesMessage, parseRPCMessage, RPCMethod } from '@erc7824/nitrolite';
import { ethers } from 'ethers';

// Your message signer function (same as in auth flow)
const messageSigner = async (payload) => {
  const message = JSON.stringify(payload);
  const digestHex = ethers.id(message);
  const messageBytes = ethers.getBytes(digestHex);
  const { serialized: signature } = stateWallet.signingKey.sign(messageBytes);
  return signature;
};

// Function to get ledger balances
async function getLedgerBalances(ws, participant) {
  return new Promise((resolve, reject) => {
    // Create a unique handler for this specific request
    const handleMessage = (event) => {
      const message = parseRPCMessage(event.data);
      
      // Check if this is a response to our get_ledger_balances request
      if (message.method === RPCMethod.GetLedgerBalances) {
        // Remove the message handler to avoid memory leaks
        ws.removeEventListener('message', handleMessage);
        
        // Resolve with the balances data
        resolve(message.params);
      }
    };
    
    // Add the message handler
    ws.addEventListener('message', handleMessage);
    
    // Create and send the ledger balances request
    createGetLedgerBalancesMessage(messageSigner, participant)
      .then(message => {
        ws.send(message);
      })
      .catch(error => {
        // Remove the message handler on error
        ws.removeEventListener('message', handleMessage);
        reject(error);
      });
      
    // Set a timeout to prevent hanging indefinitely
    setTimeout(() => {
      ws.removeEventListener('message', handleMessage);
      reject(new Error('Timeout waiting for ledger balances'));
    }, 10000); // 10 second timeout
  });
}

// Usage example
const participantAddress = '0x1234567890abcdef1234567890abcdef12345678';

try {
  const balances = await getLedgerBalances(ws, participantAddress);
  
  console.log('Channel ledger balances:', balances);
  // Example output:
  // [
  //   [
  //     { "asset": "usdc", "amount": "100.0" },
  //     { "asset": "eth", "amount": "0.5" }
  //   ]
  // ]
  
  // Process your balances
  if (balances.length > 0) {
    // Display each asset balance
    balances.forEach(balance => {
      console.log(`${balance.asset.toUpperCase()} balance: ${balance.amount}`);
    });
    
    // Example: find a specific asset
    const usdcBalance = balances.find(b => b.asset.toLowerCase() === 'usdc');
    if (usdcBalance) {
      console.log(`USDC balance: ${usdcBalance.amount}`);
    }
  } else {
    console.log('No balance data available');
  }
} catch (error) {
  console.error('Failed to get ledger balances:', error);
}


Checking Balances for a Participant
To retrieve off-chain balances for a participant, use the createGetLedgerBalancesMessage helper function:

import { createGetLedgerBalancesMessage, parseRPCResponse, RPCMethod } from '@erc7824/nitrolite';
import { ethers } from 'ethers';

// Function to get ledger balances for a participant
async function getLedgerBalances(ws, participant, messageSigner) {
  return new Promise((resolve, reject) => {
    // Message handler for the response
    const handleMessage = (event) => {
      try {
        const message = parseRPCResponse(event.data);
        
        // Check if this is a response to our get_ledger_balances request
        if (message.method === RPCMethod.GetLedgerBalances) {
          // Clean up by removing the event listener
          ws.removeEventListener('message', handleMessage);
          
          // Resolve with the balance data
          resolve(message.params);
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };
    
    // Set up timeout to avoid hanging indefinitely
    const timeoutId = setTimeout(() => {
      ws.removeEventListener('message', handleMessage);
      reject(new Error('Timeout waiting for ledger balances'));
    }, 10000); // 10 second timeout
    
    // Add the message handler
    ws.addEventListener('message', handleMessage);
    
    // Create and send the balance request
    createGetLedgerBalancesMessage(messageSigner, participant)
      .then(message => {
        ws.send(message);
      })
      .catch(error => {
        clearTimeout(timeoutId);
        ws.removeEventListener('message', handleMessage);
        reject(error);
      });
  });
}

// Example usage
const participantAddress = '0x1234567890abcdef1234567890abcdef12345678';

getLedgerBalances(ws, participantAddress, messageSigner)
  .then(balances => {
    console.log('Channel balances:', balances);
    
    // Process and display your balances
    if (balances.length > 0) {
      console.log('My balances:');
      balances.forEach(balance => {
        console.log(`- ${balance.asset.toUpperCase()}: ${balance.amount}`);
      });
    } else {
      console.log('No balance data available');
    }
  })
  .catch(error => {
    console.error('Failed to get ledger balances:', error);
  });


Processing Balance Data
When you receive balance data from the ClearNode, it's helpful to format it for better readability:

// Simple function to format your balance data for display
function formatMyBalances(balances) {
  // Return formatted balance information
  return balances.map(balance => ({
    asset: balance.asset.toUpperCase(),
    amount: balance.amount,
    // You can add additional formatting here if needed
    displayAmount: `${balance.amount} ${balance.asset.toUpperCase()}`
  }));
}

// Example usage
const myFormattedBalances = formatMyBalances(balancesFromClearNode);

if (myFormattedBalances && myFormattedBalances.length > 0) {
  console.log('My balances:');
  myFormattedBalances.forEach(balance => {
    console.log(`- ${balance.displayAmount}`);
  });
} else {
  console.log('No balance data available');
}

Best Practices for Balance Checking
When working with off-chain balances, follow these best practices:

Regular Balance Polling
Set up a regular interval to check balances, especially in active applications:

// Simple balance monitoring function
function startBalanceMonitoring(ws, participantAddress, messageSigner, intervalMs = 30000) {
  // Check immediately on start
  getLedgerBalances(ws, participantAddress, messageSigner)
    .then(displayBalances)
    .catch(err => console.error('Initial balance check failed:', err));
  
  // Set up interval for regular checks
  const intervalId = setInterval(() => {
    getLedgerBalances(ws, participantAddress, messageSigner)
      .then(displayBalances)
      .catch(err => console.error('Balance check failed:', err));
  }, intervalMs); // Check every 30 seconds by default
  
  // Return function to stop monitoring
  return () => clearInterval(intervalId);
}

// Simple display function
function displayBalances(balances) {
  console.log(`Balance update at ${new Date().toLocaleTimeString()}:`);
  
  // Format and display your balances
  if (balances.length > 0) {
    console.log('My balances:');
    balances.forEach(balance => {
      console.log(`- ${balance.asset.toUpperCase()}: ${balance.amount}`);
    });
  } else {
    console.log('No balance data available');
  }
}


Common Errors and Troubleshooting
When retrieving off-chain balances, you might encounter these common issues:

Error Type	Description	Solution
Authentication errors	WebSocket connection loses authentication	Re-authenticate before requesting balances again
Channel not found	The channel ID is invalid or the channel has been closed	Verify the channel ID and check if the channel is still active
Connection issues	WebSocket disconnects during a balance request	Implement reconnection logic with exponential backoff
Timeout	The ClearNode does not respond in a timely manner	Set appropriate timeouts and implement retry logic


---


Create Application Sessions
After connecting to a ClearNode and checking your channel balances, you can create application sessions to interact with specific applications on the state channel network. Application sessions allow you to perform off-chain transactions and define custom behavior for your interactions.

Understanding Application Sessions
Create Application Session

Session Active

Off-Chain Transactions

Close Session

Application sessions in Nitrolite allow you to:

Create isolated environments for specific interactions
Define rules for off-chain transactions
Specify how funds are allocated between participants
Implement custom application logic and state management
An application session serves as a mechanism to track and manage interactions between participants, with the ClearNode acting as a facilitator.

Creating an Application Session
To create an application session, you'll use the createAppSessionMessage helper from NitroliteRPC. Here's how to do it:

React
Angular
Vue.js
Node.js
Server with Multiple Players
import { createAppSessionMessage, parseRPCResponse, MessageSigner, CreateAppSessionRPCParams } from '@erc7824/nitrolite';
import { useCallback } from 'react';
import { Address } from 'viem';

function useCreateApplicationSession() {
  const createApplicationSession = useCallback(
    async (
      signer: MessageSigner,
      sendRequest: (message: string) => Promise<CreateAppSessionRPCParams>,
      participantA: Address,
      participantB: Address,
      amount: string,
    ) => {
      try {
        // Define the application parameters
        const appDefinition = {
          protocol: 'nitroliterpc',
          participants: [participantA, participantB],
          weights: [100, 0],  // Weight distribution for consensus
          quorum: 100,        // Required consensus percentage
          challenge: 0,       // Challenge period
          nonce: Date.now(),  // Unique identifier
        };

        // Define allocations with asset type instead of token address
        const allocations = [
          {
            participant: participantA,
            asset: 'usdc',
            amount: amount,
          },
          {
            participant: participantB,
            asset: 'usdc',
            amount: '0',
          },
        ];

        // Create a signed message using the createAppSessionMessage helper
        const signedMessage = await createAppSessionMessage(
          signer,
          [
            {
              definition: appDefinition,
              allocations: allocations,
            },
          ]
        );

        // Send the signed message to the ClearNode
        const response = await sendRequest(signedMessage);

        // Handle the response
        if (response.app_session_id) {
          // Store the app session ID for future reference
          localStorage.setItem('app_session_id', response.app_session_id);
          return { success: true, app_session_id: response.app_session_id, response };
        } else {
          return { success: true, response };
        }
      } catch (error) {
        console.error('Error creating application session:', error);
        return {
          success: false,
          error: error instanceof Error
            ? error.message
            : 'Unknown error during session creation',
        };
      }
    },
    []
  );

  return { createApplicationSession };
}

// Usage example
function MyComponent() {
  const { createApplicationSession } = useCreateApplicationSession();
  
  const handleCreateSession = async () => {
    // Define your WebSocket send wrapper
    const sendRequest = async (payload: string) => {
      return new Promise((resolve, reject) => {
        // Assuming ws is your WebSocket connection
        const handleMessage = (event) => {
          try {
            const message = parseRPCResponse(event.data);
            if (message.method === RPCMethod.CreateAppSession) {
              ws.removeEventListener('message', handleMessage);
              resolve(message.params);
            }
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        };
        
        ws.addEventListener('message', handleMessage);
        ws.send(payload);
        
        // Set timeout to prevent hanging
        setTimeout(() => {
          ws.removeEventListener('message', handleMessage);
          reject(new Error('App session creation timeout'));
        }, 10000);
      });
    };
    
    const result = await createApplicationSession(
      walletSigner,      // Your signer object
      sendRequest,       // Function to send the request
      '0xYourAddress',   // Your address
      '0xOtherAddress',  // Other participant's address
      '100',             // Amount
    );
    
    if (result.success) {
      console.log(`Application session created with ID: ${result.app_session_id}`);
    } else {
      console.error(`Failed to create application session: ${result.error}`);
    }
  };
  
  return (
    <button onClick={handleCreateSession}>Create Application Session</button>
  );
}


Key Components of an Application Session
When creating an application session, you need to define several key components:

Component	Description	Example
Protocol	Identifier for the application protocol	"nitroliterpc"
Participants	Array of participant addresses	[userAddress, counterpartyAddress]
Weights	Weight distribution for consensus	[100, 0] for user-controlled, [50, 50] for equal
Quorum	Required percentage for consensus	Usually 100 for full consensus
Challenge	Time period for disputing state	0 for no challenge period
Nonce	Unique identifier	Typically Date.now()
Allocations	Array of allocation objects with:	[{ participant: "0xAddress", asset: "usdc", amount: "100" }]
- participant: Address of the participant	
- asset: Asset identifier (e.g., "usdc", "eth")	
- amount: String amount with precision	
Response Components
When a ClearNode responds to your application session creation request, it provides:

Component	Description	Example
app_session_id	Unique identifier for the application session	"0x0ac588b2924edbbbe34bb4c51d089771bd7bd7018136c8c4317624112a8c9f79"
status	Current state of the application session	"open"
Understanding the Response
When you create an application session, the ClearNode responds with information about the created session:

// Example response
{
  "res": [
    2,                // Request ID
    "create_app_session", // Method name
    [
      {
        "app_session_id": "0x0ac588b2924edbbbe34bb4c51d089771bd7bd7018136c8c4317624112a8c9f79", // Session ID
        "status": "open"
      }
    ],
    1631234567890    // Timestamp
  ],
  "sig": ["0xSignature"]
}


The most important part of the response is the app_session_id, which you'll need for all future interactions with this application session.

Application Session Use Cases
Application sessions can be used for various scenarios:

Peer-to-peer payments: Direct token transfers between users
Gaming: Turn-based games with state transitions
Content access: Pay-per-use access to digital content
Service payments: Metered payment for API or service usage
Multi-party applications: Applications involving more than two participants
Best Practices
When working with application sessions, follow these best practices:

Store the app_session_id securely: You'll need it for all session-related operations
Verify session creation: Check for successful creation before proceeding
Handle timeouts: Implement proper timeout handling for session creation
Clean up listeners: Always remove message event listeners to prevent memory leaks
Handle errors gracefully: Provide clear error messages to users
Next Steps
After creating an application session, you can:

Use the session for application-specific transactions
Check your channel balances to monitor funds
Close the application session when you're done
For advanced use cases, see our detailed documentation on application workflows.

---

Close Application Session
Once you've completed your interactions with an application session, it's important to properly close it. This finalizes the fund allocations and ensures that all participants agree on the final state.

Why Properly Closing Sessions Matters
Closing an application session correctly is important because it:

Finalizes fund allocations between participants
Updates on-chain balances (if applicable)
Frees up resources on the ClearNode
Ensures the proper completion of all operations
Prevents potential disputes
Active Session

Define Final Allocations

Sign Close Message

Send to ClearNode

Session Closed

Closing an Application Session
To close an application session, you'll use the createCloseAppSessionMessage helper from NitroliteRPC. Here's how to do it:

React
Angular
Vue.js
Node.js
Server with Multiple Players
import { useCallback } from 'react';
import { createCloseAppSessionMessage, parseRPCResponse, MessageSigner, CloseAppSessionRPCParams } from '@erc7824/nitrolite';

/**
 * Hook for closing an application session
 */
function useCloseApplicationSession() {
  const closeApplicationSession = useCallback(
    async (
      signer: MessageSigner,
      sendRequest: (message: string) => Promise<CloseAppSessionRPCParams>,
      appId: string,
      participantA: Address,
      participantB: Address,
      amount: string
    ) => {
      try {
        if (!appId) {
          throw new Error('Application ID is required to close the session.');
        }
        
        // Create allocations with asset type
        const allocations = [
          {
            participant: participantA,
            asset: 'usdc',
            amount: '0',
          },
          {
            participant: participantB,
            asset: 'usdc',
            amount: amount,
          },
        ];
        
        // Create the close request
        const closeRequest = {
          app_session_id: appId,
          allocations: allocations,
        };
        
        // Create the signed message
        const signedMessage = await createCloseAppSessionMessage(
          signer, 
          [closeRequest]
        );
        
        // Send the request and wait for response
        const response = await sendRequest(signedMessage);
        
        // Check for success
        if (response.app_session_id) {
          // Clean up local storage
          localStorage.removeItem('app_session_id');
          return { 
            success: true, 
            app_id: response.app_session_id,
            status: response.status || "closed", 
            response 
          };
        } else {
          return { success: true, response };
        }
      } catch (error) {
        console.error('Error closing application session:', error);
        return {
          success: false,
          error: error instanceof Error
            ? error.message
            : 'Unknown error during close session',
        };
      }
    },
    []
  );
  
  return { closeApplicationSession };
}

// Usage example
function MyComponent() {
  const { closeApplicationSession } = useCloseApplicationSession();
  
  const handleCloseSession = async () => {
    // Define your WebSocket send wrapper
    const sendRequest = async (payload) => {
      return new Promise((resolve, reject) => {
        // Assuming ws is your WebSocket connection
        const handleMessage = (event) => {
          try {
            const message = parseRPCResponse(event.data);
            if (message.method === RPCMethod.CloseAppSession) {
              ws.removeEventListener('message', handleMessage);
              resolve(message.params);
            }
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        };
        
        ws.addEventListener('message', handleMessage);
        ws.send(payload);
        
        // Set timeout to prevent hanging
        setTimeout(() => {
          ws.removeEventListener('message', handleMessage);
          reject(new Error('Close app session timeout'));
        }, 10000);
      });
    };
    
    // Get the app session ID from where it was stored
    const appId = localStorage.getItem('app_session_id');
    
    // Define participant addresses
    const participantA = '0xYourAddress';
    const participantB = '0xOtherAddress';
    
    // Define amount
    const amount = '1000000'; // Amount to allocate to participantB
    
    const result = await closeApplicationSession(
      walletSigner,      // Your signer object
      sendRequest,       // Function to send the request
      appId,             // Application session ID
      participantA,      // First participant address
      participantB,      // Second participant address
      amount             // Amount to allocate to participant B
    );
    
    if (result.success) {
      console.log('Application session closed successfully');
    } else {
      console.error(`Failed to close application session: ${result.error}`);
    }
  };
  
  return (
    <button onClick={handleCloseSession}>Close Application Session</button>
  );
}


Close Session Flow
The following sequence diagram shows the interaction between your application and the ClearNode when closing a session:

ClearNode
Your Application
ClearNode
Your Application
Send close_app_session request
Return success response
Clean up local storage
Understanding Final Allocations
When closing an application session, you must specify the final allocations of funds between participants:

Final Allocations: An array of allocation objects for each participant
Participant: The address of the participant receiving funds
Asset: The asset type (e.g., "usdc", "eth")
Amount: The amount as a string (e.g., "1000000" or "0.5")
Examples:

// Initial allocations when creating the session:
// [
//   { participant: participantA, asset: "usdc", amount: "1000000" },
//   { participant: participantB, asset: "usdc", amount: "0" }
// ]

// Possible final allocations when closing:
const allocations = [
  { participant: participantA, asset: "usdc", amount: "1000000" },
  { participant: participantB, asset: "usdc", amount: "0" } 
]; // No change - all funds to participant A

// OR
const allocations = [
  { participant: participantA, asset: "usdc", amount: "0" },
  { participant: participantB, asset: "usdc", amount: "1000000" }
]; // All funds to participant B

// OR 
const allocations = [
  { participant: participantA, asset: "usdc", amount: "700000" },
  { participant: participantB, asset: "usdc", amount: "300000" }
]; // Split 70/30

Understanding the Close Session Response
When you close an application session, the ClearNode responds with information about the closed session:

// Example response
{
  "res": [
    3,                  // Request ID
    "close_app_session",  // Method name
    [
      {
        "app_session_id": "0x0ac588b2924edbbbe34bb4c51d089771bd7bd7018136c8c4317624112a8c9f79", // Session ID
        "status": "closed"
      }
    ],
    1631234567890      // Timestamp
  ],
  "sig": ["0xSignature"]
}


Response Components
When closing an application session, the ClearNode responds with:

Component	Description	Example
app_session_id	Identifier of the application session	"0x0ac588b2924edbbbe34bb4c51d089771bd7bd7018136c8c4317624112a8c9f79"
status	Final state of the application session	"closed"
Common Scenarios for Closing Sessions
Here are some common scenarios where you would close an application session:

Scenario	Description	Typical Allocation Pattern
Payment Completed	User completes payment for a service	All funds to the service provider
Game Completed	End of a game with a winner	Winner gets the pot
Partial Service	Service partially delivered	Split based on completion percentage
Cancellation	Service cancelled before completion	Funds returned to original funder
Dispute Resolution	Resolution after a dispute	Split according to dispute resolution
Best Practices
When closing application sessions, follow these best practices:

Verify all transactions are complete before closing
Include appropriate timeouts to prevent hanging operations
Clean up event listeners to prevent memory leaks
Implement retry logic for failure recovery
Store transaction records for audit purposes
Validate final allocations match expected state
Common Errors and Troubleshooting
When closing application sessions, you might encounter these issues:

Error Type	Description	Solution
Authentication errors	WebSocket connection loses authentication	Re-authenticate before closing the session
Session not found	The app_session_id is invalid or the session was already closed	Verify the app_session_id is correct and the session is still active
Allocation mismatch	The total in final allocations doesn't match initial funding	Ensure allocations sum to the correct total amount
Connection issues	WebSocket disconnects during a close request	Implement reconnection logic with exponential backoff
Timeout	The ClearNode does not respond in a timely manner	Set appropriate timeouts and implement retry logic
Next Steps
After closing an application session, you can:

Check your channel balances to verify the finalized allocations
Create a new application session if you need to continue with different parameters