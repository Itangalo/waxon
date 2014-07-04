waxon
=====

waxon is a Google Apps-based platform for practicing wax-on-wax-off exercises --
that is, questions that could be really boring but you often need to do a lot of
them before you can solve them without effort. (Another term would be 'volume
training'.) For more information about this kind of training, see
https://www.youtube.com/watch?v=3PycZtfns_U

You can try out a demo version of the script here:
* http://tinyurl.com/waxon-test (20 questions in a short test)
* http://tinyurl.com/waxon-practice (endless stream of questions)

waxon is a plugin based system, meaning that it should be possible to extend
waxon by writing small plugins. There are two types of plugins:

* Question plugins: Each question type is provided as a separate plugin. This
  should allow adding more questions easily. See question/simpleAddition.gs for
  a well-commented example, and linearEquationsTweak.gs for an example of how to
  base new question plugins on existing ones.
* Frame plugins: You practice the questions within 'frames', which as also
  provided as plugins. One frame could be 'I want to practice a selected
  exercise type infinitely', while another frame could be 'A test with 4
  exercises from these 10 question types'. Frames determine how questions are
  selected, what response is given to answers, and also the overall display
  of questions. There is no example frame to learn the code from, but you can
  always check out the frames provided in the frames folder (as well as the
  frame object described in waxon.gs).

If you install this script, you will also need the js-expression-eval script
found at https://github.com/silentmatt/js-expression-eval/blob/master/parser.js
to run most of the questions relating to math.

If you want to write plugins, I also highly recommend checking out the helper
methods provided in waxonUtils.gs.
