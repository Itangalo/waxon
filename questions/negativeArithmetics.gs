/**
 * @file: Question type for exponential equations on the form c*a^(kx+d) = b.
 */
var q = new waxonQuestion('negativeArithmeticsBase');

q.title = 'Negativa tal';
q.shortTitle = 'Negativa tal';

q.dependencies = {
  math : {apiVersion : 1, subVersion : 6},
  utils : {apiVersion : 1, subVersion : 1},
};

q.defaults = new configObject({
  op : gash.utils.randomSelect(['+', '-', '*', '/', '^']),
  a : gash.utils.randomInt(-10, -1),
  b : gash.utils.randomInt(-10, 10, [0, 1]),
  reverse : gash.utils.randomSelect(['yes', 'no']),
  c : gash.utils.randomInt(2, 3),
});

q.generateParameters = function(options) {
  options = this.defaults.overwriteWith(options);
  var a = options.a, b = options.b, c = options.c;
  if (a < 0) {
    a = '(' + a + ')';
  }
  if (b < 0) {
    b = '(' + b + ')';
  }

  if (options.op == '^') {
    options.expression = '' + a + options.op + c;
  }
  else {
    if (options.reverse == 'yes') {
      options.expression = '' + b + options.op + a;
    }
    else {
      options.expression = '' + a + options.op + b;
    }
  }
  return options;
};

q.questionElements = function(parameters) {
  return {
    label : 'Beräkna följande uttryck.  ',
    equation : gash.math.latex2image(parameters.expression)
  };
};

q.questionToString = function(parameters) {
  return parameters.expression;
};

q.evaluateAnswer = function (parameters, input) {
  var correctAnswer = gash.algebra.evaluate(parameters.expression);

  var answer = gash.algebra.evaluate(input.answer, {allowedOperators : []});
  if (answer === undefined) {
    return {
      code : waxon.CANNOT_INTERPRET,
      message : 'Kunde inte förstå ditt svar. Svara med ett tal.',
    };
  }
  if (answer == correctAnswer) {
    return waxon.CORRECT;
  }
  else {
    return waxon.INCORRECT;
  }
};

q.helpElements = function(parameters) {
  return {
    label1 : 'Fyra räknesätt med negativa tal:  ',
    link1 : 'http://www.matteboken.se/lektioner/matte-1/tal/negativa-tal  ',
    label2 : 'Negativa tal och upphöjt till:  ',
    link2 : 'http://www.matteboken.se/lektioner/matte-1/tal/negativa-baser  ',
  };
};

q.tests = {
  basics : function() {
    var options = {
      op : '+',
      reverse : 'no',
      a : -2,
      b : -3,
      c : 2,
    };
    var parameters = waxon.questions.negativeArithmeticsBase.generateParameters(options);
    if (parameters.expression != '(-2)+(-3)') {
      throw 'Expression is not built correctly.';
    }
    var input = {
      answer : '-5'
    };
    if (waxon.questions.negativeArithmeticsBase.evaluateAnswer(parameters, input) != waxon.CORRECT) {
      throw 'Correct answer is evaluated as wrong.';
    }

    options.reverse = 'yes';
    parameters = waxon.questions.negativeArithmeticsBase.generateParameters(options);
    if (parameters.expression != '(-3)+(-2)') {
      throw 'Numbers are not reversed properly.';
    }

    options.op = '^';
    parameters = waxon.questions.negativeArithmeticsBase.generateParameters(options);
    if (parameters.expression != '(-2)^2') {
      throw 'Power expresions are not built properly.';
    }
  }
};
