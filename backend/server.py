from flask import Flask
from flask_socketio import SocketIO
import cv2
import numpy as np
from cvzone.HandTrackingModule import HandDetector
from cvzone.ClassificationModule import Classifier
import base64
import math
import os
#import openai 

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

## Define paths (relative to backend folder)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # Get the directory of server.py
MODEL_PATH = os.path.join(BASE_DIR, "keras_model-1.h5")
LABELS_PATH = os.path.join(BASE_DIR, "labels-2.txt")

# Ensure model and labels exist
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Error: {MODEL_PATH} not found!")
if not os.path.exists(LABELS_PATH):
    raise FileNotFoundError(f"Error: {LABELS_PATH} not found!")

# Initialize Hand Detector
detector = HandDetector(maxHands=1)

# Initialize Classifier
try:
    classifier = Classifier(MODEL_PATH, LABELS_PATH)
    labels = ["A", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "T", "U", "V", "W", "X", "Y"]
    print("Classifier initialized successfully!")
except Exception as e:
    raise RuntimeError(f"Error initializing classifier: {e}")

#import google.generativeai as genai

# def refine_sentence(sentence_list):
#     """Use Google Gemini (PaLM API) to refine the sentence structure if at least 3 words are detected"""
#     if len(sentence_list) < 3:
#         return " ".join(sentence_list)  # Return raw words if fewer than 3
    
#     prompt = f"Make this sequence of letter into a proper, concise sentence: {' '.join(sentence_list)}"
    
#     try:
#         genai.configure(api_key="YOUR-API-KEY")  # Replace with your actual API key
#         model = genai.GenerativeModel("gemini-2.0-flash")
        
#         response = model.generate_content(prompt)
        
#         return response.text.strip()
#     except Exception as e:
#         print(f"Gemini API Error: {e}")
#         return " ".join(sentence_list)  # Fallback to raw sentence

sentence = []
#refined_sentence=[]

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

        # Extract hand landmarks
        hand = hands[0]
        x, y, w, h = hand["bbox"]
        hand_coordinates = hand["lmList"]  # List of hand landmark coordinates
        
        # Emit hand coordinates
        socketio.emit("hand_coordinates", hand_coordinates)
        
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
        #refined_sentence = refine_sentence(sentence)
        print(f"Refined sentence: {sentence}")

        # Emit refined sentence
        socketio.emit("sentence", sentence)

    except Exception as e:
        print(f"Error processing image: {e}")

if __name__ == "__main__":
    print("Server running on http://0.0.0.0:5000")
    socketio.run(app, host="0.0.0.0", port=5000)
