// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
// Note: MessageHashUtils may not be available in older OpenZeppelin versions
// We'll implement toEthSignedMessageHash manually if needed
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title BaseStateChannel
 * @dev Simplified state channels for instant tipping on Base
 * @author Somnia DApp Team
 */
contract BaseStateChannel is ReentrancyGuard {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;

    // Structs
    struct Channel {
        address viewer;      // User who tips
        address streamer;    // User who receives tips
        uint256 deposit;     // Initial deposit by viewer
        uint256 totalTipped; // Total amount tipped in channel
        uint256 nonce;       // Prevents replay attacks
        uint256 timeout;     // Challenge period timeout
        bool isActive;       // Channel status
        bool disputed;       // Dispute flag
    }

    struct State {
        bytes32 channelId;
        uint256 totalTipped;
        uint256 nonce;
        bytes signature;     // Off-chain signature from both parties
    }

    // State variables
    IERC20 public immutable token;
    uint256 public constant CHALLENGE_PERIOD = 1 hours;
    uint256 public constant MIN_DEPOSIT = 1e6; // 1 USDC minimum

    mapping(bytes32 => Channel) public channels;
    mapping(bytes32 => uint256) public challengeDeadlines;

    // Events
    event ChannelOpened(bytes32 indexed channelId, address indexed viewer, address indexed streamer, uint256 deposit);
    event ChannelClosed(bytes32 indexed channelId, uint256 totalTipped, address indexed viewer, address indexed streamer);
    event ChannelChallenged(bytes32 indexed channelId, uint256 deadline);
    event InstantTip(bytes32 indexed channelId, address indexed viewer, address indexed streamer, uint256 amount, uint256 totalTipped);
    event ChannelSettled(bytes32 indexed channelId, uint256 viewerAmount, uint256 streamerAmount);

    constructor(address _token) {
        require(_token != address(0), "Invalid token address");
        token = IERC20(_token);
    }

    /**
     * @dev Generate channel ID from viewer and streamer addresses
     */
    function getChannelId(address viewer, address streamer) public view returns (bytes32) {
        return keccak256(abi.encodePacked(viewer, streamer, block.chainid));
    }

    /**
     * @dev Open a new state channel for tipping
     */
    function openChannel(address streamer, uint256 deposit) external nonReentrant {
        require(streamer != address(0), "Invalid streamer address");
        require(streamer != msg.sender, "Cannot tip yourself");
        require(deposit >= MIN_DEPOSIT, "Deposit too small");

        bytes32 channelId = getChannelId(msg.sender, streamer);
        require(!channels[channelId].isActive, "Channel already exists");

        // Transfer deposit to contract
        token.safeTransferFrom(msg.sender, address(this), deposit);

        // Create channel
        channels[channelId] = Channel({
            viewer: msg.sender,
            streamer: streamer,
            deposit: deposit,
            totalTipped: 0,
            nonce: 0,
            timeout: 0,
            isActive: true,
            disputed: false
        });

        emit ChannelOpened(channelId, msg.sender, streamer, deposit);
    }

    /**
     * @dev Close channel cooperatively with final state
     */
    function closeChannel(
        bytes32 channelId,
        uint256 totalTipped,
        uint256 nonce,
        bytes memory viewerSignature,
        bytes memory streamerSignature
    ) external nonReentrant {
        Channel storage channel = channels[channelId];
        require(channel.isActive, "Channel not active");
        require(totalTipped <= channel.deposit, "Invalid tip amount");
        require(nonce > channel.nonce, "Invalid nonce");

        // Verify signatures
        bytes32 messageHash = keccak256(abi.encodePacked(channelId, totalTipped, nonce, address(this)));
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));

        address recoveredViewer = ethSignedMessageHash.recover(viewerSignature);
        address recoveredStreamer = ethSignedMessageHash.recover(streamerSignature);

        require(recoveredViewer == channel.viewer, "Invalid viewer signature");
        require(recoveredStreamer == channel.streamer, "Invalid streamer signature");

        // Update channel state
        channel.totalTipped = totalTipped;
        channel.nonce = nonce;
        channel.isActive = false;

        // Calculate final amounts
        uint256 streamerAmount = totalTipped;
        uint256 viewerAmount = channel.deposit - totalTipped;

        // Transfer tokens
        if (streamerAmount > 0) {
            token.safeTransfer(channel.streamer, streamerAmount);
        }
        if (viewerAmount > 0) {
            token.safeTransfer(channel.viewer, viewerAmount);
        }

        emit ChannelClosed(channelId, totalTipped, channel.viewer, channel.streamer);
        emit ChannelSettled(channelId, viewerAmount, streamerAmount);
    }

    /**
     * @dev Challenge a channel state (dispute resolution)
     */
    function challengeChannel(
        bytes32 channelId,
        uint256 totalTipped,
        uint256 nonce,
        bytes memory signature
    ) external {
        Channel storage channel = channels[channelId];
        require(channel.isActive, "Channel not active");
        require(msg.sender == channel.viewer || msg.sender == channel.streamer, "Not authorized");
        require(totalTipped <= channel.deposit, "Invalid tip amount");
        require(nonce > channel.nonce, "Invalid nonce");

        // Verify signature from the other party
        bytes32 messageHash = keccak256(abi.encodePacked(channelId, totalTipped, nonce, address(this)));
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        address signer = ethSignedMessageHash.recover(signature);

        address expectedSigner = (msg.sender == channel.viewer) ? channel.streamer : channel.viewer;
        require(signer == expectedSigner, "Invalid signature");

        // Update state and start challenge period
        channel.totalTipped = totalTipped;
        channel.nonce = nonce;
        channel.disputed = true;
        challengeDeadlines[channelId] = block.timestamp + CHALLENGE_PERIOD;

        emit ChannelChallenged(channelId, challengeDeadlines[channelId]);
    }

    /**
     * @dev Settle a disputed channel after challenge period
     */
    function settleChannel(bytes32 channelId) external nonReentrant {
        Channel storage channel = channels[channelId];
        require(channel.isActive, "Channel not active");
        require(channel.disputed, "Channel not disputed");
        require(block.timestamp > challengeDeadlines[channelId], "Challenge period not over");

        channel.isActive = false;

        // Calculate final amounts
        uint256 streamerAmount = channel.totalTipped;
        uint256 viewerAmount = channel.deposit - channel.totalTipped;

        // Transfer tokens
        if (streamerAmount > 0) {
            token.safeTransfer(channel.streamer, streamerAmount);
        }
        if (viewerAmount > 0) {
            token.safeTransfer(channel.viewer, viewerAmount);
        }

        emit ChannelClosed(channelId, channel.totalTipped, channel.viewer, channel.streamer);
        emit ChannelSettled(channelId, viewerAmount, streamerAmount);
    }

    /**
     * @dev Force close channel (emergency exit after timeout)
     */
    function forceCloseChannel(bytes32 channelId) external nonReentrant {
        Channel storage channel = channels[channelId];
        require(channel.isActive, "Channel not active");
        require(msg.sender == channel.viewer || msg.sender == channel.streamer, "Not authorized");

        // Only allow force close if channel has been inactive for too long
        require(block.timestamp > channel.timeout + CHALLENGE_PERIOD, "Cannot force close yet");

        channel.isActive = false;

        // In force close, return all funds to viewer (penalty for streamer not responding)
        uint256 viewerAmount = channel.deposit;
        token.safeTransfer(channel.viewer, viewerAmount);

        emit ChannelClosed(channelId, 0, channel.viewer, channel.streamer);
        emit ChannelSettled(channelId, viewerAmount, 0);
    }

    /**
     * @dev Submit an instant tip (off-chain, for events only)
     * This doesn't actually transfer tokens, just emits events for UI
     */
    function submitInstantTip(
        bytes32 channelId,
        uint256 tipAmount,
        uint256 newTotal,
        uint256 nonce,
        bytes memory signature
    ) external {
        Channel storage channel = channels[channelId];
        require(channel.isActive, "Channel not active");
        require(msg.sender == channel.viewer, "Only viewer can tip");
        require(newTotal <= channel.deposit, "Insufficient funds");
        require(nonce > channel.nonce, "Invalid nonce");

        // Verify streamer's signature on the new state
        bytes32 messageHash = keccak256(abi.encodePacked(channelId, newTotal, nonce, address(this)));
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        address signer = ethSignedMessageHash.recover(signature);
        require(signer == channel.streamer, "Invalid streamer signature");

        // Update nonce to prevent replay (optional, for security)
        if (nonce > channel.nonce) {
            channel.nonce = nonce;
        }

        emit InstantTip(channelId, channel.viewer, channel.streamer, tipAmount, newTotal);
    }

    /**
     * @dev Get channel information
     */
    function getChannel(bytes32 channelId) external view returns (Channel memory) {
        return channels[channelId];
    }

    /**
     * @dev Check if channel exists and is active
     */
    function isChannelActive(bytes32 channelId) external view returns (bool) {
        return channels[channelId].isActive;
    }

    /**
     * @dev Get remaining balance in channel for viewer
     */
    function getChannelBalance(bytes32 channelId) external view returns (uint256) {
        Channel memory channel = channels[channelId];
        if (!channel.isActive) return 0;
        return channel.deposit - channel.totalTipped;
    }
}