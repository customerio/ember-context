import type { ComponentInstance } from '@glimmer/interfaces';
import type ContextRegistry from '../context-registry';
export declare const EMBER_PROVIDE_CONSUME_CONTEXT_KEY: unique symbol;
export declare function setContextMetadataOnContextProviderInstance(instance: any, contextDefinitions: [
    contextKey: keyof ContextRegistry,
    propertyKey: string
][]): void;
interface Contexts {
    [contextKey: keyof ContextRegistry]: ContextEntry;
}
interface ContextEntry {
    instance: any;
    key: string;
}
export declare class ProvideConsumeContextContainer {
    #private;
    private stack;
    get current(): unknown;
    parentContexts: WeakMap<any, Contexts>;
    nextContexts: WeakMap<any, Contexts>;
    begin(): void;
    commit(): void;
    private reset;
    registerMockProvider: <T extends string | number, U extends ContextRegistry[T]>(name: T, value: U) => void;
    enter(instance: ComponentInstance): void;
    exit(instance: ComponentInstance): void;
    private registerProvider;
    private registerComponent;
    currentContexts(): {
        [x: string]: ContextEntry;
        [x: number]: ContextEntry;
    };
    contextsFor(component: any): Contexts | null | undefined;
    createComponent(): void;
}
export {};
//# sourceMappingURL=provide-consume-context-container.d.ts.map