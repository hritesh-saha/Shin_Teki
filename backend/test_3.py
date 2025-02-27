import cv2
from cvzone.HandTrackingModule import HandDetector
from cvzone.ClassificationModule import Classifier
import numpy as np
import math
import time

cap = cv2.VideoCapture(1)
detector = HandDetector(maxHands=2)
classifier = Classifier("C:/Users/Ujan/Downloads/converted_keras (4)/keras_model.h5", 
                        "C:/Users/Ujan/Downloads/converted_keras (4)/labels.txt")

offset = 20
imgSize = 300
gesture_list = []  # Final list of gestures
last_gesture = None  # Track the last detected gesture
last_recognition_time = time.time()  # Initialize timer
current_display_gesture = None  # Gesture to be displayed

labels = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "T", "U", "V", "W", "X", "Y"]

while True:
    success, img = cap.read()
    imgOutput = img.copy()
    hands, img = detector.findHands(img)

    if hands:
        current_time = time.time()

        hand = hands[0]
        x, y, w, h = hand['bbox']

        imgWhite = np.ones((imgSize, imgSize, 3), np.uint8) * 255

        # Ensure the cropped region is within image bounds
        y1, y2 = max(0, y - offset), min(img.shape[0], y + h + offset)
        x1, x2 = max(0, x - offset), min(img.shape[1], x + w + offset)
        imgCrop = img[y1:y2, x1:x2]

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

        # Check if 1 second has passed since the last recognized gesture
        if current_time - last_recognition_time >= 2:
            prediction, index = classifier.getPrediction(imgWhite, draw=False)
            detected_gesture = labels[index]

            # Update only if a new gesture is detected
            if detected_gesture != last_gesture:
                gesture_list.append(detected_gesture)
                last_gesture = detected_gesture  # Update last recognized gesture
                last_recognition_time = time.time()  # Reset timer

            current_display_gesture = last_gesture  # Keep the gesture visible

        # Display the detected gesture on the screen
        if current_display_gesture:
            cv2.rectangle(imgOutput, (x - offset, y - offset - 70),
                          (x - offset + 400, y - offset + 10), (0, 255, 0), cv2.FILLED)
            cv2.putText(imgOutput, current_display_gesture, (x, y - 30),
                        cv2.FONT_HERSHEY_COMPLEX, 2, (0, 0, 0), 2)
            cv2.rectangle(imgOutput, (x - offset, y - offset),
                          (x + w + offset, y + h + offset), (0, 255, 0), 4)

        # Show the cropped and processed images
        cv2.imshow('ImageCrop', imgCrop)
        cv2.imshow('ImageWhite', imgWhite)

    cv2.imshow('Image', imgOutput)

    # Exit loop on 'q' key press
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Print final gesture list after exiting
print("Final Recognized Gestures:", " ".join(gesture_list))

cap.release()
cv2.destroyAllWindows()
