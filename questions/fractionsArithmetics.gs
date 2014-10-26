/**
 * @file: Question type for arithmetics with fractions.
 */
var q = new waxonQuestion('fractionsArithmeticsBase');

q.title = 'Bråkräkning';
q.shortTitle = 'Bråkräkning';

q.dependencies = {
  math : {apiVersion : 1, subVersion : 6},
  algebra : {apiVersion : 1, subVersion : 1},
  utils : {apiVersion : 1, subVersion : 1},
};

q.defaults = new configObject({
  op : gash.utils.randomSelect({
    '+' : 3,
    '-' : 2,
    '*' : 2,
    '/' : 1,
  }),
  a : gash.math.randomFraction(0, 4, [0], 6),
  b : gash.math.randomFraction(0, 4, [0], 6),
  forceFraction : true,
  maxDenominator : 6,
});

q.generateParameters = function(options) {
  options = this.defaults.overwriteWith(options);
  if (options.forceFraction) {
    if (options.a.d == 1) {
      options.a = gash.math.findFraction(options.a + 1 / options.maxDenominator);
    }
    if (options.b.d == 1) {
      options.b = gash.math.findFraction(options.b + 1 / options.maxDenominator);
    }
  }

  options.plainText = '(' + options.a.plainText + ') ' + options.op + ' (' + options.b.plainText + ')';
  options.latex = gash.math.latexFraction(options.a.value) + options.op + gash.math.latexFraction(options.b.value);
  options.expression = options.plainText;

  return options;
};

q.questionElements = function(parameters) {
  return {
    label1 : 'Beräkna följande uttryck.  ',
    equation : gash.math.latex2image(parameters.latex),
    label2 : '<strong>Svara med ett bråk, förkortat så långt som möjligt</strong> (alternativt ett heltal).'
  };
};

q.questionToString = function(parameters) {
  return parameters.plainText;
};

q.evaluateAnswer = function (parameters, input) {
  var correctAnswer = gash.algebra.evaluate(parameters.expression);

  var answer = gash.algebra.evaluate(input.answer, {allowedOperators : ['/']});
  if (answer === undefined) {
    return {
      code : waxon.CANNOT_INTERPRET,
      message : 'Kunde inte förstå ditt svar. Svara med ett heltal eller ett bråk.',
    };
  }
  if (answer != correctAnswer) {
    return waxon.INCORRECT;
  }

  var parts = input.answer.split('/');
  if (parts.length == 1) {
    parts.push('1');
  }
  if (parts.length > 2) {
    return {
      code : waxon.WRONG_FORM,
      message : 'Ditt svar är inte ett giltigt bråk. Svara på formen "n/m" (alternativt ett heltal).',
    };
  }
  if (parts[0] != parseInt(parts[0]) || parts[1] != parseInt(parts[1])) {
    return {
      code : waxon.CLOSE,
      message : 'Ditt svar har rätt värde, men täljare och nämnare måste vara heltal.',
    };
  }
  if (Math.abs(gash.math.gcd(parts[0], parts[1])) != 1) {
    return {
      code : waxon.CLOSE,
      message : 'Ditt har rätt värde, men bråket är inte förkortat så långt som möjligt.',
    };
  }
  if (parts[1] < 0) {
    return {
      code : waxon.CLOSE,
      message : 'Ditt har rätt värde, men nämnaren bör vara positiv i förkortade bråk.',
    };
  }

  return waxon.CORRECT;
};

q.helpElements = function(parameters) {
  return {
    label1 : 'Bråkräkning med fyra räknesätt:  ',
    link1 : 'https://www.youtube.com/watch?v=a-jCK6Yphcw  ',
  };
};

q.tests = {
  basics : function() {
    var options = {
      op : '+',
      a : gash.math.findFraction(1 / 6),
      b : gash.math.findFraction(1 / 3),
    };
    var parameters = waxon.questions.fractionsArithmeticsBase.generateParameters(options);
    if (parameters.expression != '(1/6) + (1/3)') {
      throw 'Plain text expression is not built correctly.';
    }
    if (parameters.latex != '\\frac{1}{6}+\\frac{1}{3}') {
      throw 'Latex expression is not built correctly.';
    }
    var input = {
      answer : '1/2'
    };
    if (waxon.questions.fractionsArithmeticsBase.evaluateAnswer(parameters, input) != waxon.CORRECT) {
      throw 'Correct answer is evaluated as wrong.';
    }
    input = {
      answer : '0.5'
    };
    if (waxon.questions.fractionsArithmeticsBase.evaluateAnswer(parameters, input).code != waxon.CLOSE) {
      throw 'Non-fraction answer is not evaluated correctly.';
    }
    input = {
      answer : '3/6'
    };
    if (waxon.questions.fractionsArithmeticsBase.evaluateAnswer(parameters, input).code != waxon.CLOSE) {
      throw 'Improper fraction is not evaluated correctly.';
    }
    input = {
      answer : '4/3'
    };
    if (waxon.questions.fractionsArithmeticsBase.evaluateAnswer(parameters, input) != waxon.INCORRECT) {
      throw 'Incorrecrt answer is not evaluated correctly.';
    }
  }
};
