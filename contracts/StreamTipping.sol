// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract StreamTipping is ReentrancyGuard, Ownable, Pausable {
    struct Tip {
        address tipper;
        address streamer;
        uint256 amount;
        string message;
        uint256 timestamp;
        string streamId;
    }

    struct StreamerStats {
        uint256 totalReceived;
        uint256 tipCount;
        uint256 lastTipTime;
    }

    mapping(address => uint256) public streamerEarnings;
    mapping(address => StreamerStats) public streamerStats;
    mapping(string => uint256) public streamTotals;

    Tip[] public tips;

    uint256 public platformFeePercent = 250; // 2.5%
    uint256 public constant MAX_FEE_PERCENT = 1000; // 10%
    uint256 public totalPlatformFees;

    event TipSent(
        address indexed tipper,
        address indexed streamer,
        uint256 amount,
        string message,
        string streamId,
        uint256 tipIndex
    );

    event EarningsWithdrawn(address indexed streamer, uint256 amount);
    event PlatformFeesWithdrawn(uint256 amount);
    event PlatformFeeUpdated(uint256 newFeePercent);

    constructor() {}

    function sendTip(
        address streamer,
        string memory message,
        string memory streamId
    ) external payable nonReentrant whenNotPaused {
        require(msg.value > 0, "Tip amount must be greater than 0");
        require(streamer != address(0), "Invalid streamer address");
        require(streamer != msg.sender, "Cannot tip yourself");
        require(bytes(streamId).length > 0, "Stream ID required");

        uint256 tipAmount = msg.value;
        uint256 platformFee = (tipAmount * platformFeePercent) / 10000;
        uint256 streamerAmount = tipAmount - platformFee;

        // Update streamer earnings and stats
        streamerEarnings[streamer] += streamerAmount;
        streamerStats[streamer].totalReceived += streamerAmount;
        streamerStats[streamer].tipCount += 1;
        streamerStats[streamer].lastTipTime = block.timestamp;

        // Update stream totals
        streamTotals[streamId] += streamerAmount;

        // Update platform fees
        totalPlatformFees += platformFee;

        // Store tip record
        tips.push(Tip({
            tipper: msg.sender,
            streamer: streamer,
            amount: streamerAmount,
            message: message,
            timestamp: block.timestamp,
            streamId: streamId
        }));

        emit TipSent(
            msg.sender,
            streamer,
            streamerAmount,
            message,
            streamId,
            tips.length - 1
        );
    }

    function withdrawEarnings() external nonReentrant {
        uint256 amount = streamerEarnings[msg.sender];
        require(amount > 0, "No earnings to withdraw");

        streamerEarnings[msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Withdrawal failed");

        emit EarningsWithdrawn(msg.sender, amount);
    }

    function getStreamerEarnings(address streamer) external view returns (uint256) {
        return streamerEarnings[streamer];
    }

    function getStreamerStats(address streamer) external view returns (
        uint256 totalReceived,
        uint256 tipCount,
        uint256 lastTipTime
    ) {
        StreamerStats memory stats = streamerStats[streamer];
        return (stats.totalReceived, stats.tipCount, stats.lastTipTime);
    }

    function getStreamTotal(string memory streamId) external view returns (uint256) {
        return streamTotals[streamId];
    }

    function getTipsCount() external view returns (uint256) {
        return tips.length;
    }

    function getTip(uint256 index) external view returns (
        address tipper,
        address streamer,
        uint256 amount,
        string memory message,
        uint256 timestamp,
        string memory streamId
    ) {
        require(index < tips.length, "Tip index out of bounds");
        Tip memory tip = tips[index];
        return (tip.tipper, tip.streamer, tip.amount, tip.message, tip.timestamp, tip.streamId);
    }

    function getRecentTips(uint256 count) external view returns (Tip[] memory) {
        uint256 totalTips = tips.length;
        if (totalTips == 0) {
            return new Tip[](0);
        }

        uint256 returnCount = count > totalTips ? totalTips : count;
        Tip[] memory recentTips = new Tip[](returnCount);

        for (uint256 i = 0; i < returnCount; i++) {
            recentTips[i] = tips[totalTips - 1 - i];
        }

        return recentTips;
    }

    // Owner functions
    function setPlatformFee(uint256 newFeePercent) external onlyOwner {
        require(newFeePercent <= MAX_FEE_PERCENT, "Fee too high");
        platformFeePercent = newFeePercent;
        emit PlatformFeeUpdated(newFeePercent);
    }

    function withdrawPlatformFees() external onlyOwner {
        uint256 amount = totalPlatformFees;
        require(amount > 0, "No platform fees to withdraw");

        totalPlatformFees = 0;

        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Platform fee withdrawal failed");

        emit PlatformFeesWithdrawn(amount);
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
}