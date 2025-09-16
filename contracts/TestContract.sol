// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title TestContract
 * @dev A minimal contract for testing deployment
 */
contract TestContract {
    uint256 public value;
    address public owner;

    constructor() {
        owner = msg.sender;
        value = 42;
    }

    function setValue(uint256 _value) external {
        value = _value;
    }

    function getValue() external view returns (uint256) {
        return value;
    }
}