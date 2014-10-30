/**
 * @file: Frame for waxon, used for tests.
 */

/**
 * This project is licensed under GNU general public license. Feel free to
 * use, study, share and improve. See https://github.com/Itangalo/waxon/ for
 * source code and license details. The waxon project builds on the gash
 * framework. See https://github.com/Itangalo/gash/ for details.
 */

var f = new waxonFrame('test');

/**
 * Things that probably are overridden on each installation.
 */
f.title = 'Diagnos';
f.includedQuestions = {};
//f.includedQuestions.1 = {
//  questionId : 'exampleQuestion',
//  group : 'Question group',
//  options : {}
//};

f.studentGroups = {
  'teacher@example.com' : {
    'student1@example.com' : 'Student one',
    'student2@example.com' : 'Student two',
    'student3@example.com' : 'Student three',
    'student4@example.com' : 'Student four',
  }
};

// Turn off some things that are usually displayed.
f.hideSkipButton = true;
f.hideHelp = true;
f.hideResult = true;

// Tweaking the settings of waxon areas.
gash.areas.question.defaults.label = 'Fråga';
gash.areas.question.defaults.areaAttributes = {
  position : 'fixed', top : '100px', left : '70px',
  width : '360px', height : '240px', float : 'left',
  fontSize : '24px', overflow : 'auto'
};
gash.areas.answer.defaults.label = 'Svara här';
gash.areas.answer.defaults.areaAttributes = {
  position : 'relative', top : '100px', marginLeft : '500px',
  width : '370px', height : '240px', float : 'left',
  fontSize : '24px', overflow : 'auto'
};
// These areas won't get any content.
gash.areas.learn.defaults.areaAttributes = {
  position : 'fixed', top : '1px', left : '70px',
  width : '1px', height : '1px', float : 'left',
  overflow : 'auto',
  border : 'none'
};
gash.areas.result.defaults.areaAttributes = {
  position : 'fixed', top : '1px', left : '500px',
  width : '1px', height : '1px', float : 'left',
  overflow : 'auto',
  border : 'none'
};

// Adding a new area, used for navigating between questions.
var browseArea = new gashArea('browse', {
  label : 'Navigera bland frågorna',
  areaAttributes : {
    position : 'fixed', top : '30px', left : '70px',
    width : '810px', height : '40px',
    border : 'none'
  },
  elementAttributes : {marginRight : '5px', fontSize : '0.75em', float : 'left'},
});

f.resolveQuestion = function(userData) {
  // Get focus from query parameters, or default to first question in the frame's list.
  var focus = this.getFocus(userData);
  this.assureUserDataStructure(userData, focus);
  var focusId = this.includedQuestions[focus].id;

  // If the active question isn't the one in focus, change the active question.
  if (!userData.activeQuestion || userData.activeQuestion.number !== focus) {
    if (userData.questions[focus] == undefined) {
      userData.questions[focus] = {};
    }
    // The question parameters should be stashed away, so we can use them again later if need be.
    if (userData.questions[focus].id != focusId) {
      userData.questions[focus].id = focusId;
      userData.questions[focus].number = focus;
      userData.questions[focus].parameters = waxon.questions[focusId].generateParameters(this.includedQuestions[focus].options);
    }
    userData.activeQuestion = userData.questions[focus];
    userData.needsSaving = true;
  }

  UiApp.getActiveApplication().getElementById('question-wrapper').setCaptionText(focus);

  if (userData.result[focus].lastAnswer) {
    gash.areas.answer.add('Du har redan svarat på den här frågan. Om du vill kan du svara på den igen, för att byta ut det tidigare svaret.<br/>Ditt senaste svar var <em> ' + userData.result[focus].lastAnswer) + '</em>.  ';
    gash.areas.answer.add('<hr/>');
  }

  return userData;
}

f.initialize = function(userData) {
  var app = UiApp.getActiveApplication();
  // Alternative images: http://ibin.co/1bKBH71X3MKU (open book), http://ibin.co/1bKDMgOUU6WU (open book 960 px)
  // http://ibin.co/1bK3afRxpjiF (book pages), http://ibin.co/1bK70yYxM42P (square lined paper)
  app.setStyleAttribute('backgroundImage', 'url("http://ibin.co/1bKDMgOUU6WU")').setStyleAttribute('backgroundRepeat', 'no-repeat').setHeight(900).setWidth(900).setStyleAttribute('overflow', 'auto');

  this.populateBrowser();
}

f.processResponse = function(responseCode, responseMessage, questionString, answerString, userData) {
  gash.areas.result.clear();
  userData.needsSaving = true;
  var number = userData.activeQuestion.number;
  var id = userData.activeQuestion.id;

  userData.result[number].lastQuestion = questionString;
  userData.result[number].lastAnswer = answerString;
  userData.result[number].track = responseCode;
  userData.result[number].isAnswered = true;

  userData.result[number].count++;
  userData.result[number].lastAttempt = new Date().toString();


  this.resetActiveQuestion(userData);
  var keys = Object.keys(this.includedQuestions);
  userData.focus = keys[keys.indexOf(number) + 1];
}

f.getFocus = function(userData) {
  var focus;
  // First check if there is a focus set in query parameters. This is only true on new page loads.
  if (Array.isArray(gash.queryParameters.focus)) {
    focus = gash.queryParameters.focus[0];
  }
  // If no focus was found in query parameters, try using last set focus.
  if (focus == undefined) {
    focus = userData.focus;
  }
  // If this doesn't work, use the first question in the frame.
  if (this.includedQuestions[focus] == undefined) {
    focus = Object.keys(this.includedQuestions)[0];
  }
  // Remember the focus.
  if (userData.focus != focus) {
    userData.focus = focus;
    userData.needsSaving = true;
  }
  return focus;
}

f.resetActiveQuestion = function(userData) {
  waxon.resetActiveQuestion(userData);
}

f.assureUserDataStructure = function(userData, focus) {
  if (userData == null) {
    userData = {};
  }
  if (userData.activeQuestion == undefined) {
    userData.activeQuestion = {};
    userData.needsSaving = true;
  }
  if (userData.questions == undefined) {
    userData.questions = {};
    userData.needsSaving = true;
  }
  if (userData.result == undefined) {
    userData.result = {};
    userData.needsSaving = true;
  }

  focus = focus || this.getFocus(userData);
  if (userData.questions[focus] == undefined) {
    userData.questions[focus] = {};
    userData.needsSaving = true;
  }
  if (userData.result[focus] == undefined) {
    userData.result[focus] = {
      count : 0,
      lastBuild : '',
      lastAttempt : '',
      lastCorrect : '',
      isAnswered : false,
    };
    userData.needsSaving = true;
  }
}

f.populateBrowser = function(selectedGroup) {
  gash.areas.browse.clear();
  // This function can be called from a handler, but also on page callback where we have no provided
  // selected group. These checks verifies that we have a valid selectedGroup.
  var userData = waxon.loadUserData();
  var focus = this.getFocus(userData);
  var questionList = gash.utils.groupByProperty(this.includedQuestions, 'group');
  if (questionList[selectedGroup] == undefined) {
    selectedGroup = this.includedQuestions[focus].group;
  }

  // Build a select list with the question groups, if there is more than one group available.
  var app = UiApp.getActiveApplication();
  if (Object.keys(questionList).length > 1) {
    var groupSelectHandler = app.createServerHandler('testGroupSelectHandler');
    var groupSelect = app.createListBox().setName('groupSelect').addChangeHandler(groupSelectHandler);
    for (var i in questionList) {
      groupSelect.addItem(i, i);
    }
    groupSelect.setSelectedIndex(Object.keys(questionList).indexOf(selectedGroup));
    gash.areas.browse.add(groupSelect);
  }

  var styles, label;
  // Add links to the questions in this group.
  for (var i in questionList[selectedGroup]) {
    styles = {};
    label = questionList[selectedGroup][i].shortTitle || i;
    if (!userData.result[i] || !userData.result[i].isAnswered) {
      label += '*';
    }
    gash.areas.browse.add(app.createAnchor(label, gash.utils.getCurrentUrl({focus : i})).setTarget('_self'), styles);
  }

  if (this.studentGroups[waxon.getUser()] != undefined) {
    var app = UiApp.getActiveApplication();
    var resultSummaryHandler = app.createServerHandler('testResultSummary');
    gash.areas.browse.add(app.createButton('Se klassresultat', resultSummaryHandler));
  }
}

function testGroupSelectHandler(eventInfo) {
  waxon.frame.populateBrowser(eventInfo.parameter.groupSelect);
  return UiApp.getActiveApplication();
}

function testResultSummary(eventInfo) {
  var app = UiApp.getActiveApplication();
  gash.areas.question.clear();
  var students = waxon.frame.studentGroups[waxon.getUser()];
  var group = waxon.frame.includedQuestions[waxon.loadUserData().activeQuestion.id].group;

  var questions = gash.utils.groupByProperty(waxon.frame.includedQuestions, 'group')[group];
  var grid = app.createGrid(Object.keys(students).length + 1, Object.keys(questions).length + 1);
  var rowCount = 0, columnCount = 0, result = {};
  // Set headers for the table
  for (var j in questions) {
    columnCount++;
    grid.setWidget(0, columnCount, app.createLabel(columnCount).setTitle(waxon.questions[j].title));
    if (questions[j].isImportant) {
      grid.setColumnStyleAttribute(columnCount, 'background', '#ffff88');
    }
  }

  for (var i in students) {
    rowCount++;
    grid.setText(rowCount, 0, students[i].name);
    result[i] = waxon.loadUserData(i);
    if (result[i].result == undefined) {
      grid.setStyleAttribute(rowCount, 0, 'background', 'lightgray');
      continue;
    }
    columnCount = 0;
    for (var j in questions) {
      columnCount++;
      if (result[i].result[j] == undefined) {
        grid.setText(rowCount, columnCount, '-');
      }
      else {
        grid.setText(rowCount, columnCount, result[i].result[j].correct);
        if (result[i].result[j].hasBeenFulfilled) {
          grid.setStyleAttribute(rowCount, columnCount, 'background', 'lightgreen');
        }
      }
    }
  }
  gash.areas.question.add(grid);
  return app;
}
