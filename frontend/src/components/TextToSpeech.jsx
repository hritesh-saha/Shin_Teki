import React, { useState } from "react";

const TextToSpeech = ({ text }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);

    const startSpeaking = () => {
        if (!text) return;

        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = "en-US"; 
        speech.rate = 1;
        speech.pitch = 1;

        // Ensure previous speech is stopped before starting new one
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(speech);
        setIsSpeaking(true);

        speech.onend = () => setIsSpeaking(false);
    };

    const pauseSpeaking = () => {
        if (isSpeaking) {
            window.speechSynthesis.pause();
            setIsSpeaking(false);
        }
    };

    const resumeSpeaking = () => {
        if (!isSpeaking) {
            window.speechSynthesis.resume();
            setIsSpeaking(true);
        }
    };

    return (
        <div className="flex gap-3 mt-2">
            <button
                onClick={startSpeaking}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-md shadow-md"
            >
                ▶ Speak
            </button>
            <button
                onClick={pauseSpeaking}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md shadow-md"
            >
                ⏸ Pause
            </button>
            <button
                onClick={resumeSpeaking}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md shadow-md"
            >
                🔄 Resume
            </button>
        </div>
    );
};

export default TextToSpeech;
