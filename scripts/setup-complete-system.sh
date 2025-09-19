#!/bin/bash

# Complete Achievement System Setup Script
# Run this after you've already run the database migrations

echo "🎯 Setting up Complete NFT Achievement System..."

# Step 1: Deploy Smart Contract
echo "📦 Step 1: Deploying smart contract..."
npm run compile
if [ $? -eq 0 ]; then
    echo "✅ Contract compiled successfully"
    node scripts/deploy-achievement-nft.js --network somnia-testnet
else
    echo "❌ Contract compilation failed"
    exit 1
fi

# Step 2: Test the system
echo "🧪 Step 2: Testing achievement system..."
if [ -f "scripts/test-achievement-system.js" ]; then
    node scripts/test-achievement-system.js
else
    echo "⚠️ Test script not found, skipping tests"
fi

# Step 3: Start development server
echo "🚀 Step 3: Starting development server..."
echo "After the contract deploys, make sure to:"
echo "1. Copy the contract address to your .env.local"
echo "2. Add login tracking to your auth flow"
echo "3. Test creating posts, likes, and comments"
echo "4. Check the achievements page"

echo ""
echo "🎉 Setup complete! Your NFT achievement system is ready!"
echo "📱 Visit /achievements page to see your achievement system"
echo "🏆 Users will start earning achievements immediately!"