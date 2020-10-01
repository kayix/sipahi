export function dotProp(obj, desc) {
  let arr = desc.split(".");
  while (arr.length && (obj = obj[arr.shift()]));
  return obj;
}
