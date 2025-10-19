/**
 * Markdown Editor Widget for JupyterLab using TOAST UI Editor
 */

import { DocumentRegistry, DocumentWidget } from '@jupyterlab/docregistry';
import { Signal } from '@lumino/signaling';
import { Widget } from '@lumino/widgets';
import { ToastEditorWrapper } from './editor';

/**
 * The class name added to the markdown editor widget
 */
const MARKDOWN_EDITOR_CLASS = 'jp-MarkdownEditor';
const MARKDOWN_EDITOR_CONTENT_CLASS = 'jp-MarkdownEditor-content';

/**
 * A widget for markdown editing using TOAST UI Editor
 *
 * Key implementation notes based on TipTap lessons learned:
 * - TOAST UI manages its own layout and scrolling (no CSS conflicts)
 * - No custom toolbar needed (TOAST UI has built-in, we hide it)
 * - Let TOAST UI control the editor container directly
 */
export class MarkdownEditorWidget extends Widget {
  private _editor: ToastEditorWrapper | null = null;
  private _model: DocumentRegistry.ICodeModel;
  private _context: DocumentRegistry.IContext<DocumentRegistry.ICodeModel>;
  private _contentChanged = new Signal<this, void>(this);

  constructor(
    context: DocumentRegistry.IContext<DocumentRegistry.ICodeModel>
  ) {
    super();
    this._context = context;
    this._model = context.model;

    this.addClass(MARKDOWN_EDITOR_CLASS);

    // Create simple container for TOAST UI
    this._setupLayout();

    // Initialize editor when context is ready
    void context.ready.then(() => {
      this._initializeEditor();
    });

    // Handle model changes (external edits)
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
   *
   * Key lesson from TipTap: Keep it simple, let the editor control its container
   */
  private _setupLayout(): void {
    // Create single container for TOAST UI Editor
    // TOAST UI will manage all internal layout
    const contentContainer = document.createElement('div');
    contentContainer.className = MARKDOWN_EDITOR_CONTENT_CLASS;

    // Add to widget
    this.node.appendChild(contentContainer);
  }

  /**
   * Initialize the TOAST UI editor
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

    // Create TOAST UI editor wrapper
    // Key: Let TOAST UI manage everything internally
    this._editor = new ToastEditorWrapper({
      host: contentContainer,
      content: initialContent,
      onUpdate: markdown => {
        this._onEditorUpdate(markdown);
      },
      showToolbar: false // Not used by TOAST UI, kept for interface compatibility
    });

    // Focus editor after initialization
    setTimeout(() => {
      if (this._editor) {
        this._editor.focus();
      }
    }, 100);
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
