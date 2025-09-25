// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IAdjudicator} from "./interfaces/IAdjudicator.sol";
import {IComparable} from "./interfaces/IComparable.sol";
import {Channel, State, StateIntent} from "./interfaces/Types.sol";
import {Utils} from "./Utils.sol";

/**
 * @title Adjudicator
 * @notice Simple adjudicator contract for Nitrolite state channels
 * @dev Validates state transitions and ensures state progression is valid
 */
contract Adjudicator is IAdjudicator, IComparable {
    using Utils for State;

    /**
     * @notice Adjudicate a state transition in a channel
     * @param channel The channel configuration
     * @param candidate The candidate state to validate
     * @param proofs Array of proof states (for more complex validation)
     * @return bool True if the state transition is valid
     */
    function adjudicate(Channel memory channel, State memory candidate, State[] memory proofs) external pure returns (bool) {
        // Basic validation - ensure state is properly formed
        if (candidate.allocations.length != 2) {
            return false;
        }

        // For INITIALIZE states, just validate basic structure
        if (candidate.intent == StateIntent.INITIALIZE) {
            return candidate.version == 0;
        }

        // For OPERATE states, version must be > 0
        if (candidate.intent == StateIntent.OPERATE) {
            return candidate.version > 0;
        }

        // For RESIZE states, version must be > 0
        if (candidate.intent == StateIntent.RESIZE) {
            return candidate.version > 0;
        }

        // For FINALIZE states, version must be > 0
        if (candidate.intent == StateIntent.FINALIZE) {
            return candidate.version > 0;
        }

        return false;
    }

    /**
     * @notice Compare two states to determine which is more recent
     * @param candidate The candidate state
     * @param previous The previous state to compare against
     * @return int8 Positive if candidate is more recent, zero if equal, negative if older
     */
    function compare(State memory candidate, State memory previous) external pure returns (int8) {
        if (candidate.version > previous.version) {
            return 1;
        } else if (candidate.version == previous.version) {
            return 0;
        } else {
            return -1;
        }
    }
}