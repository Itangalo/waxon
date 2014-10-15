/**
 * @file: Question type for describing change as factor and percent.
 */
var q = new waxonQuestion('changeFactorBase');

q.title = 'Förändringsfaktor';
q.shortTitle = 'Förändringsfaktor';

q.dependencies = {
  math : {apiVersion : 1, subVersion : 6},
  algebra : {apiVersion : 1, subVersion : 1},
  utils : {apiVersion : 1, subVersion : 1},
};

q.defaults = new configObject({
  'type' : gash.utils.randomSelect({percent2factor : 1, factor2percent : 1}),
  'magnitude' : gash.utils.randomSelect({decrease : 1, increase : 1, large : 1}),
  decrease : gash.utils.randomInt(0, 100, [0, 100]) / 100,
  increase : gash.utils.randomInt(100, 300, [0, 100]) / 100,
  large : gash.utils.randomInt(2, 20, [0, 2]) / 2,
  maxPrecision : 4,
});

q.generateParameters = function(options) {
  options = this.defaults.overwriteWith(options);
  options.factor = options.factor || options[options.magnitude];
  options.factor = gash.math.round(options.factor, options.maxPrecision);
  return options;
}

q.questionElements = function(parameters) {
  if (parameters.type == 'percent2factor') {
    var percent = (parameters.factor - 1) * 100;
    if (percent < 0) {
      return {
        description : 'Vilken förändringsfaktor motsvarar en minskning på ' + Math.abs(percent) + ' procent?'
      };
    }
    else if (percent > 0) {
      return {
        description : 'Vilken förändringsfaktor motsvarar en ökning på ' + percent + ' procent?'
      };
    }
    else {
      return {
        description : 'Vilken förändringsfaktor motsvarar att något är oförändrat?'
      };
    }
  }
  else {
    return {
      description : 'Hur många procents förändring motsvarar en förändringsfaktor på ' + parameters.factor + '?'
    };
  }
}

q.questionToString = function(parameters) {
  if (parameters.type == 'percent2factor') {
    var percent = (parameters.factor - 1) * 100;
    if (percent < 0) {
      return 'Vilken förändringsfaktor motsvarar en minskning på ' + Math.abs(percent) + ' procent?';
    }
    else if (percent > 0) {
      return 'Vilken förändringsfaktor motsvarar en ökning på ' + percent + ' procent?';
    }
    else {
      return 'Vilken förändringsfaktor motsvarar att något är oförändrat?';
    }
  }
  else {
    return 'Hur många procents förändring motsvarar en förändringsfaktor på ' + parameters.factor + '?';
  }
}

q.answerElements = function(parameters) {
  var app = UiApp.getActiveApplication();
  if (parameters.type == 'percent2factor') {
    return {
      label : 'Förändringsfaktor',
      answer : app.createTextBox().setFocus(true)
    };
  }
  else {
    var selectList = app.createListBox().setFocus(true);
    selectList.addItem('minskning med', '-').addItem('ökning med', '+');
    return {
      answerSelect : selectList,
      answer : app.createTextBox(),
      percent : '%'
    }
  }
}

q.answerToString = function(parameters, input) {
  if (parameters.type == 'percent2factor') {
    return input.answer;
  }
  else {
    if (input.answerSelect == '-') {
      return 'Minskning med ' + input.answer + ' procent';
    }
    else {
      return 'Ökning med ' + input.answer + ' procent';
    }
  }
}

q.evaluateAnswer = function (parameters, input) {
  if (parameters.type == 'percent2factor') {
    if (gash.algebra.compareExpressions(parameters.factor, input.answer) == waxon.CORRECT) {
      return waxon.CORRECT;
    }
    else {
      return waxon.INCORRECT;
    }
  }
  else {
    var percent = gash.algebra.evaluate(input.answer);
    if (input.answerSelect == '-') {
      if (parameters.factor == 1 - percent / 100) {
        return waxon.CORRECT;
      }
      else {
        return waxon.INCORRECT;
      }
    }
    else {
      if (parameters.factor == 1 + percent / 100) {
        return waxon.CORRECT;
      }
      else {
        return waxon.INCORRECT;
      }
    }
  }
}

q.helpElements = function(parameters) {
  return {
    label1 : 'Kort introduktion av räkning med förändringsfaktor:  ',
    link1 : 'https://www.youtube.com/watch?v=3l6MSUmug6o  ',
    label2 : 'Längre introduktion av förändringsfaktor:  ',
    link2 : 'https://www.youtube.com/watch?v=3HhflviRceM  '
  };
}

q.tests = {
  basics : function() {
    var options = {
      factor : 3.5,
      type : 'percent2factor'
    };
    var parameters = waxon.questions.changeFactorBase.generateParameters(options);
    var input = {
      answer : '3.5'
    };
    if (waxon.questions.changeFactorBase.evaluateAnswer(parameters, input) != waxon.CORRECT) {
      throw 'Correct answers are evaluated as wrong. (percent2factor)';
    }
    input.answer = '2.5';
    if (waxon.questions.changeFactorBase.evaluateAnswer(parameters, input) != waxon.INCORRECT) {
      throw 'Incorrect answers are evaluated as correct. (percent2factor)';
    }
    options.type = 'factor2percent';
    var parameters = waxon.questions.changeFactorBase.generateParameters(options);
    input.answerSelect = '+';
    if (waxon.questions.changeFactorBase.evaluateAnswer(parameters, input) != waxon.INCORRECT) {
      throw 'Incorrect answers are evaluated as correct. (factor2percent)';
    }
    input.answer = '250';
    if (waxon.questions.changeFactorBase.evaluateAnswer(parameters, input) != waxon.CORRECT) {
      throw 'Correct answers are evaluated as wrong. (factor2percent)';
    }
  },
  rounding : function () {
    var options = {
      factor : 1.23456789,
      maxPrecision : 3
    };
    var parameters = waxon.questions.changeFactorBase.generateParameters(options);
    if (parameters.factor != 1.23) {
      throw 'Factors are not rounded accoring to maxPrecision.';
    }
  }
};
