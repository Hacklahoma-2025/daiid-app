// getConsensus.mjs
import dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import { ethers } from "ethers";

// Get the file path from command-line arguments
const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: node getConsensus.mjs <filePath>");
  process.exit(1);
}

// Read file into a buffer
const fileBuffer = fs.readFileSync(filePath);

// Compute the keccak256 hash of the file
const fileHash = ethers.keccak256(fileBuffer);
console.log("Computed file hash:", fileHash);

// Load environment variables
const ETH_PROVIDER = process.env.ETH_PROVIDER;
const DAIID_ADDRESS = process.env.DAIID_ADDRESS;

if (!ETH_PROVIDER || !DAIID_ADDRESS) {
  throw new Error("Missing required environment variables (ETH_PROVIDER or DAIID_ADDRESS).");
}

// Set up ethers provider (read-only)
const provider = new ethers.JsonRpcProvider(ETH_PROVIDER);

// Load the compiled contract artifact (ensure the path is correct)
const artifact = JSON.parse(fs.readFileSync("./artifacts/contracts/DAIID.sol/DAIID.json"));
const abi = artifact.abi;

// Instantiate the contract (using the deployed address from .env)
const contract = new ethers.Contract(DAIID_ADDRESS, abi, provider);

async function main() {
  // Call the getConsensus function on the contract
  const consensus = await contract.getConsensus(fileHash);
  console.log("Consensus value for the image:", consensus.toString());
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error retrieving consensus:", err);
    process.exit(1);
  });
