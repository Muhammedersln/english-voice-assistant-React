import axios from 'axios';

export async function POST(req) {
  try {
    const response = await axios.get('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      }
    });

    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("API Key Hatası Detayları:", error.response ? error.response.data : error.message);

    return new Response(
      JSON.stringify({
        error: 'API anahtarında sorun var',
        details: error.response ? error.response.data : error.message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
