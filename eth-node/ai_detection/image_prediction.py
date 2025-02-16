import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()
MODEL_NUMBER = os.environ.get("MODEL_NUMBER")


def test(image_path):
    import torch
    from torchvision import transforms
    from PIL import Image
    from timm import create_model
    from huggingface_hub import hf_hub_download

    # Parameters
    IMG_SIZE = 380
    DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    LABEL_MAPPING = {1: "human", 0: "ai"}

    # Download model from HuggingFace Hub
    MODEL_PATH = hf_hub_download(
        repo_id="Dafilab/ai-image-detector", filename="model_epoch_8_acc_0.9859.pth")

    # Preprocessing
    transform = transforms.Compose([
        transforms.Resize(IMG_SIZE + 20),
        transforms.CenterCrop(IMG_SIZE),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[
                             0.229, 0.224, 0.225]),
    ])

    # Load model
    model = create_model('efficientnet_b4', pretrained=False, num_classes=2)
    model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
    model.to(DEVICE).eval()

    # Prediction function
    def predict_image(image_path):
        img = Image.open(image_path).convert("RGB")
        img = transform(img).unsqueeze(0).to(DEVICE)
        with torch.no_grad():
            logits = model(img)
            probs = torch.nn.functional.softmax(logits, dim=1)
            predicted_class = torch.argmax(probs, dim=1).item()
            confidence = probs[0, predicted_class].item()
        return LABEL_MAPPING[predicted_class], confidence

    # Example usage
    label, confidence = predict_image(image_path)
    print(f"Label: {label}, Confidence: {confidence:.2f}")

# https://huggingface.co/jacoballessio/ai-image-detect/tree/main


def jacoballessio_Image_Classification(image_path):
    # Use a pipeline as a high-level helper
    from transformers import pipeline

    pipe = pipeline("image-classification",
                    model="jacoballessio/ai-image-detect")

    # Prediction
    result = pipe(image_path)

    ai_confidence = -1
    for i in range(len(result)):
        if result[i]['label'] == 'fake':
            ai_confidence = result[i]['score']
            break

    # print(result)
    return ai_confidence

# https://huggingface.co/Organika/sdxl-detector/tree/main


def sdxl_Image_Classification(image_path):
    # Use a pipeline as a high-level helper
    from transformers import pipeline

    pipe = pipeline("image-classification", model="Organika/sdxl-detector")

    # Prediction
    result = pipe(image_path)
    # ai_confidence = result[0]['score']  # Confidence that the image is AI-generated

    ai_confidence = -1
    for i in range(len(result)):
        if result[i]['label'] == 'artificial':
            ai_confidence = result[i]['score']
            break

    # print(result)
    return ai_confidence

# https://huggingface.co/jacoballessio/ai-image-detect-distilled/tree/main


def jacoballessio_distilled_Image_Classification(image_path):
    # Use a pipeline as a high-level helper
    from transformers import pipeline

    pipe = pipeline("image-classification",
                    model="jacoballessio/ai-image-detect-distilled")

    # Prediction
    result = pipe(image_path)
    # ai_confidence = result[0]['score']  # Confidence that the image is AI-generated

    ai_confidence = -1
    for i in range(len(result)):
        if result[i]['label'] == 'fake':
            ai_confidence = result[i]['score']
            break

    return ai_confidence

# https://huggingface.co/dima806/ai_vs_real_image_detection/tree/main


def dima806_Image_Classification(image_path):
    # Use a pipeline as a high-level helper
    from transformers import pipeline

    pipe = pipeline("image-classification",
                    model="dima806/ai_vs_real_image_detection")

    # Prediction
    result = pipe(image_path)

    # get the confidence that the image is FAKE
    # there will be an array of 2 elements, find the one with the label 'FAKE'
    ai_confidence = -1
    for i in range(len(result)):
        if result[i]['label'] == 'FAKE':
            ai_confidence = result[i]['score']
            break

    return ai_confidence

# https://huggingface.co/Hemg/AI-VS-REAL-IMAGE-DETECTION


def Hemg_Image_Classification(image_path):
    # Use a pipeline as a high-level helper
    from transformers import pipeline

    pipe = pipeline("image-classification",
                    model="Hemg/AI-VS-REAL-IMAGE-DETECTION")

    # Prediction
    result = pipe(image_path)

    # get the confidence that the image is FAKE
    # there will be an array of 2 elements, find the one with the label 'FAKE'
    ai_confidence = -1
    for i in range(len(result)):
        if result[i]['label'] == 'FAKE':
            ai_confidence = result[i]['score']
            break

    # print(result)
    return ai_confidence

# Not fully setup because it is bad


def MobileNetV3Small_Image_Classification(image_path):
    import torch
    import torchvision.models as models

    # Load pre-trained MobileNetV3-Small
    # model = models.mobilenet_v3_small(weights='DEFAULT')
    # model = models.mobilenet_v3_small(weights=models.MobileNet_V3_Small_Weights.IMAGENET1K_V1)
    model = models.mobilenet_v3_large(
        weights=models.MobileNet_V3_Large_Weights.IMAGENET1K_V2)

    # Replace the final classifier for binary output (real=0, AI=1)
    # model.classifier[3] = torch.nn.Linear(in_features=1024, out_features=1)
    model.classifier[3] = torch.nn.Linear(in_features=1280, out_features=1)
    model.classifier.append(torch.nn.Sigmoid())  # Add sigmoid for probability

    # Load pre-trained weights (if available)
    # model.load_state_dict(torch.load('mobilenetv3_real_vs_ai.pth'))

    from torchvision import transforms
    from PIL import Image

    def preprocess_image(img_path):
        transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[
                                 0.229, 0.224, 0.225]),
        ])
        img = Image.open(img_path).convert('RGB')
        return transform(img).unsqueeze(0)  # Add batch dimension

    def predict(image_path):
        model.eval()  # Set model to evaluation mode
        input_tensor = preprocess_image(image_path)
        with torch.no_grad():
            output = model(input_tensor)
        probability = output.sigmoid().item()  # Convert logit to probability
        return "AI-generated" if probability > 0.5 else "Real", probability

    # Example usage
    result, confidence = predict(image_path)
    print(f"Prediction: {result} (Confidence: {confidence:.2f})")

    return -1


def is_image_AI_generated(image_path):
    """
    Returns the confidence that the image is AI-generated (0-1)
    0: Real Image
    1: AI-generated Image
    -1: Error

    Used models: 
    GOOD:
    - jacoballessio_Image_Classification
    - sdxl_Image_Classification
    EH:
    - dima806_Image_Classification
    """
    model = {
        "1": jacoballessio_Image_Classification,
        "2": sdxl_Image_Classification,
        "3": jacoballessio_distilled_Image_Classification,
    }[MODEL_NUMBER]
    # GOOD (Great at classifying real images)
    ai_confidence = model(image_path)
    # ai_confidence = sdxl_Image_Classification(image_path) # GOOD, (Great at AI detection)
    # ai_confidence = jacoballessio_distilled_Image_Classification(image_path) # KINDA ASS
    # ai_confidence = dima806_Image_Classification(image_path) # EH
    # ai_confidence = Hemg_Image_Classification(image_path) # Pretty bad
    # ai_confidence = MobileNetV3Small_Image_Classification(image_path) # ASS
    return ai_confidence
