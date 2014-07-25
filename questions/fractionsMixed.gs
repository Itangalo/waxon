var fractionsMixed = new waxonQuestion('fractionsMixed');

// This parameter generation allows specifying the operation to use. If not
// specified, it will be randomly chosen from the four standard operations.
fractionsMixed.generateParameters = function(options) {
  var operation = waxonUtils.randomSelect(options.operations || ['+', '-', '*', '/']);
  var a = options.a || waxonUtils.randomInt(-10, 10, [0]);
  if (options.positive == true) {
    a = Math.abs(a);
  }
  var b = options.b || waxonUtils.randomInt(1, 10, [a]);
  var c = options.c || waxonUtils.randomInt(-10, 10, [0]);
  if (options.positive == true) {
    c = Math.abs(c);
  }
  var d = options.d || waxonUtils.randomInt(1, 10, [b, c]);
  return {
    operation : operation,
    a : a,
    b : b,
    c : c,
    d : d,
    expression : '(' + a + '/' + b + ')' + operation + '(' + c + '/' + d + ')',
  };
}

fractionsMixed.questionElements = function(parameters) {
  var app = UiApp.getActiveApplication();
  if (parameters.operation == '*') {
    parameters.operation = '\\cdot ';
  }

  var text = app.createLabel('Beräkna och förenkla så långt som möjligt:');
  var expression = waxonUtils.latex2image('\\frac{' + parameters.a + '}{' + parameters.b + '}' + parameters.operation + '\\frac{' + parameters.c + '}{' + parameters.d + '}');
  return {
    text : text,
    expression : expression,
  }
};

fractionsMixed.questionToString = function(parameters) {
  return parameters.expression;
}

fractionsMixed.evaluateAnswer = function(parameters, input) {
  var response, n, d;

  // Parse the answer to get nominator and denominator.
  answer = input.answer.split('/');
  if (answer.length == 1) {
    answer[1] = 1;
  }
  else if (answer.length > 2) {
    return {
      code : -2,
      message : 'Ditt svar är inte ett bråktal.',
    }
  }
  n = parseFloat(answer[0]);
  d = parseFloat(answer[1]);

  if (n != n.toFixed(0) || d != d.toFixed(0)) {
    return {
      code : -2,
      message : 'Täljare och nämnare måste vara heltal i förkortade bråktal.',
    }
  }

  if (d < 0) {
    return {
      code : -2,
      message : 'Nämnaren måste vara positiv i förkortade bråktal.',
    }
  }

  if (waxonUtils.evaluate(input.answer, undefined, ['/']) == undefined) {
    Logger.log(input.answer);
    return {
      code : -2,
      message : 'Ditt svar är inte ett bråktal.',
    }
  }
  if (waxonUtils.compareExpressions(parameters.expression, input.answer) == false) {
    return {
      code : -1,
      message : 'Svaret stämmer inte, tyvärr.',
    }
  }

  if (Math.abs(waxonUtils.gcd(answer[0], answer[1])) != 1) {
    return {
      code : 0,
      message : 'Ditt svar är korrekt, men inte förkortat så långt som möjligt.',
    }
  }

  return 1;
};
