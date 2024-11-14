import axios from 'axios';
import FormData from 'form-data';

export async function POST(req) {
  try {
    const audioBuffer = await req.arrayBuffer();
    const audioBufferConverted = Buffer.from(audioBuffer);

    const formData = new FormData();
    formData.append('file', audioBufferConverted, {
      filename: 'audio.wav',
      contentType: 'audio/wav',
    });
    formData.append('model', 'whisper-1');

    const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
      },
    });

    return new Response(JSON.stringify({ text: response.data.text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorMessage = error.response?.data?.error?.message || "Sunucu hatası";
    console.error("API Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: 'Transkripsiyon hatası', details: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
