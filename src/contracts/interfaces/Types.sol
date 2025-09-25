// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

enum ChannelStatus {
    VOID,
    INITIAL,
    ACTIVE,
    DISPUTE,
    FINAL
}

enum StateIntent {
    INITIALIZE,
    OPERATE,
    RESIZE,
    FINALIZE
}

struct Amount {
    address token;
    uint256 amount;
}

struct Allocation {
    address destination;
    address token;
    uint256 amount;
}

struct State {
    StateIntent intent;
    uint256 version;
    bytes data;
    Allocation[] allocations;
    bytes[] sigs;
}

struct Channel {
    address[] participants;
    address adjudicator;
    uint256 challenge;
    uint256 nonce;
}