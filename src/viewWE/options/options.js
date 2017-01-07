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

const viewOptions = {
  $cache: new Selector_Cache(),

  selectorStart: "#wertiview-",

  /**
   * Restore user options and initialize all options handler.
   */
  init: function() {
    console.log("init ready");
    viewOptions.initFixedNumberHandler();

    viewOptions.initPercentageHandler();

    viewOptions.initRandomChoiceHandler();

    viewOptions.initFirstOffsetChoiceHandler();

    viewOptions.initIntervalSizeChoiceHandler();

    viewOptions.initSaveOptionsHandler();

    viewOptions.restoreUserOptions();
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

      viewOptions.chooseHowManyExercises(fixedOrPercentageValue);

      viewOptions.restoreHowManyExercises(
        fixedNumberOfExercises,
        percentageOfExercises
      );

      viewOptions.chooseHowToChooseExercises(choiceModeValue);

      viewOptions.restoreHowToChooseExercises(
        firstOffset,
        intervalSize
      );

      viewOptions.restoreIfToShowInstructions(showInst);
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
      viewOptions.chooseFixedNumber();
    } else {
      viewOptions.choosePercentage();
    }
  },

  /**
   * Will choose fixed number as how many exercises are chosen and will
   * hide the value for the percentage of exercises.
   */
  chooseFixedNumber: function() {
    console.log("chooseFixedNumber ready");
    viewOptions.$cache.get(viewOptions.selectorStart + "fixed-number-of-exercises").prop("checked", true);
    viewOptions.$cache.get(viewOptions.selectorStart + "fixed-number-of-exercises-value").show();
    viewOptions.$cache.get(viewOptions.selectorStart + "percentage-of-exercises-value").hide();
  },

  /**
   * Will choose percentage as how many exercises are chosen and will
   * hide the value for the fixed number of exercises.
   */
  choosePercentage: function() {
    console.log("choosePercentage ready");
    viewOptions.$cache.get(viewOptions.selectorStart + "percentage-of-exercises").prop("checked", true);
    viewOptions.$cache.get(viewOptions.selectorStart + "percentage-of-exercises-value").show();
    viewOptions.$cache.get(viewOptions.selectorStart + "fixed-number-of-exercises-value").hide();
  },

  /**
   * Restore the values of the fixed number and percentage of exercises.
   *
   * @param {number} fixedNumberOfExercises the number of exercises
   * @param {number} percentageOfExercises the percentage of exercises
   */
  restoreHowManyExercises: function(fixedNumberOfExercises, percentageOfExercises) {
    console.log("restoreHowManyExercises ready");
    viewOptions.$cache.get(viewOptions.selectorStart + "fixed-number-of-exercises-value").val(fixedNumberOfExercises);

    viewOptions.$cache.get(viewOptions.selectorStart + "percentage-of-exercises-value").val(percentageOfExercises);

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
      viewOptions.chooseRandom();
    } else if (choiceModeValue == 1) {
      viewOptions.chooseFirstOffset();
    } else {
      viewOptions.chooseIntervalSize();
    }
  },

  /**
   * Check the random choice on how exercises should be chosen.
   * Hide first offset and interval size values.
   */
  chooseRandom: function() {
    console.log("chooseRandom ready");
    viewOptions.$cache.get(viewOptions.selectorStart + "random").prop("checked", true);
    viewOptions.$cache.get(viewOptions.selectorStart + "first-offset-value").hide();
    viewOptions.$cache.get(viewOptions.selectorStart + "interval-size-value").hide();
  },

  /**
   * Check the first offset choice on how exercises should be chosen.
   * Show the value and hide the interval size value.
   */
  chooseFirstOffset: function() {
    console.log("chooseFirstOffset ready");
    viewOptions.$cache.get(viewOptions.selectorStart + "first-offset").prop("checked", true);
    viewOptions.$cache.get(viewOptions.selectorStart + "first-offset-value").show();
    viewOptions.$cache.get(viewOptions.selectorStart + "interval-size-value").hide();
  },

  /**
   * Check the interval size choice on how exercises should be chosen.
   * Show the value and hide the first offset value.
   */
  chooseIntervalSize: function() {
    console.log("chooseIntervalSize ready");
    viewOptions.$cache.get(viewOptions.selectorStart + "interval-size").prop("checked", true);
    viewOptions.$cache.get(viewOptions.selectorStart + "interval-size-value").show();
    viewOptions.$cache.get(viewOptions.selectorStart + "first-offset-value").hide();
  },

  /**
   * Restore the values of the first offset and the interval size.
   *
   * @param {number} firstOffset the offset value
   * @param {number} intervalSize the interval value
   */
  restoreHowToChooseExercises: function(firstOffset, intervalSize) {
    console.log("restoreHowToChooseExercises ready");
    viewOptions.$cache.get(viewOptions.selectorStart + "first-offset-value").val(firstOffset);

    viewOptions.$cache.get(viewOptions.selectorStart + "interval-size-value").val(intervalSize);
  },

  /**
   * Choice whether instructions should be showed or not
   *
   * @param {boolean} showInst true if to show instructions, false otherwise
   */
  restoreIfToShowInstructions: function(showInst) {
    console.log("restoreIfToShowInstructions ready");
    viewOptions.$cache.get(viewOptions.selectorStart + "show-instructions").prop("checked", showInst);
  },

  /**
   * Initialize the handler for the fixed number of exercises.
   */
  initFixedNumberHandler: function() {
    console.log("initFixedNumberHandler ready");
    viewOptions.$cache.get(viewOptions.selectorStart + "fixed-number-of-exercises").on("click", viewOptions.chooseFixedNumber);
  },

  /**
   * Initialize the handler for the percentage of exercises.
   */
  initPercentageHandler: function() {
    console.log("initPercentageHandler ready");
    viewOptions.$cache.get(viewOptions.selectorStart + "percentage-of-exercises").on("click", viewOptions.choosePercentage);
  },

  /**
   * Initialize the handler for the random choice of exercises.
   */
  initRandomChoiceHandler: function() {
    console.log("initRandomChoiceHandler ready");
    viewOptions.$cache.get(viewOptions.selectorStart + "random").on("click", viewOptions.chooseRandom);
  },

  /**
   * Initialize the handler for the first offset choice of exercises.
   */
  initFirstOffsetChoiceHandler: function() {
    console.log("initFirstOffsetChoiceHandler ready");
    viewOptions.$cache.get(viewOptions.selectorStart + "first-offset").on("click", viewOptions.chooseFirstOffset);
  },

  /**
   * Initialize the handler for the interval size choice of exercises.
   */
  initIntervalSizeChoiceHandler: function() {
    console.log("initIntervalSizeChoiceHandler ready");
    viewOptions.$cache.get(viewOptions.selectorStart + "interval-size").on("click", viewOptions.chooseIntervalSize);
  },

  /**
   * Initialize the handler for saving the user options.
   */
  initSaveOptionsHandler: function() {
    console.log("initSaveOptionsHandler ready");
    viewOptions.$cache.get(viewOptions.selectorStart + "save-options").on("click", viewOptions.saveUserOptions);
  },

  /**
   * Save all user option choices to the storage.
   */
  saveUserOptions: function() {
    console.log("saveUserOptions ready");
    chrome.storage.local.set({
      fixedOrPercentage: viewOptions.$cache.get("input[name='fixedOrPercentage']:checked").val(),
      fixedNumberOfExercises: viewOptions.$cache.get(viewOptions.selectorStart + "fixed-number-of-exercises-value").val(),
      percentageOfExercises: viewOptions.$cache.get(viewOptions.selectorStart + "percentage-of-exercises-value").val(),
      choiceMode: viewOptions.$cache.get("input[name='choiceMode']:checked").val(),
      firstOffset: viewOptions.$cache.get(viewOptions.selectorStart + "first-offset-value").val(),
      intervalSize: viewOptions.$cache.get(viewOptions.selectorStart + "interval-size-value").val(),
      showInst: viewOptions.$cache.get(viewOptions.selectorStart + "show-instructions").prop("checked")
    }, function() {
      viewOptions.$cache.get(viewOptions.selectorStart + "options-saved").show().delay(5000).fadeOut();
    });
  }
};

/**
 * Initialize the options when the document is ready.
 */
viewOptions.$cache.get(document).ready(function() {
  console.log("document ready");
  viewOptions.init();
});