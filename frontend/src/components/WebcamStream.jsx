// import { useEffect, useRef, useState, useCallback } from "react";
// import Webcam from "react-webcam";
// import { io } from "socket.io-client";
// import { ReactTyped } from "react-typed";
// import { motion } from "framer-motion";
// import TextToSpeech from "./TextToSpeech";

// const socket = io("http://localhost:5000"); // Connect to Flask backend

// function WebcamVideo({ isCapturing, setIsCapturing }) {
//     const webcamRef = useRef(null);
//     const canvasRef = useRef(null);

//     const captureFrame = useCallback(() => {
//         if (!isCapturing) return;

//         const webcam = webcamRef.current;
//         const canvas = canvasRef.current;
//         if (webcam && webcam.video.readyState === 4) {
//             const ctx = canvas.getContext("2d");
//             ctx.drawImage(webcam.video, 0, 0, canvas.width, canvas.height);

//             // Convert frame to base64
//             const imageData = canvas.toDataURL("image/jpeg");

//             // Send frame to backend
//             socket.emit("image", imageData);
//         }
//     }, [isCapturing]);

//     useEffect(() => {
//         if (isCapturing) {
//             const interval = setInterval(captureFrame, 1000); // Capture frame every 1s
//             return () => clearInterval(interval);
//         }
//     }, [captureFrame, isCapturing]);

//     useEffect(() => {
//         const handleKeyPress = (event) => {
//             if (event.key === "q") {
//                 setIsCapturing(false);
//             } else if (event.key === "s") {
//                 setIsCapturing(true);
//             }
//         };

//         window.addEventListener("keydown", handleKeyPress);
//         return () => window.removeEventListener("keydown", handleKeyPress);
//     }, [setIsCapturing]);

//     return (
//         <div className="relative w-full h-full">
//             <Webcam
//                 ref={webcamRef}
//                 className="absolute inset-0 w-full h-full object-cover"
//                 screenshotFormat="image/jpeg"
//             />
//             <canvas
//                 ref={canvasRef}
//                 width={800}
//                 height={600}
//                 className="absolute inset-0 w-full h-full bg-transparent"
//             />
//         </div>
//     );
// }

// const MessageBox = ({ recognizedText, isCapturing }) => {
//     return (
//         <div className="p-4 w-full my-1 mx-auto bg-[#FF007F] rounded-lg shadow-md">
//             <div className="mx-auto bg-[#FF007F] text-white">
//                 Press Q to pause and S to start capturing
//             </div>
//             <h2 className="text-xl text-white font-semibold mb-2">Detected Sentence</h2>
//             <div className="p-3 bg-white border rounded-md min-h-[50px]">
//                 <ReactTyped
//                     strings={[
//                         Array.isArray(recognizedText)
//                             ? recognizedText.join("")
//                             : recognizedText?.toString() || "Waiting for Input..."
//                     ]}
//                     typeSpeed={70}
//                     backSpeed={50}
//                 />
//                 <p className="bg-neutral-500 text-white rounded-full p-2">
//                     Status: {isCapturing ? "Capturing..." : "Paused"}
//                 </p>
//             </div>

//             {/* ✅ Add Text-to-Speech Component */}
//             {recognizedText && <TextToSpeech text={recognizedText} />}
//         </div>
//     );
// };

// export default function SignLanguageRecognition() {
//     const [recognizedText, setRecognizedText] = useState("");
//     const [isCapturing, setIsCapturing] = useState(false); // Initially not capturing

//     useEffect(() => {
//         socket.on("sentence", (data) => {
//             setRecognizedText(data);
//         });

//         return () => socket.off("sentence");
//     }, []);

//     return (
//         <div className="bg-neutral-800 min-h-screen flex flex-col justify-center items-center space-y-6">
//             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 2 }}
//                 className="leading-tight flex justify-center items-center w-screen border-b-4 border-[#FF007F] mb-6 text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-[#FF007F] md:text-5xl sm:text-4xl text-xl font-bold mt-2">
//                 <div className="mx-4">Shin Teki</div>
//                 <div><img className="h-[40px] w-[40px]" src="/ShinTeki.jpeg" alt="Shin Teki" /></div>
//             </motion.div>
//             <motion.div whileInView={{ opacity: 1, x: 0 }} initial={{ opacity: 0, x: -100 }} transition={{ duration: 1 }}
//                 className="bg-gray-500 border-4 border-[#FF007F] w-[80vw] max-w-[800px] h-[60vh] max-h-[600px] flex justify-center items-center">
//                 <WebcamVideo isCapturing={isCapturing} setIsCapturing={setIsCapturing} />
//             </motion.div>
//             <motion.div whileInView={{ opacity: 1, x: 0 }} initial={{ opacity: 0, x: 100 }} transition={{ duration: 1 }} className="my-2">
//                 <MessageBox recognizedText={recognizedText} isCapturing={isCapturing} />
//             </motion.div>
//         </div>
//     );
// }

import { useEffect, useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { io } from "socket.io-client";
import { ReactTyped } from "react-typed";
import { motion } from "framer-motion";
import TextToSpeech from "./TextToSpeech";
import Web3 from "web3";
import Shin from "../contracts/Shin.json";
import { useNavigate } from "react-router-dom";

const socket = io("http://localhost:5000"); // Connect to Flask backend

export default function SignLanguageRecognition() {
    const [recognizedText, setRecognizedText] = useState("");
    const [isCapturing, setIsCapturing] = useState(false); // Initially not capturing
    const [state, setState] = useState({ web3: null, contract: null });
    const navigate = useNavigate();

    useEffect(() => {
        const provider = new Web3.providers.HttpProvider("http://127.0.0.1:7545");
        async function init() {
            try {
                const web3 = new Web3(provider);
                const networkId = await web3.eth.net.getId();
                const deployedNetwork = Shin.networks[networkId];
                if (deployedNetwork) {
                    const contract = new web3.eth.Contract(Shin.abi, deployedNetwork.address);
                    setState({ web3, contract });
                } else {
                    console.error("Contract not deployed to detected network.");
                }
            } catch (error) {
                console.error("Error initializing Web3:", error);
            }
        }
        init();
    }, []);

    useEffect(() => {
        socket.on("sentence", (data) => {
            setRecognizedText(data);
        });
        return () => socket.off("sentence");
    }, []);

    const storeStringOnBlockchain = async (text) => {
        if (!state.web3 || !state.contract) {
            console.error("Web3 or contract not initialized yet.");
            return;
        }
        try {
            const accounts = await state.web3.eth.getAccounts();
            await state.contract.methods.storeString(text).send({ from: accounts[0] });
            console.log("Stored on blockchain:", text);
        } catch (error) {
            console.error("Error storing string:", error);
        }
    };

    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.key === "q") {
                setIsCapturing(false);
                if (recognizedText) {
                    storeStringOnBlockchain(recognizedText);
                }
            } else if (event.key === "s") {
                setIsCapturing(true);
            }
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [recognizedText, state.contract]);

    return (
        <div className="bg-neutral-800 min-h-screen flex flex-col justify-center items-center space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 2 }}
                className="leading-tight flex justify-center items-center w-screen border-b-4 border-[#FF007F] mb-6 text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-[#FF007F] md:text-5xl sm:text-4xl text-xl font-bold mt-2">
                <div className="mx-4">Shin Teki</div>
                <div><img className="h-[40px] w-[40px]" src="/ShinTeki.jpeg" alt="Shin Teki" /></div>
            </motion.div>
            <button onClick={() => navigate("/chain")}
                className="px-4 py-2 bg-[#FF007F] text-white font-bold rounded-md shadow-md hover:bg-[#e60073] transition">
                Go to Shin Page
            </button>
            <motion.div whileInView={{ opacity: 1, x: 0 }} initial={{ opacity: 0, x: -100 }} transition={{ duration: 1 }}
                className="bg-gray-500 border-4 border-[#FF007F] w-[80vw] max-w-[800px] h-[60vh] max-h-[600px] flex justify-center items-center">
                <WebcamVideo isCapturing={isCapturing} setIsCapturing={setIsCapturing} />
            </motion.div>
            <motion.div whileInView={{ opacity: 1, x: 0 }} initial={{ opacity: 0, x: 100 }} transition={{ duration: 1 }} className="my-2">
                <MessageBox recognizedText={recognizedText} isCapturing={isCapturing} />
            </motion.div>
        </div>
    );
}

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

            const imageData = canvas.toDataURL("image/jpeg");
            socket.emit("image", imageData);
        }
    }, [isCapturing]);

    useEffect(() => {
        if (isCapturing) {
            const interval = setInterval(captureFrame, 1000);
            return () => clearInterval(interval);
        }
    }, [captureFrame, isCapturing]);

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

const MessageBox = ({ recognizedText, isCapturing }) => {
    return (
        <div className="p-4 w-full my-1 mx-auto bg-[#FF007F] rounded-lg shadow-md">
            <div className="mx-auto bg-[#FF007F] text-white">Press Q to pause and S to start capturing</div>
            <h2 className="text-xl text-white font-semibold mb-2">Detected Sentence</h2>
            <div className="p-3 bg-white border rounded-md min-h-[50px]">
                <ReactTyped strings={[recognizedText || "Waiting for Input..."]} typeSpeed={70} backSpeed={50} />
                <p className="bg-neutral-500 text-white rounded-full p-2">Status: {isCapturing ? "Capturing..." : "Paused"}</p>
            </div>
            {recognizedText && <TextToSpeech text={recognizedText} />}
        </div>
    );
};
