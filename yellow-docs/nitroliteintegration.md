# Nitrolite Integration Guide

This guide provides a step-by-step approach to integrating the Nitrolite state channel framework into your project. It covers SDK setup, contract deployment (with sources if needed), wallet and chain configuration, and example code.

---

## 1. Overview

**Nitrolite** is a state channel framework for Ethereum and EVM-compatible chains. It enables instant, gas-free off-chain transactions with secure on-chain settlement and dispute resolution.

**Core Components:**
- Smart contracts for custody, adjudication, and channel management.
- TypeScript SDK for frontend/backend integration.
- Example off-chain flows for payments, games, and other stateful dApps.

---

## 2. Prerequisites

- Node.js and npm/yarn/pnpm installed
- Access to an EVM-compatible blockchain (e.g., Polygon mainnet/testnet, Ethereum Goerli, etc.)
- Wallet (MetaMask, Safe, or similar)
- Basic TypeScript/JavaScript knowledge

---

## 3. Install Nitrolite SDK

```bash
npm install @erc7824/nitrolite ethers
```

---

## 4. Contract Deployment

### If Contracts Are Already Deployed

**Custody Contract Example:**

- **Network:** Polygon Mainnet
- **Custody Contract Address:** `0xCUSTODY_ADDRESS_HERE`
- **Adjudicator Contract Address:** `0xADJUDICATOR_ADDRESS_HERE`
- **Token Address:** (USDC Example) `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174`
- **Chain ID:** `137`

> Replace addresses with actual deployments or use testnet addresses for staging.

### If Contracts Are NOT Deployed

Deploy the following contracts using Hardhat, Foundry, or Remix. (Below are minimal sources for core contracts):

#### Custody.sol

```solidity name=Custody.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Custody {
    struct Channel {
        address[] participants;
        address adjudicator;
        uint64 challenge;
        uint64 nonce;
    }

    mapping(bytes32 => uint256) public balances;

    function deposit(address token, uint256 amount) external {
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        // Update user balance logic here
    }

    // Other channel management functions...
}
```

#### Adjudicator Example (Counter.sol)

```solidity name=Counter.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract Counter {
    struct Data {
        uint256 target;
    }

    function adjudicate(
        address[] calldata participants,
        bytes calldata candidateState
    ) external pure returns (bool) {
        // Validate state transition logic (turn-taking, counter increment, etc.)
        return true;
    }
}
```

**Deployment Steps:**
1. Compile contracts using Hardhat/Foundry.
2. Deploy to your desired network (Polygon, Goerli, etc.).
3. Save the deployed addresses for the SDK config.

---

## 5. SDK Configuration & Usage

### Example: Initialize Nitrolite Client

```typescript
import { NitroliteClient } from '@erc7824/nitrolite';
import { ethers } from 'ethers';

const nitroliteClient = new NitroliteClient({
  publicClient, // Ethers.js provider
  walletClient, // Ethers.js signer or wallet
  addresses: {
    custody: '0xCUSTODY_ADDRESS_HERE',
    adjudicator: '0xADJUDICATOR_ADDRESS_HERE',
    guestAddress: '0xGUEST_ADDRESS_HERE',
    tokenAddress: '0xTOKEN_ADDRESS_HERE'
  },
  chainId: 137, // Polygon mainnet
  challengeDuration: 100n
});
```

### Deposit Funds

```typescript
await nitroliteClient.deposit(1000000n); // deposit 1,000,000 token units
```

### Create a State Channel

```typescript
const { channelId, initialState, txHash } = await nitroliteClient.createChannel({
  initialAllocationAmounts: [700000n, 300000n], // party allocations
  stateData: '0x1234'
});
```

### Update Channel State (Off-chain)

- Participants exchange signed state updates using the SDK.
- Only the final state or disputes are submitted on-chain.

---

## 6. Account Abstraction Integration

Integrate with Safe or similar AA wallets:

```typescript
import { AccountAbstraction } from '@safe-global/account-abstraction-kit-poc';
const aaKit = new AccountAbstraction(safeProvider);

const tx = await nitroliteClient.txPreparer.prepareCreateChannelTransaction({
  initialAllocationAmounts: [700000n, 300000n],
  stateData: '0x1234'
});

const safeTransaction = await aaKit.createTransaction({
  transactions: [{ to: tx.to, data: tx.data, value: tx.value?.toString() || '0' }]
});

const txResponse = await aaKit.executeTransaction(safeTransaction);
```

---

## 7. Chain & Wallet Details

- **Chain**: Polygon Mainnet (Chain ID 137) or any EVM-compatible chain
- **Wallet**: MetaMask, Safe, or any wallet compatible with ethers.js
- **Token**: ERC20 tokens (USDC, DAI, etc.)

---

## 8. Frontend Integration

Nitrolite SDK works with any frontend framework:

- **React**: Use hooks or context to manage state channels and SDK client.
- **Vue/Angular**: Use service modules to interact with Nitrolite SDK.

Example React usage:

```typescript
const client = new NitroliteClient(config);
// Use client in your app to open channels, send off-chain transactions, etc.
```

---

## 9. Documentation & Tutorials

- [Nitrolite Quick Start](https://erc7824.org/quick_start)
- [Full SDK Docs](https://erc7824.org)
- Example integration: `examples/hello-nitrolite` in repo

---

## 10. FAQ

**Q: Can I use Nitrolite on Goerli/Testnet?**
- Yes, deploy contracts to any EVM testnet and update config.

**Q: How do I handle disputes?**
- Use SDK/contract methods to submit the latest signed state to the adjudicator contract.

**Q: Is this framework production ready?**
- Actively maintained, MIT licensed, and supports scalable, high-throughput dApps.

---

## 11. Support

- [GitHub Issues](https://github.com/erc7824/nitrolite/issues)
- [Discussions](https://github.com/erc7824/nitrolite/discussions)
- Discord link in official documentation

---

**Happy building with Nitrolite!**
