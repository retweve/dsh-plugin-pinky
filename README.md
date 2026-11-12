# dsh-plugin-pinky

Connect **[Pinky](https://github.com/DIYgod/pinky)** — the phone-control MCP server that lets any AI agent use a real Android phone or iPhone, with a person approving the risky steps — to **[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (`dsh`)**.

This is a configuration-only dsh bundle: it inserts the shipped `@deepseek-ai/dsh-mcp-client` row for Pinky, so every session in the profile gets the agent tools `mcp__pinky__*` (`phone_connect`, `phone_observe`, `phone_tap`, `phone_type`, `phone_launch`, `phone_handoff`, `phone_release`, …) plus the MCP resource server `pinky`.

- Upstream: <https://github.com/DIYgod/pinky> (Apache-2.0, by DIYgod). This plugin does not bundle Pinky; it only starts the Pinky installed on your computer.
- Not affiliated with the Pinky project.

## Requirements

1. **Pinky** installed and running, with a phone added and authorized in Pinky (`Add phone`). Pinky starts with `Pinky.exe mcp` on Windows, `pinkyctl mcp` on macOS/Linux, or the app's own executable path.
2. **dsh** `>= 0.2.1-rc.2` (the version that ships `@deepseek-ai/dsh-mcp-client`).
3. The phone connected over USB or Wi-Fi debugging (Pinky's own adb is bundled).

## Install

In **dsh Desktop**: Settings → Plugins → install from GitHub with the spec

```
github:retweve/dsh-plugin-pinky
```

or install the npm package (once published):

```
dsh plugin --profile <profile> add dsh-plugin-pinky
```

Restart dsh if the plugin manager says the change is not live, then start a new session. The agent's tool list should now contain `mcp__pinky__*`.

## Configure the Pinky path

The row resolves the Pinky executable per platform, and `PINKY_BIN` overrides it:

| Platform | Default |
| --- | --- |
| Windows | `%LOCALAPPDATA%\Programs\Pinky\Pinky.exe` |
| macOS | `/Applications/Pinky.app/Contents/MacOS/Pinky` |
| Linux | `/opt/pinky/pinky` |

Portable or custom installs override the row in the profile's user patch (`~/.dsh/profiles/<profile>/cordis.patch.yml`, or a `--patch` overlay). `config` is replaced wholesale, so restate every field:

```yaml
- id: mcp-pinky
  config:
    serverName: pinky
    transport: stdio
    command: 'D:\Pinky\Pinky.exe'
    args:
      - mcp
    toolCallTimeoutMs: 120000
    failOnStartupError: false
```

## What the agent can do

Pinky's server sends its own instructions at connect time. In short:

- `phone_connect` starts a task (the name is shown to you in Pinky); `phone_release` ends it.
- Actions return the changed screen; elements carry `[ref]` numbers for later taps. `phone_observe` returns the whole screen.
- **You stay in control**: payments (and anything else your Pinky safety rules ask about) open an approval card in Pinky; the agent cannot approve anything itself. Banking/wallet/password-manager apps are blocked by default, one-time codes are masked, and you can take over the phone at any moment.
- `user_took_over` / `paused` → the agent asks you with `phone_handoff` and waits. `stopped` → you pressed Stop; that session may not use the phone again, and **new sessions cannot use any phone for 10 minutes** after a Stop all.

Try it: *“Use Pinky to see what's on my phone.”* / 「用 Pinky 看看我手机现在什么画面。」

## Safety and privacy

- The plugin contains no executable code: one YAML patch and metadata. It only mounts dsh's official MCP client with Pinky's command line.
- Pinky runs locally. Its approvals, app blocklists, credential masking and recordings are enforced by Pinky's local gateway, not by this plugin or by prompting the model.
- Install third-party plugins only from sources you trust; review the patch first — it is 40 lines.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| No `mcp__pinky__*` tools | Pinky path wrong, or Pinky not installed. Check the path, or set `PINKY_BIN` / override `command`. dsh logs an MCP connection error; the harness still starts (`failOnStartupError: false`). |
| Tools appear but calls fail | Pinky app not running, or no phone connected. Open Pinky and add/reconnect a phone. |
| `device_offline` | The phone dropped (USB unplugged, Wi-Fi debugging off). Reconnect it in Pinky. |
| `stopped` | You pressed Stop in Pinky. Wait 10 minutes after a Stop all, then start a new task (a fresh session may be needed). |
| `approval_denied` / timeout | The approval card waits 60 s. Answer in Pinky, or soften the rules in Pinky → Settings → Safety. |

## Uninstall

Remove the plugin in dsh's plugin manager (or `dsh plugin remove`). That removes the `mcp-pinky` row with the bundle; nothing else is touched.

## License

MIT — see [LICENSE](LICENSE). Pinky itself is Apache-2.0; its name and icon are used only to describe the integration.

---

# 中文说明

把 **[Pinky](https://github.com/DIYgod/pinky)**（手机控制 MCP 服务：让 AI 智能体操作真实的安卓手机 / iPhone，风险操作由你批准）接入 **DeepSeek Harness（dsh）**。

这是一个「纯配置型」dsh 插件：它插入 dsh 自带的 `@deepseek-ai/dsh-mcp-client` 行来启动 Pinky，使该 profile 下所有会话获得 `mcp__pinky__*` 工具（`phone_connect`、`phone_observe`、`phone_tap`、`phone_type`、`phone_launch`、`phone_handoff`、`phone_release` 等）以及名为 `pinky` 的 MCP 资源服务。

- 上游 [Pinky](https://github.com/DIYgod/pinky)（Apache-2.0，作者 DIYgod）。本插件不打包 Pinky，只调用你电脑上已安装的 Pinky。
- 与 Pinky 项目无隶属关系。

## 前置条件

1. 安装并运行 **Pinky**，已在 Pinky 里「Add phone」添加并授权一台手机；
2. **dsh** ≥ `0.2.1-rc.2`（自带 `@deepseek-ai/dsh-mcp-client`）；
3. 手机通过 USB 或无线调试连上（Pinky 自带 adb）。

## 安装

在 **dsh 桌面版**：设置 → 插件 → 用 GitHub 规格安装：

```
github:retweve/dsh-plugin-pinky
```

或安装 npm 包（发布后）：`dsh plugin --profile <profile> add dsh-plugin-pinky`。

按提示重启 dsh、新开会话后，工具列表里应出现 `mcp__pinky__*`。

## 配置 Pinky 路径

默认按平台解析，也可用环境变量 `PINKY_BIN` 覆盖：

| 平台 | 默认路径 |
| --- | --- |
| Windows | `%LOCALAPPDATA%\Programs\Pinky\Pinky.exe` |
| macOS | `/Applications/Pinky.app/Contents/MacOS/Pinky` |
| Linux | `/opt/pinky/pinky` |

便携版 / 自定义安装请在 profile 的用户补丁层（`~/.dsh/profiles/<profile>/cordis.patch.yml`）里覆盖整行 `config`（注意是整体替换，需重写全部字段）：

```yaml
- id: mcp-pinky
  config:
    serverName: pinky
    transport: stdio
    command: 'D:\Pinky\Pinky.exe'
    args:
      - mcp
    toolCallTimeoutMs: 120000
    failOnStartupError: false
```

## 智能体能做什么

Pinky 服务端会在连接时下发自己的使用说明，要点：

- `phone_connect` 开始任务（任务名会显示在 Pinky 里），`phone_release` 结束任务；
- 每个动作返回屏幕变化，元素带 `[ref]` 编号可直接操作；`phone_observe` 读取整屏；
- **控制权始终在你手里**：支付等敏感操作会在 Pinky 弹出批准卡片，智能体无法自己批准；银行/钱包/密码类 App 默认屏蔽、验证码自动打码、你随时可以接管手机；
- `user_took_over` / `paused` 时智能体用 `phone_handoff` 请你交还；`stopped` 表示你按了 Stop——该会话不能再使用这台手机，**Stop all 后 10 分钟内新会话也不能用任何手机**。

试试说：*「用 Pinky 看看我手机现在什么画面。」*

## 安全与隐私

- 插件没有可执行代码：只有一个 YAML 补丁和元数据，作用是把 dsh 官方 MCP 客户端挂到 Pinky 的命令行上。
- Pinky 完全本地运行，批准、App 屏蔽、验证码打码、录屏都由 Pinky 本地网关强制执行，不依赖本插件、也不依赖提示词。
- 只安装你信任来源的第三方插件；安装前可先看本仓库的补丁（约 41 行）。

## 常见问题

| 现象 | 处理 |
| --- | --- |
| 看不到 `mcp__pinky__*` | Pinky 路径不对或没装。检查路径 / 设置 `PINKY_BIN` / 覆盖 `command`；dsh 日志会记录 MCP 连接错误，但宿主仍能启动。 |
| 工具出现但调用失败 | Pinky 没在运行，或没有已连接的手机。 |
| `device_offline` | 手机断连（拔线 / 关掉无线调试），回 Pinky 重新连接。 |
| `stopped` | 你按过 Stop。Stop all 后等 10 分钟再开新任务（必要时新会话）。 |
| `approval_denied` / 超时 | 批准卡片最多等 60 秒；在 Pinky 里点允许，或在 Pinky → 设置 → 安全 里调整规则。 |

## 卸载

在 dsh 插件管理器里移除（或 `dsh plugin remove`），会同时移除 `mcp-pinky` 行，不影响其他配置。

## 许可

MIT（见 [LICENSE](LICENSE)）。Pinky 本体为 Apache-2.0；其名称与图标仅用于描述本集成。
