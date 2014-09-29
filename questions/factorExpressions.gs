/**
 * @file: Question type for factoring algebraic expressions using common factors,
 * squares and difference of squares.
 */
var q = new waxonQuestion('factorExpressionsBase');

q.title = 'Faktorisera algebraiska uttryck';

q.dependencies = {
  math : {apiVersion : 1, subVersion : 2},
  algebra : {apiVersion : 1, subVersion : 1},
  utils : {apiVersion : 1, subVersion : 2},
};

q.defaults = new configObject({
  'type' : gash.utils.randomSelect({commonFactor : 1, binomial : 2, square : 2, conjugate : 1, conjugateReversed : 1}),
  'min' : -2,
  'max' : 8,
  'maxExponent' : 3,
  'maxDenominator' : 1,
  'variable' : gash.utils.randomSelect({x : 4, y : 1, t : 1, s : 1})
});

q.generateParameters = function(options) {
  options = this.defaults.overwriteWith(options);

  var a = options.a || gash.utils.randomInt(options.min, options.max, [0]);
  var b = options.b || gash.utils.randomInt(options.min, options.max, [0]);
  var c = options.c || gash.utils.randomInt(options.min, options.max, [0, a, -a]);
  var d = options.d || gash.utils.randomInt(options.min, options.max, [0, b, -b]);
  var exp = options.exp || gash.utils.randomInt(2, options.maxExponent);
  var exp2 = options.exp2 || gash.utils.randomInt(1, exp - 1);
  var terms, factor1, factor2;
  switch (options.type) {
    case 'commonFactor' :
      terms = [
        gash.math.findFraction(a).noOnes + options.variable + '^' + exp,
        gash.math.findFraction(b).noOnes + options.variable
      ];
      if (exp2 != 1) {
        terms[1] += '^' + exp2;
      }
      factor1 = '' + gash.math.gcd(a, b) + options.variable + '^' + exp2;
      factor2 = '(' + (a / gash.math.gcd(a, b)) + options.variable + '^' + (exp - exp2) + '+' + (b / gash.math.gcd(a, b)) + ')';
      break;
    case 'square' :
      // Tweak to remove any common denominator from the term coefficients.
      d = Math.abs(gash.math.gcd(a, b));
      a = a / d;
      b = b / d;
      terms = [
        gash.math.findFraction(a * a).noOnes + options.variable + '^2',
        gash.math.findFraction(2 * a * b).noOnes + options.variable,
        b * b
      ];
      factor1 = '(' + gash.math.randomBinomial(undefined, undefined, {a : a, b : b, variable : options.variable, mode : 'straight'}).expression + ')';
      factor2 = factor1;
      break;
    case 'conjugate' :
      // Tweak to remove any common denominator from the term coefficients.
      d = Math.abs(gash.math.gcd(a, b));
      a = a / d;
      b = b / d;
      terms = [
        gash.math.findFraction(a * a).noOnes + options.variable + '^2',
        '-' + (b * b)
      ];
      factor1 = '(' + gash.math.randomBinomial(undefined, undefined, {a : a, b : b, variable : options.variable, mode : 'straight'}).expression + ')';
      factor2 = '(' + gash.math.randomBinomial(undefined, undefined, {a : a, b : -b, variable : options.variable, mode : 'straight'}).expression + ')';
      break;
    case 'conjugateReversed' :
      // Tweak to remove any common denominator from the term coefficients.
      d = Math.abs(gash.math.gcd(a, b));
      a = a / d;
      b = b / d;
      terms = [
        b * b,
        '-' + gash.math.findFraction(a * a).noOnes + options.variable + '^2'
      ];
      factor1 = '(' + gash.math.randomBinomial(undefined, undefined, {a : a, b : b, variable : options.variable, mode : 'straight'}).expression + ')';
      factor2 = '(' + gash.math.randomBinomial(undefined, undefined, {a : -a, b : b, variable : options.variable, mode : 'straight'}).expression + ')';
      break;
    case 'binomial' :
      // Tweak to remove any common denominator from the term coefficients.
      var a1 = a * c;
      var a2 = a * d + b * c;
      var a3 = b * d;
      d = Math.min(Math.abs(gash.math.gcd(a1, a2)), Math.abs(gash.math.gcd(a2, a3)), Math.abs(gash.math.gcd(a3, a1)));
      terms = [
        gash.math.findFraction(a1 / d).noOnes + options.variable + '^2',
        gash.math.findFraction(a2 / d).noOnes + options.variable,
        a3 / d
      ];
      break;
  }
  var expression = gash.utils.shuffleArray(terms).join('+');
  var latex = expression;

  return {
    expression : expression,
    latex : latex,
    factor1 : factor1,
    factor2 : factor2,
    variable : options.variable,
    type : options.type
  };
}

q.questionElements = function(parameters) {
  return {
    label : 'Faktorisera följande uttryck. Använd gemensam faktor, kvadreringsregeln eller konjugatregeln.  ',
    latex : gash.math.latex2image(parameters.latex),
  }
};

q.questionToString = function(parameters) {
  return 'Faktorisera ' + parameters.expression;
}

q.answerElements = function(parameters) {
  var app = UiApp.getActiveApplication();
  var latexHandler = app.createServerHandler('showLatex');
  var factor1 = app.createTextBox().setName('factor1').setFocus(true).addKeyUpHandler(latexHandler);
  var factor2 = app.createTextBox().setName('factor2').addKeyUpHandler(latexHandler);
  latexHandler.addCallbackElement(factor1).addCallbackElement(factor2);
  return {
    factor1 : factor1,
    between : '·',
    factor2 : factor2,
    inputLatex : app.createHorizontalPanel().setId('inputLatex'),
    cannot : app.createCheckBox('Uttrycket kan inte faktoriseras med gemensam faktor, kvadrat eller konjugat.'),
  }
};

function showLatex(eventInfo) {
  var app = UiApp.getActiveApplication();
  var panel = app.getElementById('inputLatex').clear();
  panel.add(gash.math.latex2image(eventInfo.parameter.factor1 + '*' + eventInfo.parameter.factor2, {latexFont : '\\fn_cs'}));
  return app;
}

q.answerToString = function(parameters, input) {
  if (input.cannot == 'true') {
    return 'Kan inte faktoriseras med gemensam faktor, kvadrat eller konjugat.';
  }
  else {
    return input.factor1 + '*' + input.factor2;
  }
}

q.evaluateAnswer = function(parameters, input) {
  // Easiest check: If we have a binomial, we don't have a way (in this exercise) to factor the expression.
  if (input.cannot == 'true') {
    if (parameters.type == 'binomial') {
      return waxon.CORRECT;
    }
    else {
      return waxon.INCORRECT;
    }
  }

  // If the expression is algebraically different than the original one, the answer is simply wrong.
  var result = gash.algebra.compareExpressions(parameters.expression, input.factor1 + '*' + input.factor2, parameters.variable);
  if (result != waxon.CORRECT) {
    if (input.factor1.indexOf('(') == -1 && input.factor2.indexOf('(') == -1) {
      return {
        code : result,
        message : 'Har du kanske glömt parenteser?'
      }
    }
    return {
      code : result,
      message : 'Du kan alltid multiplicera ihop faktorerna för att testa ditt svar.'
    }
  }

  // Check to see if the two factors match the original ones. This is sort of complicated by the fact that
  // negative signs may move between the factors, and that we don't know which order they are written in.
  // Luckily, it is helped by the fact that if one factor is correct, the other one must be correct too.
  if (
    gash.algebra.compareExpressions(parameters.factor1, input.factor1, parameters.variable) == waxon.CORRECT
  ||
    gash.algebra.compareExpressions(parameters.factor1, '-1' + input.factor1, parameters.variable) == waxon.CORRECT
  ||
    gash.algebra.compareExpressions(parameters.factor1, input.factor2, parameters.variable) == waxon.CORRECT
  ||
    gash.algebra.compareExpressions(parameters.factor1, '-1' + input.factor2, parameters.variable) == waxon.CORRECT) {
      return waxon.CORRECT;
  }
  else {
    return {
      code : waxon.CLOSE,
      message : 'Ditt uttryck är lika med uttrycket i frågan, men verkar inte vara helt faktoriserat.'
    }
  }

  return result;
};

q.helpElements = function(parameters) {
  return {
    label1 : 'Parentesmultiplikation  ',
    link1 : ' http://youtu.be/ygC0RkAEQNk  ',
    label2 : 'Kvadreringsreglerna  ',
    link2 : 'http://youtu.be/22DXw-2K9Ug  ',
    label3 : 'Konjugatregeln  ',
    link3 : 'http://youtu.be/2nWTYbyYFeI  ',
  };
  return {};
}

q.tests = {
  correctBuild : function() {
    var parameters = waxon.questions.factorExpressionsBase.generateParameters({
      type : 'conjugate',
      variable : 'x',
      a : 1,
      b : 4
    });
    if (parameters.expression != 'x^2+-16' && parameters.expression != '-16+x^2') {
      throw 'Parameters are not built correctly.';
    }
    var parameters = waxon.questions.factorExpressionsBase.generateParameters({
      type : 'binomial',
      variable : 'x',
      a : -1,
      b : 8,
      c : 8,
      d : 6
    });
    if (parameters.expression.indexOf('29x') == -1) {
      throw 'Avoiding common denominators in binomials does not work properly.';
    }
  },
  correctEvaluation : function() {
    var parameters = waxon.questions.factorExpressionsBase.generateParameters({
      type : 'conjugate',
      variable : 'x',
      a : 1,
      b : 4
    });
    var input = {factor1 : '(x+4)', factor2 : '(x-4)'};
    if (waxon.questions.factorExpressionsBase.evaluateAnswer(parameters, input) != waxon.CORRECT) {
      throw 'Correct answer is not evaluated as correct (conjugate).';
    }
    var input = {factor1 : '(-x+4)', factor2 : '(-x-4)'};
    if (waxon.questions.factorExpressionsBase.evaluateAnswer(parameters, input) != waxon.CORRECT) {
      throw 'Evaluataion does not accept negative flips.';
    }
  }
};
