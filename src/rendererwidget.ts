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
    let embedSpec = {
      mode: this._vegaEmbedMode,
      source: this._source
    };

    embed(this.node, embedSpec, function(error: any, result: any): any {
      console.log('Rendered');
      console.log(result);
    });
  }

  private _source: JSONObject = null;

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