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
   * Evaluates an expression, with variable values if supplied.
   *
   * The variables argument should contain any variables and their values, for
   * example '{x : 3, y : 2}'. If evaluation fails, for some reason, 'undefined'
   * will be returned.
   */
  function evaluate(expressionString, variables) {
    // Make sure we have sane arguments.
    if (typeof expressionString != 'string') {
      return;
    }
    if (typeof variables != 'object') {
      variables = {};
    }

    // Make sure all variables (and functions) are lower-case.
    expressionString = expressionString.toLowerCase();
    for (var v in variables) {
      if (v != v.toLowerCase()) {
        variables[v.toLowerCase()] = variables[v];
        delete variables[v];
      }
    }

    // Take care of implicit multiplication and Swedish notation in the expression.
    expressionString = this.preParseExpression(expressionString);

    // Evaluate! Since Parser may throw errors, we need a try statement.
    try {
      return Parser.parse(expressionString).evaluate(variables);
    }
    catch(e) {
      return;
    }
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
   * Compares two mathematic/algebraic expressions, to see if they are the same.
   *
   * Variable names are assumed to be 'x' in both expressions, but other variable names
   * can be passed in the 'var1' and 'var2' arguments. If more than one variable is used,
   * variable names should be passed in an array. Different variables may be used for the
   * two expressions, eg. 'x+y' could be compared to 'a+b'.
   * Returns 1 if expressions are the same, -1 if not the same, -2 if something is wrong.
   */
  function compareExpressions(expression1, expression2, var1, var2) {
    var1 = var1 || 'x';
    var2 = var2 || var1;
    if (typeof var1 == 'string') {
      var1 = [var1];
    }
    if (typeof var2 == 'string') {
      var2 = [var2];
    }
    // We should now have two arrays with variable names, and there should be the same
    // number of variables in them.
    if (Array.isArray(var1) != true || Array.isArray(var2) != true || var1.length != var2.length) {
      return -2;
    }
    var x, vars1 = {}, vars2 = {}, val1, val2, tries = 0;

    // Run five evaluations of random numbers between -5 and 5, to see if the expressions
    // yield the same values. (Yes, this is an ugly way of comparing the expressions. But
    // it is cheap and it works for the practical purposes.)
    for (var i = 0; i < 5; i++) {
      for (var v in var1) {
        x = Math.random() * 10 - 5;
        vars1[var1[v]] = x;
        vars2[var2[v]] = x;
      }
      val1 = this.evaluate(expression1, vars1);
      val2 = this.evaluate(expression2, vars2);

      // The expressions may be undefined for these variable values. This check allow trying
      // again, but aborts if we've tried more than ten times. (The expressions might just be
      // juble, and impossible to evaluate alltogether.)
      if (val1 == undefined && val2 == undefined) {
        i--;
        tries++;
        if (tries > 10) {
          return -2;
        }
        continue;
      }
      // If one expression value is undefined, but not the other, they cannot be the same.
      if ((val1 == undefined && val2 != undefined) || (val1 != undefined && val2 == undefined)) {
        return -2;
      }

      // Finally, we compare the numeric values of the expressions. The rounding here is to
      // prevent calculation errors to give false negative results.
      if (val1.toFixed(10) != val2.toFixed(10)) {
        return -1;
      }
    }
    // If we got this far, the expressions are most likely the same.
    return 1;
  }

  /**
   * Creates a formatted table using data from the content array.
   *
   * The content array can either just hold cell content, or an object with these keys:
   *   content[row][column].content: The content to be printed
   *   content[row][column].popup: Any text to show on hover.
   *   content[row][column].attributes: Any attributes that should be added to the cell.
   */
  function createTable(content) {
    var app = UiApp.getActiveApplication();
    if (!Array.isArray(content) || !Array.isArray(content[0])) {
      return app.createLabel('(malformatted table)');
    }
    var max = 0;
    for (var i in content) {
      max = Math.max(max, content[i].length);
    }
    var table = app.createGrid(content.length, max);
    for (var row in content) {
      for (var column in content[row]) {
        if (content[row][column].content == undefined) {
          table.setText(parseInt(row), parseInt(column), content[row][column]);
        }
        else {
          table.setWidget(parseInt(row), parseInt(column), app.createLabel(content[row][column].content).setTitle(content[row][column].popup || '').setStyleAttributes(content[row][column].attributes || {}));
        }
      }
    }
    return table;
  }

  // The methods in waxonUtils.
  return {
    randomInt : randomInt,
    randomSelect : randomSelect,
    randomBinomial : randomBinomial,
    gcd : gcd,
    latex2image : latex2image,
    numberOfTerms : numberOfTerms,
    evaluate : evaluate,
    preParseExpression : preParseExpression,
    compareExpressions : compareExpressions,
    createTable : createTable,
  }
}) ();
