# 🚀 Smart Contract Deployment Guide

This guide will help you deploy the PostRegistry smart contract to Somnia Network and configure your dApp to use blockchain functionality.

## 📋 Prerequisites

1. **Node.js & npm** installed
2. **Hardhat** development environment
3. **Somnia testnet STT tokens** for gas fees
4. **Private key** of deployment wallet

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install @openzeppelin/contracts
```

### 2. Environment Configuration

Create or update your `.env.local` file:

```env
# Deployment Configuration
PRIVATE_KEY=your_private_key_here_without_0x_prefix
NEXT_PUBLIC_POST_REGISTRY_ADDRESS=

# Somnia Network Settings
SOMNIA_TESTNET_RPC=https://dream-rpc.somnia.network/
SOMNIA_MAINNET_RPC=https://api.infra.mainnet.somnia.network/

# Optional: Explorer API Keys
SOMNIA_EXPLORER_API_KEY=your_api_key_here
```

### 3. Get Testnet Tokens

1. Visit the [Somnia Faucet](https://faucet.somnia.network)
2. Connect your wallet
3. Request testnet STT tokens
4. Wait for confirmation

### 4. Verify Network Configuration

Check your current network settings:

```bash
npx hardhat run scripts/deploy-contract.js --network somnia-testnet --dry-run
```

## 🚀 Deployment Process

### Deploy to Somnia Testnet

```bash
# Deploy the contract
npx hardhat run scripts/deploy-contract.js --network somnia-testnet

# Or use the npm script
npm run deploy:testnet
```

### Deploy to Somnia Mainnet (when ready)

```bash
# Deploy to mainnet (use with caution!)
npx hardhat run scripts/deploy-contract.js --network somnia-mainnet

# Or use the npm script
npm run deploy:mainnet
```

## 📝 Post-Deployment Configuration

### 1. Update Environment Variables

After successful deployment, update your `.env.local`:

```env
NEXT_PUBLIC_POST_REGISTRY_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
```

### 2. Verify Deployment

Visit the Somnia Explorer to verify your contract:
- **Testnet**: `https://shannon-explorer.somnia.network/address/{CONTRACT_ADDRESS}`
- **Mainnet**: `https://explorer.somnia.network/address/{CONTRACT_ADDRESS}`

### 3. Test Contract Functionality

Create a test script to verify the contract is working:

```javascript
// test-contract.js
const hre = require("hardhat");

async function testContract() {
  const contractAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
  const PostRegistry = await hre.ethers.getContractFactory("PostRegistry");
  const contract = PostRegistry.attach(contractAddress);

  console.log("Testing contract...");
  const totalPosts = await contract.getTotalPosts();
  console.log("Total posts:", totalPosts.toString());

  const postFee = await contract.postFee();
  console.log("Post fee:", hre.ethers.utils.formatEther(postFee), "STT");
}

testContract().catch(console.error);
```

## 🔧 Contract Management

### Update Post Fee (Owner Only)

```javascript
// Update the post creation fee
const newFee = hre.ethers.utils.parseEther("0.002"); // 0.002 STT
await contract.setPostFee(newFee);
```

### Withdraw Contract Balance (Owner Only)

```javascript
// Withdraw accumulated fees
await contract.withdraw();
```

### Pause/Unpause Contract (Owner Only)

```javascript
// Pause contract in emergency
await contract.setPaused(true);

// Resume contract
await contract.setPaused(false);
```

## 🎯 Integration with Frontend

### 1. Update Contract Hook

The contract address is automatically loaded from environment variables in `src/hooks/usePostContract.ts`.

### 2. Enable Blockchain Features

Once deployed, users will see:
- ✅ "Blockchain Post" option in the post creation modal
- ✅ "On-Chain" badges on blockchain posts
- ✅ Verification banners with links to explorer
- ✅ Blockchain like functionality

### 3. Test User Flows

1. **Create Blockchain Post**:
   - Open post creation modal
   - Select "Blockchain Post" option
   - Fill content and pay fee
   - Verify transaction on explorer

2. **Like Blockchain Post**:
   - Find a blockchain post
   - Click like button
   - Sign transaction
   - Verify like count updated

## 🔍 Troubleshooting

### Common Issues

**"Contract not available" Error**
- Verify `NEXT_PUBLIC_POST_REGISTRY_ADDRESS` is set correctly
- Ensure the contract address is valid
- Check network connection

**"Insufficient funds" Error**
- Get more testnet STT from faucet
- Check wallet balance
- Verify gas settings

**"Transaction failed" Error**
- Check network congestion
- Increase gas limit/price
- Verify contract is not paused

**"RPC Error" Error**
- Check network configuration
- Try different RPC endpoint
- Verify chainId matches

### Debug Commands

```bash
# Check contract bytecode
npx hardhat verify --network somnia-testnet CONTRACT_ADDRESS

# Test network connection
npx hardhat run scripts/test-network.js --network somnia-testnet

# Check account balance
npx hardhat run scripts/check-balance.js --network somnia-testnet
```

## 🛡️ Security Considerations

1. **Private Key Safety**:
   - Never commit private keys to git
   - Use hardware wallets for mainnet
   - Rotate keys regularly

2. **Contract Security**:
   - Test thoroughly on testnet first
   - Use minimal deployment for initial testing
   - Monitor contract activity

3. **Fee Management**:
   - Start with low fees on testnet
   - Monitor usage and adjust accordingly
   - Plan for network congestion

## 📊 Monitoring & Analytics

### Track Contract Usage

```javascript
// Get contract statistics
const totalPosts = await contract.getTotalPosts();
const recentPosts = await contract.getRecentPosts(10);
const contractBalance = await contract.getBalance();

console.log(`Total Posts: ${totalPosts}`);
console.log(`Recent Posts: ${recentPosts.length}`);
console.log(`Contract Balance: ${ethers.utils.formatEther(contractBalance)} STT`);
```

### Monitor Events

```javascript
// Listen for new posts
contract.on("PostCreated", (postId, author, content) => {
  console.log(`New post created: ${postId} by ${author}`);
});

// Listen for likes
contract.on("PostLiked", (postId, liker) => {
  console.log(`Post ${postId} liked by ${liker}`);
});
```

## 🎉 Success!

Your smart contract is now deployed and ready to use! Users can create posts on the blockchain, ensuring permanent storage and true ownership of their content.

### Next Steps

1. **Test thoroughly** with different user scenarios
2. **Monitor gas usage** and optimize if needed
3. **Gather user feedback** on blockchain features
4. **Plan for mainnet deployment** when ready
5. **Consider additional features** like NFT achievements

---

**Need Help?**
- Check the [Somnia Documentation](https://docs.somnia.network)
- Join the [Somnia Discord](https://discord.gg/somnia)
- Review the [Hardhat Documentation](https://hardhat.org/docs)