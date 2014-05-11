/**
 * @file: Frame used for demonstrating waxon.
 */

// Create a new object, inheriting properties from 'waxonQuestion'.
var demoFrame = new waxonFrame('demoFrame');

demoFrame.buildQuestionStack = function() {
  var questionWeights = {
    simpleAddition : 5,
    fractionsMixed : 10,
    multiplyingBinomials : 20,
  }
  var sum = 0, select;
  for (var i in questionWeights) {
    sum = sum + questionWeights[i];
    questionWeights[i] = sum;
  }

  select = waxonUtils.randomInt(1, sum);
  for (var i in questionWeights) {
    if (questionWeights[i] >= select) {
      return [i];
    }
  }
};

demoFrame.drawAreas = function() {
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
//  attributes.visible = 'false';
//  waxon.addArea('debug', attributes);

  delete(attributes.border);
  delete(attributes.background);
  waxon.addArea('infobox', attributes);
  waxon.addToArea('infobox', 'Det här är en tidig version av projektet "waxon", med mål att göra det lätt att sätta samman uppgifter för mängdträning.');
  waxon.addToArea('infobox', 'Tanken är att man ska kunna lägga till nya typer av frågor som egna plugins, och att man ska kunna använda olika lägen för att träna på uppgifterna.');
  waxon.addToArea('infobox', 'I denna tidiga proof-of-concept finns bara tre typer av frågor (enkel addition, bråkräkning, samt utveckling av parentesuttryck).');
  waxon.addToArea('infobox', 'Det läge som används för att träna på frågor på denna sida ger oändligt många frågor, med relativ sannolikhet 5/10/20 för de olika frågetyperna ovan. Om waxon-idén lyfter fungerar kommer det att dyka upp fler typer av frågor, och fler sätt att använda dem (exempelvis diagnoser med färdiga set av frågor, plus sammanställning av resultat för lärare).');
  waxon.addToArea('infobox', app.createLabel('Projektet är open source och går att hitta på https://github.com/Itangalo/waxon'));
  return app;
}

demoFrame.processResponse = function(responseCode, responseMessage) {
  var app = UiApp.getActiveApplication();

  waxon.clearArea('feedbackarea');

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
  return app;
}
