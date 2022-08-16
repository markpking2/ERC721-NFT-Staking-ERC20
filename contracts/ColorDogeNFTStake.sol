// SPDX-License-Identifier: GPL-3.0

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./ColorDogeToken.sol";
import "./ColorDogeNFT.sol";

pragma solidity 0.8.9;

interface IColorDogeToken {
    function mint(address _to, uint256 _amount) external;

    function transfer(address _to, uint256 amount) external;

    function totalSupply() external returns (uint256);
}

contract ColorDogeNFTStake is IERC721Receiver {
    IERC721 private colorDogeNFT;
    IColorDogeToken private colorDogeToken;

    address public immutable _owner;

    mapping(uint256 => address) public originalOwner;
    mapping(uint256 => uint256) public initialTokenStakeTimes;

    constructor(
        IColorDogeToken _colorDogeTokenAddress,
        IERC721 _colorDogeNFTddress
    ) {
        _owner = msg.sender;
        colorDogeToken = _colorDogeTokenAddress;
        colorDogeNFT = _colorDogeNFTddress;
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4) {
        originalOwner[tokenId] = from;
        return IERC721Receiver.onERC721Received.selector;
    }

    fallback() external payable {}

    receive() external payable {}
}
