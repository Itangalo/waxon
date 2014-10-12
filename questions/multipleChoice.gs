/**
 * @file: Question type for recognizing some basic properties of parabolas.
 */
var q = new waxonQuestion('multipleChoiceBase');

q.title = 'Multiple choice questions';
q.shortTitle = 'Multiple choice';

q.dependencies = {
  utils : {apiVersion : 1, subVersion : 1},
};

q.questionLabel = 'Select the correct answer:  ';
q.selectList = ['answer 1', 'answer 2', 'answer 3'];

q.defaults = new configObject({});

q.generateParameters = function(options) {
  options = this.defaults.overwriteWith(options);
  if (this.questions[options.index] == undefined) {
    options.index = gash.utils.randomInt(0, this.questions.length - 1);
  }

  return options;
}

q.questionElements = function(parameters) {
  var question = this.questions[parameters.index];
  return {
    description: question.description
  };
}

q.questionToString = function(parameters) {
  return this.questions[parameters.index].description;
}

q.answerElements = function(parameters) {
  var question = this.questions[parameters.index];

  var app = UiApp.getActiveApplication();
  var listBox = app.createListBox().setFocus(true);
  var items = question.selectList || this.selectList;
  for (var i in items) {
    listBox.addItem(items[i], items[i]);
  }

  return {
    label : question.questionLabel || this.questionLabel,
    answerSelect : listBox
  };
};

q.answerToString = function(parameters, input) {
  return input.answerSelect;
}

q.evaluateAnswer = function(parameters, input) {
  var question = this.questions[parameters.index];
  if (input.answerSelect == question.correct) {
    return waxon.CORRECT;
  }
  else {
    return waxon.INCORRECT;
  }
};

// Two examples of how multiple choice question items may be created.
q.questions = [];
// This question item uses the default select list and question label.
q.questions.push({
  description : 'When in doubt, select the first answer at hand.',
  correct : 'answer 1',
});
// The question overrides the default settings.
q.questions.push({
  description : 'Which bed fits Goldilock best?',
  questionLabel : 'The order you see the options might not be the order Goldilock saw them.  ',
  selectList : ['the big one', 'the middle one', 'the small one'],
  correct : 'the middle one',
});

q.tests = {
  basics : function() {
    var parameters = waxon.questions.multipleChoiceBase.generateParameters({index : 0});
    if (parameters.index != 0) {
      throw 'Parameters are not built correctly.';
    }
    var input = {answerSelect : 'answer 1'};
    if (waxon.questions.multipleChoiceBase.evaluateAnswer(parameters, input) != waxon.CORRECT) {
      throw 'Correct answer is not evaluated as correct.';
    }
    var input = {answerSelect : 'answer 2'};
    if (waxon.questions.multipleChoiceBase.evaluateAnswer(parameters, input) == waxon.CORRECT) {
      throw 'Incorect answers are not evaluated as incorrect.';
    }
  }
};
