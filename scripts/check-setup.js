const hre = require("hardhat");

async function checkSetup() {
  console.log("🔍 Checking Deployment Setup...\n");

  try {
    // Check if we have a signer
    const [deployer] = await hre.ethers.getSigners();
    console.log("📝 Deployer Account:", deployer.address);

    // Check balance (compatible with ethers v6)
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    const balanceInEth = hre.ethers.formatEther(balance);
    console.log("💰 Account Balance:", balanceInEth, "STT");

    // Check if balance is sufficient
    const minBalance = hre.ethers.parseEther("0.01"); // 0.01 STT minimum
    if (balance < minBalance) {
      console.log("⚠️  Warning: Low balance! You may need more STT for deployment.");
      console.log("   Get testnet tokens from: https://faucet.somnia.network");
    } else {
      console.log("✅ Balance looks good for deployment");
    }

    // Check network info
    const network = await hre.ethers.provider.getNetwork();
    console.log("\n🌐 Network Information:");
    console.log("   Name:", network.name);
    console.log("   Chain ID:", network.chainId);

    // Check if we're on the right network
    const expectedChainIds = {
      'somnia-testnet': 50312,
      'somnia-mainnet': 5031
    };

    const networkName = hre.network.name;
    if (expectedChainIds[networkName] && Number(network.chainId) === expectedChainIds[networkName]) {
      console.log("✅ Network configuration is correct");
    } else {
      console.log(`⚠️  Network mismatch. Expected: ${expectedChainIds[networkName]}, Got: ${Number(network.chainId)}`);
    }

    // Check gas price
    try {
      const gasPrice = await hre.ethers.provider.getGasPrice();
      const gasPriceInGwei = hre.ethers.formatUnits(gasPrice, "gwei");
      console.log("⛽ Current Gas Price:", gasPriceInGwei, "gwei");
    } catch (error) {
      console.log("⚠️  Could not fetch gas price");
    }

    // Check if contract is already deployed
    const contractAddress = process.env.NEXT_PUBLIC_POST_REGISTRY_ADDRESS;
    if (contractAddress) {
      console.log("\n📋 Existing Contract Information:");
      console.log("   Address:", contractAddress);

      try {
        const code = await hre.ethers.provider.getCode(contractAddress);
        if (code === "0x") {
          console.log("❌ No contract code found at this address");
        } else {
          console.log("✅ Contract code found");

          // Try to interact with the contract
          try {
            const PostRegistry = await hre.ethers.getContractFactory("PostRegistry");
            const contract = PostRegistry.attach(contractAddress);
            const totalPosts = await contract.getTotalPosts();
            const postFee = await contract.postFee();

            console.log("   Total Posts:", totalPosts.toString());
            console.log("   Post Fee:", hre.ethers.formatEther(postFee), "STT");
            console.log("✅ Contract is functional");
          } catch (error) {
            console.log("⚠️  Contract exists but may not be functional:", error.message);
          }
        }
      } catch (error) {
        console.log("❌ Error checking contract:", error.message);
      }
    } else {
      console.log("\n📋 No contract address found in environment");
      console.log("   Contract deployment will be needed");
    }

    // Environment check
    console.log("\n🔧 Environment Check:");
    console.log("   PRIVATE_KEY:", process.env.PRIVATE_KEY ? "✅ Set" : "❌ Missing");
    console.log("   CONTRACT_ADDRESS:", process.env.NEXT_PUBLIC_POST_REGISTRY_ADDRESS ? "✅ Set" : "📝 Not set (normal if not deployed)");

    // Summary
    console.log("\n📊 Setup Summary:");
    console.log("==========================================");
    console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`);
    console.log(`Deployer: ${deployer.address}`);
    console.log(`Balance: ${balanceInEth} STT`);
    console.log(`Contract: ${contractAddress || 'Not deployed'}`);

    if (balance >= minBalance && process.env.PRIVATE_KEY) {
      console.log("🎉 Ready for deployment!");
    } else {
      console.log("⚠️  Setup incomplete - check warnings above");
    }

  } catch (error) {
    console.error("❌ Setup check failed:", error.message);

    if (error.message.includes("could not detect network")) {
      console.log("\n💡 Tip: Check your network configuration in hardhat.config.js");
    }

    if (error.message.includes("private key")) {
      console.log("\n💡 Tip: Set PRIVATE_KEY in your .env.local file");
    }
  }
}

// Run the check
checkSetup()
  .then(() => {
    console.log("\n🏁 Setup check completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Setup check failed:", error);
    process.exit(1);
  });