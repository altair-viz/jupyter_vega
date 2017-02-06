from IPython.display import display, JSON
from .utils import prepare_spec
import json


# Running `npm run build` will create static resources in the static
# directory of this Python package (and create that directory if necessary).


def _jupyter_labextension_paths():
    return [{
        'name': 'jupyterlab_vega',
        'src': 'static',
    }]

def _jupyter_nbextension_paths():
    return [{
        'section': 'notebook',
        'src': 'static',
        'dest': 'jupyterlab_vega',
        'require': 'jupyterlab_vega/extension'
    }]


# A display function that can be used within a notebook. E.g.:
#   from jupyterlab_vega import Vega
#   Vega(data)

class Vega(JSON):

    @property
    def data(self):
        return self._data
    
    @data.setter
    def data(self, data):
        if isinstance(data, str):
            data = json.loads(data)
        self._data = data

    def _ipython_display_(self):
        bundle = {
            'application/vnd.vega.v2+json': self.data,
            'text/plain': '<jupyterlab_geojson.GeoJSON object>'
        }
        display(bundle, raw=True)

def VegaLite(spec, data):
    data = prepare_spec(spec, data)
    bundle = {
        'application/vnd.vegalite.v1+json': data,
        'application/json': data,
        'text/plain': json.dumps(data, indent=4)
    }
    display(bundle, raw=True)
