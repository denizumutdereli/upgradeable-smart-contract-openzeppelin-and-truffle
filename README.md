# Deniz Token - Smart Contract

## Overview

Deniz Token is a blockchain-based token developed on the Ethereum network, utilizing OpenZeppelin's ERC20 standard with upgradeable features. This project is configured for the Goerli test network and includes functionalities like minting, burning, pausing, and ownership management.

## Prerequisites

- Solidity ^0.8.0 (Safe Math built-in from v0.8.0)
- OpenZeppelin Contracts (Upgradeable versions)
- Truffle Suite
- Node.js and npm
- Ganache (optional, for local testing)

## Important Notes

- From Solidity v0.8.0, Safe Math is built-in, and it's recommended to use v0.8.5 or above to avoid compiling bugs.
- OpenZeppelin contracts used in this project (`ERC20Upgradeable`, `ERC20BurnableUpgradeable`, `PausableUpgradeable`, `OwnableUpgradeable`, etc.) provide built-in functionalities for token operations, eliminating the need for additional implementation of common methods like `mint`, `burn`, etc.
- The upgradeable pattern in use requires an `initialize` function instead of a traditional constructor.

## Installation

Clone the repository and install dependencies:

    git clone <repository-url>
    cd <repository-directory>
    npm install

## Contract Compilation

To compile the smart contracts, run:

    truffle compile

## Testing

Run the tests using Truffle:

    truffle test

For testing with Mocha-Chai-Hardhat:

    npx hardhat test

## Deployment

To deploy the contracts to the Goerli test network or other networks:

    truffle migrate
    truffle migrate --network <network-name>

## Contract Interaction

To interact with the deployed contracts using the Truffle console:

    truffle console

Example interactions in the console:

    const token = await DNZToken.deployed();
    console.log(await token.name());
    console.log(await token.symbol());
    console.log(await token.totalSupply().toString());

    const account = "0x..."; // Replace with your account address
    console.log(await token.balanceOf(account).toString());

    const recipient = "0x..."; // Replace with the recipient address
    await token.transfer(recipient, "100");

    await token.pause();
    await token.unpause();

## Upgrading the Contract

To upgrade the contract:

1. Copy the contract and give it a new name.
2. Follow the same flow as the initial deployment.
3. Pay attention to JavaScript files under the migration folder. The first deployment file should be disabled (by changing its extension from `.js`).

## Additional Resources

- Test contract address on Goerli: [https://goerli.etherscan.io/token/0x33.....](https://goerli.etherscan.io/token/0x33.....)

## License

[@denizumutdereli](https://www.linkedin.com/in/denizumutdereli/)

## Contributors



## Contributors

[List of contributors and their contact information, if applicable]
