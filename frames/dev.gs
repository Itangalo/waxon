// Main function of the web app.
function doGet() {  
  var app = UiApp.createApplication();
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

  delete(attributes.border);
  waxon.addArea('infobox', attributes);
  waxon.addToArea('infobox', app.createLabel('Det här är en tidig version av projektet "waxon", med mål att göra det lätt att sätta samman uppgifter för mängdträning.'));
  waxon.addToArea('infobox', app.createLabel('Tanken är att man ska kunna lägga till nya typer av frågor som egna plugins, och att man ska kunna använda olika lägen för att träna på uppgifterna.'));
  waxon.addToArea('infobox', app.createLabel('I denna tidiga proof-of-concept finns bara en typ av frågor (bråkräkning med fyra räknesätt) och ett läge för att träna (oändligt många frågor). Om konceptet fungerar kommer det att dyka upp fler typer av frågor, och fler sätt att använda dem (exempelvis diagnoser med färdiga set av frågor, plus sammanställning av resultat för lärare).'));
  waxon.addToArea('infobox', app.createLabel('Projektet är open source och går att hitta på https://github.com/Itangalo/waxon'));

  buildQuestion();
  return app;
}

function buildQuestion(questionId) {
  var app = UiApp.getActiveApplication();
  waxon.clearArea('questionarea');
  waxon.clearArea('answerarea');

  var question = waxon.questions.fractionsMixed;
  var parameters = question.generateParameters();
  var handler = app.createServerHandler('checkAnswer');

  parameters.questionId = question.id;
  waxon.writeParameters(parameters, handler);
  var questionElements = question.questionElements(parameters);
  for (var i in questionElements) {
    waxon.addToArea('questionarea', questionElements[i]);
  }
  
  var answerElements = question.answerElements(parameters);
  for (var i in answerElements) {
    try {
      answerElements[i].setId(i);
      answerElements[i].setName(i);
    }
    catch(e) {}
    waxon.addToArea('answerarea', answerElements[i]);
    handler.addCallbackElement(answerElements[i]);
  }
  waxon.addToArea('answerarea', app.createSubmitButton('Skicka svar').addClickHandler(handler));
  
  return app;
}

function checkAnswer(eventInfo) {
  var parameters = waxon.readParameters(eventInfo);
  var questionId = parameters.questionId;
  
  var app = UiApp.getActiveApplication();  
  var response = waxon.cleanupResponse(waxon.questions[questionId].evaluateAnswer(parameters, eventInfo.parameter));
  
  waxon.clearArea('feedbackarea');
  waxon.addToArea('feedbackarea', app.createLabel(response.message));
  
  if (response.result > 0) {
    debug('Rätt');
    buildQuestion();
  }
  
  return app;
}

function debug(variable, reset) {
  var app = UiApp.getActiveApplication();
  if (reset == true) {
    waxon.clearArea('debug');
  }
  
  if (typeof variable == 'object') {
    for (var i in variable) {
      waxon.addToArea('debug', app.createLabel(variable[i]));
    }
  }
  else {
    waxon.addToArea('debug', app.createLabel(variable));
  }
}
