import fetch from 'node-fetch';
import FormData from 'form-data';

// API anahtarının doğru çalışıp çalışmadığını kontrol eden fonksiyon
async function testAPIKey() {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
    });
    if (response.ok) {
      console.log("API anahtarı çalışıyor");
    } else {
      const error = await response.json();
      console.error("API anahtarıyla ilgili bir sorun var:", error);
    }
  } catch (error) {
    console.error("API anahtarı testi sırasında bir hata oluştu:", error.message);
  }
}

// API anahtarının geçerli olup olmadığını test et
testAPIKey();

export async function POST(req) {
  try {
    // Gelen ses dosyasını alıp Blob formatına dönüştürme
    const audioBlob = await req.blob();

    // Ses dosyasını OpenAI API'ye göndermek için FormData kullanımı
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav'); // Blob ile filename belirtildi
    formData.append('model', 'whisper-1'); // Whisper modelini burada ekledik

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        ...formData.getHeaders(),
      },
      body: formData,
    });

    const result = await response.json();
    console.log("API yanıtı:", result); // Hata durumunda detaylı mesaj görmek için loglama

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
