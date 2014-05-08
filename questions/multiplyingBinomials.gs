/**
 * @file: Question for training multiplying binomials. Can be set to
 * train only expressions of the type (a+b)^2, (a-b)^2 or (a+b)(a-b).
 */
var multiplyingBinomials = new waxonQuestion('multiplyingBinomials');

multiplyingBinomials.generateParameters = function(option) {
  var possibleOptions = ['binomial', 'square', 'conjugate'];
  var b1, b2, a, c1, c2, k1, k2, op1 = '+', op2 = '+';
  if (possibleOptions.indexOf(option) == -1) {
    var option = possibleOptions[waxonUtils.randomInt(0, 2)];
  }

  a = waxonUtils.randomInt(-5, 5, [0]);
  c1 = waxonUtils.randomInt(-5, 5, [0]);
  k1 = waxonUtils.randomInt(-5, 5, [0]);

  switch(option) {
    case 'binomial':
      c2 = waxonUtils.randomInt(-5, 5, [0, c1]);
      k2 = waxonUtils.randomInt(-5, 5, [0]);
      break;
    case 'square':
      c2 = c1;
      k2 = k1;
      break;
    case 'conjugate':
      c2 = c1;
      k2 = -1*k1;
      break;
  }

  // Do some prettification of the expression, to avoid unnecessary numbers
  // and operators.
  if (a == 1) {
    a = '';
  }
  if (a == -1) {
    a = '-';
  }
  if (c1 == 1) {
    c1 = '';
  }
  if (c1 == -1) {
    c1 = '-';
  }
  if (c2 == 1) {
    c2 = '';
  }
  if (c2 == -1) {
    c2 = '-';
  }
  if (k1 < 0) {
    op1 = '-';
    k1 = -1*k1;
  }
  if (k2 < 0) {
    op2 = '-';
    k2 = -1*k2;
  }

  // Build the binomials to multiply.
  b1 = '(' + c1 + 'x' + op1 + k1 + ')';
  if (option == 'square') {
    b2 = '^2';
  }
  else {
    b2 = '(' + c2 + 'x' + op2 + k2 + ')';
  }

  return {
    expression : '' + a + b1 + b2,
  };
};

multiplyingBinomials.questionElements = function(parameters) {
  var app = UiApp.getActiveApplication();
  var label = app.createLabel('Utveckla följande uttryck.');
  var expression = waxonUtils.latex2image(parameters.expression);
  return {
    label : label,
    expression : expression,
  }
};

multiplyingBinomials.evaluateAnswer = function(parameters, input) {
  var result = waxonUtils.compareExpressions(parameters.expression, input.answer);
  return result;
};
