/**
 * @file: Question type for displaying a message without any actual question.
 */
var q = new waxonQuestion('displayMessageBase');

q.title = 'Instruktioner';
q.shortTitle = 'Instr.';

q.hideAnswerButton = true;
q.hideSkipButton = true;

q.questionElements = function(parameters) {
  return {
    line1 : 'This message should be overridden.  ',
    line2 : 'https://github.com/Itangalo/waxon'
  };
}

q.answerElements = function(parameters) {
  return {};
};

q.helpElements = function(parameters) {
  return {};
}
