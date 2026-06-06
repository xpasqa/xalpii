FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=development
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

COPY package*.json ./
RUN npm install --loglevel=info --foreground-scripts

COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]
