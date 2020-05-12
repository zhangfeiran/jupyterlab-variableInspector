import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { Kernel, KernelMessage } from '@jupyterlab/services';
import { ISignal } from '@lumino/signaling';
import { Token } from '@lumino/coreutils';
import { Widget } from '@lumino/widgets';
import { DataModel } from "@lumino/datagrid";
import '../style/index.css';
/**
 * The inspector panel token.
 */
export declare const IVariableInspector: Token<IVariableInspector>;
/**
 * An interface for an inspector.
 */
export interface IVariableInspector {
    source: IVariableInspector.IInspectable | null;
}
/**
 * A namespace for inspector interfaces.
 */
export declare namespace IVariableInspector {
    interface IInspectable {
        disposed: ISignal<any, void>;
        inspected: ISignal<any, IVariableInspectorUpdate>;
        rendermime: IRenderMimeRegistry;
        performInspection(): void;
        performMatrixInspection(varName: string, maxRows?: number): Promise<DataModel>;
        performWidgetInspection(varName: string): Kernel.IShellFuture<KernelMessage.IExecuteRequestMsg, KernelMessage.IExecuteReplyMsg>;
        performDelete(varName: string): void;
    }
    interface IVariableInspectorUpdate {
        title: IVariableTitle;
        payload: Array<IVariable>;
    }
    interface IVariable {
        varName: string;
        varSize: string;
        varShape: string;
        varContent: string;
        varType: string;
        isMatrix: boolean;
        isWidget: boolean;
    }
    interface IVariableTitle {
        kernelName?: string;
        contextName?: string;
    }
}
/**
 * A panel that renders the variables
 */
export declare class VariableInspectorPanel extends Widget implements IVariableInspector {
    private _source;
    private _table;
    private _title;
    constructor();
    get source(): IVariableInspector.IInspectable | null;
    set source(source: IVariableInspector.IInspectable | null);
    /**
     * Dispose resources
     */
    dispose(): void;
    protected onInspectorUpdate(sender: any, allArgs: IVariableInspector.IVariableInspectorUpdate): void;
    /**
     * Handle source disposed signals.
     */
    protected onSourceDisposed(sender: any, args: void): void;
    private _showMatrix;
}
