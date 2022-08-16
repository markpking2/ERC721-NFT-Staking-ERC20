// SPDX-License-Identifier: GPL-3.0

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

pragma solidity 0.8.9;

contract ColorDogeNFT is ERC721 {
    uint256 public totalSupply = 0;
    uint256 public constant MAX_SUPPLY = 100;
    address immutable public _owner;
    IERC20 private immutable colorDogeTokenAddress;
    address nftStakeAddress;

    constructor(IERC20 _colorDogeTokenAddress) ERC721("Color Doge", "CDOGE") {
        _owner = msg.sender;
        colorDogeTokenAddress = _colorDogeTokenAddress;
    }

    function mint(uint256 _tokenId) external {
        require(totalSupply < MAX_SUPPLY, "supply reached");
        colorDogeTokenAddress.transferFrom(msg.sender, address(this), 10 * 10**18);
        _mint(msg.sender, _tokenId);
        totalSupply++;
    }

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://QmNMRKZXodDUANghAZbzQXE551j7bV1w933Y9u3Zhv8AYm/";
    }

    function withdrawTokens() external onlyOwner {
        uint currentBalance = colorDogeTokenAddress.balanceOf(address(this));
        require(currentBalance > 0, "no tokens");
        colorDogeTokenAddress.transfer(_owner, currentBalance);
    }

    fallback() external payable {}

    receive() external payable {}
}