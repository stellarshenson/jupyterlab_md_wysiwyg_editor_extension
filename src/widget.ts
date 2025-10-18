/**
 * Markdown Editor Widget for JupyterLab
 */

import { DocumentRegistry, DocumentWidget } from '@jupyterlab/docregistry';
import { Signal } from '@lumino/signaling';
import { Widget } from '@lumino/widgets';
import { TipTapEditorWrapper } from './editor';

/**
 * The class name added to the markdown editor widget
 */
const MARKDOWN_EDITOR_CLASS = 'jp-MarkdownEditor';
const MARKDOWN_EDITOR_CONTENT_CLASS = 'jp-MarkdownEditor-content';
const MARKDOWN_EDITOR_TOOLBAR_CLASS = 'jp-MarkdownEditor-toolbar';

/**
 * A widget for markdown editing using TipTap
 */
export class MarkdownEditorWidget extends Widget {
  private _editor: TipTapEditorWrapper | null = null;
  private _model: DocumentRegistry.ICodeModel;
  private _context: DocumentRegistry.IContext<DocumentRegistry.ICodeModel>;
  private _toolbar: Widget | null = null;
  private _contentChanged = new Signal<this, void>(this);

  constructor(
    context: DocumentRegistry.IContext<DocumentRegistry.ICodeModel>
  ) {
    super();
    this._context = context;
    this._model = context.model;

    this.addClass(MARKDOWN_EDITOR_CLASS);

    // Create container structure
    this._setupLayout();

    // Initialize editor when context is ready
    void context.ready.then(() => {
      this._initializeEditor();
    });

    // Handle model changes
    this._model.contentChanged.connect(this._onModelChanged, this);

    // Handle context path changes
    this._context.pathChanged.connect(this._onPathChanged, this);
  }

  /**
   * Signal emitted when content changes
   */
  get contentChanged(): Signal<this, void> {
    return this._contentChanged;
  }

  /**
   * The markdown editor context
   */
  get context(): DocumentRegistry.IContext<DocumentRegistry.ICodeModel> {
    return this._context;
  }

  /**
   * Set up the widget layout
   */
  private _setupLayout(): void {
    // Create toolbar container
    this._toolbar = new Widget();
    this._toolbar.addClass(MARKDOWN_EDITOR_TOOLBAR_CLASS);

    // Create editor content container
    const contentContainer = document.createElement('div');
    contentContainer.className = MARKDOWN_EDITOR_CONTENT_CLASS;

    // Add to widget
    this.node.appendChild(this._toolbar.node);
    this.node.appendChild(contentContainer);
  }

  /**
   * Initialize the TipTap editor
   */
  private _initializeEditor(): void {
    const contentContainer = this.node.querySelector(
      `.${MARKDOWN_EDITOR_CONTENT_CLASS}`
    ) as HTMLElement;

    if (!contentContainer) {
      console.error('Content container not found');
      return;
    }

    // Get initial content from model
    const initialContent = this._model.sharedModel.getSource();

    // Create editor wrapper
    this._editor = new TipTapEditorWrapper({
      host: contentContainer,
      content: initialContent,
      onUpdate: markdown => {
        this._onEditorUpdate(markdown);
      },
      showToolbar: true
    });

    // Build toolbar
    this._buildToolbar();

    // Focus editor
    this._editor.focus();
  }

  /**
   * Build the toolbar with formatting buttons
   */
  private _buildToolbar(): void {
    if (!this._editor || !this._toolbar) {
      return;
    }

    const editor = this._editor.editor;

    // Create toolbar buttons
    const buttons = [
      {
        icon: 'ui-components:bold',
        tooltip: 'Bold (Ctrl+B)',
        command: () => editor.chain().focus().toggleBold().run(),
        isActive: () => editor.isActive('bold')
      },
      {
        icon: 'ui-components:italic',
        tooltip: 'Italic (Ctrl+I)',
        command: () => editor.chain().focus().toggleItalic().run(),
        isActive: () => editor.isActive('italic')
      },
      {
        icon: 'ui-components:strike',
        tooltip: 'Strikethrough',
        command: () => editor.chain().focus().toggleStrike().run(),
        isActive: () => editor.isActive('strike')
      },
      {
        icon: 'ui-components:code',
        tooltip: 'Inline Code',
        command: () => editor.chain().focus().toggleCode().run(),
        isActive: () => editor.isActive('code')
      },
      {
        icon: 'ui-components:list-ul',
        tooltip: 'Bullet List',
        command: () => editor.chain().focus().toggleBulletList().run(),
        isActive: () => editor.isActive('bulletList')
      },
      {
        icon: 'ui-components:list-ol',
        tooltip: 'Numbered List',
        command: () => editor.chain().focus().toggleOrderedList().run(),
        isActive: () => editor.isActive('orderedList')
      },
      {
        icon: 'ui-components:quote',
        tooltip: 'Blockquote',
        command: () => editor.chain().focus().toggleBlockquote().run(),
        isActive: () => editor.isActive('blockquote')
      },
      {
        icon: 'ui-components:code-block',
        tooltip: 'Code Block',
        command: () => editor.chain().focus().toggleCodeBlock().run(),
        isActive: () => editor.isActive('codeBlock')
      }
    ];

    // Add heading buttons
    for (let level = 1; level <= 3; level++) {
      buttons.push({
        icon: 'ui-components:header',
        tooltip: `Heading ${level}`,
        command: () =>
          editor.chain().focus().toggleHeading({ level: level as any }).run(),
        isActive: () => editor.isActive('heading', { level })
      });
    }

    // Create toolbar buttons (simplified for now - will enhance with JupyterLab UI components)
    buttons.forEach(buttonConfig => {
      const button = document.createElement('button');
      button.className = 'jp-ToolbarButtonComponent';
      button.title = buttonConfig.tooltip;
      button.textContent = buttonConfig.tooltip.split(' ')[0];

      button.onclick = () => {
        buttonConfig.command();
        this._updateToolbarState();
      };

      this._toolbar!.node.appendChild(button);
    });

    // Update toolbar state on editor updates
    editor.on('selectionUpdate', () => {
      this._updateToolbarState();
    });
  }

  /**
   * Update toolbar button states (active/inactive)
   */
  private _updateToolbarState(): void {
    // This will be enhanced with proper active state styling
    // For now, buttons work but don't show active state visually
  }

  /**
   * Handle editor content updates
   */
  private _onEditorUpdate(markdown: string): void {
    // Update model with new content
    const currentContent = this._model.sharedModel.getSource();
    if (currentContent !== markdown) {
      this._model.sharedModel.setSource(markdown);
      this._contentChanged.emit();
    }
  }

  /**
   * Handle model content changes (from external sources)
   */
  private _onModelChanged(): void {
    if (!this._editor) {
      return;
    }

    const modelContent = this._model.sharedModel.getSource();
    const editorContent = this._editor.getMarkdown();

    // Only update editor if content differs (avoid circular updates)
    if (modelContent !== editorContent) {
      this._editor.setMarkdown(modelContent);
    }
  }

  /**
   * Handle context path changes
   */
  private _onPathChanged(): void {
    // Could update title or other path-dependent UI elements
  }

  /**
   * Dispose of the widget
   */
  dispose(): void {
    if (this._editor) {
      this._editor.dispose();
      this._editor = null;
    }

    Signal.clearData(this);
    super.dispose();
  }
}

/**
 * A document widget for markdown files
 */
export class MarkdownEditorDocumentWidget extends DocumentWidget<
  MarkdownEditorWidget,
  DocumentRegistry.ICodeModel
> {
  constructor(
    options: DocumentWidget.IOptions<
      MarkdownEditorWidget,
      DocumentRegistry.ICodeModel
    >
  ) {
    super(options);
  }
}
