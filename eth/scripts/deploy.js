// scripts/deploy.js
async function main() {
  // Get the contract factory for DAIID
  const DAIID = await ethers.getContractFactory("DAIID");

  // Deploy the contract (no need to call daiid.deployed() afterwards)
  const daiid = await DAIID.deploy();

  console.log("DAIID deployed to:", daiid);
}

// Execute the deployment script and handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error deploying contract:", error);
    process.exit(1);
  });
