import fetch from 'node-fetch';
import FormData from 'form-data';

export async function POST(req) {
  try {
    // Gelen ses dosyasını alıp Buffer formatına dönüştürelim
    const audioBuffer = await req.arrayBuffer();
    const audioBufferConverted = Buffer.from(audioBuffer);

    // Ses dosyasını OpenAI API'ye göndermek için FormData oluştur
    const formData = new FormData();
    formData.append('file', new Blob([audioBufferConverted], { type: 'audio/wav' }), 'audio.wav');
    formData.append('model', 'whisper-1'); // Whisper modelini burada ekledik

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        // 'Content-Type': 'multipart/form-data' FormData kendi başlıklarını ayarlayacak
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
