import fetch from 'node-fetch';
import FormData from 'form-data';

export async function POST(req) {
  try {
    console.log('API isteği başlatılıyor...'); // Hata ayıklama logu

    // Gelen ses dosyasını alıp Buffer formatına dönüştürelim
    const audioBuffer = await req.arrayBuffer();
    const audioBufferConverted = Buffer.from(audioBuffer);
    console.log('Ses dosyası Buffer formatına dönüştürüldü.'); // Hata ayıklama logu

    // Ses dosyasını OpenAI API'ye göndermek için FormData oluştur
    const formData = new FormData();
    formData.append('file', audioBufferConverted, {
      filename: 'audio.wav',
      contentType: 'audio/wav',
    });
    formData.append('model', 'whisper-1');

    console.log('FormData oluşturuldu ve ses dosyası eklendi.'); // Hata ayıklama logu

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData,
    });

    // API yanıtını alın
    const result = await response.json();
    console.log('API yanıtı alındı:', result); // Hata ayıklama logu

    // Yanıtı kontrol et
    if (response.ok) {
      return new Response(JSON.stringify({ text: result.text }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      // API'den gelen hata detaylarını logla
      console.error('API Hatası:', result.error); // Hata ayıklama logu
      return new Response(
        JSON.stringify({ error: result.error.message || 'Bilinmeyen hata' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    // Sunucu hatalarını logla
    console.error('Sunucu hatası:', error); // Hata ayıklama logu
    return new Response(
      JSON.stringify({ error: 'Sunucu hatası', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
