import { getContext } from '@ember/test-helpers';

function setupRenderWrapper(templateFactory) {
  const context = getContext();
  if (context == null) {
    throw new Error('Could not find test context');
  }
  if (context.owner == null) {
    throw new Error('Could not find owner on test context');
  }
  const {
    owner
  } = context;

  // Registers a custom outlet to use in the test, similar to how test-helpers does it:
  // https://github.com/emberjs/ember-test-helpers/blob/9cec68dc6aa9c0a7a449eb89797eb81299fa727f/addon/addon-test-support/%40ember/test-helpers/setup-rendering-context.ts#L68
  // Casting "as any" because "unregister" isn't defined on the Owner type, but it does exist.
  owner.unregister('template:-outlet');
  owner.register('template:-outlet', templateFactory);
}
function provide(name, value) {
  const context = getContext();
  if (context?.owner != null) {
    const {
      owner
    } = context;

    // https://github.com/emberjs/ember.js/blob/57073a0e9751d036d4bcfc11d5367e3f6ae751d2/packages/%40ember/-internals/glimmer/lib/renderer.ts#L284
    // We cast to "any", because Renderer is a private API and isn't easily accessible.
    // Even if we imported the type, "_runtime" is marked as private,
    // so we wouldn't be able to access the current runtime or its type.
    // If Context was implemented in Ember proper, it would have access to those private
    // APIs, and this wouldn't look quite as illegal anymore.
    const renderer = owner.lookup('renderer:-dom');
    if (renderer == null) {
      throw new Error('Could not find "renderer:-dom" on owner');
    }
    const container = renderer._runtime?.env?.provideConsumeContextContainer;
    if (container == null) {
      throw new Error('Could not find "provideConsumeContextContainer" instance in runtime environment');
    }
    container.registerMockProvider(name, value);
  }
}

export { provide, setupRenderWrapper };
//# sourceMappingURL=index.js.map
