import axios from 'axios';

export async function POST(req) {
  try {
    // Ses dosyasını Buffer formatına dönüştür
    const audioBuffer = await req.arrayBuffer();
    const audioBufferConverted = Buffer.from(audioBuffer);

    // Ses dosyasını Base64 formatına çevir
    const audioBase64 = audioBufferConverted.toString('base64');

    // API için payload (yük) oluştur
    const data = {
      file: audioBase64, // Base64 formatında dosya içeriği
      model: 'whisper-1',
    };

    // OpenAI API'ye istek gönder
    const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', data, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
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
