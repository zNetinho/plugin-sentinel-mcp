# Plugin da Agência (Cursor)

Plugin do Cursor com regras, skills, agentes e comandos para padronizar o trabalho da sua agência.

## Estrutura

```
agency-plugin/
├── .cursor-plugin/
│   └── plugin.json        # Manifesto do plugin
├── mcp-runrunit/          # Servidor MCP para Runrun.it (Tasks + Comments)
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

1. **Instalação**: instale o plugin pelo [marketplace do Cursor](https://cursor.com/marketplace) ou use este repositório como plugin local.
2. **Personalização**: edite `plugin.json` (nome, descrição, autor), troque o logo em `assets/logo.svg` e ajuste as regras, skills e comandos aos processos da sua agência.
3. **Hooks**: se quiser scripts automáticos (ex.: formatar código após edição), configure em `hooks/hooks.json`.

## Publicação

Para publicar no marketplace do Cursor:

1. Hospede o plugin em um repositório Git público.
2. Acesse [cursor.com/marketplace/publish](https://cursor.com/marketplace/publish) e envie o link do repositório.
3. Confira o [guia de criação de plugins](https://cursor.com/pt-BR/docs/plugins/building) para o checklist de envio.

## Licença

Ajuste conforme a licença da sua agência (ex.: MIT, proprietária).
