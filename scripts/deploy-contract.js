const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment to Somnia Network...");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "STT");

  if (balance < hre.ethers.parseEther("0.01")) {
    console.log("⚠️  Warning: Low balance! Make sure you have enough STT for deployment.");
  }

  try {
    // Deploy PostRegistry contract
    console.log("\n📦 Deploying SimplePostRegistry contract...");
    const PostRegistry = await hre.ethers.getContractFactory("SimplePostRegistry");

    // Deploy with automatic gas estimation
    const postRegistry = await PostRegistry.deploy();

    console.log("⏳ Waiting for deployment transaction...");
    await postRegistry.waitForDeployment();

    console.log("✅ SimplePostRegistry deployed successfully!");
    console.log("📍 Contract address:", await postRegistry.getAddress());
    console.log("🔍 Transaction hash:", postRegistry.deploymentTransaction().hash);

    // Verify deployment
    console.log("\n🔍 Verifying deployment...");
    const contractAddress = await postRegistry.getAddress();
    const deployedCode = await hre.ethers.provider.getCode(contractAddress);
    if (deployedCode === "0x") {
      throw new Error("Contract deployment failed - no code at address");
    }

    // Test basic contract functionality
    console.log("\n🧪 Testing contract functionality...");
    const totalPosts = await postRegistry.getTotalPosts();
    console.log("📊 Total posts:", totalPosts.toString());

    const postFee = await postRegistry.postFee();
    console.log("💵 Post fee:", hre.ethers.formatEther(postFee), "STT");

    const owner = await postRegistry.owner();
    console.log("👤 Contract owner:", owner);

    // Save deployment info
    const deploymentInfo = {
      network: hre.network.name,
      contractAddress: contractAddress,
      deployerAddress: deployer.address,
      transactionHash: postRegistry.deploymentTransaction().hash,
      deploymentTime: new Date().toISOString(),
      gasUsed: postRegistry.deploymentTransaction().gasLimit?.toString(),
      postFee: hre.ethers.formatEther(postFee),
    };

    console.log("\n📄 Deployment Summary:");
    console.log("==========================================");
    console.log(`Network: ${deploymentInfo.network}`);
    console.log(`Contract Address: ${deploymentInfo.contractAddress}`);
    console.log(`Deployer: ${deploymentInfo.deployerAddress}`);
    console.log(`Transaction Hash: ${deploymentInfo.transactionHash}`);
    console.log(`Post Fee: ${deploymentInfo.postFee} STT`);
    console.log(`Deployed at: ${deploymentInfo.deploymentTime}`);
    console.log("==========================================");

    console.log("\n🎉 Deployment completed successfully!");
    console.log("\n📋 Next Steps:");
    console.log("1. Add the contract address to your .env file:");
    console.log(`   NEXT_PUBLIC_POST_REGISTRY_ADDRESS=${contractAddress}`);
    console.log("2. Update your frontend to use the deployed contract");
    console.log("3. Test the contract functionality through your dApp");

    // Optional: Verify on block explorer (if supported)
    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
      console.log("\n🔗 View on Somnia Explorer:");
      console.log(`https://shannon-explorer.somnia.network/address/${contractAddress}`);
    }

    return {
      contractAddress: contractAddress,
      transactionHash: postRegistry.deploymentTransaction().hash,
    };

  } catch (error) {
    console.error("❌ Deployment failed:", error.message);

    if (error.message.includes("insufficient funds")) {
      console.log("\n💡 Tip: Make sure you have enough STT in your deployer account");
      console.log("You can get testnet STT from the Somnia faucet");
    }

    if (error.message.includes("gas")) {
      console.log("\n💡 Tip: Try adjusting gas settings or check network congestion");
    }

    process.exit(1);
  }
}

// Run the deployment
main()
  .then((result) => {
    console.log("\n🏁 Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });