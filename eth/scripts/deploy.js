// scripts/deploy.js
async function main() {
  // Get the contract factory for DAIID
  const DAIID = await ethers.getContractFactory("DAIID");

  // Deploy the contract (you can pass constructor arguments here if needed)
  const daiid = await DAIID.deploy();
  await daiid.deployed();

  console.log("DAIID deployed to:", daiid.address);
}

// Execute the deployment script and handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error deploying contract:", error);
    process.exit(1);
  });
