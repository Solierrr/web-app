FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Valores do build de produção. Tudo o que é VITE_* vai para o bundle do navegador, então nada aqui é segredo
# (a chave VAPID é a chave pública do push). Espelha a pasta /vite do Infisical (prod); outro ambiente troca
# os valores com --build-arg. Sem eles o bundle sai com as APIs "undefined" e as listas nunca carregam.
ARG VITE_APP_MODE=PROD
ARG VITE_API_CORE=https://core.solarianetwork.site
ARG VITE_API_AUTH=https://auth.solarianetwork.site
ARG VITE_API_MESSENGER=https://messenger.solarianetwork.site
ARG VITE_WS_MESSENGER=wss://messenger.solarianetwork.site/messaging/ws
ARG VITE_API_NOTIFY=https://notify.solarianetwork.site
ARG VITE_API_VALIDATION=https://validation.solarianetwork.site
ARG VITE_API_ACCESSIBILITY=https://accessibility.solarianetwork.site
ARG VITE_API_ASSISTANT=https://assistant.solarianetwork.site
ARG VITE_API_OPERATIONAL=https://operational.solarianetwork.site
ARG VITE_EXCHANGE_API=https://api.frankfurter.dev/v2
ARG VITE_FIREBASE_VAPID_KEY=BAEW4F7MbUVXL0v2NjVxrE51txvzKtXtaXlvmsEHdIAAOcxe4eRjamqLRxa9K9fyt_9XMQAxCFpMFfcGiuxrZcE
ARG VITE_LOGS=DEACTIVATED
ARG VITE_MOCKS=DEACTIVATED
ENV VITE_APP_MODE=$VITE_APP_MODE \
    VITE_API_CORE=$VITE_API_CORE \
    VITE_API_AUTH=$VITE_API_AUTH \
    VITE_API_MESSENGER=$VITE_API_MESSENGER \
    VITE_WS_MESSENGER=$VITE_WS_MESSENGER \
    VITE_API_NOTIFY=$VITE_API_NOTIFY \
    VITE_API_VALIDATION=$VITE_API_VALIDATION \
    VITE_API_ACCESSIBILITY=$VITE_API_ACCESSIBILITY \
    VITE_API_ASSISTANT=$VITE_API_ASSISTANT \
    VITE_API_OPERATIONAL=$VITE_API_OPERATIONAL \
    VITE_EXCHANGE_API=$VITE_EXCHANGE_API \
    VITE_FIREBASE_VAPID_KEY=$VITE_FIREBASE_VAPID_KEY \
    VITE_LOGS=$VITE_LOGS \
    VITE_MOCKS=$VITE_MOCKS

COPY . .
RUN npm run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
