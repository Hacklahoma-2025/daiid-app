import json
import time
import random
import os
import ipfshttpclient
from web3 import Web3
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# -----------------------
# Configuration Variables
# -----------------------

# Use ETH_PROVIDER from the .env file
eth_provider = os.environ.get("ETH_PROVIDER")
if not eth_provider:
    raise Exception(
        "Please set the ETH_PROVIDER environment variable in your .env file.")
w3 = Web3(Web3.HTTPProvider(eth_provider))
if not w3.is_connected():
    raise Exception("Could not connect to the Ethereum node!")

# Load the contract artifact and extract the ABI
with open("./eth/artifacts/contracts/DAIID.sol/DAIID.json", "r") as f:
    artifact = json.load(f)
contract_abi = artifact["abi"]

# Replace with your deployed contract address
contract_address = w3.to_checksum_address("0xYourContractAddressHere")

# Instantiate the contract
contract = w3.eth.contract(address=contract_address, abi=contract_abi)

# Connect to the local IPFS node (ensure your IPFS daemon is running)
try:
    ipfs_client = ipfshttpclient.connect('/ip4/127.0.0.1/tcp/5001')
except Exception as e:
    raise Exception("Could not connect to the local IPFS node: " + str(e))

# Set up the account used by this node using environment variables
account_address = os.environ.get("ETH_PUBLIC_ADDRESS")
if not account_address:
    raise Exception(
        "Please set the ETH_PUBLIC_ADDRESS environment variable for your node's account.")

private_key = os.environ.get("ETH_PRIVATE_ADDRESS")
if not private_key:
    raise Exception(
        "Please set the ETH_PRIVATE_ADDRESS environment variable for your node's account.")

# -----------------------
# Placeholder AI Detection Function
# -----------------------


def detect_ai_probability(image_bytes):
    """
    Placeholder function to determine the likelihood that an image was AI-generated.
    Replace this function with your actual AI detection logic.
    Returns an integer between 0 and 100.
    """
    # For now, we return a random probability.
    return random.randint(0, 100)

# -----------------------
# Event Handling Function
# -----------------------


def handle_new_image_event(event):
    """
    Processes a new ImageRegistered event:
      - Downloads the image from IPFS using the provided CID.
      - Runs the AI detection function.
      - Posts a vote on the network with the detected probability.
    """
    print("New ImageRegistered event received:")
    print(event)

    # Extract the event arguments (keys depend on your contract's event definition)
    image_hash = event['args']['imageHash']
    ipfs_cid = event['args']['ipfsCID']
    print(f"Image hash: {image_hash}")
    print(f"IPFS CID: {ipfs_cid}")

    # Download the image from IPFS using the CID
    try:
        image_data = ipfs_client.cat(ipfs_cid)
        print(f"Downloaded image data of length: {len(image_data)} bytes")
    except Exception as e:
        print("Failed to download image from IPFS:", e)
        return

    # Run the AI detection (replace with your actual function later)
    probability = detect_ai_probability(image_data)
    print(f"Detected AI probability: {probability}")

    # Build the transaction to cast the vote
    nonce = w3.eth.get_transaction_count(account_address)
    txn = contract.functions.vote(image_hash, probability).buildTransaction({
        'from': account_address,
        'nonce': nonce,
        'gas': 2000000,
        'gasPrice': w3.to_wei('50', 'gwei')
    })

    # Sign the transaction with your private key
    signed_txn = w3.eth.account.sign_transaction(txn, private_key=private_key)
    # Send the transaction
    tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
    print("Vote transaction sent. Tx hash:", tx_hash.hex())

    # Wait for the transaction receipt
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    print("Transaction receipt:", receipt)

# -----------------------
# Main Listener Loop
# -----------------------


def main():
    print("Node application started. Listening for new image registration events...")
    # Create an event filter for ImageRegistered events, starting from the latest block
    event_filter = contract.events.ImageRegistered.createFilter(
        fromBlock='latest')
    while True:
        try:
            # Fetch any new events
            events = event_filter.get_new_entries()
            for event in events:
                handle_new_image_event(event)
        except Exception as e:
            print("Error while fetching events:", e)
        # Poll every 5 seconds
        time.sleep(5)


if __name__ == "__main__":
    main()
