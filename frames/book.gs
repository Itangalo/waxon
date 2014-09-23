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

var baba = new waxonQuestion('baba');
var bibi = baba.tweak('bibi', {}, {title : 'Bibi'});
var lolo = baba.tweak('lolo', {}, {title : 'Lolo'});
var lala = bibi.tweak('lala', {}, {title : 'Lala'});

f.includedQuestions = {
  baba : {
    questionId : 'dev',
    group : 'Kapitel 1',
  },
  bibi : {
    questionId : 'dev',
    group : 'Kapitel 1',
  },
  lolo : {
    questionId : 'dev',
    group : 'Kapitel 2',
  },
  lala : {
    questionId : 'dev',
    group : 'Kapitel 3',
  },
}

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
  var app = UiApp.getActiveApplication();
  // Alternative images: http://ibin.co/1bKBH71X3MKU (open book), http://ibin.co/1bKDMgOUU6WU (open book 960 px)
  // http://ibin.co/1bK3afRxpjiF (book pages), http://ibin.co/1bK70yYxM42P (square lined paper)
  app.setStyleAttribute('backgroundImage', 'url("http://ibin.co/1bKDMgOUU6WU")').setStyleAttribute('backgroundRepeat', 'no-repeat').setHeight(900).setWidth(900).setStyleAttribute('overflow', 'auto');

  userData.activeQuestion = 'dev';
  return userData;
}

f.initialize = function(userData) {
  this.populateBrowser();
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

f.processResponse = function(responseCode, responseMessage, questionString, answerString, userData) {
}

function bookGroupSelectHandler(eventInfo) {
  waxon.frame.populateBrowser(eventInfo.parameter.groupSelect);
  return UiApp.getActiveApplication();
}
