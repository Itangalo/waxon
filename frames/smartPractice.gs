/**
 * @file: Frame used for infinite practice -- more on the difficult questions.
 */

// Create a new object, inheriting properties from 'waxonFrame'.
var smartPractice = new waxonFrame('smartPractice');

// Set this to true to allow resetting the test.
smartPractice.demoMode = true;
smartPractice.teacherIds = ['teacher@example.com'];

smartPractice.title = 'Procedurträning';
smartPractice.limit = 10;
smartPractice.required = 7;
smartPractice.focusProbability = 0.9;
smartPractice.allowedQuestions = [
  'negativeMixed',
  'orderOfOps',
  'fractionsMixed',
  'simplifyExpressions',
  'linearEquations'
];

smartPractice.numberOfCorrect = function(resultArray) {
  var correct = 0;
  for (var i in resultArray) {
    if (resultArray[i].content > 0 || resultArray[i] > 0) {
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

smartPractice.getQuestionList = function() {
  var questionList = this.allowedQuestions || waxon.questionIds;
  var frameSettings = waxon.getUserData('frameSettings');
  // If there is no question to focus on, just return the full list.
  if (questionList.indexOf(frameSettings.focus) == -1) {
    return questionList;
  }

  // If there is a set focus, we should either practice that question or one of
  // the questions above it. Chance decides which.
  if (Math.random() < this.focusProbability) {
    return [frameSettings.focus];
  }

  questionList = questionList.slice(0, questionList.indexOf(frameSettings.focus));
  if (questionList.length == 0) {
    questionList = [frameSettings.focus];
  }
  return questionList;
}

smartPractice.buildQuestionStack = function() {
  var questionList = smartPractice.getQuestionList();
  var weights = {};
  for (var i in questionList) {
    weights[questionList[i]] = smartPractice.practiceNeed(questionList[i]);
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

  // Display a button to show result, if we're in demo mode or a teacher is viewing.
  if (this.demoMode || this.teacherIds.indexOf(waxon.getUserId()) > -1) {
    waxon.addArea('buttons');
    waxon.addArea('summaryarea');
    var app = UiApp.getActiveApplication();
    waxon.addToArea('buttons', app.createButton('sammanställ resultat', app.createServerHandler('smartPracticeSummary')));
    waxon.addToArea('buttons', '(Knappen är endast synlig för lärare, eller i demoläge. I demoläge är elev-ID:n avklippta.)', {fontSize : '12px'});
  }

  if (this.demoMode) {
    waxonUtils.displayDemoInformation(attributes);
  }

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

smartPractice.processResponse = function(responseCode, responseMessage, questionString, answerString) {
  var app = UiApp.getActiveApplication();

  waxon.clearArea('feedbackarea');
  var question = waxon.getQuestionInfo();
  var result = waxon.getUserData('result') || {};
  if (Array.isArray(result[question.id]) != true) {
    result[question.id] = [];
  }

  var color = 'white';
  if (responseCode > 0) {
    color = '#88FF88';
  }
  else if (responseCode < 0) {
    color = '#FF8888';
  }
  else if (responseCode == 0) {
    color = 'yellow';
  }
  result[question.id].push(
    {content : responseCode,
     popup : 'Fråga: ' + questionString + '\r\nSvar: ' + answerString,
     attributes : {background : color},
    });
  while (result[question.id].length > this.limit) {
    result[question.id].shift();
  }

  // Process responses. Only give new question on correct answer.
  if (responseCode < -1) {
    waxon.addToArea('feedbackarea', 'Ditt svar gick inte att tolka, eller innehåller någon orimlighet.');
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

  for (var q in result) {
    result[q] = this.numberOfCorrect(result[q]);
  }
  waxon.setGlobalData(result, 'result', waxon.getUserId());

  this.displayQuestionInfo();

  return app;
}

smartPractice.showResult = function() {
  waxon.clearArea('resultarea');
  var result = waxon.getUserData('result');
  var cellContent = [];
  var row;
  for (var i in result) {
    row = result[i].content || result[i];
    row.unshift({
      content : waxon.questions[i].title || i,
      attributes : {background : (this.numberOfCorrect(result[i]) >= this.required) ? '#88FF88' : 'yellow'},
    });
    row.unshift({
      content : this.numberOfCorrect(result[i]),
      attributes : {background : (this.numberOfCorrect(result[i]) >= this.required) ? '#88FF88' : 'yellow'},
    });
    cellContent.push(row);
  }
  var table = waxonUtils.createTable(cellContent);
  if (table != '(malformatted table)') {
    waxon.addToArea('resultarea', table, {fontSize : '12px'});
  }
}

// Handler callback for creating a summary. Wrapper.
function smartPracticeSummary(eventInfo) {
  smartPractice.summary();
  return UiApp.getActiveApplication();
}

// Method that summarizes how things are going for students/users. Stub.
smartPractice.summary = function() {
  var result, cellContent = [], row, numberOfColumns, columnIndex = {};
  var allResult = waxon.getGlobalData('result');
  row = ['elev'];
  for (var i in this.allowedQuestions) {
    row.push(waxon.questions[this.allowedQuestions[i]].title || this.allowedQuestions[i]);
  }
  cellContent.push(row);
  numberOfColumns = row.length;
  for (var student in allResult) {
    row = Array(numberOfColumns);
    if (this.demoMode) {
      row[0] = student.substring(0, 4);
    }
    else {
      row[0] = student;
    }
    for (var i in this.allowedQuestions) {
      result = allResult[student][this.allowedQuestions[i]];
      if (result != undefined) {
        row[parseInt(i) + 1] = {
          content : result,
          attributes : {background : (result >= this.required) ? '#88FF88' : 'yellow'},
        };
      }
      else {
        row[parseInt(i) + 1] = '-';
      }
    }
    cellContent.push(row);
  }

  var table = waxonUtils.createTable(cellContent);
  var table = waxonUtils.createTable(cellContent);
  waxon.clearArea('summaryarea');
  if (table != '(malformatted table)') {
    waxon.addToArea('summaryarea', table, {fontSize : '12px'});
  }
}
