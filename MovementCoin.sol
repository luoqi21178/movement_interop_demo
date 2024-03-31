// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract MovementCoin {
    address private _delegate = 0x0000000000000000000000000000000000000101;

    /**
     * @dev See {IERC20-balanceOf}.
     */
    function balanceOf(address account) public view virtual returns (uint256) {
        bytes memory params = abi.encodeWithSignature("callMovementToken(bytes)", abi.encode(1, account));
        bytes memory data = abi.encodeWithSignature("callMove(bytes)", params);
        (, bytes memory res) = _delegate.staticcall(data);
        (uint balance) = abi.decode(res, (uint));
        return balance;
    }

    /**
     * @dev See {IERC20-transfer}.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     * - the caller must have a balance of at least `value`.
     */
    function transfer(address to, uint256 value) public virtual returns (bool) {
        bytes memory params = abi.encodeWithSignature("callMovementToken(bytes)", abi.encode(5, msg.sender, to, value));
        bytes memory data = abi.encodeWithSignature("callMove(bytes)", params);
        (bool success, ) = _delegate.call(data);
        require(success, "call failed");
        return true;
    }
}