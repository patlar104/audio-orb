# Tasks & Launch Configuration Guide

## Quick Start

### Running Tasks
Press `Ctrl+Shift+B` to see all build tasks, or access via:
- `Ctrl+Shift+P` → "Tasks: Run Task"
- Terminal menu → "Run Task..."

### Debugging
Press `F5` to start debugging, or:
- `Ctrl+Shift+D` to open Debug view
- Select configuration from dropdown
- Press `F5` or click green play button

---

## Available Tasks

### 🚀 Development Tasks

#### `dev: Start Vite Dev Server` (Background)
- **Command:** `npm run dev`
- **Port:** http://localhost:3000
- **Use:** Primary development task
- **Features:**
  - Runs in background
  - Hot module replacement (HMR)
  - Automatic problem detection

#### `typecheck: TypeScript Type Check`
- **Command:** `npx tsc --noEmit`
- **Use:** Check TypeScript errors without building
- **Tip:** Run before committing code

### 🏗️ Build Tasks

#### `build: Production Build` ⭐ Default Build Task
- **Command:** `npm run build`
- **Shortcut:** `Ctrl+Shift+B`
- **Output:** `dist/` directory
- **Use:** Create production-ready build

#### `preview: Preview Production Build`
- **Command:** `npm run preview`
- **Port:** http://localhost:4173
- **Use:** Test production build locally
- **Note:** Automatically runs build task first

### 🛠️ Utility Tasks

#### `install: Install Dependencies`
- **Command:** `npm install`
- **Use:** Install/update node_modules

#### `clean: Clean Build Artifacts`
- **Command:** `rm -rf dist node_modules/.vite`
- **Use:** Clean build cache and output
- **When:** After major dependency changes or build issues

---

## Launch Configurations (Debugging)

### 🌐 Primary Configurations

#### `Launch Chrome (Dev Server)` ⭐ Recommended
- **URL:** http://localhost:3000
- **Pre-Launch:** Starts dev server automatically
- **Use:** Main debugging configuration
- **Features:**
  - Auto-starts Vite dev server
  - Source maps enabled
  - Breakpoints in VS Code
  - Console output in Debug Console

#### `Launch Edge (Dev Server)`
- Same as Chrome but uses Microsoft Edge
- **Use:** For Edge-specific debugging

### 🔌 Additional Configurations

#### `Launch Chrome (Existing Server)`
- **When:** Dev server already running
- **Use:** Quick debugging without restarting server
- **Tip:** Faster if you're iterating quickly

#### `Attach to Chrome`
- **Port:** 9222
- **When:** Chrome launched with remote debugging
- **Command to start Chrome:**
  ```bash
  google-chrome --remote-debugging-port=9222
  ```

#### `Preview Build in Chrome`
- **URL:** http://localhost:4173
- **Pre-Launch:** Builds and previews production
- **Use:** Debug production build issues

### 🔧 Compound Configuration

#### `Debug Full Stack`
- Runs: Chrome Dev Server configuration
- **Use:** One-click full debugging setup

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Run default build task | `Ctrl+Shift+B` |
| Run any task | `Ctrl+Shift+P` → "Tasks: Run Task" |
| Start debugging | `F5` |
| Stop debugging | `Shift+F5` |
| Restart debugging | `Ctrl+Shift+F5` |
| Toggle breakpoint | `F9` |
| Step over | `F10` |
| Step into | `F11` |
| Step out | `Shift+F11` |
| Debug console | `Ctrl+Shift+Y` |

---

## Common Workflows

### 🔄 Normal Development
1. Press `F5` to start debugging
2. Browser opens automatically at http://localhost:3000
3. Edit files → Changes hot-reload automatically
4. Set breakpoints in `.ts/.tsx` files
5. `Shift+F5` to stop when done

### 🏗️ Production Build & Test
1. `Ctrl+Shift+B` → Select "build: Production Build"
2. Check `dist/` folder
3. Run "preview: Preview Production Build" task
4. Test at http://localhost:4173

### 🐛 Debug Existing Server
1. Start dev server: `npm run dev` in terminal
2. `F5` → Select "Launch Chrome (Existing Server)"
3. Browser connects to running server

### 🧹 Clean Build Issues
1. Run "clean: Clean Build Artifacts" task
2. Run "install: Install Dependencies" task
3. Restart dev server

---

## Task Features

### Problem Matchers
Tasks automatically detect and highlight errors:
- **TypeScript errors** → Shows in Problems panel
- **Vite build errors** → Clickable file links
- **Runtime errors** → Debug console output

### Background Tasks
Dev server runs in background:
- Terminal stays interactive
- Shell integration features work
- Multiple commands possible
- Panel stays organized

### Task Groups
Tasks organized by function:
- **Build group:** Build-related tasks
- **Dev group:** Development servers
- **Preview group:** Production preview

---

## Tips & Tricks

### 🎯 Quick Task Switching
- Tasks use dedicated panels (dev, build, preview)
- Keeps terminal output organized
- Works great with shell integration decorations

### 🔍 Debugging TypeScript
- Source maps are enabled
- Set breakpoints directly in `.ts` files
- Inspect variables in Debug sidebar
- Use Debug Console for evaluation

### ⚡ Performance
- Use "Launch Chrome (Existing Server)" for faster iterations
- Kill background tasks when not needed
- Clean task helps with cache issues

### 🌐 Environment Variables
Your Vite config loads `GEMINI_API_KEY` from `.env`:
- Create `.env` file in workspace root
- Add: `GEMINI_API_KEY=your_key_here`
- Restart dev server to reload

### 📊 Shell Integration Benefits
With shell integration enabled:
- See command success/failure indicators
- Navigate between task outputs with `Ctrl+↑/↓`
- Quick access to task output via command decorations
- Sticky scroll shows current command

---

## Troubleshooting

### Dev Server Won't Start
1. Check if port 3000 is in use: `lsof -i :3000`
2. Kill process: `kill -9 <PID>`
3. Or change port in [vite.config.ts](vite.config.ts)

### Breakpoints Not Working
1. Ensure source maps enabled (already configured)
2. Check if file is being served by Vite
3. Try hard refresh in browser (`Ctrl+Shift+R`)

### Task Doesn't Show Output
1. Check "presentation" settings in tasks.json
2. Ensure "reveal": "always" is set
3. Check Terminal panel for output

### Browser Doesn't Auto-Open
1. Manually navigate to http://localhost:3000
2. Check Vite server is running
3. Check firewall settings

---

## File Locations

- Tasks: [.vscode/tasks.json](.vscode/tasks.json)
- Launch configs: [.vscode/launch.json](.vscode/launch.json)
- Settings: [.vscode/settings.json](.vscode/settings.json)
- Keybindings: [.vscode/keybindings.json](.vscode/keybindings.json)
- Vite config: [vite.config.ts](../vite.config.ts)
- Package scripts: [package.json](../package.json)

---

## Resources

- [VS Code Tasks Documentation](https://code.visualstudio.com/docs/editor/tasks)
- [VS Code Debugging](https://code.visualstudio.com/docs/editor/debugging)
- [Vite Documentation](https://vitejs.dev/)
- [Shell Integration Guide](SHELL_INTEGRATION_GUIDE.md)
