const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
require("@nomicfoundation/hardhat-chai-matchers");
const {
  ethers: { BigNumber, ...ethers },
} = require("hardhat");

describe("ColorDogeNFTStake contract", function () {
  async function deployFixture(
    { autoAllowance, autoSetAddresses } = {
      autoAllowance: true,
      autoSetAddresses: true,
    }
  ) {
    const Token = await ethers.getContractFactory("ColorDogeToken");
    const [owner, addr1, addr2] = await ethers.getSigners();
    const ColorDogeToken = await Token.deploy();
    await ColorDogeToken.deployed();

    const NFT = await ethers.getContractFactory("ColorDogeNFT");
    const ColorDogeNFT = await NFT.deploy(ColorDogeToken.address);
    await ColorDogeNFT.deployed();

    const Stake = await ethers.getContractFactory("ColorDogeNFTStake");
    const ColorDogeStake = await Stake.deploy(
      ColorDogeToken.address,
      ColorDogeNFT.address
    );
    await ColorDogeStake.deployed();

    if (autoSetAddresses) {
      await ColorDogeToken.setNFTAddress(ColorDogeNFT.signer.address);
      await ColorDogeToken.setNFTStakeAddress(ColorDogeStake.signer.address);
      await ColorDogeNFT.setNFTStakeAddress(ColorDogeStake.signer.address);
    }

    if (autoAllowance) {
      await ColorDogeToken.approveAllNFT(true);
      await ColorDogeToken.approveAllStake(true);
      await ColorDogeNFT.approveAllColorDogeStake(true);
    }

    return {
      Token,
      ColorDogeToken,
      NFT,
      ColorDogeNFT,
      Stake,
      ColorDogeStake,
      owner,
      addr1,
      addr2,
    };
  }

  async function dFNone() {
    return await deployFixture({
      autoSetAddresses: false,
      autoAllowance: false,
    });
  }

  async function dFAutoAddress() {
    return await deployFixture({
      autoSetAddresses: true,
      autoAllowance: false,
    });
  }

  describe("deployment", function () {
    it("should set the right owner", async () => {
      const { ColorDogeStake, owner } = await loadFixture(dFNone);
      expect(await ColorDogeStake._owner()).to.equal(owner.address);
    });
  });

  describe("stake nfts", async () => {
    async function depositNFT10({
      ColorDogeToken,
      ColorDogeNFT,
      ColorDogeStake,
      owner,
    }) {
      expect(await ColorDogeToken.balanceOf(owner.address)).to.equal(0);

      await ColorDogeToken["mint()"]({
        value: ethers.utils.parseEther("0.01"),
      });

      expect(await ColorDogeToken.balanceOf(owner.address)).to.equal(
        BigNumber.from(10).mul(BigNumber.from(10).pow(18))
      );

      expect(await ColorDogeNFT.balanceOf(owner.address)).to.equal(0);

      await ColorDogeNFT.mint(10);

      expect(await ColorDogeNFT.balanceOf(owner.address)).to.equal(1);
      expect(await ColorDogeNFT.ownerOf(10)).to.equal(owner.address);

      expect(await ColorDogeNFT.balanceOf(ColorDogeStake.address)).to.equal(0);
      await ColorDogeStake.depositNFT(10);
      expect(await ColorDogeNFT.balanceOf(owner.address)).to.equal(0);
      expect(await ColorDogeNFT.balanceOf(ColorDogeStake.address)).to.equal(1);
    }
    it("can deposit an nft", async () => {
      const { ColorDogeToken, ColorDogeNFT, ColorDogeStake, owner } =
        await loadFixture(deployFixture);
      await depositNFT10({
        ColorDogeToken,
        ColorDogeNFT,
        ColorDogeStake,
        owner,
      });
    });

    it("can earn 100 tokens after staking an nft for 10 days", async () => {
      const { ColorDogeToken, ColorDogeNFT, ColorDogeStake, owner } =
        await loadFixture(deployFixture);

      await depositNFT10({
        ColorDogeToken,
        ColorDogeNFT,
        ColorDogeStake,
        owner,
      });

      expect(await ColorDogeToken.balanceOf(owner.address)).to.equal(0);

      const blockNumBefore = await ethers.provider.getBlockNumber();
      const blockBefore = await ethers.provider.getBlock(blockNumBefore);
      const timestampBefore = blockBefore.timestamp;

      const tenDays = 10 * 24 * 60 * 60;

      await ethers.provider.send("evm_increaseTime", [tenDays]);
      await ethers.provider.send("evm_mine");

      const blockNumAfter = await ethers.provider.getBlockNumber();
      const blockAfter = await ethers.provider.getBlock(blockNumAfter);
      const timestampAfter = blockAfter.timestamp;

      expect(blockNumAfter).to.be.equal(blockNumBefore + 1);
      expect(timestampAfter).to.equal(timestampBefore + tenDays);

      await ColorDogeStake.withdrawReward(10);

      expect(await ColorDogeToken.balanceOf(owner.address)).to.equal(
        BigNumber.from(100).mul(BigNumber.from(10).pow(18))
      );
    });

    it("can earn 100 tokens after withdrawing an nft staked for 10 days", async () => {
      const { ColorDogeToken, ColorDogeNFT, ColorDogeStake, owner } =
        await loadFixture(deployFixture);

      await depositNFT10({
        ColorDogeToken,
        ColorDogeNFT,
        ColorDogeStake,
        owner,
      });

      expect(await ColorDogeToken.balanceOf(owner.address)).to.equal(0);

      const blockNumBefore = await ethers.provider.getBlockNumber();
      const blockBefore = await ethers.provider.getBlock(blockNumBefore);
      const timestampBefore = blockBefore.timestamp;

      const tenDays = 10 * 24 * 60 * 60;

      await ethers.provider.send("evm_increaseTime", [tenDays]);
      await ethers.provider.send("evm_mine");

      const blockNumAfter = await ethers.provider.getBlockNumber();
      const blockAfter = await ethers.provider.getBlock(blockNumAfter);
      const timestampAfter = blockAfter.timestamp;

      expect(blockNumAfter).to.be.equal(blockNumBefore + 1);
      expect(timestampAfter).to.equal(timestampBefore + tenDays);

      await ColorDogeStake.withdrawNFT(10);

      expect(await ColorDogeToken.balanceOf(owner.address)).to.equal(
        BigNumber.from(100).mul(BigNumber.from(10).pow(18))
      );
    });
  });
});
