var fractionsMixed = new waxonQuestion('fractionsMixed');

// This parameter generation allows specifying the operation to use. If not
// specified, it will be randomly chosen from the four standard operations.
fractionsMixed.generateParameters = function(op) {
  var operations = ['+', '-', '*', '/'];
  var a = waxonUtils.randomInt(-10, 10, [0]);
  var b = waxonUtils.randomInt(1, 10, [a]);
  var c = waxonUtils.randomInt(-10, 10, [0]);
  var d = waxonUtils.randomInt(1, 10, [b, c]);
  return {
    operation : operations[op] || operations[waxonUtils.randomInt(0, 3)],
    a : a,
    b : b,
    c : c,
    d : d,
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
  
fractionsMixed.evaluateAnswer = function(parameters, input) {
  var denominator, nominator, gcd, response;
  var a = parameters.a;
  var b = parameters.b;
  var c = parameters.c;
  var d = parameters.d;

  // If we use subtraction, change variable and change operator.
  if (parameters.operation == '-') {
    c = -c;
    parameters.operation = '+';
  }
  // If we use division, swap variables and change operator.
  if (parameters.operation == '/') {
    c = d + (d=c, 0);
    parameters.operation = '*';
  }
  
  // Build the correct answer.
  if (parameters.operation == '+') {
    denominator = b * d;
    nominator = a * d + c * b;
    gcd = waxonUtils.gcd(nominator, denominator);
    denominator = denominator / gcd;
    nominator = nominator / gcd;
  }
  else if (parameters.operation == '*') {
    denominator = b * d;
    nominator = a * c;
    gcd = waxonUtils.gcd(nominator, denominator);
    denominator = denominator / gcd;
    nominator = nominator / gcd;
  }
  if (denominator < 0) {
    nominator = -nominator;
    denominator = -denominator;
  }

  // Parse the answer to get nominator and denominator.
  answer = input.answer.split('/');
  if (answer.length == 1) {
    answer[1] = 1;
  }
  else if (answer.length > 2) {
    return {
      result : -2,
      message : 'Ditt svar är inte ett bråktal.',
    }
  }
  answer.n = parseInt(answer[0]);
  answer.d = parseInt(answer[1]);
  
  if (answer.n == nominator && answer.d == denominator) {
    response = 1;
  }
  else if (waxonUtils.gcd(answer.d, answer.n) == -1) {
    response = {
      result : 0,
      message : 'Ditt svar är korrekt, men du bör undvika negativa tal i nämnaren.',
    };
  }
  else if ((answer.n / answer.d) == (nominator / denominator)) {
    response = {
      result : 0,
      message : 'Ditt svar är korrekt, men inte förkortat så långt som möjligt.',
    };
  }
  else {
    response = -1;
  }
  
  return response;
};

waxon.addQuestion(fractionsMixed);

