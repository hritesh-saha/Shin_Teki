import { useEffect, useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { io } from "socket.io-client";
import { ReactTyped } from "react-typed";
import { motion } from "framer-motion";

const socket = io("http://localhost:5000"); // Connect to Flask backend

function WebcamVideo({ isCapturing, setIsCapturing }) {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);

    const captureFrame = useCallback(() => {
        if (!isCapturing) return;

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
                setIsCapturing(false);
            } else if (event.key === "s") {
                setIsCapturing(true);
            }
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [setIsCapturing]);

    return (
        <div className="relative w-full h-full">
            <Webcam
                ref={webcamRef}
                className="absolute inset-0 w-full h-full object-cover"
                screenshotFormat="image/jpeg"
            />
            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="absolute inset-0 w-full h-full bg-transparent"
            />
        </div>
    );
}

function MessageBox({ recognizedText, isCapturing }) {
    return (
        <div className="p-4 w-full mx-auto bg-[#FF007F] rounded-lg shadow-md">
            <h2 className="text-xl text-white font-semibold mb-2">Detected Sentence</h2>
            <div className="p-3 bg-white border rounded-md min-h-[50px]">
                <ReactTyped strings={[recognizedText || "Waiting for Input..."]} typeSpeed={70} backSpeed={50} />
                <p>Status: {isCapturing ? "Capturing..." : "Paused"}</p>
            </div>
        </div>
    );
}

export default function SignLanguageRecognition() {
    const [recognizedText, setRecognizedText] = useState("");
    const [isCapturing, setIsCapturing] = useState(true);

    useEffect(() => {
        socket.on("sentence", (data) => {
            setRecognizedText(data);
        });

        return () => socket.off("sentence");
    }, []);

    return (
         <div className="bg-neutral-800 min-h-screen flex flex-col justify-center items-center space-y-6">
          
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}  transition={{ duration: 2 }}  className="leading-tight flex justify-center items-center w-screen border-b-4 border-[#FF007F] mb-6 text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-[#FF007F]  md:text-5xl sm:text-4xl text-xl font-bold mt-2"><div className="mx-4">Shin Teki</div> <div><img  className="h-[40px] w-[40px]" src="/ShinTeki.jpeg" alt="Shin Teki" /></div> </motion.div>
         <motion.div whileInView={{ opacity: 1, x: 0 }} initial={{ opacity: 0, x: -100 }} transition={{ duration: 1 }} 
    className="bg-gray-500 border-4 border-[#FF007F] w-[80vw] max-w-[800px] h-[60vh] max-h-[600px] flex justify-center items-center">
    <WebcamVideo isCapturing={isCapturing} setIsCapturing={setIsCapturing} />
</motion.div>
         <motion.div whileInView={{opacity:1,x:0}} initial={{opacity:0,x:100}} transition={{duration:1}} className="my-10">
         <MessageBox recognizedText={recognizedText} isCapturing={isCapturing} />
         </motion.div>
         
     </div> 
    );
}
