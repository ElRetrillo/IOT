# Usa una imagen oficial de Node.js
FROM node:18-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia el package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código de tu aplicación
COPY . .

# Exponer el puerto en el que correrá la app
EXPOSE 3001

# Comando para iniciar la aplicación
CMD [ "npm", "start" ]