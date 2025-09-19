const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 Setting up NFT Blockchain Integration...\n");

  // Check if we have a private key
  if (!process.env.PRIVATE_KEY) {
    console.log("❌ Missing PRIVATE_KEY in environment variables");
    console.log("📝 Please add your private key to .env.local:");
    console.log("   PRIVATE_KEY=your_private_key_here\n");

    console.log("⚠️  Security Note:");
    console.log("   - Never commit private keys to version control");
    console.log("   - Use a dedicated wallet for development");
    console.log("   - Ensure you have testnet funds for deployment\n");
    return;
  }

  try {
    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log("🔐 Deploying with account:", deployer.address);

    // Check balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

    if (balance === 0n) {
      console.log("❌ Insufficient balance for deployment");
      console.log("💡 Get testnet funds from: https://somnia.network/faucet");
      return;
    }

    // Set platform treasury (using deployer for simplicity)
    const platformTreasury = deployer.address;

    console.log("\n📦 Deploying PlatformAchievementNFT contract...");

    // Deploy the contract
    const PlatformAchievementNFT = await ethers.getContractFactory("PlatformAchievementNFT");
    const contract = await PlatformAchievementNFT.deploy(platformTreasury);

    // Wait for deployment
    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();
    console.log("✅ Contract deployed successfully!");
    console.log("📍 Contract address:", contractAddress);

    // Verify deployment
    const contractName = await contract.name();
    const contractSymbol = await contract.symbol();
    const owner = await contract.owner();

    console.log("\n🔍 Contract Details:");
    console.log("   Name:", contractName);
    console.log("   Symbol:", contractSymbol);
    console.log("   Owner:", owner);

    // Get deployment transaction
    const deployTx = contract.deploymentTransaction();
    if (deployTx) {
      console.log("   Transaction:", deployTx.hash);
      console.log("   Explorer:", `https://shannon-explorer.somnia.network/tx/${deployTx.hash}`);
    }

    // Create/update .env.local file
    const envPath = path.join(process.cwd(), '.env.local');
    let envContent = '';

    // Read existing .env.local if it exists
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Remove existing NFT contract address if present
    envContent = envContent.replace(/^NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=.*$/m, '');
    envContent = envContent.replace(/^NFT_MINTING_PRIVATE_KEY=.*$/m, '');

    // Add new contract address and private key
    envContent += `\n# NFT Contract Configuration\n`;
    envContent += `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=${contractAddress}\n`;
    envContent += `NFT_MINTING_PRIVATE_KEY=${process.env.PRIVATE_KEY}\n`;
    envContent += `NEXT_PUBLIC_RPC_URL=https://dream-rpc.somnia.network/\n`;

    // Write updated .env.local
    fs.writeFileSync(envPath, envContent.trim() + '\n');

    console.log("\n📝 Environment variables updated in .env.local");
    console.log("🔄 Restart your development server to apply changes");

    console.log("\n🎉 Setup Complete!");
    console.log("🔗 Your app can now mint real NFTs on the Somnia blockchain!");

    // Test the contract
    console.log("\n🧪 Testing contract...");
    const totalSupply = await contract.totalSupply();
    console.log("   Initial supply:", totalSupply.toString());

    console.log("\n📚 Next Steps:");
    console.log("   1. Restart your Next.js development server");
    console.log("   2. Try minting an NFT from the achievements page");
    console.log("   3. Check the transaction on Somnia Explorer");

  } catch (error) {
    console.error("\n❌ Deployment failed:", error.message);

    if (error.message.includes('insufficient funds')) {
      console.log("\n💡 Solution: Get testnet funds from https://somnia.network/faucet");
    } else if (error.message.includes('nonce')) {
      console.log("\n💡 Solution: Wait a moment and try again (nonce issue)");
    } else if (error.message.includes('network')) {
      console.log("\n💡 Solution: Check your internet connection and RPC endpoint");
    }
  }
}

// Run the setup
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Setup failed:", error);
    process.exit(1);
  });