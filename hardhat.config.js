require("@nomiclabs/hardhat-waffle");
require('@openzeppelin/hardhat-upgrades');
require("dotenv").config();
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  await network.provider.send("evm_setAutomine", [false]);
  await network.provider.send("evm_setIntervalMining", [5000]);
  const accounts = await hre.ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  networks: {
    testnet: {
      url: `https://api.s0.b.hmny.io`,
      accounts: [
        `0x${process.env.HARMONY_TESTNET_PRIVATEKEY}`,
      ],
    },
  },
};
