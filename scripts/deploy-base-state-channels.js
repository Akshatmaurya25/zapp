const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

// Base Chain Configuration
const BASE_NETWORKS = {
  mainnet: {
    name: "Base Mainnet",
    chainId: 8453,
    rpcUrl: "https://mainnet.base.org",
    usdcAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    explorerUrl: "https://basescan.org"
  },
  testnet: {
    name: "Base Sepolia",
    chainId: 84532,
    rpcUrl: "https://sepolia.base.org",
    usdcAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // Base Sepolia USDC
    explorerUrl: "https://sepolia-explorer.base.org"
  }
};

async function main() {
  console.log("🚀 Deploying Base State Channel Contract");
  console.log("=====================================");

  // Get network info
  const network = await ethers.provider.getNetwork();
  const networkName = network.chainId === 8453 ? 'mainnet' : 'testnet';
  const config = BASE_NETWORKS[networkName];

  console.log(`📍 Network: ${config.name} (Chain ID: ${config.chainId})`);
  console.log(`🪙 USDC Address: ${config.usdcAddress}`);

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`👤 Deploying from: ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Deployer Balance: ${ethers.formatEther(balance)} ETH`);

  if (balance < ethers.parseEther("0.001")) {
    console.log("⚠️  Warning: Low ETH balance, you might need more for deployment");
  }

  try {
    // Deploy BaseStateChannel contract
    console.log("\n🔨 Deploying BaseStateChannel contract...");

    const BaseStateChannel = await ethers.getContractFactory("BaseStateChannel");
    const baseStateChannel = await BaseStateChannel.deploy(config.usdcAddress);

    // Wait for deployment
    await baseStateChannel.waitForDeployment();
    const contractAddress = await baseStateChannel.getAddress();

    console.log(`✅ BaseStateChannel deployed to: ${contractAddress}`);
    console.log(`🔗 Explorer: ${config.explorerUrl}/address/${contractAddress}`);

    // Verify contract parameters
    console.log("\n📋 Contract Configuration:");
    console.log(`   Token Address: ${await baseStateChannel.token()}`);
    console.log(`   Challenge Period: ${await baseStateChannel.CHALLENGE_PERIOD()} seconds`);
    console.log(`   Min Deposit: ${await baseStateChannel.MIN_DEPOSIT()} (${ethers.formatUnits(await baseStateChannel.MIN_DEPOSIT(), 6)} USDC)`);

    // Create deployment info object
    const deploymentInfo = {
      network: config.name,
      chainId: config.chainId,
      contracts: {
        BaseStateChannel: {
          address: contractAddress,
          deployer: deployer.address,
          deploymentTx: baseStateChannel.deploymentTransaction()?.hash,
          timestamp: new Date().toISOString(),
          explorerUrl: `${config.explorerUrl}/address/${contractAddress}`
        }
      },
      configuration: {
        usdcAddress: config.usdcAddress,
        challengePeriod: "3600", // 1 hour in seconds
        minDeposit: "1000000" // 1 USDC in smallest units
      }
    };

    // Save deployment info
    const deploymentsDir = path.join(__dirname, '..', 'deployments');
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentFile = path.join(deploymentsDir, `base-state-channels-${networkName}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log(`📄 Deployment info saved to: ${deploymentFile}`);

    // Generate .env updates
    console.log("\n📝 Add these to your .env.local file:");
    console.log("=====================================");
    console.log(`# Base State Channels Configuration`);
    console.log(`NEXT_PUBLIC_BASE_STATE_CHANNEL_ADDRESS=${contractAddress}`);
    console.log(`NEXT_PUBLIC_BASE_CHAIN_ID=${config.chainId}`);
    console.log(`NEXT_PUBLIC_BASE_RPC_URL=${config.rpcUrl}`);
    console.log(`NEXT_PUBLIC_BASE_USDC_ADDRESS=${config.usdcAddress}`);
    console.log(`NEXT_PUBLIC_BASE_EXPLORER_URL=${config.explorerUrl}`);

    // Test basic functionality
    console.log("\n🧪 Testing basic contract functionality...");

    // Test channel ID generation
    const testViewer = "0x1234567890123456789012345678901234567890";
    const testStreamer = "0x0987654321098765432109876543210987654321";
    const testChannelId = await baseStateChannel.getChannelId(testViewer, testStreamer);
    console.log(`   ✅ Channel ID generation works: ${testChannelId.substring(0, 10)}...`);

    // Test minimum deposit
    const minDeposit = await baseStateChannel.MIN_DEPOSIT();
    console.log(`   ✅ Minimum deposit: ${ethers.formatUnits(minDeposit, 6)} USDC`);

    console.log("\n🎉 Deployment completed successfully!");
    console.log("\nNext steps:");
    console.log("1. Update your .env.local with the new contract address");
    console.log("2. Update your Frontend to use Base network configuration");
    console.log("3. Test the integration with small amounts first");
    console.log("4. Consider verifying the contract on BaseScan");

    return {
      contractAddress,
      networkName,
      chainId: config.chainId
    };

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

// Handle script execution
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { main, BASE_NETWORKS };