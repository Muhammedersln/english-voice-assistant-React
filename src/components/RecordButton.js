import { useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";

export default function RecordButton({ setTranscribedText, isLoggedIn }) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const startTimeRef = useRef(null);

  const startRecording = async () => {
    if (!isLoggedIn) {
      toast.error("Önce giriş yapmalısınız.");
      return;
    }

    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(streamRef.current);

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        audioChunksRef.current = [];

        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

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

      startTimeRef.current = Date.now();
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      toast.error("Mikrofon erişimi reddedildi.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
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

  const handleTouchStart = (event) => {
    event.preventDefault();
    startRecording();
  };

  const handleTouchEnd = (event) => {
    event.preventDefault();
    setTimeout(() => stopRecording(), 100); // Short delay to ensure stable stopping
  };

  return (
    <div className="flex flex-col items-center my-10 gap-3 ">
      <button
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`w-36 h-36 rounded-full text-white font-semibold shadow-lg ${
          isRecording ? "bg-red-500" : "bg-primary"
        }`}
      >
        {isRecording ? (
          <span className="flex justify-center items-center text-black ">
            <FaMicrophoneSlash size={60} />
          </span>
        ) : (
          <span className="flex justify-center items-center text-black ">
            <FaMicrophone size={60} />
          </span>
        )}
      </button>
      <p className="text-white">Basılı Tut ve Konuş</p>
    </div>
  );
}
