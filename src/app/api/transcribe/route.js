import axios from 'axios';
import FormData from 'form-data';

export const config = {
  api: {
    bodyParser: false, // Disable default body parsing, as we need to handle raw data
  },
};

export async function POST(req, res) {
  try {
    console.log('API request starting...');

    // Get raw data from the request
    const chunks = [];
    req.on('data', (chunk) => {
      chunks.push(chunk);
    });

    req.on('end', async () => {
      const audioBuffer = Buffer.concat(chunks);
      console.log('Audio file converted to Buffer format.');

      // Create FormData for the OpenAI API request
      const formData = new FormData();
      formData.append('file', audioBuffer, {
        filename: 'audio.wav',
        contentType: 'audio/wav',
      });
      formData.append('model', 'whisper-1');

      console.log('FormData created and audio file added.');

      try {
        // Make API request to OpenAI
        const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            ...formData.getHeaders(),
          },
        });

        console.log('API request sent and response received:', response.data);

        // Return response from OpenAI
        return res.status(200).json({ text: response.data.text });
      } catch (error) {
        if (error.response) {
          console.error('API Error:', error.response.data);
          return res.status(error.response.status).json({
            error: error.response.data.error.message || 'Unknown error',
          });
        } else {
          console.error('Server error:', error.message);
          return res.status(500).json({
            error: 'Server error',
            details: error.message,
          });
        }
      }
    });

  } catch (error) {
    console.error('Unexpected error:', error.message);
    return res.status(500).json({
      error: 'Unexpected server error',
      details: error.message,
    });
  }
}
