const { expect } = require("chai");
const { deployProxy } = require("@openzeppelin/hardhat-upgrades");

const { ethers, upgrades } = require("hardhat");

describe("DNZToken", function () {
  let DNZToken, cryiToken, owner, addr1, addr2;

  beforeEach(async function () {
    DNZToken = await ethers.getContractFactory("DNZToken");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    cryiToken = await upgrades.deployProxy(DNZToken, [], { initializer: "initialize" });
    await cryiToken.deployed();
  });

  describe("Deployment", function () {
    it("Should set the correct token name and symbol", async function () {
      expect(await cryiToken.name()).to.equal("Deniz Token");
      expect(await cryiToken.symbol()).to.equal("DNZ");
    });

    it("Should set the correct version", async function () {
      expect(await cryiToken.getVersion()).to.equal("V1");
    });

    it("Should set the correct owner", async function () {
      expect(await cryiToken.getOwner()).to.equal(owner.address);
    });
  });

  describe("Minting", function () {
    it("Should mint tokens to specified address", async function () {
      await cryiToken.connect(owner).mint(addr1.address, 1000);
      const addr1Balance = await cryiToken.balanceOf(addr1.address);
      expect((await cryiToken.balanceOf(addr1.address)).toString()).to.equal('1000');
    });

    it("Should fail if non-owner tries to mint tokens", async function () {
      await expect(
        cryiToken.connect(addr1).mint(addr2.address, 1000)
      ).to.be.revertedWith("Ownable: caller is not the owner");
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
      await expect(
        cryiToken.connect(addr1).freeze(addr2.address, true)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

});
