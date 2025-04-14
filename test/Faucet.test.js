const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Token Faucet", function () {
  let TestToken, Faucet;
  let token, faucet;
  let owner, user1, user2;
  let distributionAmount;

  beforeEach(async function () {
    // Get signers
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy TestToken
    TestToken = await ethers.getContractFactory("TestToken");
    token = await TestToken.deploy("Test Token", "TST", 18, 1000000);
    await token.waitForDeployment();

    // Deploy Faucet
    distributionAmount = ethers.parseUnits("10", 18); // 10 tokens per request
    Faucet = await ethers.getContractFactory("Faucet");
    faucet = await Faucet.deploy(await token.getAddress(), distributionAmount);
    await faucet.waitForDeployment();

    // Fund the faucet with tokens
    await token.transfer(
      await faucet.getAddress(),
      ethers.parseUnits("1000", 18)
    );
  });

  describe("Deployment", function () {
    it("Should set the correct token and distribution amount", async function () {
      expect(await faucet.token()).to.equal(await token.getAddress());
      expect(await faucet.distributionAmount()).to.equal(distributionAmount);
    });

    it("Should set the owner correctly", async function () {
      expect(await faucet.owner()).to.equal(owner.address);
    });
  });

  describe("Token Distribution", function () {
    it("Should allow a user to claim tokens", async function () {
      const initialBalance = await token.balanceOf(user1.address);

      // User claims tokens
      await faucet.connect(user1).requestTokens();

      // Check if tokens were received
      const newBalance = await token.balanceOf(user1.address);
      expect(newBalance - initialBalance).to.equal(distributionAmount);
    });

    it("Should prevent a user from claiming twice within cooldown period", async function () {
      // First claim
      await faucet.connect(user1).requestTokens();

      // Try to claim again immediately
      await expect(faucet.connect(user1).requestTokens()).to.be.revertedWith(
        "Cooldown period not yet elapsed"
      );
    });

    it("Should allow a user to claim again after cooldown period", async function () {
      // First claim
      await faucet.connect(user1).requestTokens();

      // Fast forward time by 25 hours
      await time.increase(25 * 60 * 60);

      // Should be able to claim again
      await faucet.connect(user1).requestTokens();

      // Check balance
      const balance = await token.balanceOf(user1.address);
      expect(balance).to.equal(distributionAmount * BigInt(2));
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to change distribution amount", async function () {
      const newAmount = ethers.parseUnits("20", 18);
      await faucet.setDistributionAmount(newAmount);
      expect(await faucet.distributionAmount()).to.equal(newAmount);
    });

    it("Should allow owner to change cooldown period", async function () {
      const newPeriod = 12 * 60 * 60; // 12 hours
      await faucet.setCooldownPeriod(newPeriod);
      expect(await faucet.cooldownPeriod()).to.equal(newPeriod);
    });

    it("Should allow owner to pause/unpause the faucet", async function () {
      // Initially not paused
      expect(await faucet.isPaused()).to.equal(false);

      // Pause faucet
      await faucet.togglePause();
      expect(await faucet.isPaused()).to.equal(true);

      // Try to claim when paused
      await expect(faucet.connect(user1).requestTokens()).to.be.revertedWith(
        "Faucet is paused"
      );

      // Unpause
      await faucet.togglePause();
      expect(await faucet.isPaused()).to.equal(false);

      // Should be able to claim now
      await faucet.connect(user1).requestTokens();
    });

    it("Should allow owner to withdraw tokens", async function () {
      const withdrawAmount = ethers.parseUnits("100", 18);
      const initialOwnerBalance = await token.balanceOf(owner.address);
      const initialFaucetBalance = await token.balanceOf(
        await faucet.getAddress()
      );

      // Withdraw tokens
      await faucet.withdrawTokens(withdrawAmount);

      // Check balances
      expect(await token.balanceOf(owner.address)).to.equal(
        initialOwnerBalance + withdrawAmount
      );
      expect(await token.balanceOf(await faucet.getAddress())).to.equal(
        initialFaucetBalance - withdrawAmount
      );
    });

    it("Should allow owner to reset cooldown for a user", async function () {
      // User claims tokens
      await faucet.connect(user1).requestTokens();

      // Verify they can't claim again
      await expect(faucet.connect(user1).requestTokens()).to.be.revertedWith(
        "Cooldown period not yet elapsed"
      );

      // Reset cooldown
      await faucet.resetCooldown(user1.address);

      // Should be able to claim again
      await faucet.connect(user1).requestTokens();
    });
  });

  describe("View Functions", function () {
    it("Should correctly report if a user can claim tokens", async function () {
      // Initially should be able to claim
      expect(await faucet.canClaimTokens(user1.address)).to.equal(true);

      // After claiming
      await faucet.connect(user1).requestTokens();
      expect(await faucet.canClaimTokens(user1.address)).to.equal(false);

      // After cooldown period
      await time.increase(25 * 60 * 60);
      expect(await faucet.canClaimTokens(user1.address)).to.equal(true);
    });

    it("Should correctly calculate next claim time", async function () {
      // Before first claim
      let nextClaimTime = await faucet.getNextClaimTime(user1.address);
      const currentTimestamp = await time.latest();
      expect(nextClaimTime).to.equal(currentTimestamp);

      // After claiming
      await faucet.connect(user1).requestTokens();
      const claimTimestamp = await time.latest();
      nextClaimTime = await faucet.getNextClaimTime(user1.address);

      // Convert to BigInt and calculate expected time
      const cooldownSeconds = 24 * 60 * 60; // 24 hours in seconds
      const expectedTime = BigInt(Number(claimTimestamp) + cooldownSeconds);

      expect(nextClaimTime).to.equal(expectedTime);
    });
  });
});
