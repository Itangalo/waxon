/**
 * @file: Question type for completing the square by ansatz.
 */
var q = new waxonQuestion('completingTheSquareBase');

q.title = 'Kvadratkomplettering genom ansats';
q.shortTitle = 'Kvadratkomplettering';

q.dependencies = {
  math : {apiVersion : 1, subVersion : 3},
  utils : {apiVersion : 1, subVersion : 1},
};

q.defaults = new configObject({
  'type' : gash.utils.randomSelect({a : 1, d : 1, ad2: 1, e : 1}),
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
  var formula = '\\begin{matrix}&uux^2 & + & vvx & + & ww\\\\ =&aax^2 & + & 2aaddx &+& aadd^2+ee \\end{matrix}';
  var label;
  var a = parameters.a;
  var d = parameters.d;
  switch (parameters.type) {
    case 'a' :
      label = 'Uttrycket nedan ska kvadratkompletteras. <strong>Vad blir värdet på a?</strong>';
      formula = formula.replace('uu', '{\\color{Blue} uu}');
      formula = formula.replace(/aa/g, '{\\color{Blue} a}');
      break;
    case 'd' :
      label = 'Uttrycket nedan ska kvadratkompletteras. Vi vet att a = ' + gash.math.findFraction(a).plainText + '. <strong>Vad blir värdet på d?</strong>';
      formula = formula.replace('vv', '{\\color{Blue} vv}');
      formula = formula.replace(/2aadd/g, '{\\color{Blue} 2ad}');
      break;
    case 'ad2' :
      label = 'Uttrycket nedan ska kvadratkompletteras. Vi vet att a = ' + gash.math.findFraction(a).plainText + ' och d = ' + gash.math.findFraction(d).plainText + '. <strong>Vad blir ad^2?</strong>';
      formula = formula.replace(/aadd\^2/g, '{\\color{Blue} ad^2}');
      break;
    case 'e' :
      label = 'Uttrycket nedan ska kvadratkompletteras. Vi vet att a = ' + gash.math.findFraction(a).plainText + ' och d = ' + gash.math.findFraction(d).plainText + '. <strong>Vad blir värdet på e?</strong>';
      formula = formula.replace('ww', '{\\color{Blue} ww}');
      formula = formula.replace(/aadd\^2\+ee/g, '{\\color{Blue} ad^2+e}');
      break;
  }
  formula = formula.replace('uu', gash.math.latexFraction(parameters.a, {skipOnes : true}));
  formula = formula.replace('vv', gash.math.latexFraction(parameters.b, {skipOnes : true}));
  formula = formula.replace('ww', gash.math.latexFraction(parameters.c));
  formula = formula.replace(/aa/g, 'a');
  formula = formula.replace(/dd/g, 'd');
  formula = formula.replace(/ee/g, 'e');
  return {
    label : label + '  ',
    formula : gash.math.latex2image(formula),
    space : '<br/><br/>',
    square : gash.math.latex2image('=a(x+d)^2+e'),
  };
}

q.questionToString = function(parameters) {
  var expression = gash.math.findFraction(parameters.a).noOnes + 'x² + ' + gash.math.findFraction(parameters.b).noOnes + 'x + ' + gash.math.findFraction(parameters.c).plainText;
  var labels = {
    a : expression + ' ska kvadratkompletteras. <strong>Vad blir värdet på a?</strong>',
    d : expression + ' ska kvadratkompletteras. a = ' + gash.math.findFraction(parameters.a).plainText + '. Vad blir d?',
    ad2 : expression + ' ska kvadratkompletteras. a = ' + gash.math.findFraction(parameters.a).plainText + ' och d = ' + gash.math.findFraction(parameters.d).plainText + '. Vad blir ad^2?',
    e : expression + ' ska kvadratkompletteras. a = ' + gash.math.findFraction(parameters.a).plainText + ' och d = ' + gash.math.findFraction(parameters.d).plainText + '. Vad blir e?',
  };
  return labels[parameters.type];
}

q.answerElements = function(parameters) {
  var app = UiApp.getActiveApplication();
  var elements;
  var answerBox = app.createTextBox().setFocus(true).setWidth(50).setHeight(50).setStyleAttribute('verticalAlign', 'middle');
  switch (parameters.type) {
    case 'a' :
      elements = {
        answer : answerBox,
        expression : gash.math.latex2image('(x+d)^2+e').setStyleAttribute('verticalAlign', 'middle')
      };
      break;
    case 'd' :
      elements = {
        expression1 : gash.math.latex2image(gash.math.latexFraction(parameters.a) + '(x+').setStyleAttribute('verticalAlign', 'middle'),
        answer : answerBox,
        expression2 : gash.math.latex2image(')^2+e').setStyleAttribute('verticalAlign', 'middle')
      };
      break;
    case 'ad2' :
      elements = {
        label : 'ad² = ',
        answer : answerBox
      };
      break;
    case 'e' :
      elements = {
        expression1 : gash.math.latex2image(gash.math.latexFraction(parameters.a) + '(x+' + gash.math.latexFraction(parameters.d) + ')^2 + ').setStyleAttribute('verticalAlign', 'middle'),
        answer : answerBox
      };
      break;
  }
  return elements;
};

q.evaluateAnswer = function(parameters, input) {
  var correctAnswer;
  switch (parameters.type) {
    case 'a' :
      correctAnswer = parameters.a;
      break;
    case 'd' :
      correctAnswer = parameters.d;
      break;
    case 'ad2' :
      correctAnswer = parameters.a * parameters.d * parameters.d;
      break;
    case 'e' :
      correctAnswer = parameters.e;
      break;
  }
  return gash.algebra.compareExpressions(correctAnswer, input.answer);
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
//    help1 : helps[parameters.type],
//    separator : '<hr/>  ',
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
};
