import axios from 'axios';
import FormData from 'form-data';

export async function POST(req) {
  try {
    // Gelen ses dosyasını alıp Buffer formatına dönüştürelim
    const audioBuffer = await req.arrayBuffer();
    const audioBufferConverted = Buffer.from(audioBuffer);

    // Ses dosyasını OpenAI API'ye gönder
    const formData = new FormData();
    formData.append('file', audioBufferConverted, {
      filename: 'audio.wav',
      contentType: 'audio/wav',
    });
    formData.append('model', 'whisper-1');

    const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        ...formData.getHeaders(),
      },
    });

    return new Response(JSON.stringify({ text: response.data.text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Sunucu hatası',
        details: error.response ? error.response.data : error.message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
