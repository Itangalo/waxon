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
];

// Set this to true to allow resetting the test.
shortTest.demoMode = true;

shortTest.title = 'Exempel på diagnos';

shortTest.buildQuestionStack = function() {
  // Make sure that the stack ends with 'noMoreQuestions'.
  if (this.stack.length == 0 || this.stack[this.stack.length - 1] != 'noMoreQuestions') {
    this.stack.push('noMoreQuestions');
  }
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
  
  this.displayQuestionNumber();

  if (this.demoMode == true) {
    waxon.addArea('reset');
    var app = UiApp.getActiveApplication();
    waxon.addToArea('reset', app.createButton('starta om', app.createServerHandler('shortTestReset')));
    waxon.addToArea('reset', '(Knappen finns endast med i demoläge.)', {fontSize : '12px'});
  }

  return app;
}

// Prints the number of the question in the info area.
shortTest.displayQuestionNumber = function() {
  var result = waxon.getUserData('result') || [''];
  waxon.clearArea('infoarea');
  if (result.length >= this.buildQuestionStack().length) {
    waxon.addToArea('infoarea', 'Klart.', {fontSize : '12px'});
  }
  else {
    waxon.addToArea('infoarea', 'Fråga ' + (result.length) + ' av ' + (this.buildQuestionStack().length - 1), {fontSize : '12px'});
  }
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

  // Always move on to the next question, regardless of result.
  waxon.removeQuestion();

  waxon.setUserData(result, 'result');
  waxon.setGlobalData(result, 'result', waxon.getUserId());

  this.displayQuestionNumber();

  return app;
}

// Method that summarizes how things are going for students/users. Stub.
shortTest.summary = function() {
  var result, spreadsheet, cellContent, row, numberOfQuestions;
  var allResult = waxon.getGlobalData('result');
  if (waxon.getGlobalData('resultSheet') == null) {
    spreadsheet = SpreadsheetApp.create(this.title || ('waxon-resultat ' + new Date()));
    waxon.setGlobalData(spreadsheet.getId(), 'resultSheet');
  }
  else {
    spreadsheet = SpreadsheetApp.openById(waxon.getGlobalData('resultSheet'));
  }
  
  row = this.buildQuestionStack();
  row.pop();
  numberOfQuestions = row.length;
  row.unshift('Antal rätt');
  row.unshift('Elev');
  cellContent = [row];
  
  for (var user in allResult) {
    while (allResult[user].length != numberOfQuestions + 1) {
      allResult[user].push('-');
    }
    row = allResult[user];
    row.unshift(user);
    cellContent.push(row);
  }
  spreadsheet.getActiveSheet().getRange(1, 1, cellContent.length, cellContent[0].length).setValues(cellContent);
}

// Starts over the test.
function shortTestReset(eventInfo) {
  PropertiesService.getUserProperties().deleteProperty('result');
  PropertiesService.getUserProperties().deleteProperty('stack');
  waxon.setGlobalData(undefined, 'result', waxon.getUserId());
  waxon.buildQuestion(waxon.getQuestionInfo());
  shortTest.displayQuestionNumber();
  return UiApp.getActiveApplication();
}
