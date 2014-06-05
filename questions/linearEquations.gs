/**
 * @file: Question type for (rather simple) linear equations.
 */
var linearEquations = new waxonQuestion('linearEquations');

linearEquations.title = 'Linjära ekvationer';

linearEquations.generateParameters = function(options) {
  var left = '', right = '';
  switch (waxonUtils.randomSelect(['x', '()', 'a()'])) {
    case 'x' :
      left = 'x';
      break;
    case '()' :
      left = waxonUtils.randomBinomial();
      break;
    case 'a()' :
      left = waxonUtils.randomInt(-3, 3, [0]) + '(' + waxonUtils.randomBinomial() + ')';
      break;
  }
  switch (waxonUtils.randomSelect(['x', 'a', '()', 'a()'])) {
    case 'x' :
      right = 'x';
      break;
    case 'a' :
      right = waxonUtils.randomInt(-3, 3, [0]);
      break;
    case '()' :
      right = waxonUtils.randomBinomial();
      break;
    case 'a()' :
      right = waxonUtils.randomInt(-3, 3, [0]) + '(' + waxonUtils.randomBinomial() + ')';
      break;
  }
  if (waxonUtils.randomSelect(['straight', 'reverse']) == 'reverse') {
    var tmp = left;
    left = right;
    right = tmp;
  }
  
  // Check that left side and right side aren't linearly dependent.
  var diff1 = Parser.parse(waxonUtils.preParseExpression(left, ['x'])).evaluate({x : 0}) - Parser.parse(waxonUtils.preParseExpression(right, ['x'])).evaluate({x : 0});
  var diff2 = Parser.parse(waxonUtils.preParseExpression(left, ['x'])).evaluate({x : 1}) - Parser.parse(waxonUtils.preParseExpression(right, ['x'])).evaluate({x : 1});
  if (diff1 == diff2) {
    return linearEquations.generateParameters(options);
  }
  else {
    return {
      left : left,
      right : right,
      expression : left + '=' + right,
    };
  }
};

linearEquations.questionElements = function(parameters) {
  var app = UiApp.getActiveApplication();
  var label = app.createLabel('Lös ut x ur följande ekvation:');
  var expression = waxonUtils.latex2image(parameters.expression);
  var help = app.createLabel('Svara i exakt form: antingen ett exakt decimaltal eller ett bråktal.');
  return {
    label : label,
    expression : expression,
    help : help,
  }
};

linearEquations.answerElements = function(parameters) {
  var app = UiApp.getActiveApplication();
  var label = app.createLabel('x =');
  var answer = app.createTextBox();
  return {
    label : label,
    answer : answer,
  }
};


linearEquations.evaluateAnswer = function(parameters, input) {
  var answerValue = Parser.parse(waxonUtils.preParseExpression(input.answer, ['x'])).evaluate();
  var leftValue = Parser.parse(waxonUtils.preParseExpression(parameters.left, ['x'])).evaluate({x : answerValue});
  var rightValue = Parser.parse(waxonUtils.preParseExpression(parameters.right, ['x'])).evaluate({x : answerValue});
  Logger.log(leftValue);
  Logger.log(rightValue);

  if (leftValue.toFixed(10) == rightValue.toFixed(10)) {
    return 1;
  }
  else {
    return -1;
  }
  if (waxonUtils.numberOfTerms(input.answer) > 1) {
    return {
      code : Math.min(result, -3),
      message : 'Ditt uttryck har fler än två termer. Se om du kan förenkla det (eller om du räknat fel).',
    };
  }

  return result;
};
