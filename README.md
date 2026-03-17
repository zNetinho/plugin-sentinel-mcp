# Plugin N1 + MCP runrunit (Cursor)

Plugin do Cursor com regras, skills, agentes, comandos, e MCP para padronizar o trabalho da sua agência.

## Estrutura

```
agency-plugin/
├── .cursor-plugin/
│   └── plugin.json        # Manifesto do plugin
├── mcp-runrunit/          # Servidor MCP para Runrun.it (Tasks + Comments + Discord)
├── docs/                  # Documentação de referência (API, workflows, entidades)
│   └── Indíce.md          # Índice dos tópicos — os agentes consultam esta pasta
├── rules/                 # Regras (.mdc)
│   ├── coding-standards.mdc
│   ├── review-checklist.mdc
│   └── docs-reference.mdc # Orienta os agentes a consultar docs/
├── skills/                # Skills do agente
│   └── code-reviewer/
│       └── SKILL.md
├── agents/                # Agentes personalizados
│   └── security-reviewer.md
├── commands/               # Comandos executáveis
│   └── deploy-staging.md
├── hooks/
│   └── hooks.json         # Hooks (opcional)
├── assets/
│   └── logo.svg           # Logo do plugin
└── README.md
```

## O que está incluído

- **Regras**: padrões de código, checklist de revisão e **referência à pasta `docs/`** — os agentes são orientados a consultar `docs/` (e o `docs/Indíce.md`) para documentação do projeto, API e workflows.
- **Skills**: skill de revisão de código alinhada aos padrões da agência.
- **Agentes**: revisor de segurança para análise de vulnerabilidades.
- **Comandos**: exemplo de comando de deploy para staging (edite conforme seu fluxo).

## Como usar

1. Insira a configuração do MCP no seu Cursor.
```json
"runrunit-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-runrunit"
      ],
      "env": {
        "RUNRUNIT_APP_KEY": "<APP_KEY>",
        "RUNRUNIT_USER_TOKEN": "<USER_TOKEN>",
        "CLOUDINARY_CLOUD_NAME": "<CLOUD NAME>",
        "CLOUDINARY_API_KEY": "<CLOUDINARY_API_KEY>",
        "CLOUDINARY_API_SECRET": "<CLOUDINARY_API_SECRET>",
        "BOT_DISCORD_TOKEN_PUBLIC_ID": "<BOT_DISCORD_TOKEN_PUBLIC_ID>",
        "BOT_RUNRUNIT_REPORT_PRIVATE_KEY": "<BOT_RUNRUNIT_REPORT_PRIVATE_KEY>",
        "DISCORD_GUILD_ID": "<DISCORD_GUILD_ID>",
        "DISCORD_CHANNEL_ID": "<DISCORD_CHANNEL_ID>"
      }
    },
```
**
> Substitua os valores entre "" acima por chaves reais

1. As credenciais do runrunit, basta pegar no perfil.
https://i.imgur.com/qT6Xmcz.png

2. Obter as credenciais do Cloudinary (bucket online para hospedagem de imagens, disponibiliza links para as documentações)

    2.1 Faça login/registro https://cloudinary.com/users/register_free (Utilize sua conta google ou Github)

    2.2 https://i.imgur.com/cfyDVXA.png

    2.3 https://i.imgur.com/ckwAfby.png

3. As variaveis do Discord hoje são uma utilização opicional, visando implementação futura onde iremos unificar os canais dos clientes com os gestores sinalizando andamentos, impeditivos, finalizações ou qualquer outro evento relevante para o acompanhamento.

## Skills disponíveis no [README.md do MCP](./mcp-runrunit/README.md)

## Publicação

Para publicar no marketplace do Cursor:

1. Hospede o plugin em um repositório Git público.
2. Acesse [cursor.com/marketplace/publish](https://cursor.com/marketplace/publish) e envie o link do repositório.
3. Confira o [guia de criação de plugins](https://cursor.com/pt-BR/docs/plugins/building) para o checklist de envio.

## Licença

Ajuste conforme a licença da sua agência (ex.: MIT, proprietária).
