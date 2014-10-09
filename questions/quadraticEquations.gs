/**
 * @file: Question type for solving quadratic equations presented on different forms.
 */
var q = new waxonQuestion('quadraticEquationsBase');

q.title = 'Andragradsekvationer';
q.shortTitle = 'Andragr.ekv.';

q.dependencies = {
  math : {apiVersion : 1, subVersion : 5},
  algebra : {apiVersion : 1, subVersion : 1},
  utils : {apiVersion : 1, subVersion : 1},
};

/**
 * If given, the parameters will be used in the following forms:
 *   standard: ax² + bx + c = k
 *   square: a(x+d)² + e = k
 *   product: a(k1*x - r1)(k2*x - r2) = 0
 */
q.defaults = new configObject({
  'form' : gash.utils.randomSelect({standard : 2, square : 1, product : 1}),
  allowComplex : false,
  allowIrrational : false,
  minRoot : -10,
  maxRoot : 10,
  maxDenominator : 3
});

q.generateParameters = function(options) {
  var zeroExpression = '', latex = '', plainText = '', x1, x2, fallback, tmp;
  options = this.defaults.overwriteWith(options);

  // Generate random solutions to fall back on if parameters needs to be adjusted.
  x1 = gash.math.randomFraction(options.minRoot, options.maxRoot, [], options.maxDenominator);
  x2 = gash.math.randomFraction(options.minRoot, options.maxRoot, [], options.maxDenominator);

  // Build a fallback to use if given options needs to be adjusted.
  tmp = options.a || gash.math.randomFraction(options.minRoot, options.maxRoot, [0], options.maxDenominator).value;
  fallback = new configObject({
    form : options.form,
    a : tmp,
    b : -1 * tmp * (x1.value + x2.value),
    c : tmp * x1.value * x2.value
  });
  fallback.k = gash.utils.randomInt(options.minRoot, options.maxRoot);
  fallback.d = fallback.b / fallback.a / 2;
  fallback.e = fallback.c - fallback.a * fallback.d * fallback.d + fallback.k;
  fallback.c = fallback.c + fallback.k;

  // We build expressions in different ways depending on the form of equation.
  switch (options.form) {
    case 'product' :
      // Add required parameters if they are missing.
      tmp = gash.utils.randomInt(1, options.maxDenominator);
      fallback.k1 = x1.d * tmp;
      fallback.r1 = x1.n * tmp;
      tmp = gash.utils.randomInt(1, options.maxDenominator);
      fallback.k2 = x2.d * tmp;
      fallback.r2 = x2.n * tmp;
      options.addDefaults(fallback);
      // Build the expressions.
      zeroExpression += options.a + '(' + options.k1 + '*x+' + options.r1 + ')*(' + options.k2 + '*x+' + options.r2 + ')';
      plainText = gash.math.findFraction(options.a).noOnes + '(' + gash.math.findFraction(options.k1).noOnes + 'x+' + gash.math.findFraction(options.r1).plainText + ')(' + gash.math.findFraction(options.k2).noOnes + 'x+' + gash.math.findFraction(options.r2).plainText + ')=0';
      latex = gash.math.latexFraction(options.a, {skipOnes : true}) + '\\left(' + gash.math.latexFraction(options.k1, {skipOnes : true}) + 'x+' + gash.math.latexFraction(options.r1) + '\\right)\\left(' + gash.math.latexFraction(options.k2, {skipOnes : true}) + 'x+' + gash.math.latexFraction(options.r2) + '\\right)=0';
      // Build the solutions.
      x1 = -1 * options.r1 / options.k1;
      x2 = -1 * options.r2 / options.k2;
      break;
    case 'standard' :
      // Make sure the options contina necessary data, then recalculate d and e values.
      // (This is because it is easier to handle the equations in square form.)
      options.addDefaults(fallback);
      options.d = options.b / options.a / 2;
      options.e = options.c - options.a * options.d * options.d;
    case 'square' :
      options.addDefaults(fallback);
      // Check that the solutions in provided options satisfy limitations.
      if (!options.allowComplex) {
        if (((options.k - options.e) / options.a) < 0) {
          options = fallback;
        }
      }
      if (!options.allowIrrational) {
        tmp = (options.k - options.e) / options.a;
        // This actually fails some solutions that are rational (enough), but that's life.
        x1 = (-1 * options.d + Math.sqrt(Math.abs(tmp))) * options.maxDenominator;
        x2 = (-1 * options.d - Math.sqrt(Math.abs(tmp))) * options.maxDenominator;
        if (x1.toFixed(0) != x1 || x2.toFixed(0) != x2) {
          options = fallback;
        }
      }
      if (options.form == 'square') {
        zeroExpression += options.a + '(x+' + options.d + ')^2+' + options.e + '-' + options.k;
        plainText += gash.math.findFraction(options.a).noOnes + '(x+' + gash.math.findFraction(options.d).plainText + ')²+' + gash.math.findFraction(options.e).plainText + '=' + gash.math.findFraction(options.k).plainText;
        latex += gash.math.latexFraction(options.a, {skipOnes : true}) + '\\left ( x+' + gash.math.latexFraction(options.d) + '\\right ) ^2+' + gash.math.latexFraction(options.e) + '=' + gash.math.latexFraction(options.k);
      }
      else {
        zeroExpression += options.a + 'x^2+' + options.b + 'x+' + options.c + '-' + options.k;
        plainText += gash.math.findFraction(options.a).noOnes + 'x²+' + gash.math.findFraction(options.b).noOnes + 'x+' + gash.math.findFraction(options.c).plainText + '=' + gash.math.findFraction(options.k).plainText;
        var parts = [];
        parts.push(gash.math.latexFraction(options.a, {skipOnes : true}) + 'x^2');
        if (options.b != 0) {
          parts.push(gash.math.latexFraction(options.b, {skipOnes : true}) + 'x');
        }
        if (options.c != 0) {
          parts.push(gash.math.latexFraction(options.c));
        }
        latex += gash.utils.shuffleArray(parts).join('+') + '=' + gash.math.latexFraction(options.k);
      }
      // Build the solutions.
      tmp = (options.k - options.e) / options.a;
      if (tmp < 0) {
        x1 = '' + (-1 * options.d) + 'i*' + Math.sqrt(-tmp);
        x2 = '' + (-1 * options.d) + 'i*' - Math.sqrt(-tmp);
      }
      else {
        x1 = -1 * options.d + Math.sqrt(tmp);
        x2 = -1 * options.d - Math.sqrt(tmp);
      }
      break;
  }

  // Remove unnecessary '+0' terms and '+-' operators.
  plainText = plainText.replace(/\+0x/g, '');
  plainText = plainText.replace(/\+0/g, '');
  plainText = plainText.replace(/\+\-/g, '-');
  latex = latex.replace(/\+0/g, '');
  latex = latex.replace(/\+\-/g, '-');
  latex = latex.replace(/\+\\frac\{\-/g, '-\\frac{');
  return {
    zeroExpression : zeroExpression,
    plainText : plainText,
    latex : latex,
    x1 : x1,
    x2 : x2,
  }
}

q.questionElements = function(parameters) {
  return {
    label : 'Hitta lösningarna för den här ekvationen, om det finns några.  ',
    expression : gash.math.latex2image(parameters.latex).setTitle(parameters.plainText),
  };
}

q.questionToString = function(parameters) {
  return parameters.plainText;
}

q.answerElements = function(parameters) {
  var app = UiApp.getActiveApplication();
  return {
    help : 'Du kan skriva exempelvis sqrt(22) för att få √22.  ',
    l1 : gash.math.latex2image('x_1 ='),
    x1 : app.createTextBox().setFocus(true),
    break1 : '<br/>',
    l2 : gash.math.latex2image('x_2 ='),
    x2 : app.createTextBox(),
    break2 : '<br/>',
    double : app.createCheckBox('Det finns bara en lösning (en dubbelrot).'),
    break3 : '<br/>',
    nonreal : app.createCheckBox('Det finns inga reella lösningar.'),
  };
};

q.answerToString = function(parameters, input) {
  if (input.nonreal == 'true') {
    return 'Det finns inga reella lösningar.';
  }
  if (input.double == 'true') {
    return input.x1 + ' (dubbelrot)';
  }
  return 'x1=' + input.x1 + '; x2=' + input.x2;
}

q.evaluateAnswer = function(parameters, input) {
  var x1string = '' + parameters.x1;
  if (input.nonreal == 'true') {
    if (x1string.indexOf('i') == -1) {
      return {
        code : waxon.INCORRECT,
        message : 'Det finns reella lösningar till ekvationen.'
      };
    }
    else {
      return waxon.CORRECT;
    }
  }
  else {
    if (x1string.indexOf('i') > -1) {
      return {
        code : waxon.INCORRECT,
        message : 'Det finns inga reella lösningar till ekvationen.'
      };
    }
  }
  var x1 = gash.algebra.evaluate(input.x1);
  var x2 = gash.algebra.evaluate(input.x2);
  var zero1 = gash.algebra.evaluate(parameters.zeroExpression, {x : x1});
  if (zero1 == undefined) {
    return {
      code : waxon.CANNOT_INTERPRET,
      message : 'Ditt värde på x1 kunde inte tolkas.'
    }
  }
  zero1 = zero1.toFixed(gash.math.PRECISION);

  if (input.double == 'true') {
    if (parameters.x1 == parameters.x2) {
      if (zero1 == 0)  {
        return waxon.CORRECT;
      }
      else {
        return {
          code : waxon.INCORRECT,
          message : 'Det är en dubbelrot, men du har inte hittat rätt  värde.'
        }
      }
    }
    else {
      return {
        code : waxon.INCORRECT,
        message : 'Det är inte en dubbelrot.'
      }
    }
  }
  if (x1 == x2) {
    return {
      code : waxon.INCORRECT,
      message : 'Du har angett samma lösning två gånger, men ekvationen har inte en dubbelrot.'
    }
  }

  var zero2 = gash.algebra.evaluate(parameters.zeroExpression, {x : x2});
  if (zero2 == undefined) {
    return {
      code : waxon.CANNOT_INTERPRET,
      message : 'Ditt värde på x2 kunde inte tolkas.'
    }
  }
  zero2 = zero2.toFixed(gash.math.PRECISION);
  if (zero1 == 0 && zero2 == 0) {
    return waxon.CORRECT;
  }
  if (zero1 == 0) {
    return {
      code : waxon.INCORRECT,
      message : 'Ditt värde på x1 stämmer, men inte på x2.'
    }
  }
  if (zero2 == 0) {
    return {
      code : waxon.INCORRECT,
      message : 'Ditt värde på x2 stämmer, men inte på x1.'
    }
  }
  return {
    code : waxon.INCORRECT,
    message : 'Varken x1 eller x2 stämmer, tyvärr.'
  }
};

q.helpElements = function(parameters) {
  return {
    help1 : 'Genomgång om andragradsekvationer:  ',
    link1 : 'https://www.youtube.com/watch?v=9DpZeP1t0c4  ',
    help2 : 'Tre recept för att lösa andragradsekvationer:  ',
    link2 : 'http://tinyurl.com/andragradsekvationer  ',
    help3 : 'Lösa ekvationer med nollproduktmetoden:  ',
    link3 : 'https://www.youtube.com/watch?v=AJ8rJ8PgRbM  '
  };
}

q.tests = {
  basics : function() {
    var options = {
      form : 'square',
      a : 2,
      b : 12,
      c : 19,
      d : 3,
      e : 1,
      k : -1,
      allowIrrational : true,
      allowComplex : true
    };
    if (waxon.questions.quadraticEquationsBase.generateParameters(options).plainText != '2(x+3)²+1=-1') {
      throw 'Square equations are not built properly.';
    }
    options.form = 'standard';
    if (waxon.questions.quadraticEquationsBase.generateParameters(options).plainText != '2x²+12x+19=-1') {
      throw 'Square equations are not built properly.';
    }
    options = {
      form : 'square',
      a : 1,
      d : 3,
      e : 1,
      k : 5,
      allowIrrational : false,
      allowComplex : false
    }
    if (waxon.questions.quadraticEquationsBase.generateParameters(options).x1 != -1 || waxon.questions.quadraticEquationsBase.generateParameters(options).x2 != -5) {
      throw 'Solutions are not built properly. (square form)';
    }
    options = {
      form : 'standard',
      a : -1,
      b : 1,
      c : 0,
      k : 0,
      allowIrrational : false,
      allowComplex : false
    }
    if (waxon.questions.quadraticEquationsBase.generateParameters(options).x1 != 1 || waxon.questions.quadraticEquationsBase.generateParameters(options).x2 != 0) {
      throw 'Solutions are not built properly. (standard form)';
    }
  },
  disallowComplex : function() {
    var options = {
      form : 'square',
      a : 2,
      d : 3,
      e : 1,
      k : -1,
      allowIrrational : true,
      allowComplex : false
    };
    if (waxon.questions.quadraticEquationsBase.generateParameters(options).plainText == '2(x+3)²+1=-1') {
      throw 'Nonreal solutions are not altered.';
    }
  },
  disallowIrrational : function() {
    options = {
      form : 'square',
      a : 1,
      d : 3,
      e : 1,
      k : 4,
      minSolution : 0,
      maxSolution : 0,
      maxDenominator : 5,
      allowIrrational : false,
      allowComplex : false
    }
    var parameters = waxon.questions.quadraticEquationsBase.generateParameters(options);
    if (parameters.plainText == '(x+3)²+1=4') {
      throw 'Irrational solutions are not altered properly.';
    }
    if (parameters.x1 * options.maxDenominator != parseInt(parameters.x1 * options.maxDenominator) || parameters.x2 * options.maxDenominator != parseInt(parameters.x2 * options.maxDenominator)) {
      throw 'Irrational solutions are rebuilt to rational solutions.';
    }
  },
  removeUnnecessaryStuff : function() {
    options = {
      form : 'square',
      a : -1/2,
      d : -2/3,
      e : 0,
      k : -1/2,
      allowIrrational : true,
      allowComplex : true
    }
    if (waxon.questions.quadraticEquationsBase.generateParameters(options).plainText != '-1/2(x-2/3)²=-1/2') {
      throw 'Zero terms and +- operators are not processed properly.';
    }
  }
};
