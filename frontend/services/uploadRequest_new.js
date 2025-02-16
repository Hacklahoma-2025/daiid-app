// uploadRequest.mjs
import fs from "fs";
import { ethers } from "ethers";
import { create } from "ipfs-http-client";

// Load environment variables
const ETH_PROVIDER = import.meta.env.VITE_ETH_PROVIDER;
const DAIID_ADDRESS = import.meta.env.VITE_DAIID_ADDRESS;
const IPFS_PROVIDER = import.meta.env.VITE_IPFS_PROVIDER;
const PRIVATE_KEY = import.meta.env.VITE_ETH_PRIVATE_ADDRESS;
const PUBLIC_ADDRESS = import.meta.env.VITE_ETH_PUBLIC_ADDRESS;

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
    // const artifact = JSON.parse(
    //     fs.readFileSync("./artifacts/contracts/DAIID.sol/DAIID.json")
    // );
    const abi = [
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "bytes32",
                    "name": "imageHash",
                    "type": "bytes32"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "ipfsCID",
                    "type": "string"
                }
            ],
            "name": "ImageRegistered",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "node",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "NodeStaked",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "bytes32",
                    "name": "imageHash",
                    "type": "bytes32"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "consensus",
                    "type": "uint256"
                }
            ],
            "name": "VoteFinalized",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "node",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "bytes32",
                    "name": "imageHash",
                    "type": "bytes32"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "vote",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "weight",
                    "type": "uint256"
                }
            ],
            "name": "Voted",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "bytes32",
                    "name": "imageHash",
                    "type": "bytes32"
                }
            ],
            "name": "finalizeVote",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "bytes32",
                    "name": "imageHash",
                    "type": "bytes32"
                }
            ],
            "name": "getConsensus",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getImageCount",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "index",
                    "type": "uint256"
                }
            ],
            "name": "getImageData",
            "outputs": [
                {
                    "internalType": "bytes32",
                    "name": "imageHash",
                    "type": "bytes32"
                },
                {
                    "internalType": "string",
                    "name": "ipfsCID",
                    "type": "string"
                },
                {
                    "internalType": "uint256",
                    "name": "consensus",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "imageList",
            "outputs": [
                {
                    "internalType": "bytes32",
                    "name": "",
                    "type": "bytes32"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "nodeAddresses",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "name": "nodes",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "stake",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "reputation",
                    "type": "uint256"
                },
                {
                    "internalType": "bool",
                    "name": "exists",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "bytes32",
                    "name": "imageHash",
                    "type": "bytes32"
                },
                {
                    "internalType": "string",
                    "name": "ipfsCID",
                    "type": "string"
                }
            ],
            "name": "registerImage",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "stake",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "bytes32",
                    "name": "imageHash",
                    "type": "bytes32"
                },
                {
                    "internalType": "uint256",
                    "name": "voteScore",
                    "type": "uint256"
                }
            ],
            "name": "vote",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ]

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

    // Compute the keccak256 hash using ethers
    const fileHash = ethers.keccak256(fileBytes);
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

export default registerImage;