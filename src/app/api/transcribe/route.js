import axios from 'axios';
import FormData from 'form-data';

export async function POST(req) {
  try {
    // Ses dosyasını buffer formatında al
    const audioBuffer = await req.arrayBuffer();
    const audioBufferConverted = Buffer.from(audioBuffer);

    // FormData oluştur ve ses dosyasını ekle
    const formData = new FormData();
    formData.append('file', audioBufferConverted, {
      filename: 'audio.wav', // Dosya adının doğru ve benzersiz olmasına dikkat edin
      contentType: 'audio/wav', // Ses dosyasının biçimi
    });
    formData.append('model', 'whisper-1');
    // Ek parametreler ekleyin
    // Whisper API ile axios isteği
    const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        ...formData.getHeaders(),
      },
    });

    // Başarılı yanıtı döndür
    return new Response(JSON.stringify({ text: response.data.text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Hata mesajını ayrıntılı bir şekilde döndür
    const errorMessage = error.response?.data?.error?.message || "Bilinmeyen bir transkripsiyon hatası";
    console.error("Error Response:", errorMessage); // Hata detayını konsola yazdır
    return new Response(
      JSON.stringify({ error: 'Transkripsiyon hatası', details: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
