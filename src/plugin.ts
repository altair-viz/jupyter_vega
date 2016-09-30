// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  JupyterLab, JupyterLabPlugin
} from 'jupyterlab/lib/application';

import {
  IDocumentRegistry
} from 'jupyterlab/lib/docregistry';

import {
  IRenderMime
} from 'jupyterlab/lib/rendermime';

import {
  VegaWidgetFactory, VegaLiteWidgetFactory
} from './factory';

import {
  VegaLiteRenderer, VegaRenderer
} from './renderer';

import './index.css';

/**
 * The list of file extensions for vega and vegalite.
 */
const VEGA_EXTENSIONS = ['.vg', 'vg.json', '.json'];
const VEGALITE_EXTENSIONS = ['.vl', 'vl.json', '.json'];

const vegaPlugin: JupyterLabPlugin<void> = {
  id: 'jupyter.extensions.vega',
  requires: [IDocumentRegistry, IRenderMime],
  activate: activateVegaPlugin,
  autoStart: true
};

export default vegaPlugin;


/**
 * Activate the table widget extension.
 */
function activateVegaPlugin(app: JupyterLab, 
                            registry: IDocumentRegistry,
                            rendermime: IRenderMime): void {

    // Add the MIME type based renderers at the beginning of the renderers
    rendermime.addRenderer('application/vnd.vega+json', new VegaRenderer(), 0);
    rendermime.addRenderer('application/vnd.vegalite+json', new VegaLiteRenderer(), 0);

    // Add file handler for standalone Vega JSON files
    let options = {
      fileExtensions: VEGA_EXTENSIONS,
      defaultFor: VEGA_EXTENSIONS.slice(0,2),
      displayName: 'Vega',
      modelName: 'text',
      preferKernel: false,
      canStartKernel: false
    };
    registry.addWidgetFactory(new VegaWidgetFactory(), options);

    // Add file handler for standalone VegaLite JSON files
    options = {
      fileExtensions: VEGALITE_EXTENSIONS,
      defaultFor: VEGALITE_EXTENSIONS.slice(0,2),
      displayName: 'VegaLite',
      modelName: 'text',
      preferKernel: false,
      canStartKernel: false
    };

    registry.addWidgetFactory(new VegaLiteWidgetFactory(), options);
}
