import { Signal } from "@lumino/signaling";
import { JSONModel } from "@lumino/datagrid";
/**
 * An object that handles code inspection.
 */
export class VariableInspectionHandler {
    constructor(options) {
        this._disposed = new Signal(this);
        this._inspected = new Signal(this);
        this._isDisposed = false;
        /*
         * Handle query response. Emit new signal containing the IVariableInspector.IInspectorUpdate object.
         * (TODO: query resp. could be forwarded to panel directly)
         */
        this._handleQueryResponse = (response) => {
            let msgType = response.header.msg_type;
            switch (msgType) {
                case "execute_result":
                    let payload = response.content;
                    let content = payload.data["text/plain"];
                    if (content.slice(0, 1) == "'" || content.slice(0, 1) == "\"") {
                        content = content.slice(1, -1);
                        content = content.replace(/\\"/g, "\"").replace(/\\'/g, "\'");
                    }
                    let update;
                    update = JSON.parse(content);
                    let title;
                    title = {
                        contextName: "",
                        kernelName: this._connector.kernelName || ""
                    };
                    this._inspected.emit({ title: title, payload: update });
                    break;
                case "display_data":
                    let payload_display = response.content;
                    let content_display = payload_display.data["text/plain"];
                    if (content_display.slice(0, 1) == "'" || content_display.slice(0, 1) == "\"") {
                        content_display = content_display.slice(1, -1);
                        content_display = content_display.replace(/\\"/g, "\"").replace(/\\'/g, "\'");
                    }
                    let update_display;
                    update_display = JSON.parse(content_display);
                    let title_display;
                    title_display = {
                        contextName: "",
                        kernelName: this._connector.kernelName || ""
                    };
                    this._inspected.emit({ title: title_display, payload: update_display });
                    break;
                default:
                    break;
            }
        };
        /*
         * Invokes a inspection if the signal emitted from specified session is an 'execute_input' msg.
         */
        this._queryCall = (sess, msg) => {
            let msgType = msg.header.msg_type;
            switch (msgType) {
                case 'execute_input':
                    let code = msg.content.code;
                    if (!(code == this._queryCommand) && !(code == this._matrixQueryCommand) && !(code.startsWith(this._widgetQueryCommand))) {
                        this.performInspection();
                    }
                    break;
                default:
                    break;
            }
        };
        this._id = options.id;
        this._connector = options.connector;
        this._rendermime = options.rendermime;
        this._queryCommand = options.queryCommand;
        this._matrixQueryCommand = options.matrixQueryCommand;
        this._widgetQueryCommand = options.widgetQueryCommand;
        this._deleteCommand = options.deleteCommand;
        this._initScript = options.initScript;
        this._ready = this._connector.ready.then(() => {
            this._initOnKernel().then((msg) => {
                this._connector.iopubMessage.connect(this._queryCall);
                return;
            });
        });
        this._connector.kernelRestarted.connect((sender, kernelReady) => {
            const title = {
                contextName: "<b>Restarting kernel...</b> "
            };
            this._inspected.emit({ title: title, payload: [] });
            this._ready = kernelReady.then(() => {
                this._initOnKernel().then((msg) => {
                    this._connector.iopubMessage.connect(this._queryCall);
                    this.performInspection();
                });
            });
        });
    }
    get id() {
        return this._id;
    }
    get rendermime() {
        return this._rendermime;
    }
    /**
     * A signal emitted when the handler is disposed.
     */
    get disposed() {
        return this._disposed;
    }
    get isDisposed() {
        return this._isDisposed;
    }
    get ready() {
        return this._ready;
    }
    /**
     * A signal emitted when an inspector value is generated.
     */
    get inspected() {
        return this._inspected;
    }
    /**
     * Performs an inspection by sending an execute request with the query command to the kernel.
     */
    performInspection() {
        let content = {
            code: this._queryCommand,
            stop_on_error: false,
            store_history: false
        };
        this._connector.fetch(content, this._handleQueryResponse);
    }
    /**
     * Performs an inspection of a Jupyter Widget
     */
    performWidgetInspection(varName) {
        const request = {
            code: this._widgetQueryCommand + "(" + varName + ")",
            stop_on_error: false,
            store_history: false
        };
        return this._connector.execute(request);
    }
    /**
     * Performs an inspection of the specified matrix.
     */
    performMatrixInspection(varName, maxRows = 100000) {
        let request = {
            code: this._matrixQueryCommand + "(" + varName + ", " + maxRows + ")",
            stop_on_error: false,
            store_history: false
        };
        let con = this._connector;
        return new Promise(function (resolve, reject) {
            con.fetch(request, (response) => {
                let msgType = response.header.msg_type;
                switch (msgType) {
                    case "execute_result":
                        let payload = response.content;
                        let content = payload.data["text/plain"];
                        let content_clean = content.replace(/^'|'$/g, "");
                        content_clean = content_clean.replace(/\\"/g, '"');
                        content_clean = content_clean.replace(/\\'/g, "\\\\'");
                        let modelOptions = JSON.parse(content_clean);
                        let jsonModel = new JSONModel(modelOptions);
                        resolve(jsonModel);
                        break;
                    case "error":
                        console.log(response);
                        reject("Kernel error on 'matrixQuery' call!");
                        break;
                    default:
                        break;
                }
            });
        });
    }
    /**
     * Send a kernel request to delete a variable from the global environment
     */
    performDelete(varName) {
        let content = {
            code: this._deleteCommand + "('" + varName + "')",
            stop_on_error: false,
            store_history: false,
        };
        this._connector.fetch(content, this._handleQueryResponse);
    }
    /*
     * Disposes the kernel connector.
     */
    dispose() {
        if (this.isDisposed) {
            return;
        }
        this._isDisposed = true;
        this._disposed.emit(void 0);
        Signal.clearData(this);
    }
    /**
     * Initializes the kernel by running the set up script located at _initScriptPath.
     */
    _initOnKernel() {
        let content = {
            code: this._initScript,
            stop_on_error: false,
            silent: true,
        };
        return this._connector.fetch(content, (() => { }));
    }
}
export class DummyHandler {
    constructor(connector) {
        this._isDisposed = false;
        this._disposed = new Signal(this);
        this._inspected = new Signal(this);
        this._rendermime = null;
        this._connector = connector;
    }
    get disposed() {
        return this._disposed;
    }
    get isDisposed() {
        return this._isDisposed;
    }
    get inspected() {
        return this._inspected;
    }
    get rendermime() {
        return this._rendermime;
    }
    dispose() {
        if (this.isDisposed) {
            return;
        }
        this._isDisposed = true;
        this._disposed.emit(void 0);
        Signal.clearData(this);
    }
    performInspection() {
        let title;
        title = {
            contextName: ". <b>Language currently not supported.</b> ",
            kernelName: this._connector.kernelName || ""
        };
        this._inspected.emit({ title: title, payload: [] });
    }
    performMatrixInspection(varName, maxRows) {
        return new Promise(function (resolve, reject) { reject("Cannot inspect matrices w/ the DummyHandler!"); });
    }
    performWidgetInspection(varName) {
        const request = {
            code: "",
            stop_on_error: false,
            store_history: false
        };
        return this._connector.execute(request);
    }
    performDelete(varName) { }
}
