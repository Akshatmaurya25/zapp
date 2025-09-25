const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying Nitrolite contracts to Somnia testnet...");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log(`📝 Deploying with account: ${deployer.address}`);

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`💰 Account balance: ${hre.ethers.formatEther(balance)} STT`);

  if (balance === 0n) {
    throw new Error("❌ No STT balance! Please get STT testnet tokens from Somnia faucet first.");
  }

  // Deploy Adjudicator first (Custody depends on it)
  console.log("\n📦 Deploying Adjudicator contract...");
  const Adjudicator = await hre.ethers.getContractFactory("Adjudicator");
  const adjudicator = await Adjudicator.deploy();
  await adjudicator.waitForDeployment();

  const adjudicatorAddress = await adjudicator.getAddress();
  console.log(`✅ Adjudicator deployed to: ${adjudicatorAddress}`);

  // Deploy Custody contract
  console.log("\n📦 Deploying Custody contract...");
  const Custody = await hre.ethers.getContractFactory("Custody");
  const custody = await Custody.deploy();
  await custody.waitForDeployment();

  const custodyAddress = await custody.getAddress();
  console.log(`✅ Custody deployed to: ${custodyAddress}`);

  // Save deployment addresses to a file
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    contracts: {
      custody: custodyAddress,
      adjudicator: adjudicatorAddress
    },
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };

  const deploymentPath = path.join(__dirname, "..", "deployment.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n🎉 Deployment Summary:");
  console.log(`📄 Network: ${hre.network.name} (Chain ID: ${deploymentInfo.chainId})`);
  console.log(`🏛️  Custody: ${custodyAddress}`);
  console.log(`⚖️  Adjudicator: ${adjudicatorAddress}`);
  console.log(`📁 Deployment info saved to: ${deploymentPath}`);

  // Verify on block explorer if supported
  if (hre.network.name === "somnia-testnet") {
    console.log("\n🔍 Contract verification:");
    console.log(`📍 View Custody on explorer: https://shannon-explorer.somnia.network/address/${custodyAddress}`);
    console.log(`📍 View Adjudicator on explorer: https://shannon-explorer.somnia.network/address/${adjudicatorAddress}`);
  }

  console.log("\n✨ Next steps:");
  console.log("1. Update your Nitrolite service with the deployed addresses");
  console.log("2. Test the channel creation and tipping flow");
  console.log("3. Fund your custody contract for channel operations");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });