"use client";
import { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";

export default function RecordButton({ setTranscribedText, isLoggedIn }) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const startTimeRef = useRef(null);
  const touchTimeoutRef = useRef(null);

  useEffect(() => {
    const requestMicrophonePermission = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (error) {
        console.warn("Microphone access denied.");
      }
    };
    requestMicrophonePermission();
  }, []);

  const startRecording = async (event) => {
    event.preventDefault();
    if (!isLoggedIn) {
      toast.error("Önce giriş yapmalısınız.");
      return;
    }

    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(streamRef.current, { mimeType: "audio/webm" });

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
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
            headers: { "Content-Type": "audio/webm" },
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

      startTimeRef.current = Date.now();
      touchTimeoutRef.current = setTimeout(() => {
        mediaRecorderRef.current.start();
        setIsRecording(true);
      }, 100);
    } catch (error) {
      toast.error("Mikrofon erişimi reddedildi.");
    }
  };

  const stopRecording = (event) => {
    event.preventDefault();
    clearTimeout(touchTimeoutRef.current);

    if (isRecording && mediaRecorderRef.current) {
      const duration = Date.now() - startTimeRef.current;
      if (duration < 1000) {
        toast.error("Daha uzun süre basılı tutmalısınız.");
        setIsRecording(false);
        return;
      }
      
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col items-center my-10 gap-3">
      <button
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onMouseLeave={stopRecording}
        onTouchStart={(e) => {
          e.preventDefault();
          startRecording(e);
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          stopRecording(e);
        }}
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
      <p className="text-white mt-5 select-none" style={{ userSelect: "none", WebkitUserSelect: "none" }}>Basılı Tut ve Konuş</p>
    </div>
  );
}
