def Dafilab_Image_Classification(image_path):
    import torch
    from torchvision import transforms
    from PIL import Image
    from timm import create_model
    from huggingface_hub import hf_hub_download

    # Parameters
    IMG_SIZE = 380
    DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # Download model from HuggingFace Hub
    MODEL_PATH = hf_hub_download(repo_id="Dafilab/ai-image-detector", filename="model_epoch_8_acc_0.9859.pth")

    # Preprocessing
    transform = transforms.Compose([
        transforms.Resize(IMG_SIZE + 20),
        transforms.CenterCrop(IMG_SIZE),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
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
            ai_confidence = probs[0, 0].item()  # Confidence that the image is AI-generated
        return ai_confidence

    ai_confidence = predict_image(image_path)
    
    return ai_confidence

def jacoballessio_Image_Classification(image_path):
    import torch
    from PIL import Image
    from torchvision import transforms
    from transformers import ViTForImageClassification

    # Load the trained model
    model_path = 'vit_model.pth'
    model = ViTForImageClassification.from_pretrained('google/vit-base-patch16-224')
    model.classifier = torch.nn.Linear(model.classifier.in_features, 2)
    model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu')))
    model.eval()

    # Define the image preprocessing pipeline
    preprocess = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    def predict_image(image_path):
        # Load and preprocess the image
        image = Image.open(image_path).convert('RGB')
        inputs = preprocess(image).unsqueeze(0)

        # Perform inference
        with torch.no_grad():
            outputs = model(inputs).logits
            probs = torch.nn.functional.softmax(outputs, dim=1)
            ai_confidence = probs[0, 0].item()  # Confidence that the image is AI-generated
        return ai_confidence

    ai_confidence = predict_image(image_path)
    
    return ai_confidence


def is_image_AI_generated(image_path):
    # ai_confidence = Dafilab_Image_Classification(image_path)
    ai_confidence = jacoballessio_Image_Classification(image_path)
    return ai_confidence

