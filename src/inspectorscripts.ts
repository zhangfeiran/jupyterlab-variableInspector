export
namespace Languages {
    export
        type LanguageModel = {
            initScript: string;
            queryCommand: string;
            matrixQueryCommand: string;
            widgetQueryCommand: string;
            deleteCommand: string;
        }
}

export
    abstract class Languages {
    /**
     * Init and query script for supported languages.
     */

    static py_script: string = `import json
import sys
from IPython import get_ipython
from IPython.core.magics.namespace import NamespaceMagics


_jupyterlab_variableinspector_nms = NamespaceMagics()
_jupyterlab_variableinspector_Jupyter = get_ipython()
_jupyterlab_variableinspector_nms.shell = _jupyterlab_variableinspector_Jupyter.kernel.shell

__np = None
__pd = None
__pyspark = None
__tf = None
__K = None
__ipywidgets = None
__torch = None


def _check_imported():
    global __np, __pd, __pyspark, __tf, __K, __ipywidgets,__torch

    if 'numpy' in sys.modules:
        # don't really need the try
        import numpy as __np

    if 'pandas' in sys.modules:
        import pandas as __pd

    if 'pyspark' in sys.modules:
        import pyspark as __pyspark

    if 'tensorflow' in sys.modules or 'keras' in sys.modules:
        import tensorflow as __tf
    if 'torch' in sys.modules:
        import torch as __torch

        try:
            import keras.backend as __K
        except ImportError:
            try:
                import tensorflow.keras.backend as __K
            except ImportError:
                __K = None

    if 'ipywidgets' in sys.modules:
        import ipywidgets as __ipywidgets


def _jupyterlab_variableinspector_getsizeof(x):
    if type(x).__name__ in ['ndarray', 'Series']:
        return x.nbytes
    elif __pyspark and isinstance(x, __pyspark.sql.DataFrame):
        return "?"
    elif __tf and isinstance(x, __tf.Variable):
        return "?"
    elif __torch and isinstance(x, __torch.Tensor):
        return x.element_size() * x.nelement()
    elif __pd and type(x).__name__ == 'DataFrame':
        return x.memory_usage().sum()
    else:
        return sys.getsizeof(x)


def _jupyterlab_variableinspector_getshapeof(x):
    if __pd and isinstance(x, __pd.DataFrame):
        return "%d rows x %d cols" % x.shape
    if __pd and isinstance(x, __pd.Series):
        return "%d rows" % x.shape
    if __np and isinstance(x, __np.ndarray):
        shape = " x ".join([str(i) for i in x.shape])
        return "%s" % shape
    if __pyspark and isinstance(x, __pyspark.sql.DataFrame):
        return "? rows x %d cols" % len(x.columns)
    if __tf and isinstance(x, __tf.Variable):
        shape = " x ".join([str(int(i)) for i in x.shape])
        return "%s" % shape
    if __tf and isinstance(x, __tf.Tensor):
        shape = " x ".join([str(int(i)) for i in x.shape])
        return "%s" % shape
    if __torch and isinstance(x, __torch.Tensor):
        shape = " x ".join([str(int(i)) for i in x.shape])
        return "%s" % shape
    if isinstance(x, list):
        return "%s" % len(x)
    if isinstance(x, dict):
        return "%s keys" % len(x)
    return None


def _jupyterlab_variableinspector_getcontentof(x):
    # returns content in a friendly way for python variables
    # pandas and numpy
    if __pd and isinstance(x, __pd.DataFrame):
        colnames = ', '.join(x.columns.map(str))
        content = "Columns: %s" % colnames
    elif __pd and isinstance(x, __pd.Series):
        content = str(x.values).replace(" ", ", ")[1:-1]
        content = content.replace("\\n", "")
    elif __np and isinstance(x, __np.ndarray):
        content = x.__repr__()
    elif __torch and isinstance(x, __torch.Tensor):
        if x.nelement() < 1048576:
            content = x.__repr__()
        else:
            content = 'too big'
    else:
        content = str(x)

    if len(content) > 150:
        return content[:150] + " ..."
    else:
        return content


def _jupyterlab_variableinspector_is_matrix(x):
    # True if type(x).__name__ in ["DataFrame", "ndarray", "Series"] else False
    if __pd and isinstance(x, __pd.DataFrame):
        return True
    if __pd and isinstance(x, __pd.Series):
        return True
    if __np and isinstance(x, __np.ndarray) and len(x.shape) <= 2:
        return True
    if __pyspark and isinstance(x, __pyspark.sql.DataFrame):
        return True
    if __tf and isinstance(x, __tf.Variable) and len(x.shape) <= 2:
        return True
    if __tf and isinstance(x, __tf.Tensor) and len(x.shape) <= 2:
        return True
    if isinstance(x, list):
        return True
    return False


def _jupyterlab_variableinspector_is_widget(x):
    return __ipywidgets and issubclass(x, __ipywidgets.DOMWidget)


def _jupyterlab_variableinspector_dict_list():
    _check_imported()
    def keep_cond(v):
        try:
            obj = eval(v)
            if isinstance(obj, str):
                return True
            if __tf and isinstance(obj, __tf.Variable):
                return True
            if __torch and isinstance(obj, __torch.Tensor):
                return True
            if __pd and __pd is not None and (
                isinstance(obj, __pd.core.frame.DataFrame)
                or isinstance(obj, __pd.core.series.Series)):
                return True
            if str(obj)[0] == "<":
                return False
            if  v in ['__np', '__pd', '__pyspark', '__tf', '__K', '__ipywidgets', '__torch']:
                return obj is not None
            if str(obj).startswith("_Feature"):
                # removes tf/keras objects
                return False
            return True
        except:
            return False
    values = _jupyterlab_variableinspector_nms.who_ls()
    vardic = [
        {
            'varName': _v,
            'varType': type(eval(_v)).__name__, 
            'varSize': str(_jupyterlab_variableinspector_getsizeof(eval(_v))), 
            'varShape': str(_jupyterlab_variableinspector_getshapeof(eval(_v))) if _jupyterlab_variableinspector_getshapeof(eval(_v)) else '', 
            'varContent': str(_jupyterlab_variableinspector_getcontentof(eval(_v))), 
            'isMatrix': _jupyterlab_variableinspector_is_matrix(eval(_v)),
            'isWidget': _jupyterlab_variableinspector_is_widget(type(eval(_v)))
        }
        for _v in values if keep_cond(_v)
    ]
    return json.dumps(vardic, ensure_ascii=False)


def _jupyterlab_variableinspector_getmatrixcontent(x, max_rows=10000):
    # to do: add something to handle this in the future
    threshold = max_rows

    if __pd and __pyspark and isinstance(x, __pyspark.sql.DataFrame):
        df = x.limit(threshold).toPandas()
        return _jupyterlab_variableinspector_getmatrixcontent(df.copy())
    elif __np and __pd and type(x).__name__ == "DataFrame":
        if threshold is not None:
            x = x.head(threshold)
        x.columns = x.columns.map(str)
        return x.to_json(orient="table", default_handler=_jupyterlab_variableinspector_default, force_ascii=False)
    elif __np and __pd and type(x).__name__ == "Series":
        if threshold is not None:
            x = x.head(threshold)
        return x.to_json(orient="table", default_handler=_jupyterlab_variableinspector_default, force_ascii=False)
    elif __np and __pd and type(x).__name__ == "ndarray":
        df = __pd.DataFrame(x)
        return _jupyterlab_variableinspector_getmatrixcontent(df)
    elif __tf and (isinstance(x, __tf.Variable) or isinstance(x, __tf.Tensor)):
        df = __K.get_value(x)
        return _jupyterlab_variableinspector_getmatrixcontent(df)
    elif isinstance(x, list):
        s = __pd.Series(x)
        return _jupyterlab_variableinspector_getmatrixcontent(s)


def _jupyterlab_variableinspector_displaywidget(widget):
    display(widget)


def _jupyterlab_variableinspector_default(o):
    if isinstance(o, __np.number): return int(o)  
    raise TypeError


def _jupyterlab_variableinspector_deletevariable(x):
    exec("del %s" % x, globals())
`;

    static r_script: string = `library(repr)

.ls.objects = function (pos = 1, pattern, order.by, decreasing = FALSE, head = FALSE, 
    n = 5) 
{
    napply <- function(names, fn) sapply(names, function(x) fn(get(x, 
        pos = pos)))
    names <- ls(pos = pos, pattern = pattern)
    names = c('.Last.value',names)

    if (length(names) == 0) {
        return(jsonlite::toJSON(data.frame()))
    }
    obj.class <- napply(names, function(x) paste(as.character(class(x)),collapse=rawToChar(as.raw(c(92,110)))))
    obj.mode <- napply(names, mode)
    obj.type <- ifelse(is.na(obj.class), obj.mode, obj.class)
    
    obj.dim <- t(napply(names, function(x) as.numeric(dim(x))[1:2]))
    has_no_dim <- is.na(obj.dim)[1:length(names)]                        
    obj.dim[has_no_dim, 1] <- napply(names, length)[has_no_dim]
    
    obj.size=rep(0,length(names))
    
    wtf=napply(names,function(x) {'patchwork' %in% class(x)})
    obj.content=rep("NA",length(names))
    obj.content[!wtf] <- napply(names[!wtf], function(x) {a=capture.output(str(x,max.level=1,comp.str=" $ ",list.len=4));paste(a[1:min(length(a),5)],collapse=rawToChar(as.raw(c(92,110))))})

    
    is_function <- (obj.type == "function")
    obj.content[is_function] <- napply(names[is_function], function(x) paste(strsplit(repr_text(x),")")[[1]][1],")",sep=""))
    obj.content <- unlist(obj.content, use.names = FALSE)
    

    out <- data.frame(obj.type, obj.size, obj.dim)
    names(out) <- c("varType", "varSize", "Rows", "Columns")
    out$varShape <- paste(out$Rows, " x ", out$Columns)
    out$varContent <- obj.content
    out$isMatrix <- FALSE
    out$varName <- row.names(out)
    out <- out[, !(names(out) %in% c("Rows", "Columns"))]
    rownames(out) <- NULL
    print(out)
    if (!missing(order.by)) 
        out <- out[order(out[[order.by]], decreasing = decreasing), 
            ]
    if (head) 
        out <- head(out, n)
    jsonlite::toJSON(out)
}

.deleteVariable <- function(x) {
    remove(list=c(x), envir=.GlobalEnv)
}
    `;
    
    static scripts: { [index: string]: Languages.LanguageModel } = {
        "python3": {
            initScript: Languages.py_script,
            queryCommand: "_jupyterlab_variableinspector_dict_list()",
            matrixQueryCommand: "_jupyterlab_variableinspector_getmatrixcontent",
            widgetQueryCommand: "_jupyterlab_variableinspector_displaywidget",
            deleteCommand: "_jupyterlab_variableinspector_deletevariable"
        },
        "python2": {
            initScript: Languages.py_script,
            queryCommand: "_jupyterlab_variableinspector_dict_list()",
            matrixQueryCommand: "_jupyterlab_variableinspector_getmatrixcontent",
            widgetQueryCommand: "_jupyterlab_variableinspector_displaywidget",
            deleteCommand: "_jupyterlab_variableinspector_deletevariable"
        },
        "python": {
            initScript: Languages.py_script,
            queryCommand: "_jupyterlab_variableinspector_dict_list()",
            matrixQueryCommand: "_jupyterlab_variableinspector_getmatrixcontent",
            widgetQueryCommand: "_jupyterlab_variableinspector_displaywidget",
            deleteCommand: "_jupyterlab_variableinspector_deletevariable"
        },
        "R": {
            initScript: Languages.r_script,
            queryCommand: ".ls.objects()",
            matrixQueryCommand: ".ls.objects",
            widgetQueryCommand: "TODO",
            deleteCommand: ".deleteVariable"
        }
    };

    public static getScript( lang: string ): Promise<Languages.LanguageModel> {
        return new Promise( function( resolve, reject ) {
            if ( lang in Languages.scripts ) {
                resolve( Languages.scripts[lang] );
            } else {
                reject( "Language " + lang + " not supported yet!" );
            }
        } );

    }

}



