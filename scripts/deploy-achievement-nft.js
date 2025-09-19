const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying PlatformAchievementNFT contract...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Get account balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Set platform treasury (you can change this to your wallet address)
  const platformTreasury = deployer.address; // Using deployer as treasury for now

  // Deploy the contract
  const PlatformAchievementNFT = await ethers.getContractFactory("PlatformAchievementNFT");
  const contract = await PlatformAchievementNFT.deploy(platformTreasury);

  // Wait for deployment
  await contract.waitForDeployment();

  console.log("✅ Contract deployed successfully!");

  // Get contract address
  const contractAddress = await contract.getAddress();
  console.log("📍 Contract address:", contractAddress);
  console.log("🏛️ Platform treasury:", platformTreasury);

  // Get deployment transaction
  const deployTx = contract.deploymentTransaction();
  if (deployTx) {
    console.log("🔗 Transaction hash:", deployTx.hash);
    console.log("⛽ Gas limit:", deployTx.gasLimit.toString());
  }

  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  const contractName = await contract.name();
  const contractSymbol = await contract.symbol();
  const owner = await contract.owner();

  console.log("Contract name:", contractName);
  console.log("Contract symbol:", contractSymbol);
  console.log("Contract owner:", owner);

  // Save deployment info
  const deploymentInfo = {
    network: "somnia-testnet",
    contractAddress: contractAddress,
    deployerAddress: deployer.address,
    platformTreasury: platformTreasury,
    transactionHash: deployTx ? deployTx.hash : "N/A",
    deployedAt: new Date().toISOString(),
    explorerUrl: deployTx ? `https://shannon-explorer.somnia.network/tx/${deployTx.hash}` : "N/A"
  };

  console.log("\n📄 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  console.log("\n🔧 Add this to your .env.local file:");
  console.log(`NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`NEXT_PUBLIC_SOMNIA_RPC_URL=https://eth-rpc-api.somnia.network`);
  console.log(`NEXT_PUBLIC_SOMNIA_EXPLORER_URL=https://shannon-explorer.somnia.network`);

  console.log("\n🎉 Deployment complete! Ready for achievement NFT minting!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });