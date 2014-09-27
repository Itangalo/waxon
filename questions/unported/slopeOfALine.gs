/**
 * @file: Question type for calculating/estimating the slope of a line.
 * This question type requires the gashMath framework.
 * (https://github.com/Itangalo/gash)
 */

// Create a new object, inheriting properties from 'waxonQuestion'.
var slopeOfALine = new waxonQuestion('slopeOfALine');

slopeOfALine.title = 'Riktningskoefficient (k-värde)';

slopeOfALine.generateParameters = function(options) {
  var type = waxonUtils.randomSelect({
    graph : 1,
    points : 2,
    intercepts : 1,
  });
  if (type == 'graph') {
    return {
      type : type,
      k : (waxonUtils.randomInt(-20, 20) / 10),
      m : (waxonUtils.randomInt(-10, 10) / 2),
    };
  }
  else {
    var x1 = (waxonUtils.randomInt(-6, 6) / 2);
    var y1 = (waxonUtils.randomInt(-6, 6) / 2);
    var x2 = (waxonUtils.randomInt(-6, 6, [x1 * 2, 0]) / 2);
    var y2 = (waxonUtils.randomInt(-6, 6) / 2);
  }
  if (type == 'points') {
    return {
      type : type,
      x1 : x1,
      y1 : y1,
      x2 : x2,
      y2 : y2,
    };
  }
  else if (type == 'intercepts') {
    return {
      type : type,
      x1 : 0,
      y1 : y1,
      x2 : x2,
      y2 : 0,
    };
  }
};

slopeOfALine.questionElements = function(parameters) {
  var app = UiApp.getActiveApplication();
  switch (parameters.type) {
    case 'graph' :
      var f = function(x) {return parameters.k * x + parameters.m;};
      return {
        label : app.createLabel('Gör en uppskattning av k-värdet för linjen nedanför. (Observera att det kan vara olika skalor på axlarna!)'),
        graph : app.createSimplePanel().add(gashMath.createGraph(f, -5, 5))
      };
      break;
    case 'points' :
      return {
        label : app.createLabel('Vad är riktningskoefficienten (k-värdet) för en linje som går genom punkterna (' + parameters.x1 + ', ' + parameters.y1 + ') och (' + parameters.x2 + ', ' + parameters.y2 + ')?'),
      };
      break;
    case 'intercepts' :
      return {
        label : app.createLabel('Vad är riktningskoefficienten (k-värdet) för en linje som skär x-axeln vid ' + parameters.x2 + ' och y-axeln vid ' + parameters.y1 + '?'),
      }
      break;
  }
};

slopeOfALine.questionToString = function(parameters) {
  switch (parameters.type) {
    case 'graph' :
      return 'Gör en uppskattning av k-värdet i grafen.';
      break;
    case 'points' :
      return ('Vad är riktningskoefficienten (k-värdet) för en linje som går genom punkterna (' + parameters.x1 + ', ' + parameters.y1 + ') och (' + parameters.x2 + ', ' + parameters.y2 + ')?');
      break;
    case 'intercepts' :
      return ('Vad är riktningskoefficienten (k-värdet) för en linje som skär x-axeln vid ' + parameters.x2 + ' och y-axeln vid ' + parameters.y1 + '?');
      break;
  }
}

slopeOfALine.helpElements = function(parameters) {
  var app = UiApp.getActiveApplication();
  if (parameters.type == 'graph') {
    return {
      help1 : app.createLabel('≥ betyder "större än eller lika med"'),
      help2 : app.createLabel('> betyder "större än"'),
      help3 : app.createLabel('≤ betyder "mindre än eller lika med"'),
      help4 : app.createLabel('< betyder "mindre än"')
    };
  }
  else {
    return {
      help1 : app.createLabel('Tips: Rita punkterna i ett koordinatsystem.'),
      help2 : app.createLabel('Svara antingen i bråkform eller med ett exakt decimaltal.')
    };
  }
}

slopeOfALine.answerElements = function(parameters) {
  var app = UiApp.getActiveApplication();
  if (parameters.type == 'graph') {
    var listBox = app.createListBox().setFocus(true);
    listBox.addItem('k ≥ 1', 'starkt positiv');
    listBox.addItem('1 ≥ k > 0', 'svagt positiv');
    listBox.addItem('k = 0', 'noll');
    listBox.addItem('0 > k ≥ -1', 'svagt negativ');
    listBox.addItem('k ≤ -1', 'starkt negativ');
    return {
      answer : listBox
    };
  }
  return {
    answer : app.createTextBox().setFocus(true)
  };
}

slopeOfALine.evaluateAnswer = function(parameters, input) {
  var code = -1;
  if (parameters.type == 'graph') {
    switch (input.answer) {
      case 'starkt positiv' :
        if (parameters.k >= 1) {
          code = 1;
        }
        break;
      case 'svagt positiv' :
        if (parameters.k > 0 && parameters.k <= 1) {
          code = 1;
        }
        break;
      case 'noll' :
        if (parameters.k == 0) {
          code = 1;
        }
        break;
      case 'svagt negativ' :
        if (parameters.k < 0 && parameters.k >= -1) {
          code = 1;
        }
        break;
      case 'starkt negativ' :
        if (parameters.k <= -1) {
          code = 1;
        }
        break;
    }
  }
  else {
    var k = (parameters.y2 - parameters.y1) / (parameters.x2 - parameters.x1);
    if (waxonUtils.evaluate(input.answer, undefined, ['/']) == k) {
      code = 1;
    }
    if (waxonUtils.evaluate(input.answer, undefined, ['/']) == undefined) {
      code = -2;
    }
  }
  return code;
};
