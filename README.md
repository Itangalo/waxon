waxon
=====

waxon is a Google Apps-based platform for practicing wax-on-wax-off exercises --
that is, questions that could be really boring but you often need to do a lot of
them before you can handle them without effort. (Another term would be 'volume
training'.) For more information about this kind of training, see
https://www.youtube.com/watch?v=3PycZtfns_U

You can try out a demo version of the script here:
* http://korta.nu/waxon2 (demo of latest development version)
* http://korta.nu/waxon-2rep (stable version used in my maths class)

waxon is a plugin based system, meaning that it should be possible to extend
waxon by writing small plugins. There are two types of plugins:

* Question plugins: Each question type is provided as a separate plugin. (There
  is an example question plugin on its way, but it has not yet been ported from
  waxon 1.x. Sorry.) waxon supports automated tests for question plugins.
* Frame plugins: You practice the questions within 'frames', which as also
  provided as plugins. One frame could be 'I want to practice a selected
  exercise type infinitely', while another frame could be 'A test with 4
  exercises from these 10 question types'. Frames determine how questions are
  selected, how question responses are processed, and also the overall display
  of questions. There is no example frame to learn the code from, but you can
  always check out the frame provided in the frames folder (as well as the frame
  object described in waxon.gs).

waxon is itself a plugin for the gash framework, providing better modularity and
also a basic way of doing automated tests. See https://github.com/Itangalo/gash
for more information about the gash framework.
