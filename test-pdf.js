const PDFProcessor = require('./pdf-processor');

async function testPDF() {
  const pdf = new PDFProcessor();
  
  console.log('🔍 Test recherche dans PDF Saunier Duval...');
  
  // Test recherche code erreur F28
  const results = pdf.searchInDocs('F28', 'saunier duval');
  
  console.log(`📊 Résultats trouvés: ${results.length}`);
  
  if (results.length > 0) {
    const result = results[0];
    console.log(`📄 Document: ${result.document}`);
    console.log(`🏷️  Marque: ${result.metadata.marque}`);
    console.log(`📝 Score: ${result.score}`);
    console.log(`🔍 Sections pertinentes:`);
    
    Object.entries(result.relevant_sections).forEach(([section, content]) => {
      console.log(`  ${section}: ${content.substring(0, 100)}...`);
    });
  }
  
  console.log('\n📈 Statistiques PDF:', pdf.getStats());
}

testPDF().catch(console.error);