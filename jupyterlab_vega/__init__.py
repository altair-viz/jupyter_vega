from IPython.display import display


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

def Vega(data):
    bundle = {
        'application/vnd.vega.v2+json': data,
        'application/json': data,
        'text/plain': '<jupyterlab_vega.Vega object>'
    }
    display(bundle, raw=True)

def VegaLite(data):
    bundle = {
        'application/vnd.vegalite.v1+json': data,
        'application/json': data,
        'text/plain': '<jupyterlab_vega.VegaLite object>'
    }
    display(bundle, raw=True)
