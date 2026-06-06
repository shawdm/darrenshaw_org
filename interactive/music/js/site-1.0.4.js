const MIN_IMAGE_WIDTH = 200;

loadPlaylist();

var HB_TEMPLATE_PLAYLIST = Handlebars.compile(
    `
    {{#each tracks}}
        {{>track}}
    {{/each}}
   `
);

var HB_TEMPLATE_UPDATED_DATE = Handlebars.compile(
    `
    Last Update: {{updatedDate}}
    `
);

Handlebars.registerPartial(
    "track", 
    `
    <a href='{{url}}' title='#{{position}}: {{name}} - {{artist}}'>
        <div class='image-frame artist'>
            <img src='{{image}}' alt='{{name}} album artwork'/>
            <div class='description'>#{{position}} {{name}}</div>
        </div>
    </a>
    `
)

function loadPlaylist(){
    const options = {};
    fetch(RECENT_PLAYLIST_URL, options)
        .then(manageResponse)
        .then(mapToPlaylistData)
        .then(renderPlaylist)
        .catch(error => {
            console.log(`Error fetching url=${RECENT_PLAYLIST_URL}`, error);
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

async function mapToPlaylistData(response){
    const json = await response.json();
    const playlistTracks = json.playlistTracks
        .map(track => {
            return {
                name: track.name,
                artist: track.artists[0].name,
                image: selectImageUrl(track.images),
                url: `https://open.spotify.com/track/${track.id}`,
                addedAt: Date.parse(track.addedAt)
            };
        })
        .sort(playlistTrackComparator)
        .map((track, index) => {
            return {
                name: track.name,
                artist: track.artist,
                image: track.image,
                url: track.url,
                addedAt: track.addedAt,
                position: index+1
            }
        });
    const updatedTimestamp = json.updatedTimestamp;

    return {
        tracks: playlistTracks,
        updatedTimestamp: updatedTimestamp
    };
}

function renderPlaylist(playlist){
    document.getElementById("music-list-playlist").innerHTML = HB_TEMPLATE_PLAYLIST({tracks: playlist.tracks});

    const formattedDate = formatDate(playlist.updatedTimestamp);
    document.getElementById("music-list-playlist-updated").innerHTML = HB_TEMPLATE_UPDATED_DATE({updatedDate: formattedDate});
}

function formatDate(dateString){
    var parsedDate = new Date();
    parsedDate.setTime(Date.parse(dateString));
    return parsedDate.toLocaleDateString("en-GB", {dateStyle:"long"});
}

function selectImageUrl(images){
    var selectedImage = images
        .sort(imageSizeComparator)
        .find(image => image.width >= MIN_IMAGE_WIDTH)
    
    if(selectedImage === undefined){
        selectedImage = images[0];
    }

    return selectedImage.url
}

function playlistTrackComparator(t1, t2){
  return t2.addedAt - t1.addedAt;
}

function imageSizeComparator(i1, i2){
    return i1.width - i2.width;
}

