# ============================================================
#  Dockerfile — Multi-Stage Build para Portfólio React + Vite
# ============================================================

# ── Stage 1: Build da Aplicação ──
FROM node:20-alpine AS builder

WORKDIR /app

# Copia dependências primeiro para aproveitar cache do Docker
COPY package*.json ./

RUN npm install

# Copia o código-fonte
COPY . .

# Build de produção (Vite gera a pasta /dist)
RUN npm run build

# ── Stage 2: Servidor Nginx Leve para Produção ──
FROM nginx:1.27-alpine AS runner

# Remove configuração padrão do Nginx
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copia a configuração otimizada do Nginx com SPA routing e gzip
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos compilados do Stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Inicia o Nginx em primeiro plano
CMD ["nginx", "-g", "daemon off;"]
