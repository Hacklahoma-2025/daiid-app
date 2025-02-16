// getConsensus.mjs
// import dotenv from "dotenv";
// dotenv.config();
import fs from "fs";
import { ethers } from "ethers";

// Load environment variables
const ETH_PROVIDER = import.meta.env.VITE_ETH_PROVIDER;
const DAIID_ADDRESS = import.meta.env.VITE_DAIID_ADDRESS;

// Ensure all required environment variables are set
if (!ETH_PROVIDER || 
    !DAIID_ADDRESS
) {
    throw new Error("Missing required environment variables (ETH_PROVIDER or DAIID_ADDRESS).");
}

const getConsensus = async (base64Image) => {

    // Set up ethers provider (read-only)
    const provider = new ethers.JsonRpcProvider(ETH_PROVIDER);

    // Load the compiled contract artifact (ensure the path is correct)
    const artifact = JSON.parse(fs.readFileSync("./artifacts/contracts/DAIID.sol/DAIID.json"));
    const abi = artifact.abi;

    // Compute file hash
    const fileHash = ethers.keccak256(base64Image);
    console.log("Computed file hash:", fileHash);

    // Instantiate the contract (using the deployed address from .env)
    const contract = new ethers.Contract(DAIID_ADDRESS, abi, provider);

    // Call the getConsensus function on the contract
    const consensus = await contract.getConsensus(fileHash);
    return consensus.toString();
}

export default getConsensus;






