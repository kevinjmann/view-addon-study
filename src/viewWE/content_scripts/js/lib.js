view.lib = {
  /**
   * A function that is supposed to be a placeholder for a response callback.
   */
  noResponse: function() {
    // This is intentional
  },

  /*
   * Get random numbers up to the variable "max".
   */
  getRandom: function(max) {
    return Math.floor(Math.random() * (max + 1));
  },

  /**
   * Disable all anchors, so that links can't be followed.
   */
  disableAnchors: function() {
    $("a").each(function() {
      $(this).data("href", $(this).attr("href"));
      $(this).removeAttr("href");
    });
  },

  /**
   * Enable all anchors, so that links can be followed again.
   */
  enableAnchors: function() {
    $("a").each(function() {
      $(this).attr("href", $(this).data("href"));
    });
  },

  /*
   * Fisher-Yates shuffle, rearrange an array
   */
  shuffleList: function(elemList) {
    var i, j, tempElem;
    for (i = elemList.length; i > 1; i--) {
      j = parseInt(Math.random() * i);
      tempElem = elemList[j];
      elemList[j] = elemList[i - 1];
      elemList[i - 1] = tempElem;
    }
  },

  /*
   * Detect capitalization pattern in target word
   *
   * 0 = not capitalized or weird enough to leave alone
   * 1 = all caps
   * 2 = first letter capitalized
   */
  detectCapitalization: function(word) {
    if (word == word.toUpperCase()) {
      return 1;
    }
    else if (word == word.substr(0, 1).toUpperCase() + word.substr(1)) {
      return 2;
    }
    else{
      return 0;
    }
  },

  /*
   * Replace old input with new input and watch out for links
   */
  replaceInput: function($old, $new) {
    // if this is inside a link
    if ($old.parents("a").length > 0) {
      $old.parents("a").eq(0).data("wertiview-disableclick", true);
    }

    $old.replaceWith($new);
  },

  /*
   * Parallel capitalization (for multiple choice drop-downs)
   */
  matchCapitalization: function(word, type) {
    switch (type) {
      case 0:
        return word;
      case 1:
        return word.toUpperCase();
      case 2:
        return word.slice(0, 1).toUpperCase() + word.slice(1);
      default:
        return word;
    }
  },

  /*
   * Encode the given string "s" into UTF8.
   */
  encodeUTF8: function(s) {
    return unescape(encodeURIComponent(s));
  },

  /*
   * Reservoir sampling (sample k elements from an array) applied to
   * associative arrays, i.e. objects with properties
   * http://en.wikipedia.org/w/index.php?title=Reservoir_sampling&oldid=488484000
   */
  sampleFromObjectProps: function(obj, k) {
    // choose the keys at random
    var sampleKeys = {};
    var i = 0;
    for (var key in obj) {
      // generate the reservoir
      if (i < k) {
        sampleKeys[i] = key;
      }
      else {
        // randomly replace elements in the reservoir with a decreasing probability
        var r = view.lib.getRandom(i + 1);
        if (r < k) {
          sampleKeys[r] = key;
        }
      }
      i++;
    }
    // find the corresponding values for the chosen keys
    var sample = {};
    for (var j = 0; j < k; j++) {
      key = sampleKeys[j];
      var value = obj[key];
      sample[key] = value;
    }
    return sample;
  },

  /*
   * Illegal value for a preference (e.g., user edited about:config)
   */
  prefError: function(message) {
    view.interaction.initialInteractionState();

    if (message) {
      alert(message);
    }
    else {
      alert("The preferences have illegal values. Please go to 'Options > Addons' and change the VIEW preferences.");
    }
  }
};