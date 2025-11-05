import { Server, Tool } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { spawn } from "node:child_process";

const SESSH = process.env.SESSH_BIN || "sessh";

interface SesshResult {
  code: number;
  stdout: string;
  stderr: string;
}

function runSessh(args: string[], stdin?: string): Promise<SesshResult> {
  return new Promise((resolve) => {
    const proc = spawn(SESSH, args, {
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, SESSH_JSON: "1" } // force json output
    });

    let out = "", err = "";
    proc.stdout.on("data", (d) => (out += d.toString()));
    proc.stderr.on("data", (d) => (err += d.toString()));
    proc.on("close", (code) => resolve({ code: code ?? 0, stdout: out.trim(), stderr: err.trim() }));

    if (stdin) {
      proc.stdin.write(stdin);
      proc.stdin.end();
    }
  });
}

function ensureOk(op: string, res: SesshResult) {
  if (res.code !== 0 && !res.stdout) {
    const msg = res.stderr || `sessh ${op} failed with ${res.code}`;
    throw new Error(msg);
  }
}

const server = new Server(
  { name: "sessh-mcp", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

server.tool(
  new Tool({
    name: "open",
    description: "Open or ensure a persistent remote tmux session via SSH controlmaster",
    inputSchema: {
      type: "object",
      properties: {
        alias: { type: "string", description: "Session alias name" },
        host: { type: "string", description: "SSH host (user@host)" },
        port: { type: "number", description: "SSH port (default: 22)", default: 22 }
      },
      required: ["alias", "host"]
    }
  }),
  async (args) => {
    const { alias, host, port } = args as { alias: string; host: string; port?: number };
    const sesshArgs = ["open", alias, host];
    if (port) sesshArgs.push(String(port));
    const res = await runSessh(sesshArgs);
    ensureOk("open", res);
    return { content: [{ type: "json", data: JSON.parse(res.stdout) }] };
  }
);

server.tool(
  new Tool({
    name: "run",
    description: "Send a command into the persistent tmux session on the remote host",
    inputSchema: {
      type: "object",
      properties: {
        alias: { type: "string", description: "Session alias name" },
        host: { type: "string", description: "SSH host (user@host)" },
        command: { type: "string", description: "Command to execute" }
      },
      required: ["alias", "host", "command"]
    }
  }),
  async (args) => {
    const { alias, host, command } = args as { alias: string; host: string; command: string };
    const res = await runSessh(["run", alias, host, "--", command]);
    ensureOk("run", res);
    return { content: [{ type: "json", data: JSON.parse(res.stdout) }] };
  }
);

server.tool(
  new Tool({
    name: "logs",
    description: "Capture recent output from the tmux session",
    inputSchema: {
      type: "object",
      properties: {
        alias: { type: "string", description: "Session alias name" },
        host: { type: "string", description: "SSH host (user@host)" },
        lines: { type: "number", description: "Number of lines to capture (default: 300)", default: 300 }
      },
      required: ["alias", "host"]
    }
  }),
  async (args) => {
    const { alias, host, lines } = args as { alias: string; host: string; lines?: number };
    const sesshArgs = ["logs", alias, host];
    if (lines) sesshArgs.push(String(lines));
    const res = await runSessh(sesshArgs);
    ensureOk("logs", res);
    const data = JSON.parse(res.stdout);
    return {
      content: [
        { type: "json", data },
        { type: "text", text: (data.output?.slice(-8000) ?? "").toString() } // also mirror as text (truncated)
      ]
    };
  }
);

server.tool(
  new Tool({
    name: "status",
    description: "Check whether the SSH controlmaster and tmux session exist",
    inputSchema: {
      type: "object",
      properties: {
        alias: { type: "string", description: "Session alias name" },
        host: { type: "string", description: "SSH host (user@host)" },
        port: { type: "number", description: "SSH port (default: 22)", default: 22 }
      },
      required: ["alias", "host"]
    }
  }),
  async (args) => {
    const { alias, host, port } = args as { alias: string; host: string; port?: number };
    const sesshArgs = ["status", alias, host];
    if (port) sesshArgs.push(String(port));
    const res = await runSessh(sesshArgs);
    ensureOk("status", res);
    return { content: [{ type: "json", data: JSON.parse(res.stdout) }] };
  }
);

server.tool(
  new Tool({
    name: "close",
    description: "Kill tmux session and close the controlmaster",
    inputSchema: {
      type: "object",
      properties: {
        alias: { type: "string", description: "Session alias name" },
        host: { type: "string", description: "SSH host (user@host)" },
        port: { type: "number", description: "SSH port (default: 22)", default: 22 }
      },
      required: ["alias", "host"]
    }
  }),
  async (args) => {
    const { alias, host, port } = args as { alias: string; host: string; port?: number };
    const sesshArgs = ["close", alias, host];
    if (port) sesshArgs.push(String(port));
    const res = await runSessh(sesshArgs);
    ensureOk("close", res);
    return { content: [{ type: "json", data: JSON.parse(res.stdout || '{"ok":true}') }] };
  }
);

const transport = new StdioServerTransport();
server.connect(transport).catch((e) => {
  console.error("fatal:", e);
  process.exit(1);
});

