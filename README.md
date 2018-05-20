# `bipbip`

Easy to setup, benchmark tool for Node.js. This module is inspired by [jest](https://github.com/facebook/jest).

BipBip is intended to be run as a part of a performance regression test suite. It is intended to help answer questions like "have performance characteristics changed between releases" or "does this change have an impact on performance?"

# Installation

```
$ npm install -g bipbip
```

# Usage

Create a file `__benchmarks__/hello.js` ([example](./__benchmarks__/fibonaci.js)):

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
$ bipbip
```

Results can be saved to a JSON file, to be compared later on:

```
$ bipbip --save ./results.json
$ bipbip --compare ./results.json
```

# Benchmarks API

`bipbip` defines some global variables in the executed JS files:

- `suite(name: string, fn: () => void)`: define a suite of scenarios
- `scenario(name: string, run: () => void)`: define a scenario

# CLI options

```
$ bipbip <files...> [options]
```

The command line accepts globs as arguments: `benchmark *.js`, `benchmark module1/*.js module2/*.js`

| Option | Description |
| ------ | ----------- |
| `-s, --save [file]` | Save the results of benchmarks |
| `-c, --compare [file]` | Compare the results to previously saved results |
| `-d, --duration [ms]` | Maximum duration of each scenario (default is 5sec) |
| `-e, --executions [count]` | Maximum executions per scenario (default is 1M) |

# Usage in a CI

When using `bipbip` in a CI service (like Travis), the results can be preserved in the  [CI cache](https://docs.travis-ci.com/user/caching/#Fetching-and-storing-caches).

```yaml
jobs:
  include:
    - if: branch = master
      script:
        - bipbip --save .cache/benchmarks.json --compare .cache/benchmarks.json
    - if: branch != master
      script:
        - bipbip --compare .cache/benchmarks.json
```

# Usage with babel

When running benchmarks on JS files not compiled for the current node version. You can run the benchmark CLI using `babel-node`:

```
$ babel-node node_modules/.bin/bipbip
```
