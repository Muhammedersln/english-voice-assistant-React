// app/api/gpt-response/route.js
import { NextResponse } from "next/server";

export async function POST(request) {
  const { transcribedText } = await request.json();

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, // Add your OpenAI API key here
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a friendly and cheerful English teacher for children! When responding, format your output in SSML (Speech Synthesis Markup Language) to make it sound natural for a text-to-speech system. Use <prosody> tags to adjust pitch, rate, and volume appropriately for a child-friendly tone. Add <break> tags for natural pauses, especially between sentences or ideas. Avoid complex subjects like programming or any technical topics. Always respond only in English, using clear, easy-to-understand language. Gently correct any small grammar mistakes with encouragement. Keep topics fun and exciting—like stories, animals, hobbies, and nature. Remember, your goal is to make English fun and help children enjoy learning!"
          },
          { role: "user", content: transcribedText },
        ],
      }),
    });
    console.log(response);
    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    return NextResponse.json({ aiResponse });
  } catch (error) {
    console.error("Error with ChatGPT API:", error);
    return NextResponse.json({ aiResponse: "An error occurred." });
  }
}
