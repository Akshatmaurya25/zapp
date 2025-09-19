# NFT Achievement System Setup

## Current Status: Demo Mode

The NFT minting functionality is currently running in **demo mode**. This means:
- ✅ NFT minting UI works perfectly
- ✅ All achievement tracking works
- ⚠️ NFTs are simulated (not on real blockchain)
- ⚠️ Transactions are mocked for demonstration

## Enable Real Blockchain Minting

To mint real NFTs on the Somnia blockchain, follow these steps:

### 1. Get Testnet Funds

1. Visit the [Somnia Faucet](https://faucet.somnia.network/)
2. Request testnet tokens for your wallet
3. Wait for confirmation

### 2. Set Up Environment

1. Create a `.env.local` file in the project root if it doesn't exist
2. Add your private key:
   ```
   PRIVATE_KEY=your_wallet_private_key_here
   ```

   ⚠️ **Security Warning**:
   - Never commit private keys to version control
   - Use a dedicated development wallet
   - Don't use your main wallet's private key

### 3. Deploy the Contract

Run the setup script to deploy the NFT contract:

```bash
npm run setup:nft
```

This will:
- Deploy the PlatformAchievementNFT contract to Somnia testnet
- Update your `.env.local` with the contract address
- Configure the environment for real blockchain minting

### 4. Restart Development Server

```bash
npm run dev
```

### 5. Test Real NFT Minting

1. Go to the achievements page
2. Try minting an NFT
3. Check the transaction on [Somnia Explorer](https://shannon-explorer.somnia.network/)

## Troubleshooting

### "Insufficient funds" error
- Get more testnet tokens from the faucet
- Ensure your wallet has enough balance for gas fees

### "Network connection" error
- Check your internet connection
- Verify the RPC endpoint is working

### Contract deployment fails
- Ensure you have a valid `PRIVATE_KEY` in `.env.local`
- Check that you have sufficient testnet funds
- Try again after a few minutes (nonce issues resolve automatically)

### Still in demo mode after setup
- Restart your development server with `npm run dev`
- Check that `.env.local` contains `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS`
- Verify the console logs show "Using real blockchain minting"

## Manual Deployment (Alternative)

If the setup script doesn't work, you can deploy manually:

```bash
# Compile contracts
npm run compile

# Deploy to testnet
npm run deploy:nft

# Check the output for the contract address
# Add it to .env.local as NEXT_PUBLIC_NFT_CONTRACT_ADDRESS
```

## Network Configuration

The app is configured for:
- **Testnet**: Somnia Testnet (Chain ID: 50312)
- **RPC**: https://dream-rpc.somnia.network/
- **Explorer**: https://shannon-explorer.somnia.network/

## Smart Contract Details

The NFT contract (`PlatformAchievementNFT`) includes:
- ERC-721 standard compliance
- Achievement categories (Journey, Creator, Social, Loyalty, Gaming, Special)
- Rarity levels (Common to Legendary)
- Ownership and access controls
- Metadata storage for each achievement

## Development vs Production

- **Development**: Demo mode by default for easy testing
- **Production**: Requires proper environment configuration for real blockchain integration

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your environment configuration
3. Ensure you have sufficient testnet funds
4. Try the troubleshooting steps above