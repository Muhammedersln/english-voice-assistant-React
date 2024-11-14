import axios from 'axios';
import FormData from 'form-data';

export async function POST(req) {
  try {
    // Ses dosyasını buffer formatında al
    const audioBuffer = await req.arrayBuffer();
    const audioBufferConverted = Buffer.from(audioBuffer);

    // FormData oluştur ve ses dosyasını ekle
    const formData = new FormData();
    formData.append('file', audioBufferConverted, {
      filename: 'audio.wav',
      contentType: 'audio/wav',
    });
    formData.append('model', 'whisper-1');
    formData.append('language', 'en'); // İsteğe bağlı dil belirtme

    // OpenAI API isteği için axios kullanarak dosyayı gönder
    const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        ...formData.getHeaders(),
      },
    });

    // Başarılı yanıtı döndür
    return new Response(JSON.stringify({ text: response.data.text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Hata durumunda yanıt döndür
    const errorMessage = error.response?.data?.error?.message || error.message;
    console.error("Error Response:", errorMessage);
    return new Response(
      JSON.stringify({ error: 'Sunucu hatası', details: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
