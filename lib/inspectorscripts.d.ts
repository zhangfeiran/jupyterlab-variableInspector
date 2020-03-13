export declare namespace Languages {
    type LanguageModel = {
        initScript: string;
        queryCommand: string;
        matrixQueryCommand: string;
        widgetQueryCommand: string;
        deleteCommand: string;
    };
}
export declare abstract class Languages {
    /**
     * Init and query script for supported languages.
     */
    static py_script: string;
    static r_script: string;
    static scripts: {
        [index: string]: Languages.LanguageModel;
    };
    static getScript(lang: string): Promise<Languages.LanguageModel>;
}
