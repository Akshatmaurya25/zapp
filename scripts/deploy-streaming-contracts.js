const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying streaming contracts to Somnia network...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  // Deploy StreamTipping contract
  console.log("\nDeploying StreamTipping contract...");
  const StreamTipping = await hre.ethers.getContractFactory("StreamTipping");
  const streamTipping = await StreamTipping.deploy();
  await streamTipping.waitForDeployment();
  const streamTippingAddress = await streamTipping.getAddress();
  console.log("StreamTipping deployed to:", streamTippingAddress);

  // Deploy SkillRewards contract with oracle address (deployer for now)
  console.log("\nDeploying SkillRewards contract...");
  const SkillRewards = await hre.ethers.getContractFactory("SkillRewards");
  const skillRewards = await SkillRewards.deploy(deployer.address);
  await skillRewards.waitForDeployment();
  const skillRewardsAddress = await skillRewards.getAddress();
  console.log("SkillRewards deployed to:", skillRewardsAddress);

  // Fund the SkillRewards contract with some initial ETH for rewards
  console.log("\nFunding SkillRewards contract...");
  const fundAmount = hre.ethers.parseEther("1.0"); // 1 ETH
  const fundTx = await skillRewards.fundRewards({ value: fundAmount });
  await fundTx.wait();
  console.log("Funded SkillRewards with 1 ETH");

  // Add some sample achievements
  console.log("\nAdding sample achievements...");

  const achievements = [
    {
      gameId: "steam_730", // CS:GO
      achievementId: "first_kill",
      rewardAmount: hre.ethers.parseEther("0.001"), // 0.001 ETH
      title: "First Blood",
      description: "Get your first kill in CS:GO"
    },
    {
      gameId: "steam_440", // TF2
      achievementId: "first_win",
      rewardAmount: hre.ethers.parseEther("0.002"), // 0.002 ETH
      title: "Victory!",
      description: "Win your first match in TF2"
    },
    {
      gameId: "steam_271590", // GTA V
      achievementId: "welcome_to_los_santos",
      rewardAmount: hre.ethers.parseEther("0.005"), // 0.005 ETH
      title: "Welcome to Los Santos",
      description: "Complete the GTA V prologue"
    }
  ];

  for (const achievement of achievements) {
    const tx = await skillRewards.addAchievement(
      achievement.gameId,
      achievement.achievementId,
      achievement.rewardAmount,
      achievement.title,
      achievement.description
    );
    await tx.wait();
    console.log(`Added achievement: ${achievement.title}`);
  }

  // Save contract addresses to a file
  const contractAddresses = {
    streamTipping: streamTippingAddress,
    skillRewards: skillRewardsAddress,
    network: hre.network.name,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address
  };

  const addressesPath = path.join(__dirname, "../contract-addresses.json");
  fs.writeFileSync(addressesPath, JSON.stringify(contractAddresses, null, 2));

  console.log("\n=== Deployment Summary ===");
  console.log("Network:", hre.network.name);
  console.log("StreamTipping:", streamTippingAddress);
  console.log("SkillRewards:", skillRewardsAddress);
  console.log("Oracle (for testing):", deployer.address);
  console.log("Contract addresses saved to:", addressesPath);

  console.log("\n=== Verification Commands ===");
  console.log(`npx hardhat verify --network ${hre.network.name} ${streamTippingAddress}`);
  console.log(`npx hardhat verify --network ${hre.network.name} ${skillRewardsAddress} ${deployer.address}`);

  console.log("\n=== Environment Variables ===");
  console.log("Add these to your .env.local file:");
  console.log(`NEXT_PUBLIC_STREAM_TIPPING_CONTRACT=${streamTippingAddress}`);
  console.log(`NEXT_PUBLIC_SKILL_REWARDS_CONTRACT=${skillRewardsAddress}`);
  console.log(`ORACLE_PRIVATE_KEY=${process.env.PRIVATE_KEY}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });