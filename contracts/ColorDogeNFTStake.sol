// SPDX-License-Identifier: GPL-3.0

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./ColorDogeToken.sol";
import "./ColorDogeNFT.sol";

pragma solidity 0.8.9;

interface IColorDogeToken {
    function mint(address _to, uint _amount) external;
    function transfer(address _to, uint amount) external;
    function totalSupply() external returns (uint);
}

contract ColorDogeNFTStake is IERC721Receiver {
    IERC721 private colorDogeNFT;
    IColorDogeToken private colorDogeToken;

    address immutable public _owner;

    mapping(uint256 => address) public originalOwner;
    mapping(uint256 => uint256) public initialTokenStakeTimes;

    constructor(IColorDogeToken _colorDogeTokenAddress, IERC721 _colorDogeNFTddress) {
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

    function depositNFT(uint256 _tokenId) external {
        require(initialTokenStakeTimes[_tokenId] == 0, "already deposited");
        colorDogeNFT.safeTransferFrom(msg.sender, address(this), _tokenId);
        originalOwner[_tokenId] = msg.sender;
        initialTokenStakeTimes[_tokenId] = block.timestamp;
    }

    function withdrawNFT(uint256 _tokenId) external {
        require(msg.sender == originalOwner[_tokenId], "not original owner");
        colorDogeNFT.safeTransferFrom(address(this), msg.sender, _tokenId);
        uint tokensEarned = ((block.timestamp - initialTokenStakeTimes[_tokenId]) / 86400) * 10 * 10**18;
        delete initialTokenStakeTimes[_tokenId];
        uint tokenSupply = colorDogeToken.totalSupply();

        if(tokensEarned > 0 && ((tokenSupply + tokensEarned) < 100_000_000 * 10**18)){
            IColorDogeToken(colorDogeToken).mint(msg.sender, tokensEarned);
        }
    }

    function withdrawReward(uint _tokenId) external {
        require(msg.sender == originalOwner[_tokenId], "not original owner");
        uint secondsRemaining = ((block.timestamp - initialTokenStakeTimes[_tokenId]) % 86400);
        uint tokensEarned = ((block.timestamp - initialTokenStakeTimes[_tokenId]) / 86400) * 10 * 10**18;
        initialTokenStakeTimes[_tokenId] = block.timestamp - secondsRemaining;
        uint tokenSupply = colorDogeToken.totalSupply();

        if(tokensEarned > 0 && ((tokenSupply + tokensEarned) < 100_000_000 * 10**18)){
            IColorDogeToken(colorDogeToken).mint(msg.sender, tokensEarned);
        }
    }

    function withdrawEther() external {
        require(msg.sender == _owner, "not owner");
        payable(msg.sender).transfer(address(this).balance);
    }

    fallback() external payable {}

    receive() external payable {}
}
