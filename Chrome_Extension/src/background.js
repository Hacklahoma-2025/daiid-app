// Configuration constants
const IPFS_GATEWAY = "http://10.204.202.78:8080/";
const GANACHE_SERVER = "http://10.204.202.78:7545/";
const GANACHE_WS = "ws://10.204.202.78:7545";
const ETH_PROVIDER = "http://10.204.202.78:7545/";
const IPFS_PROVIDER = "/ip4/10.204.202.78/tcp/5001";
const ETH_PUBLIC_ADDRESS = "0x76081A764f3670420855aB215bB338aa1D30DD70";
const ETH_PRIVATE_ADDRESS = "0x83767138edbb35930c0b20b110260bf513503939e7d5e95eab5fd38e7253e3f8";
const DAIID_ADDRESS = "0xb21D11A3dc0558Acdcb8d02fbeb1F47312C17495";
const PRIVATE_KEY = ETH_PRIVATE_ADDRESS;
const PUBLIC_ADDRESS = ETH_PUBLIC_ADDRESS;

// Import required libraries
import { ethers } from "ethers";
import { create } from "ipfs-http-client";

// Ensure required environment variables (or constants) are set
if (!ETH_PROVIDER || !DAIID_ADDRESS) {
    throw new Error("Missing required configuration for ETH_PROVIDER or DAIID_ADDRESS.");
}

// getConsensus function wrapped in try/catch
const getConsensus = async (base64Image) => {
    try {
        console.log("getConsensus called");

        // Set up read-only provider
        const provider = new ethers.JsonRpcProvider(ETH_PROVIDER);

        // Contract ABI (update with your full ABI if needed)
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
      ];

      const base64Data = base64Image.includes(",") ? base64Image.split(",")[1] : base64Image;
      const base64ToUint8Array = (base64) => {
          const binaryString = atob(base64);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
              bytes[i] = binaryString.charCodeAt(i);
          }
          return bytes;
      };
      const fileBytes = base64ToUint8Array(base64Data);

        // Compute file hash using ethers.keccak256.
        // Assumes base64Image is a string representing the file data.
        const fileHash = ethers.keccak256(fileBytes);
        console.log("Computed file hash:", fileHash);

        // Instantiate the contract
        const contract = new ethers.Contract(DAIID_ADDRESS, abi, provider);

        // Call the getConsensus function and return the result
        const consensus = await contract.getConsensus(fileHash);
        return consensus.toString();
    } catch (err) {
        console.error("Error getting consensus:", err);
        return { error: err.message };
    }
};

// registerImage function wrapped in try/catch
const registerImage = async (base64Image) => {
    try {
        console.log("registerImage called");
        // Set up provider and wallet
        const provider = new ethers.JsonRpcProvider(ETH_PROVIDER);
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

        // Contract ABI (update with your full ABI if needed)
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
      ];

        // Instantiate the contract
        const contract = new ethers.Contract(DAIID_ADDRESS, abi, wallet);

        // Set up IPFS client
        const ipfs = create({ url: IPFS_PROVIDER });

        // Upload image to IPFS
        console.log("Uploading file to IPFS...");
        const result = await ipfs.add(base64Image);
        const cid = result.cid.toString();
        console.log("File uploaded to IPFS with CID:", cid);

        // Convert base64 to Uint8Array
        // Remove any metadata prefix if present (e.g., "data:image/png;base64,")
        const base64Data = base64Image.includes(",") ? base64Image.split(",")[1] : base64Image;
        const base64ToUint8Array = (base64) => {
            const binaryString = atob(base64);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes;
        };
        const fileBytes = base64ToUint8Array(base64Data);

        // Compute the keccak256 hash of the file
        const fileHash = ethers.keccak256(fileBytes);
        console.log("Computed file hash:", fileHash);

        // Register the image on-chain
        console.log("Registering image on-chain...");
        const tx = await contract.registerImage(fileHash, cid);
        const receipt = await tx.wait();
        console.log("Image registered on-chain. Transaction hash:", receipt.transactionHash);
    } catch (err) {
        console.error("Error uploading file:", err);
        return { error: err.message };
    }
};

// Helper function to convert a Blob to a base64 string.
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = (err) => {
            console.error("Error reading blob:", err);
            reject(err);
        };
        reader.readAsDataURL(blob);
    });
}

// chrome.runtime message listener
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.images) {
        for (const url of message.images) {
            try {
                // Fetch the image from URL
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Network response not OK for ${url}. Status: ${response.status}`);
                }
                const blob = await response.blob();

                // Convert blob to base64 string
                const b64Image = await blobToBase64(blob);

                // Register image on-chain via IPFS and blockchain registration function
                await registerImage(b64Image);

                // Fetch consensus result for the image
                const consensusResult = await getConsensus(b64Image);
                console.log("Consensus result:", consensusResult);

                // Send message back to the originating tab with results
                if (sender.tab && sender.tab.id) {
                    chrome.tabs.sendMessage(sender.tab.id, {
                        imageUpdate: {
                            imageUrl: url,
                            consensus: consensusResult
                        }
                    });
                }
            } catch (err) {
                console.error(`Error processing image at URL ${url}:`, err);
            }
            // sleep for 1 second to avoid rate limiting
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }
});