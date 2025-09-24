NitroliteClient
The NitroliteClient class is the main entry point for interacting with Nitrolite state channels. It provides a comprehensive set of methods for managing channels, deposits, and funds.

Methods
Complete API reference organized by channel lifecycle

Type Definitions
Detailed type definitions used in the SDK

Abstract Accounts
Using transaction preparation with Account Abstraction

Quick Start
import { NitroliteClient } from '@erc7824/nitrolite';

// Initialize client
const nitroliteClient = new NitroliteClient({
  publicClient,
  walletClient,
  addresses: {
    custody: '0x...',
    adjudicator: '0x...',
    guestAddress: '0x...',
    tokenAddress: '0x...'
  },
  chainId: 137, // Polygon mainnet
  challengeDuration: 100n
});

// 1. Deposit funds
const depositTxHash = await nitroliteClient.deposit(1000000n);

// 2. Create a channel
const { channelId, initialState, txHash } = await nitroliteClient.createChannel({
  initialAllocationAmounts: [700000n, 300000n],
  stateData: '0x1234'
});

// 3. Resize the channel when needed
const resizeTxHash = await nitroliteClient.resizeChannel({
  resizeState: {
    channelId,
    stateData: '0x5678',
    allocations: newAllocations,
    version: 2n,
    intent: StateIntent.RESIZE,
    serverSignature: signature
  },
  proofStates: []
});

// 4. Close the channel
const closeTxHash = await nitroliteClient.closeChannel({
  finalState: {
    channelId,
    stateData: '0x5678',
    allocations: newAllocations,
    version: 5n,
    serverSignature: signature
  }
});

// 5. Withdraw funds
const withdrawTxHash = await nitroliteClient.withdrawal(800000n);


---


Methods
This page provides a complete reference for all methods available in the NitroliteClient class from the @erc7824/nitrolite package.

Channel Lifecycle Methods
These methods are organized according to the typical lifecycle of a state channel.

1. Deposit Methods
The deposit phase includes methods for managing funds in the custody contract and handling token approvals.

deposit
approveTokens
getTokenAllowance
getTokenBalance
2. Channel Creation Methods
createChannel
depositAndCreateChannel
3. Channel Operation Methods
checkpointChannel
challengeChannel
resizeChannel
4. Channel Closing Methods
closeChannel
5. Withdrawal Methods
withdrawal
Account Information Methods
These methods provide information about your account's state:

getAccountChannels
getAccountInfo
Advanced Usage: Transaction Preparation
For Account Abstraction support and transaction preparation methods, see the Abstract Accounts page.

Example: Complete Channel Lifecycle
import { NitroliteClient } from '@erc7824/nitrolite';

// Initialize the client
const client = new NitroliteClient({
  publicClient,
  walletClient,
  addresses: { custody, adjudicator, guestAddress, tokenAddress },
  chainId: 137,
  challengeDuration: 100n
});

// 1. Deposit funds
const depositTxHash = await client.deposit(1000000n);

// 2. Create a channel
const { channelId, initialState } = await client.createChannel({
  initialAllocationAmounts: [700000n, 300000n],
  stateData: '0x1234'
});

// 3. Get account info to verify funds are locked
const accountInfo = await client.getAccountInfo();
console.log(`Locked in channels: ${accountInfo.locked}`);

// 4. Later, resize the channel
const resizeTxHash = await client.resizeChannel({
  resizeState: {
    channelId,
    stateData: '0x5678',
    allocations: newAllocations,
    version: 2n,
    intent: StateIntent.RESIZE,
    serverSignature: signature
  },
  proofStates: []
});

// 5. Close the channel
const closeTxHash = await client.closeChannel({
  finalState: {
    channelId,
    stateData: '0x5678',
    allocations: [
      { destination: userAddress, token: tokenAddress, amount: 800000n },
      { destination: counterpartyAddress, token: tokenAddress, amount: 200000n }
    ],
    version: 5n,
    serverSignature: signature
  }
});

// 6. Withdraw funds
const withdrawTxHash = await client.withdrawal(800000n);

---


Type Definitions
This page documents the core types used throughout the @erc7824/nitrolite SDK. Understanding these types is essential for effectively working with the NitroliteClient.

Core Types
ChannelId
type ChannelId = Hex;

A unique identifier for a state channel, represented as a hexadecimal string.

StateHash
type StateHash = Hex;

A hash of a channel state, represented as a hexadecimal string.

Signature
type Signature = Hex;

Represents a cryptographic signature used for signing state channel states as a hexadecimal string.

Allocation
interface Allocation {
  destination: Address;  // Where funds are sent on channel closure
  token: Address;        // ERC-20 token address (zero address for ETH)
  amount: bigint;        // Token amount allocated
}

Represents the allocation of funds to a particular destination.

Channel
interface Channel {
  participants: [Address, Address];  // List of participants [Host, Guest]
  adjudicator: Address;              // Address of the contract that validates states
  challenge: bigint;                 // Duration in seconds for challenge period
  nonce: bigint;                     // Unique per channel with same participants and adjudicator
}


Represents the core configuration of a state channel.

StateIntent
enum StateIntent {
  OPERATE,     // Operate the state application
  INITIALIZE,  // Initial funding state
  RESIZE,      // Resize state
  FINALIZE,    // Final closing state
}

Indicates the intent of a state update. The intent determines how the state is processed by the channel participants and the blockchain.

State
interface State {
  intent: StateIntent;                    // Intent of the state
  version: bigint;                        // Version number, incremented for each update
  data: Hex;                              // Application data encoded as hex
  allocations: [Allocation, Allocation];  // Asset allocation for each participant
  sigs: Signature[];                      // State hash signatures
}


Represents a complete state channel state, including allocations and signatures.

Configuration Types
NitroliteClientConfig
interface NitroliteClientConfig {
  /** The viem PublicClient for reading blockchain data. */
  publicClient: PublicClient;

  /**
   * The viem WalletClient used for:
   * 1. Sending on-chain transactions in direct execution methods (e.g., `client.deposit`).
   * 2. Providing the 'account' context for transaction preparation (`client.txPreparer`).
   * 3. Signing off-chain states *if* `stateWalletClient` is not provided.
   */
  walletClient: WalletClient<Transport, Chain, ParseAccount<Account>>;

  /**
   * Optional: A separate viem WalletClient used *only* for signing off-chain state updates (`signMessage`).
   * Provide this if you want to use a different key (e.g., a "hot" key from localStorage)
   * for state signing than the one used for on-chain transactions.
   * If omitted, `walletClient` will be used for state signing.
   */
  stateWalletClient?: WalletClient<Transport, Chain, ParseAccount<Account>>;

  /** Contract addresses required by the SDK. */
  addresses: ContractAddresses;

  /** Chain ID for the channel */
  chainId: number;

  /** Optional: Default challenge duration (in seconds) for new channels. Defaults to 0 if omitted. */
  challengeDuration?: bigint;
}


Configuration for initializing the NitroliteClient.

ContractAddresses
interface ContractAddresses {
  custody: Address;      // Custody contract address
  adjudicator: Address;  // Adjudicator contract address
  guestAddress: Address; // Guest participant address
  tokenAddress: Address; // Token address (zero address for ETH)
}

Addresses of contracts used by the Nitrolite SDK.

Channel Lifecycle Parameter Types
1. Deposit Phase
Deposit operations primarily use simple bigint parameters for amounts.

2. Channel Creation
interface CreateChannelParams {
  initialAllocationAmounts: [bigint, bigint];  // Initial allocation for [host, guest]
  stateData?: Hex;                            // Application-specific data
}


Parameters for creating a new channel.

3. Channel Operations
interface CheckpointChannelParams {
  channelId: ChannelId;        // Channel ID to checkpoint
  candidateState: State;       // State to checkpoint
  proofStates?: State[];       // Optional proof states
}

interface ChallengeChannelParams {
  channelId: ChannelId;        // Channel ID to challenge
  candidateState: State;       // State to submit as a challenge
  proofStates?: State[];       // Optional proof states
}

interface ResizeChannelParams {
  resizeState: {
    channelId: ChannelId;
    stateData: Hex;
    allocations: [Allocation, Allocation];
    version: bigint;
    intent: StateIntent;
    serverSignature: Signature;
  };
  proofStates: State[];
}

Parameters for channel operations.

4. Channel Closing
interface CloseChannelParams {
  stateData?: Hex;  // Optional application data for the final state
  finalState: {
    channelId: ChannelId;                   // Channel ID to close
    stateData: Hex;                         // Application-specific data
    allocations: [Allocation, Allocation];  // Final allocations
    version: bigint;                        // State version
    serverSignature: Signature;             // Server's signature on the state
  };
}

Parameters for collaboratively closing a channel.

Return Types
AccountInfo
interface AccountInfo {
  available: bigint;     // Available funds in the custody contract
  channelCount: bigint;  // Number of channels
}

Information about an account's funds in the custody contract.

PreparedTransaction
type PreparedTransaction = {
  to: Address;        // Target contract address
  data?: Hex;         // Contract call data
  value?: bigint;     // ETH value to send
};

Represents the data needed to construct a transaction, used by the transaction preparer for Account Abstraction.

Type Usage By Channel Lifecycle Phase
1. Deposit Phase
// Deposit
await client.deposit(amount: bigint): Promise<Hash>

// Check token details
const balance: bigint = await client.getTokenBalance()
const allowance: bigint = await client.getTokenAllowance()

2. Channel Creation Phase
// Create channel
const result: {
  channelId: ChannelId;
  initialState: State;
  txHash: Hash
} = await client.createChannel({
  initialAllocationAmounts: [bigint, bigint],
  stateData: Hex
})

3. Channel Operation Phase
// Resize
await client.resizeChannel({
  resizeState: {
    channelId: ChannelId,
    stateData: Hex,
    allocations: [Allocation, Allocation],
    version: bigint,
    intent: StateIntent,
    serverSignature: Signature
  },
  proofStates: State[]
}): Promise<Hash>

// Resize is structured as:
const resizeParams: ResizeChannelParams = {
  resizeState: {
    channelId,
    stateData: '0x1234',
    allocations: [
      { destination: addr1, token: tokenAddr, amount: 600000n },
      { destination: addr2, token: tokenAddr, amount: 400000n }
    ],
    version: 2n, // Incremented from previous
    intent: StateIntent.RESIZE,
    serverSignature: signature
  },
  proofStates: []
}

4. Channel Closing Phase
// Close
await client.closeChannel({
  finalState: {
    channelId: ChannelId,
    stateData: Hex,
    allocations: [Allocation, Allocation],
    version: bigint,
    serverSignature: Signature
  }
}): Promise<Hash>

5. Withdrawal Phase
// Withdraw
await client.withdrawal(amount: bigint): Promise<Hash>

State Intent Lifecycle
The StateIntent enum value determines how a state is interpreted:

StateIntent.INITIALIZE: Used when creating a channel, defines the initial funding allocations
StateIntent.OPERATE: Used during normal operations, for application-specific state updates
StateIntent.RESIZE: Used when changing allocation amounts, e.g., adding funds to a channel
StateIntent.FINALIZE: Used when closing a channel, defines the final allocations
Example of state progression:

// 1. Initial state (on channel creation)
const initialState = {
  intent: StateIntent.INITIALIZE,
  version: 0n,
  data: '0x1234',
  allocations: [
    { destination: userAddr, token: tokenAddr, amount: 700000n },
    { destination: guestAddr, token: tokenAddr, amount: 300000n }
  ],
  sigs: [userSig, guestSig]
};

// 2. Operation state (during application usage)
const operationalState = {
  intent: StateIntent.OPERATE,
  version: 1n,  // Incremented
  data: '0x5678',  // Application data changed
  allocations: [
    { destination: userAddr, token: tokenAddr, amount: 650000n },  // Balance changed
    { destination: guestAddr, token: tokenAddr, amount: 350000n }  // Balance changed
  ],
  sigs: [userSig, guestSig]
};

// 3. Resize state (adding funds)
const resizeState = {
  intent: StateIntent.RESIZE,
  version: 2n,
  data: '0x5678',
  allocations: [
    { destination: userAddr, token: tokenAddr, amount: 950000n },  // Added funds
    { destination: guestAddr, token: tokenAddr, amount: 450000n }  // Added funds
  ],
  sigs: [userSig, guestSig]
};

// 4. Final state (closing channel)
const finalState = {
  intent: StateIntent.FINALIZE,
  version: 3n,
  data: '0x9ABC',
  allocations: [
    { destination: userAddr, token: tokenAddr, amount: 930000n },
    { destination: guestAddr, token: tokenAddr, amount: 470000n }
  ],
  sigs: [userSig, guestSig]
};

---


Using with Abstract Accounts
The NitroliteClient provides special support for ERC-4337 Account Abstraction through the txPreparer object. This allows dApps using smart contract wallets to prepare transactions without executing them, enabling batching and other advanced patterns.

Transaction Preparer Overview
The txPreparer is a property of the NitroliteClient that provides methods for preparing transaction data without sending it to the blockchain. Each method returns one or more PreparedTransaction objects that can be used with Account Abstraction providers.

import { NitroliteClient } from '@erc7824/nitrolite';

const client = new NitroliteClient({/* config */});

// Instead of: await client.deposit(amount)
const txs = await client.txPreparer.prepareDepositTransactions(amount);

Transaction Preparation Methods
These methods allow you to prepare transactions for the entire channel lifecycle without executing them.

1. Deposit Methods
prepareDepositTransactions
prepareApproveTokensTransaction
2. Channel Creation Methods
prepareCreateChannelTransaction
prepareDepositAndCreateChannelTransactions
3. Channel Operation Methods
prepareCheckpointChannelTransaction
prepareChallengeChannelTransaction
prepareResizeChannelTransaction
4. Channel Closing Methods
prepareCloseChannelTransaction
5. Withdrawal Methods
prepareWithdrawalTransaction
Understanding PreparedTransaction
The PreparedTransaction type is the core data structure returned by all transaction preparation methods. It contains all the information needed to construct a transaction or UserOperation:

type PreparedTransaction = {
  // Target contract address
  to: Address;

  // Contract call data
  data?: Hex;

  // ETH value to send (0n for token operations)
  value?: bigint;
};

Each PreparedTransaction represents a single contract call that can be:

Executed directly - If you're using a standard EOA wallet
Bundled into a UserOperation - For account abstraction providers
Batched with other transactions - For advanced use cases
Integration Examples
The Nitrolite transaction preparer can be integrated with any Account Abstraction provider. Here are examples with popular AA SDKs:

With Safe Account Abstraction SDK
import { NitroliteClient } from '@erc7824/nitrolite';
import { AccountAbstraction } from '@safe-global/account-abstraction-kit-poc';

// Initialize clients
const client = new NitroliteClient({/* config */});
const aaKit = new AccountAbstraction(safeProvider);

// Prepare transaction
const tx = await client.txPreparer.prepareCreateChannelTransaction({
  initialAllocationAmounts: [700000n, 300000n],
  stateData: '0x1234'
});

// Send through AA provider
const safeTransaction = await aaKit.createTransaction({
  transactions: [{
    to: tx.to,
    data: tx.data,
    value: tx.value?.toString() || '0'
  }]
});

const txResponse = await aaKit.executeTransaction(safeTransaction);

With Biconomy SDK
import { NitroliteClient } from '@erc7824/nitrolite';
import { BiconomySmartAccountV2 } from "@biconomy/account";

// Initialize clients
const client = new NitroliteClient({/* config */});
const smartAccount = await BiconomySmartAccountV2.create({/* config */});

// Prepare transaction
const txs = await client.txPreparer.prepareDepositAndCreateChannelTransactions(
  1000000n,
  {
    initialAllocationAmounts: [700000n, 300000n],
    stateData: '0x1234'
  }
);

// Build user operation
const userOp = await smartAccount.buildUserOp(
  txs.map(tx => ({
    to: tx.to,
    data: tx.data,
    value: tx.value || 0n
  }))
);

// Send user operation
const userOpResponse = await smartAccount.sendUserOp(userOp);
await userOpResponse.wait();

Advanced Use Cases
The transaction preparer is especially powerful when combined with advanced Account Abstraction features.

Batching Multiple Operations
One of the main advantages of Account Abstraction is the ability to batch multiple operations into a single transaction:

// Collect prepared transactions from different operations
const preparedTxs = [];

// 1. Add token approval if needed
const allowance = await client.getTokenAllowance();
if (allowance < totalNeeded) {
  const approveTx = await client.txPreparer.prepareApproveTokensTransaction(totalNeeded);
  preparedTxs.push(approveTx);
}

// 2. Add deposit
const depositTx = await client.txPreparer.prepareDepositTransactions(amount);
preparedTxs.push(...depositTx);

// 3. Add channel creation
const createChannelTx = await client.txPreparer.prepareCreateChannelTransaction(params);
preparedTxs.push(createChannelTx);

// 4. Execute all as a batch with your AA provider
await aaProvider.sendUserOperation({
  userOperations: preparedTxs.map(tx => ({
    target: tx.to,
    data: tx.data,
    value: tx.value || 0n
  }))
});


Gas Sponsoring
Account Abstraction enables gas sponsorship, where someone else pays for the transaction gas:

// Prepare transaction
const tx = await client.txPreparer.prepareCreateChannelTransaction(params);

// Use a sponsored transaction
await paymasterProvider.sponsorTransaction({
  target: tx.to,
  data: tx.data,
  value: tx.value || 0n,
  user: userAddress
});

Session Keys
Some AA wallets support session keys, which are temporary keys with limited permissions:

// Create a session key with permissions only for specific operations
const sessionKeyData = await aaWallet.createSessionKey({
  permissions: [
    {
      target: client.addresses.custody,
      // Only allow specific functions
      functionSelector: [
        "0xdeposit(...)",
        "0xwithdraw(...)"
      ]
    }
  ],
  expirationTime: Date.now() + 3600 * 1000 // 1 hour
});

// Use the session key to prepare and send transactions
const tx = await client.txPreparer.prepareDepositTransactions(amount);
await aaWallet.executeWithSessionKey(sessionKeyData, {
  target: tx.to,
  data: tx.data,
  value: tx.value || 0n
});

Best Practices
Batch Related Operations
Use prepareDepositAndCreateChannelTransactions to batch deposit and channel creation into a single user operation.

Handle Approvals
For ERC20 tokens, prepareDepositTransactions will include an approval transaction if needed. Always process all returned transactions.

State Signing
Even when using Account Abstraction, state signatures are handled separately using the stateWalletClient (or walletClient if not specified).

Error Handling
The preparation methods throw the same errors as their execution counterparts, so use the same error handling patterns.

Check Token Allowances
Before preparing token operations, you can check if approval is needed:

const allowance = await client.getTokenAllowance();
if (allowance < amount) 

Gas Estimation
When using Account Abstraction, gas estimation is typically handled by the AA provider, but you can request estimates if needed.

Limitations
Important
The transaction preparer doesn't handle sequencing or nonce management - that's the responsibility of your AA provider.
Some operations (like checkpointing) require signatures from all participants, which must be collected separately from the transaction preparation.


---


NitroliteService
The NitroliteService class is the core service that directly interacts with the Nitrolite Custody smart contract. It handles channel management, deposits, withdrawals, and all other channel-specific operations following the channel lifecycle.

Initialization
import { NitroliteService } from '@erc7824/nitrolite';

const nitroliteService = new NitroliteService(
  publicClient,  // viem PublicClient
  addresses,     // ContractAddresses
  walletClient,  // viem WalletClient
  account        // Account address
);

Channel Lifecycle Methods
1. Deposit Operations
Method	Description	Parameters	Return Type
deposit	Deposits tokens/ETH into the custody contract.	tokenAddress: Address, amount: bigint	Promise<Hash>
withdraw	Withdraws tokens from the custody contract.	tokenAddress: Address, amount: bigint	Promise<Hash>
Example:

// Deposit ETH or token
const txHash = await nitroliteService.deposit(tokenAddress, amount);

// Withdraw ETH or token
const txHash = await nitroliteService.withdraw(tokenAddress, amount);

2. Channel Creation
Method	Description	Parameters	Return Type
createChannel	Creates a new channel with the given parameters.	channel: Channel, initialState: State	Promise<Hash>
Example:

// Create a channel
const txHash = await nitroliteService.createChannel(channel, initialState);

Where:

channel defines the participants, adjudicator, challenge period, and nonce
initialState contains the initial allocation of funds and state data
3. Channel Operations
Method	Description	Parameters	Return Type
checkpoint	Checkpoints a state on-chain.	channelId: ChannelId, candidateState: State, proofStates?: State[]	Promise<Hash>
challenge	Challenges a channel with a candidate state.	channelId: ChannelId, candidateState: State, proofStates?: State[]	Promise<Hash>
resize	Resizes a channel with a candidate state.	channelId: ChannelId, candidateState: State, proofStates?: State[]	Promise<Hash>
Example:

// Checkpoint a channel state
const txHash = await nitroliteService.checkpoint(channelId, candidateState);

// Challenge a channel
const txHash = await nitroliteService.challenge(channelId, candidateState);

// Resize a channel
const txHash = await nitroliteService.resize(channelId, candidateState);

4. Channel Closing
Method	Description	Parameters	Return Type
close	Closes a channel using a final state.	channelId: ChannelId, finalState: State	Promise<Hash>
Example:

// Close a channel
const txHash = await nitroliteService.close(channelId, finalState);

5. Account Information
Method	Description	Parameters	Return Type
getAccountChannels	Gets channel IDs for an account.	accountAddress: Address	Promise<ChannelId[]>
getAccountInfo	Gets account info for a token.	accountAddress: Address, tokenAddress: Address	Promise<AccountInfo>
Example:

// Get all channels for an account
const channels = await nitroliteService.getAccountChannels(accountAddress);

// Get detailed account info
const info = await nitroliteService.getAccountInfo(accountAddress, tokenAddress);
console.log(`Available: ${info.available}, Locked: ${info.locked}`);

Transaction Preparation Methods
For Account Abstraction support, NitroliteService provides transaction preparation methods that return transaction data without executing it:

Method	Description	Parameters	Return Type
prepareDeposit	Prepares deposit transaction.	tokenAddress: Address, amount: bigint	Promise<PreparedTransaction>
prepareCreateChannel	Prepares channel creation transaction.	channel: Channel, initialState: State	Promise<PreparedTransaction>
prepareCheckpoint	Prepares checkpoint transaction.	channelId: ChannelId, candidateState: State, proofStates?: State[]	Promise<PreparedTransaction>
prepareChallenge	Prepares challenge transaction.	channelId: ChannelId, candidateState: State, proofStates?: State[]	Promise<PreparedTransaction>
prepareResize	Prepares resize transaction.	channelId: ChannelId, candidateState: State, proofStates?: State[]	Promise<PreparedTransaction>
prepareClose	Prepares close transaction.	channelId: ChannelId, finalState: State	Promise<PreparedTransaction>
prepareWithdraw	Prepares withdraw transaction.	tokenAddress: Address, amount: bigint	Promise<PreparedTransaction>
Example:

// Prepare deposit transaction
const tx = await nitroliteService.prepareDeposit(tokenAddress, amount);

// Use with your Account Abstraction provider
const userOp = await aaProvider.buildUserOperation({
  target: tx.to,
  data: tx.data,
  value: tx.value || 0n
});

Implementation Details
The NitroliteService connects to the Custody contract using:

A viem PublicClient for read operations
A viem WalletClient for write operations and signing
The contract address specified in the configuration
The service handles:

Contract interaction
Parameter validation
Error handling
Transaction preparation
Error Handling
The NitroliteService throws specific error types:

ContractCallError: When calls to the contract fail
InvalidParameterError: When parameters are invalid
MissingParameterError: When required parameters are missing
WalletClientRequiredError: When wallet client is needed but not provided
AccountRequiredError: When account is needed but not provided
Example:

try {
  await nitroliteService.deposit(tokenAddress, amount);
} catch (error) {
  if (error instanceof ContractCallError) {
    console.error(`Contract call failed: ${error.message}`);
    console.error(`Suggestion: ${error.suggestion}`);
  }
}

Advanced Usage
Custom Contract Interaction
For advanced use cases, you might need to interact directly with the contract:

// Get the custody contract address
const custodyAddress = nitroliteService.custodyAddress;

// Use with your own custom contract interaction
const customContract = getContract({
  address: custodyAddress,
  abi: custodyAbi,
  // Additional configuration...
});

Multiple Channel Management
For applications managing multiple channels:

// Get all channels for the account
const channels = await nitroliteService.getAccountChannels(accountAddress);

// Process each channel
for (const channelId of channels) {
  // Get channel info from contract
  // Process channel state
}

---


Erc20Service
The Erc20Service class provides a convenient interface for interacting with ERC20 tokens. It handles token approvals, allowance checks, and balance inquiries that are essential for deposit and withdrawal operations in the Nitrolite system.

Initialization
import { Erc20Service } from '@erc7824/nitrolite';

const erc20Service = new Erc20Service(
  publicClient,  // viem PublicClient
  walletClient   // viem WalletClient
);

Core Methods
Method	Description	Parameters	Return Type
approve	Approves a spender to use tokens.	tokenAddress: Address, spender: Address, amount: bigint	Promise<Hash>
getTokenAllowance	Gets token allowance for a spender.	tokenAddress: Address, owner: Address, spender: Address	Promise<bigint>
getTokenBalance	Gets token balance for an account.	tokenAddress: Address, account: Address	Promise<bigint>
Method Details
Approve Tokens
Approves a spender (typically the Custody contract) to transfer tokens on behalf of the owner.

// Approve the custody contract to spend 1000 tokens
const txHash = await erc20Service.approve(
  tokenAddress,  // ERC20 token address
  spenderAddress, // Custody contract address
  1000000000000000000n // Amount to approve (1 token with 18 decimals)
);

Important notes:

For security reasons, always specify the exact amount you want to approve
Consider using the ERC20 token decimals for the amount calculation
The transaction will fail if the owner has insufficient balance
Get Token Allowance
Retrieves the current allowance granted by an owner to a spender.

// Check current allowance
const allowance = await erc20Service.getTokenAllowance(
  tokenAddress,  // ERC20 token address
  ownerAddress,  // Owner's address
  spenderAddress // Spender's address (custody contract)
);

console.log(`Current allowance: ${allowance}`);

// Check if allowance is sufficient
if (allowance < requiredAmount) {
  console.log('Need to approve more tokens');
}

Get Token Balance
Retrieves the token balance for a specific account.

// Check token balance
const balance = await erc20Service.getTokenBalance(
  tokenAddress, // ERC20 token address
  accountAddress // Account to check
);

console.log(`Account balance: ${balance}`);

// Check if balance is sufficient
if (balance < requiredAmount) {
  console.log('Insufficient token balance');
}

Transaction Preparation
For Account Abstraction support, Erc20Service provides a transaction preparation method:

Method	Description	Parameters	Return Type
prepareApprove	Prepares an approval transaction.	tokenAddress: Address, spender: Address, amount: bigint	Promise<PreparedTransaction>
Example:

// Prepare approval transaction
const tx = await erc20Service.prepareApprove(
  tokenAddress,
  spenderAddress,
  amount
);

// Use with your Account Abstraction provider
const userOp = await aaProvider.buildUserOperation({
  target: tx.to,
  data: tx.data,
  value: 0n // ERC20 approvals don't require ETH
});

Implementation Details
The Erc20Service uses the standard ERC20 interface methods:

approve: Allows a spender to withdraw tokens from the owner's account, up to the specified amount
allowance: Returns the remaining tokens that a spender is allowed to withdraw
balanceOf: Returns the token balance of the specified account
Working with Token Decimals
ERC20 tokens typically have decimal places (most commonly 18). When working with token amounts, you should account for these decimals:

import { parseUnits } from 'viem';

// For a token with 18 decimals
const tokenDecimals = 18;

// Convert 1.5 tokens to the smallest unit
const amount = parseUnits('1.5', tokenDecimals);

// Approve the amount
await erc20Service.approve(tokenAddress, spenderAddress, amount);

Error Handling
The Erc20Service throws specific error types:

TokenError: For token-specific errors (insufficient balance, approval failures)
ContractCallError: When calls to the contract fail
WalletClientRequiredError: When wallet client is needed but not provided
Example:

try {
  await erc20Service.approve(tokenAddress, spenderAddress, amount);
} catch (error) {
  if (error instanceof TokenError) {
    console.error(`Token error: ${error.message}`);
    console.error(`Suggestion: ${error.suggestion}`);
    
    // Check for specific token error conditions
    if (error.details?.errorName === 'InsufficientBalance') {
      console.log(`Available balance: ${error.details.available}`);
    }
  }
}

Common Patterns
Checking and Approving Tokens
A common pattern is to check if the current allowance is sufficient before approving more tokens:

// Get current allowance
const allowance = await erc20Service.getTokenAllowance(
  tokenAddress,
  ownerAddress,
  spenderAddress
);

// If allowance is insufficient, approve more tokens
if (allowance < requiredAmount) {
  await erc20Service.approve(tokenAddress, spenderAddress, requiredAmount);
}

// Now proceed with the operation that requires the approval
// (e.g., deposit into custody contract)

Handling Multiple Tokens
If your application works with multiple tokens, you can reuse the same Erc20Service instance:

// Same service instance for different tokens
const erc20Service = new Erc20Service(publicClient, walletClient);

// Work with token A
const balanceA = await erc20Service.getTokenBalance(tokenAddressA, accountAddress);

// Work with token B
const balanceB = await erc20Service.getTokenBalance(tokenAddressB, accountAddress);

Integration with NitroliteClient
When using the NitroliteClient, you typically don't need to interact with Erc20Service directly, as the client handles these operations for you:

// NitroliteClient handles token approvals automatically during deposit
await nitroliteClient.deposit(amount);

// For explicit approval without deposit
await nitroliteClient.approveTokens(amount);

// Get token balance through the client
const balance = await nitroliteClient.getTokenBalance();

However, for advanced use cases or custom token interaction, direct access to Erc20Service can be useful



---

Supported Signature Formats
The nitrolite smart contract supports multiple signature formats over a State to accommodate various use cases and compatibility with different wallets and applications.

The message being signed is a channelId and State, formatted in a specific way. The most common is a packedState, which is calculated as follows:

abi.encode(channelId, state.intent, state.version, state.data, state.allocations)

EOA signatures
Externally Owned Accounts (EOAs) can sign messages with their private key using the ECDSA.

Based on how the message is handled before signing, the following formats are supported:

Raw ECDSA Signature
The message is a packedState, that is hashed with keccak256 before signing. The signature is a 65-byte ECDSA signature.

EIP-191 Signature
You can read more about EIP-191 in the EIP-191 specification.

The message is a packedState prefixed with "\x19Ethereum Signed Message:\n" + len(packedState) and hashed with keccak256 before signing. The signature is a 65-byte ECDSA signature.

EIP-712 Signature
You can read more about EIP-712 in the EIP-712 specification.

The message is an AllowStateHash typed data, calculated as follows:

abi.encode(
    typeHash,
    channelId,
    state.intent,
    state.version,
    keccak256(state.data),
    keccak256(abi.encode(state.allocations))
);

Where typeHash is AllowStateHash(bytes32 channelId,uint8 intent,uint256 version,bytes data,Allocation[] allocations)Allocation(address destination,address token,uint256 amount).

The message is then hashed with keccak256, appended to "\x19\x01" || domainSeparator and signed. The signature is a 65-byte ECDSA signature.

|| is a concatenation operator, and domainSeparator is calculated as follows:

keccak256(
  abi.encode(
        EIP712_TYPE_HASH,
        keccak256(name),
        keccak256(version),
        chainId,
        verifyingContract
    )
);

EIP712_TYPE_HASH is keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)").

Additionally, name, version are the name and version of the Custody contract, chainId is the chain ID of the network, and verifyingContract is the address of the contract.

Smart Contract Signatures
Smart Contracts that support EIP-1271 or EIP-6492 can sign messages using their own logic. When checking such signatures, the nitrolite smart contract will pass the keccak256 hash of the packedState as a message hash for verification.

See the aforementioned EIP standards for details on how these signatures are structured and verified. If you want to add support for such signatures in your client, you probably need to look at how signature verification logic is implemented in the Smart Contract (Smart Wallet, etc) that will use them.

Challenge Signatures
The aforementioned signature formats are used to sign States, however to submit a challenge, the user must provide a challengerSignature, which proves that the user has the right to challenge a Channel.

Depending on a signature format, the challengerSignature is calculated differently from the common State signature:

Raw ECDSA, EIP-191, EIP-1271 and EIP-6492: The message (packedState) is suffixed with a challenge string (abi.encodePacked(packedState, "challenge")).
EIP-712: The typeHash name is AllowChallengeStateHash, while type format remains the same.



