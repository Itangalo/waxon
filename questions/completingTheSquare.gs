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
  'type' : gash.utils.randomSelect({a : 1, d : 1, ad2 : 1, e : 1, all : 1}),
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
    case 'all' :
      label = 'Kvadratkomplettera uttrycket nedan.';
      formula = formula.replace('vv', '{\\color{Pink} vv}');
      formula = formula.replace(/2aadd/g, '{\\color{Pink} 2ad}');
      formula = formula.replace('ww', '{\\color{Red} ww}');
      formula = formula.replace(/aadd\^2\+ee/g, '{\\color{Red} ad^2+e}');
      formula = formula.replace('uu', '{\\color{Blue} uu}');
      formula = formula.replace(/aa/g, '{\\color{Blue} a}');
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
    all : 'Kvadratkomplettera ' + expression
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
    case 'all' :
      elements = {
        a : answerBox,
        expression1 : gash.math.latex2image('(x+').setStyleAttribute('verticalAlign', 'middle'),
        d : app.createTextBox().setFocus(true).setWidth(50).setHeight(50).setStyleAttribute('verticalAlign', 'middle'),
        expression2 : gash.math.latex2image(')^2 + ').setStyleAttribute('verticalAlign', 'middle'),
        e : app.createTextBox().setFocus(true).setWidth(50).setHeight(50).setStyleAttribute('verticalAlign', 'middle'),
      };
      break;
  }
  return elements;
};

q.answerToString = function(parameters, input) {
  if (parameters.type == 'all') {
    return input.a + '(x + ' + input.d + ')² + ' + input.e;
  }
  else {
    return input.answer;
  }
}

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
    case 'all' :
      if (gash.algebra.compareExpressions(parameters.a, input.a) == waxon.CORRECT) {
        if (gash.algebra.compareExpressions(parameters.d, input.d) == waxon.CORRECT) {
          if (gash.algebra.compareExpressions(parameters.e, input.e) == waxon.CORRECT) {
            return waxon.CORRECT;
          }
          else {
            return {
              code : waxon.INCORRECT,
              message : 'a och d stämmer, men e stämmer inte. Glöm inte att räkna upphöjt till innan multiplikation!'
            }
          }
        }
        else {
          return {
            code : waxon.INCORRECT,
            message : 'a stämmer, men inte d. Testa att multiplicera ihop för att kontrollera ditt resultat.'
          }
        }
      }
      return {
        code : waxon.INCORRECT,
        message : 'Värdet på a stämmer inte. Det kan vara värt att titta på tidigare uppgifter och träna mer.'
      }
      break;
  }
  return gash.algebra.compareExpressions(correctAnswer, input.answer);
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
