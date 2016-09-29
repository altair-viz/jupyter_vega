# -*- coding: utf-8 -*-

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

# Running `npm run build` will create static resources in the static
# directory of this Python package (and create that directory if necessary).


def _jupyter_labextension_paths():
    return [{
        'name': 'jupyterlab_vega',
        'src': 'static',
    }]
