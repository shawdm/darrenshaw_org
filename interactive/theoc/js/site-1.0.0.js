const DATA_SCENE_DIALOGUES = "/interactive/theoc/data/scene-dialogues.csv";
const DATA_SCENE_RELATIONSHIPS = "/interactive/theoc/data/scene-relationships.csv";

var HB_TEMPLATE_EPISODES = Handlebars.compile(
   `<ol class='episodes'>
       {{#each episodes}}
         {{>episode}}
       {{/each}}
   </ol>
   `
);


Handlebars.registerPartial(
   "episode", 
   `<li class='episode'>
       <h3>S{{season}}E{{episode}}</h3>
       <ol class='scenes'>
         {{#each scenes}}
            {{>scene}}
         {{/each}}
       </ol>
   </li>`
)

Handlebars.registerPartial(
   "scene", 
   `<li class='scene'>
       <div class='characters'>
       {{#each characters}}
         {{>character}}
       {{/each}}
       </div>
   </li>`
)

Handlebars.registerPartial(
   "character", 
   `<div class='character {{this}}'></div>`
)

function groupBy(list, keyGetter) {
   const map = new Map();
   list.forEach((item) => {
        const key = keyGetter(item);
        const collection = map.get(key);
        if (!collection) {
            map.set(key, [item]);
        } else {
            collection.push(item);
        }
   });
   return map;
}

function init(){
   console.log('init the oc');
   loadCsvData(DATA_SCENE_RELATIONSHIPS)
   .then(renderRelationshipsChart)
}

function loadCsvData(url){
   return new Promise(function(complete, error) {
       Papa.parse(url, {
           download: true,
           header: true,
           skipEmptyLines: true,
           complete, 
           error
       });
     });
}


function renderRelationshipsChart(data){
   let episodes = [];
   groupBy(data.data, value => value.SEASON + "_" + value.EPISODE)
      .forEach((episode, episodeKey) => {
         if(episode && episode.length > 0){
            console.dir(episode);
            scenes = episode.map(anEpisode => {
               return {
                  index: anEpisode.SCENE_INDEX,
                  characters: anEpisode.RELATIONSHIP.split(';').sort()
               }
            });
            // let scenes = episode.map(anEpisode => {
            //    return
            //    {
            //       index: anEpisode.SCENE_INDEX,
            //       characters: anEpisode.RELATIONSHIP.split(';')
            //    }
            // });
            episodes.push({
               season: episode[0].SEASON,
               episode: episode[0].EPISODE,
               scenes: scenes
            })
         }
      });

   console.dir(episodes);   

   let episodesHtml = HB_TEMPLATE_EPISODES({episodes: episodes});
   document.getElementById("vis-theoc-episdoes").innerHTML = episodesHtml; 
}

function episodeToHtml(episode, episodeKey){
 return "<div id='"+episodeKey+"'>"+episodeKey+"</div>";
}



function renderDialogueChart(data){
   console.log('renderDialogueChart')
   console.dir(data);

 
}



init()