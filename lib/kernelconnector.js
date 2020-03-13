import { Signal } from "@phosphor/signaling";
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
                    //TODO : Check for kernel availability
                    this._kernelRestarted.emit(this._session.kernel.ready);
                default:
                    break;
            }
        });
    }
    get kernelRestarted() {
        return this._kernelRestarted;
    }
    get kernelType() {
        return this._session.kernel.info.language_info.name;
    }
    get kernelName() {
        return this._session.kernel.name;
    }
    /**
     *  A Promise that is fulfilled when the session associated w/ the connector is ready.
     */
    get ready() {
        return this._session.ready.then(() => {
            return this._session.kernel.ready;
        });
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
        const kernel = this._session.kernel;
        if (!kernel) {
            return Promise.reject(new Error("Require kernel to perform variable inspection!"));
        }
        return kernel.ready.then(() => {
            let future = kernel.requestExecute(content);
            future.onIOPub = ((msg) => {
                ioCallback(msg);
            });
            return future.done;
        });
    }
    execute(content) {
        return this._session.kernel.requestExecute(content);
    }
}
