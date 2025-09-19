// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract SkillRewards is ReentrancyGuard, Ownable, Pausable {
    struct Achievement {
        string gameId;
        string achievementId;
        uint256 rewardAmount;
        bool isActive;
        string title;
        string description;
        uint256 totalClaimed;
        uint256 claimCount;
    }

    struct UserAchievement {
        bool claimed;
        uint256 claimedAt;
        bytes32 proofHash;
    }

    mapping(bytes32 => Achievement) public achievements;
    mapping(address => mapping(bytes32 => UserAchievement)) public userAchievements;
    mapping(address => uint256) public userTotalRewards;
    mapping(address => uint256) public userAchievementCount;

    address public oracle;
    bytes32[] public achievementKeys;

    event AchievementAdded(
        bytes32 indexed achievementKey,
        string gameId,
        string achievementId,
        uint256 rewardAmount
    );

    event AchievementUnlocked(
        address indexed user,
        bytes32 indexed achievementKey,
        string gameId,
        string achievementId,
        uint256 rewardAmount,
        bytes32 proofHash
    );

    event AchievementUpdated(bytes32 indexed achievementKey, uint256 newRewardAmount, bool isActive);
    event OracleUpdated(address indexed newOracle);
    event RewardsFunded(uint256 amount);

    modifier onlyOracle() {
        require(msg.sender == oracle, "Only oracle can call this function");
        _;
    }

    constructor(address _oracle) {
        require(_oracle != address(0), "Invalid oracle address");
        oracle = _oracle;
    }

    function addAchievement(
        string memory gameId,
        string memory achievementId,
        uint256 rewardAmount,
        string memory title,
        string memory description
    ) external onlyOwner {
        require(bytes(gameId).length > 0, "Game ID required");
        require(bytes(achievementId).length > 0, "Achievement ID required");
        require(rewardAmount > 0, "Reward amount must be greater than 0");

        bytes32 achievementKey = keccak256(abi.encodePacked(gameId, achievementId));
        require(!achievements[achievementKey].isActive, "Achievement already exists");

        achievements[achievementKey] = Achievement({
            gameId: gameId,
            achievementId: achievementId,
            rewardAmount: rewardAmount,
            isActive: true,
            title: title,
            description: description,
            totalClaimed: 0,
            claimCount: 0
        });

        achievementKeys.push(achievementKey);

        emit AchievementAdded(achievementKey, gameId, achievementId, rewardAmount);
    }

    function verifyAchievement(
        address user,
        string memory gameId,
        string memory achievementId,
        bytes memory proof
    ) external onlyOracle nonReentrant whenNotPaused {
        require(user != address(0), "Invalid user address");

        bytes32 achievementKey = keccak256(abi.encodePacked(gameId, achievementId));
        Achievement storage achievement = achievements[achievementKey];

        require(achievement.isActive, "Achievement not active");
        require(!userAchievements[user][achievementKey].claimed, "Achievement already claimed");
        require(address(this).balance >= achievement.rewardAmount, "Insufficient contract balance");

        bytes32 proofHash = keccak256(proof);

        // Mark as claimed
        userAchievements[user][achievementKey] = UserAchievement({
            claimed: true,
            claimedAt: block.timestamp,
            proofHash: proofHash
        });

        // Update statistics
        achievement.totalClaimed += achievement.rewardAmount;
        achievement.claimCount += 1;
        userTotalRewards[user] += achievement.rewardAmount;
        userAchievementCount[user] += 1;

        // Transfer reward
        (bool success, ) = payable(user).call{value: achievement.rewardAmount}("");
        require(success, "Reward transfer failed");

        emit AchievementUnlocked(
            user,
            achievementKey,
            gameId,
            achievementId,
            achievement.rewardAmount,
            proofHash
        );
    }

    function updateAchievement(
        string memory gameId,
        string memory achievementId,
        uint256 newRewardAmount,
        bool isActive
    ) external onlyOwner {
        bytes32 achievementKey = keccak256(abi.encodePacked(gameId, achievementId));
        require(achievements[achievementKey].rewardAmount > 0, "Achievement does not exist");

        achievements[achievementKey].rewardAmount = newRewardAmount;
        achievements[achievementKey].isActive = isActive;

        emit AchievementUpdated(achievementKey, newRewardAmount, isActive);
    }

    function getAchievement(string memory gameId, string memory achievementId)
        external
        view
        returns (
            uint256 rewardAmount,
            bool isActive,
            string memory title,
            string memory description,
            uint256 totalClaimed,
            uint256 claimCount
        )
    {
        bytes32 achievementKey = keccak256(abi.encodePacked(gameId, achievementId));
        Achievement memory achievement = achievements[achievementKey];

        return (
            achievement.rewardAmount,
            achievement.isActive,
            achievement.title,
            achievement.description,
            achievement.totalClaimed,
            achievement.claimCount
        );
    }

    function getUserAchievement(
        address user,
        string memory gameId,
        string memory achievementId
    ) external view returns (
        bool claimed,
        uint256 claimedAt,
        bytes32 proofHash
    ) {
        bytes32 achievementKey = keccak256(abi.encodePacked(gameId, achievementId));
        UserAchievement memory userAchievement = userAchievements[user][achievementKey];

        return (userAchievement.claimed, userAchievement.claimedAt, userAchievement.proofHash);
    }

    function getUserStats(address user) external view returns (
        uint256 totalRewards,
        uint256 achievementCount
    ) {
        return (userTotalRewards[user], userAchievementCount[user]);
    }

    function getAllAchievements() external view returns (bytes32[] memory) {
        return achievementKeys;
    }

    function getAchievementCount() external view returns (uint256) {
        return achievementKeys.length;
    }

    function setOracle(address newOracle) external onlyOwner {
        require(newOracle != address(0), "Invalid oracle address");
        oracle = newOracle;
        emit OracleUpdated(newOracle);
    }

    function fundRewards() external payable onlyOwner {
        require(msg.value > 0, "Must send ETH to fund rewards");
        emit RewardsFunded(msg.value);
    }

    function withdrawFunds(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance");
        require(amount > 0, "Amount must be greater than 0");

        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Withdrawal failed");
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // Emergency function
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Emergency withdrawal failed");
    }

    // Fallback function to receive ETH
    receive() external payable {
        emit RewardsFunded(msg.value);
    }
}