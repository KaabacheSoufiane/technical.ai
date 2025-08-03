import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const mistralClient = axios.create({
  baseURL: 'https://api.mistral.ai/v1',
  timeout: 30000, // 30 secondes
  headers: {
    Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour retry automatique
mistralClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config } = error;
    
    // Retry une fois sur erreur réseau
    if (!config._retry && error.code === 'ECONNRESET') {
      config._retry = true;
      return mistralClient(config);
    }
    
    return Promise.reject(error);
  }
);

export default mistralClient;