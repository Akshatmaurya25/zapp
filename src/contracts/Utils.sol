// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {IERC1271} from "@openzeppelin/contracts/interfaces/IERC1271.sol";
import {Channel, State, StateIntent} from "./interfaces/Types.sol";

library Utils {
    using ECDSA for bytes32;

    bytes32 public constant STATE_TYPEHASH = keccak256(
        "State(uint8 intent,uint256 version,bytes data,Allocation[] allocations)Allocation(address destination,address token,uint256 amount)"
    );

    function getChannelId(Channel memory channel) internal pure returns (bytes32) {
        return keccak256(abi.encode(channel));
    }

    function getPackedState(bytes32 channelId, State memory state) internal pure returns (bytes memory) {
        return abi.encodePacked(channelId, uint8(state.intent), state.version, state.data, abi.encode(state.allocations));
    }

    function statesAreEqual(State memory a, State memory b) internal pure returns (bool) {
        if (a.intent != b.intent || a.version != b.version) {
            return false;
        }

        if (keccak256(a.data) != keccak256(b.data)) {
            return false;
        }

        if (a.allocations.length != b.allocations.length) {
            return false;
        }

        for (uint256 i = 0; i < a.allocations.length; i++) {
            if (a.allocations[i].destination != b.allocations[i].destination ||
                a.allocations[i].token != b.allocations[i].token ||
                a.allocations[i].amount != b.allocations[i].amount) {
                return false;
            }
        }

        return true;
    }

    function verifyStateSignature(
        State memory state,
        bytes32 channelId,
        bytes32 domainSeparator,
        bytes memory signature,
        address signer
    ) internal view returns (bool) {
        // Try EIP-712 first
        bytes32 structHash = keccak256(abi.encode(STATE_TYPEHASH, uint8(state.intent), state.version, keccak256(state.data), keccak256(abi.encode(state.allocations))));
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash));

        if (signer.code.length > 0) {
            // Smart contract wallet - use ERC-1271
            return isValidERC1271Signature(digest, signature, signer);
        } else {
            // EOA - try different signature formats
            address recovered = digest.recover(signature);
            if (recovered == signer) {
                return true;
            }

            // Try EIP-191 format
            bytes memory packedState = getPackedState(channelId, state);
            digest = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n", bytes(packedState).length, packedState));
            recovered = digest.recover(signature);
            if (recovered == signer) {
                return true;
            }

            // Try raw ECDSA
            digest = keccak256(packedState);
            recovered = digest.recover(signature);
            return recovered == signer;
        }
    }

    function recoverRawECDSASigner(bytes memory data, bytes memory signature) internal pure returns (address) {
        bytes32 hash = keccak256(data);
        return hash.recover(signature);
    }

    function recoverEIP191Signer(bytes memory data, bytes memory signature) internal pure returns (address) {
        bytes32 hash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n", data.length, data));
        return hash.recover(signature);
    }

    function recoverStateEIP712Signer(
        bytes32 domainSeparator,
        bytes32 typeHash,
        bytes32 channelId,
        State memory state,
        bytes memory signature
    ) internal pure returns (address) {
        bytes32 structHash = keccak256(abi.encode(typeHash, channelId, uint8(state.intent), state.version, keccak256(state.data), keccak256(abi.encode(state.allocations))));
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash));
        return digest.recover(signature);
    }

    function isValidERC1271Signature(bytes32 hash, bytes memory signature, address signer) internal view returns (bool) {
        try IERC1271(signer).isValidSignature(hash, signature) returns (bytes4 result) {
            return result == IERC1271.isValidSignature.selector;
        } catch {
            return false;
        }
    }
}