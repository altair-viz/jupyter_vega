# jupyterlab_vega

A JupyterLab and Jupyter Notebook extension for rendering Vega and Vega-lite

![output renderer](http://g.recordit.co/d9dWoMUUA3.gif)

## Prerequisites

* JupyterLab ^0.15.0 and/or Notebook >=4.3.0

## Usage

To render Vega output in IPython:

```python
from jupyterlab_vega import Vega

Vega({
    "width": 400,
    "height": 200,
    "padding": {"top": 10, "left": 30, "bottom": 30, "right": 10},
    "data": [
        {
            "name": "table",
            "values": [
                {"x": 1,  "y": 28}, {"x": 2,  "y": 55},
                {"x": 3,  "y": 43}, {"x": 4,  "y": 91},
                {"x": 5,  "y": 81}, {"x": 6,  "y": 53},
                {"x": 7,  "y": 19}, {"x": 8,  "y": 87},
                {"x": 9,  "y": 52}, {"x": 10, "y": 48},
                {"x": 11, "y": 24}, {"x": 12, "y": 49},
                {"x": 13, "y": 87}, {"x": 14, "y": 66},
                {"x": 15, "y": 17}, {"x": 16, "y": 27},
                {"x": 17, "y": 68}, {"x": 18, "y": 16},
                {"x": 19, "y": 49}, {"x": 20, "y": 15}
            ]
        }
    ],
    "scales": [
        {
            "name": "x",
            "type": "ordinal",
            "range": "width",
            "domain": {"data": "table", "field": "x"}
        },
        {
            "name": "y",
            "type": "linear",
            "range": "height",
            "domain": {"data": "table", "field": "y"},
            "nice": True
        }
    ],
    "axes": [
        {"type": "x", "scale": "x"},
        {"type": "y", "scale": "y"}
    ],
    "marks": [
        {
            "type": "rect",
            "from": {"data": "table"},
            "properties": {
                "enter": {
                    "x": {"scale": "x", "field": "x"},
                    "width": {"scale": "x", "band": True, "offset": -1},
                    "y": {"scale": "y", "field": "y"},
                    "y2": {"scale": "y", "value": 0}
                },
                "update": {
                    "fill": {"value": "steelblue"}
                },
                "hover": {
                    "fill": {"value": "red"}
                }
            }
        }
    ]
})
```

Or Vega-lite:

```python
from jupyterlab_vega import VegaLite

spec = {
    "mark": "bar",
    "encoding": {
        "x": {"field": "a", "type": "ordinal"},
        "y": {"field": "b", "type": "quantitative"}
    }
}
data = [
    {"a": "A", "b": 28}, {"a": "B", "b": 55}, {"a": "C", "b": 43},
    {"a": "D", "b": 91}, {"a": "E", "b": 81}, {"a": "F", "b": 53},
    {"a": "G", "b": 19}, {"a": "H", "b": 87}, {"a": "I", "b": 52}
]

VegaLite(spec, data)
```

Using a pandas DataFrame:

```python
from jupyterlab_vega import VegaLite
import pandas as pd

df = pd.reada_json('cars.json')

VegaLite({
  "mark": "point",
  "encoding": {
    "y": {"type": "quantitative","field": "Acceleration"},
    "x": {"type": "quantitative","field": "Horsepower"}
  }
}, df)
```

Using Altair:

```python
import altair

cars = altair.load_dataset('cars')
altair.Chart(cars).mark_point().encode(
    x='Horsepower',
    y='Miles_per_Gallon',
    color='Origin',
)
```

To render a `.vg` or `.vl` (`.vg.json` and `.vl.json` are also supported) file as a tree, simply open it:

![file renderer](http://g.recordit.co/z5LF4W28nv.gif)

## Install

To install using pip:

```bash
pip install jupyterlab_vega
# For JupyterLab
jupyter labextension install --py --sys-prefix jupyterlab_vega
jupyter labextension enable --py --sys-prefix jupyterlab_vega
# For Notebook
jupyter nbextension install --py --sys-prefix jupyterlab_vega
jupyter nbextension enable --py --sys-prefix jupyterlab_vega
```

## Development

### Set up using install script

Use the `install.sh` script to build the Javascript, install the Python package, and install/enable the notebook and lab extensions:

```bash
bash install.sh --sys-prefix
```

Use the `build.sh` script to rebuild the Javascript:

```bash
bash build.sh
```

### Set up manually

Alternatively, see the `README.md` in `/labextension` and `/nbextension` for extension-specific build instructions. 

To install the Python package:

```bash
pip install -e .
```

To install the extension for JupyterLab:

```bash
jupyter labextension install --symlink --py --sys-prefix jupyterlab_vega
jupyter labextension enable --py --sys-prefix jupyterlab_vega
```

To install the extension for Jupyter Notebook:

```bash
jupyter nbextension install --symlink --py --sys-prefix jupyterlab_vega
jupyter nbextension enable --py --sys-prefix jupyterlab_vega
```
