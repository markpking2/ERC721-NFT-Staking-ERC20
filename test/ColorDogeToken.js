const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
require("@nomicfoundation/hardhat-chai-matchers");
const {
  ethers: { BigNumber, ...ethers },
} = require("hardhat");

describe("ColorDogeToken contract", function () {
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
    }

    if (autoAllowance) {
      await ColorDogeToken.approveAllNFT(true);
      await ColorDogeToken.approveAllStake(true);
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
      const { ColorDogeToken, owner } = await loadFixture(dFNone);
      expect(await ColorDogeToken._owner()).to.equal(owner.address);
    });
  });

  describe("set external addresses", function () {
    it("sets nft address", async () => {
      const { ColorDogeToken, ColorDogeNFT } = await loadFixture(dFNone);
      await ColorDogeToken.setNFTAddress(ColorDogeNFT.address);
    });

    it("sets stake address", async () => {
      const { ColorDogeToken, ColorDogeStake } = await loadFixture(dFNone);
      await ColorDogeToken.setNFTStakeAddress(ColorDogeStake.address);
    });
  });

  describe("set allowances", function () {
    it("approve all nft", async () => {
      const { ColorDogeToken, ColorDogeNFT, owner } = await loadFixture(
        dFAutoAddress
      );

      expect(
        await ColorDogeToken.allowance(owner.address, ColorDogeNFT.address)
      ).to.equal(0);

      await ColorDogeToken.approveAllNFT(true);

      expect(
        await ColorDogeToken.allowance(owner.address, ColorDogeNFT.address)
      ).to.equal(ethers.constants.MaxUint256);
    });

    it("approve all nft stake", async () => {
      const { ColorDogeToken, ColorDogeStake, owner } = await loadFixture(
        dFAutoAddress
      );
      expect(
        await ColorDogeToken.allowance(owner.address, ColorDogeStake.address)
      ).to.equal(0);
      await ColorDogeToken.approveAllStake(true);
      expect(
        await ColorDogeToken.allowance(owner.address, ColorDogeStake.address)
      ).to.equal(ethers.constants.MaxUint256);
    });
  });

  describe("minting", async () => {
    it("mint 1000 tokens for 1 ether", async () => {
      const { ColorDogeToken, owner } = await loadFixture(deployFixture);

      expect(await ColorDogeToken.balanceOf(owner.address)).to.equal(0);

      await ColorDogeToken["mint()"]({ value: ethers.utils.parseEther("1.0") });

      expect(await ColorDogeToken.balanceOf(owner.address)).to.equal(
        BigNumber.from(1000).mul(BigNumber.from(10).pow(18))
      );
    });
  });
});
