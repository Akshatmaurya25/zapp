// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IDeposit {
    event Deposited(address indexed account, address indexed token, uint256 amount);
    event Withdrawn(address indexed account, address indexed token, uint256 amount);

    function deposit(address account, address token, uint256 amount) external payable;
    function withdraw(address token, uint256 amount) external;
}