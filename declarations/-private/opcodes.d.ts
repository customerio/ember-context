import type { ComponentInstance } from '@glimmer/interfaces';
import type { UpdatingVM } from '@glimmer/runtime';
export declare class ProvideConsumeContextUpdateOpcode {
    private instance;
    constructor(instance: ComponentInstance);
    evaluate(vm: UpdatingVM): void;
}
export declare class ProvideConsumeContextDidRenderOpcode {
    private instance;
    constructor(instance: ComponentInstance);
    evaluate(vm: UpdatingVM): void;
}
//# sourceMappingURL=opcodes.d.ts.map