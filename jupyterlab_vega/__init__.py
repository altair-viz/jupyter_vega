from IPython.display import display, DisplayObject
import pandas as pd
import os
import json
import warnings
from .utils import prepare_vega_spec, prepare_vegalite_spec

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

def _safe_exists(path):
    """Check path, but don't let exceptions raise"""
    try:
        return os.path.exists(path)
    except Exception:
        return False
        

class Vega():
    """Vega expects a spec (a JSON-able dict) and data (dict) argument

    not already-serialized JSON strings.

    Scalar types (None, number, string) are not allowed, only dict containers.
    """
    
    # wrap data in a property, which warns about passing already-serialized JSON
    _spec = None
    _data = None
    _read_flags = 'r'
    
    def __init__(self, spec=None, data=None, url=None, filename=None, metadata=None):
        """Create a Vega display object given raw data.

        Parameters
        ----------
        spec : dict
            Vega spec. Not an already-serialized JSON string.
        data : dict
            A dict of Vega datasets where the key is the dataset name and the 
            value is the data values. Not an already-serialized JSON string.
            Scalar types (None, number, string) are not allowed, only dict
            or list containers.
        url : unicode
            A URL to download the data from.
        filename : unicode
            Path to a local file to load the data from.
        metadata: dict
            Specify extra metadata to attach to the json display object.
        """
        
        if spec is not None and isinstance(spec, str):
            if spec.startswith('http') and url is None:
                url = spec
                filename = None
                spec = None
            elif _safe_exists(spec) and filename is None:
                url = None
                filename = spec
                spec = None
        
        self.spec = spec
        self.data = data
        self.metadata = metadata
        self.url = url
        self.filename = filename
        
        self.reload()
        self._check_data()

    def reload(self):
        """Reload the raw spec from file or URL."""
        if self.filename is not None:
            with open(self.filename, self._read_flags) as f:
                self.spec = json.loads(f.read())
        elif self.url is not None:
            try:
                # Deferred import
                from urllib.request import urlopen
                response = urlopen(self.url)
                self.spec = response.read()
                # extract encoding from header, if there is one:
                encoding = None
                for sub in response.headers['content-type'].split(';'):
                    sub = sub.strip()
                    if sub.startswith('charset'):
                        encoding = sub.split('=')[-1].strip()
                        break
                # decode spec, if an encoding was specified
                if encoding:
                    self.spec = self.spec.decode(encoding, 'replace')
            except:
                self.spec = None
    
    def _check_data(self):
        if self.spec is not None and not isinstance(self.spec, dict):
            raise TypeError("%s expects a JSONable dict, not %r" % (self.__class__.__name__, self.spec))
        if self.data is not None and not isinstance(self.data, dict):
            raise TypeError("%s expects a dict, not %r" % (self.__class__.__name__, self.data))

    @property
    def spec(self):
        return self._spec
        
    @property
    def data(self):
        return self._data
        
    @spec.setter
    def spec(self, spec):
        if isinstance(spec, str):
            # warnings.warn("%s expects a JSONable dict, not %r" % (self.__class__.__name__, spec))
            spec = json.loads(spec)
        self._spec = spec

    @data.setter
    def data(self, data):
        if isinstance(data, str):
            # warnings.warn("%s expects a dict, not %r" % (self.__class__.__name__, data))
            data = json.loads(data)
        self._data = data
        
    def _ipython_display_(self):
        bundle = {
            'application/vnd.vega.v2+json': prepare_vega_spec(self.spec, self.data),
            'text/plain': '<jupyterlab_vega.Vega object>'
        }
        display(bundle, raw=True) 
        

class VegaLite(Vega):
    """VegaLite expects a spec (a JSON-able dict) and data (JSON-able list or pandas DataFrame) argument

    not already-serialized JSON strings.

    Scalar types (None, number, string) are not allowed, only dict containers.
    """
    
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
        
        super(VegaLite, self).__init__(spec=spec, data=data, url=url, filename=filename)

    def _check_data(self):
        if self.spec is not None and not isinstance(self.spec, dict):
            raise TypeError("%s expects a JSONable dict, not %r" % (self.__class__.__name__, self.spec))
        if self.data is not None and not isinstance(self.data, (list, pd.DataFrame)):
            raise TypeError("%s expects a JSONable list or pandas DataFrame, not %r" % (self.__class__.__name__, self.data))
                    
    def _ipython_display_(self):
        bundle = {
            'application/vnd.vegalite.v1+json': prepare_vegalite_spec(self.spec, self.data),
            'text/plain': '<jupyterlab_vega.VegaLite object>'
        }
        display(bundle, raw=True)
