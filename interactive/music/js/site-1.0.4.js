const MIN_IMAGE_WIDTH = 200;

loadAlbums();
loadPlaylist();
loadPopular();

var HB_TEMPLATE_PLAYLIST = Handlebars.compile(
    `
    {{#each tracks}}
        {{>track}}
    {{/each}}
   `
);

var HB_TEMPLATE_ARTISTS = Handlebars.compile(
    `
    {{#each artists}}
        {{>artist}}
    {{/each}}
   `
);

var HB_TEMPLATE_UPDATED_DATE = Handlebars.compile(
    `
    Last Update: {{updatedDate}}
    `
);

var HB_TEMPLATE_CHARACTERS = Handlebars.compile(
    `
    {{#each characters}}
        <a class='alphabet' href='#album-{{.}}'>{{.}}</a>
    {{/each}}
    `
);

Handlebars.registerPartial(
    "track", 
    `
    <a href='{{url}}' title='#{{position}}: {{name}} - {{artist}}'>
        <div class='image-frame artist'>
            <img src='{{image}}'/>
            <div class='description'>#{{position}} {{name}}</div>
        </div>
    </a>
    `
)

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

var HB_TEMPLATE_ALPHABET_ALBUM = Handlebars.compile(
    `
    <div id='album-{{character}}'>
        <h2>{{character}}</h2>
        {{#each albums}}
            {{>album}}
        {{/each}}
    <div>
    `
);

Handlebars.registerPartial(
    "album", 
    `
    <a href='{{url}}'>
        <div class='album'>
            <div class='image-frame'>
                <img src='{{image}}'/>
            </div>
            <div class='description'>
                <h3>{{artist}} - {{name}}</h3>
                <p>{{year}}</p>
            </div>
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
            console.log(`Error fetching url=${POPULAR_URL}`, error);
        });
}

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

function loadAlbums(){
    const options = {};
    fetch(ALBUMS_URL, options)
        .then(manageResponse)
        .then(mapToAlbumData)
        .then(renderAlbums)
        .catch(error => {
            console.log(`Error fetching url=${ALBUMS_URL}`, error);
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
    const popularArtistsHtml = HB_TEMPLATE_PLAYLIST({tracks: playlist.tracks});
    document.getElementById("music-list-playlist").innerHTML = popularArtistsHtml; 

    const formattedDate = formatDate(playlist.updatedTimestamp);
    const updatedDateHtml = HB_TEMPLATE_UPDATED_DATE({updatedDate: formattedDate});
    document.getElementById("music-list-playlist-updated").innerHTML = updatedDateHtml; 
}

async function mapToArtistData(response){
    const json = await response.json();
    const popularArtists = json.artists
        .map((spotifyArtist, index) => {return {
            name: spotifyArtist.name,
            image: selectImageUrl(spotifyArtist.images),
            url: `https://open.spotify.com/artist/${spotifyArtist.id}`,
            position: index+1
        }});
    const updatedTimestamp = json.updatedTimestamp;

    return {
        artists: popularArtists,
        updatedTimestamp: updatedTimestamp
    };
}

function renderPopularArtists(popularArtists){
    const popularArtistsHtml = HB_TEMPLATE_ARTISTS({artists: popularArtists.artists});
    document.getElementById("music-list-popular-artists").innerHTML = popularArtistsHtml; 

    const formattedDate = formatDate(popularArtists.updatedTimestamp);
    const updatedDateHtml = HB_TEMPLATE_UPDATED_DATE({updatedDate: formattedDate});
    document.getElementById("music-list-popular-artists-updated").innerHTML = updatedDateHtml; 
}

async function mapToAlbumData(response){
    const json = await response.json();
    const albumsGroupedAlphabetically = Object.groupBy(json.albums, (album) => album.artists[0].name.substring(0,1).toUpperCase());
    const characters = Object.keys(albumsGroupedAlphabetically).sort();
    const characterAlbums = characters
        .map(character => {return {
            character:character, 
            albums:albumsGroupedAlphabetically[character]
                .map(album => {return {
                    name: album.name,
                    artist: album.artists[0].name,
                    image: selectImageUrl(album.images),
                    url: `https://open.spotify.com/album/${album.id}`,
                    year: album.releaseYear
                }})
                .sort(albumComparator)
        }});
    const updatedTimestamp = json.updatedTimestamp;

    return {
        characters: characters,
        characterAlbums: characterAlbums,
        updatedTimestamp: updatedTimestamp
    };
}

function renderAlbums(albums){
    const charactersHtml = HB_TEMPLATE_CHARACTERS({characters: albums.characters});
    document.getElementById("music-list-albums-characters").innerHTML = charactersHtml;

    const albumsHtml = albums.characterAlbums.map(album => HB_TEMPLATE_ALPHABET_ALBUM(album)).join('');
    document.getElementById("music-list-albums").innerHTML = albumsHtml; 

    const formattedDate = formatDate(albums.updatedTimestamp);
    const updatedDateHtml = HB_TEMPLATE_UPDATED_DATE({updatedDate: formattedDate});
    document.getElementById("music-list-albums-updated").innerHTML = updatedDateHtml;    
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

function albumComparator(a1, a2){
    const a1Artist = a1.artist.toLowerCase();
    const a2Artist = a2.artist.toLowerCase();

    if(a1Artist === a2Artist){
        if(a1.year === a2.year){
            return 0;
        }
        else if (a1.year > a2.year) {
            return 1;
        }
        else{
            return -1;
        }
    }
    else{
        if(a1Artist > a2Artist){
            return 1;
        }
        else{
            return -1;
        }
    }
}

function playlistTrackComparator(t1, t2){
  return t2.addedAt - t1.addedAt;
}

function imageSizeComparator(i1, i2){
    return i1.width - i2.width;
  }

function showAlbums(){
    document.getElementById("article-albums").classList.remove("hidden");
    document.getElementById("article-playlist").classList.add("hidden");
    document.getElementById("article-popular").classList.add("hidden");
    
    document.getElementById("music-nav-albums").classList.add("selected")
    document.getElementById("music-nav-playlist").classList.remove("selected")
    document.getElementById("music-nav-popular").classList.remove("selected")

    return false
}

function showPlaylists(){
    document.getElementById("article-albums").classList.add("hidden");
    document.getElementById("article-playlist").classList.remove("hidden");
    document.getElementById("article-popular").classList.add("hidden");
    
    document.getElementById("music-nav-albums").classList.remove("selected")
    document.getElementById("music-nav-playlist").classList.add("selected")
    document.getElementById("music-nav-popular").classList.remove("selected")

    return false;
}

function showPopular(){
    document.getElementById("article-albums").classList.add("hidden");
    document.getElementById("article-playlist").classList.add("hidden");
    document.getElementById("article-popular").classList.remove("hidden");
    
    document.getElementById("music-nav-albums").classList.remove("selected")
    document.getElementById("music-nav-playlist").classList.remove("selected")
    document.getElementById("music-nav-popular").classList.add("selected")

    return false;
}
