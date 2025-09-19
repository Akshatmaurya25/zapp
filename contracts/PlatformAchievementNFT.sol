// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title PlatformAchievementNFT
 * @dev NFT contract for gaming platform achievements with comprehensive features
 */
contract PlatformAchievementNFT is ERC721URIStorage, Ownable, ReentrancyGuard, Pausable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Achievement categories
    enum AchievementCategory {
        JOURNEY,    // Onboarding & First Experiences
        CREATOR,    // Posting & Content Creation
        SOCIAL,     // Community Interaction
        LOYALTY,    // Long-term Engagement
        GAMING,     // Gaming-Focused Achievements
        SPECIAL     // Rare & Exclusive
    }

    // Rarity levels
    enum RarityLevel {
        COMMON,     // 1
        UNCOMMON,   // 2
        RARE,       // 3
        EPIC,       // 4
        LEGENDARY   // 5
    }

    struct Achievement {
        AchievementCategory category;
        RarityLevel rarity;
        string name;
        string description;
        uint256 mintedAt;
        address originalOwner;
        bool isLimitedEdition;
        uint256 serialNumber; // For limited editions
    }

    // Storage mappings
    mapping(uint256 => Achievement) public achievements;
    mapping(address => uint256[]) public userAchievements;
    mapping(string => mapping(address => bool)) public userAchievementNames; // Prevent duplicate achievements per user
    mapping(string => uint256) public achievementTypeCount; // Track total minted per achievement type
    mapping(string => uint256) public limitedEditionMax; // Max supply for limited editions

    // Platform settings
    address public platformTreasury;
    uint256 public mintingFee = 0; // No fee initially, can be set later
    bool public publicMintingEnabled = false; // Only platform can mint initially

    // Events
    event AchievementMinted(
        address indexed user,
        uint256 indexed tokenId,
        AchievementCategory indexed category,
        string name,
        RarityLevel rarity,
        uint256 serialNumber
    );

    event AchievementTypeRegistered(
        string indexed achievementName,
        AchievementCategory category,
        RarityLevel rarity,
        bool isLimitedEdition,
        uint256 maxSupply
    );

    event PlatformTreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event MintingFeeUpdated(uint256 oldFee, uint256 newFee);

    constructor(
        address _platformTreasury
    ) ERC721("Gaming Platform Achievement NFT", "GPA") {
        platformTreasury = _platformTreasury;
    }

    /**
     * @dev Mint achievement NFT (only owner/platform can call)
     */
    function mintAchievement(
        address user,
        string memory achievementName,
        string memory description,
        AchievementCategory category,
        RarityLevel rarity,
        string memory metadataURI,
        bool isLimitedEdition
    ) external onlyOwner nonReentrant whenNotPaused returns (uint256) {
        return _mintAchievement(user, achievementName, description, category, rarity, metadataURI, isLimitedEdition);
    }

    /**
     * @dev Internal mint function
     */
    function _mintAchievement(
        address user,
        string memory achievementName,
        string memory description,
        AchievementCategory category,
        RarityLevel rarity,
        string memory metadataURI,
        bool isLimitedEdition
    ) internal returns (uint256) {
        require(user != address(0), "Invalid user address");
        require(bytes(achievementName).length > 0, "Achievement name required");
        require(bytes(metadataURI).length > 0, "Metadata URI required");

        // Check if user already has this achievement
        require(
            !userAchievementNames[achievementName][user],
            "User already has this achievement"
        );

        // Check limited edition constraints
        if (isLimitedEdition) {
            uint256 maxSupply = limitedEditionMax[achievementName];
            require(maxSupply > 0, "Limited edition not registered");
            require(
                achievementTypeCount[achievementName] < maxSupply,
                "Limited edition supply exhausted"
            );
        }

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        // Mint the NFT
        _mint(user, newTokenId);
        _setTokenURI(newTokenId, metadataURI);

        // Set achievement data
        uint256 serialNumber = achievementTypeCount[achievementName] + 1;
        achievements[newTokenId] = Achievement({
            category: category,
            rarity: rarity,
            name: achievementName,
            description: description,
            mintedAt: block.timestamp,
            originalOwner: user,
            isLimitedEdition: isLimitedEdition,
            serialNumber: serialNumber
        });

        // Update tracking
        userAchievements[user].push(newTokenId);
        userAchievementNames[achievementName][user] = true;
        achievementTypeCount[achievementName] = serialNumber;

        emit AchievementMinted(
            user,
            newTokenId,
            category,
            achievementName,
            rarity,
            serialNumber
        );

        return newTokenId;
    }

    /**
     * @dev Batch mint multiple achievements for a user
     */
    function batchMintAchievements(
        address user,
        string[] memory achievementNames,
        string[] memory descriptions,
        AchievementCategory[] memory categories,
        RarityLevel[] memory rarities,
        string[] memory metadataURIs,
        bool[] memory isLimitedEditions
    ) external onlyOwner nonReentrant whenNotPaused returns (uint256[] memory) {
        require(
            achievementNames.length == descriptions.length &&
            descriptions.length == categories.length &&
            categories.length == rarities.length &&
            rarities.length == metadataURIs.length &&
            metadataURIs.length == isLimitedEditions.length,
            "Array length mismatch"
        );

        uint256[] memory tokenIds = new uint256[](achievementNames.length);

        for (uint256 i = 0; i < achievementNames.length; i++) {
            tokenIds[i] = _mintAchievement(
                user,
                achievementNames[i],
                descriptions[i],
                categories[i],
                rarities[i],
                metadataURIs[i],
                isLimitedEditions[i]
            );
        }

        return tokenIds;
    }

    /**
     * @dev Register a new achievement type with limited edition settings
     */
    function registerAchievementType(
        string memory achievementName,
        AchievementCategory category,
        RarityLevel rarity,
        bool isLimitedEdition,
        uint256 maxSupply
    ) external onlyOwner {
        require(bytes(achievementName).length > 0, "Achievement name required");

        if (isLimitedEdition) {
            require(maxSupply > 0, "Max supply must be greater than 0");
            limitedEditionMax[achievementName] = maxSupply;
        }

        emit AchievementTypeRegistered(
            achievementName,
            category,
            rarity,
            isLimitedEdition,
            maxSupply
        );
    }

    /**
     * @dev Get all achievements owned by a user
     */
    function getUserAchievements(address user) external view returns (uint256[] memory) {
        return userAchievements[user];
    }

    /**
     * @dev Get achievements by category
     */
    function getAchievementsByCategory(AchievementCategory category)
        external
        view
        returns (uint256[] memory)
    {
        uint256 currentSupply = _tokenIds.current();
        uint256[] memory result = new uint256[](currentSupply);
        uint256 counter = 0;

        for (uint256 i = 1; i <= currentSupply; i++) {
            if (_exists(i) && achievements[i].category == category) {
                result[counter] = i;
                counter++;
            }
        }

        // Resize array to actual length
        uint256[] memory trimmedResult = new uint256[](counter);
        for (uint256 i = 0; i < counter; i++) {
            trimmedResult[i] = result[i];
        }

        return trimmedResult;
    }

    /**
     * @dev Get achievements by rarity
     */
    function getAchievementsByRarity(RarityLevel rarity)
        external
        view
        returns (uint256[] memory)
    {
        uint256 currentSupply = _tokenIds.current();
        uint256[] memory result = new uint256[](currentSupply);
        uint256 counter = 0;

        for (uint256 i = 1; i <= currentSupply; i++) {
            if (_exists(i) && achievements[i].rarity == rarity) {
                result[counter] = i;
                counter++;
            }
        }

        // Resize array to actual length
        uint256[] memory trimmedResult = new uint256[](counter);
        for (uint256 i = 0; i < counter; i++) {
            trimmedResult[i] = result[i];
        }

        return trimmedResult;
    }

    /**
     * @dev Get achievement statistics
     */
    function getAchievementStats(string memory achievementName)
        external
        view
        returns (uint256 totalMinted, uint256 maxSupply, bool isLimitedEdition)
    {
        totalMinted = achievementTypeCount[achievementName];
        maxSupply = limitedEditionMax[achievementName];
        isLimitedEdition = maxSupply > 0;
    }

    /**
     * @dev Check if user has specific achievement
     */
    function hasAchievement(address user, string memory achievementName)
        external
        view
        returns (bool)
    {
        return userAchievementNames[achievementName][user];
    }

    /**
     * @dev Get total supply of minted tokens
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIds.current();
    }

    /**
     * @dev Update platform treasury address
     */
    function setPlatformTreasury(address _platformTreasury) external onlyOwner {
        require(_platformTreasury != address(0), "Invalid treasury address");
        address oldTreasury = platformTreasury;
        platformTreasury = _platformTreasury;
        emit PlatformTreasuryUpdated(oldTreasury, _platformTreasury);
    }

    /**
     * @dev Update minting fee
     */
    function setMintingFee(uint256 _mintingFee) external onlyOwner {
        uint256 oldFee = mintingFee;
        mintingFee = _mintingFee;
        emit MintingFeeUpdated(oldFee, _mintingFee);
    }

    /**
     * @dev Enable/disable public minting
     */
    function setPublicMintingEnabled(bool _enabled) external onlyOwner {
        publicMintingEnabled = _enabled;
    }

    /**
     * @dev Pause contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Withdraw contract balance to treasury
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success, ) = platformTreasury.call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @dev Override _beforeTokenTransfer to include pause functionality
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        require(!paused(), "Contract is paused");
    }

    /**
     * @dev Override supportsInterface for ERC721URIStorage
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}