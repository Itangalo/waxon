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
waxon.NO_NEED_TO_EVALUATE = 2;
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
waxon.doGet = function(queryInfo, userData) {
  // Ensure that we have a frame and that it may be used.
  if (!(this.frame instanceof waxonFrame)) {
    gash.areas.question.add('There is no frame to use. You need to install a waxon question frame.');
    return;
  }
  if (this.getUser() == '' && !this.frame.allowAnonymous) {
    gash.areas.question.add('You must be logged in to use this waxon frame. Please log in to Google in another tab and reload this page.');
    return;
  }
  // Prepare the UI areas.
  var app = UiApp.getActiveApplication().setTitle(this.frame.title);
  gash.areas.question.clear();
  gash.areas.answer.clear();
  gash.areas.learn.clear();
  app.getElementById('result-area').setVisible(true);

  // Get the relevant question data.
  var userData = userData || this.loadUserData();
  var questionId, activeQuestion, parameters;
  userData = this.frame.resolveQuestion(userData);

  if (typeof userData.activeQuestion == 'string') {
    questionId = userData.activeQuestion;
    userData.activeQuestion = {
      id : questionId,
      parameters : this.questions[questionId].generateParameters()
    }
    userData.needsSaving = true;
  }
  else {
    questionId = userData.activeQuestion.id;
  }

  // Allow the frame to react before we construct the question.
  if (typeof this.frame.initialize == 'function') {
    this.frame.initialize(userData);
  }

  // Populate question area.
  var question = this.questions[questionId];
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

  // Populate answer area. This involves some handlers.
  var answerHandler = app.createServerHandler('waxonAnswerSubmit');
  var hideHandler = app.createClientHandler().forEventSource().setEnabled(false);
  var processMessage = app.createLabel(this.getFunnyMessage()).setVisible(false);
  var elements = question.answerElements(parameters);
  for (var i in elements) {
    if (typeof elements[i].setId == 'function') {
      elements[i].setId(i);
    }
    if (typeof elements[i].setName == 'function') {
      elements[i].setName(i);
    }
    gash.areas.answer.add(elements[i]);
    if (typeof elements[i] != 'string') {
      answerHandler.addCallbackElement(elements[i]);
      hideHandler.forTargets(elements[i]).setEnabled(false);
    }
  }
  gash.areas.answer.add(app.createHTML('<hr/>'));
  if (!question.hideAnswerButton) {
    var answerSubmit = app.createButton('Skicka', answerHandler).setId('answerSubmit').addClickHandler(hideHandler);
    gash.areas.answer.add(answerSubmit, {float : 'right'});
    hideHandler.forTargets(answerSubmit).setEnabled(false);
  }
  if (!question.hideSkipButton) {
    var answerSkip = app.createButton('Hoppa över fråga', answerHandler).setId('answerSkip').addClickHandler(hideHandler);
    gash.areas.answer.add(answerSkip, {float : 'right'});
    hideHandler.forTargets(answerSkip).setEnabled(false);
  }
  gash.areas.answer.add(processMessage);
  hideHandler.forTargets(processMessage).setVisible(true);
  hideHandler.forTargets(app.getElementById('result-area')).setVisible(false);

  // Check if we should populate learning and result area.
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

  // If the userData needs saving, save it. (It probably does.)
  if (userData.needsSaving) {
    this.storeUserData(userData);
  }

  // Add some fine print for anyone interested.
  gash.areas.about.clear();
  gash.areas.about.add('You are logged in as ' + this.getUser() + '.  ');
  gash.areas.about.add('waxon is an open source framework for machine created and evaluated questions, used in Google Apps Script.  ');
  gash.areas.about.add('You can find more information about waxon at ');
  gash.areas.about.add('https://github.com/Itangalo/waxon');
}

function waxonAnswerSubmit(eventInfo) {
  // Give a variable name to the input in the even info, to avoid code reading insanity.
  var input = eventInfo.parameter;

  var userData = waxon.loadUserData();

  var activeQuestion = userData.activeQuestion || {};

  if (input.source == 'answerSkip') {
    response = {code : waxon.SKIPPED, message : ''};
    answerString = '-';
  }
  else {
    var response = waxon.questions[activeQuestion.id].evaluateAnswer(activeQuestion.parameters, input);
    response = waxon.cleanUpResponse(response);
    var answerString = waxon.questions[activeQuestion.id].answerToString(activeQuestion.parameters, input);
  }
  var questionString = waxon.questions[activeQuestion.id].questionToString(activeQuestion.parameters);
  waxon.frame.processResponse(response.code, response.message, questionString, answerString, userData);

  waxon.doGet({}, userData);
  return UiApp.getActiveApplication();
}

waxon.loadUserData = function(user) {
  user = user || this.getUser();
  var data = gash.data.loadData('waxon', user);
  if (data == null || data == {}) {
    data = {
      activeQuestion : {},
      needsSaving : true
    };
  }
  return data;
}

waxon.storeUserData = function(userData, user) {
  user = user || this.getUser();
  userData.needsSaving = false;
  gash.data.storeData('waxon', user, userData);
}

waxon.resetActiveQuestion = function(userData) {
  if (userData.activeQuestion) {
    userData.activeQuestion = {};
    userData.needsSaving = true;
  }
}

waxon.getUser = function() {
  return Session.getActiveUser().getEmail();
}

waxon.cleanUpResponse = function(response) {
  var cleanResponse = {};
  cleanResponse.message = response.message || '';
  if (typeof response.code == 'number') {
    cleanResponse.code = parseInt(response.code);
  }
  else {
    cleanResponse.code = parseInt(response);
  }
  return cleanResponse;
}

waxon.verifyDependencies = function() {
  var errors = {};
  var reqApi, reqSub, gotApi, gotSub;
  for (var i in this.questions) {
    for (var j in this.questions[i].dependencies) {
      reqApi = this.questions[i].dependencies[j].apiVersion;
      reqSub = this.questions[i].dependencies[j].subVersion;
      if (gash[j] instanceof gashPlugin) {
        gotApi = gash[j].apiVersion;
        gotSub = gash[j].subVersion;
      }
      else {
        gotApi = false;
        gotSub = false;
        errors[i + ' dependency'] = 'Requires version ' + reqApi + '.' + reqSub + ' of ' + j + ' (plugin missing)';
      }
      if (reqApi != gotApi || reqSub > gotSub && gotApi) {
        errors[i + ' dependency'] = 'Requires version ' + reqApi + '.' + reqSub + ' of ' + j + ' (got ' + gotApi + '.' + gotSub + ')';
      }
    }
  }
  if (Object.keys(errors).length == 0) {
    Logger.log('All dependencies met.');
  }
  else {
    Logger.log('Some dependencies not met:');
    for (var i in errors) {
      Logger.log(i + ': ' + errors[i]);
    }
  }
}

waxon.runTests = function() {
  var okMessages = {};
  var errorMessages = {};
  for (var i in this.questions) {
    okMessages[i] = {};
    errorMessages[i] = {};
    if (typeof this.questions[i].tests != 'object' || Object.keys(this.questions[i].tests).length == 0) {
      errorMessages[i] = 'Tests are missing.';
      Logger.log('Question: ' + i + ': Tests are missing.');
    }
    else {
      for (var t in this.questions[i].tests) {
        try {
          this.questions[i].tests[t]();
          okMessages[i][t] = 'Question: ' + i + ', test: ' + t + ' (ok)';
          Logger.log('Question: ' + i + ', test: ' + t + ' (ok)');
        }
        catch(e) {
          errorMessages[i][t] = 'ERROR: Question: ' + i + ', test: ' + t + ': ' + e;
          Logger.log('ERROR: Question: ' + i + ', test: ' + t + ': ' + e);
        }
      }
    }
  }
  return true;
}

function waxonVerifyDependencies() {
  waxon.verifyDependencies();
}

function waxonRunTests() {
  waxon.runTests();
}

waxon.getFunnyMessage = function() {
  return gash.utils.randomSelect({
    'Utvärderar ditt svar...' : 30,
    'Kontrollräknar...' : 3,
    'Kokar en kopp te...' : 1,
    'Väntar på att teet ska svalna...' : 1,
    'Kollar ditt svar med Google...' : 1,
    'Startar Turing-maskinen...' : 1,
    'Turing-testar ditt svar...' : 1,
    'Försöker tolka din handstil...' : 1,
    'Grubblar över ditt svar...' : 2,
    'Funderar över livet...' : 1,
    'Anropar andra sidan...' : 1,
    'Räknar till tio långsamt...' : 1,
    'Utvärderar ditt svar i bas sexton...' : 1,
    'Väntar på bättre tider...' : 1,
    'Sjunger "Små grodorna"...' : 1,
    'Jämför med fusklappen...' : 2,
    'Slår upp rätt svar på nätet...' : 1,
    'Försöker att hitta dolda budskap i ditt svar...' : 1,
  });
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
  this.dependencies = {};
  this.tests = {};
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
    label : 'Svar:',
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

/**
 * Builds a new question based on an existing one.
 *
 * @param {object} [options= Any options passed in, for controlling how paramters are generated.]
 * return {waxonQuestion} [The cloned question, with tweaks added.]
 */
waxonQuestion.prototype.tweak = function(id, options, overrides) {
  var tweak = new waxonQuestion(id);
  for (var i in this) {
    if (this.hasOwnProperty(i) && i != 'id') {
      tweak[i] = this[i];
    }
  }
  for (var i in overrides) {
    tweak[i] = overrides[i];
  }
  tweak.defaults = tweak.defaults.overwriteWith(options);
  return tweak;
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
 *   id {string} The ID of the question.
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

waxon.tests = {
  tweakQuestionTest : function() {
    var q1 = new waxonQuestion('q1', {a : 1, b : 2});
    q1.title = 'Original question';
    q2 = q1.tweak('q2', {a : 3, c : 4}, {title : 'Tweaked question'});
    if (waxon.questions.q2 == undefined) {
      throw 'Tweaking of questions fails to add them to the waxon object.';
    }
    if (q2.defaults.a != 3) {
      throw 'Tweaking of questions fails to write new default options.';
    }
    if (q1.defaults.a == 3) {
      throw 'Tweaking of questions overwrites default options in original question.';
    }
    if (q2.title != 'Tweaked question') {
      throw 'Tweaking of questions do not add manual property overrides.';
    }
    if (q1.title == 'Tweaked question') {
      throw 'Manual property overrides in question tweaks affects the original question.';
    }
    q1.answerToString = 'test';
    if (q2.answerToString == 'test') {
      throw 'Changing of original question affects the tweak.';
    }
    var q3 = q2.tweak('q3');
    if (!(q3 instanceof waxonQuestion)) {
      throw 'Tweaking of questions do not preseve instanceof.';
    }
  },
};
