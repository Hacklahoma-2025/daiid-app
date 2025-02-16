// upload.js
require("dotenv").config();
const fs = require("fs");
const { ethers } = require("ethers");
const { create } = require("ipfs-http-client");

// Get the file path from command-line arguments
const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: node upload.js <filePath>");
  process.exit(1);
}

// Read file into a buffer
const fileBuffer = fs.readFileSync(filePath);

// Load environment variables
const ETH_PROVIDER = process.env.ETH_PROVIDER;
const DAIID_ADDRESS = process.env.DAIID_ADDRESS;
const IPFS_PROVIDER = process.env.IPFS_PROVIDER;
const PRIVATE_KEY = process.env.ETH_PRIVATE_ADDRESS;
const PUBLIC_ADDRESS = process.env.ETH_PUBLIC_ADDRESS;

if (
  !ETH_PROVIDER ||
  !DAIID_ADDRESS ||
  !IPFS_PROVIDER ||
  !PRIVATE_KEY ||
  !PUBLIC_ADDRESS
) {
  throw new Error("Missing required environment variables.");
}

// Set up ethers provider and wallet
const provider = new ethers.providers.JsonRpcProvider(ETH_PROVIDER);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Load the compiled contract artifact (ensure the path is correct)
const artifact = JSON.parse(
  fs.readFileSync("./eth/artifacts/contracts/DAIID.sol/DAIID.json")
);
const abi = artifact.abi;

// Instantiate the contract (using the deployed address from .env)
const contract = new ethers.Contract(DAIID_ADDRESS, abi, wallet);

// Create an IPFS client using the provider URL from .env
// (For browser-based use you might use a different client, but this works in Node)
const ipfs = create({ url: IPFS_PROVIDER });

async function main() {
  console.log("Uploading file to IPFS...");
  const result = await ipfs.add(fileBuffer);
  const cid = result.cid.toString();
  console.log("File uploaded to IPFS with CID:", cid);

  // Compute the keccak256 hash of the file
  const fileHash = ethers.utils.keccak256(fileBuffer);
  console.log("Computed file hash:", fileHash);

  // Register the image on-chain by calling the contract function
  console.log("Registering image on-chain...");
  const tx = await contract.registerImage(fileHash, cid);
  const receipt = await tx.wait();
  console.log(
    "Image registered on-chain. Transaction hash:",
    receipt.transactionHash
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error uploading file:", err);
    process.exit(1);
  });
