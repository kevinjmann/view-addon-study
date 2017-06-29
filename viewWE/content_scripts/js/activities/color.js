const $ = require('jquery');

module.exports = {
  /**
   * Run the colorize activity.
   *
   * @param {string} topic the name of the topic.
   */
  run: function(topic) {
    $("viewenhancement.selected").addClass("colorize-style-" + topic);
  }
};
