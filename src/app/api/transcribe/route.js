import fetch from 'node-fetch';
import FormData from 'form-data';

const API_KEY = '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'; // API anahtarınızı buraya yazın

export async function POST(req) {
  try {
    // Gelen ses dosyasını alıp Buffer formatına dönüştürelim
    const audioBuffer = await req.arrayBuffer();
    const audioBufferConverted = Buffer.from(audioBuffer);

    // Ses dosyasını OpenAI API'ye göndermek için FormData oluştur
    const formData = new FormData();
    formData.append('file', audioBufferConverted, {
      filename: 'audio.wav',
      contentType: 'audio/wav',
    });
    formData.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`, // Burada doğrudan API anahtarını kullanıyoruz
      },
      body: formData,
    });

    // API yanıtını alın
    const result = await response.json();

    // Yanıtı kontrol et
    if (response.ok) {
      return new Response(JSON.stringify({ text: result.text }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      // API'den gelen hata detaylarını logla
      console.error('API Hatası:', JSON.stringify(result)); // Hata detaylarını loglayın
      return new Response(
        JSON.stringify({ error: result.error.message || 'Bilinmeyen hata' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    // Sunucu hatalarını logla
    console.error('Sunucu hatası:', error); // Sunucu hatalarını loglayın
    return new Response(
      JSON.stringify({ error: 'Sunucu hatası', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
