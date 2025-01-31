# ember-provide-consume-context

This addon provides a way to share data through to nested components without
having to pass arguments at each level (i.e. no prop drilling).

## Compatibility

- Ember.js v4.8 or above
- Embroider or ember-auto-import v2

## Installation

```
ember install ember-provide-consume-context
```

## Usage
### Context providers
Data can be provided to all of a component's descendants in one of two ways:
1. The `provide` decorator
2. The `ContextProvider` component

#### `@provide`
This library exports a decorator, which can be used on any getter or property to
expose it as context to all descendants of the component. The decorator requires
a string argument that is the name of the context, which will be used by
descendants to look up the value.

```ts
import Component from '@glimmer/component';
import { provide } from 'ember-provide-consume-context';

export default class MyComponent extends Component {
  @provide('my-context-name')
  get someState() {
    return 'some value';
  }
}
```

It is possible to expose tracked properties in context, by adding a
`@provide`-decorated getter, like so:

```ts
import Component from '@glimmer/component';
import { provide } from 'ember-provide-consume-context';

export default class MyComponent extends Component {
  @tracked myTrackedValue = 'some value';

  @provide('my-context-name')
  get someState() {
    return this.myTrackedValue;
    // or expressions like return this.args.someArgument;
  }
}
```

Any descendants retrieving this context will automatically recompute when the
tracked property changes.

Note: For the purposes of the decorator, it doesn't matter what the getter is
named. The value of the getter will be exposed under the context name.

#### `ContextProvider`
Alternatively, this addon also provides a `ContextProvider` component:

```hbs
<ContextProvider @key="my-context-name" @value={{this.someValue}}>
  {{! descendant components can now look up "my-context-name" }}
</ContextProvider>
```

### Context consumers
There are also two ways to retrieve a context value:
1. Using the `consume` decorator
2. Using the `ContextConsumer` component

#### `@consume`
The `consume` decorator allows us to retrieve a context value in a way that's
similar to working with an Ember service:

```ts
import Component from '@glimmer/component';
import { consume } from 'ember-provide-consume-context';

export default class MyChildComponent extends Component {
  @consume('my-context-name') myContextValue!: string;
}
```

```hbs
  <p>The context value is: {{this.myContextValue}}</p>
```

#### `ContextConsumer`
Alternatively, a context value can be retrieved with the `ContextConsumer`
component. It accepts a `@key` string argument, which is the name of the
context, and it yields the value of the context:
```hbs
<ContextConsumer @key="my-context-name" as |value|>
  {{value}}
</ContextConsumer>
```

__Important note:__ Currently, the `@provide` and `@consume` decorators only
work in components. Providing or consuming context state from Routes,
Controllers, Helpers or Services does not work.

In Route templates, the `ContextProvider` and `ContextConsumer` components can
be used for working with contexts.


### TypeScript
This addon ships with TypeScript and [Glint](https://typed-ember.gitbook.io/glint/) support.

To take advantage of Glint types (for the `ContextProvider` and
`ContextConsumer` components), you'll need to import the template registry
interface, as described in the [Glint docs](https://typed-ember.gitbook.io/glint/environments/ember/using-addons):

```ts
// types/global.d.ts
import '@glint/environment-ember-loose';

import type EmberContextTemplateRegistry from 'ember-provide-consume-context/template-registry';

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry extends EmberContextTemplateRegistry, /* other addon registries */ {
    // local entries
  }
}
```


Additionally, this addon exposes a type registry to associate string context
keys with the type of value.

First, you'll need to add

```ts
import 'ember-provide-consume-context/context-registry';
```

somewhere in your source files or type declaration files. This will force
TypeScript to merge type declarations for the registry.

Next, you'll need to declare the value type for your context keys, like this:

```ts
declare module 'ember-provide-consume-context/context-registry' {
  export default interface ContextRegistry {
    'my-context-name': string;
    'AuthContext': AuthInterface;
    // ...
  }
}
```

You can keep a global `types/context.d.ts` file and declare all your contexts
there, or you can declare the context types in the same files where you provide
them, like this:

```ts
import Component from '@glimmer/component';
import { provide } from 'ember-provide-consume-context';

export default class MyComponent extends Component {
  @provide('my-context-name')
  get someState() {
    return 'some value';
  }
}

declare module 'ember-provide-consume-context/context-registry' {
  export default interface ContextRegistry {
    'my-context-name': string;
  }
}
```

With `ContextRegistry` types defined and Glint enabled, the `ContextProvider`
and `ContextConsumer` components will correctly infer the value types based on
the string context key arguments.

When consuming a context with the `@consume` decorator, the type can be
retrieved using the registry like this:

```ts
import Component from '@glimmer/component';
import { consume } from 'ember-provide-consume-context';
import type ContextRegistry from 'ember-provide-consume-context/context-registry';

export default class MyChildComponent extends Component {
  @consume('my-context-name') myContextValue!: ContextRegistry['my-context-name'];
}
```

`myContextValue` will then correctly infer the type of value - provided you have
defined the type elsewhere, of course. The explicit type assignment above is
necessary, because returning a type through decorators automatically isn't
supported in TypeScript.

At the moment, context names must be strings. We have tried symbol keys, but
Ember Inspector started throwing errors when parsing component trees where
symbols were used as arguments, so we dropped that idea (for now, at least).

Finally, to avoid typos when referencing context keys, and generally making it
easier to maintain context definitions, we recommend declaring and exporting
your context keys as constants:

```ts
import Component from '@glimmer/component';
import { provide } from 'ember-provide-consume-context';

export const MyContext = 'my-context-name' as const;

export default class MyComponent extends Component {
  @provide(MyContext)
  get someState() {
    return 'some value';
  }
}

declare module 'ember-provide-consume-context/context-registry' {
  export default interface ContextRegistry {
    [MyContext]: string;
  }
}
```

```ts
import Component from '@glimmer/component';
import { consume } from 'ember-provide-consume-context';
import { MyContext } from 'my-app/components/my-component';
import type ContextRegistry from 'ember-provide-consume-context/context-registry';

export default class MyChildComponent extends Component {
  @consume(MyContext) myContextValue!: ContextRegistry[typeof MyContext];
}
```

### Testing
The addon includes two test helpers for setting up context providers in integration tests:
- `provide`
- `setupRenderWrapper`

#### `provide`
The `provide` helper can be used to set up a global context provider for a test, by calling
it with a context key and its value, for example:

```ts
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { provide } from 'ember-provide-consume-context/test-support';

module('component tests', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function (this) {
    provide('my-test-context', {
      count: 1,
    });
  });

  test('can read context', async function (assert) {
    await render(hbs`
      <ContextConsumer @key="my-test-context" as |data|>
        <div id="content">{{data.count}}</div>
      </ContextConsumer>
    `);

    assert.dom('#content').hasText('1');
  });
});
```

#### `setupRenderWrapper`
`setupRenderWrapper` can be used to define a template to wrap contents rendered via `render` in a test.

This is useful, for example, when it's necessary to wrap content in a context provider exposed by
and addon, or an internal context provider from the application. For example:

```ts
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderWrapper } from 'ember-provide-consume-context/test-support';

module('component tests', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function (this) {
    setupRenderWrapper(hbs`
      <ThemeProvider @mode="dark">
        {{outlet}}
      </ThemeProvider>
    `);
  });

  test('can read context', async function (assert) {
    await render(hbs`
      <DesignSystemButton>Button</DesignSystemButton>
    `);

    // renders in dark mode
  });
});
```

> [!IMPORTANT]  
> The render wrapper must use `{{outlet}}` rather than `{{yield}}` to render the wrapped content.
>
> Internally, `setupRenderWrapper` overrrides the outlet template defined by `@ember/test-helpers`: https://github.com/emberjs/ember-test-helpers/blob/9cec68dc6aa9c0a7a449eb89797eb81299fa727f/addon/addon-test-support/%40ember/test-helpers/setup-rendering-context.ts#L68-L69


## Inspiration
The idea was to create an API similar to the Context API in React
- [`React Context API`](https://react.dev/reference/react/createContext): The
  original inspiration for this project is, of course, the React Context
- [`Svelte Context API`](https://svelte.dev/docs/svelte#setcontext): Svelte
  exposes contexts via simple `setContext` and `getContext` functions
- [`Vue provide/inject`](https://vuejs.org/guide/components/provide-inject.html#provide):
  Vue allows working with context via `provide` and `inject` functions
- [`ember-context`](https://github.com/alexlafroscia/ember-context): Another
  Ember addon that also implements a similar Context API. However, that addon's
  implementation relies has providers racing on a provider key, while our addon
  uses the Ember component tree

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.


## License

This project is licensed under the [MIT License](LICENSE.md).
