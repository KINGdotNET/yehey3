import _ from 'lodash';

/** *
 * Combine an array of arrays into a single array, by alternating between each array in order.
 * @param arraySet - Input: An array of multiple arrays to be combined, not required to be equal in length, extras are appended.
 * @returns - Output: A flat array with alternating elements.
 */
export function combineArrays(arraySet) {
  // console.log("combineArrays", arraySet);
  const cleanArray = arraySet.filter(Boolean);
  if (cleanArray.length < 2) {
    return cleanArray.flat();
  }
  
  const interleave = ([ x, ...xs ], ...rest) => 
  x === undefined
    ? rest.length === 0
      ? []                               // base: no x, no rest
      : interleave (...rest)             // inductive: no x, some rest
    : [ x, ...interleave(...rest, xs) ]  // inductive: some x, some rest 
  return interleave(...cleanArray);
  //[SOURCE - user633183]: https://stackoverflow.com/questions/47061160/merge-two-arrays-with-alternating-values
  };

/** *
 * Condense an array of arrays N x M into a transposed array of M x N, by pushing ordered array elements that iterate over each array. 
 * @param arraySet - Input: An array of multiple arrays to be transposed. Arrays must be equal in length, or extra elements are dropped.
 * @returns Output: A nested array with arrays of alternating elements.
 */

export function transposeArrays(...arraySet) {
    if (arraySet.length > 0) {
      return _.zip(...arraySet);
  } else {
    // console.log("arraySet length too low:", arraySet);
    return [];
  }};