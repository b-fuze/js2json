# js2json
Will convert your CSS or your Javascript literal to JSON while attempting to preserve the majority of the original string, with a minimalistic parser (no regex)

## Usage
In JS
```js
const json = js2json(jsObjectLiteralString, stringifyValues, propertyDelimeter, transformDelimeter);
```

CLI Usage
```shell
json2json.js [-c|--css] [-s|--stringify-values]
```

Example
```shell
echo '{error: "Invalid timestamp"}' | ./js2json.js
# output: {"error": "Invalid timestamp"}
```

Example:
```js
  {
    str: true,
    more: 10000,
    "lol \" what": 10,
    go: false,
    "g-<": {
        prop1: null,
        nothing: 1
    },
    noMore: "props and stuff \' \\",
    stuff: -1100,
    propsFam: {
      "depth": null,
      reckless: "behaviour"
    }
  }
```
Becomes
```js
  {
    "str": true,
    "more": 10000,
    "lol \" what": 10,
    "go": false,
    "g-<": {
        "prop1": null,
        "nothing": 1
    },
    "noMore": "props and stuff \' \\",
    "stuff": -1100,
    "propsFam": {
      "depth": null,
      "reckless": "behaviour"
    }
  }
```
It will also be wary of (double) quoted properties; it will leave them as-is because they're already valid JSON properies.

## Why not eval(...)?
Because using `eval(...)` can potentially produce undefined behaviour in your program, not to mention security issues, you should avoid defaulting to `eval` and instead produce valid JSON to go through `JSON.parse(...)`

## Known Issues
 - Assumes all quoted strings uses double quotes
 - Assumes the provided literal is syntactically correct

## License
MIT
