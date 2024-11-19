"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Toaster, toast } from "react-hot-toast";
import RecordButton from "./RecordButton";

export default function HomePage() {
  const { data: session } = useSession();
  const [transcribedText, setTranscribedText] = useState("");
  const [conversationHistory, setConversationHistory] = useState([]);
  const [audioUrl, setAudioUrl] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("9BWtsMINqrJLrRacOk9x");

  const voices = [
    { id: "9BWtsMINqrJLrRacOk9x", name: "Ses 1" },
    { id: "XB0fDUnXU5powFXDhCwa", name: "Ses 2" },
    { id: "onwK4e9ZLuTAKqWW03F9", name: "Ses 3" },
    { id: "D38z5RcWu1voky8WS1ja", name: "Ses 4" },
  ];

  // Reset state on component mount
  useEffect(() => {
    setTranscribedText("");
    setConversationHistory([]);
    setAudioUrl("");
  }, []);

  // Trigger translation whenever transcribed text is updated
  useEffect(() => {
    if (transcribedText) {
      translateTextToEnglish(transcribedText);
    }
  }, [transcribedText]);

  const translateTextToEnglish = async (text) => {
    try {
      const response = await fetch("/api/translateToEnglish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (response.ok) {
        const data = await response.json();
        const translatedText = data.translatedText;
        addMessageToHistory(translatedText, true);
        handleSendToChatGPT(translatedText);
      } else {
        toast.error("Çeviri API çağrısı başarısız.");
      }
    } catch (error) {
      console.error("Çeviri API çağrısı hatası:", error);
      toast.error("Çeviri API çağrısı hatası.");
    }
  };

  const handleSendToChatGPT = async (text) => {
    try {
      const response = await fetch("/api/getChatGPTFeedBack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcribedText: text,
          conversationHistory, // Konuşma geçmişini API'ye gönderiyoruz
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("ChatGPT API Response Data:", data); // Yanıtı kontrol et
        const plainTextResponse = stripSSMLTags(data.aiResponse);
        addMessageToHistory(plainTextResponse, false);
        handleTextToSpeech(data.aiResponse);
      } else {
        toast.error("ChatGPT API çağrısı başarısız.");
      }
    } catch (error) {
      console.error("ChatGPT API çağrısı hatası:", error);
      toast.error("ChatGPT API çağrısı hatası.");
    }
  };
  const handleTextToSpeech = async (text) => {
    try {
      const response = await fetch("/api/elevenlabs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voiceId: selectedVoice }),
      });

      if (response.ok) {
        const blob = await response.blob();
        setAudioUrl(URL.createObjectURL(blob));
      } else {
        toast.error("Text-to-speech API çağrısı başarısız.");
      }
    } catch (error) {
      console.error("Text-to-speech API çağrısı hatası:", error);
      toast.error("Text-to-speech API çağrısı hatası.");
    }
  };

  const addMessageToHistory = (text, isUser) => {
    setConversationHistory((prev) => [
      ...prev,
      { role: isUser ? "user" : "assistant", content: text }, // role ve content ekliyoruz
    ]);
  };


  const stripSSMLTags = (ssmlText) =>
    ssmlText.replace(/<\/?[^>]+(>|$)|```ssml|```/g, "").trim();

  return (
    <div className="bg-bgpage min-h-screen flex flex-col pb-28 overflow-hidden">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="max-w-md w-1/3 mx-auto flex items-center space-x-2 my-5">
        <label htmlFor="voiceSelect" className="text-md text-gray-500">Ses Seçin:</label>
        <select
          id="voiceSelect"
          value={selectedVoice}
          onChange={(e) => setSelectedVoice(e.target.value)}
          className="block py-2.5 px-0 w-full text-sm text-gray-500 bg-transparent border-0 border-b-2 border-gray-200 appearance-none dark:text-gray-400 dark:border-gray-700 focus:outline-none focus:ring-0 focus:border-gray-200 peer"
        >
          {voices.map((voice) => (
            <option key={voice.id} value={voice.id}>
              {voice.name}
            </option>
          ))}
        </select>
      </div>

      <RecordButton setTranscribedText={setTranscribedText} isLoggedIn={!!session} />

      <div className="bg-secondary h-72 mx-16 rounded-md p-5 flex flex-col gap-4 overflow-y-auto">
        {conversationHistory.length > 0 ? (
          [...conversationHistory].reverse().map((message, index) => (
            <div
              key={index}
              className={`mt-2 p-2 rounded-md ${message.role === "user" ? "bg-bgpage text-left" : "bg-third text-right"
                }`}
            >
              {message.content}
            </div>
          ))
        ) : (
          <span>Sohbet Başlatın</span>
        )}
      </div>

      {audioUrl && (
        <div className="my-4 mx-16 p-4 bg-bgpage rounded-lg shadow-lg">
          <audio
            controls
            src={audioUrl}
            className="w-full h-12 bg-bgpage rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
            playsInline
            autoPlay
          />
        </div>
      )}
    </div>
  );
}
