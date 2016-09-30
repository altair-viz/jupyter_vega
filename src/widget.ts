import {
  JSONObject
} from 'phosphor/lib/algorithm/json';

import {
  Message
} from 'phosphor/lib/core/messaging';

import {
  Widget
} from 'phosphor/lib/ui/widget';

import {
  Panel, PanelLayout
} from 'phosphor/lib/ui/panel';

import {
  ActivityMonitor
} from 'jupyterlab/lib/common/activitymonitor';

import {
  IDocumentModel, IDocumentContext
} from 'jupyterlab/lib/docregistry';

import {
  RenderMime
} from 'jupyterlab/lib/rendermime';

import {
  RenderedVega, RenderedVegaLite
} from './rendererwidget';


import embed = require('vega-embed');


const BASE_VEGA_CLASS = 'jp-BaseVegaWidget';

/**
 * The class name added to a Vega widget.
 */
const VEGA_CLASS = 'jp-VegaWidget';

/**
 * The class name added to a VegaLite widget.
 */
const VEGALITE_CLASS = 'jp-VegaLiteWidget';

const RENDER_TIMEOUT = 1000;


export
class BaseVegaWidget extends Panel {

  constructor(context: IDocumentContext<IDocumentModel>) {
    super();
    this.addClass(BASE_VEGA_CLASS);
    this._context = context;

    if (context.model.toJSON()) {
      this.renderTitle();
      this.renderVega();
    }
    context.pathChanged.connect(() => {
      this.renderTitle();
    });
    this._monitor = new ActivityMonitor({
      signal: context.model.contentChanged,
      timeout: RENDER_TIMEOUT
    });
    this._monitor.activityStopped.connect(() => { this.renderVega(); });
    context.contentsModelChanged.connect(() => {
      this.renderVega();
    });
  }

  /**
   * Dispose of the resources used by the widget.
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    this._context = null;
    this._monitor.dispose();
    super.dispose();
  }

  protected onUpdateRequest(msg: Message): void {
    let context = this._context;

    if (this._updateTitle) {
      this.title.label = context.path.split('/').pop();
      this._updateTitle = false;
    }

    if (this._updateVega) {
      let cm = context.contentsModel;
      if (cm === null) {
        return;
      }
      let layout = this.layout as PanelLayout;
      let sdata = context.model.toString();
      let options = {mimetype: this.mimetype,
                    source: JSON.parse(sdata)}
      let widget = new RenderedVegaLite(options);
      if (layout.widgets.length) {
        layout.widgets.at(0).dispose();
      }
      layout.addWidget(widget);
      this._updateVega = false;
    }
  }

  protected mimetype: string;

  protected renderTitle(): void {
    this._updateTitle = true;
    this.update();
  }

  protected renderVega(): void {
    this._updateVega = true;
    this.update();
  }

  private _updateTitle = false;
  private _updateVega = false;
  private _context: IDocumentContext<IDocumentModel>;
  private _monitor: ActivityMonitor<any, any> = null;
}


/**
 * A widget for rendering Vega JSON
 */
export
class VegaWidget extends BaseVegaWidget {
  /**
   * Construct a VegaWidget
   */
  constructor(context: IDocumentContext<IDocumentModel>) {
    super(context);
    this.addClass(VEGA_CLASS);
    this.mimetype = 'application/vnd.vega+json';
  }
}


/**
 * A widget for rendering VegaLite JSON
 */
export
class VegaLiteWidget extends BaseVegaWidget {
  /**
   * Construct a VegaLiteWidget
   */
  constructor(context: IDocumentContext<IDocumentModel>) {
    super(context);
    this.addClass(VEGALITE_CLASS);
    this.mimetype = 'application/vnd.vegalite+json';
  }
}

