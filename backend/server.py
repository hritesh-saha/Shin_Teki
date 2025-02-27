from flask import Flask, request
from flask_socketio import SocketIO
import cv2
import numpy as np
from cvzone.HandTrackingModule import HandDetector
from cvzone.ClassificationModule import Classifier
import base64
import math

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# Initialize hand detector and classifier
detector = HandDetector(maxHands=1)
classifier = Classifier("converted_keras/keras_model.h5", "converted_keras/labels.txt")

labels = ["Hello", "Thank you", "Yes", "No", "Please"]
sentence = []

@socketio.on("image")
def process_image(data):
    global sentence
    
    # Decode the base64 image
    image_data = base64.b64decode(data.split(',')[1])
    np_arr = np.frombuffer(image_data, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    # Detect hand
    hands, img = detector.findHands(img, draw=False)
    if hands:
        hand = hands[0]
        x, y, w, h = hand["bbox"]
        imgSize = 300
        offset = 20

        imgWhite = np.ones((imgSize, imgSize, 3), np.uint8) * 255
        imgCrop = img[y - offset:y + h + offset, x - offset:x + w + offset]

        aspectRatio = h / w

        if aspectRatio > 1:
            k = imgSize / h
            wCal = math.ceil(k * w)
            imgResize = cv2.resize(imgCrop, (wCal, imgSize))
            wGap = math.ceil((imgSize - wCal) / 2)
            imgWhite[:, wGap: wCal + wGap] = imgResize
        else:
            k = imgSize / w
            hCal = math.ceil(k * h)
            imgResize = cv2.resize(imgCrop, (imgSize, hCal))
            hGap = math.ceil((imgSize - hCal) / 2)
            imgWhite[hGap: hCal + hGap, :] = imgResize

        # Classify the sign
        prediction, index = classifier.getPrediction(imgWhite, draw=False)
        word = labels[index]

        # Store the word to form a sentence
        if len(sentence) == 0 or word != sentence[-1]:
            sentence.append(word)

        if len(sentence) > 10:
            sentence.pop(0)

        formatted_sentence = " ".join(sentence)
        socketio.emit("sentence", formatted_sentence)

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, allow_unsafe_werkzeug=True)
