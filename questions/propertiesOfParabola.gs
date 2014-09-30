/**
 * @file: Question type for recognizing some basic properties of parabolas.
 */
var q = new waxonQuestion('propertiesOfParabolaBase');

q.title = 'Egenskaper hos andragradsfunktioner';
q.shortTitle = 'Parabler';

q.dependencies = {
  math : {apiVersion : 1, subVersion : 3},
  utils : {apiVersion : 1, subVersion : 1},
};

q.defaults = new configObject({
  'type' : gash.utils.randomSelect({symmetry : 1, extremePoint : 2, extremeValue: 2, extremeType : 1, zeroes : 1}),
  a : gash.utils.randomInt(-20, 20, [0]) / 10,
  d : gash.utils.randomInt(-8, 8),
  e : gash.utils.randomInt(-8, 8) / 2
});

q.generateParameters = function(options) {
  options = this.defaults.overwriteWith(options);
  return options;
}

q.questionElements = function(parameters) {
  var app = UiApp.getActiveApplication();
  var labels = {
    symmetry : 'Vad är symmetrilinjen för den här parabeln? (Ange linjens ekvation och avrunda till halvtal.)',
    extremePoint : 'Vad är extrempunkten för den här parabeln? (Avrunda till halvtal.)',
    extremeValue : 'Vad är extremvärdet för den här parabeln? (Avrunda till halvtal.)',
    extremeType : 'Vilken typ av extremvärde har den här parabeln? (Avrunda till halvtal.)',
    zeroes : 'Hur många nollställen har den här parabeln?'
  }
  var f = function(x) {return (parameters.a * (x + parameters.d) * (x + parameters.d) + parameters.e);};
  var options = {
    width : 360,
    xMin : -1 * parameters.d - 2,
    xMax : -1 * parameters.d + 2,
    enableInteractivity : true
  };
  return {
    label : app.createLabel(labels[parameters.type]),
    graph : gash.math.createGraph(f, options)
  };
}

q.questionToString = function(parameters) {
  var labels = {
    symmetry : 'Vad är symmetrilinjen för den här parabeln? (Ange linjens ekvation.)',
    extremePoint : 'Vad är extrempunkten för den här funktionen?',
    extremeValue : 'Vad är extremvärdet för den här funktionen?',
    extremeType : 'Vilken typ av extremvärde har den här funktionen?',
    zeroes : 'Hur många nollställen har den här funktionen?'
  };
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
  var helps = {
    symmetry : 'Lodräta linjer skrivs på formen "x=2,5".',
    extremePoint : 'Tänk på skillnaden mellan extrempunkt och extremvärden.',
    extremeValue : 'Tänk på skillnaden mellan extrempunkt och extremvärden.',
    extremeType : '',
    zeroes : 'Det är inte säkert att nollställena syns i grafen.'
  };
  return {
    help1 : helps[parameters.type],
    separator : '<hr/>  ',
    help2 : 'Introduktion till andragradsfunktioner del 1:  ',
    link1 : 'https://www.youtube.com/watch?v=5QVcoxtb7IQ  ',
    help3 : 'Introduktion till andragradsfunktioner del 2:  ',
    link2 : 'https://www.youtube.com/watch?v=v_D_immkE6Y  '
  };
}

q.tests = {
  correctBuild : function() {
    var parameters = waxon.questions.factorExpressionsBase.generateParameters({
      type : 'conjugate',
      variable : 'x',
      a : 1,
      b : 4
    });
    if (parameters.expression != 'x^2+-16' && parameters.expression != '-16+x^2') {
      throw 'Parameters are not built correctly.';
    }
    var parameters = waxon.questions.factorExpressionsBase.generateParameters({
      type : 'binomial',
      variable : 'x',
      a : -1,
      b : 8,
      c : 8,
      d : 6
    });
    if (parameters.expression.indexOf('29x') == -1) {
      throw 'Avoiding common denominators in binomials does not work properly.';
    }
  },
  correctEvaluation : function() {
    var parameters = waxon.questions.factorExpressionsBase.generateParameters({
      type : 'conjugate',
      variable : 'x',
      a : 1,
      b : 4
    });
    var input = {factor1 : '(x+4)', factor2 : '(x-4)'};
    if (waxon.questions.factorExpressionsBase.evaluateAnswer(parameters, input) != waxon.CORRECT) {
      throw 'Correct answer is not evaluated as correct (conjugate).';
    }
    var input = {factor1 : '(-x+4)', factor2 : '(-x-4)'};
    if (waxon.questions.factorExpressionsBase.evaluateAnswer(parameters, input) != waxon.CORRECT) {
      throw 'Evaluataion does not accept negative flips.';
    }
  }
};

q.tests = {
  generateParameters : function() {
    var parameters = waxon.questions.propertiesOfParabolaBase.generateParameters({type : 'symmetry'});
    if (parameters.type != 'symmetry') {
      throw 'Parameter creation does not respect given options.';
    }
  },
  extremePoints : function() {
    var parameters = waxon.questions.propertiesOfParabolaBase.generateParameters({type : 'extremePoint'});
    var input = {
      answer : '(' + (-1 * parameters.d) + ';' + parameters.e + ')'
    };
    if (waxon.questions.propertiesOfParabolaBase.evaluateAnswer(parameters, input) != waxon.CORRECT) {
      throw 'Correct answers are evaluated as incorrect.';
    }
  },
};
