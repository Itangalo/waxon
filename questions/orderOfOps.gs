/**
 * @file: waxon question for training order of operations.
 */

var orderOfOps = new waxonQuestion('orderOfOps');
orderOfOps.title = 'Prioriteringsregler';

orderOfOps.generateParameters = function() {
  // The different cases of expressions to evaluate. These are hand-selected
  // to expose left-to-right calucators.
  var expressionTypes = {
    'a+b*c' : 2,
    'a+b/c' : 2,
    'a+b^c' : 1,
    'a*b^c' : 1,
  };
  var expression = '';
  var a, b, c, op1, op2;

  switch (waxonUtils.randomSelect(expressionTypes)) {
    case 'a+b*c' :
      op1 = waxonUtils.randomSelect(['+', '-']);
      op2 = '*';
      a = waxonUtils.randomInt(-3, 3, [0]);
      b = waxonUtils.randomInt(-3, 3, [0]);
      c = waxonUtils.randomInt(-3, 3, [0]);
      break;
    case 'a+b/c' :
      op1 = waxonUtils.randomSelect(['+', '-']);
      op2 = '/';
      c = waxonUtils.randomInt(2, 3, 4);
      a = c * waxonUtils.randomInt(-3, 3, [0]);
      b = c * waxonUtils.randomInt(-3, 3, [0]);
      break;
    case 'a+b^c' :
      op1 = waxonUtils.randomSelect(['+', '-']);
      op2 = '^';
      a = waxonUtils.randomInt(1, 3);
      b = waxonUtils.randomInt(-3, 3, [-1, 0, 1]);
      c = waxonUtils.randomInt(2, 3);
      break;
    case 'a*b^c' :
      op1 = '*';
      op2 = '^';
      a = waxonUtils.randomInt(-3, 3, [-1, 0, 1]);
      b = waxonUtils.randomInt(2, 3);
      c = waxonUtils.randomInt(2, 3);
      break;
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

orderOfOps.evaluateAnswer = function(parameters, input) {
  // The answer shouldn't have any decimals in it. The replacement is there just in case.
  var answer = parseFloat(input.answer.replace(',', '.'));
  var correct = Parser.parse(waxonUtils.preParseExpression(parameters.expression)).evaluate();

  if (answer == correct) {
    return 1;
  }
  else {
    return -1;
  }
};
