/**
 * From: https://gist.github.com/jtsternberg/1e03f5fd5be8427170c5
 * Caches jquery selectors when they are requested, so that each element
 * is only selected once. An element can be reset, if necessary.
 * For selectors like $(this) in e.g. selection menus you should always
 * reset the element or don't use it at all.
 * Be careful of selections that won't stay the same.
 *
 * @returns {{get: get_from_cache}} use: let cache = new Selector_Cache();
 * cache.get(selector) or
 * cache.get(selector, true) if the selected element should be reset
 * @constructor initialized with: new Selector_Cache()
 */
function Selector_Cache() {
  const collection = {};

  function get_from_cache(selector, reset) {
    if (undefined === collection[selector] || true === reset) {
      collection[selector] = $(selector);
    }

    return collection[selector];
  }

  return {get: get_from_cache};
}