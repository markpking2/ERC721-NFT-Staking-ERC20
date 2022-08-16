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

    function setNFTAddress(address _target) external {
        require(msg.sender == _owner, "not owner");
        require(_target != address(0), "0 address");
        nftAddress = _target;
    }

    function setNFTStakeAddress(address _target) external {
        require(msg.sender == _owner, "not owner");
        require(_target != address(0), "0 address");
        nftStakeAddress = _target;
    }

    function mint() external payable {
        uint toMint = msg.value * 1000; // 1000 tokens per ether
        require(toMint > 0, "must send at least 2000 wei");
        if(totalSupply() + toMint > 100_000_000 * 10**18){
            revert("Can't mint more than total supply.");
        }
        _mint(msg.sender, toMint);
    }

    function mint(address _to, uint _amount) public {
        require(msg.sender == nftStakeAddress, "not nft stake contract");
        _mint(_to, _amount);


    }

    function approveAllNFT(bool approve) external {
        require(address(nftAddress) != address(0), "NFT address not set");
        uint amount = approve == true ? type(uint).max : 0;
        _approve(msg.sender, nftAddress, amount);
    }

    function approveAllStake(bool approve) external {
        require(address(nftStakeAddress) != address(0), "Stake address not set");
        uint amount = approve == true ? type(uint).max : 0;
        _approve(msg.sender, nftStakeAddress, amount);
    }

    fallback() external payable {}

    receive() external payable {}
}