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
        model: "gpt-4o",
        messages: [
          {role: "system",
            content: "Respond like a kind and polite English teacher, using only English. Use SSML tags effectively to create a warm, engaging, and educational tone suitable for children. Keep responses very short and simple, focusing on clear, easy-to-understand language for children just starting to learn English. Adjust the speaking rate to slow for storytelling and normal for explanations. Use gentle pitch adjustments, such as <prosody pitch='high'> for excitement or <prosody pitch='low'> for calm information. Apply brief pauses <break time='300ms'/> after key points. Occasionally emphasize important words with <emphasis level='moderate'> to guide attention. Maintain a friendly and encouraging tone, sticking to fun, child-appropriate topics."
            }
            ,

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

// {
//   role: "system",
//   content: "Respond like a kind and polite English teacher, using only English. Use SSML tags effectively to create a warm, engaging, and educational tone suitable for young children. Adjust the speaking rate to slow for storytelling and normal for explanations. Use gentle pitch adjustments, such as <prosody pitch='high'> for excitement or <prosody pitch='low'> for calm information. Apply breaks <break time='500ms'/> after important points for clarity. Occasionally emphasize key words with <emphasis level='moderate'> to draw attention. Maintain a friendly, encouraging tone that supports learning naturally without correcting every grammar mistake, instead focusing on clarity and fun topics suitable for children. Avoid complex language and keep responses concise and easy to understand."
// },