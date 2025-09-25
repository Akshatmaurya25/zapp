// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Channel, State, ChannelStatus} from "./Types.sol";

interface IChannelReader {
    function getAccountsBalances(address[] calldata accounts, address[] calldata tokens)
        external
        view
        returns (uint256[][] memory);

    function getOpenChannels(address[] memory accounts) external view returns (bytes32[][] memory);

    function getChannelData(bytes32 channelId)
        external
        view
        returns (
            Channel memory channel,
            ChannelStatus status,
            address[] memory wallets,
            uint256 challengeExpiry,
            State memory lastValidState
        );

    function getChannelBalances(bytes32 channelId, address[] memory tokens)
        external
        view
        returns (uint256[] memory balances);
}