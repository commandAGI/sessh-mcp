# Sessh MCP Server

Model Context Protocol server for [sessh](https://github.com/CommandAGI/sessh), enabling Cursor and other MCP clients to manage persistent SSH sessions.

## Installation

```bash
npm install
npm run build
```

## Prerequisites

- Node.js 18+
- The `sessh` CLI must be installed and on your PATH (or set `SESSH_BIN` environment variable)

## Cursor Configuration

Add to your Cursor MCP settings:

```json
{
  "mcpServers": {
    "sessh": {
      "command": "node",
      "args": ["dist/server.js"],
      "cwd": "/absolute/path/to/sessh-mcp",
      "env": {
        "SESSH_BIN": "/usr/local/bin/sessh",
        "SESSH_IDENTITY": "/home/you/.ssh/id_ed25519",
        "SESSH_SSH": "autossh",
        "AUTOSSH_GATETIME": "0"
      }
    }
  }
}
```

## Available Tools

### `open`
Open or ensure a persistent remote tmux session via SSH controlmaster.

**Parameters:**
- `alias` (string): Session alias name
- `host` (string): SSH host (user@host)
- `port` (number, optional): SSH port (default: 22)

### `run`
Send a command into the persistent tmux session on the remote host.

**Parameters:**
- `alias` (string): Session alias name
- `host` (string): SSH host (user@host)
- `command` (string): Command to execute

### `logs`
Capture recent output from the tmux session.

**Parameters:**
- `alias` (string): Session alias name
- `host` (string): SSH host (user@host)
- `lines` (number, optional): Number of lines to capture (default: 300)

### `status`
Check whether the SSH controlmaster and tmux session exist.

**Parameters:**
- `alias` (string): Session alias name
- `host` (string): SSH host (user@host)
- `port` (number, optional): SSH port (default: 22)

### `close`
Kill tmux session and close the controlmaster.

**Parameters:**
- `alias` (string): Session alias name
- `host` (string): SSH host (user@host)
- `port` (number, optional): SSH port (default: 22)

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Development mode (with tsx)
npm run dev
```

## Related Projects

- [sessh](https://github.com/CommandAGI/sessh) - Core CLI
- [sessh-python-sdk](https://github.com/CommandAGI/sessh-python-sdk) - Python SDK
- [sessh-typescript-sdk](https://github.com/CommandAGI/sessh-typescript-sdk) - TypeScript SDK

## License

MIT License - see LICENSE file for details.

