/**
 * @file: Question type for multiplying binomials, including a prefixed coefficient,
 * rational binomial coefficients, and options for generating squares and differences
 * of squares.
 */
var q = new waxonQuestion('multiplyingBinomialsBase');

q.title = 'Multiplicera parentesuttryck';

q.dependencies = {
  math : {apiVersion : 1, subVersion : 1},
  algebra : {apiVersion : 1, subVersion : 1},
};

q.defaults = new configObject({
  'type' : gash.utils.randomSelect({binomial : 2, square : 1, conjugate : 1}),
  'min' : -3,
  'max' : 3,
  'maxDenominator' : 3,
  'a' : gash.utils.randomInt(-6, 6, [0]) / 2,
  'variable' : gash.utils.randomSelect({x : 4, y : 1, t : 1, s : 1})
});

q.generateParameters = function(options) {
  options = this.defaults.overwriteWith(options);
  var a = options.a;

  var expression = '', plainText = '', latex = '';
  // Load any coefficients from the options, then build the first binomial.
  options.a = options.a1;
  options.b = options.b1;
  var bin1 = gash.math.randomBinomial(options.min, options.max, options);
  // Do the same with the second binomial.
  options.a = options.a2;
  options.b = options.b2;
  var bin2 = gash.math.randomBinomial(options.min, options.max, options);
  // If the expression should be a conjugate, we need to adjust the second binomial.
  if (options.type == 'conjugate') {
    if (bin1.expression.indexOf('-') > -1) {
      bin2.expression = bin1.expression.replace('-', '+');
      bin2.latex = bin1.latex.replace('-', '+');
    }
    else {
      bin2.expression = bin1.expression.replace('+', '-');
      bin2.latex = bin1.latex.replace('+', '-');
    }
  }

  switch (options.type) {
    case 'binomial' :
    case 'conjugate' :
      expression = a + '(' + bin1.expression + ')*(' + bin2.expression + ')';
      plainText = '(' + bin1.plainText + ')*(' + bin2.plainText + ')';
      latex = gash.math.latexFraction(a, {skipOnes : true}) + '\\left (' + bin1.latex + '\\right )\\left (' + bin2.latex + '\\right )';
      break;
    case 'square' :
      expression = a + '(' + bin1.expression + ')*(' + bin1.expression + ')';
      plainText = '(' + bin1.plainText + ')²';
      latex = gash.math.latexFraction(a, {skipOnes : true}) + '\\left (' + bin1.latex + '\\right )^2';
      break;
  }
  a = gash.math.findFraction(a, options.maxDenominator);
  plainText = a.noOnes + plainText;

  return {
    expression : expression,
    plainText : plainText,
    latex : latex,
    variable : options.variable,
  };
}

q.questionElements = function(parameters) {
  return {
    label : 'Utveckla följande uttryck.  ',
    latex : gash.math.latex2image(parameters.latex),
  }
};

q.questionToString = function(parameters) {
  return 'Utveckla ' + parameters.plainText;
}

q.evaluateAnswer = function(parameters, input) {
  var result = gash.algebra.compareExpressions(parameters.expression, input.answer, parameters.variable);

  if (input.answer.indexOf('(') > -1) {
    return {
      code : Math.min(result, waxon.WRONG_FORM),
      message : 'Utvecklade uttryck bör inte innehålla parenteser.',
    };
  }
  if (gash.math.numberOfTerms(input.answer) > 3 ) {
    return {
      code : Math.min(result, waxon.WRONG_FORM),
      message : 'Ditt uttryck har fler än tre termer. Se om du kan förenkla det (eller om du räknat fel).',
    };
  }
  if (input.answer.indexOf(parameters.variable + '^2') == -1) {
    return {
      code : waxon.WRONG_FORM,
      message : 'Ditt uttryck innehåller ingen ' + parameters.variable + '^2-term, och kan därför inte vara rätt svar.',
    };
  }
  var pattern = new RegExp('[' + parameters.variable + ']', 'g');
  if (input.answer.match(pattern).length > 2) {
    return {
      code : waxon.WRONG_FORM,
      message : 'Ditt uttryck har för många termer som innehåller ' + parameters.variable + '. Förenkla uttrycket!',
    };
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
    var parameters = waxon.questions.multiplyingBinomialsBase.generateParameters({
      type : 'binomial',
      variable : 'x',
      a : 1,
      a1 : 3,
      b1 : 0.5,
      a2 : -1,
      b2 : 1,
      mode : 'straight'
    });
    if (parameters.plainText != '(3x+1/2)*(-x+1)') {
      throw 'Parameters are not built correctly.';
    }
  },
  correctEvaluation : function() {
    var parameters = waxon.questions.multiplyingBinomialsBase.generateParameters({
      type : 'binomial',
      variable : 'x',
      a : 1,
      a1 : 3,
      b1 : 0.5,
      a2 : -1,
      b2 : 1,
      mode : 'straight'
    });
    var input = {answer : '-3x^2+2,5x+1/2'};
    if (waxon.questions.multiplyingBinomialsBase.evaluateAnswer(parameters, input) != waxon.CORRECT) {
      throw 'Correct answer is not evaluated as correct.';
    }
    input = {answer : '2,5x+1/2-3x^2'};
    if (waxon.questions.multiplyingBinomialsBase.evaluateAnswer(parameters, input) != waxon.CORRECT) {
      throw 'Reordering correct terms confuses the evaluation.';
    }
    input = {answer : '2,5x+1/2-3x^2'};
    if (waxon.questions.multiplyingBinomialsBase.evaluateAnswer(parameters, input) != waxon.CORRECT) {
      throw 'Reordering correct terms confuses the evaluation.';
    }
    input = {answer : '2,5x+0.49-3x^2'};
    if (waxon.questions.multiplyingBinomialsBase.evaluateAnswer(parameters, input) == waxon.CORRECT) {
      throw 'Wrong answer is evaluated as correct.';
    }
  }
};
