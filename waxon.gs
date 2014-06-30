/**
 * @file: Main module and functions for the Waxon framework.
 */

/**
 * This project is licensed under GNU general public license. Feel free to
 * use, study, share and improve. See https://github.com/Itangalo/waxon/ for
 * source code, comments on how to set up the script, and license details.
 */

function doGet() {
  var app = UiApp.createApplication();

  waxon.setGlobalData(waxon.getUserId(), 'users', waxon.getUserId())

  var frame = waxon.resolveFrame();
  waxon.frames[frame].drawAreas();

  var questionInfo = waxon.getQuestionInfo();
  waxon.buildQuestion(questionInfo);

  return app;
}

/**
 * The main module for the Waxon framework, taking care of UI calls and some more.
 */
var waxon = (function () {
  // Private variables
  var currentFrame = null;
  var questionStack = [];
  var cache = {};
  // Public variables
  var frames = {};
  var questions = {};
  var questionIds = {};

/**
 * Meta-functions, for managing property storage.
 */

  // Fetches (and if necessary builds) the hopefully unique ID for
  // this instance of Waxon. Uses a time-based token.
  function getScriptId() {
    if (typeof PropertiesService.getScriptProperties().getProperty('waxon id') == 'string') {
      return PropertiesService.getScriptProperties().getProperty('waxon id');
    }
    else {
      var d = new Date();
      return PropertiesService.getScriptProperties().setProperty('waxon id', 'waxon' + d.valueOf()).getProperty('waxon id');
    }
  };

  // Fetches (and if necessary builds) the user ID for this Waxon script.
  // If the user is logged in, the e-mail will be used. Otherwise a time-based
  // token will be built.
  function getUserId() {
    if (Session.getActiveUser().getEmail() == '') {
      var waxonUserIds = JSON.parse(PropertiesService.getUserProperties().getProperty('waxon user id'));
      if (waxonUserIds == null) {
        waxonUserIds = {};
      }
      if (waxonUserIds[getScriptId()] == undefined) {
        var d = new Date();
        waxonUserIds[getScriptId()] = 'id-' + d.valueOf();
        PropertiesService.getUserProperties().setProperty('waxon user id', JSON.stringify(waxonUserIds));
        return 'id-' + d.valueOf();
      }
      else {
        return waxonUserIds[getScriptId()];
      }
    }
    else {
      return Session.getActiveUser().getEmail();
    }
  }

  // Fetches stored data with a given store Id.
  function getUserData(storeId) {
    // Verify that we have something that looks like a valid storeId.
    if (typeof storeId != 'string') {
      return false;
    }
    var result = PropertiesService.getUserProperties().getProperty(storeId);
    if (result == null) {
      return result;
    }
    else {
      return JSON.parse(result);
    }
  }

  // Stores data with a given store Id.
  function setUserData(data, storeId, userId) {
    if (typeof storeId != 'string') {
      return false;
    }
    PropertiesService.getUserProperties().setProperty(storeId, JSON.stringify(data));
    return;
  }

  // Fetches stored data with a given store Id.
  function getGlobalData(storeId, subProperty) {
    // Call recurively if a subProperty is set.
    if (subProperty != undefined) {
      var parent = getGlobalData(storeId);
      if (typeof parent == 'object' && parent != null) {
        return parent[subProperty];
      }
      else {
        return undefined;
      }
    }

    // Verify that we have something that looks like a valid storeId.
    if (typeof storeId != 'string') {
      return false;
    }
    var result = PropertiesService.getScriptProperties().getProperty(storeId);
    if (result == null) {
      return result;
    }
    else {
      return JSON.parse(result);
    }
  }

  // Stores data with a given store Id.
  function setGlobalData(data, storeId, subProperty) {
    if (typeof storeId != 'string') {
      return false;
    }
    // If a sub property should be set, fetch the parent and set sub property.
    if (subProperty != undefined) {
      var parent = getGlobalData(storeId) || {};
      parent[subProperty] = data;
      data = parent;
    }

    PropertiesService.getScriptProperties().setProperty(storeId, JSON.stringify(data));
    return;
  }

/**
 * Functions for managing areas/UI.
 */
  // Adds a new area, with specified CSS-attributes.
  function addArea(name, attributes, label) {
    var app = UiApp.getActiveApplication();
    var captionPanel = app.createCaptionPanel(label || '').setStyleAttributes({border : 'none', padding : '0px', margin : '0px'});//.setStyleAttributes(attributes || {});
    var scrollPanel = app.createScrollPanel().setId(name + '-wrapper').setStyleAttributes(attributes || {});
    var container = app.createVerticalPanel().setId(name);
    captionPanel.add(scrollPanel);
    scrollPanel.add(container);
    app.add(captionPanel);
    return app;
  }

  // Adds a UI element to the specified area. If just a text string is provided,
  // it will be added as a plain label element.
  function addToArea(area, element, attributes) {
    // Merge the frame's default attributes with any overrides specified by arguments.
    attributes = attributes || {};
    for (var i in waxon.frames[waxon.resolveFrame()].attributes) {
      attributes[i] = attributes[i] || waxon.frames[waxon.resolveFrame()].attributes[i];
    }

    var app = UiApp.getActiveApplication();
    var panel = app.getElementById(area);
    if (typeof element == 'string') {
      element = app.createLabel(element);
    }
    panel.add(element.setStyleAttributes(attributes));
    return app;
  }

  // Removes all elements from the specified area.
  function clearArea(area) {
    var app = UiApp.getActiveApplication();
    var panel = app.getElementById(area);
    panel.clear();
    return app;
  }

/**
 * Managing question and frame objects
 */

  function addFrame(frame) {
    frames[frame.id] = frame;
  }

  // TODO.
  function resolveFrame() {
    return 'shortTest';
  }

  function addQuestion(question, isNonQuestion) {
    questions[question.id] = question;
    if (isNonQuestion != true) {
      questionIds[question.id] = question.id;
    }
  }

/**
 * Managing the question stack and its content.
 */

  // Fetches (and if necessary builds) the question stack for the acting
  // user. Also populates the entries in the stack with parameters, and
  // stores the stack for persistence between page loads.
  function getQuestionStack() {
    var stack = getUserData('stack');
    if (Array.isArray(stack) != true || stack.length < 1) {
      stack = waxon.frames[resolveFrame()].buildQuestionStack() || ['noMoreQuestions'];
    }
    // Some frames may accidentally return a string, not an array.
    if (typeof stack == 'string') {
      stack = [stack];
    }

    for (var index in stack) {
      if (stack[index].processed != true) {
        stack[index] = processQuestion(stack[index]);
      }
    }
    setUserData(stack, 'stack');
    return stack;
  }

  // Populates a question (in the question stack) with data that is needed
  // when building and displaying the actual question.
  function processQuestion(questionInfo) {
    // Check if the question is just specified by a question ID.
    if (typeof questionInfo == 'string') {
      questionInfo = {
        id : questionInfo,
      }
    }

    // If the question is already processed, we shortcut the process.
    if (questionInfo.processed == true) {
      return questionInfo;
    }

    // Set question parameters, if needed.
    if (questionInfo.parameters == undefined) {
      questionInfo.parameters = waxon.questions[questionInfo.id].generateParameters(questionInfo.options || {});
    }

    questionInfo.processed = true;
    return questionInfo;
  }

  // Fetches (and if necessary builds) question info for a specified
  // index in the question stack. Index defaults to the first question.
  function getQuestionInfo(index) {
    index = index || 0;
    return getQuestionStack()[index];
  }

  // Removes the topmost question in the stack, or the specified question.
  function removeQuestion(index) {
    index = index || 0;
    var stack = getQuestionStack();
    stack.splice(index, 1);
    setUserData(stack, 'stack');
  }

  // Fetches the parameters from a question in the question stack, assuming the
  // parameters are already built. Uses first question if none is specified.
  function readParameters(index) {
    index = index || 0;
    var stack = getQuestionStack();
    return stack[index].parameters;
  }

  // Assures that a question response has the right format.
  function cleanupResponse(response) {
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

  // Displays a question
  function buildQuestion(questionInfo) {
    var app = UiApp.getActiveApplication();
    waxon.clearArea('questionarea');
    waxon.clearArea('answerarea');
    waxon.clearArea('helparea');

    var question = waxon.questions[questionInfo.id];
    var parameters = questionInfo.parameters;
    var handler = app.createServerHandler('checkAnswer');

    var questionElements = question.questionElements(parameters);
    for (var i in questionElements) {
      waxon.addToArea('questionarea', questionElements[i]);
    }

    var answerElements = question.answerElements(parameters);
    for (var i in answerElements) {
      try {
        answerElements[i].setId(i);
        answerElements[i].setName(i);
      }
      catch(e) {}
      waxon.addToArea('answerarea', answerElements[i]);
      handler.addCallbackElement(answerElements[i]);
    }

    if (waxon.questions[waxon.getQuestionInfo().id].hideButton != true) {
      waxon.addToArea('answerarea', app.createSubmitButton('Skicka svar').addClickHandler(handler).setId('answerSubmit'));
    }

    var helpElements = question.helpElements(parameters);
    for (var i in helpElements) {
      waxon.addToArea('helparea', helpElements[i]);
    }

    return app;
  }

  // The publically accessible properties and methods
  return {
    // Variables
    questions : questions,
    questionIds : questionIds,
    frames : frames,
    // Methods
    getUserData : getUserData,
    setUserData : setUserData,
    getGlobalData : getGlobalData,
    setGlobalData : setGlobalData,
    addArea : addArea,
    addToArea : addToArea,
    clearArea : clearArea,
    addQuestion : addQuestion,
    addFrame : addFrame,
    readParameters : readParameters,
    cleanupResponse : cleanupResponse,
    getScriptId : getScriptId,
    getUserId : getUserId,
    getQuestionStack : getQuestionStack,
    getQuestionInfo : getQuestionInfo,
    removeQuestion : removeQuestion,
    resolveFrame : resolveFrame,
    buildQuestion : buildQuestion,
  };
}) ();

/**
 * Class-like function for building waxon questions.
 *
 * @param id
 *   A string with the ID of the question being created.
 * @param isNonQuestion
 *   Set to true if the question type isn't really a question, and shouldn't for example
 *   be available in a selection of random questions.
 * @param parent
 *   Any question type to inherit properties from. Using this is a quick way of making
 *   tweaks to already existing questions.
 */
function waxonQuestion(id, isNonQuestion, parent) {
  this.id = id;
  waxon.addQuestion(this, isNonQuestion);

  // Human-readable name for this question type.
  this.title = undefined;

  // Greates the parameters used by the question. May take 'options' being
  // passed to the question.
  this.generateParameters = function(options) {
    return {
      a : waxonUtils.randomInt(-10, 10),
      b : waxonUtils.randomInt(-10, 10, [0]),
    };
  };

  // Creates an object with UI elements to display as the actual question.
  this.questionElements = function(parameters) {
    var app = UiApp.getActiveApplication();
    var element1 = app.createLabel('I am a question built on random parameters a (' + parameters.a + ') and b (' + parameters.b + ').');
    var element2 = app.createLabel('The question may be built on several elements, including images and more.');
    var element3 = waxonUtils.latex2image('\\frac{x^' + parameters.a + '}{x^' + parameters.a + '-' + parameters.b + '}');
    return {
      element1 : element1,
      element2 : element2,
      element3 : element3,
    }
  };

  // Represents the question as a plain-text string.
  this.questionToString = function(parameters) {
    var question = [];
    for (var i in parameters) {
      question.push(i + ': ' + parameters[i]);
    }
    return question.join(', ');
  }

  // Creates an object with UI elements to submit answer to the question.
  this.answerElements = function(parameters) {
    var app = UiApp.getActiveApplication();
    var label = app.createLabel('Svar:');
    var answer = app.createTextBox().setWidth('200px').setFocus(true);
    return {
      label : label,
      answer : answer,
    };
  };

  // Represents the question as a plain-text string.
  this.answerToString = function(input) {
    return input.answer;
  }

  // Evaluates the submitted answer. 'input' contains the full input from the handler.
  this.evaluateAnswer = function(parameters, input) {
    return {
      code : 0,
      message : 'There is no method for evaluating your answer. Sorry.',
    }
  };

  // Creates an object with UI elements with help: video links, further instruciton, etc.
  this.helpElements = function() {
    return {};
  }

  // Sets any properties that should be inherited from the parent question type.
  if (parent != undefined) {
    for (var i in parent) {
      if (i != 'id') {
        this[i] = parent[i];
        Logger.log(i);
      }
    }
  }
};

function waxonFrame(id) {
  this.id = id;
  waxon.addFrame(this);

  this.buildQuestionStack = function() {
    // Just pick three random questions.
    var stack = [];
    for (var i in waxon.questionIds) {
      stack.push(i);
    }
    return waxon.randomSelect(stack);
  };

  this.attributes = {
    fontSize : '18px',
  };

  this.drawAreas = function() {
    var app = UiApp.getActiveApplication();
    var attributes = {
      border : 'thin black solid',
      minHeight : '100px',
      maxHeight : '200px',
      margin : '3px',
      padding : '3px',
    }

    waxon.addArea('questionarea', attributes);
    waxon.addArea('answerarea', attributes);
    waxon.addArea('feedbackarea', attributes, 'Feedback');
    waxon.addArea('helparea', attributes, 'Hjälp');
    attributes.visibility = 'none';
    waxon.addArea('resultarea', attributes);
    waxon.addArea('debug', attributes);

    return app;
  }

  this.processResponse = function(responseCode, responseMessage, questionString, answerString) {
    var app = UiApp.getActiveApplication();

    // Set default response messages for the different response codes.
    if (responseCode > 0) {
      responseMessage = responseMessage | 'Rätt!';
      // If correctly answered, remove the current question from the stack.
      waxon.removeQuestion();
    }
    else if (responseCode < 0) {
      responseMessage = responseMessage | 'Fel. Försök igen!';
    }
    else if (responseCode = 0) {
      responseMessage = responseMessage | 'Nära. Kolla ditt svar och försök igen.';
    }
    // Display the response message to the user.
    waxon.addToArea('feedback', app.createLabel(responseMessage));
    return app;
  }
}

function checkAnswer(eventInfo) {
  var app = UiApp.getActiveApplication();
  var questionInfo = waxon.getQuestionInfo();
  var parameters = questionInfo.parameters;
  var questionId = questionInfo.id;

  var response = waxon.cleanupResponse(waxon.questions[questionId].evaluateAnswer(parameters, eventInfo.parameter));
  var questionString = waxon.questions[questionId].questionToString(parameters);
  var answerString = waxon.questions[questionId].answerToString(eventInfo.parameter);

  waxon.frames[waxon.resolveFrame()].processResponse(response.code, response.message, questionString, answerString);
  questionInfo = waxon.getQuestionInfo();
  waxon.buildQuestion(questionInfo);
  return app;
}

function debug(variable, reset) {
  var app = UiApp.getActiveApplication();
  if (reset == true) {
    waxon.clearArea('debug');
  }

  if (typeof variable == 'object') {
    for (var i in variable) {
      waxon.addToArea('debug', app.createLabel(variable[i]));
    }
  }
  else {
    waxon.addToArea('debug', app.createLabel(variable));
  }
}

function reset() {
  PropertiesService.getUserProperties().deleteAllProperties();
  PropertiesService.getScriptProperties().deleteAllProperties();
}

function logTime(sinceTime, message) {
  if (typeof message == 'string') {
    Logger.log(message);
  }
  var now = new Date().getTime();
  Logger.log(now - sinceTime);
}
