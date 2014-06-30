/**
 * @file: Question type for reading questions and answers from a Google spreadsheet.
 */
var googleSheet = new waxonQuestion('googleSheet');

// You can find the ID of the spreadsheet in the URL for the sheet.
googleSheet.sheetID = '1X0K5jYhvAFPeUH8yS-WGEZBUL0-h-nBiApK0ogRVsog';

// Some settings you can use to customize how the spreadsheet should be used.
googleSheet.allowLaTeX = true; // Allows LaTeX expressions within dollar signs, like $x^2$.
googleSheet.questionColumn = 1;
googleSheet.answerColumn = 2;
googleSheet.caseSensitive = false;

googleSheet.getWorkbook = function() {
  return SpreadsheetApp.openById(this.sheetID);
}

googleSheet.getSheet = function() {
  return this.getWorkbook().getActiveSheet();
}

googleSheet.title = googleSheet.getWorkbook().getName();

googleSheet.generateParameters = function(options) {
  options = options || {};
  var row = options.row || waxonUtils.randomInt(2, this.getSheet().getLastRow());

  return {
    row : row,
    raw : this.getSheet().getRange(row, this.questionColumn).getValue(),
  };
};

googleSheet.questionElements = function(parameters) {
  var app = UiApp.getActiveApplication();
  if (this.allowLaTeX == true) {
    var label = app.createHorizontalPanel();
    var pieces = parameters.raw.split('$');
    var LaTeX = false;
    for (var i in pieces) {
      if (LaTeX == false) {
        if (pieces[i] != '') {
          label.add(app.createLabel(pieces[i]).setStyleAttributes(waxon.frames[waxon.resolveFrame()].attributes));
        }
        LaTeX = true;
      }
      else {
        if (pieces[i] != '') {
          label.add(waxonUtils.latex2image(pieces[i]));
        }
        LaTeX = false;
      }
    }
  }
  else {
    var label = app.createLabel(googleSheet.getSheet().getRange(parameters.row, googleSheet.questionColumn).getValue());
  }
  return {
    label : label,
  }
};

googleSheet.questionToString = function(parameters) {
  return parameters.raw;
}

googleSheet.evaluateAnswer = function(parameters, input) {
  var correctAnswer = googleSheet.getSheet().getRange(parameters.row, googleSheet.answerColumn).getValue().toString();
  if (googleSheet.caseSensitive == false) {
    correctAnswer = correctAnswer.toUpperCase();
    input.answer = input.answer.toUpperCase();
  }
  if (input.answer == correctAnswer) {
    return 1;
  }
  else {
    return -1;
  }
};
