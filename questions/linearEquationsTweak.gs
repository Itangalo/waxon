/**
 * @file: Example of how a question type can build on an existing question plugin.
 */

// The third argument means that this question type inherits methods from 'linearEquations'.
// (The second argument is used to tell if question plugins aren't really questions.)
var linearEquationsTweak = new waxonQuestion('linearEquationsTweak', undefined, linearEquations);

// You probably want to override the question title, so it will be easy to tell your
// tweaked question from its parent.
linearEquationsTweak.title = 'Linjära ekvationer 2';

// This tweak sets some options. In this case, we will always get an equation
// using the variable 's' and one of the sides will be this variable alone.
linearEquationsTweak.generateParameters = function(options) {
  // Make sure to keep the passed options, if there are any.
  options = options || {};
  options.leftExpressionType = 'x';
  options.variable = 's';
  return linearEquations.generateParameters(options);
}
