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
        .then(mapToArtists)
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
    // else{
    //     const headers = response.headers;
    //     console.dir(headers);
    //     return response.json();
    // }
    
}

async function mapToArtists(response){
    const json = await response.json()
    const headers = response.headers;
    var lastModified;

    if(headers && headers.entries()){
        lastModified = headers
            .entries()
            .find((key, _value) => key == 'Last-Modified');
    }

    if(!lastModified){
        lastModified = "Sun, 25 Aug 2024 23:00:52 GMT";
    }

    const popularArtists = json.artists.map((spotifyArtist, index) => {return {
        name: spotifyArtist.name,
        image: spotifyArtist.images[0].url,
        url: `https://open.spotify.com/artist/${spotifyArtist.id}`,
        position: index+1
    }});

    return {
        artists: popularArtists,
        lastModified: lastModified
    }
}

function renderPopularArtists(popularArtists){
    var parsedDate = new Date();
    parsedDate.setTime(Date.parse(popularArtists.lastModified));
    const formattedDate = parsedDate.toLocaleDateString("en-GB", {dateStyle:"long"});

    let updatedDateHtml = HB_TEMPLATE_UPDATED_DATE({updatedDate: formattedDate})
    let popularArtistsHtml = HB_TEMPLATE_ARTISTS({artists: popularArtists.artists});


    document.getElementById("music-list-popular-artists").innerHTML = popularArtistsHtml; 
    document.getElementById("music-list-popular-artists-updated").innerHTML = updatedDateHtml; 
}