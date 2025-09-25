// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TestToken
 * @notice A test ERC20 token for Nitrolite state channels
 * @dev Mintable token with faucet functionality for testing
 */
contract TestToken is ERC20, Ownable {
    uint256 public constant FAUCET_AMOUNT = 1000 * 10**18; // 1000 tokens
    uint256 public constant FAUCET_COOLDOWN = 24 hours;

    mapping(address => uint256) public lastFaucetTime;

    event FaucetUsed(address indexed user, uint256 amount);

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        _transferOwnership(msg.sender);
        _mint(msg.sender, initialSupply * 10**decimals());
    }

    /**
     * @notice Mint tokens from faucet (testnet only)
     * @dev Users can get free tokens once per day
     */
    function faucet() external {
        require(
            block.timestamp >= lastFaucetTime[msg.sender] + FAUCET_COOLDOWN,
            "Faucet cooldown active"
        );

        lastFaucetTime[msg.sender] = block.timestamp;
        _mint(msg.sender, FAUCET_AMOUNT);

        emit FaucetUsed(msg.sender, FAUCET_AMOUNT);
    }

    /**
     * @notice Check if user can use faucet
     */
    function canUseFaucet(address user) external view returns (bool) {
        return block.timestamp >= lastFaucetTime[user] + FAUCET_COOLDOWN;
    }

    /**
     * @notice Time until user can use faucet again
     */
    function timeUntilFaucet(address user) external view returns (uint256) {
        uint256 nextFaucetTime = lastFaucetTime[user] + FAUCET_COOLDOWN;
        if (block.timestamp >= nextFaucetTime) {
            return 0;
        }
        return nextFaucetTime - block.timestamp;
    }

    /**
     * @notice Mint tokens to address (owner only)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @notice Burn tokens from address (owner only)
     */
    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }
}