import { NextResponse } from 'next/server';

export async function POST(req) {
  const { text, voiceId } = await req.json();

  // ElevenLabs API URL (kullanıcıdan gelen voiceId'yi dinamik olarak kullanıyoruz)
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': process.env.ELEVENLABS_API_KEY,
    },
    body: JSON.stringify({
      text,
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Text-to-speech failed" }, { status: 500 });
  }

  const audioBlob = await response.blob();
  return new Response(audioBlob, { status: 200 });
}
