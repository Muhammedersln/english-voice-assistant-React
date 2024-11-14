import axios from 'axios';
import FormData from 'form-data';

export async function POST(req) {
  try {
    console.log('API isteği başlatılıyor...');

    // Gelen ses dosyasını alıp Buffer formatına dönüştürelim
    const audioBuffer = await req.arrayBuffer();
    const audioBufferConverted = Buffer.from(audioBuffer);
    console.log('Ses dosyası Buffer formatına dönüştürüldü.');

    // Ses dosyasını OpenAI API'ye göndermek için FormData oluştur
    const formData = new FormData();
    formData.append('file', audioBufferConverted, {
      filename: 'audio.wav',
      contentType: 'audio/wav',
    });
    formData.append('model', 'whisper-1');

    console.log('FormData oluşturuldu ve ses dosyası eklendi.');

    // Axios ile API çağrısı yap
    const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        ...formData.getHeaders()
      }
    });

    console.log('API isteği gönderildi ve yanıt alındı:', response.data);

    // Yanıtı kontrol et
    return new Response(JSON.stringify({ text: response.data.text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    // Hata mesajını kontrol et
    if (error.response) {
      console.error('API Hatası:', error.response.data);
      return new Response(
        JSON.stringify({ error: error.response.data.error.message || 'Bilinmeyen hata' }),
        { status: error.response.status, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      console.error('Sunucu hatası:', error.message);
      return new Response(
        JSON.stringify({ error: 'Sunucu hatası', details: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }
}
