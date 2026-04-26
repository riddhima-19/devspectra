FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN mkdir -p uploads logs
RUN addgroup -g 1001 -S nodejs && adduser -S nodeuser -u 1001
RUN chown -R nodeuser:nodejs /app
USER nodeuser
EXPOSE 5000
CMD ["node", "server.js"]