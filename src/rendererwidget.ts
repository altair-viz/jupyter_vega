import {
  RenderMime
} from 'jupyterlab/lib/rendermime';

import {
  Message
} from 'phosphor/lib/core/messaging';

import {
  Widget
} from 'phosphor/lib/ui/widget';

import {
  JSONObject
} from 'phosphor/lib/algorithm/json';

import embed = require('vega-embed');

const VEGA_COMMON = 'jp-RenderedVegaCommon';

const VEGA_CLASS = 'jp-RenderedVega';

const VEGALITE_CLASS = 'jp-RenderedVegaLite';

const DEFAULT_WIDTH = 400;

const DEFAULT_HEIGHT = 400/1.5;


/**
 * A widget for displaying HTML and rendering math.
 */
export
class RenderedVegaBase extends Widget {

  constructor(options: RenderMime.IRendererOptions<JSONObject>) {
    super();
    this.addClass(VEGA_COMMON);
    this._source = options.source;
    this._injector = options.injector;
  }

  onAfterAttach(msg: Message): void {
    this._renderVega();
  }

  protected _vegaEmbedMode: string;

  private _renderVega(): void {

    let spec = this._source as any;

    if (this._vegaEmbedMode==="vega-lite") {
      spec['config'] = spec['config'] || {};
      spec['config']['cell'] = spec['config']['cell'] || {};
      spec['config']['cell']['width'] = spec['config']['cell']['width'] || DEFAULT_WIDTH;
      spec['config']['cell']['height'] = spec['config']['cell']['height'] || DEFAULT_HEIGHT;
    }

    let embedSpec = {
      mode: this._vegaEmbedMode,
      spec: spec
    };

    embed(this.node, embedSpec, (error: any, result: any): any => {
      // This is copied out for now as there is a bug in JupyterLab
      // that triggers and infinite rendering loop when this is done.
      // let imageData = result.view.toImageURL();
      // imageData = imageData.split(',')[1];
      // this._injector('image/png', imageData);
    });
  }

  private _source: JSONObject = null;
  private _injector: (mimetype: string, value: string | JSONObject) => void

}

export
class RenderedVega extends RenderedVegaBase {

  constructor(options: RenderMime.IRendererOptions<JSONObject>) {
    super(options);
    this.addClass(VEGA_CLASS);
    this._vegaEmbedMode = 'vega';
  }

}


export
class RenderedVegaLite extends RenderedVegaBase {

  constructor(options: RenderMime.IRendererOptions<JSONObject>) {
    super(options);
    this.addClass(VEGALITE_CLASS);
    this._vegaEmbedMode = 'vega-lite';
  }

}