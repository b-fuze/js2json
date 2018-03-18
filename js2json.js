#! /usr/bin/env node

function js2json(str) {
  let newStr = "";
  let depthState = [];
  let inObject = false;
  let inValue = false;
  let quotedToken = false;
  let inNewQuotedProp = false;
  
  const propChar = /[a-zA-Z_]/;
  const whitespace = /\s/;
  
  for (let i=0; i<str.length; i++) {
    const char = str[i];
    const nextChar = str[i + 1];
    
    if (inObject) {
      if (char === "}") {
        ({inObject, inValue} = (depthState.pop() || {inObject: false, quotedToken: false}));
      } else if (!inValue) {
        if (quotedToken) {
          if (char === "\\") {
            newStr += char + (nextChar || "");
            i++;
            continue;
          } else if (char === "\"") {
            quotedToken = false;
          }
        } else if (char === "\"") {
          quotedToken = true;
        } else if (inNewQuotedProp) {
          if (char === "\\") {
            newStr += char + (nextChar || "");
            i++;
            continue;
          } else if (whitespace.test(nextChar) || nextChar === ":") {
            newStr += char + "\"";
            inNewQuotedProp = false;
            continue;
          }
        } else if (propChar.test(char)) {
          newStr += "\"";
          inNewQuotedProp = true;
        } else if (char === ":") {
          inValue = true;
        }
      } else {
        if (quotedToken) {
          if (char === "\\") {
            newStr += char + (nextChar || "");
            i++;
            continue;
          } else if (char === "\"") {
            quotedToken = false;
          }
        } else if (char === "{") {
          depthState.push({
            inObject,
            inValue,
          });
          
          inObject = true;
          inValue = false;
        } else if (char === "\"") {
          quotedToken = true;
        } else if (char === ",") {
          inValue = false;
        }
      }
    } else {
      if (char === "{") {
        inObject = true;
      }
    }
    
    newStr += char;
  }
  
  return newStr;
}

// Read from stdin and output to stdout
if (typeof process !== "undefined") {
  process.stdin.setEncoding('utf8');
  let data = "";
  
  process.stdin.on('readable', () => {
    const chunk = process.stdin.read();
    if (chunk !== null) {
      data += chunk;
    }
  });
  
  process.stdin.on('end', () => {
    process.stdout.write(js2json(data));
  });
}
