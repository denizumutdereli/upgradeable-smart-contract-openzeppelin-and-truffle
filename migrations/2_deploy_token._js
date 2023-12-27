const { deployProxy } = require('@openzeppelin/truffle-upgrades');
const DNZToken = artifacts.require('DNZToken');

module.exports = async function (deployer) {
  const initialSupply = 1000000;
  const instance = await deployProxy(DNZToken, [initialSupply * 10**4], { deployer, initializer: 'initialize', kind: 'uups', unsafeAllowCustomTypes: false });
  //await instance.increaseSupply(initialSupply);
};
