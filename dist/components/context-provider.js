import Component from '@glimmer/component';
import { s as setContextMetadataOnContextProviderInstance } from '../provide-consume-context-container-775afd15.js';

class ContextProvider extends Component {
  constructor(owner, args) {
    super(owner, args);
    setContextMetadataOnContextProviderInstance(this, [[args.key, 'value']]);
  }
  get value() {
    return this.args.value;
  }
}

export { ContextProvider as default };
//# sourceMappingURL=context-provider.js.map
