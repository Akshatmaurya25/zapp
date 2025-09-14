const hre = require("hardhat");

async function main() {
  console.log("Deploying PostRegistry contract to Somnia testnet...");

  // Get the contract factory
  const PostRegistry = await hre.ethers.getContractFactory("PostRegistry");

  // Deploy the contract
  console.log("Deploying contract...");
  const postRegistry = await PostRegistry.deploy();

  await postRegistry.deployed();

  console.log("PostRegistry deployed to:", postRegistry.address);
  console.log("Transaction hash:", postRegistry.deployTransaction.hash);

  // Wait for a few block confirmations
  console.log("Waiting for block confirmations...");
  await postRegistry.deployTransaction.wait(6);

  // Verify contract on block explorer if possible
  if (hre.network.name === "somnia-testnet") {
    console.log("Verifying contract...");
    try {
      await hre.run("verify:verify", {
        address: postRegistry.address,
        constructorArguments: [],
      });
      console.log("Contract verified successfully");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }

  // Log useful information
  console.log("\n=== Deployment Summary ===");
  console.log("Contract Address:", postRegistry.address);
  console.log("Network:", hre.network.name);
  console.log("Deployer:", (await hre.ethers.getSigners())[0].address);

  // Get initial contract state
  const totalPosts = await postRegistry.getTotalPosts();
  const postFee = await postRegistry.postFee();

  console.log("Initial Total Posts:", totalPosts.toString());
  console.log("Post Creation Fee:", hre.ethers.utils.formatEther(postFee), "STT");

  console.log("\nAdd this to your .env.local file:");
  console.log(`NEXT_PUBLIC_POST_REGISTRY_ADDRESS=${postRegistry.address}`);

  console.log("\nContract ABI can be found at:");
  console.log("artifacts/contracts/PostRegistry.sol/PostRegistry.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });