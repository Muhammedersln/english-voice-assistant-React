import fetch from 'node-fetch';
import FormData from 'form-data';

export async function POST(req) {
  try {
    // Gelen ses dosyasını alıp Blob formatına dönüştürelim
    const audioBlob = await req.blob();
    
    // Hata ayıklama için ses dosyasının boyutunu kontrol edelim
    console.log("Ses dosyasının boyutu:", audioBlob.size);

    // Ses dosyasını OpenAI API'ye göndermek için FormData kullanımı
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav'); // Blob ile filename belirtildi
    formData.append('model', 'whisper-1'); // Whisper modelini burada ekledik

    // Hata ayıklama için FormData içeriklerini kontrol edelim
    for (const pair of formData.entries()) {
      console.log(`${pair[0]}, ${pair[1]}`);
    }

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
      console.error("API'den gelen hata:", result);
      return new Response(
        JSON.stringify({ error: result.error?.message || 'Bir hata oluştu' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error("Sunucu hatası:", error.message);
    return new Response(
      JSON.stringify({ error: 'Sunucu hatası', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
