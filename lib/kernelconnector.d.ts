import { IClientSession } from "@jupyterlab/apputils";
import { KernelMessage, Kernel } from "@jupyterlab/services";
import { ISignal } from "@phosphor/signaling";
/**
 * Connector class that handles execute request to a kernel
 */
export declare class KernelConnector {
    private _session;
    private _kernelRestarted;
    constructor(options: KernelConnector.IOptions);
    get kernelRestarted(): ISignal<KernelConnector, Promise<void>>;
    get kernelType(): string;
    get kernelName(): string;
    /**
     *  A Promise that is fulfilled when the session associated w/ the connector is ready.
     */
    get ready(): Promise<void>;
    /**
     *  A signal emitted for iopub messages of the kernel associated with the kernel.
     */
    get iopubMessage(): ISignal<IClientSession, KernelMessage.IMessage>;
    /**
     * Executes the given request on the kernel associated with the connector.
     * @param content: IExecuteRequestMsg to forward to the kernel.
     * @param ioCallback: Callable to forward IOPub messages of the kernel to.
     * @returns Promise<KernelMessage.IExecuteReplyMsg>
     */
    fetch(content: KernelMessage.IExecuteRequestMsg['content'], ioCallback: (msg: KernelMessage.IIOPubMessage) => any): Promise<KernelMessage.IExecuteReplyMsg>;
    execute(content: KernelMessage.IExecuteRequestMsg['content']): Kernel.IShellFuture<KernelMessage.IExecuteRequestMsg, KernelMessage.IExecuteReplyMsg>;
}
export declare namespace KernelConnector {
    interface IOptions {
        session: IClientSession;
    }
}
