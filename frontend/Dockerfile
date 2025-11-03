FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
# Copiar y renombrar el archivo de variables de entorno de producción
COPY env.production .env.production
# Asegurar que Vite use el modo producción
ENV NODE_ENV=production
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
