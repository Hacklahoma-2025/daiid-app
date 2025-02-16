// import { getConsensus } from "./getConsensus.js";
// import { registerImage } from "./uploadRequest_new.js";

// import dotenv from "dotenv";

// dotenv.config();

// const ETH_PROVIDER = process.env.ETH_PROVIDER;
// const DAIID_ADDRESS = process.env.DAIID_ADDRESS;
// const IPFS_PROVIDER = process.env.IPFS_PROVIDER;
// const PRIVATE_KEY = process.env.ETH_PRIVATE_ADDRESS;
// const PUBLIC_ADDRESS = process.env.ETH_PUBLIC_ADDRESS;

const IPFS_GATEWAY="http://10.204.202.78:8080/"
const GANACHE_SERVER = "http://10.204.202.78:7545/"
const GANACHE_WS = "ws://10.204.202.78:7545"
const ETH_PROVIDER = "http://10.204.202.78:7545/"
const IPFS_PROVIDER = "/ip4/10.204.202.78/tcp/5001" 
const ETH_PUBLIC_ADDRESS = "0xa37a7f36657102aa32DB06B7877e26a92fB8b079"
const ETH_PRIVATE_ADDRESS = "0x45d8b6126fd598aa7bb62ac0426cb399f2b6c2e8f7d78a2147e83cfb1551c454"
const DAIID_ADDRESS = "0x7071f3c55c6E698065E370d2C34C75F4d92FF1C0"
const PRIVATE_KEY = ETH_PRIVATE_ADDRESS
const PUBLIC_ADDRESS = ETH_PUBLIC_ADDRESS

// getConsensus.mjs
// import dotenv from "dotenv";
// dotenv.config();
import { ethers } from "ethers";

// Load environment variables
// const ETH_PROVIDER = import.meta.env.VITE_ETH_PROVIDER;
// const DAIID_ADDRESS = import.meta.env.VITE_DAIID_ADDRESS;

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
    // const artifact = JSON.parse(fs.readFileSync("./artifacts/contracts/DAIID.sol/DAIID.json"));
    // const abi = artifact.abi;
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

    // Compute file hash
    const fileHash = ethers.keccak256(base64Image);
    console.log("Computed file hash:", fileHash);

    // Instantiate the contract (using the deployed address from .env)
    const contract = new ethers.Contract(DAIID_ADDRESS, abi, provider);

    // Call the getConsensus function on the contract
    const consensus = await contract.getConsensus(fileHash);
    return consensus.toString();
}


// uploadRequest.mjs
// import { ethers } from "ethers";
import { create } from "ipfs-http-client";

// Load environment variables
// const ETH_PROVIDER = import.meta.env.VITE_ETH_PROVIDER;
// const DAIID_ADDRESS = import.meta.env.VITE_DAIID_ADDRESS;
// const IPFS_PROVIDER = import.meta.env.VITE_IPFS_PROVIDER;
// const PRIVATE_KEY = import.meta.env.VITE_ETH_PRIVATE_ADDRESS;
// const PUBLIC_ADDRESS = import.meta.env.VITE_ETH_PUBLIC_ADDRESS;



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
        // const binaryString = window.atob(base64);
        const binaryString = atob(base64);
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

// export default registerImage;


// Helper function to convert a Blob to a base64 string.
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.images) {
    message.images.forEach(url => {
      fetch(url)
        .then(response => response.blob())
        .then(blob => blobToBase64(blob))
        .then(b64Image => {
          // Register the image into the blockchain
          return registerImage(b64Image);
        })
        .then(regResponse => {
          // Check if there was an error in the registration response.
          if (regResponse.error) {
            throw new Error(regResponse.error);
          }
          // If registration was successful, get the consensus.
          return getConsensus();
        })
        .then(consensusResult => {
          console.log("Consensus result:", consensusResult);
          // Notify the tab with the consensus result.
          if (sender.tab && sender.tab.id) {
            chrome.tabs.sendMessage(sender.tab.id, {
              imageUpdate: {
                imageUrl: url,
                consensus: consensusResult
              }
            });
          }
        })
        .catch(err => console.error("Error processing image:", err));
    });
  }
});