import { macroCondition, dependencySatisfies, importSync } from '@embroider/macros';

let getOwner;
if (macroCondition(dependencySatisfies('ember-source', '>=4.10.0'))) {
  getOwner = importSync('@ember/owner').getOwner;
} else {
  getOwner = importSync('@ember/application').getOwner;
}

// TODO: See if we can type the owner
function getProvider(owner, contextKey) {
  const renderer = getOwner(owner)?.lookup('renderer:-dom');
  if (renderer == null) {
    return null;
  }
  const provideConsumeContextContainer = renderer._runtime?.env?.provideConsumeContextContainer;
  if (provideConsumeContextContainer == null) {
    return null;
  }
  const contextsObject = provideConsumeContextContainer.contextsFor(owner);
  return contextsObject?.[contextKey];
}
function hasContext(owner, contextKey) {
  const provider = getProvider(owner, contextKey);
  return provider != null;
}
function getContextValue(owner, contextKey) {
  if (!hasContext(owner, contextKey)) {
    return undefined;
  }
  const providerObj = getProvider(owner, contextKey);
  return providerObj.instance[providerObj.key];
}

export { getContextValue as g, hasContext as h };
//# sourceMappingURL=utils-b476cb2e.js.map
