FROM node:18-alpine

WORKDIR /app

# Copier les package.json
COPY package*.json ./
COPY server/package*.json ./server/
COPY frontend/package*.json ./frontend/

# Installer les dépendances
RUN npm ci --only=production
RUN cd server && npm ci --only=production
RUN cd frontend && npm ci --only=production

# Copier le code source
COPY . .

# Build du frontend
RUN cd frontend && npm run build

# Exposer les ports
EXPOSE 5000 5443

# Démarrer l'application
CMD ["npm", "run", "start:prod"]