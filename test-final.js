const axios = require('axios');
const https = require('https');

// Agent HTTPS qui ignore les certificats auto-signés
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

async function testAPI() {
  console.log('🧪 Test API Technical.AI...');
  
  try {
    // Test health
    const health = await axios.get('https://localhost:5443/health', { httpsAgent });
    console.log('✅ Health:', health.data.status);
    
    // Test IA
    const ai = await axios.post('https://localhost:5443/api/ai/ask', {
      question: 'Code erreur F28 Saunier Duval'
    }, { httpsAgent });
    
    console.log('✅ IA Response:', ai.data.answer.substring(0, 100) + '...');
    console.log('📊 Sources:', ai.data.sources);
    
    console.log('\n🎉 TOUS LES TESTS RÉUSSIS!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

testAPI();