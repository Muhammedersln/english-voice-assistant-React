"use client";
import { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";

export default function RecordButton({ setTranscribedText, isLoggedIn }) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const pressTimeoutRef = useRef(null);

  useEffect(() => {
    // Determine device type
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));

    const requestMicrophonePermission = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (error) {
        console.warn("Microphone access denied.");
      }
    };
    requestMicrophonePermission();
  }, []);

  const startRecording = async () => {
    if (!isLoggedIn) {
      toast.error("Önce giriş yapmalısınız.");
      return;
    }

    try {
      // Start a timeout to check for short button presses
      pressTimeoutRef.current = setTimeout(async () => {
        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(streamRef.current);

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
          audioChunksRef.current = [];

          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
          }
          mediaRecorderRef.current = null;

          try {
            const response = await fetch("/api/transcribe", {
              method: "POST",
              body: audioBlob,
              headers: { "Content-Type": "audio/wav" },
            });

            if (response.ok) {
              const data = await response.json();
              setTranscribedText(data.text);
            } else {
              toast.error("Transkripsiyon hatası.");
            }
          } catch (error) {
            toast.error("Transkripsiyon API çağrısı hatası.");
          }
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
      }, 1000); // Set a 1-second delay before starting recording
    } catch (error) {
      toast.error("Mikrofon erişimi reddedildi.");
    }
  };

  const stopRecording = () => {
    // Clear the timeout if button released before 1 second
    if (pressTimeoutRef.current) {
      clearTimeout(pressTimeoutRef.current);
      pressTimeoutRef.current = null;
    }

    if (isRecording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else if (!isRecording) {
      // If button was released before 1 second
      toast.error("Mikrofonu en az 1 saniye basılı tutmalısınız.");
    }
  };

  const handleClick = (event) => {
    event.preventDefault();
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="flex flex-col items-center my-10 gap-3">
      <button
        onMouseDown={!isMobile ? startRecording : undefined}
        onMouseUp={!isMobile ? stopRecording : undefined}
        onClick={isMobile ? handleClick : undefined}
        style={{ userSelect: "none", WebkitUserSelect: "none" }}
        className={`w-36 h-36 rounded-full text-white font-semibold shadow-lg ${isRecording ? "bg-red-500" : "bg-primary"}`}
      >
        {isRecording ? (
          <span className="flex justify-center items-center text-black">
            <FaMicrophoneSlash size={60} />
          </span>
        ) : (
          <span className="flex justify-center items-center text-black">
            <FaMicrophone size={60} />
          </span>
        )}
      </button>
      <p className="text-white mt-5 select-none" style={{ userSelect: "none", WebkitUserSelect: "none" }}>Dokun ve Konuş</p>
    </div>
  );
}
