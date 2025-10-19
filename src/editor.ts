/**
 * TOAST UI Editor wrapper for JupyterLab integration
 */

import Editor from '@toast-ui/editor';
import '@toast-ui/editor/dist/toastui-editor.css';

import { IToastEditorWrapper, IEditorOptions } from './types';

/**
 * Wrapper class for TOAST UI Editor
 *
 * Key differences from TipTap:
 * - TOAST UI manages its own layout and scrolling internally
 * - Provides both WYSIWYG and Markdown modes
 * - Has built-in toolbar (we hide it to avoid conflicts with Lumino)
 */
export class ToastEditorWrapper implements IToastEditorWrapper {
  private _editor: Editor;
  private _onUpdate: (markdown: string) => void;
  private _isDisposed = false;

  constructor(options: IEditorOptions) {
    this._onUpdate = options.onUpdate;

    // Create TOAST UI Editor instance
    // Key: Use 'wysiwyg' initialEditType and hide mode switch
    this._editor = new Editor({
      el: options.host,
      height: '100%', // Let Lumino control the height
      initialEditType: 'wysiwyg', // Start in WYSIWYG mode
      initialValue: options.content,
      previewStyle: 'vertical', // Split view (won't show in wysiwyg mode)
      usageStatistics: false, // Disable analytics
      hideModeSwitch: true, // Hide mode switcher (WYSIWYG only)
      autofocus: false, // Let JupyterLab control focus
      toolbarItems: [], // Hide default toolbar to avoid Lumino conflicts
      events: {
        change: () => {
          if (!this._isDisposed) {
            const markdown = this._editor.getMarkdown();
            this._onUpdate(markdown);
          }
        }
      }
    });
  }

  /**
   * Get the TOAST UI editor instance
   */
  get editor(): Editor {
    return this._editor;
  }

  /**
   * Get markdown content from editor
   */
  getMarkdown(): string {
    return this._editor.getMarkdown();
  }

  /**
   * Set markdown content in editor
   */
  setMarkdown(markdown: string): void {
    this._editor.setMarkdown(markdown);
  }

  /**
   * Focus the editor
   */
  focus(): void {
    this._editor.focus();
  }

  /**
   * Dispose of the editor instance
   */
  dispose(): void {
    if (!this._isDisposed) {
      this._isDisposed = true;
      this._editor.destroy();
    }
  }
}
