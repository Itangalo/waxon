/**
 * @file: Question type for calculating the equation of a line, on slope form.
 * This question type requires the gashMath framework.
 * (https://github.com/Itangalo/gash)
 */

// Create a new object, inheriting properties from 'waxonQuestion'.
var lineOnSlopeForm = new waxonQuestion('lineOnSlopeForm');

lineOnSlopeForm.title = 'Hitta ekvation för räta linjer';

lineOnSlopeForm.generateParameters = function(options) {
  var x1 = (waxonUtils.randomInt(-6, 6) / 2);
  var y1 = (waxonUtils.randomInt(-6, 6) / 2);
  var x2 = (waxonUtils.randomInt(-6, 6, [x1 * 2, 0]) / 2);
  var y2 = (waxonUtils.randomInt(-6, 6) / 2);
  var type = waxonUtils.randomSelect({
    graph : 1,
    points : 2,
    pointAndSlope : 1,
    intercepts : 1,
  });
  if (type == 'intercepts') {
    x1 = 0;
    y2 = 0;
  }
  if (type == 'pointAndSlope') {
    var k = waxonUtils.randomInt(-6, 6) / 2;
  }
  else {
    var k = (y2 - y1) / (x2 - x1);
  }
  var m = y1 - k * x1;
  return {
    type : type,
    x1 : x1,
    y1 : y1,
    x2 : x2,
    y2 : y2,
    k : k,
    m : m
  };
};

lineOnSlopeForm.questionElements = function(parameters) {
  var app = UiApp.getActiveApplication();
  switch (parameters.type) {
    case 'graph' :
      var points = Charts.newDataTable().addColumn(Charts.ColumnType.NUMBER, 'x').addColumn(Charts.ColumnType.NUMBER, 'y');
      points.addRow([parameters.x1, parameters.y1]).addRow([parameters.x2, parameters.y2]).build();
      var graph = Charts.newScatterChart().setDataTable(points).setDimensions(320, 200).setLegendPosition(Charts.Position.NONE);
      graph = graph.setXAxisRange(-3, 3).setYAxisRange(-3, 3).build();
      return {
        label : app.createLabel('Hitta ekvationen för linjen som går genom de här två punkterna.'),
        graph : app.createSimplePanel().add(graph)
      }
      break;
    case 'points' :
      return {
        label : app.createLabel('Hitta ekvationen för linjen som går genom punkterna (' + parameters.x1 + ', ' + parameters.y1 + ') och (' + parameters.x2 + ', ' + parameters.y2 + ').')
      }
      break;
    case 'pointAndSlope' :
      return {
        label : app.createLabel('Hitta ekvationen för linjen som går genom punkten (' + parameters.x1 + ', ' + parameters.y1 + ') och har riktningskoefficienten ' + parameters.k + '.')
      }
      break;
    case 'intercepts' :
      return {
        label : app.createLabel('Vad är ekvationen för linjen som skär x-axeln vid ' + parameters.x2 + ' och y-axeln vid ' + parameters.y1 + '?'),
      }
      break;
  }
};

lineOnSlopeForm.questionToString = function(parameters) {
  var app = UiApp.getActiveApplication();
  switch (parameters.type) {
    case 'graph' :
      return 'Hitta ekvationen för punkterna i grafen.';
      break;
    case 'points' :
      return ('Hitta ekvationen för linjen som går genom punkterna (' + parameters.x1 + ', ' + parameters.y1 + ') och (' + parameters.x2 + ', ' + parameters.y2 + ').');
      break;
    case 'pointAndSlope' :
      return {
        label : app.createLabel('Hitta ekvationen för linjen som går genom punkten (' + parameters.x1 + ', ' + parameters.y1 + ') och har riktningskoefficienten ' + parameters.k + '.')
      }
      break;
    case 'intercepts' :
      return {
        label : app.createLabel('Vad är ekvationen för linjen som skär x-axeln vid ' + parameters.x2 + ' och y-axeln vid ' + parameters.y1 + '?')
      }
      break;
  }
}

lineOnSlopeForm.helpElements = function(parameters) {
  var app = UiApp.getActiveApplication();
  return {
    help1 : app.createLabel('Tips: Rita punkterna i ett koordinatsystem (exempelvis i GeoGebra).'),
    help2 : app.createLabel('Svara antingen i bråkform eller med exakta decimaltal.')
  };
}

lineOnSlopeForm.answerElements = function(parameters) {
  var app = UiApp.getActiveApplication();
  return {
    label : app.createLabel('y ='),
    answer : app.createTextBox().setFocus(true)
  };
}

lineOnSlopeForm.evaluateAnswer = function(parameters, input) {
  var correctExpression = parameters.k + '*x' + '+' + parameters.m;
  var code = waxonUtils.compareExpressions(correctExpression, input.answer);
  if (code > 0 && waxonUtils.numberOfTerms(input.answer) > 2) {
    return {
      code : 0,
      message : 'Ditt svar stämmer, men innehåller fler än två termer. Förenkla uttrycket!'
    }
  }
  return code;
};
