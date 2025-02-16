import json
import time
import random
import os
import requests
import magic  # or import magic from python-magic-bin on Windows
from web3 import Web3
from dotenv import load_dotenv
from ai_detection.image_prediction import is_image_AI_generated

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
with open("./DAIID.json", "r") as f:
    artifact = json.load(f)
contract_abi = artifact["abi"]

# Get the deployed contract address from the environment variable DAIID_ADDRESS
contract_address_env = os.environ.get("DAIID_ADDRESS")
if not contract_address_env:
    raise Exception(
        "Please set the DAIID_ADDRESS environment variable for your deployed contract.")
contract_address = w3.to_checksum_address(contract_address_env)

# Instantiate the contract
contract = w3.eth.contract(address=contract_address, abi=contract_abi)

# Get IPFS provider URL from the .env file
ipfs_provider = os.environ.get("IPFS_PROVIDER")
if not ipfs_provider:
    raise Exception(
        "Please set the IPFS_PROVIDER environment variable in your .env file.")
# We assume IPFS_PROVIDER is provided as an HTTP gateway URL, e.g., "http://10.204.202.78:8080"


# -----------------------
# IPFS Interaction using Requests
# -----------------------


def ipfs_cat(cid):
    """
    Fetch file content from IPFS using the HTTP gateway.
    """
    url = f"{ipfs_provider.rstrip('/')}/ipfs/{cid}"
    response = requests.get(url)
    if response.status_code != 200:
        raise Exception(
            f"IPFS cat failed: {response.status_code} {response.text}")
    return response.content

# -----------------------
# Placeholder AI Detection Function
# -----------------------


def detect_ai_probability(filee_path):
    """
    Placeholder function to determine the likelihood that an image was AI-generated.
    Replace this function with your actual AI detection logic.
    Returns an integer between 0 and 100.
    """
    return is_image_AI_generated(filee_path)

# -----------------------
# Event Handling Function
# -----------------------


def handle_new_image_event(event):
    """
    Processes a new ImageRegistered event:
      - Downloads the image from IPFS using the provided CID.
      - Saves the image to a folder with an appropriate file extension.
      - Runs the AI detection function.
      - Posts a vote on the network with the detected probability.
    """
    print("New ImageRegistered event received:")
    print(event)

    image_hash = event['args']['imageHash']
    ipfs_cid = event['args']['ipfsCID']
    print(f"Image hash: {image_hash}")
    print(f"IPFS CID: {ipfs_cid}")

    try:
        image_data = ipfs_cat(ipfs_cid)
        print(f"Downloaded image data of length: {len(image_data)} bytes")
    except Exception as e:
        print("Failed to download image from IPFS:", e)
        return

    image_base64 = image_data.decode("utf-8")

    # Run the AI detection (placeholder)
    probability = detect_ai_probability(image_base64)
    print(f"Detected AI probability: {probability}")

    # Build the transaction to cast the vote
    nonce = w3.eth.get_transaction_count(account_address)
    txn = contract.functions.vote(image_hash, probability).build_transaction({
        'from': account_address,
        'nonce': nonce,
        'gas': 2000000,
        'gasPrice': w3.to_wei('50', 'gwei')
    })

    signed_txn = w3.eth.account.sign_transaction(txn, private_key=private_key)
    tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
    print("Vote transaction sent. Tx hash:", tx_hash.hex())

    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    print("Transaction receipt:", receipt)

# -----------------------
# Main Listener Loop
# -----------------------


def main():
    print("Node application started. Listening for new image registration events...")
    event_filter = contract.events.ImageRegistered.create_filter(
        from_block='latest')

    # Build the stake transaction (assuming your account has enough Ether)
    stake_txn = contract.functions.stake().build_transaction({
        'from': account_address,
        'value': w3.to_wei(0.1, 'ether'),  # adjust the stake amount as needed
        'nonce': w3.eth.get_transaction_count(account_address),
        'gas': 200000,
        'gasPrice': w3.to_wei('50', 'gwei')
    })

    signed_stake_txn = w3.eth.account.sign_transaction(
        stake_txn, private_key=private_key)
    stake_tx_hash = w3.eth.send_raw_transaction(
        signed_stake_txn.raw_transaction)
    print("Stake transaction sent. Tx hash:", stake_tx_hash.hex())

    # Wait for the transaction to be mined (optional)
    receipt = w3.eth.wait_for_transaction_receipt(stake_tx_hash)
    print("Stake transaction mined.")
    while True:
        try:
            print("HERE")
            events = event_filter.get_new_entries()
            for event in events:
                handle_new_image_event(event)
        except Exception as e:
            print("Error while fetching events:", e)
        time.sleep(5)


if __name__ == "__main__":
    account_address = os.environ.get("ETH_PUBLIC_ADDRESS")
    if not account_address:
        raise Exception(
            "Please set the ETH_PUBLIC_ADDRESS environment variable for your node's account.")
    private_key = os.environ.get("ETH_PRIVATE_ADDRESS")
    if not private_key:
        raise Exception(
            "Please set the ETH_PRIVATE_ADDRESS environment variable for your node's account.")
    main()
