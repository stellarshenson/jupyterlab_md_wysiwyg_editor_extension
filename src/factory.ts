/**
 * Factory for creating markdown editor widgets
 */

import { ABCWidgetFactory, DocumentRegistry } from '@jupyterlab/docregistry';
import { MarkdownEditorWidget, MarkdownEditorDocumentWidget } from './widget';

/**
 * A widget factory for markdown editors
 */
export class MarkdownEditorFactory extends ABCWidgetFactory<
  MarkdownEditorDocumentWidget,
  DocumentRegistry.ICodeModel
> {
  /**
   * Create a new widget given a context
   */
  protected createNewWidget(
    context: DocumentRegistry.IContext<DocumentRegistry.ICodeModel>
  ): MarkdownEditorDocumentWidget {
    const content = new MarkdownEditorWidget(context);

    const widget = new MarkdownEditorDocumentWidget({
      content,
      context
    });

    widget.title.iconClass = 'jp-MaterialIcon jp-MarkdownIcon';

    return widget;
  }
}
