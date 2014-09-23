/**
 * @file: Main file for waxon -- a framework for machine created and evaluated questions
 * built on top of Google Apps Script.
 */

/**
 * This project is licensed under GNU general public license. Feel free to
 * use, study, share and improve. See https://github.com/Itangalo/waxon/ for
 * source code and license details. The waxon project builds on the gash
 * framework. See https://github.com/Itangalo/gash/ for details.
 */

var waxon = new gashPlugin('waxon');

waxon.apiVersion = 2;
waxon.subVersion = 1;
waxon.dependencies = {
  gash : {apiVersion : 2, subVersion : 1},
  utils : {apiVersion : 1, subVersion : 1},
  areas : {apiVersion : 1, subVersion : 1},
};

/**
 * Response codes for evaluating answers.
 */
waxon.CORRECT = 1;
waxon.CLOSE = 0;
waxon.INCORRECT = -1;
waxon.WRONG_FORM = -2;
waxon.CANNOT_INTERPRET = -3;
waxon.SKIPPED = -10;

waxon.questionIds = {};
waxon.questions = {};
waxon.frame;

/**
 * The UI areas required by waxon.
 */
var questionArea = new gashArea('question');
var answerArea = new gashArea('answer');
var learnArea = new gashArea('learn');
var resultArea = new gashArea('result');
var aboutArea = new gashArea('about', {
  areaAttributes : {width : '810px', height : '40px', position : 'fixed', top : '600px', left : '70px', overflow : 'auto', border : 'none'},
  elementAttributes : {color : 'gray', fontSize : '0.75em'},
});

/**
 * Main entry point for waxon.
 */
waxon.doGet = function(queryInfo) {
  if (!(this.frame instanceof waxonFrame)) {
    gash.areas.question.add('There is no frame to use. You need to install a waxon question frame.');
    return;
  }

  var app = UiApp.getActiveApplication();
  app.setTitle(this.frame.title);

  var userData = {};
  var questionId, activeQuestion, parameters;
  userData = this.frame.resolveQuestion(userData);

  if (typeof userData.activeQuestion == 'string') {
    questionId = userData.activeQuestion;
    userData.activeQuestion = {
      questionId : questionId,
      parameters : this.questions[questionId].generateParameters()
    }
    userData.needsSaving = true;
  }
  else {
    questionId = userData.activeQuestion.questionId;
  }
  question = this.questions[questionId];
  parameters = userData.activeQuestion.parameters;

  var elements = question.questionElements(parameters)
  for (var i in elements) {
    if (typeof elements[i].setId == 'function') {
      elements[i].setId(i);
    }
    if (typeof elements[i].setName == 'function') {
      elements[i].setName(i);
    }
    gash.areas.question.add(elements[i]);
  }

  var elements = question.answerElements(parameters);
  for (var i in elements) {
    if (typeof elements[i].setId == 'function') {
      elements[i].setId(i);
    }
    if (typeof elements[i].setName == 'function') {
      elements[i].setName(i);
    }
    gash.areas.answer.add(elements[i]);
  }

  var answerHandler = app.createServerHandler('waxonAnswerSubmit');
  gash.areas.answer.add('');
  if (!question.hideAnswerButton) {
    gash.areas.answer.add(app.createButton('Skicka', answerHandler).setId('answerSubmit'));
  }
  if (!question.hideSkipButton) {
    gash.areas.answer.add(app.createButton('Hoppa över fråga', answerHandler).setId('answerSkip'), {float : 'right'});
  }

  if (!this.frame.hideHelp) {
    var elements = question.helpElements(parameters)
    for (var i in elements) {
      if (typeof elements[i].setId == 'function') {
        elements[i].setId(i);
      }
      if (typeof elements[i].setName == 'function') {
        elements[i].setName(i);
      }
      gash.areas.learn.add(elements[i]);
    }
  }

  if (!this.frame.hideResult) {
    this.frame.displayResult(userData);
  }

  if (userData.needsSaving) {
    // Do magic.
  }

  gash.areas.about.add('waxon is an open source framework for machine created and evaluated questions, used in Google Apps Script.');
  gash.areas.about.add('You can find more information about waxon at ');
  gash.areas.about.add('https://github.com/Itangalo/waxon');
}

function callback(eventInfo) {
  if (eventInfo.parameter.source == 'add') {
    gash.areas[eventInfo.parameter.area].add('added', {'color' : 'blue'});
  }
  if (eventInfo.parameter.source == 'clear') {
    gash.areas[eventInfo.parameter.area].clear();
  }
  return UiApp.getActiveApplication();
}

/**
 * Class for waxon questions, initializing the question.
 *
 * @param {string} [id= The unique id of this question.]
 * @param {configObject} [options= Any options, used as default when the question is called.]
 * return {waxonQuestion}
 */
function waxonQuestion(id, options) {
  if (waxon.questions[id] != undefined) {
    throw 'Cannot add question with ID ' + id + ': Name is taken.';
  }
  // Add the ID to the question ID list, and add a reference to the question in waxon.questions.
  waxon.questionIds[id] = id;
  waxon.questions[id] = this;

  // Add some required properties.
  this.id = id;
  this.title = id;
  this.shortTitle = id;
  if (typeof options != 'object') {
    options = {};
  }
  this.defaults = new configObject(options);

  return this;
}

/**
 * Generates parameters that dictates all moving parts in the question.
 *
 * The parameters are used to build all other parts of the question. They must describe the question
 * unambiguously, but could also contain extra information useful in other methods of the question.
 *
 * @param {object} [options= Any options passed in, for controlling how paramters are generated.]
 * return {object}
 */
waxonQuestion.prototype.generateParameters = function(options) {
  return {};
}

/**
 * Builds UI elements presenting the question, based on given parameters.
 *
 * @param {object} [parameters= The parameters describing moving parts of the question.]
 * return {object} [A set of UI elements that can be used by gash, keyed by the ID/name they should be given.]
 */
waxonQuestion.prototype.questionElements = function(parameters) {
  return {
    question : 'The question elements for ' + this.title + ' have not yet been overridden.'
  };
}

/**
 * Generates a plain-text string representing the question. Could be used in tool tip popups.
 *
 * @param {object} [parameters= The parameters describing moving parts of the question.]
 * return {string}
 */
waxonQuestion.prototype.questionToString = function(parameters) {
  return this.title + ' have no method of converting the question to a string.';
}

/**
 * Builds UI elements used for entering an answer to the question.
 *
 * @param {object} [parameters= The parameters describing moving parts of the question.]
 * return {object} [A set of UI elements that can be used by gash, keyed by the ID/name
 *   they should be given. No need to set ID or name -- this is done by the caller.]
 */
waxonQuestion.prototype.answerElements = function(parameters) {
  return {
    label : 'Svar',
    answer : UiApp.getActiveApplication().createTextBox()
  };
}

/**
 * Generates a plain-text string representing the answer. Could be used in text feedback.
 *
 * @param {object} [parameters= The parameters describing moving parts of the question.]
 * @param {object} [input= The answer form input.]
 * return {string}
 */
waxonQuestion.prototype.answerToString = function(parameters, input) {
  return input.answer;
}

/**
 * Evaluates the answer to the question.
 *
 * @param {object} [parameters= The parameters describing moving parts of the question.]
 * @param {object} [input= The answer form input.]
 * return {object} [Could be one of the answer codes described by waxon constants, or an
 *   object with one 'code' property (waxon constant) and a 'message' property with some
 *   feedback in plain text.]
 */
waxonQuestion.prototype.evaluateAnswer = function(parameters, input) {
  return {
    code : waxon.CANNOT_INTERPRET,
    message : this.title + ' does not have any method for evaluating answers.'
  };
}

/**
 * Builds UI elements used for providing help.
 *
 * Any help on input format should be added in answerElements -- this is for hints, video
 * links and on. (The help may be hidden in some waxon frames.)
 *
 * @param {object} [parameters= The parameters describing moving parts of the question.]
 * return {object} [A set of UI elements that can be used by gash, keyed by the ID/name
 *   they should be given.]
 */
waxonQuestion.prototype.helpElements = function(parameters) {
  return {
    label : this.title + ' does not have any help text or help links.'
  };
}

waxonFrame = function(id) {
  if (waxon.frame != undefined) {
    throw 'Cannot use frame ' + id + ': Another frame is already in use.';
  }
  waxon.frame = this;

  // Add some required properties.
  this.id = id;

  // Some properties that may be overridden.
  this.title = id;
  this.allowAnonymous = false;
  this.hideSkipButton = false;
  this.hideHelp = false;
  this.hideResult = false;

  return this;
}

/**
 * Investigates user data and returns a question instance. Main entry point for the frame.
 *
 * This function will sometimes have to make drastic changes to the userData object,
 * which probably contains information about previous questions, results, and more.
 *
 * @param {object} [userData= User data fetched by waxon. It contains at least the following properties:
 *   'gashId' {string} The unique ID of the user.
 *   'activeQuestion' {object} Either a string with a question ID, or an object with the
 *     the properties 'questionId' and 'parameters' for question ID and parameters that
 *     matches this question.
 *   'needsSaving' {boolean} Whether waxon needs saving this object, once processed.
 *   with a unique user id, and the property 'needs saving' telling waxon if the object
 *   needs to be saved.]
 * return {object} [The user data, possibly modified.]
 */
waxonFrame.prototype.resolveQuestion = function(userData) {
}

/**
 * Reacts on the answer evaluation, for example by updating user results and removing the active question.
 *
 * This function could build a new active question and populate it with parameters,
 * which may be a good idea since data storing/loading is fairly time expensive.
 *
 * @param {integer} [responseCode= One of the response codes described by waxon constants.]
 * @param {string} [responseMessage= Any feedback provided by answer evaluation. Often empty.]
 * @param {string} [questionString= A string representing the answered question. May be empty.]
 * @param {string} [answerString= A string representing the question answer. May be empty.]
 * @param {object} [userData= The full user data object. It contains the property 'gashId'
 *   with a unique user id, the 'activeQuestion' property and the property 'needsSaving' telling
 *   waxon if the object needs to be saved.]
 * return {object} [An object which must contain the following properties:
 *   questionId {string} The ID of the question.
 *   parameters {object} The parameters to use with the question.]
 */
waxonFrame.prototype.processResponse = function(responseCode, responseMessage, questionString, answerString, userData) {
}

/**
 * Displays results to the user. Called after each answer submission and after each question build.
 *
 * @param {object} [userData= The full user data object. It contains the property 'gashId'
 *   with a unique user id, the 'activeQuestion' property and the property 'needsSaving' telling
 *   waxon if the object needs to be saved.]
 * return {}
 */
waxonFrame.prototype.displayResult = function(userData) {
}
