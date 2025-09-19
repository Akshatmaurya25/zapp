# Somnia Gaming DApp 🎮

A comprehensive Web3 gaming social platform built on Somnia blockchain with live streaming, NFT achievements, and social features.

## 🌟 Overview

Somnia Gaming DApp is a decentralized social platform that combines gaming, streaming, and blockchain technology. Users can create posts, stream gameplay, earn NFT achievements, tip streamers, and interact with a vibrant gaming community.

## 🚀 Key Features

### 🎯 Core Social Features
- **User Profiles**: Wallet-connected profiles with customizable usernames, bios, and avatars
- **Social Feed**: Create and interact with gaming-focused posts
- **Follow System**: Follow favorite gamers and content creators
- **Real-time Interactions**: Like, comment, and engage with community content
- **Game Categories**: Organized content by game types (Valorant, PUBG, Fortnite, League of Legends, etc.)

### 🎬 Live Streaming
- **RTMP Streaming**: Full RTMP support for live game streaming
- **HLS Playback**: Adaptive streaming for viewers
- **Real-time Chat**: Integrated chat system for streams
- **Stream Management**: Create, manage, and monitor live streams
- **Viewer Analytics**: Track viewer counts and engagement

### 💰 Tipping & Rewards System
- **Stream Tipping**: Send crypto tips to streamers during live streams
- **Platform Economy**: Built-in token economy with platform fees
- **Withdrawal System**: Streamers can withdraw earnings
- **Tip History**: Track all tipping activity

### 🏆 Achievement System
- **NFT Achievements**: Mint unique NFT achievements for gaming milestones
- **Multiple Categories**: Journey, Creator, Social, Loyalty, Gaming, and Special achievements
- **Rarity Levels**: Common, Uncommon, Rare, Epic, and Legendary achievements
- **Skill Rewards**: Earn token rewards for completing achievements
- **Achievement Verification**: Oracle-based achievement verification system

### 🎨 NFT Features
- **ERC-721 Achievements**: Full NFT standard compliance
- **Metadata Storage**: Rich metadata with IPFS integration
- **Rarity System**: 5-tier rarity classification
- **Achievement Categories**: 6 different achievement types
- **Limited Editions**: Special limited edition achievements

## 🔗 Smart Contracts

### 1. StreamTipping Contract
**Address**: `0x229016d64ECb1543d52512B207420409E9D0127A`

**Features**:
- Send tips to streamers during live streams
- Platform fee management (2.5% default)
- Earnings tracking and withdrawal
- Anti-reentrancy protection
- Pausable functionality

**Key Functions**:
- `sendTip(address streamer, string streamId, string message)` - Send a tip to a streamer
- `withdrawEarnings()` - Withdraw accumulated earnings
- `getStreamerStats(address streamer)` - Get streamer statistics

### 2. SkillRewards Contract
**Address**: `0x19B9342af8cE1Ad804aA214e25a2C666D61558e8`

**Features**:
- Manage gaming achievements and rewards
- Oracle-based verification system
- Token rewards for completed achievements
- Achievement metadata management
- User progress tracking

**Key Functions**:
- `addAchievement(string gameId, string achievementId, uint256 rewardAmount)` - Add new achievement
- `unlockAchievement(address user, bytes32 achievementKey, bytes32 proofHash)` - Unlock achievement for user
- `claimReward(bytes32 achievementKey)` - Claim achievement rewards

### 3. PlatformAchievementNFT Contract
**Address**: *Not deployed yet*

**Features**:
- ERC-721 compliant NFT achievements
- 6 achievement categories (Journey, Creator, Social, Loyalty, Gaming, Special)
- 5 rarity levels (Common to Legendary)
- Limited edition support
- Comprehensive metadata system

**Key Functions**:
- `mintAchievement(address to, AchievementCategory category, RarityLevel rarity, string metadata)` - Mint achievement NFT
- `getAchievementsByUser(address user)` - Get all user's achievements
- `getAchievementMetadata(uint256 tokenId)` - Get achievement details

## 🌐 Network Information

**Blockchain**: Somnia Testnet
**Network Name**: somnia-testnet
**Deployer Wallet**: `0xE81032A865Dd45BF39E8430f72b9FA8f2e2Cb030`
**Deployment Date**: September 18, 2025

## 🛠 Technology Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **React Hook Form**: Form management

### Backend
- **Supabase**: Database and real-time subscriptions
- **PostgreSQL**: Primary database
- **IPFS**: Decentralized file storage
- **Node.js**: Streaming server

### Blockchain
- **Hardhat**: Smart contract development
- **OpenZeppelin**: Security-audited contract libraries
- **Ethers.js**: Blockchain interaction
- **Wagmi**: React hooks for Ethereum

### Streaming Infrastructure
- **RTMP Server**: Live streaming input
- **HLS Server**: Adaptive streaming output
- **WebRTC**: Real-time communication
- **FFmpeg**: Video processing

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- Wallet (MetaMask, WalletConnect, etc.)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd somnia-dapp
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Copy `ENV_TEMPLATE.txt` to `.env.local` and configure:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Blockchain
NEXT_PUBLIC_CHAIN_ID=2648
PRIVATE_KEY=your_wallet_private_key
SOMNIA_RPC_URL=https://testnet.somnia.network

# IPFS
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs/
IPFS_PROJECT_ID=your_ipfs_project_id
IPFS_PROJECT_SECRET=your_ipfs_secret

# Streaming
STREAMING_SERVER_URL=http://localhost:9000
RTMP_URL=rtmp://localhost:1935/live
HLS_URL=http://localhost:8000/live
```

4. **Database Setup**
Run the database migrations in Supabase SQL Editor:
```sql
-- Run each step separately:
-- Step 1: Create live_streams table
-- Step 2: Create stream_tips table
-- Step 3: Add indexes
```

5. **Deploy Smart Contracts**
```bash
# Compile contracts
npm run compile

# Deploy to Somnia testnet
npm run deploy:testnet

# Setup NFT system
npm run setup:nft
```

6. **Start Development Server**
```bash
# Start Next.js app
npm run dev

# Start streaming server (separate terminal)
npm run streaming-server
```

## 📡 API Endpoints

### Posts
- `POST /api/posts/create` - Create new post
- `GET /api/posts/feed` - Get social feed
- `DELETE /api/posts/delete/[id]` - Delete post

### Users
- `POST /api/users/update-wallet` - Update user wallet
- `POST /api/users/track-login` - Track user login

### Streaming
- `POST /api/streams/create` - Create new stream
- `GET /api/streams/list` - List active streams
- `POST /api/streams/tip` - Send tip to streamer

### Achievements
- `GET /api/achievements/user/[userId]` - Get user achievements
- `POST /api/achievements/verify` - Verify achievement completion

### NFT
- `POST /api/nft/mint` - Mint achievement NFT
- `GET /api/nft/metadata/[tokenId]` - Get NFT metadata

## 🎮 Gaming Integration

### Supported Games
- **Valorant**: Tactical FPS achievements
- **PUBG**: Battle Royale milestones
- **Fortnite**: Epic Games integration
- **League of Legends**: MOBA achievements
- **General Gaming**: Universal gaming achievements

### Achievement Types
1. **Journey**: First post, profile setup, first stream
2. **Creator**: Content creation milestones
3. **Social**: Community interaction achievements
4. **Loyalty**: Long-term engagement rewards
5. **Gaming**: Game-specific achievements
6. **Special**: Rare and exclusive achievements

## 💰 Tokenomics

### Platform Economy
- **Platform Fee**: 2.5% on all tips
- **Achievement Rewards**: Variable token amounts
- **NFT Minting**: Gas fees + minting costs
- **Withdrawal**: Minimum thresholds apply

### Eligible Wallets
- **Any Ethereum-compatible wallet**
- **MetaMask** (Recommended)
- **WalletConnect** compatible wallets
- **Coinbase Wallet**
- **Trust Wallet**

## 🔐 Security Features

### Smart Contract Security
- **ReentrancyGuard**: Prevents reentrancy attacks
- **Pausable**: Emergency pause functionality
- **Access Control**: Role-based permissions
- **Input Validation**: Comprehensive input checking

### Platform Security
- **Row Level Security**: Database-level access control
- **Wallet Verification**: Cryptographic signature verification
- **Rate Limiting**: API abuse prevention
- **CSRF Protection**: Cross-site request forgery protection

## 🛣 Roadmap

### Phase 1: Core Platform (Completed)
- ✅ User authentication and profiles
- ✅ Social feed and interactions
- ✅ Basic streaming functionality
- ✅ Smart contract deployment

### Phase 2: Enhanced Features (In Progress)
- 🚧 NFT achievement system
- 🚧 Advanced streaming features
- 🚧 Gaming API integrations
- 🚧 Mobile responsiveness

### Phase 3: Advanced Features (Planned)
- 📋 Tournament system
- 📋 Governance token
- 📋 DAO implementation
- 📋 Cross-chain compatibility

### Phase 4: Ecosystem Expansion (Future)
- 📋 Game developer tools
- 📋 Marketplace integration
- 📋 VR/AR support
- 📋 AI-powered features

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- **GitHub Issues**: [Create an issue](https://github.com/your-repo/issues)
- **Discord**: Join our community server
- **Email**: support@somnia-gaming.com

## 🔗 Links

- **Live Demo**: [https://somnia-gaming.vercel.app](https://somnia-gaming.vercel.app)
- **Documentation**: [https://docs.somnia-gaming.com](https://docs.somnia-gaming.com)
- **Somnia Network**: [https://somnia.network](https://somnia.network)
- **Smart Contracts**: [Somnia Explorer](https://explorer.somnia.network)

---

Built with ❤️ for the gaming community on Somnia blockchain.