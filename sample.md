# markon

## Minimal distraction-free live Markdown editor

[getmarkon.com](https://getmarkon.com)

---

## Features

- **GFM**: GitHub Flavored Markdown + alerts
- **Syntax**: 250+ languages with highlighting
- **Split view**: resizable editor & preview
- **Auto-save**: localStorage persistence
- **Themes**: multiple presets
- **Hotkeys**: keyboard shortcuts
- **Offline**: no network required

## Roadmap

- [ ] **VIMODE**: codemirror-vim
- [x] **Autosave**: local persistence
- [ ] **Export**: PDF/HTML
- [x] **Mobile**: touch gestures
- [x] **PWA**: installable, offline cache
- [x] **Scroll**: toggle scroll follow
- [ ] **Share**: url hash content
- [x] **Snap**: split resize snapping
- [x] **Shortcuts**: command palette
- [x] **Theming**: custom CSS look
- [x] **Theme Presets**: multiple presets in settings

> [!NOTE]
> _in no particular order_

---

### C

```c
#include <stdio.h>

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    printf("Fibonacci(10) = %d\n", fibonacci(10));
    return 0;
}
```

### Rust

```rust
fn fibonacci(n: u32) -> u32 {
    match n {
        0 | 1 => n,
        _ => fibonacci(n - 1) + fibonacci(n - 2),
    }
}

fn main() {
    println!("Fibonacci(10) = {}", fibonacci(10));
}
```

### Keyboard Shortcuts

| Shortcut               | Action              |
| ---------------------- | ------------------- |
| `Ctrl/Cmd + S`         | Save to file        |
| `Ctrl/Cmd + O`         | Open file           |
| `Ctrl/Cmd + P`         | Toggle preview      |
| `Ctrl/Cmd + M`         | Toggle theme        |
| `Ctrl/Cmd + K`         | Toggle spellcheck   |
| `Ctrl/Cmd + Shift + C` | Copy to clipboard   |
| `Ctrl/Cmd + Shift + V` | Load from clipboard |
| `Ctrl/Cmd + /`         | Open settings       |

> [!TIP]
> All content is automatically saved to localStorage - no data loss!

### Basic Usage

1. **Type** your markdown in the left panel
2. **Preview** renders live in the right panel
3. **Resize** the split by dragging the divider
4. **Save** your work with `Ctrl+S` (or `Cmd+S` on Mac)

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

This is **bold text**, _italic text_, ~~strikethrough~~, `inline code`, and a [link](https://github.com/getmarkon/markon).

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

greet("Developer");
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

## Language Loading & Caching

**markon** uses **lazy loading** for syntax highlighting to keep the app fast and lightweight:

- **On-demand loading**: Language modules are only loaded when you use them
- **Smart caching**: Once loaded, languages work offline in future sessions
- **250+ languages**: Full highlight.js support with minimal initial bundle size
- **PWA optimized**: Cached languages persist across app updates

> [!TIP]
> **Offline behavior**: Languages you've used before will work offline. New languages require an internet connection to load initially.

### Tables

| Feature             | Status | Notes                         |
| ------------------- | ------ | ----------------------------- |
| GFM Support         | ✅     | Full GitHub Flavored Markdown |
| Syntax Highlighting | ✅     | 250+ languages                |
| Local Storage       | ✅     | Auto-save enabled             |
| Themes              | ✅     | Multiple presets              |

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

_Happy writing with markon!_ ✨
