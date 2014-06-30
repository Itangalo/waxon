/**
 * @file: waxon question for calculating with negative numbers.
 */

var negativeMixed = new waxonQuestion('negativeMixed');
negativeMixed.title = 'Räkning med negativa tal';

negativeMixed.generateParameters = function() {
  // Build two random integers, where at least the first one is negative. Also
  // select an operation on random.
  var a = waxonUtils.randomInt(-2, -5);
  var b = waxonUtils.randomInt(-6, 6, [0, a]);
  var op = waxonUtils.randomSelect(['+', '-', '*', '/', '^']);

  // Special treatment if the operator is 'to the power of'.
  if (op == '^') {
    b = waxonUtils.randomInt(2, 3);
    if (b = 3) {
      a = waxonUtils.randomInt(-1, -3);
    }
  }
  // Special treatment if the operator is division, to avoid fractions.
  if (op == '/') {
    b = a * waxonUtils.randomInt(-1, 1, [0]);
    a = b * waxonUtils.randomInt(-4, 4, [-1, 0, 1]);
    if (a > 0 && b > 0) {
      a = -a;
    }
  }

  // Add parenthesis around negative numbers.
  if (b < 0) {
    b = '(' + b + ')';
  }
  if (a < 0) {
    a = '(' + a + ')';
  }

  return {
    expression : a + op + b,
  };
};

negativeMixed.questionElements = function(parameters) {
  var app = UiApp.getActiveApplication();
  return {
    label : app.createLabel('Beräkna det här uttrycket.'),
    expression : waxonUtils.latex2image(parameters.expression),
  }
};

negativeMixed.questionToString = function(parameters) {
  return parameters.expression;
}

negativeMixed.evaluateAnswer = function(parameters, input) {
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
