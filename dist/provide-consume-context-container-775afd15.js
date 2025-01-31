import '@glimmer/env';

function _toPrimitive(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == typeof i ? i : String(i);
}
function _defineProperty(obj, key, value) {
  key = _toPropertyKey(key);
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _classPrivateFieldGet(receiver, privateMap) {
  var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "get");
  return _classApplyDescriptorGet(receiver, descriptor);
}
function _classPrivateFieldSet(receiver, privateMap, value) {
  var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "set");
  _classApplyDescriptorSet(receiver, descriptor, value);
  return value;
}
function _classExtractFieldDescriptor(receiver, privateMap, action) {
  if (!privateMap.has(receiver)) {
    throw new TypeError("attempted to " + action + " private field on non-instance");
  }
  return privateMap.get(receiver);
}
function _classApplyDescriptorGet(receiver, descriptor) {
  if (descriptor.get) {
    return descriptor.get.call(receiver);
  }
  return descriptor.value;
}
function _classApplyDescriptorSet(receiver, descriptor, value) {
  if (descriptor.set) {
    descriptor.set.call(receiver, value);
  } else {
    if (!descriptor.writable) {
      throw new TypeError("attempted to set read only private field");
    }
    descriptor.value = value;
  }
}
function _checkPrivateRedeclaration(obj, privateCollection) {
  if (privateCollection.has(obj)) {
    throw new TypeError("Cannot initialize the same private elements twice on an object");
  }
}
function _classPrivateFieldInitSpec(obj, privateMap, value) {
  _checkPrivateRedeclaration(obj, privateMap);
  privateMap.set(obj, value);
}

class StackImpl {
  constructor(values = []) {
    this.current = null;
    this.stack = values;
  }
  get size() {
    return this.stack.length;
  }
  push(item) {
    this.current = item;
    this.stack.push(item);
  }
  pop() {
    let item = this.stack.pop();
    let len = this.stack.length;
    this.current = len === 0 ? null : this.stack[len - 1];
    return item === undefined ? null : item;
  }
  nth(from) {
    let len = this.stack.length;
    return len < from ? null : this.stack[len - from];
  }
  isEmpty() {
    return this.stack.length === 0;
  }
  toArray() {
    return this.stack;
  }
}

const EMBER_PROVIDE_CONSUME_CONTEXT_KEY = Symbol.for('EMBER_PROVIDE_CONSUME_CONTEXT_KEY');
function setContextMetadataOnContextProviderInstance(instance, contextDefinitions) {
  const currentContexts = Object.getOwnPropertyDescriptor(instance, EMBER_PROVIDE_CONSUME_CONTEXT_KEY);
  const contextsValue = {
    ...currentContexts?.value,
    ...Object.fromEntries(contextDefinitions)
  };
  Object.defineProperty(instance, EMBER_PROVIDE_CONSUME_CONTEXT_KEY, {
    value: contextsValue,
    writable: true,
    configurable: true
  });
}
var _globalContexts = /*#__PURE__*/new WeakMap();
var _isCreatingComponent = /*#__PURE__*/new WeakMap();
class ProvideConsumeContextContainer {
  constructor() {
    _defineProperty(this, "stack", new StackImpl());
    // The keys of the WeakMap are component instances (actual Glimmer components,
    // not the VM ones).
    // The values are objects that map a string ID (provider ID) to the provider
    // component instance.
    // "parentContexts" contain references to contexts coming from "above", and
    // are used to read values from (which allows a component to provide and consume the same key)
    _defineProperty(this, "parentContexts", new WeakMap());
    // "nextContexts" are context maps used to propagate context values down
    // into the component tree, which includes the merged providers from the
    // current component (if any)
    _defineProperty(this, "nextContexts", new WeakMap());
    // Global contexts are registered by test-support helpers to allow easily
    // providing context values in tests.
    _classPrivateFieldInitSpec(this, _globalContexts, {
      writable: true,
      value: null
    });
    _classPrivateFieldInitSpec(this, _isCreatingComponent, {
      writable: true,
      value: false
    });
    _defineProperty(this, "registerMockProvider", (name, value) => {
      const mockProviderContext = {
        instance: {
          get value() {
            return value;
          }
        },
        key: 'value'
      };
      if (_classPrivateFieldGet(this, _globalContexts)?.[name] != null) {
        console.warn(`A context provider with name "${name}" is already defined, and will be overwritten.`);
      }
      _classPrivateFieldSet(this, _globalContexts, {
        ..._classPrivateFieldGet(this, _globalContexts),
        [name]: mockProviderContext
      });
    });
  }
  get current() {
    return this.stack.current;
  }
  begin() {
    this.reset();
  }
  commit() {
    this.reset();
  }
  reset() {
    if (this.stack.size !== 0) {
      while (!this.stack.isEmpty()) {
        this.stack.pop();
      }
    }
  }
  enter(instance) {
    // When "enter" is called, a component instance has already been created.
    // Update the flag to reflect that.
    // See the "contextsFor" method below for how this flag is used.
    _classPrivateFieldSet(this, _isCreatingComponent, false);
    const actualComponentInstance = instance?.state?.component;
    if (actualComponentInstance != null) {
      const isProviderInstance = actualComponentInstance[EMBER_PROVIDE_CONSUME_CONTEXT_KEY];
      if (isProviderInstance) {
        this.registerProvider(actualComponentInstance);
      } else {
        this.registerComponent(actualComponentInstance);
      }
      this.stack.push(actualComponentInstance);
    }
  }
  exit(instance) {
    const actualComponentInstance = instance?.state?.component;
    if (actualComponentInstance != null) {
      this.stack.pop();
    }
  }
  registerProvider(provider) {
    const parentContexts = this.currentContexts();
    const mergedContexts = {
      ...parentContexts
    };
    const registeredContexts = provider[EMBER_PROVIDE_CONSUME_CONTEXT_KEY];

    // If the provider has registered contexts, store references
    // to them on the current contexts object
    if (registeredContexts != null) {
      Object.entries(registeredContexts).forEach(([contextKey, key]) => {
        if (key in provider) {
          mergedContexts[contextKey] = {
            instance: provider,
            key
          };
        }
      });
    }
    this.parentContexts.set(provider, parentContexts);
    this.nextContexts.set(provider, mergedContexts);
  }
  registerComponent(component) {
    const currentContexts = this.currentContexts();
    this.parentContexts.set(component, currentContexts);
    this.nextContexts.set(component, currentContexts);
  }
  currentContexts() {
    const {
      current
    } = this;
    const globalContexts = _classPrivateFieldGet(this, _globalContexts) ?? {};
    if (this.nextContexts.has(current) || Object.keys(globalContexts).length > 0) {
      const context = this.nextContexts.get(current);
      return {
        ...globalContexts,
        ...context
      };
    }
    return {};
  }
  contextsFor(component) {
    if (this.parentContexts.has(component)) {
      return this.parentContexts.get(component);
    }

    // If a context for this component is not yet registered, but
    // we're in the phase of initializing a component, return
    // the current contexts, so that the values can be read in constructors.
    if (_classPrivateFieldGet(this, _isCreatingComponent)) {
      return this.currentContexts();
    }
    return null;
  }
  createComponent() {
    // Indicates that a component instance is being created, see
    // "contextsFor" above for how we use this.
    _classPrivateFieldSet(this, _isCreatingComponent, true);
  }
}

export { EMBER_PROVIDE_CONSUME_CONTEXT_KEY as E, ProvideConsumeContextContainer as P, setContextMetadataOnContextProviderInstance as s };
//# sourceMappingURL=provide-consume-context-container-775afd15.js.map
