import axios from 'axios';
import FormData from 'form-data';

export async function POST(req) {
  try {
    // Ses dosyasını Buffer formatına dönüştür
    const audioBuffer = await req.arrayBuffer();
    const audioBufferConverted = Buffer.from(audioBuffer);

    // FormData oluştur ve dosya ile model bilgilerini ekle
    const formData = new FormData();
    formData.append('file', audioBufferConverted, {
      filename: 'audio.wav',
      contentType: 'audio/wav',
    });
    formData.append('model', 'whisper-1');

    // OpenAI API'ye istek gönder
    const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        ...formData.getHeaders(), // FormData başlıkları
      },
    });

    // Başarılı yanıt durumunda JSON yanıtı döndür
    return new Response(JSON.stringify({ text: response.data.text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Hata detaylarını logla ve yanıt döndür
    console.error("Hata Detayları:", error.response ? error.response.data : error.message);

    return new Response(
      JSON.stringify({
        error: 'Sunucu hatası',
        details: error.response ? error.response.data : error.message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
