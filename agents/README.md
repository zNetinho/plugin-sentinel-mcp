# Agentes Cursor

Esta pasta contém as definições dos **agentes** disponíveis no workspace. Cada agente é um perfil especializado que pode ser invocado via `mcp_task` (subagent_type) ou referenciado nas regras do Cursor para revisão de código, documentação, acessibilidade, performance, segurança, produto e mentoria.

---

## Tabela dos agentes

| Agente | Nome exibido | Descrição | Quando usar |
|--------|--------------|-----------|-------------|
| **context-bridge** | Doc-Brief (Implementation Brief) | Filtro de documentação técnica: extrai lógica de implementação, assinaturas e dependências em Implementation Briefs de alta densidade; remove marketing e redundância. | Quando precisar transformar documentação longa em um resumo técnico pronto para implementação (Quick Start, Core Logic, API Reference, Gotchas). |
| **kieran-typescript-reviewer** | kieran-typescript-reviewer | Revisa código TypeScript com barra de qualidade alta em type safety, padrões modernos e manutenibilidade. | Após implementar features, modificar código ou criar novos componentes TypeScript; para garantir convenções e boas práticas. |
| **mentor** | Mentor mode | Ajuda a mentorar o engenheiro com orientação e suporte, sem editar código. | Quando quiser desafiar premissas, fazer perguntas socráticas e guiar a solução sem dar a resposta pronta. |
| **performance-optimizer** | performance-optimizer | Especialista em otimização de performance, profiling, Core Web Vitals e otimização de bundle. | Para melhorar velocidade, reduzir tamanho de bundle e otimizar runtime; termos: performance, optimize, speed, slow, memory, cpu, benchmark, lighthouse. |
| **prd** | Create PRD Chat Mode | Gera um PRD (Product Requirements Document) em Markdown com user stories, critérios de aceite, considerações técnicas e métricas; opcionalmente cria issues no GitHub. | Para documentar requisitos de produto de forma estruturada e, se desejado, gerar issues a partir das user stories. |
| **toph** | Toph | Especialista em acessibilidade web (WCAG 2.1/2.2), UX inclusiva e testes de a11y. | Para revisar acessibilidade, teclado, foco, ARIA, formulários, mídia, testes com leitores de tela e ferramentas (axe, pa11y, Lighthouse). |
| **security-reviewer** | security-reviewer | Revisor focado em segurança: vulnerabilidades e boas práticas. | Para checar injeção (SQL, XSS, comandos), autenticação/autorização, dados sensíveis, criptografia, dependências e validação de entrada. |

---

## Descrição por categoria

### Revisão de código e qualidade
- **kieran-typescript-reviewer**: Revisão rigorosa de TypeScript (tipos, nomenclatura, extração de módulos, testabilidade). Severo em código existente, pragmático em código novo e isolado.
- **security-reviewer**: Revisão de segurança (injeção, auth, dados sensíveis, criptografia, dependências, validação), com sugestões concretas e citações de trechos.

### Produto e documentação
- **prd (Create PRD Chat Mode)**: Criação de PRDs completos (overview, metas, personas, requisitos, UX, métricas, milestones, user stories) e opção de criar issues no GitHub.
- **context-bridge (Doc-Brief)**: Reduz documentação ou contexto de código a um “Implementation Brief” enxuto (Quick Start, Core Logic, API Reference, Gotchas) para outro agente implementar sem reler a fonte.

### Experiência do usuário e performance
- **toph**: Acessibilidade (WCAG, teclado, foco, ARIA, formulários, mídia, testes a11y). Inclui checklists para design, desenvolvimento e QA.
- **performance-optimizer**: Core Web Vitals (LCP, INP, CLS), bundle, rede, runtime; abordagem “medir primeiro, otimizar depois” e checklist de quick wins.

### Mentoria
- **mentor (Mentor mode)**: Orienta o engenheiro com perguntas, desafio de premissas e sugestões, sem editar código; usa codebase, busca e ferramentas para dar contexto.

---

## Como usar

- **Via mcp_task**: use o parâmetro `subagent_type` com o valor correspondente ao agente (ex.: `kieran-typescript-reviewer`, `Toph`, `performance-optimizer`, `security-reviewer`, `generalPurpose`, `explore`, etc.). Os nomes dos arquivos em `agents/` nem sempre coincidem exatamente com os `subagent_type` do MCP; consulte a documentação do Cursor para a lista exata.
- **Via regras do Cursor**: os agentes podem ser citados em regras (por exemplo em `.cursor/rules` ou em AGENTS.md) para indicar quando acionar cada tipo de revisão ou fluxo (PRD, doc-brief, mentoria, a11y, performance, segurança).
