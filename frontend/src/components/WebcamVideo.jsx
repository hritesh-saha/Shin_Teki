import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";
import RecordRTC from "recordrtc";

export default function WebcamVideo() {
    const webcamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const [recording, setRecording] = useState(false);
    const [recordedChunks, setRecordedChunks] = useState([]);

    const handleDataAvailable = useCallback(({ data }) => {
        if (data.size > 0) {
            setRecordedChunks(prev => [...prev, data]);
        }
    }, []);

    const handleStartCaptureClick = useCallback(() => {
        setRecording(true);
        mediaRecorderRef.current = RecordRTC(webcamRef.current.stream, {
            type: "video"
        });
        mediaRecorderRef.current.startRecording();
        mediaRecorderRef.current.ondataavailable = handleDataAvailable;
    }, [handleDataAvailable]);

    const handleStopCaptureClick = useCallback(() => {
        setRecording(false);
        mediaRecorderRef.current.stopRecording(() => {
            const blob = mediaRecorderRef.current.getBlob();
            setRecordedChunks([blob]);
        });
    }, []);

    const handleDownload = useCallback(() => {
        if (recordedChunks.length) {
            const blob = new Blob(recordedChunks, { type: "video/webm" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            document.body.appendChild(a);
            a.style.display = "none";
            a.href = url;
            a.download = "react-webcam-capture-stream-capture.webm";
            a.click();
            window.URL.revokeObjectURL(url);
        }
    }, [recordedChunks]);

    return (
        <div className="Container">
            <Webcam
                height={800}
                width={800}
                audio={true}
                mirrored={true}
                ref={webcamRef}
            />
            <div>
                {recording ? (
                    <button onClick={handleStopCaptureClick}>Stop Capture</button>
                ) : (
                    <button onClick={handleStartCaptureClick}>Start Capture</button>
                )}
                {recordedChunks.length > 0 && (
                    <button onClick={handleDownload}>Download</button>
                )}
            </div>
        </div>
    );
}
