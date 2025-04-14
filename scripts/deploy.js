const { ethers } = require("hardhat");

async function main() {
  console.log("Starting deployment process...");

  // Get the contract factories
  const TestToken = await ethers.getContractFactory("TestToken");
  const Faucet = await ethers.getContractFactory("Faucet");

  // Deploy TestToken first
  console.log("Deploying TestToken...");
  const testToken = await TestToken.deploy(
    "Test Token", // name
    "TST", // symbol
    18, // decimals
    1000000 // initialSupply (1 million tokens)
  );
  await testToken.waitForDeployment();
  const tokenAddress = await testToken.getAddress();
  console.log(`TestToken deployed to: ${tokenAddress}`);

  // Deploy Faucet with the token address
  console.log("Deploying Faucet...");
  const distributionAmount = ethers.parseUnits("10", 18); // 10 tokens per distribution
  const faucet = await Faucet.deploy(tokenAddress, distributionAmount);
  await faucet.waitForDeployment();
  const faucetAddress = await faucet.getAddress();
  console.log(`Faucet deployed to: ${faucetAddress}`);

  // Fund the faucet with tokens (10,000 tokens)
  console.log("Funding the faucet with tokens...");
  const fundAmount = ethers.parseUnits("10000", 18);
  const tx = await testToken.transfer(faucetAddress, fundAmount);
  await tx.wait();
  console.log(
    `Transferred ${ethers.formatUnits(fundAmount, 18)} tokens to the faucet`
  );

  console.log("Deployment completed successfully!");

  // Log important contract addresses and info for verification
  console.log("\nDeployment Summary:");
  console.log("-------------------");
  console.log(`TestToken (${await testToken.symbol()}): ${tokenAddress}`);
  console.log(`Faucet: ${faucetAddress}`);
  console.log(
    `Distribution Amount: ${ethers.formatUnits(
      distributionAmount,
      18
    )} ${await testToken.symbol()}`
  );
  console.log(
    `Faucet Balance: ${ethers.formatUnits(
      fundAmount,
      18
    )} ${await testToken.symbol()}`
  );
  console.log("\nVerify contracts on Etherscan with:");
  console.log(
    `npx hardhat verify --network sepolia ${tokenAddress} "Test Token" "TST" 18 1000000`
  );
  console.log(
    `npx hardhat verify --network sepolia ${faucetAddress} ${tokenAddress} ${distributionAmount}`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
