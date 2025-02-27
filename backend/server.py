from flask import Flask
from flask_socketio import SocketIO
import cv2
import numpy as np
from cvzone.HandTrackingModule import HandDetector
from cvzone.ClassificationModule import Classifier
import base64
import math
import os
import openai 

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# Load model and labels safely
MODEL_PATH = "keras_model.h5"
LABELS_PATH = "labels.txt"

# OpenAI API Key (use environment variable for security)
openai.api_key = os.getenv("OPENAI_API_KEY", "your_default_key_here")

try:
    detector = HandDetector(maxHands=1)
    classifier = Classifier(MODEL_PATH, LABELS_PATH)
    labels = ["Hello", "Thank you", "Yes", "No", "Please"]
    sentence = []
except Exception as e:
    print(f"Error initializing models: {e}")

def refine_sentence(sentence_list):
    """Use OpenAI to refine the sentence structure if at least 3 words are detected"""
    if len(sentence_list) < 3:
        return " ".join(sentence_list)  # Return raw words if fewer than 3
    
    prompt = f"Make this sequence of words into a proper, coherent sentence: {' '.join(sentence_list)}"
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "system", "content": "You are an AI that corrects and structures sign language sentences."},
                      {"role": "user", "content": prompt}]
        )
        return response["choices"][0]["message"]["content"].strip()
    except Exception as e:
        print(f"OpenAI Error: {e}")
        return " ".join(sentence_list)  # Fallback to raw sentence

@socketio.on("image")
def process_image(data):
    global sentence
    try:
        # Decode base64 image
        image_data = base64.b64decode(data.split(',')[1])
        np_arr = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if img is None:
            print("Decoded image is None.")
            return

        # Detect hand
        hands, img = detector.findHands(img, draw=False)
        if not hands:
            print("No hand detected.")
            return

        # Crop the image
        hand = hands[0]
        x, y, w, h = hand["bbox"]
        h_img, w_img, _ = img.shape
        x, y, w, h = max(0, x), max(0, y), min(w, w_img - x), min(h, h_img - y)
        imgCrop = img[y:y+h, x:x+w]

        if imgCrop.size == 0:
            print("Error: Cropped image is empty.")
            return

        imgSize = 300
        offset = 20
        imgWhite = np.ones((imgSize, imgSize, 3), np.uint8) * 255

        aspectRatio = h / w
        if aspectRatio > 1:
            k = imgSize / h
            wCal = math.ceil(k * w)
            imgResize = cv2.resize(imgCrop, (wCal, imgSize))
            wGap = math.ceil((imgSize - wCal) / 2)
            imgWhite[:, wGap:wCal + wGap] = imgResize
        else:
            k = imgSize / w
            hCal = math.ceil(k * h)
            imgResize = cv2.resize(imgCrop, (imgSize, hCal))
            hGap = math.ceil((imgSize - hCal) / 2)
            imgWhite[hGap:hCal + hGap, :] = imgResize

        # Classify sign
        prediction, index = classifier.getPrediction(imgWhite, draw=False)
        word = labels[index]
        print(f"Predicted word: {word}")

        # Store sentence history
        if len(sentence) == 0 or word != sentence[-1]:
            sentence.append(word)

        # Refine sentence only if at least 3 words are detected
        refined_sentence = refine_sentence(sentence)
        print(f"Refined sentence: {refined_sentence}")

        # Emit refined sentence
        socketio.emit("sentence", refined_sentence)

    except Exception as e:
        print(f"Error processing image: {e}")

if __name__ == "__main__":
    print("Server running on http://0.0.0.0:5000")
    socketio.run(app, host="0.0.0.0", port=5000)
