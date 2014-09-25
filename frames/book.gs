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

f.title = 'En bok med mattefrågor';

f.includedQuestions = {
  baba : {
    questionId : 'baba',
    group : 'Kapitel 1',
  },
  bibi : {
    questionId : 'bibi',
    group : 'Kapitel 1',
  },
  lolo : {
    questionId : 'lolo',
    group : 'Kapitel 2',
  },
  lala : {
    questionId : 'lala',
    group : 'Kapitel 3',
  },
  simpleAddition : {
    questionId : 'simpleAddition',
    group : 'Kapitel 3',
  },
}

f.repeatRatio = .5;

// Tweaking the settings of waxon areas.
gash.areas.question.defaults.label = 'Fråga';
gash.areas.question.defaults.areaAttributes = {
  position : 'fixed', top : '100px', left : '70px',
  width : '360px', height : '240px', float : 'left',
  fontSize : '24px'
};
gash.areas.answer.defaults.label = 'Svara här';
gash.areas.answer.defaults.areaAttributes = {
  position : 'fixed', top : '100px', left : '500px',
  width : '370px', height : '240px', float : 'left',
  fontSize : '24px'
};
gash.areas.learn.defaults.label = 'Läs på och lär mer';
gash.areas.learn.defaults.areaAttributes = {
  position : 'fixed', top : '400px', left : '70px',
  width : '370px', height : '140px', float : 'left'
};
gash.areas.result.defaults.label = 'Dina resultat (även synliga för läraren)';
gash.areas.result.defaults.areaAttributes = {
  position : 'fixed', top : '400px', left : '500px',
  width : '370px', height : '140px', float : 'left'
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
  var focus;
  if (Array.isArray(gash.queryParameters.focus)) {
    focus = gash.queryParameters.focus[0];
  }
  if (this.includedQuestions[focus] == undefined) {
    focus = Object.keys(this.includedQuestions)[0];
  }

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
  this.assureUserDataStructure(userData, focus);

  // If the active question isn't the one in focus, change the active question.
  if (!userData.activeQuestion || userData.activeQuestion.id != focus) {
    // The question parameters should be stashed away, so we can use them again later if need be.
    if (userData.questions[focus].id != focus) {
      userData.questions[focus].id = focus;
      userData.questions[focus].parameters = waxon.questions[focus].generateParameters();
    }
    userData.activeQuestion = userData.questions[focus];
    userData.needsSaving = true;
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
  var id = userData.activeQuestion.id;
  userData.result[id].track.push(responseCode);
  userData.result[id].count++;

  // First we check if the question is skipped. If so, remove active question and stashed question
  // of this type.
  if (responseCode == waxon.SKIPPED) {
    gash.areas.result.add('Hoppar över frågan...');
    this.resetActiveQuestion(userData);
  }

  if (responseCode > 0) {
    gash.areas.result.add('Rätt! Yay you!');
    userData.result[id].correct++;
    this.resetActiveQuestion(userData);
  }
  else {
    gash.areas.result.add('Fel. Sorry.');
  }
  if (responseMessage != '') {
    gash.areas.result.add('Mer information: ' + responseMessage);
  }
  if (responseCode < 0) {
    gash.areas.result.add('Senaste fråga: ' + questionString);
    gash.areas.result.add('Senaste svar: ' + answerString);
  }

  gash.areas.result.add('Av den här frågetypen har du fått ' + userData.result[id].correct + ' gånger av ' + userData.result[id].count + '.');
}

f.resetActiveQuestion = function(userData) {
  userData.questions[userData.activeQuestion.id] = {};
  waxon.resetActiveQuestion(userData);
  if (Math.random() < this.repeatRatio) {
    userData.activeQuestion.forcedRepeat = true;
  }
}

f.assureUserDataStructure = function(userData, focus) {
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
      lastCorrect : false,
    };
    userData.needsSaving = true;
  }
}

f.populateBrowser = function(selectedGroup) {
  gash.areas.browse.clear();
  // This function can be called from a handler, but also on page callback where we have no provided
  // selected group. These checks verifies that we have a valid selectedGroup.
  var questionList = gash.utils.groupByProperty(this.includedQuestions, 'group');
  if (questionList[selectedGroup] == undefined) {
    // See if the query parameters focuses on a question in a particular group. Otherwise, select first group.
    if (gash.queryParameters.focus != undefined && this.includedQuestions[gash.queryParameters.focus] != undefined) {
      selectedGroup = this.includedQuestions[gash.queryParameters.focus].group;
    }
    else {
      selectedGroup = this.includedQuestions[Object.keys(this.includedQuestions)[0]].group;
    }
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

  // Add links to the questions in this group.
  for (var i in questionList[selectedGroup]) {
    gash.areas.browse.add(app.createAnchor(waxon.questions[i].title, gash.utils.getCurrentUrl({focus : i})).setTarget('_self'));
  }
}

function bookGroupSelectHandler(eventInfo) {
  waxon.frame.populateBrowser(eventInfo.parameter.groupSelect);
  return UiApp.getActiveApplication();
}
