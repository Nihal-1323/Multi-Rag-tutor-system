FROM node:20-alpine

WORKDIR /app

COPY frontend-3002/package*.json ./

RUN npm install

COPY frontend-3002/ .

EXPOSE 3002

CMD ["npm", "run", "dev"]
