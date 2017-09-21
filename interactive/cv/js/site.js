var DISPATCH;
var FACT_LIBRARY = [
  {
    id:0,
    question:'A two mile swim or a six mile run?',
    choice_a:'Swim',
    choice_b:'Run',
    answer_a:'Yes. I run and swim, but always prefer swimming.',
    answer_b:'Almost. I do both, but I\'m a better swimmer than runner',
  },
  {
    id:1,
    question:'Britney or Beyonce?',
    choice_a:'Hit Me One More Time',
    choice_b:'Lemonade',
    answer_a:'Asking me the impossible',
    answer_b:'Trick question',
  },
  {
    id:2,
    question:'Summer Roberts or Marissa Cooper?',
    choice_a:'Ewww',
    choice_b:'Drink',
    answer_a:'Duh. Always Summer Roberts',
    answer_b:'No, Summer Roberts every time',
  }
];


document.addEventListener('DOMContentLoaded', function(e) {
  //initFacts();

  init();

});


function init(){
  DISPATCH = d3.dispatch('pulldown','pullup');

  DISPATCH.on('pulldown', function(){
    var pulldown = d3.select(this.parentNode.parentNode);
    pulldown.transition().duration(400).style('top','40px');
  });

  d3.select('article.pulldown section.handle a').on('click', function(){
    DISPATCH.call('pulldown', this);
  });

  console.log('init');
}


function initFacts(){
  FACT_LIBRARY = shuffle(FACT_LIBRARY);
  var facts = document.getElementsByClassName('fact');
  for(var i=0; i < facts.length; i++){
    facts[i].innerHTML = FACT_LIBRARY[i].question;
  };
}


/*
 * From: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
 */
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
