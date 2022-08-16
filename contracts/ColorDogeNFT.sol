// SPDX-License-Identifier: GPL-3.0

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

pragma solidity 0.8.9;

contract ColorDogeNFT is ERC721 {
    uint256 public totalSupply = 0;
    uint256 public constant MAX_SUPPLY = 100;
    address public immutable _owner;
    IERC20 private immutable colorDogeTokenAddress;
    address nftStakeAddress;

    constructor(IERC20 _colorDogeTokenAddress) ERC721("Color Doge", "CDOGE") {
        _owner = msg.sender;
        colorDogeTokenAddress = _colorDogeTokenAddress;
    }

    fallback() external payable {}

    receive() external payable {}
}
