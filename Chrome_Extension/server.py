from flask import Flask, request, jsonify
import requests
from PIL import Image
from io import BytesIO

import sys
sys.path.append("../AI_Image_Detection/")
import image_prediction 

app = Flask(__name__)

save_path = "images/image.jpg"

@app.route("/process", methods=["POST"])
def process():
    data = request.get_json()
    image_url = data.get("imageUrl")
    if not image_url:
        return jsonify({"error": "No image URL provided"}), 400
    
    try:
        # Download the image
        response = requests.get(image_url, stream=True)
        response.raise_for_status()  # Check for HTTP errors

        # Save the image directly if it's already a JPG
        if response.headers['Content-Type'] == 'image/jpeg':
            with open(save_path, 'wb') as f:
                f.write(response.content)
            print(f"Image saved as {save_path}")

        # Convert to JPG if the image is in another format (e.g., PNG, WebP)
        else:
            img = Image.open(BytesIO(response.content))
            img.convert("RGB").save(save_path, "JPEG")
            print(f"Image converted and saved as {save_path}")

    except Exception as e:
        print(f"Error: {e}")
    
    # Run the AI model on the image
    result = image_prediction.is_image_AI_generated(save_path)
    
    return jsonify({"number": result}), 200

if __name__ == "__main__":
    app.run(port=5000)
