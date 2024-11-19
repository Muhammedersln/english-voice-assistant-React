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

  useEffect(() => {
    setTranscribedText("");
    setConversationHistory([]);
    setAudioUrl("");
  }, []);

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
          conversationHistory,
        }),
      });

      if (response.ok) {
        const data = await response.json();
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
      { role: isUser ? "user" : "assistant", content: text },
    ]);
  };

  const stripSSMLTags = (ssmlText) =>
    ssmlText.replace(/<\/?[^>]+(>|$)|```ssml|```/g, "").trim();

  const examplePhrases = [
    "Hello, how are you?",
    "What's your favorite color?",
    "Can you tell me a story?",
    "I want to learn about animals!",
    "What is your name ?"
  ];

  const handleExamplePhraseClick = (phrase) => {
    addMessageToHistory(phrase, true);
    handleSendToChatGPT(phrase);
  };

  return (
    <div className="bg-bgpage min-h-screen flex flex-col pb-10 overflow-hidden">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Voice Selector */}
      <div className="max-w-md w-11/12 md:w-1/2 lg:w-1/3 mx-auto flex items-center space-x-2 my-5">
        <label htmlFor="voiceSelect" className="text-md text-gray-500">
          Select Voice:
        </label>
        <select
          id="voiceSelect"
          value={selectedVoice}
          onChange={(e) => setSelectedVoice(e.target.value)}
          className="block py-2.5 pt-2 w-full text-sm text-gray-500 bg-transparent border-0 border-b-2 border-gray-200 appearance-none dark:text-gray-400 dark:border-gray-700 focus:outline-none focus:ring-0 focus:border-gray-200"
        >
          {voices.map((voice) => (
            <option key={voice.id} value={voice.id}>
              {voice.name}
            </option>
          ))}
        </select>
      </div>

      <RecordButton setTranscribedText={setTranscribedText} isLoggedIn={!!session} />


      {/* Conversation History */}
      <div className="flex items-center justify-center my-4">
        <div className="bg-secondary h-64 w-11/12 md:w-3/4 lg:w-2/5 rounded-3xl p-4 flex flex-col gap-2 overflow-y-auto">
          {conversationHistory.length > 0 ? (
            [...conversationHistory].reverse().map((message, index) => (
              <div
                key={index}
                className={`mt-2 p-3 rounded-md ${message.role === "user" ? "bg-bgpage text-left self-start" : "bg-third text-left self-end"
                  }`}
              >
                {message.content}
              </div>
            ))
          ) : (
            <span>Start a conversation</span>
          )}
        </div>
      </div>

      {/* Audio Player */}
      {audioUrl && (
        <div className="my-4 mx-4 md:mx-16 p-4 bg-bgpage rounded-lg shadow-lg">
          <audio
            controls
            src={audioUrl}
            className="w-full h-12 bg-bgpage rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
            playsInline
            autoPlay
            onPlay={(e) => { e.target.playbackRate = 0.8; }} // Burada playbackRate'i ayarlayın
          />
        </div>
      )}


      {/* Example Phrases */}
      <div className="flex flex-wrap justify-center space-x-2 mt-5 px-4">
        {examplePhrases.map((phrase, index) => (
          <button
            key={index}
            onClick={() => handleExamplePhraseClick(phrase)}
            className="m-1 px-4 py-2 text-md bg-third text-white rounded-lg shadow-md hover:bg-bgpage focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            {phrase}
          </button>
        ))}
      </div>
    </div>
  );
}
