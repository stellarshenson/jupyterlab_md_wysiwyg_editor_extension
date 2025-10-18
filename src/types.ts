/**
 * Type definitions for the WYSIWYG Markdown Editor extension
 */

import { DocumentRegistry } from '@jupyterlab/docregistry';
import { ISignal } from '@lumino/signaling';
import { Editor as TipTapEditor } from '@tiptap/core';

/**
 * Interface for the markdown editor model
 */
export interface IMarkdownEditorModel extends DocumentRegistry.ICodeModel {
  /**
   * Signal emitted when the content changes
   */
  readonly contentChanged: ISignal<this, void>;

  /**
   * Get the markdown content
   */
  getMarkdown(): string;

  /**
   * Set the markdown content
   */
  setMarkdown(value: string): void;
}

/**
 * Interface for the TipTap editor wrapper
 */
export interface ITipTapEditorWrapper {
  /**
   * The TipTap editor instance
   */
  readonly editor: TipTapEditor;

  /**
   * Get markdown content from the editor
   */
  getMarkdown(): string;

  /**
   * Set markdown content in the editor
   */
  setMarkdown(markdown: string): void;

  /**
   * Focus the editor
   */
  focus(): void;

  /**
   * Destroy the editor instance
   */
  dispose(): void;
}

/**
 * Toolbar button configuration
 */
export interface IToolbarButton {
  /**
   * Icon name from JupyterLab icons
   */
  icon: string;

  /**
   * Tooltip text
   */
  tooltip: string;

  /**
   * Command to execute
   */
  command: () => boolean;

  /**
   * Check if button should be active
   */
  isActive?: () => boolean;
}

/**
 * Editor options for initialization
 */
export interface IEditorOptions {
  /**
   * The DOM element to attach to
   */
  host: HTMLElement;

  /**
   * Initial markdown content
   */
  content: string;

  /**
   * Callback when content changes
   */
  onUpdate: (markdown: string) => void;

  /**
   * Whether to show the toolbar
   */
  showToolbar?: boolean;
}
