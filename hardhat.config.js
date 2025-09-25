require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env.local" });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.26",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    "somnia-testnet": {
      url: "https://dream-rpc.somnia.network/",
      chainId: 50312,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 20000000000, // 20 gwei
      gas: 2100000,
      confirmations: 6,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
    "somnia-mainnet": {
      url: "https://api.infra.mainnet.somnia.network/",
      chainId: 5031,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 20000000000, // 20 gwei
      gas: 2100000,
      confirmations: 6,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
    // Base Networks for State Channels
    "base-sepolia": {
      url: "https://sepolia.base.org",
      chainId: 84532,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 1000000000, // 1 gwei - Base is much cheaper
      gas: 2100000,
      confirmations: 1,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
    "base-mainnet": {
      url: "https://mainnet.base.org",
      chainId: 8453,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 1000000000, // 1 gwei - Base is much cheaper
      gas: 2100000,
      confirmations: 1,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
  },
  etherscan: {
    apiKey: {
      "somnia-testnet": "your-api-key-here", // If verification is supported
      "base-sepolia": process.env.BASESCAN_API_KEY || "your-basescan-api-key-here",
      "base-mainnet": process.env.BASESCAN_API_KEY || "your-basescan-api-key-here",
    },
    customChains: [
      {
        network: "somnia-testnet",
        chainId: 50312,
        urls: {
          apiURL: "https://shannon-explorer.somnia.network/api",
          browserURL: "https://shannon-explorer.somnia.network/",
        },
      },
      {
        network: "base-sepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org/",
        },
      },
      {
        network: "base-mainnet",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org/",
        },
      },
    ],
  },
  paths: {
    sources: "./src/contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 40000,
  },
};