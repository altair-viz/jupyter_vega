import React from 'react';
import ReactDOM from 'react-dom';
import Vega from 'jupyterlab_vega_react';
import './index.css';

const VEGA_MIME_TYPE = 'application/vnd.vega.v2+json';
const VEGALITE_MIME_TYPE = 'application/vnd.vegalite.v1+json';
const CLASS_NAME = 'output_Vega rendered_html';

//
// Render data to the output area
// 
function render(props, node) {
  ReactDOM.render(<Vega {...props} />, node);
}

//
// Register the mime type and append_mime_type function with the notebook's OutputArea
// 
export function register_renderer($) {
  // Get an instance of the OutputArea object from the first CodeCellebook_
  const OutputArea = $('#notebook-container').find('.code_cell').eq(0).data('cell').output_area;
  // A function to render output of Vega mime type
  function append_mime(mimetype) {
    const embedMode = mimetype === 'application/vnd.vegalite.v1+json' ? 'vega-lite' : 'vega'
    return function(json, md, element) {
      const toinsert = this.create_output_subarea(md, CLASS_NAME, mimetype);
      this.keyboard_manager.register_events(toinsert);
      const props = {
        data: json,
        embedMode,
        renderedCallback: (error, result) => {
          if (error) return console.log(error);
          // Add a static image output to mime bundle
          const imageData = result.view.toImageURL().split(',')[1];
          
        }
      };
      render(props, toinsert[(0)]);
      element.append(toinsert);
      return toinsert;
    }
  }
  // Calculate the index of this renderer in `OutputArea.display_order`
  // e.g. Insert this renderer after any renderers with mime type that matches "+json"
  // const mime_types = OutputArea.mime_types();
  // const json_types = mime_types.filter(mimetype => mimetype.includes('+json'));
  // const index = mime_types.lastIndexOf(json_types.pop() + 1);
  // ...or just insert it at the top
  const index = 0;
  // Register the mime type and append_mime_type function with the notebook's OutputArea
  OutputArea.register_mime_type(VEGA_MIME_TYPE, append_mime(VEGA_MIME_TYPE), {
    // Is output safe?
    safe: true,
    // Index of renderer in `OutputArea.display_order`
    index: index
  });
  OutputArea.register_mime_type(VEGALITE_MIME_TYPE, append_mime(VEGALITE_MIME_TYPE), {
    // Is output safe?
    safe: true,
    // Index of renderer in `OutputArea.display_order`
    index: index
  });
}

//
// Re-render cells with output data of 'application/vnd.vega.v2+json' mime type
// 
export function render_cells($) {
  // Get all cells in notebook
  $('#notebook-container').find('.cell').toArray().forEach(item => {
    const CodeCell = $(item).data('cell');
    // If a cell has output data of 'application/vnd.vega+json' mime type
    if (CodeCell.output_area && CodeCell.output_area.outputs.find(output => output.data && (output.data[VEGA_MIME_TYPE] || output.data[VEGALITE_MIME_TYPE]))) {
      // Re-render the cell by executing it
      CodeCell.notebook.render_cell_output(CodeCell);
    }
  });
}
