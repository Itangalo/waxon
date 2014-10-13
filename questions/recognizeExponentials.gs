/**
 * @file: Question type for recognizing exponential functions in different forms.
 */
var q = new waxonQuestion('recognizeExponentialsBase');

q.title = 'Känna igen exponentialfunktioner';
q.shortTitle = 'Känna igen';

q.dependencies = {
  math : {apiVersion : 1, subVersion : 3},
  utils : {apiVersion : 1, subVersion : 1},
};

q.defaults = new configObject({
  'type' : gash.utils.randomSelect({text : 1, graph : 1, expression: 1}),
  'functionType' : gash.utils.randomSelect({exponential : 4, exponentialExtra : 2, shiftedExponential : 2, power : 2, linear: 2, quadratic : 1}),
  a : gash.utils.randomInt(-10, 10, [0, 4, -4]) / 4,
  b : gash.utils.randomInt(-10, 10, [0]) / 4,
  c : gash.utils.randomInt(-10, 10, [0]) / 4,
});

q.generateParameters = function(options) {
  options = this.defaults.overwriteWith(options);
  if (options.type == 'text') {
    options.index = gash.utils.randomInt(0, this.questions.length - 1);
  }
  return options;
}

q.questionElements = function(parameters) {
  switch (parameters.type) {
    case 'text' :
      return {
        label : '<em>Kan det här vara/beskrivas av en exponentialfunktion?</em>  ',
        description : this.questions[parameters.index].description
      }
      break;
    case 'graph' :
      var f;
      if (parameters.functionType == 'shiftedExponential') {
        parameters.a = Math.abs(parameters.a);
        f = function(x) {
          return Math.exp(parameters.a * x) * parameters.c + parameters.b * 4;
        }
      }
      else if (parameters.functionType == 'power') {
        parameters.b = Math.round(parameters.b);
        if (parameters.b == 0 || parameters.b == 1) {
          parameters.b = -1;
        }
        f = function(x) {
          return Math.pow(x, parameters.b);
        }
      }
      else if (parameters.functionType == 'linear') {
        f = function(x) {
          return parameters.a * x + parameters.b;
        }
      }
      else if (parameters.functionType == 'quadratic') {
        f = function(x) {
          return parameters.a / 10 * x * x + parameters.b * x + parameters.c;
        }
      }
      else {
        f = function(x) {
          parameters.a = Math.abs(parameters.a);
          return Math.exp(parameters.a * x + parameters.b) * parameters.c;
        }
      }
      return {
        label : '<em>Kan det här föreställa en exponentialfunktion?</em>  ',
        graph: gash.math.createGraph(f)
      };
      break;
    case 'expression' :
      var expression = 'f(x)=';
      if (parameters.functionType == 'exponentialExtra') {
        parameters.b = Math.abs(parameters.b);
        expression += parameters.a + '*' + parameters.b + '^{' + parameters.c + 'x}';
      }
      else if (parameters.functionType == 'shiftedExponential') {
        parameters.b = Math.abs(parameters.b);
        expression += parameters.a + '*' + parameters.b + '^{x}' + '+' + parameters.c;
      }
      else if (parameters.functionType == 'power') {
        expression += parameters.a + '*' + 'x' + '^{' + parameters.b + '}';
      }
      else if (parameters.functionType == 'linear') {
        expression += parameters.a + '*' + 'x' + '+' + parameters.b;
      }
      else if (parameters.functionType == 'quadratic') {
        expression += parameters.a + 'x^2+' + parameters.b + 'x' + '+' + parameters.c;
      }
      else {
        parameters.b = Math.abs(parameters.b);
        expression += parameters.a + '*' + parameters.b + '^{x}';
      }
      return {
        label : '<em>Är det här en exponentialfunktion?</em>  ',
        expression : gash.math.latex2image(expression)
      }
  }
}

q.answerElements = function(parameters) {
  var app = UiApp.getActiveApplication();
  var selectList = app.createListBox().setFocus(true);
  selectList.addItem('Det går inte att avgöra', 'maybe').addItem('Ja', 'yes').addItem('Nej', 'no');
  return {
    label : 'Kan det här vara/beskrivas av en exponentialfunktion?',
    answerSelect : selectList
  }
}

q.answerToString = function(parameters, input) {
  var message = {
    maybe : 'Det går inte att avgöra om det kan vara en exponentialfunktion',
    yes : 'Är/kan vara en expontialfunktion',
    no : 'Kan inte vara en exponentialfunktion',
  }
  return message[input.answerSelect];
}

q.evaluateAnswer = function (parameters, input) {
  if (input.answerSelect == 'maybe') {
    return {
      code : waxon.INCORRECT,
      message : 'Frågan är om det <em>kan</em> vara en exponentialfukntion – inte om det måste vara det.',
    };
  }
  if (parameters.type == 'text') {
    var question = this.questions[parameters.index];
    if (input.answerSelect == question.isExponential) {
      return waxon.CORRECT;
    }
    return waxon.INCORRECT;
  }

  if (input.answerSelect == 'yes') {
    if (parameters.functionType == 'exponential' || parameters.functionType == 'exponentialExtra') {
      return waxon.CORRECT;
    }
    else {
      return waxon.INCORRECT;
    }
  }
  else if (input.answerSelect == 'no') {
    if (parameters.functionType == 'exponential' || parameters.functionType == 'exponentialExtra') {
      return waxon.INCORRECT;
    }
    else {
      return waxon.CORRECT;
    }
  }
  else {
    return {
      code : waxon.INCORRECT,
      message : 'Frågan är om det <em>kan</em> vara en exponentialfukntion – inte om det måste vara det.',
    };
  }
}

q.questions = [];

q.questions.push({
  description : 'Pengar som växer med 7 procent varje vecka.',
  isExponential : 'yes'
});
q.questions.push({
  description : 'Folkmängd som växer med 1 procent varje dag.',
  isExponential : 'yes'
});
q.questions.push({
  description : 'Bakterier som fördubblas varje minut.',
  isExponential : 'yes'
});
q.questions.push({
  description : 'En skuld som ökar med 6 procent per år.',
  isExponential : 'yes'
});
q.questions.push({
  description : 'En fågelart som minskar i population med 1,9 procent per år.',
  isExponential : 'yes'
});

q.questions.push({
  description : 'En isbit vars volym minskar med 3 kubikcentimeter i minuten.',
  isExponential : 'no'
});
q.questions.push({
  description : 'Pengar som ökar med 15 kr per dag.',
  isExponential : 'no'
});
q.questions.push({
  description : 'En bil som minskar med 500 kr per månad.',
  isExponential : 'no'
});

q.questions.push({
  description : 'En funktion som har vändpunkt i punkten (1, 7).',
  isExponential : 'no'
});
q.questions.push({
  description : 'En funktion som har tre nollpunkter',
  isExponential : 'no'
});
q.questions.push({
  description : 'En funktion vars graf går genom origo (0, 0).',
  isExponential : 'no'
});
q.questions.push({
  description : 'En funktion som har vändpunkt i punkten (1, 7).',
  isExponential : 'no'
});
q.questions.push({
  description : 'En funktion som är symmetrisk kring x = 2.',
  isExponential : 'no'
});
q.questions.push({
  description : 'En funktion som går genom punkterna (1, 3) och (-3, -3).',
  isExponential : 'no'
});
q.questions.push({
  description : 'En funktion vars högsta värde är 22.',
  isExponential : 'no'
});
q.questions.push({
  description : 'En funktion vars lägsta värde är -1.',
  isExponential : 'no'
});

q.questions.push({
  description : 'En funktion där f(x) alltid blir negativt.',
  isExponential : 'yes'
});
q.questions.push({
  description : 'En funktion där f(x) alltid blir positivt.',
  isExponential : 'yes'
});
q.questions.push({
  description : 'En funktion som skär y-axeln vid 2,1.',
  isExponential : 'yes'
});
