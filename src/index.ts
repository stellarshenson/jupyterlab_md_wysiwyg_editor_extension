import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { requestAPI } from './handler';

/**
 * Initialization data for the jupyterlab_md_wysiwyg_editor_extension extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab_md_wysiwyg_editor_extension:plugin',
  description: 'Jupyterlab extension to allow WYSIWYG (What You See Is What You Get) markdown editor',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension jupyterlab_md_wysiwyg_editor_extension is activated!');

    requestAPI<any>('get-example')
      .then(data => {
        console.log(data);
      })
      .catch(reason => {
        console.error(
          `The jupyterlab_md_wysiwyg_editor_extension server extension appears to be missing.\n${reason}`
        );
      });
  }
};

export default plugin;
