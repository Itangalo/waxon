/**
 * @file: Frame used for infinite practice -- more on the difficult questions.
 */

// Create a new object, inheriting properties from 'waxonFrame'.
var smartPractice = new waxonFrame('smartPractice');

smartPractice.title = 'Procedurträning';
smartPractice.limit = 10;

smartPractice.numberOfCorrect = function(resultArray) {
  var correct = 0;
  for (var i in resultArray) {
    if (resultArray[i] > 0) {
      correct++;
    }
  }
  return Math.min(this.limit, correct);
}

smartPractice.practiceNeed = function(questionId) {
  var result = waxon.getUserData('result') || {};
  result = result[questionId] || [];
  // There should always be at least 1 need to practice every question type.
  return Math.max(1, this.limit - this.numberOfCorrect(result));
}

smartPractice.buildQuestionStack = function() {
  var weights = {};
  for (var i in waxon.questionIds) {
    weights[i] = smartPractice.practiceNeed(i);
  }
  return [waxonUtils.randomSelect(weights)];
};

smartPractice.drawAreas = function() {
  var app = UiApp.getActiveApplication();
  var attributes = {
    maxHeight : '200px',
    width : '320px',
    margin : '3px',
    padding : '3px',
  }

  waxon.addArea('infoarea', attributes);

  attributes.border = 'thin grey solid';
  attributes.minHeight = '100px';
  waxon.addArea('questionarea', attributes);
  waxon.addArea('answerarea', attributes);
  waxon.addArea('feedbackarea', attributes, 'feedback');
  waxon.addArea('helparea', attributes, 'hjälp/instruktioner');
  waxon.addArea('resultarea', attributes, 'resultat för 10 senaste svaren i varje kategori');

  attributes.display = 'none';
  waxon.addArea('debug', attributes);

  this.displayQuestionInfo();
  smartPractice.showResult();
  return app;
}

// Prints the name of the question.
smartPractice.displayQuestionInfo = function() {
  waxon.clearArea('infoarea');
  var questionInfo = waxon.getQuestionInfo();
  waxon.addToArea('infoarea', 'Frågetyp: ' + (waxon.questions[waxon.getQuestionInfo().id].title || waxon.getQuestionInfo().id), {fontSize : '12px'});
}

smartPractice.processResponse = function(responseCode, responseMessage) {
  var app = UiApp.getActiveApplication();

  waxon.clearArea('feedbackarea');
  var question = waxon.getQuestionInfo();
  var result = waxon.getUserData('result') || {};
  if (Array.isArray(result[question.id]) != true) {
    result[question.id] = [];
  }

  result[question.id].push(responseCode);
  while (result[question.id].length > this.limit) {
    result[question.id].shift();
  }

  // Process responses. Only give new question on correct answer.
  if (responseCode < -1) {
    waxon.addToArea('feedbackarea', 'Ditt svar går inte att tolka eller verkar jättefel.');
  }
  else if (responseCode == -1) {
    waxon.addToArea('feedbackarea', 'Fel. Sorry.');
  }
  else if (responseCode > 0) {
    waxon.removeQuestion();
    waxon.addToArea('feedbackarea', 'Rätt! Bygger nästa fråga...');
  }
  else {
    waxon.addToArea('feedbackarea', 'Ditt svar är nästan rätt. Kolla och försök igen.');
  }
  if (responseMessage != '') {
    waxon.addToArea('feedbackarea', app.createLabel('Mer information: ' + responseMessage));
  }

  waxon.setUserData(result, 'result');
  smartPractice.showResult();

  waxon.setGlobalData(result, 'result', waxon.getUserId());

  this.displayQuestionInfo();

  return app;
}

smartPractice.showResult = function() {
  waxon.clearArea('resultarea');
  var result = waxon.getUserData('result');
  for (var i in result) {
    waxon.addToArea('resultarea', '* ' + (waxon.questions[i].title || i) + ': ' + (this.numberOfCorrect(result[i])) + ' av ' + result[i].length, {fontSize : '12px'});
  }
}

// Method that summarizes how things are going for students/users. Stub.
smartPractice.summary = function() {
  var result, spreadsheet, cellContent, row, numberOfQuestions, columnIndex = {};
  var allResult = waxon.getGlobalData('result');
  if (waxon.getGlobalData('resultSheet') == null) {
    spreadsheet = SpreadsheetApp.create(this.title || ('waxon-resultat ' + new Date()));
    waxon.setGlobalData(spreadsheet.getId(), 'resultSheet');
  }
  else {
    spreadsheet = SpreadsheetApp.openById(waxon.getGlobalData('resultSheet'));
  }

  row = ['elev'];
  for (var i in waxon.questionIds) {
    columnIndex[i] = row.length;
    row.push(waxon.questions[i].title || i);
  }
  numberOfQuestions = row.length - 1;
  cellContent = [row];
  for (var student in allResult) {
    row = Array(numberOfQuestions + 1);
    row[0] = student;
    for (var i in allResult[student]) {
      row[columnIndex[i]] = this.numberOfCorrect(allResult[student][i]);
    }
    cellContent.push(row);
  }

  spreadsheet.getActiveSheet().getRange(1, 1, cellContent.length, cellContent[0].length).setValues(cellContent);
}
