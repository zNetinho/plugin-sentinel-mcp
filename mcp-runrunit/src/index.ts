import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio";
import { createMcpServer } from "./app.js";

async function main() {
  const server = createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("mcp-runrunit: running on stdio");
}

main().catch((error) => {
  console.error("mcp-runrunit fatal error:", error);
  process.exit(1);
});
