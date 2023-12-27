const { upgradeProxy } = require('@openzeppelin/truffle-upgrades');

const DNZTokenV2 = artifacts.require('DNZTokenV2'); // This is the new version of your contract
const proxyAddress = '0x33.......................'; // Replace with your proxy contract address

module.exports = async function (deployer) {
  const upgraded = await upgradeProxy(proxyAddress, DNZTokenV2, { deployer });
  console.log('Upgraded', upgraded.address);
};