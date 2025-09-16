// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SimplePostRegistry
 * @dev A minimal smart contract for storing post metadata on Somnia testnet
 */
contract SimplePostRegistry {

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

    // State variables
    mapping(uint256 => Post) public posts;
    mapping(uint256 => mapping(address => bool)) public postLikes;
    mapping(address => uint256[]) public userPosts;

    uint256 private _postIds = 0;
    uint256 public postFee = 0.001 ether;
    address public owner;

    // Events
    event PostCreated(
        uint256 indexed postId,
        address indexed author,
        string content
    );

    event PostLiked(
        uint256 indexed postId,
        address indexed liker
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Create a new post
     */
    function createPost(
        string memory _content,
        string memory _mediaIpfs,
        string memory _gameCategory
    ) external payable {
        require(bytes(_content).length > 0, "Content cannot be empty");
        require(bytes(_content).length <= 2000, "Content too long");
        require(msg.value >= postFee, "Insufficient payment");

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

        emit PostCreated(newPostId, msg.sender, _content);
    }

    /**
     * @dev Toggle like on a post
     */
    function toggleLike(uint256 _postId) external {
        require(_postId > 0 && _postId <= _postIds, "Invalid post ID");
        require(!posts[_postId].isDeleted, "Post has been deleted");

        if (postLikes[_postId][msg.sender]) {
            postLikes[_postId][msg.sender] = false;
            posts[_postId].likesCount--;
        } else {
            postLikes[_postId][msg.sender] = true;
            posts[_postId].likesCount++;
        }

        emit PostLiked(_postId, msg.sender);
    }

    /**
     * @dev Get post details
     */
    function getPost(uint256 _postId) external view returns (Post memory) {
        require(_postId > 0 && _postId <= _postIds, "Invalid post ID");
        return posts[_postId];
    }

    /**
     * @dev Get total number of posts
     */
    function getTotalPosts() external view returns (uint256) {
        return _postIds;
    }

    /**
     * @dev Get recent posts
     */
    function getRecentPosts(uint256 _count) external view returns (uint256[] memory) {
        uint256 totalPosts = _postIds;
        if (totalPosts == 0) {
            return new uint256[](0);
        }

        uint256 resultCount = _count > totalPosts ? totalPosts : _count;
        uint256[] memory result = new uint256[](resultCount);
        uint256 resultIndex = 0;

        for (uint256 i = totalPosts; i >= 1 && resultIndex < resultCount; i--) {
            if (!posts[i].isDeleted) {
                result[resultIndex] = i;
                resultIndex++;
            }
        }

        // Resize array if needed
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
     * @dev Get user posts
     */
    function getUserPosts(address _user) external view returns (uint256[] memory) {
        return userPosts[_user];
    }

    /**
     * @dev Check if user liked a post
     */
    function hasUserLikedPost(uint256 _postId, address _user) external view returns (bool) {
        return postLikes[_postId][_user];
    }

    /**
     * @dev Update post fee (owner only)
     */
    function setPostFee(uint256 _newFee) external onlyOwner {
        postFee = _newFee;
    }

    /**
     * @dev Withdraw contract balance (owner only)
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
}