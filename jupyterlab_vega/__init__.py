from IPython.display import display, DisplayObject, JSON
import pandas as pd
import json
from .utils import prepare_spec


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


# A Vega display function that can be used within a notebook. E.g.:
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
            'text/plain': '<jupyterlab_vega.Vega object>'
        }
        display(bundle, raw=True)
        
# A VegaLite display function that can be used within a notebook. E.g.:
#   from jupyterlab_vega import VegaLite
#   VegaLite(spec, data)

class VegaLite(DisplayObject):
    """VegaLite expects a spec (a JSON-able dict) and data (JSON-able dict or list) argument

    not an already-serialized JSON string.

    Scalar types (None, number, string) are not allowed, only dict containers.
    """
    # wrap data in a property, which warns about passing already-serialized JSON
    _spec = None
    _data = None
    def __init__(self, spec=None, data=None, url=None, filename=None, metadata=None):
        """Create a VegaLite display object given raw data.

        Parameters
        ----------
        spec : dict
            VegaLite spec. Not an already-serialized JSON string.
        data : dict or list
            VegaLite data. Not an already-serialized JSON string.
            Scalar types (None, number, string) are not allowed, only dict
            or list containers.
        url : unicode
            A URL to download the data from.
        filename : unicode
            Path to a local file to load the data from.
        metadata: dict
            Specify extra metadata to attach to the json display object.
        """
        self.spec = spec
        self.metadata = metadata
        super(VegaLite, self).__init__(data=data, url=url, filename=filename)

    def _check_data(self):
        if self.spec is not None and not isinstance(self.spec, dict):
            raise TypeError("%s expects a JSONable dict, not %r" % (self.__class__.__name__, self.spec))
        if self.data is not None and not isinstance(self.data, (dict, list, pd.DataFrame)):
            raise TypeError("%s expects a JSONable dict, not %r" % (self.__class__.__name__, self.data))

    @property
    def spec(self):
        return self._spec
        
    @property
    def data(self):
        return self._data
        
    @spec.setter
    def spec(self, spec):
        if isinstance(spec, str):
            warnings.warn("VegaLite expects a JSONable dict, not JSON strings")
            spec = json.loads(spec)
        self._spec = spec

    @data.setter
    def data(self, data):
        if isinstance(data, str):
            warnings.warn("JSON expects JSONable dict or list, not JSON strings")
            data = json.loads(data)
        self._data = data
        
    def _ipython_display_(self):
        bundle = {
            'application/vnd.vegalite.v1+json': prepare_spec(self.spec, self.data),
            'text/plain': '<jupyterlab_vega.VegaLite object>'
        }
        display(bundle, raw=True)
