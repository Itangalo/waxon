/**
 * @file: Frame used while building/testing waxon questions.
 */

// Create a new object, inheriting properties from 'waxonQuestion'.
var devFrame = new waxonFrame('devFrame');

devFrame.buildQuestionStack = function() {
  var stack = [];
  var availableQuestions = waxon.questionIds;
  stack.push(availableQuestions[waxonUtils.randomInt(0, availableQuestions.length - 1)]);
  stack.push(availableQuestions[waxonUtils.randomInt(0, availableQuestions.length - 1)]);
  stack.push(availableQuestions[waxonUtils.randomInt(0, availableQuestions.length - 1)]);
//  stack.push('noMoreQuestions');
  stack = ['multiplyingBinomials'];
  return stack;
};

devFrame.drawAreas = function() {
  var app = UiApp.getActiveApplication();
  var attributes = {
    border : 'thin black solid',
    minHeight : '100px',
    maxHeight : '200px',
    margin : '3px',
    padding : '3px',
  }

  waxon.addArea('questionarea', attributes);
  waxon.addArea('answerarea', attributes);
  waxon.addArea('feedbackarea', attributes);
  waxon.addArea('debug', attributes);
  return app;

  delete(attributes.border);
  delete(attributes.background);
  waxon.addArea('infobox', attributes);
  waxon.addToArea('infobox', app.createLabel('Det här är en tidig version av projektet "waxon", med mål att göra det lätt att sätta samman uppgifter för mängdträning.'));
  waxon.addToArea('infobox', app.createLabel('Tanken är att man ska kunna lägga till nya typer av frågor som egna plugins, och att man ska kunna använda olika lägen för att träna på uppgifterna.'));
  waxon.addToArea('infobox', app.createLabel('I denna tidiga proof-of-concept finns bara två typer av frågor (enkel addition respektive bråkräkning med fyra räknesätt) och ett läge för att träna (oändligt många frågor). Om konceptet fungerar kommer det att dyka upp fler typer av frågor, och fler sätt att använda dem (exempelvis diagnoser med färdiga set av frågor, plus sammanställning av resultat för lärare).'));
  waxon.addToArea('infobox', app.createLabel('Projektet är open source och går att hitta på https://github.com/Itangalo/waxon'));
  return app;
}

devFrame.processResponse = function(responseCode, responseMessage) {
  var app = UiApp.getActiveApplication();

  waxon.clearArea('feedbackarea');
  waxon.addToArea('feedbackarea', app.createLabel('Response code: ' + responseCode));
  waxon.addToArea('feedbackarea', app.createLabel('Response message: ' + responseMessage));


  if (responseCode > 0) {
    waxon.removeQuestion();
    waxon.addToArea('feedbackarea', 'Ger nästa fråga...');
  }
  return app;
}
