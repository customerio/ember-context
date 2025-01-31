import type ContextRegistry from '../context-registry';
export declare function getProvider(owner: any, contextKey: keyof ContextRegistry): any;
export declare function hasContext(owner: any, contextKey: keyof ContextRegistry): boolean;
export declare function getContextValue<K extends keyof ContextRegistry>(owner: any, contextKey: K): ContextRegistry[K] | undefined;
//# sourceMappingURL=utils.d.ts.map