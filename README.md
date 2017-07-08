# VIEW-Addon

## Welcome

**VIEW** is an
ICALL system designed to provide supplementary language learning activities using
authentic texts selected by the learner. VIEW is a multilingual extension of 
<a href="http://purl.org/icall/werti">Working with English Real Texts (WERTi)</a>,
which has been under development since 2006.

## About VIEW

VIEW is an intelligent computer-assisted language learning (ICALL) 
system designed to provide supplementary language learning
activity resources to language learners. It can be viewed as an intelligent 
automatic workbook, providing an unlimited 
number of activities designed to foster awareness of English grammatical 
forms and functions. Because it is a web-based system, it can be used anywhere
there is a computer with internet access.

The VIEW activities are automatically derived from authentic 
texts, obtained from any web page of interest. The task of retrieving
texts appropriate for learners is handled by a separate 
<a href="http://purl.org/icall/flair">Form-Focused Linguistically Aware Information Retrieval</a> (FLAIR) project.


VIEW uses state-of-the-art Natural Language Processing (NLP)
technology to generate exercises, identifying 
targeted lexical and phrasal material through a combination 
of tokenization, lemmatization, morphological analysis, part-of-speech tagging, 
chunking, and parsing.

The activity types VIEW provides follow a pedagogically motivated
progression from receptive presentation, to productive
presentation, to controlled practice. Specifically, activities 
include the coloring of targeted forms,
having the learner find and click on targeted forms, and finally, 
controlled practice activities such as multiple choice, fill-in-the-blank, 
or editing tasks.  VIEW provides these activity progressions for a 
variety of grammar topics. 

## VIEW History

VIEW is a multilingual extension of the <a href="http://purl.org/icall/werti">WERTi 
system</a> (Working with English Real Texts), which has been under development since 2006.

The <a href="http://purl.org/icall/werti-v1">original WERTi system</a> was designed by 
<a href="http://www.sfs.uni-tuebingen.de/~dm/">Detmar Meurers</a>, 
<a href="http://www.ling.ohio-state.edu/~vmetcalf/">Vanessa Metcalf</a>, 
<a href="http://people.cohums.ohio-state.edu/amaral1/">Luiz Amaral</a>,
Chris Kovach, and <a href="http://www.myspace.com/coryshain">Cory Shain</a>
at Ohio State University.  Work on WERTi continued at the 
<a href="http://www.sfs.uni-tuebingen.de">University of T&uuml;bingen</a>
after Detmar moved there in 2008.  The original Python-based code was ported
to Java and the UIMA framework by <a href="http://github.com/adimit">Aleksandar Dimitrov</a> 
and developed further by <a href="http://www.drni.de/niels/">Niels Ott</a>
and <a href="http://www.sfs.uni-tuebingen.de/~rziai/">Ramon Ziai</a>.  A demo of the 
<a href="http://purl.org/icall/werti-v2">first Java version</a> is available for reference.
In 2010, <a href="http://www.sfs.uni-tuebingen.de/~adriane/">Adriane Boyd</a> developed the
firefox extension, which improves usability and compatibility, in particular for 
web pages with dynamically-generated content and special session handling.


From 2014 to 2016 Eduard Schaf in cooperation with Robert Reynolds introduced and developed 
new topics and activities for the Russian language.


In 2016 Eduard Schaf migrated the old firefox-extension to 
<a href="https://developer.mozilla.org/en-US/Add-ons/WebExtensions">Webextensions</a>. With this change
the VIEW extension can be used in Firefox, Chrome and Opera and is ready for the future direction 
of web extensions.


We are continually working on new topics and activities and are grateful for ideas and contributions in this
area from Magdalena Leshtanska, Emma Li, Iliana Simova, Maria Tchalakova, and Tatiana Vodolazova.


## References


- Detmar Meurers, Ramon Ziai, Luiz Amaral, Adriane Boyd, Aleksandar Dimitrov, Vanessa Metcalf, Niels Ott (2010). <a href="http://www.sfs.uni-tuebingen.de/~dm/papers/meurers-ziai-et-al-10.pdf">Enhancing Authentic Web Pages for Language Learners</a>. Proceedings of the 5th Workshop on Innovative Use of NLP for Building Educational Applications, NAACL-HLT 2010, Los Angeles.
- Aleksandar Dimitrov (2008). <a href="http://github.com/adimit/werti/raw/c4dd20f15e9d6be3aa3f0c21a16745b19a4c9448/docs/paper/paper.pdf">Rebuilding WERTi: Providing a Platform for Second Language Acquisition Assistance.</a> Technical report, Seminar f&uuml;r Sprachwissenschaft, Universit&auml;t T&uuml;bingen.
- Niels Ott and Ramon Ziai (2008). <a href="http://www.drni.de/niels/n3files/read-me/werti-gerunds.pdf">ICALL Activities for Gerunds vs. To-infinitives: A Constraint Grammar-based Extension to the New WERTi System.</a> Term paper for the course <i>Using Natural Language Processing to Foster Language Awareness in Second Language Learning</i>, Universit&auml;t T&uuml;bingen, Summer 2008.
- Vanessa Metcalf and Detmar Meurers (2006). <a href="http://www.ling.ohio-state.edu/icall/handouts/eurocall06-metcalf-meurers.pdf">Generating Web-based English Preposition Exercises from Real-World Texts.</a> EUROCALL 2006. Granada, Spain. September 4&ndash;7, 2006.
- Luiz Amaral, Vanessa Metcalf, Detmar Meurers (2006). <a href="http://www.ling.ohio-state.edu/icall/handouts/calico06-amaral-metcalf-meurers.pdf">Language Awareness through Re-use of NLP Technology.</a> Pre-conference Workshop on NLP in  CALL &ndash; Computational and Linguistic Challenges. CALICO 2006. University of Hawaii. May 17, 2006.

# Project Contents

This projects contains the folders `viewWE` and `viewWE-test` and can both be found in the `src` folder. You will need NPM in a reasonably recent version (~6) to compile the sources, run the test suite, and build the addon.

## Sources

The sources are in `/viewWE`, and are compiled with [webpack](https://webpack.github.io/).
You can use ES2015 syntax, as the sources are transpiled with [babel](http://babeljs.io).
To build the sources, use npm:

```
npm run install # install all dependencies
npm run build
```

You can now point your browser in debugging mode to `/addon` where the compiled files are located.

If you are developing the addon itself, it's best to use the watch task, which recompiles the sources on every write:

```
npm run watch:build
```

You can also start an automatic watch task on the test suite that will run it on every write, so you can make sure your changes don't break existing code.

```
npm run watch:test
```

Please write tests for all new and changed functionality. See also the section on [Tests].
You can run both the watch and the build tasks in parallel, by starting them from different shells.

To bundle the addon for distribution, use the bundle task:

```
npm run bundle
```

## Tests

The unit tests are based
on [Mocha](http://mochajs.org/), [Sinon](http://sinonjs.org/)
and [Chai](http://chaijs.com/).

They are run using [Karma](https://karma-runner.github.io), which also provides
for code coverage, using [Istanbul](https://istanbul.js.org/).

Test modules are compiled with webpack.

WebExtensions are automatically stubbed by the
[sinon-chrome](https://github.com/acvetkov/sinon-chrome) package.

The test files live in the `viewWE-test/test/unit` directory.
To run them once, use

```
npm run test
```

(You will need to have run `npm install` before.)
If you intend on editing the code or tests, it is usually better to use the watch task:

```
npm run watch:test
```

### Coverage

Coverage reports are generated at the end of each test run on a per-file basis.
They are also generated in HTML form in `viewWE-test/coverage`

### Fixtures

We use [karma-fixture](https://github.com/billtrik/karma-fixture)
together with [karma-html2js-preprocessor](https://github.com/karma-runner/karma-html2js-preprocessor)
for html files and [karma-json-fixtures-preprocessor](https://github.com/dmitriiabramov/karma-json-fixtures-preprocessor)
for json files.

JSON fixtures can be loaded like this:

```javascript
it("plays with the json fixture", function(){
  const json = fixture.load("viewWE-test/fixtures/json/fixture.json");
});
```

HTML fixtures:

```javascript
it("plays with the html fixture", function(){
  const html = fixture.load("/viewWE-test/fixtures/ru-nouns-mc-and-cloze.html");
});
```

Fixtures are *not* loaded into the DOM automatically.
*WARNING:* There is a quirk in the fixtures loading process: json fixtures need to have no
initial slash in the path, but HTML fixtures do.

You could also use `require` and a full relative (to the test file itself) path
to load the json or html as a string during compilation.
