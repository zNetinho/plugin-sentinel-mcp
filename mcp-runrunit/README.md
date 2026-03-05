# MCP Runrun.it

Servidor MCP (Model Context Protocol) para comunicação com a API do [Runrun.it](https://runrun.it). Expõe ferramentas de **Tasks** e **Comments** para uso no Cursor ou em outros clientes MCP.

## Como o MCP fica disponível para outras pessoas?

- **Não existe um servidor MCP central** que hospeda seu código. O MCP é um **processo que roda na máquina de quem usa** (ou em um servidor que a pessoa/empresa controla).
- **Quem usa precisa:**
  1. Ter o código deste servidor (clonar o repositório do plugin ou, no futuro, instalar um pacote npm).
  2. Rodar em **Node.js**: `npm install` + `npm run build` na pasta `mcp-runrunit`.
  3. Configurar o **Cursor** (ou outro cliente MCP) para **iniciar esse processo** e passar as variáveis de ambiente (credenciais Runrun.it).
- O Cursor então **abre o processo** (`node .../dist/index.js`) e se comunica com ele por **stdio** (entrada/saída padrão). Ou seja: o “servidor” MCP é só um script Node.js que o Cursor executa e com o qual troca mensagens JSON-RPC.

**Resumo:** O plugin do Cursor (regras, skills, agentes) pode ser publicado no marketplace. O **MCP Runrun.it** é distribuído junto com o repositório (ou via npm); cada pessoa instala, compila e configura no próprio Cursor com as credenciais dela. Não há um “servidor em nuvem” do MCP — ele roda em Node.js onde o usuário quiser (local ou servidor próprio).

## Autenticação

A API do Runrun.it exige dois headers em toda requisição:

- **App-Key**: identifica a conta (obtido em Integração e Apps → API e Webhooks)
- **User-Token**: token do usuário em nome do qual as ações são executadas

Configure as variáveis de ambiente (ou no JSON de configuração do MCP no Cursor):

- `RUNRUNIT_APP_KEY` — chave da aplicação
- `RUNRUNIT_USER_TOKEN` — token do usuário

## Instalação

```bash
cd mcp-runrunit
npm install
npm run build
```

## Uso no Cursor

1. Abra as configurações do Cursor (MCP).
2. Adicione o servidor no arquivo de configuração de MCP (por exemplo em `.cursor/mcp.json` ou nas configurações do Cursor).

Exemplo de configuração (ajuste o caminho para o seu projeto):

```json
{
  "mcpServers": {
    "runrunit": {
      "command": "node",
      "args": ["D:/Cursor Plugin/mcp-runrunit/dist/index.js"],
      "env": {
        "RUNRUNIT_APP_KEY": "sua_app_key",
        "RUNRUNIT_USER_TOKEN": "seu_user_token"
      }
    }
  }
}
```

Use o caminho absoluto para `dist/index.js` no seu ambiente.

## Testar o MCP localmente (HTTP)

Antes do deploy, você pode subir um servidor HTTP local e apontar o Cursor para a URL. Assim as tools podem ser testadas sem usar stdio.

1. **Suba o servidor HTTP** (na pasta `mcp-runrunit`):

```bash
npm run build
npm run start
```

Por padrão o servidor fica em `http://127.0.0.1:3000/mcp`. Variáveis opcionais:

- `MCP_HTTP_PORT` — porta (padrão: 3000)
- `MCP_HTTP_HOST` — host (padrão: 127.0.0.1)
- `MCP_HTTP_PATH` — path do endpoint MCP (padrão: /mcp)

2. **Configure o Cursor para usar só a URL** — não use `command`/`args` para esse servidor, senão o Cursor pode usar stdio e dar "Server already initialized". Exemplo em `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "runrunit": {
      "url": "http://127.0.0.1:3000/mcp",
      "env": {
        "RUNRUNIT_APP_KEY": "sua_app_key",
        "RUNRUNIT_USER_TOKEN": "seu_user_token"
      }
    }
  }
}
```

3. Mantenha o servidor rodando (`npm run start`) enquanto usar o Cursor. No terminal deve aparecer `mcp-runrunit: nova sessão ...` a cada conexão; se não aparecer, o Cursor está falando com outro processo (stdio). O endpoint `GET /health` retorna `{"status":"ok","mcp":"runrunit"}` para checagem rápida.

Depois dos testes, use a configuração por processo (stdio) acima para uso normal.

### Como outra pessoa usa (resumo)

1. Clonar o repositório (ou baixar a pasta `mcp-runrunit`).
2. Na pasta: `npm install` e `npm run build`.
3. No Cursor: adicionar este MCP na configuração com `command`: `node`, `args`: caminho para `dist/index.js`, e `env` com `RUNRUNIT_APP_KEY` e `RUNRUNIT_USER_TOKEN`.

O processo Node.js sobe só quando o Cursor precisar falar com o Runrun.it; não precisa deixar nenhum servidor rodando à parte.

## Ferramentas (Tools)

### Tasks

| Ferramenta | Descrição |
|------------|-----------|
| `runrunit_list_tasks` | Lista tarefas com filtros opcionais (ids, project_id, is_closed, sort, page, limit, etc.) |
| `runrunit_get_task` | Retorna uma tarefa pelo ID |
| `runrunit_list_subtasks` | Lista subtarefas de uma tarefa |
| `runrunit_create_task` | Cria tarefa (obrigatório: title, type_id; opcional: project_id, assignments, desired_date, etc.) |
| `runrunit_update_task` | Atualiza tarefa (id + objeto com campos a atualizar) |
| `runrunit_delete_task` | Remove uma tarefa |

### Comments

| Ferramenta | Descrição |
|------------|-----------|
| `runrunit_list_task_comments` | Lista comentários de uma tarefa |
| `runrunit_get_comment` | Retorna um comentário pelo ID |
| `runrunit_create_comment` | Cria comentário em tarefa (task_id, text) |
| `runrunit_update_comment` | Edita o texto de um comentário |
| `runrunit_delete_comment` | Remove um comentário |
| `runrunit_comment_reaction` | Adiciona reação (emoji) a um comentário |

## Contexto para o agente (uso assertivo das tools)

Para que o Cursor/IA use as tools de forma assertiva e inteligente, consulte:

- **`docs/CONTEXTO-AGENTE.md`** — quando usar cada tool, parâmetros (tipos, formatos), fluxos recomendados, erros comuns e glossário Runrun.it.

No workspace do plugin existe também a regra **Runrun.it MCP** em `.cursor/rules/runrunit-mcp.mdc`, que resume essas orientações para o agente.

## Documentação da API

Os endpoints seguem a documentação oficial do Runrun.it. No repositório do plugin, a pasta `docs/` contém os markdowns de referência (por exemplo `docs/Tasks.md` e `docs/Comments.md`). Use `docs/Indíce.md` para localizar os demais endpoints.

## Base URL da API

- `https://runrun.it/api/v1.0/`

Respostas são JSON; datas em ISO 8601. Limite de 100 requisições por minuto.
