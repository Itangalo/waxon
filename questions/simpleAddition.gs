/**
 * @file: Example of how to build a waxon question.
 */

// Create a new object, inheriting properties from 'waxonQuestion'.
var simpleAddition = new waxonQuestion('simpleAddition');

// There are a few methods that you probably want to override.
// First one is 'generateParameters', creating random parameters to build your
// question on.
simpleAddition.generateParameters = function() {
  // Let's create two integers between 1 and 12, where the second one mustn't be
  // the same as the first one.
  var a = waxonUtils.randomInt(1, 12);
  var b = waxonUtils.randomInt(1, 12, [a]);
  return {
    a : a,
    b : b,
  };
};

// Next method to override is the one displaying the question. It should return
// an object with UI elements. The framework takes care of adding names and IDs
// to the element -- we just have to set the type and content.
simpleAddition.questionElements = function(parameters) {
  var app = UiApp.getActiveApplication();
  var label = app.createLabel('Please perform this addition.');
  // There's a latex2image method you may use. Please note that backslash needs
  // to be TWO backslashes when written in JavaScript strings.
  var expression = waxonUtils.latex2image(parameters.a + '+' + parameters.b);
  return {
    label : label,
    expression : expression,
  }
};

// There is a method called 'answerElements' that you may override. If you don't,
// you will get a simple textbox with the name 'answer'. The return of answerElements
// is on the same form as questionElements.

// One method you basically must override, though, is evaluateAnswer. This takes
// care of evaluating whatever input the user has provided, and gives thumbs up
// or thumbs down. There is also an 'almost right' option you can use.
simpleAddition.evaluateAnswer = function(parameters, input) {
  // The 'input' argument contains the user input, divided into properties.
  var enteredSum = parseInt(input.answer);
  var correctSum = parameters.a + parameters.b;
  
  // The quickest way of giving thumb's up or down is returning a positive
  // number (correct answer) or negative number (incorrect answer).
  if (enteredSum == correctSum) {
    return 1;
  }
  
  // However, you can also return a response code together with a message.
  // This is done on the following form:
  if (enteredSum > correctSum) {
    return {
      code : -1,
      message : 'Too much!',
    }
  }
  else {
    return {
      code : -1,
      message : 'Too little!',
    }
  }
  
  // You can also return a zero-valued response, which is interpreted as
  // something close to correct and maybe worth a second answer. How the
  // answer is actually processed is determined by the frame in which the
  // question is asked. (On tests, for example, you probably won't get a
  // second chance. On practice, you probably will.)
};
