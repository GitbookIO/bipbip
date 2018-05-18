# `@gitbook/benchmark`

Easy to setup, benchmark tool for Node.js. This module is inspired by jest.

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

# API

`benchmark` defines a few global variables in the executed JS files:

- `suite(name: string, fn: () => void)`: define a suite of scenarios
- `scenario(name: string, run: () => void)`: define a scenario

# CLI options

```
$ benchmark <files...> [options]
```

The command line accepts globs as arguments: `benchmark *.js`, `benchmark module1/*.js module2/*.js`

| Option | Description |
| ------ | ----------- |
| `-s, --save [file]` | Save the results of benchmarks |
| `-c, --compare [file]` | Compare the results to previously saved results |

# Usage in a CI

# Usage with babel

When running benchmarks on JS files not compiled for the current node version. You can run the benchmark CLI using `babel-node`.
