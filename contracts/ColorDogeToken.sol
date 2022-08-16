// SPDX-License-Identifier: GPL-3.0

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

pragma solidity 0.8.9;

contract ColorDogeToken is ERC20 {
    address public immutable _owner;
    address private nftAddress;
    address private nftStakeAddress;

    constructor() ERC20("Color Doge Token", "CDTK") {
        _owner = msg.sender;
    }

    fallback() external payable {}

    receive() external payable {}
}
