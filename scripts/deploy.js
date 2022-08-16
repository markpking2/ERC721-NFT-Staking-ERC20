// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const contractRegex = /--contract-file=(?<fromEnv>[a-zA-Z]+)/;
  const contractName = process.argv
    .slice(2)
    .find((str) => str.match(contractRegex));

  const Contract = await hre.ethers.getContractFactory(contractName);
  const contract = await Contract.deploy();

  await contract.deployed();

  console.log(`Contract deployed to:`, contract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
