/**
 * @file: Question type for (rather simple) linear equations.
 */
var q = new waxonQuestion('linearEquationsBase');

q.title = 'Linjära ekvationer';
q.shortTitle = 'Ekvationer';

q.dependencies = {
  math : {apiVersion : 1, subVersion : 6},
  algebra : {apiVersion : 1, subVersion : 1},
  utils : {apiVersion : 1, subVersion : 1},
};

q.defaults = new configObject({
  leftExpressionType : gash.utils.randomSelect(['x', 'ax', '()', 'a()']),
  rightExpressionType : gash.utils.randomSelect(['a', 'x', 'ax', '()', 'a()']),
  min : -3,
  max : 3,
  variable : 'x',
  maxDenominator : 1
});

q.generateParameters = function(options) {
  options = this.defaults.overwriteWith(options);
  options.a1 = options.a1 || gash.utils.randomInt(options.min, options.max, [0]);
  options.a2 = options.a2 || gash.utils.randomInt(options.min, options.max, [0]);

  var options2 = {
    maxDenominator : options.maxDenominator,
    variable : options.variable,
    mode : options.mode,
  }
  var leftBin = options.leftBin || gash.math.randomBinomial(options.min, options.max, options2);
  var rightBin = options.rightBin || gash.math.randomBinomial(options.min, options.max, options2);
  // If left and right binomials are equal, we may get equations with no or infinite number of solutions.
  while (gash.algebra.compareExpressions(leftBin.plainText, rightBin.plainText) == gash.CORRECT) {
    var rightBin = gash.math.randomBinomial(options.min, options.max, options2);
  }

  switch (options.leftExpressionType) {
    case 'x' :
      options.left = options.variable;
      break;
    case 'ax' :
      options.left = '' + gash.math.findFraction(options.a1).noOnes + options.variable;
      break;
    case '()' :
      options.left = leftBin.plainText;
      break;
    case 'a()' :
      options.left = '' + gash.math.findFraction(options.a1).noOnes + '(' + leftBin.plainText + ')';
      break;
  }
  switch (options.rightExpressionType) {
    case 'a' :
      options.right = options.a2;
      // We don't want a trivial equation like 'x = 4'.
      if (options.left == options.variable) {
        options.right = rightBin.plainText;
      }
      break;
    case 'x' :
      options.right = options.variable;
      break;
    case 'ax' :
      options.right = '' + gash.math.findFraction(options.a2).noOnes + options.variable;
      break;
    case '()' :
      options.right = rightBin.plainText;
      break;
    case 'a()' :
      options.right = '' + gash.math.findFraction(options.a2).noOnes + '(' + rightBin.plainText + ')';
      break;
  }

  // There is a small chance that we have linearly dependent left and right sides, leading
  // to no or infinite number of solutions.
  var testValue1 = {};
  testValue1[options.variable] = 0;
  var testValue2 = {};
  testValue2[options.variable] = 1;
  if (gash.algebra.evaluate('(' + options.left + ')-(' + options.right + ')', testValue1)
      == gash.algebra.evaluate('(' + options.left + ')-(' + options.right + ')', testValue2)) {
    options.right += '+' + options.variable;
  }

  if (options.noSwitch != true && gash.utils.randomSelect(['straight', 'reverse']) == 'reverse') {
    var tmp = options.left;
    options.left = options.right;
    options.right = tmp;
  }

  options.expression = options.left + ' = ' + options.right;
  return options;
};

q.questionElements = function(parameters) {
  return {
    line1 : 'Lös ut ' + parameters.variable + ' ur följande ekvation.  ',
    equation : gash.math.latex2image(parameters.expression),
    lineBreak : '<br/>',
    line2 : '<strong>Svara exakt</strong>, det vill säga med ett bråk eller ett exakt decimaltal.  ',
  };
};

q.questionToString = function(parameters) {
  return parameters.expression;
};

q.answerElements = function(parameters) {
  return {
    label : parameters.variable + ' = ',
    answer : UiApp.getActiveApplication().createTextBox().setFocus(true)
  };
}

q.evaluateAnswer = function (parameters, input) {
  var value = gash.algebra.evaluate(input.answer, [], {allowedOperators : ['/']});

  if (value == undefined) {
    return {
      code : waxon.CANNOT_INTERPRET,
      message : 'Kunde inte tolka ditt svar. Svara med ett heltal eller bråktal.',
    };
  }

  var testValue = {};
  testValue[parameters.variable] = value;
  var diff = gash.algebra.evaluate('(' + parameters.left + ')-(' + parameters.right + ')', testValue);
  if (diff == undefined) {
    return {
      code : waxon.CANNOT_INTERPRET,
      message : 'Kunde inte utvärdera ditt svar av någon anledning. Sorry.'
    };
  }
  else if (diff.toFixed(gash.math.defaults.precision) == 0) {
    return waxon.CORRECT;
  }
  else if (diff.toFixed(2) == 0) {
    return {
      code : waxon.CLOSE,
      message : 'Ditt svar verkar vara avrundat. Svara i bråkform istället!'
    };
  }
  else {
    return waxon.INCORRECT;
  }
};

q.helpElements = function(parameters) {
  return {
    label1 : 'Lösa ekvationer med parenteser, version 1:  ',
    link1 : 'https://www.youtube.com/watch?v=pm4X_q1P34Q  ',
    label2 : 'Lösa ekvationer med parenteser, version 2:  ',
    link2 : 'https://www.youtube.com/watch?v=u6mNFjndOyA  ',
  };
};

q.tests = {
  basics : function() {
    var options = {
      leftExpressionType : 'x',
      rightExpressionType : 'a()',
      a2 : 3,
      rightBin : gash.math.randomBinomial(-3, 3, {variable : 't', a : 2, b : 3, mode : 'straight'}),
      min : -3,
      max : 3,
      variable : 't',
      mode : 'straight',
      noSwitch : true,
    };
    var parameters = waxon.questions.linearEquationsBase.generateParameters(options);
    if (parameters.expression != 't = 3(2t+3)') {
      throw 'Expression is not built correctly.';
    }
    var input = {
      answer : '-9/5'
    };
    if (waxon.questions.linearEquationsBase.evaluateAnswer(parameters, input) != waxon.CORRECT) {
      throw 'Correct answer is evaluated as wrong.';
    }
    input = {
      answer : '-1.799999'
    };
    if (waxon.questions.linearEquationsBase.evaluateAnswer(parameters, input).code != waxon.CLOSE) {
      throw 'Seemingly rounded answers are not evaluate correctly.';
    }
    input = {
      answer : 'bananas'
    };
    if (waxon.questions.linearEquationsBase.evaluateAnswer(parameters, input).code != waxon.CANNOT_INTERPRET) {
      throw 'Answers that are bananas are not processed correctly.';
    }

    options.rightExpressionType = 'x';
    var parameters = waxon.questions.linearEquationsBase.generateParameters(options);
    if (parameters.expression != 't = t+t') {
      throw 'Linearly dependent left and right sides are not treated correctly (case x=x).';
    }
    options.rightExpressionType = 'ax';
    options.a2 = -1;
    var parameters = waxon.questions.linearEquationsBase.generateParameters(options);
    if (parameters.expression != 't = -t') {
      throw 'Coefficients for variables are not simplified in case of ±1.';
    }
    options.rightBin = gash.math.randomBinomial(-3, 3, {variable : 't', a : 1, b : 3, mode : 'straight'});
    options.rightExpressionType = '()';
    var parameters = waxon.questions.linearEquationsBase.generateParameters(options);
    if (parameters.expression != 't = t+3+t') {
      throw 'Linearly dependent left and right sides are not treated correctly (case x=x+a).';
    }
  }
};
