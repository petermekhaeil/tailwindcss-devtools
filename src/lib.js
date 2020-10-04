// https://github.com/tailwindlabs/tailwindcss.com/blob/master/src/utils/kebabToTitleCase.js
export function kebabToTitleCase(str) {
  return str
    .replace(/(?:^|-)([a-z])/gi, (m, p1) => ` ${p1.toUpperCase()}`)
    .trim();
}

// https://github.com/tailwindlabs/tailwindcss.com/blob/master/src/utils/isObject.js
export function isObject(value) {
  return Object.prototype.toString.call(value) === "[object Object]";
}

// https://github.com/tailwindlabs/tailwindcss.com/blob/master/src/utils/castArray.js
export function castArray(value) {
  return Array.isArray(value) ? value : [value];
}

// https://github.com/tailwindlabs/tailwindcss.com/blob/master/src/components/ClassTable.js
export function stringifyProperties(
  properties,
  { filter = () => true, transformValue = (x) => x, indent = 0 } = {}
) {
  let lines = [];
  Object.keys(properties).forEach((property) => {
    if (isObject(properties[property])) {
      lines.push(`${property} {`);
      lines.push(
        stringifyProperties(properties[property], {
          filter,
          transformValue,
          indent: indent + 1,
        })
      );
      lines.push("}");
    } else {
      castArray(properties[property]).forEach((value, i) => {
        if (!filter(property, value, properties)) return;
        lines.push(
          `${"  ".repeat(indent)}${property}: ${transformValue(value)};`
        );
      });
    }
  });
  return lines.join("\n");
}

// https://davidwalsh.name/javascript-debounce-function
export function debounce(func, wait, immediate) {
  var timeout;
  return function () {
    var context = this,
      args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}
