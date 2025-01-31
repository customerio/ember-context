import Component from '@glimmer/component';
import { h as hasContext, g as getContextValue } from '../utils-b476cb2e.js';
import { precompileTemplate } from '@ember/template-compilation';
import { setComponentTemplate } from '@ember/component';

var TEMPLATE = precompileTemplate("{{yield this.contextValue}}");

class ContextConsumer extends Component {
  get contextValue() {
    if (hasContext(this, this.args.key)) {
      return getContextValue(this, this.args.key);
    }
    return this.args.defaultValue;
  }
}
setComponentTemplate(TEMPLATE, ContextConsumer);

export { ContextConsumer as default };
//# sourceMappingURL=context-consumer.js.map
