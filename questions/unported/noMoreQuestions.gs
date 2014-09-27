/**
 * @file: waxon question object to use when there are no more questions.
 */

// Create a new object, inheriting properties from 'waxonQuestion'.
// Note the second argument, which adds this as a non-question (used for
// displaying messages or so).
var noMoreQuestions = new waxonQuestion('noMoreQuestions', true);

noMoreQuestions.questionElements = function() {
  var app = UiApp.getActiveApplication();
  var label = app.createLabel('Inga fler frågor. Du är klar!');
  return {
    label : label,
  }
};

noMoreQuestions.hideButton = true;

noMoreQuestions.answerElements = function() {
  return;
}
