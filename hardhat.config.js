require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
require("@openzeppelin/hardhat-upgrades");

module.exports = {
  solidity: "0.8.5",
  networks: {
    development: {
      url: "http://127.0.0.1:7545",
    },
  },
  paths: {
    artifacts: "./public/contracts",
  },
  mocha: {
    // timeout: 100000
  },
};
