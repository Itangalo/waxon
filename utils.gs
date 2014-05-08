/**
 * Miscellaneous helper functions for waxon.
 */
var waxonUtils = (function() {
  /**
   * Returns a random integer between min and max (inclusive).
   *
   * Optional array 'disallowed' may contain values that may not be used.
   */
  function randomInt(min, max, disallowed) {
    disallowed = disallowed || [];
    var value = Math.floor(Math.random() * (max - min + 1)) + min;
    if (disallowed.indexOf(value) == -1) {
      return value
    }
    else {
      return this.randomInt(min, max, disallowed);
    }
  }

  /**
   * Returns the greatest common denominator for integers a and b.
   *
   * Clever recursive solution taken from http://stackoverflow.com/questions/17445231/js-how-to-find-the-greatest-common-divisor
   */
  function gcd(a, b) {
    if ( ! b) {
        return a;
    }
    return this.gcd(b, a % b);
  };

  /**
   * Uses the webservice latex.codecogs.com for building a png from LaTeX expression.
   */
  function latex2image(expression) {
    var app = UiApp.getActiveApplication();
    return app.createImage('http://latex.codecogs.com/png.latex?' + expression);
  }

  // The methods in waxonUtils.
  return {
    randomInt : randomInt,
    gcd : gcd,
    latex2image : latex2image,
  }

}) ();
