---
name: deploy-staging
description: Deploy da branch atual para o ambiente de staging
---

# Deploy para staging

Passos para fazer deploy para o ambiente de staging:

1. Garantir que os testes passam localmente (ou no CI).
2. Fazer build do projeto conforme o script definido (ex.: `npm run build`).
3. Seguir o fluxo de deploy da agência (ex.: push para branch `staging`, pipeline CI/CD, ou comando interno).
4. Validar no ambiente de staging após o deploy.

Ajuste os passos conforme o processo real da sua agência (GitHub Actions, GitLab CI, Vercel, etc.).
