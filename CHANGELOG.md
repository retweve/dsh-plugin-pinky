# Changelog

## 0.1.0 — 2026-11-10

- First release: a configuration-only dsh bundle that mounts Pinky's phone-control MCP server through `@deepseek-ai/dsh-mcp-client`.
- Default Pinky executable resolution per platform (Windows / macOS / Linux) with `PINKY_BIN` override.
- `toolCallTimeoutMs` raised to 120 s so Pinky's approval calls (hold up to 45 s) fit.
- Localized plugin metadata (English / 简体中文) and an original icon.
