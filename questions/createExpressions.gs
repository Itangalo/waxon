/**
 * @file: Question type for creating algebraic expressions and equations.
 */
var q = new waxonQuestion('createExpressions');

q.title = 'Skapa algebraiska uttryck';
q.shortTitle = 'Skapa uttryck';

q.dependencies = {
  math : {apiVersion : 1, subVersion : 3},
  algebra : {apiVersion : 1, subVersion : 1},
  utils : {apiVersion : 1, subVersion : 1},
};

q.defaults = new configObject({});

q.generateParameters = function(options) {
  // Only thing we need to remember in this question type is which question we are using.
  return {
    index : gash.utils.randomInt(0, this.questions.length - 1),
  };
}

q.questionElements = function(parameters) {
  return {
    question : this.questions[parameters.index].description
  };
}

q.questionToString = function(parameters) {
  return this.questions[parameters.index].description;
}

q.answerElements = function(parameters) {
  var question = this.questions[parameters.index];
  var app = UiApp.getActiveApplication();

  var items = {};
  for (var i in question.variables) {
    if (question.variables[i] == 'hidden') {
      items[i] = app.createTextBox().setValue(i).setVisible(false);
    }
    else {
      items[i + '-label'] = question.variables[i];
      items[i] = app.createTextBox().setMaxLength(1).setWidth(20);
      items[i + '-break'] = '<br/>';
    }
  }
  items.answerLabel = question.questionLabel;
  items.answer = app.createTextBox();

  return items;
};

q.evaluateAnswer = function(parameters, input) {
  var result;
  var question = this.questions[parameters.index];
  input.answer = input.answer.toLowerCase();
  var userVariables = [];
  for (var i in question.variables) {
    userVariables.push(input[i].toLowerCase());
  }

  if (question.isEquation != true) {
    return gash.algebra.compareExpressions(question.correctExpression, input.answer, Object.keys(question.variables), userVariables);
  }

  var parts = input.answer.split('=');
  if (input.answer.split('=').length != 2) {
    return {
      code : waxon.WRONG_FORM,
      message : 'Ditt svar verkar inte vara en ekvation.',
    }
  }
  result = gash.algebra.compareEquations(question.correctExpression, input.answer, question.freeVar, question.substitutions, userVariables);
  if (result == waxon.CANNOT_INTERPRET) {
    return {
      code : waxon.WRONG_FORM,
      message : 'Din ekvation kunde inte tolkas. Innehåller den rätt variabler?',
    }
  }
  if (result == waxon.WRONG_FORM) {
    return {
      code : waxon.WRONG_FORM,
      message : 'Det verkar som att du skrivit en ekvation där vänster- och högerled alltid har samma värde.',
    }
  }

  return result;
};

q.helpElements = function(parameters) {
  return {
    help1 : 'Om du har svårt att hitta samband, testa att ange enkla värden på dina variabler (0, 1, 2…) och räkna på vad andra variabler får för värden.  ',
    help2 : 'Fundera på <em>hur</em> räknar ut, och försök hitta en ekvation som beskriver sambandet.  ',
    help3 : 'Ett <strong>uttryck</strong> är exmepelvis "x+2", och innehåller oftast både tal och variabler.  ',
    help4 : 'En <strong>ekvation</strong> är exmepelvis "x+2 = y+1", och innehåller en likhet mellan två uttryck.  ',
  };
}

// Two examples of how questions can be declared; one expression and one equation.
q.questions = [
  {
    description : 'There is already 7 cm of snow on the ground when it starts snowing in the middle of the night. 3 cm of snow falls each hour. Write a function f(t) describing the thickness of the snow after t hours.',
    variables : {
      t : 'hidden', // Setting the variable description to 'hidden' hides it from the UI.
    },
    questionLabel : 'f(t)=',
    correctExpression : '7+3t',
  },

  {
    description : 'Goliath weighs twice as much as David. Write this relation as an equation.',
    variables : {
      // Setting a variable description allows/forces the user to decide the variable name herself.
      D : 'Variable for David\'s weight:',
      G : 'Variable for Goliaths\'s weight:',
    },
    questionLabel : 'Equation:',
    correctExpression : 'G=2D',
    isEquation : true,
    // The user-entered equation will be compared to the correct one by varying the value of the free variable.
    freeVar : 'D',
    // If the equation involves more than one variable, you must provide a list of substitutions that can
    // be used to reduce the equation to one variable only. (This is for evaluation purposes.)
    substitutions : {
      G : '2*D',
    },
  }
];

q.tests = {
  equationsWork : function() {
    // Create a single question for the question list.
    waxon.questions.createExpressions.questions = [{
      description : 'Goliath weighs twice as much as David. Write this relation as an equation.',
      variables : {
        D : 'Variable for David\'s weight:',
        G : 'Variable for Goliaths\'s weight:',
      },
      questionLabel : 'Equation:',
      correctExpression : 'G=2D',
      isEquation : true,
      freeVar : 'D',
      substitutions : {
        G : '2*D',
      },
    }];
    var parameters = waxon.questions.createExpressions.generateParameters();
    var input = {
      D : 'a',
      G : 'b',
      answer : '2a=b'
    };
    if (waxon.questions.createExpressions.evaluateAnswer(parameters, input) != waxon.CORRECT) {
      throw 'Correct answers are evaluated as wrong.';
    }
    input = {
      D : 'g',
      G : 'd',
      answer : '2G=D'
    };
    if (waxon.questions.createExpressions.evaluateAnswer(parameters, input) != waxon.CORRECT) {
      throw 'Advanced variable replacements are not working. Maybe problems with upper/lower case?';
    }
  }
};
