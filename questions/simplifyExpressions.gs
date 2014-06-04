/**
 * @file: Question for training simplifying algebraic expressions,
 * including parentheses.
 */
var simplifyExpressions = new waxonQuestion('simplifyExpressions');

simplifyExpressions.title = 'Förenkla algebraiska uttryck';

simplifyExpressions.generateParameters = function(options) {
  var possibleModes = [
    'a()+b()',
    'a()+()',
    '()+b()'
  ];
  var a = waxonUtils.randomInt(-3, 3, [0]);
  var b = waxonUtils.randomInt(-3, 3, [0]);
  if (a == 1) {
    a = '';
  }
  if (b == 1) {
    b = '+';
  }
  else if (b == -1) {
    b = '-';
  }
  else if (b > 0) {
    b = '+' + b;
  }

  switch (waxonUtils.randomSelect(possibleModes)) {
    case 'a()+b()' :
      expression = a + '(' + waxonUtils.randomBinomial() + ')' + b + '(' + waxonUtils.randomBinomial() + ')';
      break;
    case 'a()+()' :
      expression = a + '(' + waxonUtils.randomBinomial() + ')+' + waxonUtils.randomBinomial();
      break;
    case '()+b()' :
      expression = waxonUtils.randomBinomial() + b + '(' + waxonUtils.randomBinomial() + ')';
      break;
  }
  return {
    expression : expression,
  };
};

simplifyExpressions.questionElements = function(parameters) {
  var app = UiApp.getActiveApplication();
  var label = app.createLabel('Utveckla och förenkla följande uttryck.');
  var expression = waxonUtils.latex2image(parameters.expression);
  return {
    label : label,
    expression : expression,
  }
};

simplifyExpressions.evaluateAnswer = function(parameters, input) {
  var result = waxonUtils.compareExpressions(parameters.expression, input.answer);

  if (waxonUtils.numberOfTerms(input.answer) > 2) {
    return {
      code : Math.min(result, -3),
      message : 'Ditt uttryck har fler än två termer. Se om du kan förenkla det (eller om du räknat fel).',
    };
  }

  return result;
};
