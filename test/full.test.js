const { expect } = require("chai");
const { ethers,upgrades } = require("hardhat");

describe("DNZToken", function () {
    let DNZToken, cryiToken, owner, addr1, addr2;

    beforeEach(async function () {
        DNZToken = await ethers.getContractFactory("DNZToken");
        [owner, addr1, addr2] = await ethers.getSigners();
        cryiToken = await upgrades.deployProxy(DNZToken, [ethers.utils.parseEther("1000000000")], { initializer: "initialize" });
        await cryiToken.deployed();
    });

    it("Should initialize the contract with the correct values", async function () {
        const name = await cryiToken.name();
        const symbol = await cryiToken.symbol();
        const ownerBalance = await cryiToken.balanceOf(owner.address);

        expect(name).to.equal("Deniz Token");
        expect(symbol).to.equal("DNZ");
        expect(ownerBalance).to.equal(ethers.utils.parseEther("1000000000")); // Assuming an initial supply of 1,000,000,000 tokens
    });

    it("Should mint new tokens to the specified address", async function () {
        const mintAmount = ethers.utils.parseEther("1000");
        await cryiToken.mint(addr1.address, mintAmount);
        const addr1Balance = await cryiToken.balanceOf(addr1.address);

        expect(addr1Balance).to.equal(mintAmount);
    });

    it("Should burn tokens from the contract owner's balance", async function () {
        const burnAmount = ethers.utils.parseEther("1000");
        await cryiToken.decreaseSupply(burnAmount);
        const ownerBalance = await cryiToken.balanceOf(owner.address);

        expect(ownerBalance).to.equal(ethers.utils.parseEther("999999000")); // Assuming an initial supply of 1,000,000,000 tokens
    });

    it("Should freeze and unfreeze accounts correctly", async function () {
        const freezeAmount = ethers.utils.parseEther("1000");
        const freezeDuration = 60 * 60 * 24; // 1 day

        await cryiToken.freeze(addr1.address, freezeAmount, freezeDuration);
        const [frozenAmount, remainingTime] = await cryiToken.isFrozen(addr1.address);

        expect(frozenAmount).to.equal(freezeAmount);
        expect(remainingTime).to.be.closeTo(freezeDuration, 5); // Allow for some deviation in the remaining time

        // Simulate 1 day passing
        await ethers.provider.send("evm_increaseTime", [freezeDuration]);
        await ethers.provider.send("evm_mine");

        const [unfrozenAmount, unfrozenRemainingTime] = await cryiToken.isFrozen(addr1.address);

        expect(unfrozenAmount).to.equal(0);
        expect(unfrozenRemainingTime).to.equal(0);
    });

    it("Should not allow transferring more than available balance when an account is frozen", async function () {
        const freezeAmount = ethers.utils.parseEther("1000");
        const freezeDuration = 60 * 60 * 24; // 1 day
        const transferAmount = ethers.utils.parseEther("1500");

        await cryiToken.mint(addr1.address, ethers.utils.parseEther("2000"));
        await cryiToken.freeze(addr1.address, freezeAmount, freezeDuration);

        await expect(cryiToken.connect(addr1).transfer(addr2.address, transferAmount)).to.be.revertedWith(
            "Attempt to transfer more than available balance"
        );
    });

    it("Should allow contract owner to pause and unpause the contract", async function () {
        await cryiToken.pause();

        await expect(cryiToken.connect(addr1).transfer(addr2.address, ethers.utils.parseEther("1000"))).to.be.revertedWith(
            "Pausable: paused"
        );

        await cryiToken.unpause();

        const tx = await cryiToken.connect(addr1).transfer(addr2.address, ethers.utils.parseEther("1000"));
        expect(tx).to.emit(cryiToken, "Transfer");
    });

    it("Should allow contract owner to claim ownership", async function () {
        await cryiToken.claimOwnership(addr1.address);

        expect(await cryiToken.owner()).to.equal(addr1.address);
    });

    it("Should not allow non-owner to pause the contract", async function () {
        await expect(cryiToken.connect(addr1).pause()).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should not allow non-owner to unpause the contract", async function () {
        await cryiToken.pause();
        await expect(cryiToken.connect(addr1).unpause()).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should not allow non-owner to mint tokens", async function () {
        await expect(cryiToken.connect(addr1).mint(addr2.address, ethers.utils.parseEther("1000"))).to.be.revertedWith(
            "Ownable: caller is not the owner"
        );
    });

    it("Should not allow non-owner to freeze accounts", async function () {
        await expect(
            cryiToken.connect(addr1).freeze(addr2.address, ethers.utils.parseEther("1000"), 60 * 60 * 24)
        ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should not allow non-owner to increase the supply", async function () {
        await expect(cryiToken.connect(addr1).increaseSupply(ethers.utils.parseEther("1000"))).to.be.revertedWith(
            "Ownable: caller is not the owner"
        );
    });

    it("Should not allow non-owner to decrease the supply", async function () {
        await expect(cryiToken.connect(addr1).decreaseSupply(ethers.utils.parseEther("1000"))).to.be.revertedWith(
            "Ownable: caller is not the owner"
        );
    });

    it("Should not allow non-owner to perform transfer and burn", async function () {
        await expect(
            cryiToken.connect(addr1).transferAndBurn(addr2.address, ethers.utils.parseEther("1000"))
        ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should perform transfer and burn successfully", async function () {
        const initialOwnerBalance = await cryiToken.balanceOf(owner.address);
        const transferAmount = ethers.utils.parseEther("1000");
        await cryiToken.transferAndBurn(addr1.address, transferAmount);
        const finalOwnerBalance = await cryiToken.balanceOf(owner.address);
        const addr1Balance = await cryiToken.balanceOf(addr1.address);

        expect(finalOwnerBalance).to.equal(initialOwnerBalance.sub(transferAmount));
        expect(addr1Balance).to.equal(transferAmount);
    });

    it("Should not allow transferring more than available balance after the freeze period", async function () {
        const freezeAmount = ethers.utils.parseEther("1000");
        const freezeDuration = 60 * 60 * 24; // 1 day
        const transferAmount = ethers.utils.parseEther("1500");

        await cryiToken.mint(addr1.address, ethers.utils.parseEther("2000"));
        await cryiToken.freeze(addr1.address, freezeAmount, freezeDuration);

        // Simulate 1 day passing
        await ethers.provider.send("evm_increaseTime", [freezeDuration]);
        await ethers.provider.send("evm_mine");

        const tx = await cryiToken.connect(addr1).transfer(addr2.address, transferAmount);
        expect(tx).to.emit(cryiToken, "Transfer");
    });

    it("Should return the correct version", async function () {
        const version = await cryiToken.getVersion();

        expect(version).to.equal("V1");
    });

    it("Should return the correct owner", async function () {
        const currentOwner = await cryiToken.getOwner();

        expect(currentOwner).to.equal(owner.address);
    });
});

