import { Widget } from 'phosphor/lib/ui/widget';
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
    this._source = options.source;
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
    let json = this._source;
    ReactDOM.render(<Vega data={json} />, this.node);
  }

}


export class OutputRenderer {

  /**
   * The mime types this OutputRenderer accepts.
   */
  mimetypes = ['application/vnd.vega+json'];

  /**
   * Whether the input can safely sanitized for a given mime type.
   */
  isSanitizable(mimetype) {
    return this.mimetypes.indexOf(mimetype) !== -1;
  }

  /**
   * Whether the input is safe without sanitization.
   */
  isSafe(mimetype) {
    return false;
  }

  /**
   * Render the transformed mime bundle.
   */
  render(options) {
    return new OutputWidget(options);
  }

}
