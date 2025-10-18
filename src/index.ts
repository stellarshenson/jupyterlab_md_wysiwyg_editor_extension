import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { IEditorServices } from '@jupyterlab/codeeditor';

import { MarkdownEditorFactory } from './factory';

/**
 * The markdown file type
 */
const MARKDOWN_FACTORY = 'Markdown WYSIWYG Editor';

/**
 * Initialization data for the jupyterlab_md_wysiwyg_editor_extension extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab_md_wysiwyg_editor_extension:plugin',
  description:
    'Jupyterlab extension to allow WYSIWYG (What You See Is What You Get) markdown editor',
  autoStart: true,
  requires: [IEditorServices],
  activate: (app: JupyterFrontEnd, editorServices: IEditorServices) => {
    console.log(
      'JupyterLab extension jupyterlab_md_wysiwyg_editor_extension is activated!'
    );

    // Create the factory
    const factory = new MarkdownEditorFactory({
      name: MARKDOWN_FACTORY,
      label: 'Markdown WYSIWYG Editor',
      fileTypes: ['markdown'],
      defaultFor: ['markdown'],
      modelName: 'text',
      preferKernel: false,
      canStartKernel: false,
      readOnly: false
    });

    // Register the factory
    app.docRegistry.addWidgetFactory(factory);

    // Register markdown file type if not already registered
    const markdownFileType = app.docRegistry.getFileType('markdown');
    if (!markdownFileType) {
      app.docRegistry.addFileType({
        name: 'markdown',
        displayName: 'Markdown',
        extensions: ['.md', '.markdown', '.mkd'],
        mimeTypes: ['text/markdown', 'text/x-markdown']
      });
    }

    console.log('Markdown WYSIWYG Editor factory registered');
  }
};

export default plugin;
