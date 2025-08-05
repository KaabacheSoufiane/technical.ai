const fs = require('fs');
const path = require('path');

class DatabaseManager {
  constructor() {
    this.dbPath = path.join(__dirname);
    this.databases = {
      chaudieres: null,
      ballons: null,
      pompes: null,
      codes: null,
      pannes: null,
      pieces: null
    };
    this.loadDatabases();
  }

  loadDatabases() {
    try {
      this.databases.chaudieres = JSON.parse(fs.readFileSync(path.join(this.dbPath, 'chaudieres.json'), 'utf8'));
      this.databases.ballons = JSON.parse(fs.readFileSync(path.join(this.dbPath, 'ballons-ecs.json'), 'utf8'));
      this.databases.pompes = JSON.parse(fs.readFileSync(path.join(this.dbPath, 'pompes-chaleur.json'), 'utf8'));
      this.databases.codes = JSON.parse(fs.readFileSync(path.join(this.dbPath, 'codes-erreur.json'), 'utf8'));
      this.databases.pannes = JSON.parse(fs.readFileSync(path.join(this.dbPath, 'pannes-courantes.json'), 'utf8'));
      this.databases.pieces = JSON.parse(fs.readFileSync(path.join(this.dbPath, 'pieces-detachees.json'), 'utf8'));
      console.log('✅ Bases de données chargées');
    } catch (error) {
      console.error('❌ Erreur chargement BDD:', error.message);
    }
  }

  // Recherche par marque et modèle
  findEquipment(marque, modele, type = 'chaudieres') {
    const db = this.databases[type];
    if (!db) return null;

    for (const category in db) {
      for (const brand in db[category]) {
        if (brand.toLowerCase().includes(marque.toLowerCase())) {
          const equipment = db[category][brand];
          if (equipment.modeles) {
            return equipment.modeles.find(m => 
              m.nom.toLowerCase().includes(modele.toLowerCase())
            );
          }
        }
      }
    }
    return null;
  }

  // Recherche code erreur
  findErrorCode(marque, code) {
    const codes = this.databases.codes.codes_erreur_chaudieres;
    if (codes[marque] && codes[marque][code]) {
      return codes[marque][code];
    }
    return null;
  }

  // Recherche panne par symptôme
  findTroubleshooting(symptome, type = 'chaudieres') {
    const pannes = this.databases.pannes[`pannes_${type}`];
    if (pannes && pannes.symptomes) {
      for (const symptom in pannes.symptomes) {
        if (symptom.toLowerCase().includes(symptome.toLowerCase())) {
          return pannes.symptomes[symptom];
        }
      }
    }
    return null;
  }

  // Recherche pièce détachée
  findSparePart(marque, modele, piece) {
    const pieces = this.databases.pieces;
    for (const category in pieces) {
      if (pieces[category][marque] && pieces[category][marque][modele]) {
        const parts = pieces[category][marque][modele];
        for (const partName in parts) {
          if (partName.toLowerCase().includes(piece.toLowerCase())) {
            return parts[partName];
          }
        }
      }
    }
    return null;
  }

  // Recherche intelligente
  smartSearch(query) {
    const results = {
      equipments: [],
      errors: [],
      troubleshooting: [],
      parts: []
    };

    const queryLower = query.toLowerCase();

    // Recherche dans les équipements
    Object.keys(this.databases).forEach(dbType => {
      if (['chaudieres', 'ballons', 'pompes'].includes(dbType)) {
        const db = this.databases[dbType];
        Object.keys(db).forEach(category => {
          Object.keys(db[category]).forEach(brand => {
            if (queryLower.includes(brand.toLowerCase())) {
              results.equipments.push({
                type: dbType,
                marque: brand,
                category: category,
                data: db[category][brand]
              });
            }
          });
        });
      }
    });

    return results;
  }

  // Statistiques
  getStats() {
    return {
      chaudieres: Object.keys(this.databases.chaudieres.chaudieres_gaz.condensation).length,
      ballons: Object.keys(this.databases.ballons.ballons_electriques).length,
      pompes: Object.keys(this.databases.pompes.pompes_chaleur_air_eau).length,
      codes_erreur: Object.keys(this.databases.codes.codes_erreur_chaudieres).length
    };
  }
}

module.exports = DatabaseManager;