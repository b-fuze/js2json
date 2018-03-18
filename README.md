# js2json
Will convert your Javascript literal to JSON while attempting to preserve the majority of the original string, with a minimalistic parser (no regex)

## Usage
```js
const json = js2json(jsObjectLiteralString);
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

## Known Issues
 - Assumes all quoted strings uses double quotes
 - Assumes the provided literal is syntactically correct

## License
MIT
