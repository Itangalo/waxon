/**
 * @file: Question type for (rather simple) linear equations.
 */
var linearEquations = new waxonQuestion('linearEquations');

linearEquations.title = 'Linjära ekvationer';

linearEquations.generateParameters = function(options) {
  var variable = options.variable || 'x';
  var leftExpressionType = waxonUtils.randomSelect(options.leftExpressionType || ['x', 'ax', '()', 'a()']);
  var rightExpressionType = waxonUtils.randomSelect(options.rightExpressionType || ['a', 'x', 'ax', '()', 'a()']);

  // Build left and right expressions.
  var left = '', right = '';
  switch (leftExpressionType) {
    case 'x' :
      left = variable;
      break;
    case 'ax' :
      left = waxonUtils.randomInt(-3, 3, [0, 1]) + variable;
      break;
    case 'a()' :
      left = waxonUtils.randomInt(-3, 3, [0, 1]) + '(' + waxonUtils.randomBinomial(-3, 3, variable) + ')';
      break;
    case '()' :
    default :
      left = waxonUtils.randomBinomial(-3, 3, variable);
      break;
  }
  switch (rightExpressionType) {
    case 'x' :
      right = 'x';
      break;
    case 'a' :
      // We don't want an quation of the type 'x = 4'.
      if (left == 'x') {
        right = waxonUtils.randomBinomial(-3, 3, variable);
      }
      else {
        right = waxonUtils.randomInt(-3, 3, [0]);
      }
      break;
    case 'ax' :
      right = waxonUtils.randomInt(-3, 3, [0, 1]) + 'x';
      break;
    case 'a()' :
      right = waxonUtils.randomInt(-3, 3, [0, 1]) + '(' + waxonUtils.randomBinomial(-3, 3, variable) + ')';
      break;
    case '()' :
    default :
      right = waxonUtils.randomBinomial(-3, 3, variable);
      break;
  }
  if (options.noSwitch != true && waxonUtils.randomSelect(['straight', 'reverse']) == 'reverse') {
    var tmp = left;
    left = right;
    right = tmp;
  }

  // Check that left side and right side aren't linearly dependent.
  var evals = {};
  evals[variable] = 0;
  var diff1 = Parser.parse(waxonUtils.preParseExpression(left)).evaluate(evals) - Parser.parse(waxonUtils.preParseExpression(right)).evaluate(evals);
  evals[variable] = 1;
  var diff2 = Parser.parse(waxonUtils.preParseExpression(left)).evaluate(evals) - Parser.parse(waxonUtils.preParseExpression(right)).evaluate(evals);
  if (diff1 == diff2) {
    return linearEquations.generateParameters(options);
  }
  else {
    return {
      variable : variable,
      left : left,
      right : right,
      expression : left + '=' + right,
    };
  }
};

linearEquations.questionElements = function(parameters) {
  var app = UiApp.getActiveApplication();
  var label = app.createLabel('Lös ut ' + parameters.variable + ' ur följande ekvation:');
  var expression = waxonUtils.latex2image(parameters.expression);
  return {
    label : label,
    expression : expression,
  }
};

linearEquations.answerElements = function(parameters) {
  var app = UiApp.getActiveApplication();
  var label = app.createLabel(parameters.variable + ' =');
  var answer = app.createTextBox();
  var help = app.createLabel('Svara i exakt form: antingen ett exakt decimaltal eller ett bråktal.');
  return {
    label : label,
    answer : answer,
    help : help,
  }
};

linearEquations.evaluateAnswer = function(parameters, input) {
  var answerValue = Parser.parse(waxonUtils.preParseExpression(input.answer)).evaluate();
  var evals = {};
  evals[parameters.variable] = answerValue;
  var leftValue = Parser.parse(waxonUtils.preParseExpression(parameters.left)).evaluate(evals);
  var rightValue = Parser.parse(waxonUtils.preParseExpression(parameters.right)).evaluate(evals);

  if (leftValue.toFixed(10) == rightValue.toFixed(10)) {
    return 1;
  }
  else if (leftValue.toFixed(2) == rightValue.toFixed(2)) {
    return {
      code : 0,
      message : 'Ditt svar verkar vara avrundat. Svara i bråkform istället!'
    };
  }
  else {
    return -1;
  }
};
