const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

class PDFProcessor {
  constructor() {
    this.docsPath = path.join(__dirname, 'docs');
    this.pdfPath = path.join(this.docsPath, 'pdf');
    this.processedPath = path.join(this.docsPath, 'processed');
    this.knowledgeBase = new Map();
    this.loadProcessedDocs();
  }

  async processPDF(filePath, metadata = {}) {
    try {
      console.log(`📄 Traitement PDF: ${path.basename(filePath)}`);
      
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      
      const processedDoc = {
        filename: path.basename(filePath),
        text: data.text,
        pages: data.numpages,
        metadata: {
          marque: metadata.marque || this.extractBrand(data.text),
          modele: metadata.modele || this.extractModel(data.text),
          type: metadata.type || this.extractType(data.text),
          ...metadata
        },
        sections: this.extractSections(data.text),
        codes_erreur: this.extractErrorCodes(data.text),
        procedures: this.extractProcedures(data.text),
        processed_at: new Date().toISOString()
      };

      // Sauvegarde
      const outputFile = path.join(this.processedPath, `${path.basename(filePath, '.pdf')}.json`);
      fs.writeFileSync(outputFile, JSON.stringify(processedDoc, null, 2));
      
      // Ajout à la base de connaissances
      this.knowledgeBase.set(processedDoc.filename, processedDoc);
      
      console.log(`✅ PDF traité: ${processedDoc.pages} pages, ${processedDoc.codes_erreur.length} codes erreur`);
      return processedDoc;
      
    } catch (error) {
      console.error(`❌ Erreur traitement PDF:`, error.message);
      throw error;
    }
  }

  extractBrand(text) {
    const brands = ['viessmann', 'saunier duval', 'bosch', 'atlantic', 'thermor', 'de dietrich', 'frisquet', 'daikin'];
    for (const brand of brands) {
      if (text.toLowerCase().includes(brand)) {
        return brand;
      }
    }
    return 'unknown';
  }

  extractModel(text) {
    const modelPatterns = [
      /vitodens\s+\d+[-\w]*/gi,
      /themaplus\s+\w*/gi,
      /condens\s+\d+\w*/gi,
      /chauffeo\s+\w*/gi,
      /altherma\s+\w*/gi
    ];
    
    for (const pattern of modelPatterns) {
      const match = text.match(pattern);
      if (match) return match[0];
    }
    return 'unknown';
  }

  extractType(text) {
    if (text.toLowerCase().includes('chaudière') || text.toLowerCase().includes('chaudiere')) return 'chaudiere';
    if (text.toLowerCase().includes('ballon') || text.toLowerCase().includes('cumulus')) return 'ballon';
    if (text.toLowerCase().includes('pompe à chaleur') || text.toLowerCase().includes('pac')) return 'pac';
    return 'unknown';
  }

  extractSections(text) {
    const sections = {};
    const lines = text.split('\n');
    let currentSection = 'general';
    let currentContent = [];

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Détection des titres de section
      if (this.isSectionTitle(trimmed)) {
        if (currentContent.length > 0) {
          sections[currentSection] = currentContent.join('\n');
        }
        currentSection = this.normalizeSectionTitle(trimmed);
        currentContent = [];
      } else if (trimmed.length > 0) {
        currentContent.push(trimmed);
      }
    }
    
    if (currentContent.length > 0) {
      sections[currentSection] = currentContent.join('\n');
    }
    
    return sections;
  }

  isSectionTitle(line) {
    const titlePatterns = [
      /^\d+\.?\s+[A-Z]/,
      /^[A-Z][A-Z\s]{10,}/,
      /MAINTENANCE|DEPANNAGE|INSTALLATION|CODES?\s+ERREUR/i
    ];
    return titlePatterns.some(pattern => pattern.test(line));
  }

  normalizeSectionTitle(title) {
    return title.toLowerCase()
      .replace(/^\d+\.?\s*/, '')
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 30);
  }

  extractErrorCodes(text) {
    const codes = [];
    const codePatterns = [
      /(?:code|erreur|defaut)\s*:?\s*([A-Z]\d+|F\d+|E\d+)/gi,
      /([A-Z]\d+|F\d+|E\d+)\s*:?\s*([^\n]{20,100})/gi
    ];

    for (const pattern of codePatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        codes.push({
          code: match[1],
          description: match[2] ? match[2].trim() : '',
          context: this.getContext(text, match.index, 100)
        });
      }
    }

    return codes;
  }

  extractProcedures(text) {
    const procedures = [];
    const lines = text.split('\n');
    let currentProcedure = null;
    let steps = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (this.isProcedureTitle(line)) {
        if (currentProcedure && steps.length > 0) {
          procedures.push({
            title: currentProcedure,
            steps: steps
          });
        }
        currentProcedure = line;
        steps = [];
      } else if (this.isStep(line)) {
        steps.push(line);
      }
    }

    if (currentProcedure && steps.length > 0) {
      procedures.push({
        title: currentProcedure,
        steps: steps
      });
    }

    return procedures;
  }

  isProcedureTitle(line) {
    return /^(procedure|dépannage|maintenance|controle|verification)/i.test(line) ||
           /^[A-Z][^.]{20,}$/.test(line);
  }

  isStep(line) {
    return /^\d+[\.\)]\s/.test(line) || /^[-•]\s/.test(line);
  }

  getContext(text, index, length) {
    const start = Math.max(0, index - length);
    const end = Math.min(text.length, index + length);
    return text.substring(start, end).trim();
  }

  loadProcessedDocs() {
    try {
      const files = fs.readdirSync(this.processedPath);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const content = JSON.parse(fs.readFileSync(path.join(this.processedPath, file), 'utf8'));
          this.knowledgeBase.set(content.filename, content);
        }
      }
      console.log(`📚 ${this.knowledgeBase.size} documents chargés`);
    } catch (error) {
      console.log('📚 Aucun document traité trouvé');
    }
  }

  searchInDocs(query, marque = null, type = null) {
    const results = [];
    const queryLower = query.toLowerCase();

    for (const [filename, doc] of this.knowledgeBase) {
      if (marque && doc.metadata.marque !== marque.toLowerCase()) continue;
      if (type && doc.metadata.type !== type.toLowerCase()) continue;

      let score = 0;
      const matches = [];

      // Recherche dans le texte
      if (doc.text.toLowerCase().includes(queryLower)) {
        score += 10;
        matches.push('text');
      }

      // Recherche dans les codes erreur
      for (const code of doc.codes_erreur) {
        if (code.code.toLowerCase().includes(queryLower) || 
            code.description.toLowerCase().includes(queryLower)) {
          score += 20;
          matches.push(`code_${code.code}`);
        }
      }

      // Recherche dans les procédures
      for (const proc of doc.procedures) {
        if (proc.title.toLowerCase().includes(queryLower)) {
          score += 15;
          matches.push(`procedure_${proc.title.substring(0, 20)}`);
        }
      }

      if (score > 0) {
        results.push({
          document: filename,
          metadata: doc.metadata,
          score: score,
          matches: matches,
          relevant_sections: this.getRelevantSections(doc, queryLower)
        });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  getRelevantSections(doc, query) {
    const relevant = {};
    for (const [section, content] of Object.entries(doc.sections)) {
      if (content.toLowerCase().includes(query)) {
        relevant[section] = content.substring(0, 300) + '...';
      }
    }
    return relevant;
  }

  getStats() {
    const stats = {
      total_docs: this.knowledgeBase.size,
      by_brand: {},
      by_type: {},
      total_error_codes: 0,
      total_procedures: 0
    };

    for (const doc of this.knowledgeBase.values()) {
      const brand = doc.metadata.marque;
      const type = doc.metadata.type;
      
      stats.by_brand[brand] = (stats.by_brand[brand] || 0) + 1;
      stats.by_type[type] = (stats.by_type[type] || 0) + 1;
      stats.total_error_codes += doc.codes_erreur.length;
      stats.total_procedures += doc.procedures.length;
    }

    return stats;
  }
}

module.exports = PDFProcessor;