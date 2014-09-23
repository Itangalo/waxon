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

var q = new waxonQuestion('dev');

var f = new waxonFrame('book');

f.title = 'En bok med mattefrågor';

f.includedQuestions = {
  baba : {
    questionId : 'dev',
    options : {a : 1, b : 2},
    group : 'Kapitel 1',
    label : 'Baba',
  },
  bibi : {
    questionId : 'dev',
    options : {a : 2, b : 2},
    group : 'Kapitel 1',
    label : 'Bibi',
  },
  lolo : {
    questionId : 'dev',
    options : {a : 2, b : 3},
    group : 'Kapitel 2',
    label : 'Lolo',
  },
  lala : {
    questionId : 'dev',
    options : {a : 3, b : 2},
    group : 'Kapitel 2',
    label : 'Lala',
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
  var questionList = {};
  for (var i in this.includedQuestions) {
    if (questionList[this.includedQuestions[i].group] == undefined) {
      questionList[this.includedQuestions[i].group] = {};
    }
    this.includedQuestions[i].id = i;
    questionList[this.includedQuestions[i].group][i] = this.includedQuestions[i];

  }

  var app = UiApp.getActiveApplication();
  var groupSelect = app.createListBox().setName('groupSelect');
  for (var i in questionList) {
    groupSelect.addItem(i, i);
  }
  gash.areas.browse.add(groupSelect);
}

f.processResponse = function(responseCode, responseMessage, questionString, answerString, userData) {
}
