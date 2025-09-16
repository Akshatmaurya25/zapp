// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title PostRegistry
 * @dev Smart contract for storing post metadata on Somnia testnet
 * @notice This contract allows users to create posts with content stored on-chain
 */
contract PostRegistry is Ownable, ReentrancyGuard {

    // Counter for unique post IDs
    uint256 private _postIds;

    // Post storage fee (in wei)
    uint256 public postFee = 0.001 ether; // Very small fee for testnet

    // Maximum content length
    uint256 public constant MAX_CONTENT_LENGTH = 2000;

    // Post struct
    struct Post {
        uint256 id;
        address author;
        string content;
        string mediaIpfs;
        string gameCategory;
        uint256 timestamp;
        bool isDeleted;
        uint256 likesCount;
        uint256 commentsCount;
    }

    // Mappings
    mapping(uint256 => Post) public posts;
    mapping(address => uint256[]) public userPosts;
    mapping(uint256 => mapping(address => bool)) public postLikes;
    mapping(address => uint256) public userPostsCount;

    // Events
    event PostCreated(
        uint256 indexed postId,
        address indexed author,
        string content,
        string mediaIpfs,
        string gameCategory,
        uint256 timestamp
    );

    event PostDeleted(
        uint256 indexed postId,
        address indexed author
    );

    event PostLiked(
        uint256 indexed postId,
        address indexed liker
    );

    event PostUnliked(
        uint256 indexed postId,
        address indexed unliker
    );

    event FeeUpdated(uint256 oldFee, uint256 newFee);

    // Modifiers
    modifier validPost(uint256 _postId) {
        require(_postId > 0 && _postId <= _postIds, "Invalid post ID");
        require(!posts[_postId].isDeleted, "Post has been deleted");
        _;
    }

    modifier onlyAuthor(uint256 _postId) {
        require(posts[_postId].author == msg.sender, "Only author can perform this action");
        _;
    }

    /**
     * @dev Constructor sets the contract deployer as owner
     */
    constructor() {
        _postIds = 0;
    }

    /**
     * @dev Create a new post
     * @param _content The text content of the post
     * @param _mediaIpfs IPFS hash of media files (optional)
     * @param _gameCategory Category/game this post relates to
     */
    function createPost(
        string memory _content,
        string memory _mediaIpfs,
        string memory _gameCategory
    ) external payable nonReentrant {
        require(bytes(_content).length > 0, "Content cannot be empty");
        require(bytes(_content).length <= MAX_CONTENT_LENGTH, "Content too long");
        require(msg.value >= postFee, "Insufficient payment for post creation");

        _postIds++;
        uint256 newPostId = _postIds;

        posts[newPostId] = Post({
            id: newPostId,
            author: msg.sender,
            content: _content,
            mediaIpfs: _mediaIpfs,
            gameCategory: _gameCategory,
            timestamp: block.timestamp,
            isDeleted: false,
            likesCount: 0,
            commentsCount: 0
        });

        userPosts[msg.sender].push(newPostId);
        userPostsCount[msg.sender]++;

        emit PostCreated(
            newPostId,
            msg.sender,
            _content,
            _mediaIpfs,
            _gameCategory,
            block.timestamp
        );
    }

    /**
     * @dev Delete a post (only by author)
     * @param _postId ID of the post to delete
     */
    function deletePost(uint256 _postId)
        external
        validPost(_postId)
        onlyAuthor(_postId)
    {
        posts[_postId].isDeleted = true;
        userPostsCount[msg.sender]--;

        emit PostDeleted(_postId, msg.sender);
    }

    /**
     * @dev Like or unlike a post
     * @param _postId ID of the post to like/unlike
     */
    function toggleLike(uint256 _postId) external validPost(_postId) {
        require(posts[_postId].author != msg.sender, "Cannot like your own post");

        if (postLikes[_postId][msg.sender]) {
            // Unlike
            postLikes[_postId][msg.sender] = false;
            posts[_postId].likesCount--;
            emit PostUnliked(_postId, msg.sender);
        } else {
            // Like
            postLikes[_postId][msg.sender] = true;
            posts[_postId].likesCount++;
            emit PostLiked(_postId, msg.sender);
        }
    }

    /**
     * @dev Get post details
     * @param _postId ID of the post
     * @return Post struct
     */
    function getPost(uint256 _postId) external view validPost(_postId) returns (Post memory) {
        return posts[_postId];
    }

    /**
     * @dev Get posts by a specific user
     * @param _user Address of the user
     * @return Array of post IDs
     */
    function getUserPosts(address _user) external view returns (uint256[] memory) {
        return userPosts[_user];
    }

    /**
     * @dev Get total number of posts
     * @return Total post count
     */
    function getTotalPosts() external view returns (uint256) {
        return _postIds;
    }

    /**
     * @dev Check if user has liked a post
     * @param _postId ID of the post
     * @param _user Address of the user
     * @return Whether user has liked the post
     */
    function hasUserLikedPost(uint256 _postId, address _user) external view returns (bool) {
        return postLikes[_postId][_user];
    }

    /**
     * @dev Get recent posts (latest N posts)
     * @param _count Number of posts to retrieve
     * @return Array of post IDs (newest first)
     */
    function getRecentPosts(uint256 _count) external view returns (uint256[] memory) {
        uint256 totalPosts = _postIds;
        if (totalPosts == 0) {
            return new uint256[](0);
        }

        uint256 resultCount = _count > totalPosts ? totalPosts : _count;
        uint256[] memory result = new uint256[](resultCount);
        uint256 resultIndex = 0;

        // Start from the latest post and go backwards
        for (uint256 i = totalPosts; i >= 1 && resultIndex < resultCount; i--) {
            if (!posts[i].isDeleted) {
                result[resultIndex] = i;
                resultIndex++;
            }
        }

        // Resize array if we found fewer posts than requested
        if (resultIndex < resultCount) {
            uint256[] memory trimmedResult = new uint256[](resultIndex);
            for (uint256 i = 0; i < resultIndex; i++) {
                trimmedResult[i] = result[i];
            }
            return trimmedResult;
        }

        return result;
    }

    /**
     * @dev Update post creation fee (only owner)
     * @param _newFee New fee in wei
     */
    function setPostFee(uint256 _newFee) external onlyOwner {
        uint256 oldFee = postFee;
        postFee = _newFee;
        emit FeeUpdated(oldFee, _newFee);
    }

    /**
     * @dev Withdraw contract balance (only owner)
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @dev Get contract balance
     * @return Contract balance in wei
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Emergency function to pause certain functions if needed
     * This is a simple implementation - in production, consider using OpenZeppelin's Pausable
     */
    bool public paused = false;

    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
    }

    // Apply pause to critical functions
    function createPostWhenNotPaused(
        string memory _content,
        string memory _mediaIpfs,
        string memory _gameCategory
    ) external payable nonReentrant whenNotPaused {
        // This calls the original createPost function
        this.createPost(_content, _mediaIpfs, _gameCategory);
    }
}