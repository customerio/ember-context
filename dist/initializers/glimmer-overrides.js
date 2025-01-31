import { P as ProvideConsumeContextContainer } from '../provide-consume-context-container-775afd15.js';
import * as glimmerRuntime from '@glimmer/runtime';

class ProvideConsumeContextUpdateOpcode {
  // "instance" is a VM component instance
  constructor(instance) {
    this.instance = instance;
  }

  // vm is an instance of the updating VM:
  // https://github.com/glimmerjs/glimmer-vm/blob/68d371bdccb41bc239b8f70d832e956ce6c349d8/packages/%40glimmer/runtime/lib/vm/update.ts#L33
  evaluate(vm) {
    vm.env.provideConsumeContextContainer?.enter(this.instance);
  }
}
class ProvideConsumeContextDidRenderOpcode {
  // "instance" is a VM component instance
  constructor(instance) {
    this.instance = instance;
  }

  // vm is an instance of the updating VM:
  // https://github.com/glimmerjs/glimmer-vm/blob/68d371bdccb41bc239b8f70d832e956ce6c349d8/packages/%40glimmer/runtime/lib/vm/update.ts#L33
  evaluate(vm) {
    vm.env.provideConsumeContextContainer?.exit(this.instance);
  }
}

// We can't use enums from @glimmer/interfaces due to the issue below:
// https://github.com/glimmerjs/glimmer-vm/issues/1294
// We can use type imports, but an enum would need to be transformed into JS,
// which fails.
// We copy the opcodes from the source into here, and only the ones that are
// relevant to us.
// This is safe, because the opcodes should be stable.
// https://github.com/glimmerjs/glimmer-vm/blob/68d371bdccb41bc239b8f70d832e956ce6c349d8/packages/%40glimmer/vm/lib/opcodes.ts#L196
let Op = /*#__PURE__*/function (Op) {
  Op[Op["CreateComponent"] = 87] = "CreateComponent";
  Op[Op["GetComponentSelf"] = 90] = "GetComponentSelf";
  Op[Op["DidRenderLayout"] = 100] = "DidRenderLayout";
  return Op;
}({});

function overrideVM(runtime) {
  const LowLevelVM = runtime.LowLevelVM;
  const originalNext = LowLevelVM.prototype.next;

  // We can't reach into the opcode definitions themselves, but we can hook into
  // when they're evaluated ("next"), and execute additional code when the
  // opcodes we're interested are called.
  // https://github.com/glimmerjs/glimmer-vm/blob/68d371bdccb41bc239b8f70d832e956ce6c349d8/packages/%40glimmer/runtime/lib/vm/append.ts#L603C1-L603C1
  LowLevelVM.prototype.next = function () {
    // The actual evaluation happens in the "low level VM":
    // https://github.com/glimmerjs/glimmer-vm/blob/68d371bdccb41bc239b8f70d832e956ce6c349d8/packages/%40glimmer/runtime/lib/vm/low-level.ts#L112
    // but that isn't exposed to us.
    // Luckily, the VM we do have access to exposes the "pc" register, and the
    // "program" instance, which is all we need to get the current opcode.
    const opcode = this.program.opcode(this.pc);

    // Getting "type" may fail with "Expected value to be present", coming from
    // https://github.com/glimmerjs/glimmer-vm/blob/f03632077d98910de7ae3f7c22ebed98cb4f909a/packages/%40glimmer/program/lib/program.ts#L116
    try {
      const {
        type,
        op1
      } = opcode;
      if (type === Op.CreateComponent) {
        // Let the container know we're instantiating a new component
        this.env.provideConsumeContextContainer?.createComponent();
        // No need to register "updateWith", a component only instantiates
        // once, and we don't need to run any further updates
      }
      if (type === Op.GetComponentSelf) {
        // Get the component instance from the VM
        // (that's the VM's component instance, not the Glimmer Component one)
        // https://github.com/glimmerjs/glimmer-vm/blob/68d371bdccb41bc239b8f70d832e956ce6c349d8/packages/%40glimmer/runtime/lib/compiled/opcodes/component.ts#L579
        const instance = this.fetchValue(op1);

        // Add the component to the stack
        this.env.provideConsumeContextContainer?.enter(instance);
        // When there are updates/rerenders, make sure we add to the stack again
        this.updateWith(new ProvideConsumeContextUpdateOpcode(instance));
      }
      if (type === Op.DidRenderLayout) {
        // Get the component instance from the VM
        // (that's the VM's component instance, not the Glimmer Component one)
        // https://github.com/glimmerjs/glimmer-vm/blob/68d371bdccb41bc239b8f70d832e956ce6c349d8/packages/%40glimmer/runtime/lib/compiled/opcodes/component.ts#L832
        const instance = this.fetchValue(op1);

        // After the component has rendered, remove it from the stack
        this.env.provideConsumeContextContainer?.exit(instance);
        // On updates/rerenders, make sure to remove from the stack again
        this.updateWith(new ProvideConsumeContextDidRenderOpcode(instance));
      }
    } catch {
      // ignore
    }
    return originalNext.apply(this);
  };
}
function overrideEnvironment(runtime) {
  const EnvironmentImpl = runtime.EnvironmentImpl;
  const originalBegin = EnvironmentImpl.prototype.begin;
  EnvironmentImpl.prototype.begin = function () {
    if (this.provideConsumeContextContainer == null) {
      this.provideConsumeContextContainer = new ProvideConsumeContextContainer();
    }

    // When a render transaction is started, let our container know to reset
    // the stack
    this.provideConsumeContextContainer?.begin();
    return originalBegin.apply(this);
  };
  const originalCommit = EnvironmentImpl.prototype.commit;
  EnvironmentImpl.prototype.commit = function () {
    if (this.provideConsumeContextContainer == null) {
      this.provideConsumeContextContainer = new ProvideConsumeContextContainer();
    }

    // When a render transaction is finished, let our container lnow to reset
    // the stack
    this.provideConsumeContextContainer?.commit();
    return originalCommit.apply(this);
  };
}
function overrideGlimmerRuntime(runtime) {
  overrideVM(runtime);
  overrideEnvironment(runtime);
}

function initialize() {
  overrideGlimmerRuntime(glimmerRuntime);
}
var glimmerOverrides = {
  initialize
};

export { glimmerOverrides as default, initialize };
//# sourceMappingURL=glimmer-overrides.js.map
