# Offizielles Node.js-Image verwenden
FROM node:16-alpine

# Arbeitsverzeichnis im Container setzen
WORKDIR /app

# package.json kopieren und Abhängigkeiten installieren
COPY package.json .
RUN npm install

# Restlichen Code kopieren
COPY . .

# Port 3000 im Container freigeben
EXPOSE 3000

# Node.js App starten
CMD ["npm", "start"]
