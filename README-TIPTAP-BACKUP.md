# TipTap Implementation Backup - Restoration Guide

## What This Backup Contains

This is a backup of the TipTap-based WYSIWYG markdown editor implementation for JupyterLab. The implementation was technically sound but encountered CSS/layout issues with JupyterLab's Lumino widget system that proved difficult to resolve.

## Implementation Status

**What Works:**
- ✅ TipTap editor integration with StarterKit extensions
- ✅ Markdown serialization (ProseMirror → Markdown)
- ✅ JupyterLab DocumentWidget integration
- ✅ Widget factory registration
- ✅ Toolbar with formatting buttons (B, I, S, H1-H3, lists, etc.)
- ✅ Theme-aware styling using JupyterLab CSS variables
- ✅ TypeScript compilation
- ✅ Extension builds and installs successfully

**What Doesn't Work:**
- ❌ Content doesn't scroll (CSS containment issue)
- ❌ No margins/padding on content (CSS override issues)
- ❌ White frame around editor (parent widget styling)

## Root Cause Analysis

The issues stem from Lumino's widget positioning system:
- Lumino applies inline `style="position: absolute; contain: strict; ..."`
- CSS `contain: strict` blocks overflow scrolling
- Our CSS overrides couldn't properly override inline styles
- Parent `.lm-DockPanel-widget` adds white background/borders

See `tmp/` folder for detailed investigation:
- `tmp/DEBUG_ANALYSIS.md` - Console output analysis
- `tmp/SYNTHESIS.md` - Agent research findings
- `tmp/SCRATCHPAD.md` - Investigation timeline

## How to Restore This Implementation

### 1. Extract the Backup

```bash
cd /home/lab/workspace/private/jupyterlab/jupyterlab_md_wysiwyg_editor_extension
unzip backup-tiptap.zip
```

### 2. Install Dependencies

```bash
npm install
# or
make build
```

This will install:
- `@tiptap/core@^3.7.2`
- `@tiptap/starter-kit@^3.7.2`
- `@tiptap/pm@^3.7.2`
- `prosemirror-markdown@^1.13.2`

### 3. Build and Install

```bash
make build
make install
```

### 4. Refresh JupyterLab

Hard refresh browser (Ctrl+Shift+R) or restart JupyterLab backend.

## File Structure

```
src/
├── types.ts          # TypeScript interfaces
├── editor.ts         # TipTap wrapper class
├── widget.ts         # JupyterLab DocumentWidget
├── factory.ts        # Widget factory for .md files
└── index.ts          # Plugin registration

style/
├── base.css          # DocumentWidget overrides
├── editor.css        # Editor and toolbar styles
└── index.css         # Main CSS import

tmp/                  # Investigation & research
├── SCRATCHPAD.md           # Investigation timeline
├── DEBUG_ANALYSIS.md       # Console output analysis
├── SYNTHESIS.md            # Agent findings summary
├── agent1-css-rules.md     # JupyterLab CSS analysis
├── agent2-findings.md      # Containment research
├── agent3-working-patterns.md  # JupyterLab patterns
└── ...
```

## Key Implementation Details

### TipTap Configuration

The editor uses:
- **StarterKit** with: headings, bold, italic, strike, code, lists, blockquote, codeBlock
- **prosemirror-markdown** for serialization
- **ProseMirror** as underlying document model

### Markdown Conversion

```typescript
// Markdown → HTML (on load)
editor.setContent(markdownToHTML(content))

// HTML → Markdown (on save)
const markdown = defaultMarkdownSerializer.serialize(editor.state.doc)
```

### Widget Integration

Follows JupyterLab patterns:
- Extends `DocumentWidget` with `ICodeModel`
- Uses `ABCWidgetFactory` for widget creation
- Connects to `sharedModel.getSource()` / `sharedModel.setSource()`

## Known Issues & Attempted Fixes

### CSS Containment (contain: strict)

**Attempted Fix:**
```css
.lm-Widget.jp-MarkdownEditor {
  contain: none !important;
}
```

**Result:** CSS didn't override inline styles

### Scrolling

**Attempted Fix:**
```css
.jp-MarkdownEditor-content {
  flex: 1 1 auto !important;
  overflow-y: auto !important;
  min-height: 0 !important;
}
```

**Result:** Didn't work due to containment blocking scroll propagation

### Margins/Padding

**Attempted Fix:**
```css
.jp-MarkdownEditor-content .ProseMirror {
  padding: 16px 32px !important;
}
```

**Result:** Padding wasn't visible (possibly clipped or not applied)

## Research Findings

Three parallel agents investigated the issues:

**Agent 1 (CSS Rules Hunter):**
- White frame comes from `.lm-DockPanel-widget`
- Containment from `.jp-MainAreaWidget-ContainStrict`
- Our selectors were correct

**Agent 2 (Containment Expert):**
- Created HTML test proving `contain: strict` blocks scrolling
- Confirmed `contain: none` should fix it
- Validated use of `!important`

**Agent 3 (Working Patterns):**
- JupyterLab uses 3-level containment strategy
- Other widgets use `overflow: visible` on container
- **Important:** JupyterLab never uses `contain: none`

## Alternative Approaches to Try

If restoring this implementation, consider:

### 1. Use TipTap editorProps Instead of CSS

```typescript
new Editor({
  editorProps: {
    attributes: {
      style: 'padding: 16px 32px; overflow-y: auto; height: 100%;'
    }
  }
})
```

### 2. Restructure Widget Hierarchy

Create intermediate wrapper that handles scrolling outside ProseMirror.

### 3. Use Different Positioning

Override Lumino's absolute positioning (may break JupyterLab integration).

### 4. Switch Frameworks

Consider TOAST UI Editor or other alternatives that might integrate better with Lumino.

## Why We're Switching to TOAST UI

TOAST UI Editor was the backup choice from original evaluation:
- **Score:** 7.8/10 (vs TipTap's 8.7/10)
- **Pros:**
  - More integrated solution (not headless)
  - Built-in UI components
  - May handle layout better
- **Cons:**
  - Slightly longer development time
  - More opinionated

## Version Info

- **Last working version:** 0.1.15
- **TipTap version:** 3.7.2
- **JupyterLab version:** ^4.0.0
- **Date backed up:** 2025-10-18

## Contact / Questions

All investigation documents are in `tmp/` folder for reference.
