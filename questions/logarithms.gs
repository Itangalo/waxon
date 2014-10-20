/**
 * @file: Question type for describing change as factor and percent.
 */
var q = new waxonQuestion('logarithmsBase');

q.title = 'Logaritmer';
q.shortTitle = 'Logaritmer';

q.dependencies = {
  math : {apiVersion : 1, subVersion : 6},
  algebra : {apiVersion : 1, subVersion : 3},
  utils : {apiVersion : 1, subVersion : 1},
};

q.defaults = new configObject({
  'type' : gash.utils.randomSelect({logEquation : 1, calculate : 1, interval : 1, power : 1, powerWithVariable : 1, expEquation : 100}),
  integerExponent : gash.utils.randomInt(-2, 6),
  decimalExponent : Math.random() * 8 - 4,
  maxPrecision : 2,
  variable : gash.utils.randomSelect(['x', 'a', 's', 'y', 't'])
});

q.generateParameters = function(options) {
  options = this.defaults.overwriteWith(options);
  if (options.type === 'interval' || options.type === 'power' || options.type === 'expEquation') {
    options.number = gash.math.round(Math.pow(10, options.decimalExponent), options.maxPrecision);
    if (options.number == gash.math.round(options.number, 1)) {
      options.number = gash.math.round(options.number * 0.9, options.maxPrecision);
    }
  }
  else {
    options.number = Math.pow(10, options.integerExponent);
  }
  return options;
};

q.questionElements = function(parameters) {
  switch (parameters.type) {
    case 'logEquation' :
      return {
        label : 'Hitta värdet på variabeln:  ',
        equation : gash.math.latex2image('lg(' + parameters.variable + ') = ' + parameters.integerExponent)
      };
      break;
    case 'calculate' :
      return {
        label : 'Beräkna:  ',
        equation : gash.math.latex2image('lg(' + parameters.number + ')')
      };
      break;
    case 'interval' :
      return {
        label : 'Mellan vilka två heltal ligger <em>lg(' + parameters.number + ')</em>?'
      };
      break;
    case 'power' :
      parameters.decimalExponent = gash.math.round(parameters.decimalExponent, parameters.maxPrecision);
      return {
        label : 'Vad är:  ',
        equation : gash.math.latex2image('lg(10^{' + parameters.decimalExponent + '})')
      };
      break;
    case 'powerWithVariable' :
      parameters.decimalExponent = gash.math.round(parameters.decimalExponent, parameters.maxPrecision);
      return {
        label : 'Vad är:  ',
        equation : gash.math.latex2image('lg(10^{' + parameters.decimalExponent + parameters.variable + '})')
      };
      break;
    case 'expEquation' :
      return {
        label : 'Hitta värdet på variabeln och svara med en logaritm:  ',
        equation : gash.math.latex2image('10^{' + parameters.variable + '} = ' + parameters.number)
      };
      break;
  }
};

q.questionToString = function(parameters) {
  switch (parameters.type) {
    case 'logEquation' :
      return 'lg(' + parameters.variable + ') = ' + parameters.number;
      break;
    case 'calculate' :
      return 'Beräkna lg(' + parameters.number + ')';
      break;
    case 'interval' :
      return 'Mellan vilka två heltal ligger <em>lg(' + parameters.number + ')</em>?';
      break;
    case 'power' :
      parameters.decimalExponent = gash.math.round(parameters.decimalExponent, parameters.maxPrecision);
      return 'Beräkna lg(10^' + parameters.decimalExponent + ')';
      break;
    case 'powerWithVariable' :
      parameters.decimalExponent = gash.math.round(parameters.decimalExponent, parameters.maxPrecision);
      return 'Beräkna lg(10^(' + parameters.decimalExponent + parameters.variable + '))';
      break;
    case 'expEquation' :
      return 'Lös ekvationen 10^{' + parameters.variable + '} = ' + parameters.number;
      break;
  }
};

q.answerElements = function(parameters) {
  var app = UiApp.getActiveApplication();
  switch (parameters.type) {
    case 'logEquation' :
      return {
        label : parameters.variable + '=',
        answer : app.createTextBox().setFocus(true)
      };
      break;
    case 'calculate' :
    case 'power' :
    case 'powerWithVariable' :
      return {
        answer : app.createTextBox().setFocus(true)
      };
      break;
    case 'interval' :
      return {
        label : 'Svara med <strong>de två närmaste heltalen</strong>.  ',
        label1 : 'Logaritmen är större än',
        answer1 : app.createTextBox().setFocus(true),
        lineBreak : '<br/>',
        label2 : 'men mindre än',
        answer2 : app.createTextBox(),
      };
      break;
    case 'expEquation' :
      return {
        label : 'Svara med <strong>en logaritm</strong>, exempelvis "lg(42)"',
        answer : app.createTextBox().setFocus(true)
      };
      break;
  }
};

q.answerToString = function(parameters, input) {
  if (parameters.type === 'interval') {
    return 'mellan ' + input.answer1 + ' och ' + input.answer2;
  }
  else {
    input.answer;
  }
};

q.evaluateAnswer = function (parameters, input) {
  // Replace 'log' in answers with 'lg'.
  if (parameters.type === 'interval') {
    input.answer1 = input.answer1.replace(/log/g, 'lg');
    input.answer2 = input.answer2.replace(/log/g, 'lg');
  }
  else {
    input.answer = input.answer.replace(/log/g, 'lg');
  }

  var value;
  switch (parameters.type) {
    case 'logEquation' :
      value = gash.algebra.evaluate(input.answer, [], {allowedOperators : []});
      if (value === undefined) {
        return {
          code : waxon.CANNOT_INTERPRET,
          message : 'Kunde inte förstå ditt svar. Ange ett tal.',
        };
      }
      if (value == parameters.number) {
        return waxon.CORRECT;
      }
      else {
        return waxon.INCORRECT;
      }
      break;

    case 'calculate' :
      value = gash.algebra.evaluate(input.answer, [], {allowedOperators : []});
      if (value === undefined) {
        return {
          code : waxon.CANNOT_INTERPRET,
          message : 'Kunde inte förstå ditt svar. Ange ett tal.',
        };
      }
      if (value == parameters.integerExponent) {
        return waxon.CORRECT;
      }
      else {
        return waxon.INCORRECT;
      }
      break;

    case 'interval' :
      value = gash.algebra.evaluate(input.answer1, [], {allowedOperators : []});
      var value2 = gash.algebra.evaluate(input.answer2, [], {allowedOperators : []});
      if (value === undefined || value2 === undefined) {
        return {
          code : waxon.CANNOT_INTERPRET,
          message : 'Kunde inte förstå ditt svar. Ange heltal.',
        };
      }
      if (value > value2) {
        return {
          code : waxon.INCORRECT,
          message : 'Ange det lägre talet först och det högre talet sist.',
        };
      }
      if (value == Math.floor(parameters.decimalExponent) && value2 == Math.ceil(parameters.decimalExponent)) {
        return waxon.CORRECT;
      }
      else {
        if (value2 - value != 1) {
          return {
            code : waxon.WRONG_FORM,
            message : 'Du ska svara med de två heltal som ligger närmast logaritmens värde.',
          };
        }
        else {
          return waxon.INCORRECT;
        }
      }
      break;

    case 'power' :
      value = gash.algebra.evaluate(input.answer, [], {allowedOperators : []});
      if (value === undefined) {
        return {
          code : waxon.CANNOT_INTERPRET,
          message : 'Kunde inte förstå ditt svar. Ange ett tal.',
        };
      }
      parameters.decimalExponent = gash.math.round(parameters.decimalExponent, parameters.maxPrecision);
      if (value == parameters.decimalExponent) {
        return waxon.CORRECT;
      }
      else {
        return waxon.INCORRECT;
      }

      break;

    case 'powerWithVariable' :
      parameters.decimalExponent = gash.math.round(parameters.decimalExponent, parameters.maxPrecision);
      value = gash.algebra.compareExpressions('' + parameters.decimalExponent + parameters.variable, input.answer, [parameters.variable]);
      if (value == gash.algebra.CANNOT_INTERPRET) {
        return {
          code : waxon.CANNOT_INTERPRET,
          message : 'Kunde inte förstå ditt svar. Ange ett uttryck som innehåller ' + parameters.variable + '.',
        };
      }
      return value;
      break;

    case 'expEquation' :
      value = gash.algebra.compareExpressions('lg(' + parameters.number + ')', input.answer);
      if (value === undefined) {
        return {
          code : waxon.CANNOT_INTERPRET,
          message : 'Kunde inte förstå ditt svar. Ange ett uttryck som innehåller en logaritm.',
        };
      }
      return value;
      break;
  }
};

q.helpElements = function(parameters) {
  return {
    label1 : 'Introduktion till logaritmer:  ',
    link1 : 'https://www.youtube.com/watch?v=aRFA4GquHGs  ',
    label2 : 'Några exempel på räkning med logaritmer:  ',
    link2 : 'https://www.youtube.com/watch?v=duglRTsthB0  ',
    label3 : 'En annan Introduktion till logaritmer:  ',
    link3 : 'https://www.youtube.com/watch?v=kan2K_luMRE  '
  };
};

q.tests = {
  basics : function() {
    var options = {
      type : 'logEquation',
      integerExponent : 4,
      decimalExponent : 1.23,
      maxPrecision : 2,
      variable : 't'
    };
    var parameters = waxon.questions.logarithmsBase.generateParameters(options);
    var input = {
      answer : '10000'
    };
    if (waxon.questions.logarithmsBase.evaluateAnswer(parameters, input) != waxon.CORRECT) {
      throw 'Correct answer is evaluated as wrong. (logEquation)';
    }
    input.answer = '9999';
    if (waxon.questions.logarithmsBase.evaluateAnswer(parameters, input) != waxon.INCORRECT) {
      throw 'Incorrect answer is evaluated as correct. (logEquation)';
    }

    options.type = 'calculate';
    var parameters = waxon.questions.logarithmsBase.generateParameters(options);
    input.answer = '4';
    if (waxon.questions.logarithmsBase.evaluateAnswer(parameters, input) != waxon.CORRECT) {
      throw 'Correct answer is evaluated as wrong. (calculate)';
    }
    input.answer = '-4';
    if (waxon.questions.logarithmsBase.evaluateAnswer(parameters, input) != waxon.INCORRECT) {
      throw 'Incorrect answer is evaluated as correct. (calculate)';
    }

    options.type = 'interval';
    var parameters = waxon.questions.logarithmsBase.generateParameters(options);
    if (parameters.number != 17) {
      throw 'Numbers are not rounded correctly when building the exercise.';
    }
    input.answer1 = '1';
    input.answer2 = '2';
    if (waxon.questions.logarithmsBase.evaluateAnswer(parameters, input) != waxon.CORRECT) {
      throw 'Correct answer is evaluated as wrong. (interval)';
    }
    input.answer1 = '1';
    input.answer2 = '3';
    if (waxon.questions.logarithmsBase.evaluateAnswer(parameters, input) == waxon.CORRECT) {
      throw 'Incorrect answer is evaluated as correct. (interval)';
    }

    options.type = 'power';
    var parameters = waxon.questions.logarithmsBase.generateParameters(options);
    input.answer = '1.2';
    if (waxon.questions.logarithmsBase.evaluateAnswer(parameters, input) != waxon.CORRECT) {
      throw 'Correct answer is evaluated as wrong. (power)';
    }
    input.answer = '1.23';
    if (waxon.questions.logarithmsBase.evaluateAnswer(parameters, input) != waxon.INCORRECT) {
      throw 'Incorrect answer is evaluated as correct. (power)';
    }

    options.type = 'powerWithVariable';
    var parameters = waxon.questions.logarithmsBase.generateParameters(options);
    input.answer = '1.2t';
    if (waxon.questions.logarithmsBase.evaluateAnswer(parameters, input) != waxon.CORRECT) {
      throw 'Correct answer is evaluated as wrong. (powerWithVariable)';
    }
    input.answer = '1.23t';
    if (waxon.questions.logarithmsBase.evaluateAnswer(parameters, input) != waxon.INCORRECT) {
      throw 'Incorrect answer is evaluated as correct. (powerWithVariable)';
    }

    options.type = 'expEquation';
    var parameters = waxon.questions.logarithmsBase.generateParameters(options);
    input.answer = 'lg(17)';
    if (waxon.questions.logarithmsBase.evaluateAnswer(parameters, input) != waxon.CORRECT) {
      throw 'Correct answer is evaluated as wrong. (expEquation)';
    }
    input.answer = 'log(17)';
    if (waxon.questions.logarithmsBase.evaluateAnswer(parameters, input) != waxon.CORRECT) {
      throw 'Renaming of lg to log does not work. (expEquation)';
    }
    input.answer = '1.23';
    if (waxon.questions.logarithmsBase.evaluateAnswer(parameters, input) != waxon.INCORRECT) {
      throw 'Incorrect answer is evaluated as correct. (expEquation)';
    }
  }
};
