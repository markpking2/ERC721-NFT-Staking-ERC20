// SPDX-License-Identifier: GPL-3.0

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

pragma solidity 0.8.9;

contract ColorDogeToken is ERC20 {
    address immutable public _owner;
    address private nftAddress;
    address private nftStakeAddress;

    constructor() ERC20("Color Doge Token", "CDTK"){
        _owner = msg.sender;
    }

    function mint() external payable {
        uint toMint = msg.value * 1000; // 1000 tokens per ether
        require(toMint > 0, "must send at least 2000 wei");
        if(totalSupply() + toMint > 100_000_000 * 10**18){
            revert("Can't mint more than total supply.");
        }
        _mint(msg.sender, toMint);
    }

    fallback() external payable {}

    receive() external payable {}
}