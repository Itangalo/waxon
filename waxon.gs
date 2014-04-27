/**
 * The main module for the waxon framework, taking care of UI calls and some more.
 */
var waxon = (function () {
  var questions = {};
  
  function addArea(name, attributes) {
    var app = UiApp.getActiveApplication();
    app.add(
      app.createScrollPanel(
        app.createVerticalPanel().setId(name).setWidth('100%')
      ).setWidth('640px').setId(name + '-wrapper').setStyleAttributes(attributes || {})
    );
    return app;
  }
  
  function addToArea(area, element) {
    var app = UiApp.getActiveApplication();
    var panel = app.getElementById(area);
    panel.add(element);
    return app;
  }
  
  function clearArea(area) {
    var app = UiApp.getActiveApplication();
    var panel = app.getElementById(area);
    panel.clear();
    return app;
  }
  
  function addQuestion(question) {
    this.questions[question.id] = question;
  }
  
  function writeParameters(parameters, handler) {
    var app = UiApp.getActiveApplication();
    var hiddenParameters = app.createHidden('parameters', JSON.stringify(parameters || {})).setId('parameters');
    handler.addCallbackElement(hiddenParameters);
    app.add(hiddenParameters);
    return app;
  }
  
  function readParameters(eventInfo) {
    return JSON.parse(eventInfo.parameter.parameters) || {};
  }
  
  function cleanupResponse(response) {
    var cleanResponse = {};
    cleanResponse.message = response.message || '';
    if (typeof response.result == 'number') {
      cleanResponse.result = parseInt(response.result);
    }
    else {
      cleanResponse.result = parseInt(response);
    }
    return cleanResponse;
  }
  
  return {
    // Variables
    questions : questions,
    // Methods
    addArea : addArea,
    addToArea : addToArea,
    clearArea : clearArea,
    addQuestion : addQuestion,
    writeParameters : writeParameters,
    readParameters : readParameters,
    cleanupResponse : cleanupResponse,
  };
}) ();

/**
 * Class-like function for building waxon questions.
 */
function waxonQuestion(id) {
  this.id = id;
  
  this.generateParameters = function() {
    return {
      a : Math.round(Math.random() * 10),
      b : Math.round(Math.random() * 10),
    };
  };

  this.questionElements = function(parameters) {
    var app = UiApp.getActiveApplication();
    var element1 = app.createLabel('I am a question built on random parameters a (' + parameters.a + ') and b (' + parameters.b + ').');
    var element2 = app.createLabel('The question may be built on several elements, including images and more.');
    var element3 = app.waxonUtils.latex2image('\\frac{x^' + parameters.a + '}{x^' + parameters.a + '-' + parameters.b + '}');
    return {
      element1 : element1,
      element2 : element2,
      element3 : element3,
    }
  };
  
  this.answerElements = function(parameters) {
    var app = UiApp.getActiveApplication();
    var label = app.createLabel('Answer:');
    var answer = app.createTextBox().setWidth('200px').setFocus(true);
    return {
      label : label,
      answer : answer,
    };
  };
  
  this.evaluateAnswer = function(parameters, answer) {
    return {
      result : 0,
      message : 'There is no method for evaluating your answer. Sorry.',
    }
  };
};
