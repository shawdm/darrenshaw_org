
const COLS = 10;
const ROWS = 10;
const MAX_ARTISTS = COLS*ROWS;

const squares = [];

let popularArtistData;
let square_width;
let selectedGenres = [];

class Square {
    constructor(xPos, yPos, size, album) {
        this.album = album;
        this.offset = size/30;

        this.xPos = xPos + this.offset;
        this.yPos = yPos + this.offset;
        this.size = size - (2* this.offset);
        this.alpha = 255;

        this.image = this.selectImage(album, this.size);
        this.processedImage = null;

        loadImage(this.image.url, img => {
            img.resize(this.size, this.size);
            img.filter(GRAY);
            this.processedImage = img;
        });
    }

    selectImage(album, requiredWidth){
        let sortedImages = album.images.sort(function(a,b){return a.width-b.width})
        for(let i=0; i < sortedImages.length; i++){
            if(sortedImages[i].width >= requiredWidth){
                return sortedImages[i];
            }
        }
        return sortedImages[sortedImages.length-1];
    }

    draw(){
        if(this.processedImage != null){
            image(this.processedImage, this.xPos, this.yPos);
        }

        let textBoxHeight = 12;
        fill(0,0,0,200);
        noStroke();
        rect(this.xPos, this.yPos + this.size - textBoxHeight, this.size, textBoxHeight);
        fill(255,255,255);
        textSize(textBoxHeight-2);
        textAlign(LEFT, CENTER);
        text(this.album.name,this.xPos, this.yPos+this.size - (textBoxHeight/2));

       
    }

    drawConstant(){
        noStroke();
        fill(255,255,255, this.alpha)
        rect(this.xPos, this.yPos, this.size, this.size);
    }

}

function preload(){
    popularArtistData = loadJSON('/data/music-library-api/popular/artist.json');
}

function setup(){
    const containerWidth = document.getElementById('popular').offsetWidth;
    square_width = containerWidth / COLS;
    const containerHeight = ROWS * square_width;

    let canvas = createCanvas(containerWidth,containerHeight);
    canvas.parent("popular");
    drawGrid();
    calculateGenres();  
}

function setSelectedGenres(genres){
    selectedGenres = genres
}

function drawGrid(){
    const artists = popularArtistData.artists
        .slice(0,MAX_ARTISTS);

    let row=0;
    let col=0;

    for(let i=0; i < artists.length; i++){
        let square = new Square(col*square_width, row*square_width, square_width, artists[i], setSelectedGenres)
        squares.push(square);
        col++;
        if(col >= COLS){
            col = 0;
            row++;
        }
    }
}

function calculateGenres(){
    const artists = popularArtistData.artists
        .slice(0,MAX_ARTISTS);

    const genres = artists.flatMap((artist)=>artist.genres)

    const counts = genres.reduce((p, genre) => {
        if (!p.hasOwnProperty(genre)) {
          p[genre] = 0;
        }
        p[genre]++;
        return p;
      }, {});
    console.dir(counts);
}

function draw(){
    background(0,0,0);
    for(let i=0; i < squares.length; i++){
        squares[i].draw(selectedGenres);
    }
}