import fetch from 'node-fetch';

export const config = {
  runtime: 'nodejs',
};

export async function POST(req) {
  try {
    // Gelen ses dosyasını alıp Buffer formatına dönüştürme
    const audioBuffer = await req.arrayBuffer();
    const audioBufferConverted = Buffer.from(audioBuffer);

    // Sınır (boundary) tanımlayalım
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';

    // Gövde (body) verisini `multipart/form-data` formatında manuel oluşturma
    const body = Buffer.concat([
      Buffer.from(`--${boundary}\r\n`),
      Buffer.from('Content-Disposition: form-data; name="file"; filename="audio.wav"\r\n'),
      Buffer.from('Content-Type: audio/wav\r\n\r\n'),
      audioBufferConverted,
      Buffer.from(`\r\n--${boundary}\r\n`),
      Buffer.from('Content-Disposition: form-data; name="model"\r\n\r\n'),
      Buffer.from('whisper-1\r\n'),
      Buffer.from(`--${boundary}--\r\n`),
    ]);

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body,
    });

    const result = await response.json();

    if (response.ok) {
      return new Response(JSON.stringify({ text: result.text }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(
        JSON.stringify({ error: result.error.message }),
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
