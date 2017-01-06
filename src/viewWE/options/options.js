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

const options = {
  $cache: new Selector_Cache(),

  selectorStart: "wertiview-",

  /**
   * Restore user options and initialize all options handler.
   */
  init: function() {
    console.log("init ready");
    options.initFixedNumberHandler();

    options.initPercentageHandler();

    options.initRandomChoiceHandler();

    options.initFirstOffsetChoiceHandler();

    options.initIntervalSizeChoiceHandler();

    options.initSaveOptionsHandler();

    options.restoreUserOptions();
  },

  /**
   * Restore previous user option settings from storage.
   * The values right to "||" are default values.
   */
  restoreUserOptions: function() {
    console.log("restoreUserOptions ready");
    chrome.storage.local.get([
      "fixedOrPercentage",
      "fixedNumberOfExercises",
      "percentageOfExercises",
      "choiceMode",
      "firstOffset",
      "intervalSize",
      "showInst"
    ], function(res) {

      const fixedOrPercentageValue = res.fixedOrPercentage || 0;
      const fixedNumberOfExercises = res.fixedNumberOfExercises || 25;
      const percentageOfExercises = res.percentageOfExercises || 100;
      const choiceModeValue = res.choiceMode || 0;
      const firstOffset = res.firstOffset || 0;
      const intervalSize = res.intervalSize || 1;
      const showInst = res.showInst || false;

      options.chooseHowManyExercises(fixedOrPercentageValue);

      options.restoreHowManyExercises(
        fixedNumberOfExercises,
        percentageOfExercises
      );

      options.chooseHowToChooseExercises(choiceModeValue);

      options.restoreHowToChooseExercises(
        firstOffset,
        intervalSize
      );

      options.restoreIfToShowInstructions(showInst);
    });
  },

  /**
   * Choice between a fixed number or percentage of exercises.
   *
   * @param {number} fixedOrPercentageValue 0 if fixed, percentage otherwise
   */
  chooseHowManyExercises: function(fixedOrPercentageValue) {
    console.log("chooseHowManyExercises ready");
    if (fixedOrPercentageValue == 0) {
      options.chooseFixedNumber();
    } else {
      options.choosePercentage();
    }
  },

  /**
   * Will choose fixed number as how many exercises are chosen and will
   * hide the value for the percentage of exercises.
   */
  chooseFixedNumber: function() {
    console.log("chooseFixedNumber ready");
    options.$cache.get(options.selectorStart + "fixed-number-of-exercises-value").show();
    options.$cache.get(options.selectorStart + "percentage-of-exercises-value").hide();
  },

  /**
   * Will choose percentage as how many exercises are chosen and will
   * hide the value for the fixed number of exercises.
   */
  choosePercentage: function() {
    console.log("choosePercentage ready");
    options.$cache.get(options.selectorStart + "percentage-of-exercises-value").show();
    options.$cache.get(options.selectorStart + "fixed-number-of-exercises-value").hide();
  },

  /**
   * Restore the values of the fixed number and percentage of exercises.
   *
   * @param {number} fixedNumberOfExercises the number of exercises
   * @param {number} percentageOfExercises the percentage of exercises
   */
  restoreHowManyExercises: function(fixedNumberOfExercises, percentageOfExercises) {
    console.log("restoreHowManyExercises ready");
    options.$cache.get(options.selectorStart + "fixed-number-of-exercises-value").val(fixedNumberOfExercises);

    options.$cache.get(options.selectorStart + "percentage-of-exercises-value").val(percentageOfExercises);

  },

  /**
   * Choice how exercises should be chosen.
   *
   * @param {number} choiceModeValue 0 if random, 1 if first offset, interval
   * size otherwise
   */
  chooseHowToChooseExercises: function(choiceModeValue) {
    console.log("chooseHowToChooseExercises ready");
    if (choiceModeValue == 0) {
      options.chooseRandom();
    } else if (choiceModeValue == 1) {
      options.chooseFirstOffset();
    } else {
      options.chooseIntervalSize();
    }
  },

  /**
   * Check the random choice on how exercises should be chosen.
   * Hide first offset and interval size values.
   */
  chooseRandom: function() {
    console.log("chooseRandom ready");
    options.$cache.get(options.selectorStart + "first-offset-value").hide();
    options.$cache.get(options.selectorStart + "interval-size-value").hide();
  },

  /**
   * Check the first offset choice on how exercises should be chosen.
   * Show the value and hide the interval size value.
   */
  chooseFirstOffset: function() {
    console.log("chooseFirstOffset ready");
    options.$cache.get(options.selectorStart + "first-offset-value").show();
    options.$cache.get(options.selectorStart + "interval-size-value").hide();
  },

  /**
   * Check the interval size choice on how exercises should be chosen.
   * Show the value and hide the first offset value.
   */
  chooseIntervalSize: function() {
    console.log("chooseIntervalSize ready");
    options.$cache.get(options.selectorStart + "interval-size-value").show();
    options.$cache.get(options.selectorStart + "first-offset-value").hide();
  },

  /**
   * Restore the values of the first offset and the interval size.
   *
   * @param {number} firstOffset the offset value
   * @param {number} intervalSize the interval value
   */
  restoreHowToChooseExercises: function(firstOffset, intervalSize) {
    console.log("restoreHowToChooseExercises ready");
    options.$cache.get(options.selectorStart + "first-offset-value").val(firstOffset);

    options.$cache.get(options.selectorStart + "interval-size-value").val(intervalSize);
  },

  /**
   * Choice whether instructions should be showed or not
   *
   * @param {boolean} showInst true if to show instructions, false otherwise
   */
  restoreIfToShowInstructions: function(showInst) {
    console.log("restoreIfToShowInstructions ready");
    options.$cache.get(options.selectorStart + "show-instructions").prop("checked", showInst);
  },

  /**
   * Initialize the handler for the fixed number of exercises.
   */
  initFixedNumberHandler: function() {
    console.log("initFixedNumberHandler ready");
    options.$cache.get(options.selectorStart + "fixed-number-of-exercises").on("click", options.chooseFixedNumber);
  },

  /**
   * Initialize the handler for the percentage of exercises.
   */
  initPercentageHandler: function() {
    console.log("initPercentageHandler ready");
    options.$cache.get(options.selectorStart + "percentage-of-exercises").on("click", options.choosePercentage);
  },

  /**
   * Initialize the handler for the random choice of exercises.
   */
  initRandomChoiceHandler: function() {
    console.log("initRandomChoiceHandler ready");
    options.$cache.get(options.selectorStart + "random").on("click", options.chooseRandom);
  },

  /**
   * Initialize the handler for the first offset choice of exercises.
   */
  initFirstOffsetChoiceHandler: function() {
    console.log("initFirstOffsetChoiceHandler ready");
    options.$cache.get(options.selectorStart + "first-offset").on("click", options.chooseFirstOffset);
  },

  /**
   * Initialize the handler for the interval size choice of exercises.
   */
  initIntervalSizeChoiceHandler: function() {
    console.log("initIntervalSizeChoiceHandler ready");
    options.$cache.get(options.selectorStart + "interval-size").on("click", options.chooseIntervalSize);
  },

  /**
   * Initialize the handler for saving the user options.
   */
  initSaveOptionsHandler: function() {
    console.log("initSaveOptionsHandler ready");
    options.$cache.get(options.selectorStart + "save-options").on("click", options.saveUserOptions);
  },

  /**
   * Save all user option choices to the storage.
   */
  saveUserOptions: function() {
    console.log("saveUserOptions ready");
    const fixedOrPercentage = options.$cache.get("input[name='fixedOrPercentage']:checked").val();
    const fixedNumberOfExercises = options.$cache.get(options.selectorStart + "fixed-number-of-exercises-value").val();
    const percentageOfExercises = options.$cache.get(options.selectorStart + "percentage-of-exercises-value").val();
    const choiceMode = options.$cache.get("input[name='choiceMode']:checked").val();
    const firstOffset = options.$cache.get(options.selectorStart + "first-offset-value").val();
    const intervalSize = options.$cache.get(options.selectorStart + "interval-size-value").val();
    const showInst = options.$cache.get(options.selectorStart + "show-instructions").prop("checked");
    chrome.storage.local.set({
      fixedOrPercentage: fixedOrPercentage,
      fixedNumberOfExercises: fixedNumberOfExercises,
      percentageOfExercises: percentageOfExercises,
      choiceMode: choiceMode,
      firstOffset: firstOffset,
      intervalSize: intervalSize,
      showInst: showInst
    }, options.requestToCallSaveUserOptions);
  },

  /**
   * Send a request to pass on the message to call saveUserOptions().
   */
  requestToCallSaveUserOptions: function() {
    console.log("requestToCallSaveUserOptions ready");
    chrome.runtime.sendMessage({msg: "call saveUserOptions"});
  }
};

/**
 * Initialize the options when the document is ready.
 */
options.$cache.get(document).ready(function() {
  console.log("document ready");
  options.init();
});