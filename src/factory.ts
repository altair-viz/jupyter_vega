
import {
  IKernel
} from 'jupyter-js-services';

import {
  ABCWidgetFactory, IDocumentModel, IDocumentContext
} from 'jupyterlab/lib/docregistry';

import {
    VegaWidget, VegaLiteWidget
} from './widget';

/**
 * A widget factory for the Vega widget
 */
export
class VegaWidgetFactory extends ABCWidgetFactory<VegaWidget, IDocumentModel> {
  /**
   * Create a new widget given a context.
   */
  createNew(context: IDocumentContext<IDocumentModel>, kernel?: IKernel.IModel): VegaWidget {
    let widget = new VegaWidget(context);
    this.widgetCreated.emit(widget);
    return widget;
  }
}


/**
 * A widget factory for the VegaLite widget
 */
export
class VegaLiteWidgetFactory extends ABCWidgetFactory<VegaLiteWidget, IDocumentModel> {
  /**
   * Create a new widget given a context.
   */
  createNew(context: IDocumentContext<IDocumentModel>, kernel?: IKernel.IModel): VegaLiteWidget {
    let widget = new VegaLiteWidget(context);
    this.widgetCreated.emit(widget);
    return widget;
  }
}
