import fetch from 'node-fetch';
import FormData from 'form-data';

export async function POST(req) {
  try {
    // Ses dosyasını alıp Buffer formatına dönüştürme
    const audioBuffer = await req.arrayBuffer();
    const audioBufferConverted = Buffer.from(new Uint8Array(audioBuffer));

    // Ses dosyasını OpenAI API'ye göndermek için FormData kullanımı
    const formData = new FormData();
    formData.append('file', audioBufferConverted, {
      filename: 'audio.wav',
      contentType: 'audio/wav',
    });
    formData.append('model', 'whisper-1'); // Whisper modelini burada ekledik

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        ...formData.getHeaders(), // FormData'nın gerekli header'ları otomatik ayarlamasını sağlıyoruz
      },
      body: formData,
    });

    // Yanıtı JSON formatında alma ve hata durumunda detaylı mesaj gösterme
    const result = await response.json();
    console.log(result); // Hata durumunda Vercel'de hata mesajını görmek için loglama

    if (response.ok) {
      return new Response(JSON.stringify({ text: result.text }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(
        JSON.stringify({ error: result.error?.message || 'Bir hata oluştu' }),
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
