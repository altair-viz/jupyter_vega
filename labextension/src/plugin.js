import { IRenderMime } from 'jupyterlab/lib/rendermime';
import { IDocumentRegistry } from 'jupyterlab/lib/docregistry';
import { toArray, ArrayExt } from '@phosphor/algorithm';
import { OutputRenderer } from './output';
import { DocWidgetFactory } from './doc';
import './index.css';

/**
 * Activate the extension.
 */
function activatePlugin(app, rendermime, registry) {
  /**
   * Calculate the index of the renderer in the array renderers (e.g. Insert 
   * this renderer after any renderers with mime type that matches "+json") 
   * or simply pass an integer such as 0.
   */
  // const index = ArrayExt.findLastIndex(
  //   toArray(rendermime.mimeTypes()),
  //   mime => mime.endsWith('+json')
  // ) + 1;
  const index = 0;

  /**
   * Add the renderer to the registry of renderers.
   */
  rendermime.addRenderer(
    {
      mimeType: 'application/vnd.vega.v2+json',
      renderer: new OutputRenderer()
    },
    index
  );

  if ('vg') {
    /**
     * Set the extensions associated with Vega.
     */
    const EXTENSIONS = ['.vg'];
    const DEFAULT_EXTENSIONS = ['.vg'];

    /**
     * Add file handler for vg files.
     */
    const options = {
      fileExtensions: EXTENSIONS,
      defaultFor: DEFAULT_EXTENSIONS,
      name: 'Vega',
      displayName: 'Vega',
      modelName: 'text',
      preferKernel: false,
      canStartKernel: false
    };

    registry.addWidgetFactory(new DocWidgetFactory(options));
  }
}

const Plugin = {
  id: 'jupyter.extensions.Vega',
  requires: 'vg'
    ? [IRenderMime, IDocumentRegistry]
    : [IRenderMime],
  activate: activatePlugin,
  autoStart: true
};

export default Plugin;
