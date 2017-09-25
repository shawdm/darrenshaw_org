var DISPATCH;

var PULLDOWN_ATTENTION_TIMEOUT;
var PULLDOWN_HOME_TOP;
var PULLDOWN_EXTENDED_TOP = -50;

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
  // only show if we've got d3 loaded (so not used in no js)
  d3.select('body.cv article.pulldown').style('display','block');

  //PULLDOWN_HOME_TOP = parseFloat(d3.select('article.pulldown').style('top'),10);
  //console.log(PULLDOWN_HOME_TOP);
  PULLDOWN_HOME_TOP = -522;

  DISPATCH = d3.dispatch('pulldown', 'pullup', 'peakdown', 'peakup', 'peakattention', 'reset', 'image', 'altimage');
  DISPATCH.call('reset');

  DISPATCH.on('pulldown', function(){
    clearTimeout(PULLDOWN_ATTENTION_TIMEOUT);

    //var doNotPush = d3.select('article.pulldown section.content .handle h4');
    //doNotPush.transition().ease(d3.easeQuad).duration(1000).style('opacity',0);

    var pulldown = d3.select('article.pulldown');
    //pulldown.transition().ease(d3.easeBackOut).duration(600).style('top',PULLDOWN_EXTENDED_TOP+'px');

    if(parseFloat(pulldown.style('top'),10) < PULLDOWN_EXTENDED_TOP){
      // needs to go down
      pulldown.transition().ease(d3.easeBackOut).duration(600).style('top',PULLDOWN_EXTENDED_TOP+'px');
    }
    else{
      // needs to go up
      pulldown.transition().ease(d3.easeBackIn).duration(600).style('top', PULLDOWN_HOME_TOP + 'px');
    }

  });

  DISPATCH.on('reset', function(){
    var pulldown = d3.select('article.pulldown');
    pulldown.transition().ease(d3.easeBackIn).duration(600).style('top', PULLDOWN_HOME_TOP + 'px');
  });

  DISPATCH.on('peakattention', function(){
    var pulldown = d3.select('article.pulldown');
    var currentTop = parseFloat(pulldown.style('top'),10);
    var newTop = Math.min(currentTop + 30, PULLDOWN_HOME_TOP+30);
    pulldown.transition().ease(d3.easeBackOut).duration(500).style('top', newTop + 'px').transition().ease(d3.easeBackIn).duration(1000).delay(10000).style('top',currentTop+'px');
  });

  DISPATCH.on('peakdown', function(){
    var pulldown = d3.select('article.pulldown');
    var currentTop = parseFloat(pulldown.style('top'),10);
    var newTop = Math.min(currentTop + 30, PULLDOWN_HOME_TOP+30);
    if(currentTop <= PULLDOWN_HOME_TOP+30){ // stops peakdown when fully extended
      pulldown.transition().ease(d3.easeQuad).duration(500).style('top', newTop + 'px').transition().ease(d3.easeBackIn).duration(1000);
    }
  });

  DISPATCH.on('peakup', function(){
    var pulldown = d3.select('article.pulldown');
    var currentTop = parseFloat(pulldown.style('top'),10);
    if(currentTop <= PULLDOWN_HOME_TOP+30){ // stops peakup when fully extended
      pulldown.transition().ease(d3.easeQuad).duration(500).style('top',PULLDOWN_HOME_TOP+'px');
    }
  });


  DISPATCH.on('altimage', function(){
    d3.select('section.headline img').attr("src", "/images/site/darren_shaw_circle_alt.png");
  });

  DISPATCH.on('image', function(){
    d3.select('section.headline img').attr("src", "/images/site/darren_shaw_circle.png");
  });

  /*
  d3.select('section.headline img').on('mouseover', function(){
    DISPATCH.call('altimage', this);
  });

  d3.select('section.headline img').on('mouseout', function(){
    DISPATCH.call('image', this);
  });
  */

  //d3.select('article.pulldown .handle').on('click', function(){
  //  DISPATCH.call('pulldown', this);
  //});

  d3.select('article.pulldown').on('click', function(){
    DISPATCH.call('pulldown', this);
  });

  d3.select('article.pulldown').on('touchend', function(){
    DISPATCH.call('pulldown', this);
  });


  /*
  d3.select('article.pulldown').on('mouseover', function(){
    DISPATCH.call('peakdown', this);
  });

  d3.select('article.pulldown').on('mouseout', function(){
    DISPATCH.call('peakup', this);
  });
  */

  d3.select('article.main').on('click', function(){
    DISPATCH.call('reset', this);
  });

  /*
  PULLDOWN_ATTENTION_TIMEOUT = setTimeout(function(){
      DISPATCH.call('peakattention', this);
    },
    4000
  );
  */

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
