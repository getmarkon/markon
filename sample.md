<div align="center">
  <h1>
    <img valign="middle" src="https://github.com/metaory/markon/blob/master/public/wordmark.png?raw=true" alt="logo" height="64" />
  </h1>
  <strong>
    Minimal distraction free local markdown live editor
  </strong>
  <br>
  <h3>
    <a href="https://metaory.github.io/markon">metaory.github.io/markon</a>
  </h3>
  <img valign="middle" src="https://github.com/metaory/markon/blob/master/public/screenshots.png?raw=true" alt="screenshot" width="96%" />
  <br>
  Public Preview
</div>

---

## Recent Updates

- **LocalStorage**: Automatic content persistence across sessions
- **Theme Presets**: Enhanced theme selection with multiple presets in settings
- **Resize Snap**: Smart split view resizing with snap threshold for better UX

---

### Basic Usage

1. **Type** your markdown in the left panel
2. **Preview** renders live in the right panel
3. **Resize** the split by dragging the divider
4. **Save** your work with `Ctrl+S` (or `Cmd+S` on Mac)

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + S` | Save to file |
| `Ctrl/Cmd + O` | Open file |
| `Ctrl/Cmd + P` | Toggle preview |
| `Ctrl/Cmd + M` | Toggle theme |
| `Ctrl/Cmd + K` | Toggle spellcheck |
| `Ctrl/Cmd + Shift + C` | Copy to clipboard |
| `Ctrl/Cmd + Shift + V` | Load from clipboard |
| `Ctrl/Cmd + /` | Open settings |

> [!TIP]
> All content is automatically saved to localStorage - no data loss!

---

## Auto-Save & Data Management

### LocalStorage Auto-Save

> [!TIP]
> Your content is automatically saved to your browser's localStorage as you type!

**How it works:**
- **Automatic**: Content saves instantly as you type - no manual save needed
- **Persistent**: Your work survives browser restarts, crashes, and computer reboots
- **Private**: Data stays on your device - never sent to any servers
- **Unlimited**: No storage limits for your markdown documents

### Managing Your Content

**To save to a file:**
1. Use `Ctrl/Cmd + S` to save as `.md` file to your computer
2. Or copy content to clipboard and paste into any text editor

**To load from a file:**
1. Use `Ctrl/Cmd + O` to open existing `.md` files
2. Content will automatically load and start auto-saving


> [!NOTE]
> LocalStorage is per-browser and per-device. Content won't sync across different browsers or computers.

---

## Markdown Syntax Showcase

### Headings

# H1 Heading
## H2 Heading
### H3 Heading
#### H4 Heading
##### H5 Heading
###### H6 Heading

### Text Formatting

This is **bold text**, *italic text*, ~~strikethrough~~, `inline code`, and a [link](https://github.com/metaory/markon).

### Lists

**Unordered:**
- First item
- Second item
  - Nested item
  - Another nested item

**Ordered:**
1. First step
2. Second step
3. Third step

**Task Lists:**
- [x] Completed task
- [ ] Pending task
- [ ] Another pending task

### Code Blocks

> [!TIP]
> Syntax highlighting works in both editor and preview - see the colors!

```javascript
function greet(name) {
  console.log(`Hello, ${name}!`);
  return `Welcome to markon`;
}

greet('Developer');
```

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))
```

```bash
# Shell commands with syntax highlighting
echo "Setting up markon..."
npm install
npm run dev
```

### Tables

| Feature | Status | Notes |
|---------|--------|-------|
| GFM Support | ✅ | Full GitHub Flavored Markdown |
| Syntax Highlighting | ✅ | 250+ languages |
| Local Storage | ✅ | Auto-save enabled |
| Themes | ✅ | Multiple presets |

### Blockquotes

> This is a blockquote. It can contain multiple paragraphs.
>
> You can also include **formatting** and `code` within blockquotes.

### Alerts

> [!NOTE]
> This is a note alert - useful for general information.

> [!TIP]
> This is a tip alert - helpful advice for users.

> [!IMPORTANT]
> This is an important alert - key information users need.

> [!WARNING]
> This is a warning alert - something users should be careful about.

> [!CAUTION]
> This is a caution alert - potential risks or negative outcomes.

### Collapsible Sections

<details>
<summary>Click to expand this section</summary>

This content is hidden by default but can be revealed by clicking the summary.

You can include any markdown content here:
- Lists
- **Bold text**
- `Code snippets`

```bash
echo "Even code blocks work!"
```

</details>

### Horizontal Rules

---

### Images

![Markon Logo](https://raw.githubusercontent.com/metaory/markon/refs/heads/master/public/logo.png?raw=true)

---

## Advanced Features

### Split View Resizing

The editor features intelligent split view resizing:
- **Snap Threshold**: Resizing snaps to edges when close to boundaries
- **Smooth Dragging**: Fluid resize experience
- **Memory**: Remembers your preferred split ratio

### Theme System

Multiple theme presets available:
- Light themes for bright environments
- Dark themes for low-light usage
- High contrast options for accessibility

> [!IMPORTANT]
> All settings and content are stored locally - your data never leaves your device.

---

*Happy writing with markon!* ✨


