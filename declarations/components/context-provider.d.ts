import Component from '@glimmer/component';
import type ContextRegistry from '../context-registry';
interface ContextProviderSignature<K extends keyof ContextRegistry> {
    Args: {
        key: K;
        value: ContextRegistry[K];
    };
    Blocks: {
        default: [];
    };
}
export default class ContextProvider<K extends keyof ContextRegistry> extends Component<ContextProviderSignature<K>> {
    constructor(owner: unknown, args: ContextProviderSignature<K>['Args']);
    get value(): ContextRegistry[K];
}
export {};
//# sourceMappingURL=context-provider.d.ts.map