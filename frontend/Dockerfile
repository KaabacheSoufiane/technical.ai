# mon-application-fullstack/frontend/Dockerfile
FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./

RUN npm install

COPY . .

RUN npm run build

# Étape 2: Servir l'application avec Nginx
FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html

# Copiez une configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
