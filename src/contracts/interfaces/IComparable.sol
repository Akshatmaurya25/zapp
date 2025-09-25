// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {State} from "./Types.sol";

interface IComparable {
    function compare(State memory candidate, State memory previous) external view returns (int8);
}