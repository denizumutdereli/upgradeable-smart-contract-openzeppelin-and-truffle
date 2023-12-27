const HDWalletProvider = require('@truffle/hdwallet-provider');
const infuraProjectId = "91............................";

//Test owner: 0x155.....................................

module.exports = {
  contracts_build_directory: "./public/contracts",
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
    goerli: {
      provider: () => new HDWalletProvider({
        privateKeys: ["6c............................................................."],
        providerOrUrl: `https://goerli.infura.io/v3/${infuraProjectId}`,
        pollingInterval: 15 * 1000, // 15 seconds
    }),
      network_id: 5, // Goerli's network id
      gas: 8000000,
      gasPrice: 20000000000, // 20 Gwei
    },
    sepolia: {
      provider: () => new HDWalletProvider({
        privateKeys: ["d8............................................................."],
        providerOrUrl: `https://sepolia.infura.io/v3/${infuraProjectId}`,
        pollingInterval: 15 * 1000, // 15 seconds
    }),
      network_id: 11155111, // Goerli's network id
      gas: 8000000,
      gasPrice: 20000000000, // 20 Gwei
    },
  },

  mocha: {
    // timeout: 100000
  },

  compilers: {
    solc: {
      version: "0.8.5"
    }
  }
};
