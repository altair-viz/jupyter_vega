import { IRenderMime } from '@jupyterlab/rendermime';
import { IDocumentRegistry } from '@jupyterlab/docregistry';
import { ILayoutRestorer, InstanceTracker } from '@jupyterlab/apputils';
import { toArray, ArrayExt } from '@phosphor/algorithm';
import { OutputRenderer } from './output';
import { DocWidgetFactory } from './doc';
import './index.css';

/**
 * The name of the factory
 */
const VEGA_FACTORY = 'Vega';
const VEGALITE_FACTORY = 'VegaLite';

/**
 * The mime types associated with Vega and VegaLite
 */
const VEGA_MIME_TYPE = 'application/vnd.vega.v2+json';
const VEGALITE_MIME_TYPE = 'application/vnd.vegalite.v1+json';

/**
 * The file extensions associated with Vega and VegaLite
 */
const VEGA_EXTENSIONS = ['.vg', '.vg.json'];
const VEGALITE_EXTENSIONS = ['.vl', '.vl.json'];

/**
 * Activate the extension.
 */
function activatePlugin(app, rendermime, registry, restorer) {
  /**
   * Calculate the index of the renderer in the array renderers
   * e.g. Insert this renderer after any renderers with mime type that matches 
   * "+json"
   */
  // const index = ArrayExt.findLastIndex(
  //   toArray(rendermime.mimeTypes()),
  //   mime => mime.endsWith('+json')
  // ) + 1;
  /* ...or just insert it at the top */
  const index = 0;

  /**
   * Add output renderer for application/vnd.vega.v2+json data
   */
  rendermime.addRenderer(
    {
      mimeType: VEGA_MIME_TYPE,
      renderer: new OutputRenderer()
    },
    index
  );
  
  rendermime.addRenderer(
    {
      mimeType: VEGALITE_MIME_TYPE,
      renderer: new OutputRenderer()
    },
    index
  );

  const vegaFactory = new DocWidgetFactory({
    fileExtensions: VEGA_EXTENSIONS,
    defaultFor: VEGA_EXTENSIONS.slice(0, 2),
    name: VEGA_FACTORY
  });

  const vegaLiteFactory = new DocWidgetFactory({
    fileExtensions: VEGALITE_EXTENSIONS,
    defaultFor: VEGALITE_EXTENSIONS.slice(0, 2),
    name: VEGALITE_FACTORY
  });

  /**
   * Add document renderer for .vg and .vl files
   */
  registry.addWidgetFactory(vegaFactory);
  registry.addWidgetFactory(vegaLiteFactory);

  const tracker = new InstanceTracker({
    namespace: VEGA_FACTORY,
    shell: app.shell
  });

  /**
   * Handle widget state deserialization
   */
  restorer.restore(tracker, {
    command: 'file-operations:open',
    args: widget => ({ path: widget.context.path, factory: VEGA_FACTORY }),
    name: widget => widget.context.path
  });

  /**
   * Serialize widget state
   */
  vegaFactory.widgetCreated.connect((sender, widget) => {
    tracker.add(widget);
    /* Notify the instance tracker if restore data needs to update */
    widget.context.pathChanged.connect(() => {
      tracker.save(widget);
    });
  });
  
  vegaLiteFactory.widgetCreated.connect((sender, widget) => {
    tracker.add(widget);
    /* Notify the instance tracker if restore data needs to update */
    widget.context.pathChanged.connect(() => {
      tracker.save(widget);
    });
  });
}

/**
 * Configure jupyterlab plugin
 */
const Plugin = {
  id: 'jupyter.extensions.Vega',
  requires: [IRenderMime, IDocumentRegistry, ILayoutRestorer],
  activate: activatePlugin,
  autoStart: true
};

export default Plugin;
