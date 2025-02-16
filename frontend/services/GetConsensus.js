// getConsensus.mjs
// import dotenv from "dotenv";
// dotenv.config();
import abi from '../configs/abi_config.js';
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
    // Compute the keccak256 hash of the file
    const base64Data = base64Image.includes(",") ? base64Image.split(",")[1] : base64Image;

    // Convert base64 to a Uint8Array
    function base64ToUint8Array(base64) {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }

    const fileBytes = base64ToUint8Array(base64Data);
    // Compute file hash
    const fileHash = ethers.keccak256(fileBytes);
    console.log("Computed file hash:", fileHash);

    // Instantiate the contract (using the deployed address from .env)
    const contract = new ethers.Contract(DAIID_ADDRESS, abi, provider);

    // Call the getConsensus function on the contract
    const consensus = await contract.getConsensus(fileHash);
    console.log("Consensus:", consensus.toString());
    return consensus.toString();
}

export default getConsensus;






