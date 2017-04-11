import { Widget } from '@phosphor/widgets';
import React from 'react';
import ReactDOM from 'react-dom';
import VegaComponent from 'jupyterlab_vega_react';

const VEGA_MIME_TYPE = 'application/vnd.vega.v2+json';
const VEGALITE_MIME_TYPE = 'application/vnd.vegalite.v1+json';
const CLASS_NAME = 'jp-OutputWidgetVega';

/**
 * A Phosphor widget for rendering Vega
 */
export class OutputWidget extends Widget {
  constructor(options) {
    super();
    this._mimeType = options.mimeType;
    this._data = options.model.data;
    this._metadata = options.model.metadata;
    this.addClass(CLASS_NAME);
  }

  /**
   * A message handler invoked on an `'after-attach'` message
   */
  onAfterAttach(msg) {
    /* Render initial data */
    this._render();
  }

  /**
   * A message handler invoked on an `'before-detach'` message
   */
  onBeforeDetach(msg) {
    /* Dispose of resources used by this widget */
    ReactDOM.unmountComponentAtNode(this.node);
  }

  /**
   * A message handler invoked on a `'child-added'` message
   */
  onChildAdded(msg) {
    /* e.g. Inject a static image representation into the mime bundle for
     *  endering on Github, etc. 
     */
    // renderLibrary.toPng(this.node).then(url => {
    //   const data = url.split(',')[1];
    //   this._data.set('image/png', data);
    // })
  }

  /**
   * A message handler invoked on a `'resize'` message
   */
  onResize(msg) {
    /* Re-render on resize */
    this._render();
  }

  /**
   * Render data to DOM node
   */
  _render() {
    const props = {
      data: this._data.get(this._mimeType),
      metadata: this._metadata.get(this._mimeType),
      embedMode: this._mimeType === VEGALITE_MIME_TYPE
        ? 'vega-lite'
        : 'vega',
      renderedCallback: (error, result) => {
        if (error) return console.log(error);
        // Add a static image output to mime bundle
        const imageData = result.view.toImageURL().split(',')[1];
        this._data.set('image/png', imageData);
      },
      width: this.node.offsetWidth,
      height: this.node.offsetHeight
    };
    ReactDOM.render(<VegaComponent {...props} />, this.node);
  }
}

export class OutputRenderer {
  /**
   * The mime types that this OutputRenderer accepts
   */
  mimeTypes = [VEGA_MIME_TYPE, VEGALITE_MIME_TYPE];

  /**
   * Whether the renderer can render given the render options
   */
  canRender(options) {
    return this.mimeTypes.indexOf(options.mimeType) !== -1;
  }

  /**
   * Render the transformed mime bundle
   */
  render(options) {
    return new OutputWidget(options);
  }
}
