import { VariableInspectorPanel, IVariableInspector } from "./variableinspector";
import { Token } from '@lumino/coreutils';
import { VariableInspectionHandler } from "./handler";
export declare const IVariableInspectorManager: Token<IVariableInspectorManager>;
export interface IVariableInspectorManager {
    source: IVariableInspector.IInspectable | null;
    hasHandler(id: string): boolean;
    getHandler(id: string): VariableInspectionHandler;
    addHandler(handler: VariableInspectionHandler): void;
}
/**
 * A class that manages variable inspector widget instances and offers persistent
 * `IVariableInspector` instance that other plugins can communicate with.
 */
export declare class VariableInspectorManager implements IVariableInspectorManager {
    private _source;
    private _panel;
    private _handlers;
    hasHandler(id: string): boolean;
    getHandler(id: string): VariableInspectionHandler;
    addHandler(handler: VariableInspectionHandler): void;
    /**
     * The current inspector panel.
     */
    get panel(): VariableInspectorPanel;
    set panel(panel: VariableInspectorPanel);
    /**
     * The source of events the inspector panel listens for.
     */
    get source(): IVariableInspector.IInspectable;
    set source(source: IVariableInspector.IInspectable);
    private _onSourceDisposed;
}
