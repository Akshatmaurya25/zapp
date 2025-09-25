// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Channel, State} from "./Types.sol";

interface IAdjudicator {
    function adjudicate(Channel memory channel, State memory candidate, State[] memory proofs) external returns (bool);
}