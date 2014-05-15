/**
 * @file: Main module and functions for the Waxon framework.
 */

function doGet() {
  var app = UiApp.createApplication();

  var users = waxon.getGlobalData('users');
  users[waxon.getUserId()] = waxon.getUserId();
  waxon.setGlobalData(users, 'users');

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
  var questionIds = [];

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

  // Fetches stored data with a given store Id, for a specified user. If no
  // user is specified, the acting user will be used.
  function getUserData(storeId, userId) {
    // Verify that we have something that looks like a valid storeId.
    if (typeof storeId != 'string') {
      return false;
    }
    // Check if we have some cached data for this storeId. (Cache only applies
    // for the acting user, so we need to check that no other user is specified.)
    if (cache[storeId] != undefined && userId == undefined) {
      return cache[storeId];
    }

    var entry;
    var db = ScriptDb.getMyDb();
    userId = userId || getUserId();
    var result = db.query({userId : userId});

    // If we don't have any stored data for this user yet, create an entry for this user.
    if (result.hasNext() == false) {
      entry = {userId : getUserId()};
    }
    else {
      entry = result.next();
    }

    // Store the data in the cache, for quicker fetch next time.
    cache[storeId] = entry[storeId] || null;

    return entry[storeId] || null;
  }

  // Stores data with a given store Id, for a specified user. If no user is
  // specified, the acting user will be used.
  function setUserData(data, storeId, userId) {
    if (typeof storeId != 'string') {
      return false;
    }
    var entry;
    var db = ScriptDb.getMyDb();
    userId = userId || getUserId();
    var result = db.query({userId : userId});

    // If we don't have any stored data yet, create an entry for this user.
    if (result.hasNext() == false) {
      entry = {userId : getUserId()};
    }
    else {
      entry = result.next();
    }

    // Store the data in the database and in the cache.
    cache[storeId] = data;
    entry[storeId] = data;
    return db.save(entry).getId();
  }

  // Fetches stored data with a given store Id.
  function getGlobalData(storeId) {
    // Verify that we have something that looks like a valid storeId.
    if (typeof storeId != 'string') {
      return false;
    }

    var entry;
    var db = ScriptDb.getMyDb();
    var result = db.query({storeId : storeId});

    if (result.hasNext() == false) {
      return {};
    }
    else {
      var entry = result.next();
      return entry.data;
    }
  }

  // Stores data with a given store Id.
  function setGlobalData(data, storeId) {
    if (typeof storeId != 'string') {
      return false;
    }
    var entry;
    var db = ScriptDb.getMyDb();
    var result = db.query({storeId : storeId});

    // If we don't have any stored data yet, create an entry with this ID.
    if (result.hasNext() == false) {
      entry = {storeId : storeId};
    }
    else {
      entry = result.next();
    }

    // Store the data in the database and in the cache.
    entry['data'] = data;
    return db.save(entry).getId();
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
    this.frames[frame.id] = frame;
  }

  // TODO.
  function resolveFrame() {
    return 'demoFrame';
  }

  function addQuestion(question, isNonQuestion) {
    this.questions[question.id] = question;
    if (isNonQuestion != true) {
      questionIds.push(question.id);
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
    if (stack == null || stack.length < 1) {
      stack = waxon.frames[resolveFrame()].buildQuestionStack() || ['noMoreQuestions'];
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
      questionInfo.parameters = waxon.questions[questionInfo.id].generateParameters(questionInfo.options);
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
    waxon.addToArea('answerarea', app.createSubmitButton('Skicka svar').addClickHandler(handler));

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
 */
function waxonQuestion(id, isNonQuestion) {
  this.id = id;
  waxon.addQuestion(this, isNonQuestion);

  // Human-readable name for this question type.
  this.title = 'Fråga utan namn';

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

  // Evaluates the submitted answer. 'input' contains the full input from the handler.
  this.evaluateAnswer = function(parameters, input) {
    return {
      code : 0,
      message : 'There is no method for evaluating your answer. Sorry.',
    }
  };

  // Creates an object with UI elements with help: video links, further instruciton, etc.
  this.help = function() {
    return {};
  }
};

function waxonFrame(id) {
  this.id = id;
  waxon.addFrame(this);

  this.buildQuestionStack = function() {
    // Just pick three random questions.
    var stack = [];
    var availableQuestions = waxon.questionIds;
    stack.push(availableQuestions[waxonUtils.randomInt(0, availableQuestions.length - 1)]);
    stack.push(availableQuestions[waxonUtils.randomInt(0, availableQuestions.length - 1)]);
    stack.push(availableQuestions[waxonUtils.randomInt(0, availableQuestions.length - 1)]);
    return stack;
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
    waxon.addArea('feedbackarea', attributes);
    attributes.visible = 'false';
    waxon.addArea('debug', attributes);

    return app;
  }

  this.processResponse = function(responseCode, responseMessage) {
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
    waxon.addToFrame('feedback', app.createLabel(responseMessage));
    return app;
  }
}

function checkAnswer(eventInfo) {
  var questionInfo = waxon.getQuestionInfo();
  var parameters = questionInfo.parameters;
  var questionId = questionInfo.id;

  var app = UiApp.getActiveApplication();
  var response = waxon.cleanupResponse(waxon.questions[questionId].evaluateAnswer(parameters, eventInfo.parameter));

  waxon.frames[waxon.resolveFrame()].processResponse(response.code, response.message);
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
  PropertiesService.getUserProperties().deleteProperty('waxon user id');
  PropertiesService.getScriptProperties().deleteAllProperties();
  var db = ScriptDb.getMyDb();
  var result = db.query({});
  while (result.hasNext()) {
    db.remove(result.next());
  }
}
