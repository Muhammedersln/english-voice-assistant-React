import fetch from 'node-fetch';
import FormData from 'form-data';

export const config = {
  runtime: 'nodejs', // Vercel sunucu uyumluluğunu sağlar
};

export async function POST(req) {
  try {
    // Gelen ses dosyasını alıp Buffer formatına dönüştürme
    const audioBuffer = await req.arrayBuffer();
    const audioBufferConverted = Buffer.from(audioBuffer);

    // OpenAI API isteği için FormData hazırlığı
    const formData = new FormData();
    formData.append('file', audioBufferConverted, {
      filename: 'audio.wav',
      contentType: 'audio/wav',
    });
    formData.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        ...formData.getHeaders(), // FormData için gerekli header ayarları
      },
      body: formData,
    });

    const result = await response.json();

    if (response.ok) {
      return new Response(JSON.stringify({ text: result.text }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(
        JSON.stringify({ error: result.error.message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Sunucu hatası', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
