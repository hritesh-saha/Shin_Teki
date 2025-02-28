import { useEffect, useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // Connect to Flask backend

export default function SignLanguageRecognition() {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const [recognizedText, setRecognizedText] = useState("");
    const [isCapturing, setIsCapturing] = useState(true); // State to control capturing

    useEffect(() => {
        socket.on("sentence", (data) => {
            setRecognizedText(data);
        });

        return () => socket.off("sentence");
    }, []);

    const captureFrame = useCallback(() => {
        if (!isCapturing) return; // Stop capturing if isCapturing is false

        const webcam = webcamRef.current;
        const canvas = canvasRef.current;
        if (webcam && webcam.video.readyState === 4) {
            const ctx = canvas.getContext("2d");
            ctx.drawImage(webcam.video, 0, 0, canvas.width, canvas.height);

            // Convert frame to base64
            const imageData = canvas.toDataURL("image/jpeg");

            // Send frame to backend
            socket.emit("image", imageData);
        }
    }, [isCapturing]);

    useEffect(() => {
        const interval = setInterval(captureFrame, 1000); // Capture frame every 1s
        return () => clearInterval(interval);
    }, [captureFrame]);

    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.key === "q") {
                setIsCapturing(false); // Stop capturing when 'q' is pressed
            } else if (event.key === "s") {
                setIsCapturing(true); // Start capturing when 's' is pressed
            }
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, []);

    return (
        <div className="container">
            <div style={{ position: "relative", width: "800px", height: "600px" }}>
                <Webcam
                    ref={webcamRef}
                    width={800}
                    height={600}
                    screenshotFormat="image/jpeg"
                />
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={600}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        zIndex: 2,
                        backgroundColor: "transparent"
                    }}
                />
            </div>
            <h3>Recognized Sentence:</h3>
            <p>{recognizedText}</p>
            <h4>Press 'Q' to Stop | Press 'S' to Start</h4>
            <p>Status: {isCapturing ? "Capturing..." : "Paused"}</p>
        </div>
    );
}
