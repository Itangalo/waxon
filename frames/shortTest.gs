/**
 * @file: Frame used for short tests, reported to a teacher.
 */

// Create a new object, inheriting properties from 'waxonFrame'.
var shortTest = new waxonFrame('shortTest');

shortTest.stack = [
  'simpleAddition',
  'orderOfOps',
  'linearEquations',
  'simpleAddition',
  'noMoreQuestions',
];

shortTest.buildQuestionStack = function() {
  return shortTest.stack;
};

shortTest.drawAreas = function() {
  var app = UiApp.getActiveApplication();
  var attributes = {
    maxHeight : '200px',
    width : '320px',
    margin : '3px',
    padding : '3px',
  }

  // Only two areas should be visisble.
  waxon.addArea('infoarea', attributes);

  attributes.border = 'thin grey solid';
  attributes.minHeight = '100px';
  waxon.addArea('questionarea', attributes);
  waxon.addArea('answerarea', attributes);

  attributes.display = 'none';
  waxon.addArea('feedbackarea', attributes);
  waxon.addArea('helparea', attributes);
  waxon.addArea('debug', attributes);

  var result = waxon.getUserData('result') || [];
  waxon.addToArea('infoarea', 'Fråga ' + (result.length + 1) + ' av ' + (result.length + waxon.getQuestionStack().length), {fontSize : '12px'});

  return app;
}

shortTest.processResponse = function(responseCode, responseMessage) {
  var app = UiApp.getActiveApplication();

  var question = waxon.getQuestionInfo();
  var result = waxon.getUserData('result');
  if (Array.isArray(result) != true) {
    result = [];
    waxon.setUserData(result, 'result');
  }

  // The first entry should contain a sum of correct answers.
  if (result.length == 0) {
    result[0] = 0;
  }

  // Add the result of this question, and increase the number of correct answers if relevant.
  result.push(responseCode);
  if (responseCode > 0) {
    result[0]++;
  }

  // Process responses. Always move on to the next question, regardless of result.
  waxon.removeQuestion();

  waxon.setUserData(result, 'result');
  waxon.setGlobalData(result, 'result', waxon.getUserId());

  waxon.clearArea('infoarea');
  var result = waxon.getUserData('result') || [];
  waxon.addToArea('infoarea', 'Fråga ' + (result.length + 1) + ' av ' + (result.length + waxon.getQuestionStack().length), {fontSize : '12px'});

  return app;
}

// Method that summarizes how things are going for students/users. Stub.
shortTest.summary = function() {
  var total, result, count;
  var allResult = waxon.getGlobalData('result');
  for (var user in allResult) {
    var result = allResult[user];
    var total = result.shift();
    Logger.log('Totalt ' + total + ' rätt, med följande fördelning: ' + result.join(' '));
  }
}
