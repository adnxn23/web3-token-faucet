const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();

  // Contract addresses (replace with your deployed addresses)
  const faucetAddress = "YOUR_DEPLOYED_FAUCET_ADDRESS";
  const tokenAddress = "YOUR_DEPLOYED_TOKEN_ADDRESS";

  // Load contract instances
  const Faucet = await ethers.getContractFactory("Faucet");
  const TestToken = await ethers.getContractFactory("TestToken");

  const faucet = Faucet.attach(faucetAddress);
  const token = TestToken.attach(tokenAddress);

  // Display account info
  console.log(`Interacting with contracts using account: ${signer.address}`);

  // Get token balance
  const tokenBalance = await token.balanceOf(signer.address);
  console.log(`Token balance: ${ethers.formatUnits(tokenBalance, 18)} TST`);

  // Check if eligible for claiming tokens
  const canClaim = await faucet.canClaimTokens(signer.address);
  console.log(`Can claim tokens: ${canClaim}`);

  if (!canClaim) {
    const nextClaimTime = await faucet.getNextClaimTime(signer.address);
    const nextClaimDate = new Date(Number(nextClaimTime) * 1000);
    console.log(`Next claim available at: ${nextClaimDate.toLocaleString()}`);
  } else {
    // Request tokens from faucet
    console.log("Requesting tokens from faucet...");
    const tx = await faucet.requestTokens();
    await tx.wait();
    console.log("Tokens received successfully!");

    // Get updated token balance
    const newBalance = await token.balanceOf(signer.address);
    console.log(`New token balance: ${ethers.formatUnits(newBalance, 18)} TST`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
