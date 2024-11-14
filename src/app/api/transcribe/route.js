import fetch from 'node-fetch';
import FormData from 'form-data';

export async function POST(req) {
  try {
    // Gelen ses dosyasını Buffer formatına dönüştürelim
    const audioBuffer = await req.body; // req.arrayBuffer() yerine doğrudan req.body kullanıyoruz
    const audioBufferConverted = Buffer.from(audioBuffer);

    // FormData oluştur ve ses dosyasını ekle
    const formData = new FormData();
    formData.append('file', audioBufferConverted, {
      filename: 'audio.wav',
      contentType: 'audio/wav',
    });
    formData.append('model', 'whisper-1'); // Whisper modelini belirtelim

    // OpenAI API'ye istek gönder
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        ...formData.getHeaders(), // FormData'dan başlıkları alıyoruz
      },
      body: formData,
    });

    // API yanıtını JSON formatında al
    const result = await response.json();

    // Yanıt başarılıysa transkripti dön
    if (response.ok) {
      return new Response(JSON.stringify({ text: result.text }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      // Yanıt başarısızsa hata mesajını dön
      return new Response(
        JSON.stringify({ error: result.error ? result.error.message : 'Bir hata oluştu' }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    // Genel sunucu hatalarını yakala
    return new Response(
      JSON.stringify({ error: 'Sunucu hatası', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
