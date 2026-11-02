<p align="center">
  <img src="../assets/readme/banners/react.png" alt="React" width="100%">
</p>

# Deploy

O workflow de ambiente declara QA em https://web-app-ldi0.onrender.com e verificação do cluster de produção. Os processos comuns estão em [QA_RENDER.md](https://github.com/Solierrr/docs-warehouse/blob/main/readme/deploy/QA_RENDER.md) e [PROD_GKE_ARGOCD.md](https://github.com/Solierrr/docs-warehouse/blob/main/readme/deploy/PROD_GKE_ARGOCD.md).

O Dockerfile constrói com Node.js 22 e serve `dist/` em nginx na porta 80. As variáveis Vite são resolvidas no build. Uma alteração de endereço de API exige reconstrução do bundle, não apenas mudança no ambiente do nginx.

O registro de push depende do suporte do navegador, do service worker em `/firebase-messaging-sw.js`, da permissão da pessoa e de `VITE_FIREBASE_VAPID_KEY`, mas a central de notificações atende apenas o aplicativo mobile, e o web não recebe esses avisos.
