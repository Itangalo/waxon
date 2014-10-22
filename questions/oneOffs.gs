/**
 * @file: Question type for one-off open questions.
 */
var q = new waxonQuestion('oneOffsBase');

q.title = 'One-offs';
q.shortTitle = 'One-offs';

q.dependencies = {
  utils : {apiVersion : 1, subVersion : 1},
};

q.defaults = new configObject({
  method : 'mail',
});

q.generateParameters = function(options) {
  options = this.defaults.overwriteWith(options);
  if (this.questions[options.index] == undefined) {
    options.index = gash.utils.randomInt(0, this.questions.length - 1);
  }
  return options;
};

q.parseElements = function(obj, propertyName, parameters) {
  if (typeof obj[propertyName] == 'string') {
    var response = {};
    response[propertyName] = obj[propertyName];
    return response;
  }
  if (typeof obj[propertyName] == 'object') {
    return obj[propertyName];
  }
  if (typeof obj[propertyName] == 'function') {
    var elements = obj[propertyName](parameters);
    if (typeof elements == 'string') {
      var response = {};
      response[propertyName] = elements;
      return response;
    }
    else if (typeof elements == object) {
      return elements
    }
  }
  return {};
}

q.questionElements = function(parameters) {
  return this.parseElements(this.questions[parameters.index], 'question', parameters);
};

q.questionToString = function(parameters) {
  return 'Fråga nr ' + (parameters.index + 1);
};

q.answerElements = function(parameters) {
  switch (parameters.method) {
    case 'mail' :
      return {
        answer : UiApp.getActiveApplication().createTextArea().setWidth('100%').setHeight('170').setFocus(true)
      }
      break;
    default :
      return {
        answer : 'There is no method for answering this question. Sorry.'
      }
  }
}

q.evaluateAnswer = function (parameters, input) {
  var studentId = waxon.getUser();
  var recipients = [studentId];
  // Add all the student's teachers as recipients.
  for (var teacher in gash.waxon.frame.studentGroups) {
    if (gash.waxon.frame.studentGroups[teacher][studentId] != undefined) {
      recipients.push(teacher);
    }
  }

  for (var i in recipients) {
    MailApp.sendEmail(recipients[i], 'Svar på ' + this.shortTitle + ' (fråga ' + (parameters.index + 1) + ')', input.answer);
  }

  return {
    code : waxon.NO_NEED_TO_EVALUATE,
    message : 'Tack för ditt svar! Det har mailats till de här adresserna: ' + recipients.join(', ')
  };
};

q.helpElements = function(parameters) {
  return this.parseElements(this.questions[parameters.index], 'help', parameters);
};

q.tests = {
};

q.questions = [];

// Two example questions. Question and help properties can be strings, objects or functions.
// (Functions may return a string or an object.)
q.questions.push({
  question : 'How are we feeling today?',
  help : {
    label1 : 'Did something make you extra happy?  ',
    label2 : 'Did something unexpected happen?  '
  }
});

q.questions.push({
  question : {
    line1 : 'Jane said to Michael:  ',
    line2 : '– What do you want to do with your topence?  ',
    line3 : '<br/>  ',
    line4 : '<strong>What do you think he should answer?</strong>  '
  },
  help : function(parameters) {
    return 'Use your imagination. There is no right or wrong answer.';
  }
});
