const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
require("@nomicfoundation/hardhat-chai-matchers");
const {
  ethers: { BigNumber, ...ethers },
} = require("hardhat");

const mintAmount = BigNumber.from("1000").mul(
  BigNumber.from("10").pow(BigNumber.from("18"))
);

describe("ColorDogeNFT contract", function () {
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
      await ColorDogeToken.setNFTAddress(ColorDogeNFT.address);
      await ColorDogeToken.setNFTStakeAddress(ColorDogeStake.address);
      await ColorDogeNFT.setNFTStakeAddress(ColorDogeStake.address);
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
      const { ColorDogeNFT, owner } = await loadFixture(dFNone);
      expect(await ColorDogeNFT._owner()).to.equal(owner.address);
    });
  });

  describe("set external addresses", function () {
    it("sets stake address", async () => {
      const { ColorDogeNFT, ColorDogeStake } = await loadFixture(dFNone);
      await ColorDogeNFT.setNFTStakeAddress(ColorDogeStake.address);
    });
  });

  describe("approve all", function () {
    it("set approval for all nft transfer", async () => {
      const { ColorDogeNFT, ColorDogeStake, owner } = await loadFixture(
        dFAutoAddress
      );

      expect(
        await ColorDogeNFT.isApprovedForAll(
          owner.address,
          ColorDogeStake.address
        )
      ).to.equal(false);

      await ColorDogeNFT.approveAllColorDogeStake(true);

      expect(
        await ColorDogeNFT.isApprovedForAll(
          owner.address,
          ColorDogeStake.address
        )
      ).to.equal(true);
    });
  });

  describe("minting", async () => {
    it("mint 1 NFT tokens for 10 ColorDogeTokens", async () => {
      const { ColorDogeToken, ColorDogeNFT, owner } = await loadFixture(
        deployFixture
      );

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
    });
  });
});
