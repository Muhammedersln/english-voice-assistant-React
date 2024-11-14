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
          { role: "system", content: "Answer in simple, friendly English that is easy for children to understand. Use short sentences and easy words. Only answer in English. like a human speak" },
          { role: "user", content: transcribedText },
        ],
      }),
    });

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    return NextResponse.json({ aiResponse });
  } catch (error) {
    console.error("Error with ChatGPT API:", error);
    return NextResponse.json({ aiResponse: "An error occurred." });
  }
}

