import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { IDisposable } from '@lumino/disposable';
import { IVariableInspector } from './variableinspector';
import { KernelConnector } from "./kernelconnector";
import { KernelMessage, Kernel } from "@jupyterlab/services";
import { ISignal } from "@lumino/signaling";
import { DataModel } from "@lumino/datagrid";
/**
 * An object that handles code inspection.
 */
export declare class VariableInspectionHandler implements IDisposable, IVariableInspector.IInspectable {
    private _connector;
    private _rendermime;
    private _initScript;
    private _queryCommand;
    private _matrixQueryCommand;
    private _widgetQueryCommand;
    private _deleteCommand;
    private _disposed;
    private _inspected;
    private _isDisposed;
    private _ready;
    private _id;
    constructor(options: VariableInspectionHandler.IOptions);
    get id(): string;
    get rendermime(): IRenderMimeRegistry;
    /**
     * A signal emitted when the handler is disposed.
     */
    get disposed(): ISignal<VariableInspectionHandler, void>;
    get isDisposed(): boolean;
    get ready(): Promise<void>;
    /**
     * A signal emitted when an inspector value is generated.
     */
    get inspected(): ISignal<VariableInspectionHandler, IVariableInspector.IVariableInspectorUpdate>;
    /**
     * Performs an inspection by sending an execute request with the query command to the kernel.
     */
    performInspection(): void;
    /**
     * Performs an inspection of a Jupyter Widget
     */
    performWidgetInspection(varName: string): Kernel.IShellFuture<KernelMessage.IExecuteRequestMsg, KernelMessage.IExecuteReplyMsg>;
    /**
     * Performs an inspection of the specified matrix.
     */
    performMatrixInspection(varName: string, maxRows?: number): Promise<DataModel>;
    /**
     * Send a kernel request to delete a variable from the global environment
     */
    performDelete(varName: string): void;
    dispose(): void;
    /**
     * Initializes the kernel by running the set up script located at _initScriptPath.
     */
    private _initOnKernel;
    private _handleQueryResponse;
    private _queryCall;
}
/**
 * A name space for inspection handler statics.
 */
export declare namespace VariableInspectionHandler {
    /**
     * The instantiation options for an inspection handler.
     */
    interface IOptions {
        connector: KernelConnector;
        rendermime?: IRenderMimeRegistry;
        queryCommand: string;
        matrixQueryCommand: string;
        widgetQueryCommand: string;
        deleteCommand: string;
        initScript: string;
        id: string;
    }
}
export declare class DummyHandler implements IDisposable, IVariableInspector.IInspectable {
    private _isDisposed;
    private _disposed;
    private _inspected;
    private _connector;
    private _rendermime;
    constructor(connector: KernelConnector);
    get disposed(): ISignal<DummyHandler, void>;
    get isDisposed(): boolean;
    get inspected(): ISignal<DummyHandler, IVariableInspector.IVariableInspectorUpdate>;
    get rendermime(): IRenderMimeRegistry;
    dispose(): void;
    performInspection(): void;
    performMatrixInspection(varName: string, maxRows: number): Promise<DataModel>;
    performWidgetInspection(varName: string): Kernel.IShellFuture<KernelMessage.IExecuteRequestMsg, KernelMessage.IExecuteReplyMsg>;
    performDelete(varName: string): void;
}
