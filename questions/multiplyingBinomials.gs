/**
 * @file: Question type for multiplying binomials, including a prefixed coefficient,
 * rational binomial coefficients, and options for generating squares and differences
 * of squares.
 */
var q = new waxonQuestion('multiplyingBinomialsBase');

q.title = 'Multiplicera parentesuttryck';

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

  var expression = '', latex = '';
  var bin1 = gash.math.randomBinomial(options.min, options.max, options);
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
      expression = options.a + '(' + bin1.expression + ')*(' + bin2.expression + ')';
      latex = gash.math.latexFraction(options.a, {skipOnes : true}) + '\\left (' + bin1.latex + '\\right )\\left (' + bin2.latex + '\\right )';
      break;
    case 'square' :
      expression = options.a + '(' + bin1.expression + ')*(' + bin1.expression + ')';
      latex = gash.math.latexFraction(options.a, {skipOnes : true}) + '\\left (' + bin1.latex + '\\right )^2';
      break;
  }

  return {
    expression : expression,
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
  return 'Utveckla ' + parameters.expression;
}

q.evaluateAnswer = function(parameters, input) {
  var result = gash.algebra.compareExpressions(parameters.expression, input.answer, parameters.variable);

  if (gash.math.numberOfTerms(input.answer) > 3 ) {
    return {
      code : Math.min(result, waxon.WRONG_FORM),
      message : 'Ditt uttryck har fler än tre termer. Se om du kan förenkla det (eller om du räknat fel).',
    };
  }
  if (input.answer.indexOf('(') > -1) {
    return {
      code : Math.min(result, waxon.WRONG_FORM),
      message : 'Utvecklade uttryck bör inte innehålla parenteser.',
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


var t = q.tweak('multiplyingBinomials1');
t.title = 'Multiplicera parentesuttryck 1';
t.shortTitle = 'Parenteser 1';
t.defaults = new configObject({
  'type' : 'binomial',
  'min' : -3,
  'max' : 3,
  'maxDenominator' : 1,
  'a' : gash.utils.randomInt(-1, 1, [0]),
  'variable' : gash.utils.randomSelect({x : 4, y : 1, t : 1, s : 1})
});

var t = q.tweak('multiplyingBinomials2');
t.title = 'Multiplicera parentesuttryck 2';
t.shortTitle = 'Parenteser 2';
t.defaults = new configObject({
  'type' : gash.utils.randomSelect({binomial : 5, square : 1, conjugate : 3}),
  'min' : -3,
  'max' : 3,
  'maxDenominator' : 2,
  'a' : gash.utils.randomInt(-6, 6, [0]) / 2,
  'variable' : gash.utils.randomSelect({x : 4, y : 1, t : 1, s : 1})
});

var t = q.tweak('squaresAndConjugates1');
t.title = 'Kvadrerings- och konjugatreglerna 1';
t.shortTitle = 'Kvadrat och konjugat 1';
t.defaults = new configObject({
  'type' : gash.utils.randomSelect({binomial : 1, square : 3, conjugate : 3}),
  'min' : -3,
  'max' : 3,
  'maxDenominator' : 1,
  'a' : gash.utils.randomInt(-6, 6, [0]) / 2,
  'variable' : gash.utils.randomSelect({x : 4, y : 1, t : 1, s : 1})
});

var t = q.tweak('squaresAndConjugates2');
t.title = 'Kvadrerings- och konjugatreglerna 2';
t.shortTitle = 'Kvadrat och konjugat 2';
t.defaults = new configObject({
  'type' : gash.utils.randomSelect({binomial : 1, square : 3, conjugate : 3}),
  'min' : -10,
  'max' : 10,
  'maxDenominator' : 1,
  'a' : gash.utils.randomInt(-6, 6, [0]) / 2,
  'variable' : gash.utils.randomSelect({x : 4, y : 1, t : 1, s : 1})
});

var t = q.tweak('multiplyingBinomials3');
t.title = 'Blandad parentesmultiplikation';
t.shortTitle = 'Parentesmultiplikation';
t.defaults = new configObject({
  'type' : gash.utils.randomSelect({binomial : 2, square : 1, conjugate : 1}),
  'min' : -3,
  'max' : 3,
  'maxDenominator' : 2,
  'a' : gash.utils.randomInt(-6, 6, [0]) / 3,
  'variable' : gash.utils.randomSelect({x : 4, y : 1, t : 1, s : 1})
});
