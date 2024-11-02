import React, { useRef, useState, useCallback } from "react";

function Post() {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [videoBlobURL, setVideoBlobURL] = useState(null);
  const [chunks, setChunks] = useState([]);

  // Cleanup function to handle stream stopping and URL cleanup
  const cleanup = useCallback(() => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    if (videoBlobURL) {
      URL.revokeObjectURL(videoBlobURL);
    }
  }, [videoBlobURL]);

  // Cleanup on component unmount
  React.useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  const startRecording = async () => {
    try {
      // Clear any previous video URL and chunks
      if (videoBlobURL) {
        URL.revokeObjectURL(videoBlobURL);
        setVideoBlobURL(null);
      }
      setChunks([]);

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      videoRef.current.srcObject = stream;

      // Initialize MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm",
      });

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setChunks((prevChunks) => [...prevChunks, event.data]);
        }
      };

      // Handle stop recording - using a separate function to access latest chunks
      mediaRecorder.onstop = () => {
        // Get all tracks and stop them
        stream.getTracks().forEach((track) => track.stop());

        // Create blob from chunks
        setChunks((currentChunks) => {
          const blob = new Blob(currentChunks, { type: "video/webm" });
          const url = URL.createObjectURL(blob);
          setVideoBlobURL(url);
          return []; // Clear chunks after creating Blob
        });
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert(
        "Failed to start recording. Please ensure you have granted camera and microphone permissions."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Video Recorder</h1>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full max-w-lg mb-4 border rounded bg-red-300"
      />
      <div className="mb-4">
        {!recording ? (
          <button
            onClick={startRecording}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Stop Recording
          </button>
        )}
      </div>
      {videoBlobURL && (
        <div>
          <h3 className="text-xl font-semibold mb-2">Recorded Video:</h3>
          <video
            src={videoBlobURL}
            controls
            className="w-full max-w-lg border rounded"
          />
        </div>
      )}
    </div>
  );
}

export default Post;
