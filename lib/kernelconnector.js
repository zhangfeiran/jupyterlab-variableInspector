import { Signal } from "@lumino/signaling";
/**
 * Connector class that handles execute request to a kernel
 */
export class KernelConnector {
    constructor(options) {
        this._kernelRestarted = new Signal(this);
        this._session = options.session;
        this._session.statusChanged.connect((sender, new_status) => {
            switch (new_status) {
                case "restarting":
                case "autorestarting":
                    this._kernelRestarted.emit(this._session.ready);
                default:
                    break;
            }
        });
    }
    get kernelRestarted() {
        return this._kernelRestarted;
    }
    get kernelLanguage() {
        return this._session.session.kernel.info.then(infoReply => {
            return infoReply.language_info.name;
        });
    }
    get kernelName() {
        return this._session.kernelDisplayName;
    }
    /**
     *  A Promise that is fulfilled when the session associated w/ the connector is ready.
     */
    get ready() {
        return this._session.ready;
    }
    /**
     *  A signal emitted for iopub messages of the kernel associated with the kernel.
     */
    get iopubMessage() {
        return this._session.iopubMessage;
    }
    /**
     * Executes the given request on the kernel associated with the connector.
     * @param content: IExecuteRequestMsg to forward to the kernel.
     * @param ioCallback: Callable to forward IOPub messages of the kernel to.
     * @returns Promise<KernelMessage.IExecuteReplyMsg>
     */
    fetch(content, ioCallback) {
        const kernel = this._session.session.kernel;
        if (!kernel) {
            return Promise.reject(new Error("Require kernel to perform variable inspection!"));
        }
        let future = kernel.requestExecute(content);
        future.onIOPub = ((msg) => {
            ioCallback(msg);
        });
        return future.done;
    }
    execute(content) {
        return this._session.session.kernel.requestExecute(content);
    }
}
