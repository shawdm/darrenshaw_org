var DISPATCH;

var PULLDOWN_ATTENTION_TIMEOUT;
var PULLDOWN_HOME_TOP;
var PULLDOWN_EXTENDED_TOP = -40;

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
  init();
});


function init(){
  PULLDOWN_HOME_TOP = parseFloat(d3.select('article.pulldown').style('top'),10);

  DISPATCH = d3.dispatch('pulldown','pullup');

  DISPATCH.on('pulldown', function(){
    clearTimeout(PULLDOWN_ATTENTION_TIMEOUT);

    var pulldown = d3.select(this.parentNode.parentNode);
    if(parseFloat(pulldown.style('top'),10) < PULLDOWN_EXTENDED_TOP){
      // needs to go down
      pulldown.transition().ease(d3.easeBackOut).duration(600).style('top',PULLDOWN_EXTENDED_TOP+'px');
    }
    else{
      // needs to go up
      pulldown.transition().ease(d3.easeBackIn).duration(600).style('top', PULLDOWN_HOME_TOP + 'px');
    }
  });

  d3.select('article.pulldown section.handle a').on('click', function(){
    DISPATCH.call('pulldown', this);
  });

  d3.select('article.pulldown section.handle a').on('hover', function(){
    console.log('hover!');
  });



  PULLDOWN_ATTENTION_TIMEOUT = setTimeout(function(){
      var pulldown = d3.select('article.pulldown');
      var currentTop = parseFloat(pulldown.style('top'),10);
      var newTop = currentTop + 30;
      pulldown.transition().ease(d3.easeBounceOut).duration(500).style('top', newTop + 'px').transition().ease(d3.easeBackIn).duration(1000).delay(4000).style('top',currentTop+'px');
    },
    4000
  );

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
