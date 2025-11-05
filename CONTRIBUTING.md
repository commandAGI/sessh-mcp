# Contributing to Sessh MCP

Thank you for contributing to sessh-mcp, the Model Context Protocol server that enables Cursor and other MCP clients to manage persistent SSH sessions.

## Philosophy

Sessh MCP is a thin wrapper around the `sessh` CLI. Our philosophy:

1. **Thin Wrapper**: We don't reimplement SSH or tmux logic. We call `sessh` and parse JSON.
2. **Fail Loudly**: If `sessh` fails, we surface the error. No silent fallbacks.
3. **MCP-First**: We optimize for MCP clients (Cursor, etc.), not direct CLI usage.
4. **Type Safety**: We use TypeScript for type safety and better developer experience.

## Development Setup

### Prerequisites

- Node.js 18+
- The `sessh` CLI must be installed and on PATH
- TypeScript 5.6+

### Setup

```bash
npm install
npm run build
```

### Development Mode

```bash
npm run dev
```

This uses `tsx` to run TypeScript directly without building.

### Testing

Manual testing with Cursor:

1. Build the MCP server:
   ```bash
   npm run build
   ```

2. Configure Cursor MCP settings (see README.md)

3. Test tools in Cursor:
   - Open a session
   - Run commands
   - Check logs
   - Close session

## Code Style

- Use TypeScript strict mode
- Prefer async/await over promises
- Use `spawn` from `node:child_process` for subprocess execution
- Always set `SESSH_JSON=1` in environment when calling `sessh`
- Parse JSON responses and validate structure
- Throw errors with clear messages

## Architecture

The MCP server:

1. **Receives MCP tool calls** via stdio transport
2. **Spawns `sessh` CLI** with appropriate arguments
3. **Parses JSON responses** from `sessh`
4. **Returns structured MCP responses** to the client

Key design decisions:

- We force JSON mode (`SESSH_JSON=1`) for all calls
- We parse and validate JSON responses
- We return both JSON and text content for `logs` (truncated text for readability)
- We don't implement interactive attach (use CLI directly)

## Adding New Tools

If `sessh` CLI adds new commands, add corresponding MCP tools:

1. Add tool definition in `src/server.ts`:
   ```typescript
   server.tool(
     new Tool({
       name: "newtool",
       description: "Description of what it does",
       inputSchema: {
         type: "object",
         properties: {
           alias: { type: "string" },
           host: { type: "string" },
           // ... other params
         },
         required: ["alias", "host"]
       }
     }),
     async (args) => {
       // Implementation
     }
   );
   ```

2. Update README.md with new tool documentation

3. Test with Cursor

## Submitting Changes

1. **Fork the repository** (if needed)

2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**:
   - Keep TypeScript strict mode enabled
   - Add JSDoc comments for public APIs
   - Update README if adding features

4. **Build and test**:
   ```bash
   npm run build
   # Test manually with Cursor
   ```

5. **Commit and push**:
   ```bash
   git commit -m "feat: add support for X"
   git push origin feature/your-feature-name
   ```

## Pull Request Guidelines

- **Describe the change**: What does it do? Why is it needed?
- **Show it works**: Include examples of using the new feature in Cursor
- **Keep it focused**: One feature or fix per PR
- **Update docs**: README.md should reflect new functionality

## What We're Looking For

### High Priority

- **Error handling**: Better error messages, validation
- **Type safety**: More specific types, better TypeScript usage
- **Documentation**: More examples, Cursor integration guides
- **Testing**: Automated tests (we're open to test frameworks!)

### Nice to Have

- **Performance**: Faster tool execution, better error recovery
- **Features**: New MCP tools if `sessh` CLI adds commands
- **Developer experience**: Better error messages, debugging tools

## Questions?

Open an issue with the `question` label. We're happy to help!

