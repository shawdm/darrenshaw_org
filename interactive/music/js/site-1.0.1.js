const POPULAR_URL = "data/music-library-api/popular/artist.json";
loadPopular();

var HB_TEMPLATE_ARTISTS = Handlebars.compile(
    `
    {{#each artists}}
        {{>artist}}
    {{/each}}
   `
);

var HB_TEMPLATE_UPDATED_DATE= Handlebars.compile(
    `
    Last Update: {{updatedDate}}
    `
);

Handlebars.registerPartial(
    "artist", 
    `
    <a href='{{url}}' title='#{{position}}: {{name}}'>
        <div class='image-frame artist'>
            <img src='{{image}}'/>
            <div class='description'>{{name}}</div>
        </div>
    </a>
    `
)

function loadPopular(){
    const options = {};
    fetch(POPULAR_URL, options)
        .then(manageResponse)
        .then(mapToArtistData)
        .then(renderPopularArtists)
        .catch(error => {
            console.log(`Error fetching url=${POPULAR_URL}`, error);
        });
}

function manageResponse(response){
    if(!response.ok){
        let responseError = {
            statusText: response.statusText,
            status: response.status
        };
        throw(responseError);
    }
    return response;    
}

async function mapToArtistData(response){
    const json = await response.json()
    
    const popularArtists = json.artists
        .map((spotifyArtist, index) => {return {
            name: spotifyArtist.name,
            image: spotifyArtist.images[0].url,
            url: `https://open.spotify.com/artist/${spotifyArtist.id}`,
            position: index+1
        }});
    const updatedTimestamp = json.updatedTimestamp

    return {
        artists: popularArtists,
        updatedTimestamp: updatedTimestamp
    }
}

function renderPopularArtists(popularArtists){
    const formattedDate = formatDate(popularArtists.updatedTimestamp)
    const updatedDateHtml = HB_TEMPLATE_UPDATED_DATE({updatedDate: formattedDate})
    const popularArtistsHtml = HB_TEMPLATE_ARTISTS({artists: popularArtists.artists});
    document.getElementById("music-list-popular-artists").innerHTML = popularArtistsHtml; 
    document.getElementById("music-list-popular-artists-updated").innerHTML = updatedDateHtml; 
}

function formatDate(dateString){
    var parsedDate = new Date();
    parsedDate.setTime(Date.parse(dateString));
    return parsedDate.toLocaleDateString("en-GB", {dateStyle:"long"});
}