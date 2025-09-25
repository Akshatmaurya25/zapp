# Nitrolite Complete Setup Guide & Troubleshooting

## 🚨 Current Issues Identified

### 1. **"Invalid amount" Error**
- **Cause**: Either `activeChannel` is null or `finalAmount <= 0`
- **Root Issue**: Channel setup failing or wallet not connected

### 2. **Wallet Address Access**
- **Expected**: `stream.users?.wallet_address`
- **Problem**: Might be undefined if user profile incomplete

### 3. **USDC Channel Funding**
- **Requirement**: Users need USDC balance to create state channels
- **Current**: No funding flow or balance checks

## 🛠️ Step-by-Step Setup Process

### Phase 1: Get Mumbai Testnet Funds

#### 1.1 Get Mumbai MATIC (Gas Fees)
```bash
# Visit: https://faucet.polygon.technology/
# Connect your wallet
# Select "Mumbai" network
# Request test MATIC
```

#### 1.2 Get Mumbai Test USDC
```bash
# Method 1: Mumbai USDC Faucet
# Visit: https://faucet.circle.com/
# Connect wallet to Mumbai
# Request test USDC

# Method 2: Swap MATIC to USDC on Mumbai DEX
# Use QuickSwap Mumbai: https://quickswap.exchange/
# Swap test MATIC → test USDC
```

#### 1.3 Verify Balances
```javascript
// USDC Contract on Mumbai: 0x742d35Cc6634C0532925a3b8BC204740d5c0532C
// Check balance in MetaMask or use:
const usdcBalance = await contract.balanceOf(userAddress)
console.log('USDC Balance:', ethers.utils.formatUnits(usdcBalance, 6))
```

### Phase 2: Fix Wallet Connection Issues

#### 2.1 Ensure Wallet Connection
```typescript
// In components, check if wallet is connected
const { address, isConnected } = useAccount()

if (!isConnected || !address) {
  showToast({ title: 'Please connect your wallet', type: 'error' })
  return
}
```

#### 2.2 Add Wallet Address to User Profile
```sql
-- If missing, add wallet_address to users table
ALTER TABLE users ADD COLUMN wallet_address VARCHAR(42);

-- Update user profiles with wallet addresses
UPDATE users SET wallet_address = '0x...' WHERE id = 'user_id';
```

### Phase 3: Fix Channel Setup Flow

#### 3.1 Pre-flight Checks
```typescript
const validateChannelSetup = async () => {
  // 1. Check wallet connection
  if (!address) throw new Error('Wallet not connected')

  // 2. Check USDC balance
  const balance = await checkUSDCBalance(address)
  if (balance < requiredDeposit) {
    throw new Error(`Insufficient USDC. Need ${requiredDeposit} USDC`)
  }

  // 3. Check network
  if (chain?.id !== 80001) {
    throw new Error('Please switch to Polygon Mumbai network')
  }

  // 4. Check creator wallet
  if (!creatorAddress) {
    throw new Error('Creator wallet address not found')
  }
}
```

#### 3.2 Channel Funding Flow
```typescript
const fundAndCreateChannel = async (depositAmount: string) => {
  const depositAmountWei = parseUSDC(depositAmount)

  // 1. Approve USDC spending
  const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer)
  const approveTx = await usdcContract.approve(NITROLITE_ADDRESS, depositAmountWei)
  await approveTx.wait()

  // 2. Create channel with deposit
  const channel = await createChannel(depositAmountWei)

  // 3. Verify channel is active
  if (!channel.isActive) {
    throw new Error('Channel creation failed')
  }

  return channel
}
```

## 🔧 Required Code Fixes

### Fix 1: Enhanced Universal Modal with Validation

```typescript
// src/components/tipping/NitroliteUniversalTipModal.tsx
import { useAccount, useBalance } from 'wagmi'

export default function NitroliteUniversalTipModal({ ... }) {
  const { address, isConnected } = useAccount()
  const { data: usdcBalance } = useBalance({
    address,
    token: NETWORK_CONFIG.usdcAddress
  })

  // Pre-setup validation
  const validateSetup = useCallback(async () => {
    if (!isConnected || !address) {
      throw new Error('Please connect your wallet first')
    }

    if (!creatorAddress) {
      throw new Error('Creator wallet address not found. Please ensure the creator has completed their profile.')
    }

    const requiredUSDC = context === 'streaming' ? 10 : 5
    const balanceNumber = parseFloat(usdcBalance?.formatted || '0')

    if (balanceNumber < requiredUSDC) {
      throw new Error(`Insufficient USDC balance. Need ${requiredUSDC} USDC, have ${balanceNumber.toFixed(2)} USDC`)
    }

    return true
  }, [isConnected, address, creatorAddress, usdcBalance, context])

  // Enhanced channel setup
  const enableChannelSetup = async () => {
    setIsProcessing(true)

    try {
      await validateSetup()

      if (context === 'streaming') {
        await enableStreamingTips('10.0')
      } else {
        await enablePostPayments('5.0')
      }

      setCurrentStep('tipping')
      showToast({
        title: '⚡ Nitrolite Channel Created!',
        description: 'You can now send instant tips',
        type: 'success'
      })
    } catch (error) {
      showToast({
        title: 'Setup Failed',
        description: error.message,
        type: 'error'
      })
    } finally {
      setIsProcessing(false)
    }
  }
}
```

### Fix 2: USDC Balance Component

```typescript
// src/components/tipping/USDCBalanceCheck.tsx
export function USDCBalanceCheck({ requiredAmount, children }) {
  const { address } = useAccount()
  const { data: balance, isLoading } = useBalance({
    address,
    token: NETWORK_CONFIG.usdcAddress
  })

  const hasEnoughBalance = parseFloat(balance?.formatted || '0') >= requiredAmount

  if (isLoading) return <div>Checking USDC balance...</div>

  if (!hasEnoughBalance) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="font-semibold text-red-800">Insufficient USDC Balance</h3>
        <p className="text-red-600 text-sm mt-1">
          Required: {requiredAmount} USDC | Available: {balance?.formatted || '0'} USDC
        </p>
        <Button
          onClick={() => window.open('https://faucet.circle.com/', '_blank')}
          className="mt-2 bg-red-600 hover:bg-red-700"
        >
          Get Test USDC
        </Button>
      </div>
    )
  }

  return children
}
```

### Fix 3: Enhanced Stream Data Structure

```typescript
// Ensure stream data includes wallet address
const enrichStreamData = async (stream) => {
  // If wallet_address is missing, try to get it from user profile
  if (!stream.users?.wallet_address && stream.users?.id) {
    const userProfile = await getUserProfile(stream.users.id)
    stream.users.wallet_address = userProfile.wallet_address
  }

  return stream
}
```

## 📋 Pre-Launch Checklist

### ✅ Mumbai Testnet Setup
- [ ] Wallet connected to Mumbai (Chain ID: 80001)
- [ ] Mumbai MATIC balance > 0.1 (for gas fees)
- [ ] Mumbai USDC balance > 10 (for channels)
- [ ] Verify USDC contract: `0x742d35Cc6634C0532925a3b8BC204740d5c0532C`

### ✅ Database Setup
- [ ] Users table has `wallet_address` column
- [ ] Creator profiles have wallet addresses populated
- [ ] Stream data includes user wallet information

### ✅ App Configuration
- [ ] Wagmi configured for Mumbai testnet
- [ ] USDC contract address correct
- [ ] Nitrolite service properly initialized
- [ ] Error handling for insufficient funds

### ✅ Testing Flow
- [ ] Connect wallet → Should show connected state
- [ ] Check USDC balance → Should display current balance
- [ ] Open tip modal → Should validate balance before setup
- [ ] Create channel → Should require USDC approval + deposit
- [ ] Send tip → Should work instantly after channel setup

## 🚀 Quick Test Script

```javascript
// Test the complete flow
async function testNitroliteFlow() {
  console.log('1. Checking wallet connection...')
  const { address, isConnected } = useAccount()
  console.log('Connected:', isConnected, 'Address:', address)

  console.log('2. Checking USDC balance...')
  const balance = await checkUSDCBalance(address)
  console.log('USDC Balance:', balance)

  console.log('3. Testing channel creation...')
  try {
    const channel = await createStreamingChannel('test-stream', creatorAddress, '10.0')
    console.log('✅ Channel created:', channel.channelId)
  } catch (error) {
    console.log('❌ Channel creation failed:', error.message)
  }
}
```

## 🆘 Common Error Solutions

| Error | Cause | Solution |
|-------|--------|----------|
| "Invalid amount" | `activeChannel` is null | Ensure channel setup completes before tipping |
| "Creator wallet not found" | `wallet_address` undefined | Update user profile with wallet address |
| "Insufficient USDC" | Low USDC balance | Get Mumbai USDC from faucet or DEX |
| "Network error" | Wrong network | Switch to Mumbai testnet (80001) |
| "Approval failed" | USDC not approved | Approve USDC spending before channel creation |

This comprehensive guide will resolve all the current issues and provide a smooth user experience for Nitrolite tipping!