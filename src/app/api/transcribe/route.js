import axios from 'axios';
import FormData from 'form-data';

export async function POST(req) {
  try {
    // Convert the incoming audio data to a Buffer
    const audioBuffer = await req.arrayBuffer();
    const audioBufferConverted = Buffer.from(audioBuffer);

    // Prepare FormData for Whisper API request
    const formData = new FormData();
    formData.append('file', audioBufferConverted, {
      filename: 'audio.wav', // Specify file name and format
    });
    formData.append('model', 'whisper-1');

    // Set headers explicitly, including boundary and content-length
    const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
        'Content-Length': formData.getLengthSync(), // Calculate content length
      },
    });

    // Return transcription text as JSON
    return new Response(JSON.stringify({ text: response.data.text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Capture detailed error message
    const errorMessage = error.response?.data?.error?.message || "Server error";
    console.error("API Error:", errorMessage);

    // Return error response
    return new Response(
      JSON.stringify({ error: 'Transcription error', details: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
