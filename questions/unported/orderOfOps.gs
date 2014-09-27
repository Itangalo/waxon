/**
 * @file: waxon question for training order of operations.
 */

var orderOfOps = new waxonQuestion('orderOfOps');
orderOfOps.title = 'Prioriteringsregler';

orderOfOps.generateParameters = function(options) {
  // The different cases of expressions to evaluate. These are hand-selected
  // to expose left-to-right calucators.
  var expressionType = waxonUtils.randomSelect(options.expressionType || {
    'a±b*c' : 2, // This is the default case
    'a±b/c' : 2,
    'a±b^c' : 1,
    'a*b^c' : 1,
  });
  var expression = '';
  var a, b, c, op1, op2;

  switch (expressionType) {
    case 'a±b/c' :
      op1 = waxonUtils.randomSelect(['+', '-']);
      op2 = '/';
      c = waxonUtils.randomInt(2, 3, 4);
      a = c * waxonUtils.randomInt(-3, 3, [0]);
      b = c * waxonUtils.randomInt(-3, 3, [0]);
      break;
    case 'a±b^c' :
      op1 = waxonUtils.randomSelect(['+', '-']);
      op2 = '^';
      a = waxonUtils.randomInt(1, 3);
      b = waxonUtils.randomInt(-3, 3, [-1, 0, 1]);
      // Remove the case of negative numbers and subtraction.
      if (op1 == '-') {
        b = Math.abs(b);
      }
      c = waxonUtils.randomInt(2, 3);
      break;
    case 'a*b^c' :
      op1 = '*';
      op2 = '^';
      a = waxonUtils.randomInt(-3, 3, [-1, 0, 1]);
      b = waxonUtils.randomInt(2, 3);
      c = waxonUtils.randomInt(2, 3);
      break;
    case 'a±b*c' :
    default :
      op1 = waxonUtils.randomSelect(['+', '-']);
      op2 = '*';
      a = waxonUtils.randomInt(-3, 3, [0]);
      b = waxonUtils.randomInt(-3, 3, [0]);
      c = waxonUtils.randomInt(-3, 3, [0]);
      break;
  }

  if (options.positive) {
    a = Math.abs(a);
    b = Math.abs(b);
    c = Math.abs(c);
  }
  if (a < 0) {
    a = '(' + a + ')';
  }
  if (b < 0) {
    b = '(' + b + ')';
  }
  if (c < 0) {
    c = '(' + c + ')';
  }

  return {
    expression : a + op1 + b + op2 + c,
  };
};

orderOfOps.questionElements = function(parameters) {
  var app = UiApp.getActiveApplication();
  return {
    label : app.createLabel('Beräkna det här uttrycket.'),
    expression : waxonUtils.latex2image(parameters.expression),
  }
};

orderOfOps.questionToString = function(parameters) {
  return parameters.expression;
}

orderOfOps.evaluateAnswer = function(parameters, input) {
  // The answer shouldn't have any decimals in it. The replacement is there just in case.
  var answer = parseFloat(input.answer.replace(',', '.'));
  var correct = waxonUtils.evaluate(parameters.expression);

  if (answer == correct) {
    return 1;
  }
  else {
    return -1;
  }
};
