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

    modifier onlyOwner() {
        require(msg.sender == _owner, "not owner");
        _;
    }

    function mint(uint256 _tokenId) external {
        require(totalSupply < MAX_SUPPLY, "supply reached");
        colorDogeTokenAddress.transferFrom(
            msg.sender,
            address(this),
            10 * 10**18
        );
        _mint(msg.sender, _tokenId);
        totalSupply++;
    }

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://QmNMRKZXodDUANghAZbzQXE551j7bV1w933Y9u3Zhv8AYm/";
    }

    function viewBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function withdrawTokens() external onlyOwner {
        uint256 currentBalance = colorDogeTokenAddress.balanceOf(address(this));
        require(currentBalance > 0, "no tokens");
        colorDogeTokenAddress.transfer(_owner, currentBalance);
    }

    function withdrawEther() external onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    function approveAllColorDogeStake(bool approve) external {
        require(nftStakeAddress != address(0), "NFT address not set");
        _setApprovalForAll(msg.sender, nftStakeAddress, approve);
    }

    function setNFTStakeAddress(address _target) external {
        require(msg.sender == _owner, "not owner");
        require(_target != address(0), "0 address");
        nftStakeAddress = _target;
    }

    fallback() external payable {}

    receive() external payable {}
}
