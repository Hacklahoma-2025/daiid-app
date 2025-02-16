import os
from dotenv import load_dotenv
import requests
import wget

load_dotenv()

def get_file(cid, ):
    url = f"{os.getenv('IPFS_DOWNLOAD_URL')}{cid}"
    wget.download(url, "retrieved_file.MOV")







