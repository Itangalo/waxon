/**
 * @file: Question type for completing the square by ansatz.
 */
var q = new waxonQuestion('quadraticExtremesBase');

q.title = 'Extremvärden för andragradsfunktioner';
q.shortTitle = 'Extremvärden';

q.dependencies = {
  math : {apiVersion : 1, subVersion : 3},
  algebra : {apiVersion : 1, subVersion : 1},
  utils : {apiVersion : 1, subVersion : 1},
};

q.defaults = new configObject({
  'type' : gash.utils.randomSelect({extremeValue : 2, extremePoint : 2, extremeType : 1}),
  a : gash.utils.randomInt(-6, 6, [0]) / 2,
  d : gash.utils.randomInt(-8, 8) / 2,
  e : gash.utils.randomInt(-8, 8) / 2
});

q.generateParameters = function(options) {
  options = this.defaults.overwriteWith(options);
  options.b = 2 * options.a * options.d;
  options.c = options.a * options.d * options.d + options.e;
  return options;
}

q.questionElements = function(parameters) {
  var app = UiApp.getActiveApplication();
  var labels = {
    'extremeValue' : 'Vad är extremvärdet för den här funktionen?',
    'extremePoint' : 'Vad är extrempunkten för den här funktionen?',
    'extremeType' : 'Vilken typ av extrempunkt har den här funktionen?',
  }
  return {
    label : labels[parameters.type] + '  ',
    expression : gash.math.latex2image('f(x)=' + gash.math.latexFraction(parameters.a, {skipOnes : true}) + 'x^2+' + gash.math.latexFraction(parameters.b, {skipOnes : true}) + 'x+' + gash.math.latexFraction(parameters.c)),
  };
}

q.questionToString = function(parameters) {
  var expression = gash.math.findFraction(parameters.a).noOnes + 'x² + ' + gash.math.findFraction(parameters.b).noOnes + 'x + ' + gash.math.findFraction(parameters.c).plainText;
  var labels = {
    'extremeValue' : 'Vad är extremvärdet för ' + expression + '?',
    'extremePoint' : 'Vad är extrempunkten för ' + expression + '?',
    'extremeType' : 'Vilken typ av extrempunkt har ' + expression + '?',
  }
  return labels[parameters.type];
}

q.answerElements = function(parameters) {
  var app = UiApp.getActiveApplication();
  if (parameters.type == 'extremeType') {
    var listBox = app.createListBox().setFocus(true);
    listBox.addItem('maximum', 'maximum');
    listBox.addItem('minimum', 'minimum');
    return {
      answerSelect : listBox
    };
  }
  return {
    answer : app.createTextBox().setFocus(true)
  };
};

q.answerToString = function(parameters, input) {
  if (parameters.type == 'extremeType') {
    return input.answerSelect;
  }
  else {
    return input.answer;
  }
}

q.evaluateAnswer = function(parameters, input) {
  switch (parameters.type) {
    case 'symmetry' :
      var parts = input.answer.split('=');
      if (parts[0].trim().toLowerCase() != 'x' || parts.length != 2) {
        return {
          code : waxon.WRONG_FORM,
          message : 'Du verkar inte ha skrivit en ekvation för en linje.'
        }
      }
      if (gash.algebra.evaluate(parts[1]) == parameters.d * -1) {
        return waxon.CORRECT;
      }
      else {
        return waxon.INCORRECT;
      }
      break;
    case 'extremePoint' :
      var answer = gash.math.parseCoordinate(input.answer);
      answer.x = gash.algebra.evaluate(answer.x);
      answer.y = gash.algebra.evaluate(answer.y);
      if (answer.code != undefined) {
        return answer;
      }
      if (answer.x.toFixed(10) == -1 * parameters.d.toFixed(10) && answer.y.toFixed(10) == parameters.e.toFixed(10)) {
        return waxon.CORRECT;
      }
      if (answer.y.toFixed(10) == -1 * parameters.d.toFixed(10) && answer.x.toFixed(10) == parameters.e.toFixed(10)) {
        return {
          code : waxon.INCORRECT,
          message : 'Du verkar ha vänt på x- och y-koordinaterna.'
        }
      }
      if (answer.x.toFixed(10) == -1 * parameters.d.toFixed(10) || answer.y.toFixed(10) == parameters.e.toFixed(10)) {
        return {
          code : waxon.INCORRECT,
          message : 'En av koordinaterna stämmer.'
        }
      }
      else {
        return waxon.INCORRECT;
      }
      break;
    case 'extremeValue' :
      if (gash.algebra.evaluate(input.answer) == parameters.e) {
        return waxon.CORRECT;
      }
      if (gash.algebra.evaluate(input.answer) == undefined) {
        return waxon.CANNOT_INTERPRET;
      }
      return waxon.INCORRECT;
      break;
    case 'extremeType' :
      if (parameters.a < 0 && input.answerSelect == 'maximum') {
        return waxon.CORRECT;
      }
      if (parameters.a > 0 && input.answerSelect == 'minimum') {
        return waxon.CORRECT;
      }
      return waxon.INCORRECT;
      break;
    case 'zeroes' :
      if (parameters.a * parameters.e > 0) {
        var correct = 0;
      }
      if (parameters.a * parameters.e < 0) {
        var correct = 2;
      }
      if (parameters.e == 0) {
        var correct = 1;
      }
      if (input.answer == correct) {
        return waxon.CORRECT;
      }
      else {
        return waxon.INCORRECT;
      }
      break;
  }
};

q.helpElements = function(parameters) {
  return {
    help1 : 'Kvadratkomplettering genom ansättning:  ',
    link1 : 'https://www.youtube.com/watch?v=8YtxCaQmhK0  ',
    help2 : 'Snabbversion av kvadratkomplettering genom ansättning:  ',
    link2 : 'https://www.youtube.com/watch?v=O6byRNZfB-0  ',
    help3 : 'Förklaring av kvadratkomplettering genom ansättning (och en del mer):  ',
    link3 : 'http://tinyurl.com/andragrad-mullsjo-2014'
  };
}

q.tests = {
};
