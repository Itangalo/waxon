/**
 * @file: Question type for exponential equations on the form c*a^(kx+d) = b.
 */
var q = new waxonQuestion('exponentialEquationsBase');

q.title = 'Exponentialekvationer';
q.shortTitle = 'Exponentialekvationer';

q.dependencies = {
  math : {apiVersion : 1, subVersion : 6},
  algebra : {apiVersion : 1, subVersion : 3},
  utils : {apiVersion : 1, subVersion : 1},
};

q.defaults = new configObject({
  magnitude : gash.utils.randomSelect({decrease : 1, increase : 1, large : 1}),
  decrease : gash.utils.randomInt(0, 100, [0, 100]) / 100,
  increase : gash.utils.randomInt(100, 300, [0, 100]) / 100,
  large : gash.utils.randomInt(2, 20, [0, 2]) / 2,
  c : gash.utils.randomInt(-1000, 1000, [0]),
  k : gash.utils.randomInt(-20, 20, [0]) / 10,
  d : gash.utils.randomInt(-20, 20, [0]) / 10,
  b : gash.utils.randomInt(1, 1000),
  variable : gash.utils.randomSelect(['x', 'a', 's', 'y', 't'])
});

q.generateParameters = function(options) {
  options = this.defaults.overwriteWith(options);
  options.a = options.a || options[options.magnitude];
  options.b = Math.abs(options.b) * gash.math.sign(options.c);
  if (options.k == 0) {
    options.k = 1;
  }
  if (options.c == 0) {
    options.c = 1;
  }
  if (options.b == 0) {
    options.b = 1;
  }

  options.expression = '' + options.c + '*' + options.a + '^(' + options.k + options.variable + '+' + options.d + ')';

  if (options.c == 1) {
    var c = '';
  }
  else {
    var c = options.c + '*';
  }
  if (options.d == 0) {
    var d = '';
  }
  else if (options.d > 0) {
    var d = '+' + options.d;
  }
  else {
    var d = options.d;
  }

  options.latex = c + options.a + '^{' + gash.math.findFraction(options.k, 1).noOnes + options.variable + d + '}=' + options.b;
  options.plainText = c + options.a + '^(' + gash.math.findFraction(options.k, 1).noOnes + options.variable + d + ') = ' + options.b;

  return options;
};

q.questionElements = function(parameters) {
  return {
    label : 'Lös följande ekvation. Svara exakt.  ',
    equation : gash.math.latex2image(parameters.latex)
//    equation : parameters.plainText
  };
};

q.questionToString = function(parameters) {
  return parameters.plainText;
};

q.answerElements = function(parameters) {
  return {
    label : parameters.variable + ' =',
    answer : UiApp.getActiveApplication().createTextBox().setFocus(true)
  };
}

q.evaluateAnswer = function (parameters, input) {
  var correctAnswer = (Math.log(parameters.b / parameters.c) / Math.log(parameters.a) - parameters.d) / parameters.k;

  var value = gash.algebra.compareExpressions(correctAnswer, input.answer, [], []);
  if (value === undefined) {
    return {
      code : waxon.CANNOT_INTERPRET,
      message : 'Kunde inte förstå ditt svar. Har du missat att sätta negativa tal inom parentes?',
    };
  }
  return value;
};

q.helpElements = function(parameters) {
  return {
    label1 : 'Inledande exempel på exponentialekvation:  ',
    link1 : 'https://www.youtube.com/watch?v=rYHdUrKqxaU  ',
    label2 : 'Exempel på exponentialekvationer 2:  ',
    link2 : 'https://www.youtube.com/watch?v=8zL5jsyO2Zo  ',
    label3 : 'Ett tredje exempel på exponentialekvationer:  ',
    link3 : 'http://www.youtube.com/watch?v=qLpxGCw8KUE  '
  };
};

q.tests = {
  basics : function() {
    var options = {
      c : 3,
      a : 2,
      k : 5,
      variable : 't',
      d : 7,
      b : 48
    };
    var parameters = waxon.questions.exponentialEquationsBase.generateParameters(options);
    if (parameters.plainText != '3*2^(5t+7) = 48') {
      throw 'Expression is not built correctly.';
    }
    var input = {
      answer : '-3/5'
    };
    if (waxon.questions.exponentialEquationsBase.evaluateAnswer(parameters, input) != waxon.CORRECT) {
      throw 'Correct answer is evaluated as wrong.';
    }

    options.d = 0;
    options.c = 1;
    options.k = 1;
    parameters = waxon.questions.exponentialEquationsBase.generateParameters(options);
    if (parameters.plainText != '2^(t) = 48') {
      throw 'Neutral parameters are not removed properly from plain text.';
    }

    options.c = 0;
    options.k = 0;
    options.b = 0;
    parameters = waxon.questions.exponentialEquationsBase.generateParameters(options);
    if (parameters.c == 0 || parameters.k == 0 || parameters.b == 0) {
      throw 'Disallowed zero-parameters are not forced to 1.';
    }

  }
};
