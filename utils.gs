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
    if (Array.isArray(disallowed) != true) {
      disallowed = [disallowed];
    }
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
    // If we are handed an array, simply return a random element.
    if (Array.isArray(values)) {
      return values[Math.floor(Math.random() * values.length)];
    }

    // If we are handed an object, select an element by weighted probability.
    if (typeof values == 'object') {
      var sum = 0, selected;
      for (var i in values) {
        sum = sum + parseFloat(values[i]);
        values[i] = sum;
      }
      selected = Math.random() * sum;
      for (var i in values) {
        if (selected <= values[i]) {
          return i;
        }
      }
    }

    // If it is not an array and not a string, we assume that we have this
    // single value to choose from and simply return it.
    return values;
  }

  /**
   * Builds a random binomial on the form 'ax + b' or 'a + bx'.
   *
   * @variable min
   *   Lower limit for the coefficient and constant. Defaults to -3.
   * @variable max
   *   Upper limit for the coefficient and constant. Defaults to 3.
   * @variable variable
   *   The name of the variable to use. Defaults to 'x'.
   * @variable mode
   *   Set to 'straight' to only use 'ax + b'. Set to 'reverse' to only use 'a + bx'.
   *   Defaults to a random selection between the two.
   */
  function randomBinomial(min, max, variable, mode) {
    min = min || -3;
    max = max || 3;
    variable = variable || 'x';
    mode = mode || waxonUtils.randomSelect(['straight', 'reverse']);
    var a = waxonUtils.randomInt(min, max, [0]);
    var b = waxonUtils.randomInt(min, max, [0]);
    switch (mode) {
      case 'reverse' :
        if (a == 1) {
          a = '+';
        }
        else if (a == -1) {
          a = '-';
        }
        else if (a > 0) {
          a = '+' + a;
        }
        return '' + b + a + variable;
        break;
      default :
        if (a == 1) {
          a = '';
        }
        else if (a == -1) {
          a = '-';
        }
        if (b > 0) {
          b = '+' + b;
        }
        return a + variable + b;
        break;
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
  function latex2image(expression, noParse) {
    expression = expression.toString();
    var replacements = {
      '.' : ',', // Swedish decimal sign
      '*' : ' \\cdot ',
      ',' : '{,}',
    }
    if (noParse != true) {
      for (var i in replacements) {
        expression = expression.replace(i, replacements[i]);
      }
    }
    var app = UiApp.getActiveApplication();
    return app.createImage('http://latex.codecogs.com/png.latex?\\dpi{120} ' + expression);
  }

  /**
   * Tries to count the number of terms in an expression. (Succeeds with most sane expressions.)
   */
  function numberOfTerms(expression) {
    expression = expression.trim();
    var simpleSplit = expression.match(/[+-]/g) || [];
    var negativeSigns = expression.match(/[+-][\D\W][+-]/g) || [];
    if (expression.substring(0, 1) == '+' || expression.substring(0, 1) == '-') {
      negativeSigns.push('-');
    }

    return simpleSplit.length - negativeSigns.length + 1;
  }

  /**
   * Parses an expression string, allowing Swedish notation and implicit multiplication.
   */
  function preParseExpression(expressionString) {
    expressionString = expressionString.toString();

    // Replace any function names in the expression with tokens, so they won't
    // confuse the replacements for implicit multiplication. (All the functions
    // and constants used by Parser can be found as properties in Parser.values.)
    var operators = Object.keys(Parser.values);
    // Sort the function names by length so we replace 'asin' before 'sin'. (This
    // avoids breaking function names.)
    operators.sort(function(a, b){
      return b.length - a.length;
    });

    // Build an object with replacement rules. (The order matters!)
    var re = {};
    // Turns '2,5' into '2.5', but leaves '(2, 5)' untouched. Good for Swedish people.
    re.commaAsDecimal = {
      expr : /(\d)[,]+(\d)/,
      repl : '$1.$2',
    };

    // Replace function names with tokens. Include opening parenthesis of the function
    // argument, to avoid it being treated as an implicit multiplication.
    for (var i in operators) {
      re['op' + i] = {
        expr : new RegExp(operators[i] + '\\('),
        repl : '<' + i + '>',
      };
    }

    // Special case: The constant PI is understood by Parser, and should be replaced
    // to avoid treating the letters as an implicit multiplication.
    re.pi = {
      expr : /pi/i,
      repl : 'π',
    };
    // Replacements making implicit multiplication explicit:
    // a(x+1)(x+2) becomes a*(x+1)*(x+2). Most of this trick comes from
    // http://stackoverflow.com/questions/20912455/math-expression-parser
    // Cred to Reut Sharabani.
    re.implicit = {
      expr: /([0-9]+|[a-zπ\\)])(?=[a-zπ<\\(])/i,
      repl : '$1*',
    };
    // When implicit multiplications have been taken care of, we can return 'π' to 'PI'.
    re.piBack = {
      expr: /π/,
      repl : 'PI',
    };

    // Return any function names to the expression.
    for (var i in operators) {
      re['opBack' + i] = {
        expr : new RegExp('<' + i + '>'),
        repl : operators[i] + '(',
      };
    }

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
    randomBinomial : randomBinomial,
    gcd : gcd,
    latex2image : latex2image,
    numberOfTerms : numberOfTerms,
    preParseExpression : preParseExpression,
    compareExpressions : compareExpressions,
  }
}) ();
