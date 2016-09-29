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

const DEFAULT_WIDTH = 500;

const DEFAULT_HEIGHT = 350;


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
    console.log('Attached...')
    this._renderVega();
  }

  protected _vegaEmbedMode: string;

  private _renderVega(): void {

    let spec = this._source;
    let embedSpec = {
      mode: this._vegaEmbedMode,
      spec: spec
    };

    console.log('Calling embed', embedSpec);
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