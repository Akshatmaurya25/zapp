// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Channel, State} from "./Types.sol";

interface IChannel {
    event Created(bytes32 indexed channelId, address indexed creator, Channel channel, State initialState);
    event Joined(bytes32 indexed channelId, uint256 indexed participantIndex);
    event Opened(bytes32 indexed channelId);
    event Closed(bytes32 indexed channelId, State finalState);
    event Challenged(bytes32 indexed channelId, State challengeState, uint256 challengeExpiry);
    event Checkpointed(bytes32 indexed channelId, State newState);
    event Resized(bytes32 indexed channelId, int256[] resizeAmounts);

    function create(Channel calldata channel, State calldata initial) external returns (bytes32 channelId);
    function join(bytes32 channelId, uint256 index, bytes calldata sig) external returns (bytes32);
    function close(bytes32 channelId, State calldata candidate, State[] calldata proofs) external;
    function challenge(bytes32 channelId, State calldata candidate, State[] calldata proofs, bytes calldata challengerSig) external;
    function checkpoint(bytes32 channelId, State calldata candidate, State[] calldata proofs) external;
    function resize(bytes32 channelId, State calldata candidate, State[] calldata proofs) external;
}