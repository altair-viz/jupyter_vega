from IPython.display import display
import pandas as pd
import os
import json
import warnings

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
        
def sanitize_dataframe(df):
    """Sanitize a DataFrame to prepare it for serialization.

    * Make a copy
    * Raise ValueError if it has a hierarchical index.
    * Convert categoricals to strings.
    * Convert np.int dtypes to Python int objects
    * Convert floats to objects and replace NaNs by None.
    * Convert DateTime dtypes into appropriate string representations
    """
    import pandas as pd
    import numpy as np

    df = df.copy()

    if isinstance(df.index, pd.core.index.MultiIndex):
        raise ValueError('Hierarchical indices not supported')
    if isinstance(df.columns, pd.core.index.MultiIndex):
        raise ValueError('Hierarchical indices not supported')

    for col_name, dtype in df.dtypes.iteritems():
        if str(dtype) == 'category':
            # XXXX: work around bug in to_json for categorical types
            # https://github.com/pydata/pandas/issues/10778
            df[col_name] = df[col_name].astype(str)
        elif np.issubdtype(dtype, np.integer):
            # convert integers to objects; np.int is not JSON serializable
            df[col_name] = df[col_name].astype(object)
        elif np.issubdtype(dtype, np.floating):
            # For floats, convert nan->None: np.float is not JSON serializable
            col = df[col_name].astype(object)
            df[col_name] = col.where(col.notnull(), None)
        elif str(dtype).startswith('datetime'):
            # Convert datetimes to strings
            # astype(str) will choose the appropriate resolution
            df[col_name] = df[col_name].astype(str).replace('NaT', '')
    return df


def prepare_vega_spec(spec, data=None):
    """Prepare a Vega spec for sending to the frontend.

    This allows data to be passed in either as part of the spec
    or separately. If separately, the data is assumed to be a
    pandas DataFrame or object that can be converted to to a DataFrame.

    Note that if data is not None, this modifies spec in-place
    """

    if isinstance(data, dict):
        spec['data'] = []
        # We have to do the isinstance test first because we can't
        # compare a DataFrame to None.
        for key, value in data.items():
            data = sanitize_dataframe(value)
            spec['data'].append({'name': key, 'values': data.to_dict(orient='records')})
    return spec
    
def prepare_vegalite_spec(spec, data=None):
    """Prepare a Vega-Lite spec for sending to the frontend.

    This allows data to be passed in either as part of the spec
    or separately. If separately, the data is assumed to be a
    pandas DataFrame or object that can be converted to to a DataFrame.

    Note that if data is not None, this modifies spec in-place
    """

    if isinstance(data, pd.DataFrame):
        # We have to do the isinstance test first because we can't
        # compare a DataFrame to None.
        data = sanitize_dataframe(data)
        spec['data'] = {'values': data.to_dict(orient='records')}
    elif data is None:
        # Data is either passed in spec or error
        if 'data' not in spec:
            raise ValueError('No data provided')
    else:
        # As a last resort try to pass the data to a DataFrame and use it
        data = pd.DataFrame(data)
        data = sanitize_dataframe(data)
        spec['data'] = {'values': data.to_dict(orient='records')}
    return spec

        

class Vega():
    """A display class for displaying Vega visualizations in the Jupyter Notebook and IPython kernel.
    
    Vega expects a spec (a JSON-able dict) and data (dict) argument

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
        display(bundle, metadata=metadata, raw=True) 
        

class VegaLite(Vega):
    """A display class for displaying Vega-lite visualizations in the Jupyter Notebook and IPython kernel.

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
        metadata = {
            'application/vnd.vegalite.v1+json': self.metadata
        }
        display(bundle, metadata=metadata, raw=True)
