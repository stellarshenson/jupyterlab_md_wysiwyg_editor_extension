/**
 * TipTap editor wrapper for JupyterLab
 */

import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { defaultMarkdownSerializer } from 'prosemirror-markdown';
import { ITipTapEditorWrapper, IEditorOptions } from './types';

/**
 * Wrapper class for TipTap editor with markdown support
 */
export class TipTapEditorWrapper implements ITipTapEditorWrapper {
  private _editor: Editor;
  private _onUpdate: (markdown: string) => void;

  constructor(options: IEditorOptions) {
    this._onUpdate = options.onUpdate;

    // Initialize TipTap editor with StarterKit extensions
    this._editor = new Editor({
      element: options.host,
      extensions: [
        StarterKit.configure({
          // Configure heading levels
          heading: {
            levels: [1, 2, 3, 4, 5, 6]
          },
          // Enable code blocks with syntax highlighting support
          codeBlock: {
            HTMLAttributes: {
              class: 'code-block'
            }
          },
          // Enable blockquotes
          blockquote: {},
          // Enable horizontal rules
          horizontalRule: {},
          // Enable lists
          bulletList: {},
          orderedList: {},
          listItem: {},
          // Enable marks
          bold: {},
          italic: {},
          strike: {},
          code: {}
        })
      ],
      content: this._markdownToHTML(options.content),
      editable: true,
      autofocus: true,
      editorProps: {
        attributes: {
          class: 'markdown-editor-content',
          spellcheck: 'true'
        }
      },
      onUpdate: ({ editor }) => {
        // Convert editor content to markdown and notify
        const markdown = this.getMarkdown();
        this._onUpdate(markdown);
      }
    });
  }

  /**
   * Get the TipTap editor instance
   */
  get editor(): Editor {
    return this._editor;
  }

  /**
   * Convert markdown to HTML for TipTap initialization
   * For now using a basic implementation - can be enhanced with markdown-it
   */
  private _markdownToHTML(markdown: string): string {
    // Basic markdown to HTML conversion
    // This is a simplified version - in production, use a proper markdown parser
    let html = markdown;

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');

    // Code
    html = html.replace(/`(.*?)`/gim, '<code>$1</code>');

    // Line breaks
    html = html.replace(/\n/gim, '<br>');

    return html;
  }

  /**
   * Get markdown content from the editor
   */
  getMarkdown(): string {
    const doc = this._editor.state.doc;

    // Use ProseMirror's markdown serializer
    const markdown = defaultMarkdownSerializer.serialize(doc);

    return markdown;
  }

  /**
   * Set markdown content in the editor
   */
  setMarkdown(markdown: string): void {
    const html = this._markdownToHTML(markdown);
    this._editor.commands.setContent(html);
  }

  /**
   * Focus the editor
   */
  focus(): void {
    this._editor.commands.focus();
  }

  /**
   * Dispose of the editor
   */
  dispose(): void {
    this._editor.destroy();
  }
}
