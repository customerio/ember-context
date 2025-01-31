import type ContextRegistry from '../context-registry';
export declare function provide(contextKey: keyof ContextRegistry): (target: any, key: string) => void;
export declare function consume<K extends keyof ContextRegistry>(contextKey: K): PropertyDecorator;
//# sourceMappingURL=decorators.d.ts.map