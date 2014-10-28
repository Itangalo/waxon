/**
 * @file: Question type for simplifying linear algebraic expressions.
 */
var q = new waxonQuestion('simplifyExpressionsBase');

q.title = 'Förenkla algebraiska uttryck';
q.shortTitle = 'Förenkla';

q.dependencies = {
  math : {apiVersion : 1, subVersion : 6},
  algebra : {apiVersion : 1, subVersion : 1},
  utils : {apiVersion : 1, subVersion : 1},
};

q.defaults = new configObject({
  type : gash.utils.randomSelect({
    'a()+b()' : 1,
    'a()+()' : 2,
    '()+b()' : 2
  }),
  min : -3,
  max : 3,
  variable : 'x',
  maxDenominator : 1
});

q.generateParameters = function(options) {
  options = this.defaults.overwriteWith(options);
  options.a = options.a || gash.utils.randomInt(options.min, options.max, [0]);
  options.b = options.b || gash.utils.randomInt(options.min, options.max, [0]);
  options.a1 = options.a1 || gash.utils.randomInt(options.min, options.max, [0]);
  options.b1 = options.b1 || gash.utils.randomInt(options.min, options.max, [0]);
  options.a2 = options.a2 || gash.utils.randomInt(options.min, options.max, [0]);
  options.b2 = options.b2 || gash.utils.randomInt(options.min, options.max, [0]);

  var options2 = {
    maxDenominator : options.maxDenominator,
    variable : options.variable,
    a : options.a1,
    b : options.b1,
    mode : options.mode,
  }
  var bin1 = gash.math.randomBinomial(options.min, options.max, options2);
  options2.a = options.a2;
  options2.b = options.b2;
  var bin2 = gash.math.randomBinomial(options.min, options.max, options2);

  var a = gash.math.findFraction(options.a, options.maxDenominator);
  var b = gash.math.findFraction(options.b, options.maxDenominator);
  var op = '+';
  if (b.value < 0) {
    var op = '';
  }
  var keepOnes = new configObject({maxDenominator : options.maxDenominator});
  var skipOnes = new configObject({maxDenominator : options.maxDenominator, skipOnes : true});

  switch (options.type) {
    case 'a()+b()' :
      options.expression = a.value + '*(' + bin1.plainText + ')+' + b.value + '*(' + bin2.plainText + ')';
      options.plainText = a.noOnes + '(' + bin1.plainText + ')' + op + b.noOnes + '(' + bin2.plainText + ')';
      options.latex = gash.math.latexFraction(a.value, skipOnes) + '\\left(' + bin1.latex + '\\right)' + op + gash.math.latexFraction(b.value, skipOnes) + '\\left(' + bin2.latex + '\\right)';
      break;
    case '()+b()' :
      options.expression = bin1.plainText + '+' + b.value + '*(' + bin2.plainText + ')';
      options.plainText = bin1.plainText + op + b.noOnes + '(' + bin2.plainText + ')';
      options.latex = bin1.latex + op + gash.math.latexFraction(b.value, skipOnes) + '\\left(' + bin2.latex + '\\right)';
      break;
    case 'a()+()' :
    default :
      options.expression = a.value + '*(' + bin1.plainText + ') + ' + bin2.plainText;
      options.plainText = a.noOnes + '(' + bin1.plainText + ') + ' + bin2.plainText;
      options.latex = gash.math.latexFraction(a.value, skipOnes) + '\\left(' + bin1.latex + '\\right)+' + bin2.latex;
      break;
  }

  return options;
};

q.questionElements = function(parameters) {
  return {
    label : 'Förenkla följande uttryck.  ',
    equation : gash.math.latex2image(parameters.latex),
  };
};

q.questionToString = function(parameters) {
  return parameters.plainText;
};

q.evaluateAnswer = function (parameters, input) {
  var value = gash.algebra.compareExpressions(parameters.expression, input.answer, parameters.variable);

  if (value == waxon.CANNOT_INTERPRET) {
    return {
      code : value,
      message : 'Kunde inte tolka ditt svar. Svara med ett uttryck som innehåller konstanter och variabeln ' + parameters.variable + '.',
    };
  }
  if (gash.math.numberOfTerms(input.answer) > 2) {
    return {
      code : waxon.WRONG_FORM,
      message : 'Ditt svar har mer än två termer. Det förenklade uttrycket bör som mest innehålla en konstant term och en term med variabeln ' + parameters.variable + '.',
    };
  }
  return value;
};

q.helpElements = function(parameters) {
  return {
    label1 : 'Förenkla algebraiska uttryck, version 1:  ',
    link1 : 'https://www.youtube.com/watch?v=zKXpZr_XcPk  ',
    label2 : 'Förenkla algebraiska uttryck, version 2:  ',
    link2 : 'https://www.youtube.com/watch?v=vPoDvK9LzhA  ',
  };
};

q.tests = {
  basics : function() {
    var options = {
      type : 'a()+b()',
      a : 1,
      b : -1,
      a1 : 2,
      b1 : 3,
      a2 : -1,
      b2 : -2,
      variable : 's',
      maxDenominator : 1,
      mode : 'straight',
    };
    var parameters = waxon.questions.simplifyExpressionsBase.generateParameters(options);
    if (parameters.plainText != '(2s+3)-(-s-2)') {
      throw 'Plain text expression is not built correctly.';
    }
    if (parameters.latex != '\\left(2s+3\\right)-\\left(-s-2\\right)') {
      throw 'Latex expression is not built correctly.';
    }
    var input = {
      answer : '5+3s'
    };
    if (waxon.questions.simplifyExpressionsBase.evaluateAnswer(parameters, input) != waxon.CORRECT) {
      throw 'Correct answer is evaluated as wrong.';
    }
    input = {
      answer : '5+2s+s'
    };
    if (waxon.questions.simplifyExpressionsBase.evaluateAnswer(parameters, input).code != waxon.WRONG_FORM) {
      throw 'Answer with three terms is not evaluated correctly. (Should be blocked.)';
    }
    options.type = 'a()+()';
    options.a = 4;
    parameters = waxon.questions.simplifyExpressionsBase.generateParameters(options);
    if (parameters.plainText != '4(2s+3) + -s-2') {
      throw 'Plain text expression is not built correctly in form a()+().';
    }
    options.type = '()+b()';
    parameters = waxon.questions.simplifyExpressionsBase.generateParameters(options);
    if (parameters.plainText != '2s+3-(-s-2)') {
      throw 'Plain text expression is not built correctly in form ()+b().';
    }
  }
};
