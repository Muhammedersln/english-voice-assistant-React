import axios from 'axios';
import FormData from 'form-data';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      console.log('API isteği başlatılıyor...');

      // Gelen ses dosyasını alıp Buffer formatına dönüştürelim
      const audioBuffer = req.body; // Vercel'de req.body ile erişiliyor
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
      res.status(200).json({ text: response.data.text });
    } catch (error) {
      // Hata mesajını kontrol et
      if (error.response) {
        console.error('API Hatası:', error.response.data);
        res.status(error.response.status).json({ error: error.response.data.error.message || 'Bilinmeyen hata' });
      } else {
        console.error('Sunucu hatası:', error.message);
        res.status(500).json({ error: 'Sunucu hatası', details: error.message });
      }
    }
  } else {
    // Eğer istek POST değilse, 405 (Method Not Allowed) döndürülür.
    res.status(405).json({ error: 'Method Not Alloweds' });
  }
}
