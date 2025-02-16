import os
from dotenv import load_dotenv
import base64
from PIL import Image
from io import BytesIO

# Load environment variables from .env file
load_dotenv()
MODEL_NUMBER = os.environ.get("MODEL_NUMBER")


def decode_base64_image(base64_str):
    """
    Decodes a Base64 encoded image string and returns a PIL.Image.
    If the string contains a data URI header, it will be removed.
    """
    if base64_str.startswith("data:image"):
        header, base64_data = base64_str.split(",", 1)
    else:
        base64_data = base64_str

    image_data = base64.b64decode(base64_data)
    return Image.open(BytesIO(image_data)).convert("RGB")


def image_to_base64(image_path):
    """
    Encodes an image file to a Base64 string.
    """
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


# https://huggingface.co/jacoballessio/ai-image-detect/tree/main
def jacoballessio_Image_Classification(image_input):
    from transformers import pipeline

    pipe = pipeline("image-classification",
                    model="jacoballessio/ai-image-detect")

    image = decode_base64_image(image_input)

    result = pipe(image)

    ai_confidence = -1
    for item in result:
        if item['label'] == 'fake':
            ai_confidence = item['score']
            break
    return ai_confidence

# https://huggingface.co/Organika/sdxl-detector/tree/main


def sdxl_Image_Classification(image_input):
    from transformers import pipeline

    pipe = pipeline("image-classification", model="Organika/sdxl-detector")

    image = decode_base64_image(image_input)

    result = pipe(image)
    ai_confidence = -1
    for item in result:
        if item['label'] == 'artificial':
            ai_confidence = item['score']
            break
    return ai_confidence

# https://huggingface.co/jacoballessio/ai-image-detect-distilled/tree/main


def jacoballessio_distilled_Image_Classification(image_input):
    from transformers import pipeline

    pipe = pipeline("image-classification",
                    model="jacoballessio/ai-image-detect-distilled")

    image = decode_base64_image(image_input)

    result = pipe(image)
    ai_confidence = -1
    for item in result:
        if item['label'] == 'fake':
            ai_confidence = item['score']
            break
    return ai_confidence

# https://huggingface.co/dima806/ai_vs_real_image_detection/tree/main


def dima806_Image_Classification(image_input):
    from transformers import pipeline

    pipe = pipeline("image-classification",
                    model="dima806/ai_vs_real_image_detection")

    image = decode_base64_image(image_input)

    result = pipe(image)
    ai_confidence = -1
    for item in result:
        if item['label'] == 'FAKE':
            ai_confidence = item['score']
            break
    return ai_confidence

# https://huggingface.co/Hemg/AI-VS-REAL-IMAGE-DETECTION


def Hemg_Image_Classification(image_input):
    from transformers import pipeline

    pipe = pipeline("image-classification",
                    model="Hemg/AI-VS-REAL-IMAGE-DETECTION")

    image = decode_base64_image(image_input)

    result = pipe(image)
    ai_confidence = -1
    for item in result:
        if item['label'] == 'FAKE':
            ai_confidence = item['score']
            break
    return ai_confidence

# Optionally, update the MobileNetV3-based classifier if you want to support base64.


def MobileNetV3Small_Image_Classification(image_input):
    import torch
    import torchvision.models as models
    from torchvision import transforms

    # Load pre-trained MobileNetV3-Large (as per your current setup)
    model = models.mobilenet_v3_large(
        weights=models.MobileNet_V3_Large_Weights.IMAGENET1K_V2)

    # Modify classifier for binary output and add sigmoid activation
    model.classifier[3] = torch.nn.Linear(in_features=1280, out_features=1)
    model.classifier.append(torch.nn.Sigmoid())

    def preprocess_image(img):
        transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                 std=[0.229, 0.224, 0.225]),
        ])
        return transform(img).unsqueeze(0)

    image = decode_base64_image(image_input)

    model.eval()
    input_tensor = preprocess_image(image)
    with torch.no_grad():
        output = model(input_tensor)
    probability = output.sigmoid().item()
    result_label = "AI-generated" if probability > 0.5 else "Real"
    print(f"Prediction: {result_label} (Confidence: {probability:.2f})")
    return probability


def is_image_AI_generated(image_base64):
    """
    Returns the confidence that the image is AI-generated (0-1)
    0: Real Image
    1: AI-generated Image
    -1: Error

    Models used depend on MODEL_NUMBER environment variable.
    """
    model = {
        "1": jacoballessio_Image_Classification,
        "2": sdxl_Image_Classification,
        "3": jacoballessio_distilled_Image_Classification,
    }[MODEL_NUMBER]
    ai_confidence = model(image_base64)
    return ai_confidence
