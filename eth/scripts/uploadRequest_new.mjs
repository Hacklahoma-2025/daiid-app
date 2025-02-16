// uploadRequest.mjs
import dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import { ethers } from "ethers";
import { create } from "ipfs-http-client";

// Load environment variables
const ETH_PROVIDER = process.env.ETH_PROVIDER;
const DAIID_ADDRESS = process.env.DAIID_ADDRESS;
const IPFS_PROVIDER = process.env.IPFS_PROVIDER;
const PRIVATE_KEY = process.env.ETH_PRIVATE_ADDRESS;
const PUBLIC_ADDRESS = process.env.ETH_PUBLIC_ADDRESS;

// Ensure all required environment variables are set
if (
    !ETH_PROVIDER ||
    !DAIID_ADDRESS ||
    !IPFS_PROVIDER ||
    !PRIVATE_KEY ||
    !PUBLIC_ADDRESS
) {
    throw new Error("Missing required environment variables.");
}

// Image Registration Function 
const registerImage = async (base64Image) => {

    // Set up ethers provider and wallet (using ethers v6)
    const provider = new ethers.JsonRpcProvider(ETH_PROVIDER);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    // Load the compiled contract artifact (ensure the path is correct)
    const artifact = JSON.parse(
        fs.readFileSync("./artifacts/contracts/DAIID.sol/DAIID.json")
    );
    const abi = artifact.abi;

    // Instantiate the contract (using the deployed address from .env)
    const contract = new ethers.Contract(DAIID_ADDRESS, abi, wallet);

    // Create an IPFS client using the provider URL from .env
    // Ensure IPFS_PROVIDER is an HTTP URL, e.g., "http://10.204.202.78:5001"
    const ipfs = create({ url: IPFS_PROVIDER });

    // Upload file to IPFS
    console.log("Uploading file to IPFS...");
    const result = await ipfs.add(base64Image);
    const cid = result.cid.toString();
    console.log("File uploaded to IPFS with CID:", cid);

    // Compute the keccak256 hash of the file
    const fileHash = ethers.keccak256(base64Image);
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
