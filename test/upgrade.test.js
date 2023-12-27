const { expect } = require("chai");
const { deployProxy } = require("@openzeppelin/hardhat-upgrades");

const { ethers, upgrades } = require("hardhat");

describe("DNZToken", function () {
  let owner, addr1, addr2;
  let cryiToken;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const DNZToken = await ethers.getContractFactory("DNZToken");
    cryiToken = await upgrades.deployProxy(DNZToken, [], { initializer: "initialize" });
    await cryiToken.deployed();
  });

  describe("Deployment", function () {
    it("Should set the correct token name and symbol", async function () {
      expect(await cryiToken.name()).to.equal("Deniz Token");
      expect(await cryiToken.symbol()).to.equal("DNZ");
    });
  });

  describe("Minting", function () {
    it("Should mint tokens to specified address", async function () {
      await cryiToken.connect(owner).mint(addr1.address, 1000);
      const addr1Balance = await cryiToken.balanceOf(addr1.address);
      expect(addr1Balance.toString()).to.equal("1000");
    });

    it("Should fail if non-owner tries to mint tokens", async function () {
      await expect(cryiToken.connect(addr1).mint(addr2.address, 1000)).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Freezing", function () {
    it("Should freeze and unfreeze an account", async function () {
      await cryiToken.connect(owner).freeze(addr1.address, true);
      expect(await cryiToken.isFrozen(addr1.address)).to.equal(true);

      await cryiToken.connect(owner).freeze(addr1.address, false);
      expect(await cryiToken.isFrozen(addr1.address)).to.equal(false);
    });

    it("Should fail if non-owner tries to freeze an account", async function () {
      await expect(cryiToken.connect(addr1).freeze(addr2.address, true)).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Upgrade", function () {
    it("Should keep the balance after upgrading the contract", async function () {
      // Deploy the initial version of the contract
      const DNZTokenV1 = await ethers.getContractFactory("DNZToken");
      const cryiTokenV1 = await upgrades.deployProxy(DNZTokenV1, [], { initializer: "initialize" });
      await cryiTokenV1.deployed();

      // Mint tokens for addr1
      await cryiTokenV1.connect(owner).mint(addr1.address, 1000);
      const initialBalance = await cryiTokenV1.balanceOf(addr1.address);

      // Upgrade the contract to the new version (e.g., DNZTokenV2)
      const DNZTokenV2 = await ethers.getContractFactory("DNZTokenV2");
      const cryiTokenV2 = await upgrades.upgradeProxy(cryiTokenV1.address, DNZTokenV2);

      // Check the balance of addr1 after the upgrade
      const upgradedBalance = await cryiTokenV2.balanceOf(addr1.address);

      // Compare initial balance with the balance after the upgrade
      expect(initialBalance.toString()).to.equal(upgradedBalance.toString());
    });
  });
});
