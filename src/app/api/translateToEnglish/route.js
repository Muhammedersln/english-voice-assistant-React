// app/api/translateToEnglish/route.js

import { NextResponse } from "next/server";

// Basit dil kontrolü fonksiyonu
function isEnglish(text) {
  // İngilizce karakterler içeriyorsa true döndür
  return /^[a-zA-Z0-9.,!? ]*$/.test(text);
}

export async function POST(request) {
  try {
    const { text } = await request.json();
    console.log("Gelen metin:", text);

    // Metnin İngilizce olup olmadığını kontrol et
    if (isEnglish(text)) {
      console.log("Metin İngilizce, çeviriye gerek yok.");
      return NextResponse.json({ translatedText: text });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: "Translate the following text to English." },
          { role: "user", content: text }
        ],
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      console.error("OpenAI API isteği başarısız:", response.statusText);
      return NextResponse.json({ error: "OpenAI API isteği başarısız" }, { status: 500 });
    }

    const data = await response.json();
    if (!data.choices || data.choices.length === 0) {
      console.error("Geçerli bir yanıt alınamadı:", data);
      return NextResponse.json({ error: "Geçerli bir yanıt alınamadı" }, { status: 500 });
    }

    const translatedText = data.choices[0].message.content.trim();
    console.log("Çevrilen metin:", translatedText);
    return NextResponse.json({ translatedText });
    
  } catch (error) {
    console.error("Çeviri API hatası:", error);
    return NextResponse.json({ error: "Çeviri yapılamadı" }, { status: 500 });
  }
}
