/**
 * @file: Frame used for short tests, reported to a teacher.
 */

// Create a new object, inheriting properties from 'waxonFrame'.
var shortTest = new waxonFrame('shortTest');

shortTest.stack = [
  'negativeMixed',
  'negativeMixed',
  'negativeMixed',
  'negativeMixed',
  {id :  'orderOfOps',
   options : {expressionType : ['a±b*c'], positive : true}
  },
  {id :  'orderOfOps',
   options : {expressionType : ['a±b/c'], positive : true}
  },
  'orderOfOps',
  'orderOfOps',
  {id :  'fractionsMixed',
   options : {operations : ['-'], positive : true}
  },
  {id :  'fractionsMixed',
   options : {operations : ['+']}
  },
  {id :  'fractionsMixed',
   options : {operations : ['*']}
  },
  'fractionsMixed',
  {id :  'simplifyExpressions',
   options : {expressionType : ['()+b()', 'a()+()']}
  },
  {id :  'simplifyExpressions',
   options : {expressionType : ['()+b()', 'a()+()']}
  },
  {id :  'simplifyExpressions',
   options : {expressionType : ['()+b()', 'a()+()']}
  },
  {id :  'simplifyExpressions',
   options : {expressionType : ['()+b()', 'a()+()']}
  },
  {id :  'linearEquations',
   options : {leftExpressionType : ['()'], rightExpressionType : ['ax', 'a', 'x']}
  },
  {id :  'linearEquations',
   options : {leftExpressionType : ['()'], rightExpressionType : ['ax', 'a', 'x']}
  },
  {id :  'linearEquations',
   options : {leftExpressionType : ['()', 'a()'], rightExpressionType : ['ax', 'a', 'x']}
  },
  {id :  'linearEquations',
   options : {leftExpressionType : ['()', 'a()'], rightExpressionType : ['ax', 'a', 'x']}
  },
];

shortTest.title = 'Exempel på diagnos';

shortTest.buildQuestionStack = function() {
  // Make sure that the stack ends with 'noMoreQuestions'.
  if (this.stack.length == 0 || (this.stack[this.stack.length - 1] != 'noMoreQuestions' && this.stack[this.stack.length - 1].id != 'noMoreQuestions')) {
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

  waxon.addArea('result');

  if (waxon.demoMode == true) {
    waxon.addArea('reset');
    var app = UiApp.getActiveApplication();
    waxon.addToArea('reset', app.createButton('starta om', app.createServerHandler('shortTestReset')));
    waxon.addToArea('reset', '(Knappen finns endast med i demoläge.)', {fontSize : '12px'});
  }

  waxon.addArea('table');

  if (waxon.demoMode) {
    waxonUtils.displayDemoInformation(attributes);
  }

  attributes.display = 'none';
  waxon.addArea('feedbackarea', attributes);
  waxon.addArea('helparea', attributes);
  waxon.addArea('debug', attributes);


  this.displayQuestionNumber();


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

  // Display a button to show result, if we're in demo mode or a teacher is viewing.
  if (waxon.demoMode || waxon.teacherIds.indexOf(waxon.getUserId()) > -1) {
    waxon.clearArea('result');
    var app = UiApp.getActiveApplication();
    waxon.addToArea('result', app.createButton('sammanställ resultat', app.createServerHandler('shortTestSummary')));
    waxon.addToArea('result', '(Knappen är endast synlig för lärare, eller i demoläge. I demoläge är elev-ID:n avklippta.)', {fontSize : '12px'});
  }
}

shortTest.processResponse = function(responseCode, responseMessage, questionString, answerString) {
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
  result.push({
    result : responseCode,
    questionString : questionString,
    answerString : answerString,
  });
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

// Handler callback for creating a summary. Wrapper.
function shortTestSummary(eventInfo) {
  shortTest.summary();
  return UiApp.getActiveApplication();
}

// Method that summarizes how things are going for students/users. Stub.
shortTest.summary = function() {
  var result, cellContent, row, numberOfQuestions;
  var app = UiApp.getActiveApplication();
  var allResult = waxon.getGlobalData('result');
  var table = app.createGrid(Object.keys(allResult).length + 1, this.buildQuestionStack().length + 1).setColumnStyleAttribute(1, 'background', '#CCCCCC');

  waxon.clearArea('table');

  row = this.buildQuestionStack();
  for (var i in row) {
    row[i] = row[i].id || row[i];
  }
  row.pop();
  numberOfQuestions = row.length;
  row.unshift('Antal rätt');
  row.unshift('Elev');
  cellContent = [row];

  for (var user in allResult) {
    row = allResult[user];
    // If we are in demo mode, only record the first four letters of the user ID.
    if (waxon.demoMode) {
      row.unshift(user.substring(0, 4) + '…');
    }
    else {
      row.unshift(user);
    }
    cellContent.push(row);
  }

  // Format the cell content
  for (var i in cellContent) {
    for (var j in cellContent[i]) {
      if (parseInt(i) > 0 && parseInt(j) > 1) {
        // This condition is to be able to parse old result data.
        if (typeof cellContent[i][j] == 'string' || typeof cellContent[i][j] == 'number') {
          cellContent[i][j] = {content : cellContent[i][j]};
        }
        else {
          cellContent[i][j].content = cellContent[i][j].result;
          cellContent[i][j].popup = 'Fråga: ' + cellContent[i][j].questionString + '\r\nSvar: ' + cellContent[i][j].answerString;
        }
        // Set redish or greenish color depending on result.
        if (cellContent[i][j].content > 0) {
          cellContent[i][j].attributes = {background : '#88FF88'};
        }
        if (cellContent[i][j].content < 0) {
          cellContent[i][j].attributes = {background : '#FF8888'};
        }
      }
    }
  }

  // Build the table
  var table = waxonUtils.createTable(cellContent);

  // Set some background colors, for readability
  table.setRowStyleAttribute(0, 'background', 'yellow');
  for (var i = 4; i < cellContent.length; i = i + 4) {
    table.setRowStyleAttribute(i, 'background', '#DDDDDD');
  }
  for (var j = 5; j < cellContent[0].length; j = j + 4) {
    table.setColumnStyleAttribute(j, 'background', '#DDDDDD');
  }
  waxon.addToArea('table', table);
  return app;
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
