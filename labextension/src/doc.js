import { Widget } from 'phosphor/lib/ui/widget';
import { ABCWidgetFactory } from 'jupyterlab/lib/docregistry';
import { ActivityMonitor } from 'jupyterlab/lib/common/activitymonitor';
import React from 'react';
import ReactDOM from 'react-dom';
import Vega from 'jupyterlab_vega_react';

/**
 * The class name added to this DocWidget.
 */
const CLASS_NAME = 'jp-DocWidgetVega';

/**
 * The timeout to wait for change activity to have ceased before rendering.
 */
const RENDER_TIMEOUT = 1000;

/**
 * A widget for rendering jupyterlab_vega files.
 */
class DocWidget extends Widget {
  
  constructor(context) {
    super();
    this._context = context;
    this.addClass(CLASS_NAME);
    context.model.contentChanged.connect(() => {
      this.update();
    });
    context.pathChanged.connect(() => {
      this.update();
    });
    this._monitor = new ActivityMonitor({
      signal: context.model.contentChanged,
      timeout: RENDER_TIMEOUT
    });
    this._monitor.activityStopped.connect(this.update, this);
  }

  /**
   * Dispose of the resources used by the widget.
   */
  dispose() {
    if (!this.isDisposed) {
      this._context = null;
      ReactDOM.unmountComponentAtNode(this.node);
      this._monitor.dispose();
      super.dispose();
    }
  }

  /**
   * A message handler invoked on an `'update-request'` message.
   */
  onUpdateRequest(msg) {
    this.title.label = this._context.path.split('/').pop();
    if (this.isAttached) {
      let content = this._context.model.toString();
      const json = content ? JSON.parse(content) : {};
      const path = this._context._path;
      const props = {
        data: json,
        embedMode: path.includes('.vl') ? 'vega-lite' : 'vega'
      };
      ReactDOM.render(<Vega {...props} />, this.node);
    }
  }

  /**
   * A message handler invoked on an `'after-attach'` message.
   */
  onAfterAttach(msg) {
    this.update();
  }
  
}

/**
 * A widget factory for DocWidget.
 */
export class VegaDoc extends ABCWidgetFactory {
  
  constructor(options) {
    super(options);
  }

  /**
   * Create a new widget given a context.
   */
  createNewWidget(context, kernel) {
    let widget = new DocWidget(context);
    this.widgetCreated.emit(widget);
    return widget;
  }
  
}
