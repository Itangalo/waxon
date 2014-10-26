/**
 * @file: Question type for practicing order of operations.
 */
var q = new waxonQuestion('orderOfOpsBase');

q.title = 'Prioriteringsregler';
q.shortTitle = 'Prioriteringsregler';

q.dependencies = {
  math : {apiVersion : 1, subVersion : 6},
  algebra : {apiVersion : 1, subVersion : 1},
  utils : {apiVersion : 1, subVersion : 1},
};

q.defaults = new configObject({
  type : gash.utils.randomSelect({
    'a±b*c' : 3,
    'a±b/c' : 2,
    'a±b^c' : 1,
    'a*b^c' : 1,
  }),
  assureInteger : true, // Assures plausible results even calculating with wrong order of operations.
  maxPower : 2,
  a : gash.utils.randomInt(2, 10),
  b : gash.utils.randomInt(-10, 10, [-1, 0, 1]),
  c : gash.utils.randomInt(2, 5),
});

q.generateParameters = function(options) {
  options = this.defaults.overwriteWith(options);
  var op2;
  if (options.type == 'a±b/c') {
    op2 = '/';
    if (options.assureInteger) {
      options.b = gash.math.sign(options.b) * Math.ceil(Math.abs(options.b / options.c)) * options.c;
      options.a = gash.math.sign(options.a) * Math.ceil(Math.abs(options.a / options.c)) * options.c;
    }
  }
  if (options.type == 'a±b*c') {
    op2 = '*';
  }
  if (options.type == 'a±b^c' || options.type == 'a*b^c') {
    options.c = Math.min(options.c, options.maxPower);
    options.c = Math.max(options.c, 2);
    op2 = '^';
  }

  var b = options.b;
  if (b >= 0) {
    b = '+' + b;
  }
  options.expression = '' + options.a + b + op2 + options.c;

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
    label1 : 'Prioriteringsregler:  ',
    link1 : 'https://www.youtube.com/watch?v=VsKmgM9mrTU  ',
    label2 : 'Prioriterigsregler för de fyra vanliga räknesätten:  ',
    link2 : 'http://www.matteboken.se/lektioner/matte-1/tal/rakneordning  ',
  };
};

q.tests = {
  basics : function() {
    var options = {
      type : 'a±b/c',
      c : 3,
      b : 2,
      a : 7,
    };
    var parameters = waxon.questions.orderOfOpsBase.generateParameters(options);
    if (parameters.expression != '9+3/3') {
      throw 'Expression is not built correctly.';
    }
    var input = {
      answer : '10'
    };
    if (waxon.questions.orderOfOpsBase.evaluateAnswer(parameters, input) != waxon.CORRECT) {
      throw 'Correct answer is evaluated as wrong.';
    }

    options.b = -2;
    parameters = waxon.questions.orderOfOpsBase.generateParameters(options);
    if (parameters.expression != '9-3/3') {
      throw 'Negative numbers do not result in proper expressions.';
    }

    options.type = 'a±b^c';
    parameters = waxon.questions.orderOfOpsBase.generateParameters(options);
    if (parameters.expression != '7-2^2') {
      throw 'Power expresions are not built properly.';
    }
  }
};
