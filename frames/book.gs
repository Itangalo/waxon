/**
 * @file: Main file for waxon -- a framework for machine created and evaluated questions
 * built on top of Google Apps Script.
 */

/**
 * This project is licensed under GNU general public license. Feel free to
 * use, study, share and improve. See https://github.com/Itangalo/waxon/ for
 * source code and license details. The waxon project builds on the gash
 * framework. See https://github.com/Itangalo/gash/ for details.
 */

var f = new waxonFrame('book');

/**
 * Things that probably are overridden on each installation.
 */
f.title = 'En bok med mattefrågor';
f.trackLength = 10;
f.trackRequired = 7;
f.repeatRatio = 0;
f.includedQuestions = {
  exampleQuestion : {
    questionId : 'exampleQuestion',
    group : 'Question group',
  },
}
f.studentGroups = {
  'teacher@example.com' : {
    'student1@example.com' : 'Student one',
    'student2@example.com' : 'Student two',
    'student3@example.com' : 'Student three',
    'student4@example.com' : 'Student four',
  }
};

// Tweaking the settings of waxon areas.
gash.areas.question.defaults.label = 'Fråga';
gash.areas.question.defaults.areaAttributes = {
  position : 'fixed', top : '100px', left : '70px',
  width : '360px', height : '240px', float : 'left',
  fontSize : '24px', overflow : 'auto'
};
gash.areas.answer.defaults.label = 'Svara här';
gash.areas.answer.defaults.areaAttributes = {
  position : 'fixed', top : '100px', left : '500px',
  width : '370px', height : '240px', float : 'left',
  fontSize : '24px', overflow : 'auto'
};
gash.areas.learn.defaults.label = 'Läs på och lär mer';
gash.areas.learn.defaults.areaAttributes = {
  position : 'fixed', top : '400px', left : '70px',
  width : '370px', height : '140px', float : 'left',
  overflow : 'auto'
};
gash.areas.result.defaults.label = 'Dina resultat (även synliga för läraren)';
gash.areas.result.defaults.areaAttributes = {
  position : 'fixed', top : '400px', left : '500px',
  width : '370px', height : '140px', float : 'left',
  overflow : 'auto'
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
  // Special rules apply if we have a forced repeat.
  // @TODO: Make the forced repeat select a question in a better way.
  if (userData.activeQuestion.forcedRepeat) {
    gash.areas.browse.clear();
    gash.areas.browse.add('Forced repeat!');
    if (userData.activeQuestion.id == undefined) {
      userData.activeQuestion.id = 'simpleAddition';
      userData.activeQuestion.parameters = waxon.questions.simpleAddition.generateParameters();
      userData.needsSaving = true;
    }
    return userData;
  }

  // If the active question isn't the one in focus, change the active question.
  if (!userData.activeQuestion || userData.activeQuestion.id != focus) {
    // The question parameters should be stashed away, so we can use them again later if need be.
    if (userData.questions[focus].id != focus) {
      userData.questions[focus].id = focus;
      userData.questions[focus].parameters = waxon.questions[focus].generateParameters();
    }
    userData.activeQuestion = userData.questions[focus];
    userData.needsSaving = true;
  }

  var result = [];
  for (var i in userData.result[focus].track) {
    if (userData.result[focus].track[i] > 0) {
      result.push('R');
    }
    else {
      result.push('F');
    }
  }
  gash.areas.result.add('På de ' + this.trackLength + ' senaste svaren har du haft ' + userData.result[focus].correct + ' rätt: ' + result.join('|') + '  ');
  if (this.includedQuestions[focus].isImportant) {
    var important = '<strong>Det här är en viktig uppgift</strong>, vilket betyder att du behöver få minst ' + this.trackRequired + ' rätt. ';
    if (userData.result[focus].isFulfilledNow) {
      important += 'Det har du lyckats med!  ';
    }
    else if (userData.result[focus].hasBeenFulfilled) {
      important += 'Du har tidigare haft så många rätt, vilket läraren kommer att se.  ';
    }
    gash.areas.result.add(important);
  }

  gash.areas.result.add('Totalt har du svarat ' + userData.result[focus].count + ' gånger på uppgifter av den här typen.  ');

  gash.areas.result.add('<hr/>');
  gash.areas.result.add('Senaste fråga: ' + userData.result[focus].lastQuestion + '  ');
  gash.areas.result.add('Senaste svar: ' + userData.result[focus].lastAnswer);
  if (userData.result[focus].lastCorrect) {
    gash.areas.result.add(' (rätt)');
  }

  return userData;
}

f.initialize = function(userData) {
  var app = UiApp.getActiveApplication();
  // Alternative images: http://ibin.co/1bKBH71X3MKU (open book), http://ibin.co/1bKDMgOUU6WU (open book 960 px)
  // http://ibin.co/1bK3afRxpjiF (book pages), http://ibin.co/1bK70yYxM42P (square lined paper)
  app.setStyleAttribute('backgroundImage', 'url("http://ibin.co/1bKDMgOUU6WU")').setStyleAttribute('backgroundRepeat', 'no-repeat').setHeight(900).setWidth(900).setStyleAttribute('overflow', 'auto');

  app.getElementById('learn-wrapper').setText('Information om frågetypen "' + waxon.questions[userData.activeQuestion.id].title + '"');

  if (!userData.activeQuestion.forcedRepeat) {
    this.populateBrowser();
  }
}

f.processResponse = function(responseCode, responseMessage, questionString, answerString, userData) {
  gash.areas.result.clear();
  userData.needsSaving = true;
  var id = userData.activeQuestion.id;
  userData.result[id].lastQuestion = questionString;
  userData.result[id].lastAnswer = answerString;
  userData.result[id].track.push(responseCode);
  while (userData.result[id].track.length > this.trackLength) {
    userData.result[id].track.shift();
  }
  userData.result[id].correct = 0;
  for (var i in userData.result[id].track) {
    if (userData.result[id].track[i] > 0) {
      userData.result[id].correct++;
    }
  }
  if (userData.result[id].correct >= this.trackRequired) {
    userData.result[id].isFulfilledNow = true;
    userData.result[id].hasBeenFulfilled = true;
  }
  else {
    userData.result[id].isFulfilledNow = false;
  }
  userData.result[id].count++;
  userData.result[id].lastAttempt = new Date().toString();

  // First we check if the question is skipped. If so, remove active question and stashed question
  // of this type.
  if (responseCode == waxon.SKIPPED) {
    gash.areas.result.add('Hoppar över frågan...');
    this.resetActiveQuestion(userData);
  }

  userData.result[id].lastCorrect = false;
  if (responseCode > 0) {
    userData.result[id].lastCorrect = true;
    gash.areas.result.add('Rätt! Yay you!');
    userData.result[id].correct++;
    this.resetActiveQuestion(userData);
  }
  else if (responseCode != waxon.SKIPPED) {
    gash.areas.result.add('Fel. Sorry.');
  }
  if (responseMessage != '') {
    gash.areas.result.add('Mer information: <strong>' + responseMessage + '</strong>');
  }
  gash.areas.result.add('<hr/>');
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
  userData.questions[userData.activeQuestion.id] = {};
  waxon.resetActiveQuestion(userData);
  if (Math.random() < this.repeatRatio) {
    userData.activeQuestion.forcedRepeat = true;
  }
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
  if (userData.questions[focus] == undefined) {
    userData.questions[focus] = {};
    userData.needsSaving = true;
  }
  if (userData.result == undefined) {
    userData.result = {};
    userData.needsSaving = true;
  }
  if (userData.result[focus] == undefined) {
    userData.result[focus] = {
      count : 0,
      track : [],
      correct : 0,
      lastBuild : '',
      lastAttempt : '',
      lastQuestion : '(detta är första frågan)',
      lastAnswer : '(detta är första frågan)',
      lastCorrect : false,
      hasBeenFulfilled : false,
      isFulfilledNow : false,
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

  // Build a select list with the question groups.
  var app = UiApp.getActiveApplication();
  var groupSelectHandler = app.createServerHandler('bookGroupSelectHandler');
  var groupSelect = app.createListBox().setName('groupSelect').addChangeHandler(groupSelectHandler);
  for (var i in questionList) {
    groupSelect.addItem(i, i);
  }
  groupSelect.setSelectedIndex(Object.keys(questionList).indexOf(selectedGroup));
  gash.areas.browse.add(groupSelect);

  var styles, label;
  // Add links to the questions in this group.
  for (var i in questionList[selectedGroup]) {
    styles = {};
    if (i == focus) {
      styles.fontWeight = 'bold';
    }
    if (this.includedQuestions[i].isImportant) {
      label = waxon.questions[i].shortTitle + '*';
    }
    else {
      label = waxon.questions[i].shortTitle;
    }
    if (userData.result[i] && userData.result[i].isFulfilledNow) {
      styles.color = 'green';
    }
    else if (userData.result[i] && userData.result[i].hasBeenFulfilled) {
      styles.color = 'lightgreen';
    }
    gash.areas.browse.add(app.createAnchor(label, gash.utils.getCurrentUrl({focus : i})).setTarget('_self'), styles);
  }

  if (this.studentGroups[waxon.getUser()] != undefined) {
    var app = UiApp.getActiveApplication();
    var resultSummaryHandler = app.createServerHandler('bookResultSummary');
    gash.areas.browse.add(app.createButton('Se klassresultat', resultSummaryHandler));
  }
}

function bookGroupSelectHandler(eventInfo) {
  waxon.frame.populateBrowser(eventInfo.parameter.groupSelect);
  return UiApp.getActiveApplication();
}

function bookResultSummary(eventInfo) {
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
