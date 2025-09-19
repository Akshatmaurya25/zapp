# 🚀 NFT Achievement System - Quick Start Guide

## You've completed the database setup! Here's what to do next:

### 1. 📦 Deploy Smart Contract

Run this command to deploy to Somnia testnet:

```bash
node scripts/deploy-achievement-nft.js --network somnia-testnet
```

This will give you output like:
```
✅ Contract deployed successfully!
📍 Contract address: 0x1234567890abcdef...
🔗 Transaction hash: 0xabc123...
```

### 2. 🔧 Update Environment Variables

Add these lines to your `.env.local` file (replace with your actual contract address):

```env
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...your_contract_address
NEXT_PUBLIC_SOMNIA_RPC_URL=https://eth-rpc-api.somnia.network
NEXT_PUBLIC_SOMNIA_EXPLORER_URL=https://shannon-explorer.somnia.network
```

### 3. 🔗 Add Login Tracking

Add this to your authentication flow (wherever users log in):

```typescript
// After successful user login
await fetch('/api/users/track-login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: user.id })
})
```

### 4. 🧪 Test the System

```bash
node scripts/test-achievement-system.js
```

### 5. 🎮 Start Using!

1. **Start your dev server**: `npm run dev`
2. **Visit achievements page**: `http://localhost:3000/achievements`
3. **Create posts, likes, comments** - achievements will be awarded automatically!
4. **Mint NFTs** from the achievements page

## 🏆 What Users Will Experience:

- ✅ **Immediate rewards** for first post, first like, etc.
- ✅ **Real-time notifications** when achievements unlock
- ✅ **Beautiful progress tracking** toward next achievements
- ✅ **NFT minting** with live blockchain transactions
- ✅ **Collection display** of their earned NFTs

## 🎯 Demo Flow for Hackathon:

1. **New user signs up** → Gaming Explorer achievement eligible
2. **Complete profile** → Profile Pioneer achievement
3. **Make first post** → First Post achievement + notification
4. **Give some likes** → Progress toward Generous Heart
5. **Live mint NFT** → Blockchain transaction on Somnia
6. **Show NFT collection** → Beautiful gallery display

## 🔍 Monitoring:

- Check Supabase tables for achievement data
- Monitor contract on Shannon Explorer
- Use `/api/achievements/progress` to see user progress
- Check `/api/nft/collection` for minted NFTs

---

🎉 **Your comprehensive NFT achievement system is now ready to drive massive user engagement!**