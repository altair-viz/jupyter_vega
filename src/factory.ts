
import {
  IKernel
} from 'jupyter-js-services';

import {
  ABCWidgetFactory, IDocumentModel, IDocumentContext
} from 'jupyterlab/lib/docregistry';

import {
  IRenderMime
} from 'jupyterlab/lib/rendermime';

import {
    VegaWidget, VegaLiteWidget
} from './widget';


export
class VegaWidgetFactory extends ABCWidgetFactory<VegaWidget, IDocumentModel> {

  createNew(context: IDocumentContext<IDocumentModel>, kernel?: IKernel.IModel): VegaWidget {
    let widget = new VegaWidget(context);
    this.widgetCreated.emit(widget);
    return widget;
  }

}


export
class VegaLiteWidgetFactory extends ABCWidgetFactory<VegaLiteWidget, IDocumentModel> {

  createNew(context: IDocumentContext<IDocumentModel>, kernel?: IKernel.IModel): VegaLiteWidget {
    let widget = new VegaLiteWidget(context);
    this.widgetCreated.emit(widget);
    return widget;
  }

}