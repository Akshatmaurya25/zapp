# NFT Achievement System Setup Guide

This guide will walk you through setting up the comprehensive NFT achievement system for your gaming social DeFi platform.

## 🗂️ Database Setup

### 1. Run the Database Schema

Execute the SQL schema to create the necessary tables:

```sql
-- Run this in your Supabase SQL editor
\i database/schema/nft-achievements.sql
```

### 2. Seed Achievement Definitions

Populate the achievement types:

```sql
-- Run this in your Supabase SQL editor
\i database/seeds/achievement-definitions.sql
```

## 🔧 Smart Contract Deployment

### 1. Compile the Contract

```bash
npm run compile
```

### 2. Deploy to Somnia Testnet

```bash
npm run deploy:testnet
```

### 3. Update Environment Variables

Add the deployed contract address to your `.env.local`:

```env
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...your_deployed_contract_address
NEXT_PUBLIC_SOMNIA_RPC_URL=https://eth-rpc-api.somnia.network
NEXT_PUBLIC_SOMNIA_EXPLORER_URL=https://shannon-explorer.somnia.network
```

## 🎯 Integration Points

### 1. Track User Login

Add this to your authentication flow:

```typescript
// After successful user login
await fetch('/api/users/track-login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: user.id })
})
```

### 2. Automatic Achievement Tracking

The system is already integrated into:
- ✅ Post creation (`/api/posts/create`)
- ✅ Like toggle (`/api/likes/toggle`)
- ✅ Comment creation (`/api/comments/create`)
- ✅ User login tracking (`/api/users/track-login`)

### 3. Add to Profile Pages

Include the achievement section in user profiles:

```tsx
import AchievementNFTSection from '@/components/achievements/AchievementNFTSection'

// In your profile component
<AchievementNFTSection
  userId={profile.id}
  isOwnProfile={isOwnProfile}
/>
```

## 🎮 Achievement Categories

The system includes 6 comprehensive categories:

### 1. Platform Journey NFTs (Onboarding)
- Gaming Explorer, Profile Pioneer, First Post, etc.

### 2. Content Creator NFTs
- Storyteller, Screenshot Warrior, Gaming Guide Creator, etc.

### 3. Social Engagement NFTs
- Generous Heart, Social Butterfly, Community Helper, etc.

### 4. Platform Loyalty NFTs
- Week Warrior, Monthly Regular, Platform Veteran, etc.

### 5. Gaming Content Specialist NFTs
- Setup Showcase, Gaming News Curator, Retro Gamer, etc.

### 6. Special Edition & Elite NFTs
- Platform Pioneer, Triple Threat, Gaming Icon, etc.

## 🚀 Testing the System

### 1. Create Test User Actions

```typescript
// Test post creation achievement
await fetch('/api/posts/create', {
  method: 'POST',
  body: JSON.stringify({
    user_id: 'test-user-id',
    content: 'My first gaming post!',
    game_category: 'action'
  })
})

// Test like achievement
await fetch('/api/likes/toggle', {
  method: 'POST',
  body: JSON.stringify({
    user_id: 'test-user-id',
    post_id: 'some-post-id'
  })
})
```

### 2. Check Achievement Progress

```typescript
const response = await fetch(`/api/achievements/progress?userId=${userId}`)
const data = await response.json()
console.log('Achievement progress:', data.progress)
```

### 3. Test NFT Minting

```typescript
// Get eligible achievements
const eligible = await fetch(`/api/achievements/eligible?userId=${userId}`)
const achievements = await eligible.json()

// Mint an NFT
if (achievements.eligibleAchievements.length > 0) {
  const response = await fetch('/api/nft/mint', {
    method: 'POST',
    body: JSON.stringify({
      achievementId: achievements.eligibleAchievements[0].id,
      userWalletAddress: userWallet
    })
  })
}
```

## 📈 Demo Flow for Hackathon

### Perfect Demo Sequence:

1. **New User Signup** → Gaming Explorer NFT eligible
2. **Complete Profile** → Profile Pioneer NFT eligible
3. **First Post** → First Post achievement + notification
4. **Give Likes** → Generous Heart progress tracking
5. **Mint NFT** → Live blockchain transaction
6. **Show Collection** → Beautiful NFT gallery display

### Key Demo Talking Points:

- **Platform-Native Rewards**: Every action earns meaningful achievements
- **Progressive Gamification**: Clear path from newcomer to legend
- **Blockchain Integration**: Real NFTs on Somnia network
- **Community Building**: Rewards positive social behavior
- **Scalable System**: Easy to add new achievements

## 🛠️ Advanced Configuration

### Custom Achievement Types

Add new achievements by inserting into `nft_achievement_types`:

```sql
INSERT INTO nft_achievement_types (
  name, display_name, description, category, rarity_level,
  requirements, color_scheme, badge_icon
) VALUES (
  'custom_achievement',
  'Custom Achievement',
  'Description of what this achievement represents',
  'gaming',
  3,
  '{"total_posts": [50]}',
  '#FF6B35',
  '🏆'
);
```

### Limited Edition Setup

```sql
UPDATE nft_achievement_types SET
  is_limited_edition = true,
  max_recipients = 100
WHERE name = 'your_achievement_name';
```

## 🔍 Monitoring & Analytics

### Track System Performance

```sql
-- Achievement distribution
SELECT
  category,
  COUNT(*) as total_earned
FROM user_achievements ua
JOIN nft_achievement_types nat ON ua.achievement_type_id = nat.id
GROUP BY category;

-- Top achievers
SELECT
  u.username,
  COUNT(*) as achievements_count
FROM user_achievements ua
JOIN users u ON ua.user_id = u.id
GROUP BY u.id, u.username
ORDER BY achievements_count DESC
LIMIT 10;

-- NFT minting stats
SELECT
  DATE(minted_at) as date,
  COUNT(*) as nfts_minted
FROM platform_nfts
GROUP BY DATE(minted_at)
ORDER BY date DESC;
```

## 🎯 Success Metrics

Track these KPIs:

- **Achievement Completion Rate**: % of users earning first achievement
- **NFT Conversion Rate**: % of achievements minted as NFTs
- **User Engagement**: Average achievements per active user
- **Platform Retention**: Users with 7+ day streaks
- **Community Growth**: Social engagement achievements earned

## 🐛 Troubleshooting

### Common Issues:

1. **Achievements not triggering**: Check database functions and triggers
2. **NFT minting fails**: Verify contract deployment and wallet connection
3. **Progress not updating**: Ensure API routes include achievement tracking
4. **Database errors**: Check table permissions and foreign key constraints

### Debug Mode:

Enable verbose logging in achievement tracker:

```typescript
// In achievement-tracker.ts
console.log('[AchievementTracker] Debug mode enabled')
```

---

🎉 **Ready to Launch!** Your comprehensive NFT achievement system is now set up and ready to drive user engagement through gamified blockchain rewards.