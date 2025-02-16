require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ethers");
require("dotenv").config();

// console.log(process.env.ETH_PRIVATE_ADDRESS);

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    remote: {
      url: process.env.ETH_PROVIDER, // e.g., "http://192.168.1.100:7545"
      accounts: [process.env.ETH_PRIVATE_ADDRESS], // or use a list of accounts
    },
  },
};
