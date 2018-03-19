#! /usr/bin/env node

function js2json(str, stringifyValues, propertyDelimeter = ",", transformDelimeter = propertyDelimeter) {
  let newStr = "";
  let depthState = [];
  let inObject = false;
  
  let inValue = false;
  let valueContent = "";
  let valueBegin = 0;
  let outputValueBegin = 0;
  let lastValueType = null;
  
  let lastCommaPos = 0;
  let trailingComma = false;
  let quotedToken = false;
  let inNewQuotedProp = false;
  
  const propChar = /[a-zA-Z_]/;
  const whitespace = /\s/;
  
  mainLoop:
  for (let i=0; i<str.length; i++) {
    const char = str[i];
    const nextChar = str[i + 1];
    
    if (inObject) {
      if (char === "}") {
        ({inObject, inValue} = (depthState.pop() || {inObject: false, quotedToken: false}));
        lastValueType = "object";
        
        if (!depthState.length) {
          inValue = false;
          inObject = false;
        }
        
        // Remove trailing comma
        if (trailingComma) {
          newStr = newStr.substr(0, lastCommaPos) + newStr.substr(lastCommaPos + 1);
          trailingComma = false;
        }
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
          trailingComma = false;
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
          trailingComma = false;
        } else if (char === ":") {
          inValue = true;
          valueBegin = i + 1;
          outputValueBegin = newStr.length + 1;
        }
      } else {
        // Record value contents to determine if it should be wrapped in quotes
        if (stringifyValues && !quotedToken && char !== propertyDelimeter) {
          valueContent += char;
        }
        
        if (quotedToken) {
          if (char === "\\") {
            newStr += char + (nextChar || "");
            i++;
            continue;
          } else if (char === "\"") {
            quotedToken = false;
            lastValueType = "string";
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
        } else if (char === propertyDelimeter) {
          // Wrap value in double quotes
          if (stringifyValues && lastValueType !== "object" && lastValueType !== "string") {
            const trimmedValue = valueContent.trim();
            
            switch (trimmedValue) {
              case "true":
              case "false":
              case "null":
                // Nothing to do here
                break;
              default:
                // Check if it's a valid number
                const number = parseFloat(trimmedValue);
                
                // console.log(trimmedValue);
                // Stringify this value, it's not valid JSON
                if (number + "" !== trimmedValue) {
                  i = valueBegin;
                  newStr = newStr.substr(0, outputValueBegin);
                  const valueEnd = valueBegin + valueContent.length + 1;
                  let recording = false;
                  let trimmedValueEnd = 0;
                  
                  stringifyLoop:
                  for (; i<valueEnd; i++) {
                    const char = str[i];
                    
                    if (!recording) {
                      if (!whitespace.test(char)) {
                        trimmedValueEnd = i + trimmedValue.length;
                        recording = true;
                        
                        newStr += "\"";
                      }
                    } else {
                      if (char === "\"") {
                        newStr += "\\";
                      } else if (i === trimmedValueEnd) {
                        newStr += "\"";
                        continue;
                      }
                    }
                    
                    newStr += char;
                  }
                  
                  // Go back before the delimeter
                  i--;
                }
            }
          }
          
          inValue = false;
          lastValueType = null;
          valueContent = "";
          
          lastCommaPos = newStr.length;
          trailingComma = true;
          
          newStr += transformDelimeter;
          continue;
        }
      }
    } else {
      if (char === "{") {
        inObject = true;
        lastValueType = null;
      }
    }
    
    newStr += char;
  }
  
  return newStr;
}

// Read from stdin and output to stdout
if (typeof process !== "undefined") {
  const args = process.argv.slice(2);
  let removeComments = false;
  let stringifyValues = false;
  let propertyDelimeter = ",";
  let transformDelimeter = propertyDelimeter;
  let css = false;
  
  for (const arg of args) {
    switch (arg) {
      case "-s":
      case "--stringify-values":
        stringifyValues = true;
        break;
      case "-c":
      case "--css":
        stringifyValues = true;
        propertyDelimeter = ";";
        transformDelimeter = ",";
        break;
      case "-r":
      case "--remove-comments":
        removeComments = true;
        break;
    }
  }
  
  process.stdin.setEncoding('utf8');
  let data = "";
  
  process.stdin.on('readable', () => {
    const chunk = process.stdin.read();
    if (chunk !== null) {
      data += chunk;
    }
  });
  
  process.stdin.on('end', () => {
    process.stdout.write(js2json(data, stringifyValues, propertyDelimeter, transformDelimeter));
  });
}
