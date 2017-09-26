var DISPATCH;
var PULLDOWN_HOME_TOP;
var PULLDOWN_EXTENDED_TOP = -54;


window.addEventListener('load', function(e) {
  init();
});


function init(){
  DISPATCH = d3.dispatch('pulldown', 'pullup', 'peakdown', 'peakup', 'reset', 'init', 'image', 'altimage');

  DISPATCH.on('init', function(){
    var pulldown = d3.select('article.pulldown');
    PULLDOWN_HOME_TOP = - parseFloat(pulldown.style('height'),10) - PULLDOWN_EXTENDED_TOP;
    pulldown.style('top', PULLDOWN_HOME_TOP + 'px');
    pulldown.style('visibility', 'visible');
  });

  DISPATCH.on('reset', function(){
    var pulldown = d3.select('article.pulldown');
    pulldown.transition().ease(d3.easeBackIn).duration(600).style('top', PULLDOWN_HOME_TOP + 'px');
  });

  DISPATCH.on('pulldown', function(){
    var pulldown = d3.select('article.pulldown');

    if(parseFloat(pulldown.style('top'),10) < PULLDOWN_EXTENDED_TOP){
      // needs to go down
      pulldown.transition().ease(d3.easeBackOut).duration(600).style('top',PULLDOWN_EXTENDED_TOP+'px');
      d3.select('article.pulldown .handle h4').style('visibility','hidden');
    }
    else{
      // needs to go up
      pulldown.transition().ease(d3.easeBackIn).duration(600).style('top', PULLDOWN_HOME_TOP + 'px');
    }
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

  d3.select('section.headline img').on('mouseover', function(){
    DISPATCH.call('altimage', this);
  });

  d3.select('section.headline img').on('mouseout', function(){
    DISPATCH.call('image', this);
  });

  d3.select('article.pulldown').on('click', function(){
    DISPATCH.call('pulldown', this);
  });

  d3.select('article.pulldown').on('touchend', function(){
    DISPATCH.call('pulldown', this);
  });

  d3.select('article.pulldown').on('mouseover', function(){
    DISPATCH.call('peakdown', this);
  });

  d3.select('article.pulldown').on('mouseout', function(){
    DISPATCH.call('peakup', this);
  });

  d3.select('article.main').on('click', function(){
    DISPATCH.call('reset', this);
  });

  d3.select('article.main').on('touchend', function(){
    DISPATCH.call('reset', this);
  });

  DISPATCH.call('init');
}
