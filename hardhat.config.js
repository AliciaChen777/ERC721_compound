require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

//require("@nomiclabs/hardhat-waffle");

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});




/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  //solidity: "0.8.10",
  solidity: {
    compilers: [{
        version: "0.8.17",
      },
      {
        version: "0.8.10",
      },
      {
        version: "0.6.12",
      },
    ],
  },
  networks: {
    hardhat: {
      forking: {
        url: process.env.ALCHEMY_API_URL,

        //blockNumber: 15969441,
        blockNumber: 16169016,

      },

      allowUnlimitedContractSize: true
    },
    goerli: {
      url: process.env.ALCHEMY_GOERLI_URL,
      accounts: [process.env.GOERLI_PRIVATE_KEY]
    }
  }
};