FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=development
ENV PORT=4000

COPY package*.json ./
RUN npm install --loglevel=info --foreground-scripts

COPY . .
RUN npm run prisma:generate

EXPOSE 4000
CMD ["npm", "run", "start:dev"]
