# Shell Integration Setup Guide

This workspace now has optimized shell integration settings configured in `.vscode/settings.json`.

## Features Enabled

✅ **Command Decorations** - Visual indicators for successful/failed commands
✅ **IntelliSense** - Auto-complete suggestions in terminal (Ctrl+Space)
✅ **Sticky Scroll** - Shows current command at top while scrolling
✅ **Command Navigation** - Navigate between commands with Ctrl+↑ / Ctrl+↓
✅ **Command Guide** - Visual bar showing command boundaries

## Automatic vs Manual Setup

### Automatic Setup (Default)
VS Code should automatically inject shell integration when you open a new terminal.
To verify it's working:
1. Open a new terminal (Ctrl+`)
2. Hover over the terminal tab to see "Shell Integration: Rich" or "Basic"

### Manual Setup (If Automatic Fails)

If automatic injection doesn't work, add this to your `~/.zshrc`:

```bash
# VS Code shell integration
[[ "$TERM_PROGRAM" == "vscode" ]] && . "$(code --locate-shell-integration-path zsh)"
```

#### To edit your .zshrc:
```bash
code ~/.zshrc
```

Then add the above line and reload with:
```bash
source ~/.zshrc
```

## Useful Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Space` | Trigger terminal suggestions |
| `Ctrl+↑` / `Ctrl+↓` | Navigate between commands |
| `Shift+Ctrl+↑` / `Shift+Ctrl+↓` | Select command output |
| `Ctrl+Alt+R` | Run recent command |
| `Ctrl+G` | Go to recent directory |

## Checking Shell Integration Quality

Hover over your terminal tab to see:
- **Rich** - Full shell integration ✅
- **Basic** - Partial integration ⚠️
- **None** - Not working ❌

## Troubleshooting

### If decorations don't appear:
1. Make sure you're using a supported shell (bash, zsh, fish, pwsh)
2. Try opening a new terminal
3. Check if `terminal.integrated.shellIntegration.enabled` is true

### If IntelliSense doesn't work:
- Press `Ctrl+Space` to manually trigger
- Check that `terminal.integrated.suggest.enabled` is true

### Performance Optimization
For faster shell startup (optional), you can inline the shell integration script:

```bash
# First, get the path:
code --locate-shell-integration-path zsh

# Then add the direct path to ~/.zshrc:
[[ "$TERM_PROGRAM" == "vscode" ]] && . "/path/from/above/command"
```

## Additional Features

### Quick Fixes
VS Code will suggest quick fixes for common errors:
- Port already in use → Kill process suggestion
- Git push upstream not set → Set upstream suggestion
- Command not found → Similar command suggestions

### Command History
Clear cached globals if new commands aren't appearing:
```
Ctrl+Shift+P → "Terminal: Clear Suggest Cached Globals"
```

## Resources
- [Official Documentation](https://code.visualstudio.com/docs/terminal/shell-integration)
- Settings file: `.vscode/settings.json`
