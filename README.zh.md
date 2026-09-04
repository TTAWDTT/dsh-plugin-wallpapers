# dsh-plugin-wallpapers

[English](README.md) | 中文

把已安装的任意 **Wallpaper Engine** 壁纸用作 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Web 界面的背景。零配置 Steam 检测、支持 Range 的视频流式播放、设置 → 通用 里的选择对话框。**改变的只是 dsh 自己的界面背景 —— 不会碰 Windows 桌面壁纸。**

https://github.com/user-attachments/assets/00000000-0000-0000-0000-000000000000

## 功能

- **一键选用** — 设置 → 通用 → **壁纸** → 选择：所有创意工坊与内置壁纸带实时预览缩略图、标题、类型列出。当前选中项有标记；再点一次即清除。
- **零配置** — Steam 根目录从 Windows 注册表（`HKCU\Software\Valve\Steam\SteamPath`）与标准安装位置自动检测；Wallpaper Engine（应用 `431960`）通过 `libraryfolders.vdf` 自行定位。首次安装无需重启即可被识别。`D:\Steam` 这类自定义库目录只需一条配置（见[配置](#配置)）。
- **视频与网页壁纸** — `video` 壁纸以 HTML `<video>` 流式播放，带 HTTP Range 支持（可拖动进度、内存占用低）；`web` 壁纸以 iframe 加载。场景（scene）壁纸会列出但置灰（`scene.pkg` 是私有格式）。
- **音频跟随选择** — 视频背景音默认静音；对话框里的复选框可开启。偏好持久保存。
- **搜索与筛选** — 对话框按标题或 id 过滤，并有 全部 / 视频 / 网页 类型切换。
- **双配色适配** — 壁纸播放时，应用表面变为从当前配色取色的半透明玻璃层（浅色：白色薄纱；深色：深色薄纱）；侧边栏、输入区、消息气泡、设置面板与菜单在任何画面上都保持可读。清除选择后完全恢复原配色。
- **优雅降级** — 没有安装 Wallpaper Engine（或没装宿主插件）时，设置行照常渲染，对话框会说明情况；headless 组合下插件无错加载。

## 安装

有 `dsh` CLI 时，从 npm 安装（预构建产物，无需构建权限）：

```sh
dsh plugin --profile web add dsh-plugin-wallpapers
```

或从 GitHub 安装源码：

```sh
dsh plugin --profile web add github:TTAWDTT/dsh-plugin-wallpapers
```

首次安装时 pnpm 会询问是否允许本包的 build 脚本（git 安装拉取的是源码而非构建产物）；把打印的 key 加入 profile 的 `pnpm-workspace.yaml`：

```yaml
allowBuilds:
  dsh-plugin-wallpapers: true
```

然后重新执行 `add`。只对你信任的包授权 —— 这会在安装时运行包的代码。

没有 npm？一条命令的 PowerShell 后备（无需 git；下载最新 GitHub Release，链接进 profile 并注册插件 —— 可安全重复执行）：

```powershell
powershell -ExecutionPolicy Bypass -Command "Invoke-WebRequest 'https://github.com/TTAWDTT/dsh-plugin-wallpapers/raw/main/install.ps1' -OutFile install.ps1; .\install.ps1"
```

也可以从本地检出安装：

```sh
git clone https://github.com/TTAWDTT/dsh-plugin-wallpapers.git
cd dsh-plugin-wallpapers && npm install && npm run build
dsh plugin --profile web add ./dsh-plugin-wallpapers
```

之后刷新 Web 界面（或重启 `dsh web`）。

## 使用

1. `dsh web`，打开打印的 URL。
2. 设置 → **通用** → **壁纸** → **选择**。挑一张壁纸，背景立即开始播放。
3. 在对话框里切换 **背景音**（默认关闭），或 **清除** 选择回到纯色配色。

没有安装 Wallpaper Engine？对话框会说明；其他一切不受影响。壁纸只在标签页打开时播放 —— 页面卸载的瞬间背景层即被移除，桌面永远不会被涉及。

## 配置

自动检测覆盖大多数环境；所有开关都是 profile 的 `cordis.patch.yml` 里的配置覆盖：

```yaml
- id: ui-wallpaper
  config:
    steamLibraryRoots: ['D:\Steam', 'E:\SteamLibrary']  # 默认：注册表 + 标准位置
    appId: '431960'                                     # Wallpaper Engine 的 Steam 应用 id
    bundledProjectsSubPath: 'projects/defaultprojects'  # 安装目录下的内置项目子路径
```

`steamLibraryRoots` 的每一项应包含 `steamapps/libraryfolders.vdf`；留空（默认）即启用自动检测。

## 开发

```sh
npm install
npm run build   # tsc（lib/ node 半）+ tsdown（lib/client.js 浏览器包）
npm test        # vitest 运行宿主测试套件
```

`npm run build` 后重启 `dsh web` 以加载更改。

## 目录结构

- `src/host/` — Wallpaper Engine 发现（注册表 + VDF + project.json 解析）、带 Range 流式播放的 `/wallpapers` 媒体路由、自挂载的 `/wallpapers-roster` RPC 通道（subscriptions 模式：`ctx.inject(['connection'], …)` + `connection.rpc.handle`；无核心挂载）。
- `src/client/` — 背景层（`<video>`/`<iframe>` 舞台 + 半透明主题覆盖）、通用设置行、基于 `defineStore` 的花名册镜像选择对话框。
- `src/wallpaper-settings.ts` — 持久化的 `ui-wallpaper` 设置节（选择 + 静音），宿主 schema 与浏览器 scope 共用。
- `install.ps1` — 无 npm 的 Windows 安装器（GitHub Release zip → profile 内 junction → 补丁注册）。
