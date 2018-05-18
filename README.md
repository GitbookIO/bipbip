# `@gitbook/benchmark`

Easy to setup and use, benchmark tool for Node.js.

# Installation

```
$ npm install -g @gitbook/benchmark
```

# Usage

Create a file `__benchmarks__/hello.js`:

```js
suite('Hello world', () => {
    scenario('hello()', () => {
        doSomething();
    });

    scenario('world()', () => {
        doSomething();
    })
});
```

then run:

```
$ benchmark
```

Results can be saved to a JSON file, then compare later:

```
$ benchmark --save ./results.json
$ benchmark --compare ./results.json
```

# Usage in a CI
