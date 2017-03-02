import { Widget } from '@phosphor/widgets';
import React from 'react';
import ReactDOM from 'react-dom';
import Vega from 'jupyterlab_vega_react';

/**
 * The class name added to this OutputWidget.
 */
const CLASS_NAME = 'jp-OutputWidgetVega';

/**
 * A widget for rendering Vega.
 */
export class OutputWidget extends Widget {
  constructor(options) {
    super();
    this.addClass(CLASS_NAME);
    this._data = options.model.data;
    // this._metadata = options.model.metadata.get(options.mimeType);
    this._mimeType = options.mimeType;
  }

  /**
   * A message handler invoked on an `'after-attach'` message.
   */
  onAfterAttach(msg) {
    this._render();
  }

  /**
   * A message handler invoked on an `'before-detach'` message.
   */
  onBeforeDetach(msg) {
    ReactDOM.unmountComponentAtNode(this.node);
  }

  /**
   * A render function given the widget's DOM node.
   */
  _render() {
    const data = this._data.get(this._mimeType);
    // const metadata = this._metadata.get(this._mimeType);
    const props = {
      data,
      // metadata,
      embedMode: this._mimeType === 'application/vnd.vegalite.v1+json'
        ? 'vega-lite'
        : 'vega',
      renderedCallback: (error, result) => {
        if (error) return console.log(error);
        // Add a static image output to mime bundle
        const imageData = result.view.toImageURL().split(',')[1];
        this._data.set('image/png', imageData)
      }
    };
    ReactDOM.render(<Vega {...props} />, this.node);
  }
}

export class VegaOutput {
  /**
   * The mime types this OutputRenderer accepts.
   */
  mimeTypes = ['application/vnd.vega.v2+json'];

  /**
   * Whether the renderer can render given the render options.
   */
  canRender(options) {
    return this.mimeTypes.indexOf(options.mimeType) !== -1;
  }

  /**
   * Render the transformed mime bundle.
   */
  render(options) {
    return new OutputWidget(options);
  }
}

export class VegaLiteOutput {
  /**
   * The mime types this OutputRenderer accepts.
   */
  mimeTypes = ['application/vnd.vegalite.v1+json'];

  /**
   * Whether the renderer can render given the render options.
   */
  canRender(options) {
    return this.mimeTypes.indexOf(options.mimeType) !== -1;
  }

  /**
   * Render the transformed mime bundle.
   */
  render(options) {
    return new OutputWidget(options);
  }
}
