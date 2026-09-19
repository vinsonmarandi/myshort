FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends python3 python3-pip ffmpeg ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY requirements.txt ./
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt
COPY . .
RUN npm run build
ENV PORT=5173 WHISPER_MODEL=tiny COMPUTE_TYPE=int8
EXPOSE 5173
CMD ["npm","start"]
