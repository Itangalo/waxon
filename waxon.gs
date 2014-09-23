/**
 * @file: Trying out some gash stuff.
 */

/**
 * This project is licensed under GNU general public license. Feel free to
 * use, study, share and improve. See https://github.com/Itangalo/waxon/ for
 * source code and license details. The waxon project builds on the gash
 * framework. See https://github.com/Itangalo/gash/ for details.
 */

var p = new gashPlugin('waxon');

p.apiVersion = 2;
p.subVersion = 1;
p.dependencies = {
  gash : {apiVersion : 2, subVersion : 1},
  utils : {apiVersion : 1, subVersion : 1},
  areas : {apiVersion : 1, subVersion : 1},
};

/**
 * Response codes for evaluating answers.
 */
p.CORRECT = 1;
p.CLOSE = 0;
p.INCORRECT = -1;
p.WRONG_FORM = -2;
p.CANNOT_INTERPRET = -3;
p.SKIPPED = -10;

p.questionIds = {};
p.frame;

/**
 * The UI areas used by waxon.
 */
var quesetionArea = new gashArea('question', {
  label : 'Fråga',
  areaAttributes : {width : '360px', float : 'left', height : '240px', fontSize : '24px', position : 'fixed', top : '100px', left : '70px'},
});
var answerArea = new gashArea('answer', {
  label : 'Svara här',
  areaAttributes : {width : '370px', float : 'left', height : '240px', fontSize : '24px', position : 'fixed', top : '100px', left : '500px'},
});
var learnArea = new gashArea('learn', {
  label : 'Läs på och lär mer',
  areaAttributes : {width : '370px', float : 'left', height : '140px', position : 'fixed', top : '400px', left : '70px', height : '140px'},
  elementAttributes : {color : 'gray'},
});
var resultArea = new gashArea('result', {
  label : 'Dina resultat (även synliga för läraren)',
  areaAttributes : {width : '370px', float : 'left', height : '140px', position : 'fixed', top : '400px', left : '500px'},
  elementAttributes : {color : 'gray'},
});
var browseArea = new gashArea('browse', {
  label : 'Navigera bland frågorna',
  areaAttributes : {width : '810px', height : '40px', position : 'fixed', top : '30px', left : '70px', overflow : 'auto'},
  elementAttributes : {marginRight : '5px', fontSize : '0.75em', float : 'left'},
});
var aboutArea = new gashArea('about', {
  areaAttributes : {width : '810px', height : '40px', position : 'fixed', top : '600px', left : '70px', overflow : 'auto', border : 'none'},
  elementAttributes : {color : 'gray', fontSize : '0.75em'},
});

/**
 * Main entry point for waxon.
 */
p.doGet = function(queryInfo) {
  var app = UiApp.getActiveApplication();
  // Alternative images: http://ibin.co/1bKBH71X3MKU (open book), http://ibin.co/1bKDMgOUU6WU (open book 960 px)
  // http://ibin.co/1bK3afRxpjiF (book pages), http://ibin.co/1bK70yYxM42P (square lined paper)
  app.setStyleAttribute('backgroundImage', 'url("http://ibin.co/1bKDMgOUU6WU")').setStyleAttribute('backgroundRepeat', 'no-repeat').setHeight(900).setWidth(900).setStyleAttribute('overflow', 'auto');
  var handler = app.createServerHandler('callback');
  gash.areas.result.add(app.createButton('Click me', handler).setId('add'));
  gash.areas.result.add(app.createButton('Clear', handler).setId('clear'));
  gash.areas.question.add('Lös följande ekvation');
  gash.areas.question.add(gash.math.latex2image(gash.math.randomBinomial().latex + '=' + gash.math.randomBinomial().latex));
  var select = app.createListBox().setName('area');
  select.addItem('Frågerutan', 'question').addItem('Svarsrutan', 'answer').addItem('Lärtips', 'learn').addItem('Resultatrutan', 'result').addItem('Navigering', 'browse');
  handler.addCallbackElement(select);
  gash.areas.browse.add(app.createListBox().addItem('Grundträning', 'basics').addItem('Räta linjen', 'line'));
  for (var i = 0; i < 12; i++) {
    gash.areas.browse.add(app.createAnchor('Uppg 1', gash.utils.getCurrentUrl({foo : 'bar'})).setTarget('_self'));
    gash.areas.browse.add(app.createAnchor('Uppg 2', gash.utils.getCurrentUrl({foo : 'bar'})).setTarget('_self'), {color : 'green'});
    gash.areas.browse.add(app.createAnchor('Uppg 3', gash.utils.getCurrentUrl({foo : 'bar'})).setTarget('_self'));
  }
  gash.areas.result.add(select);

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

  // Add some required properties.
  this.id = id;

  // Some properties that may be overridden.
  this.title = id;
  this.allowQuestionSkip = true;
  this.displayHelp = true;
  this.displayResult = true;

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
