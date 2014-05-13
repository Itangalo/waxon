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
   * Selects a value based on weighted probabilities.
   *
   * @variable values
   *   An object with selectable values as property keys, and associated
   *   relative probability as values.
   */
  function randomSelect(values) {
    var sum = 0, selected;
    var values2 = {};
    for (var i in values) {
      // Normal case: We have an object with propery keys + weights.
      if (isNaN(i)) {
        sum = sum + parseFloat(values[i]);
        values2[i] = sum;
      }
      // Other case: We have an array with numeric keys and returnable values.
      // Set the weight for each to one.
      else {
        Logger.log(i);
        sum++;
        values2[values[i]] = sum;
      }
    }

    // Select one value at random, taking the weights into account.
    selected = Math.random() * sum;
    for (var i in values2) {
      if (selected <= values2[i]) {
        return i;
      }
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
    return app.createImage('http://latex.codecogs.com/png.latex?\\dpi{120} ' + expression);
  }

  function preParseExpression(expressionString, variables) {
    var variables = variables.join('');

    // Build an object with replacement rules. (The order matters!)
    var re = {};
    // Turns '2,5' into '2.5', but leaves '(2, 5)' untouched. Good for Swedish people.
    re.commaAsDecimal = {
      expr : /(\d)[,]+(\d)/,
      repl : '$1.$2',
    }
    // Turns '2sin(x)' into '2*sin(x)'.
    re.letterCoefficients = {
      expr : /(\d+)([a-z])/i,
      repl : '$1*$2',
    };
    // Turns '2/xy' into '2/(x*y)'.
    re.parenthesizeVariableSequences = {
      expr : new RegExp('([' + variables + ']+)([' + variables + ']+)'),
      repl : '($1*$2)',
    };
    // Turns '2(x+5)' into '2*(x+5)'.
    re.parenthesisCoefficients = {
      expr : /(\d+)([(])/i,
      repl : '$1*$2'
    };
    // Turns '(x+1)(x+2)' into '(x+1)*(x+2)'.
    re.parenthesisMultiplication = {
      expr : /([)])([(])/,
      repl : '$1*$2',
    };
    // Resolves remaining negative signs: 'x^(-(2*y))' to x^((-1)*2*y)
    re.negativeSign = {
      expr : new RegExp('([^0-9a-z(])[-]+([(])'),
      repl : '$1((-1)*',
    };


    // Apply the replacement rules.
    for (var i in re) {
      while (expressionString.replace(re[i].expr, re[i].repl) != expressionString) {
        expressionString = expressionString.replace(re[i].expr, re[i].repl);
      }
    }
    return expressionString;
  }

  /**
   * Compares two algebraic expressions, to see if they are the same.
   *
   * The algorithm only works with one-variable expressions. If other variable names
   * than 'x' are used, they should be specified in var1 and var2.
   */
  function compareExpressions(expression1, expression2, var1, var2) {
    var1 = var1 || 'x';
    var2 = var2 || 'x';
    expression1 = preParseExpression(expression1, [var1]);
    expression2 = preParseExpression(expression2, [var2]);
    expression1 = Parser.parse(expression1);
    expression2 = Parser.parse(expression2);
    var x, vars1 = {}, vars2 = {};

    // Run five evaluations of random numbers between -10 and 10, to see if the expressions
    // yield the same values. (Yes, this is an ugly way of comparing the expressions. But
    // it is cheap and it works for the practical purposes.)
    for (var i = 0; i < 5; i++) {
      x = waxonUtils.randomInt(-100, 100) / 10;
      vars1[var1] = x;
      vars2[var2] = x;
      // The rounding here is to prevent calculation errors to give false negatives.
      try {
        if (Math.round(expression1.evaluate(vars1) * 1000) != Math.round(expression2.evaluate(vars2) * 1000)) {
          return -1;
        }
      }
      catch(e) {
        // If both expressions cannot be parsed, try parsing one of them. If this succeeds,
        // then the expressions cannot be the same.
        try {
          expression1.evaluate(vars1);
          return -2;
        }
        catch(e) {
        }
      }
    }
    return 1;
  }

  // The methods in waxonUtils.
  return {
    randomInt : randomInt,
    randomSelect : randomSelect,
    gcd : gcd,
    latex2image : latex2image,
    preParseExpression : preParseExpression,
    compareExpressions : compareExpressions,
  }
}) ();
