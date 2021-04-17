let BACKGROUND_COLOUR = "#222";
let FOREGROUND_COLOUR = "#fff";

let WIDTH_HEIGHT_RATIO = 1.75
let MENU_BAR_HEIGHT = 30;
let CLUSTER_HEIGHT = 0;
let VARIANT_HEIGHT = 3;
let VARIANT_BORDER = 1;

let canvas;
let clusterData;
let brand;
let productPageUriTemplate;
let clusters = [];
let menu;
let preview;

let previousSelectedDesignerId = false;
let firstDraw = true;

let canvasId = getScriptAttribute('data-canvas-id');
let dataPath = getScriptAttribute('data-data-path');
let preselectedDesignerId = getScriptAttribute('data-designer-id');
let preselectedTitle = getScriptAttribute('data-title');

function getScriptAttribute(attributeName){
    let value = document.currentScript.getAttribute(attributeName);
    if(typeof value === 'undefined'){
        return value;
    }
    else{
        return value;
    }
}

function preload() {
    clusterData = loadJSON(dataPath);
}

function mouseClicked(event) {
    let variantClicked = findMouseOver();
    if(variantClicked){
        window.open(productPageUriTemplate + "/" + variantClicked.id, 'fashion-colour-product');
    }
}

function windowResized() {
    let displaySize = getDisplaySize();
    resizeCanvas(displaySize.width, displaySize.height);
    initMenu();
    initShapes();
    firstDraw = true;
}

function getDisplaySize(){
    let parentElement = document.querySelector('#'+canvasId);
    let size = {};
    size.width = parentElement.clientWidth;
    size.height = size.width / WIDTH_HEIGHT_RATIO;
    return size;
}
  
function setup() {
    let displaySize = getDisplaySize();
    canvas = createCanvas(displaySize.width, displaySize.height);
    canvas.parent(canvasId);
    parseData();   
    initMenu();
    initShapes();
}

function parseData(){
    brand = clusterData.brand;
    productPageUriTemplate = clusterData.productPageUriTemplate;

    for(let i=0; i < clusterData.clusters.length; i++){
        let jsonCluster = clusterData.clusters[i];
        let variants = [];
        for(let j=0; j < jsonCluster.variants.length; j++){
            let jsonVariant = jsonCluster.variants[j];
            let variant = new Variant(jsonVariant.id, jsonVariant.colour, jsonVariant.category, jsonVariant.designerId, jsonVariant.designer);
            variants.push(variant);    
        }
        let cluster = new Cluster(jsonCluster.id, jsonCluster.colour, variants);
        clusters.push(cluster);
    }
}

function draw(){
    let selectedDesignerId = false;
    let variantMouseOver = findMouseOver();
    if(preselectedDesignerId){
        selectedDesignerId = preselectedDesignerId;
        menu.title = preselectedTitle;
    }
    else if(variantMouseOver){
        selectedDesignerId = variantMouseOver.designerId;
        menu.title = variantMouseOver.designer;
        cursor(HAND);
    }
    else{
        menu.title = brand;
        cursor(ARROW);
    }

    if(firstDraw || selectedDesignerId != previousSelectedDesignerId){
        clear();

        menu.draw();
        for(let i=0; i < clusters.length; i++){
            let variants = clusters[i].variants;
            for(let j=0; j < variants.length; j++){
                if(selectedDesignerId && variants[j].designerId != selectedDesignerId){
                    variants[j].fade = true;
                }
                else {
                    variants[j].fade = false;
                }
                variants[j].draw();
            }
        }

        previousSelectedDesignerId = selectedDesignerId;
        firstDraw = false;
    }
}

function findMouseOver(){
    for(let i=0; i < clusters.length; i++){
        if(mouseX > clusters[i].x && mouseX <= clusters[i].x + clusters[i].width){
            for(let j=0; j < clusters[i].variants.length; j++){
                if(
                    mouseY > clusters[i].variants[j].y 
                    && mouseY <= clusters[i].variants[j].y + clusters[i].variants[j].height
                    && mouseX > clusters[i].variants[j].x
                    && mouseX <= clusters[i].variants[j].x + clusters[i].variants[j].width
                ){
                    return clusters[i].variants[j];
                }
            }
        }
    }
    return false;
}

function initMenu(){
    menu = new Menu(0, 0, width, MENU_BAR_HEIGHT, brand);
}


function initShapes(){
    let maxVerticalShapes = Math.floor((height-MENU_BAR_HEIGHT)/(VARIANT_HEIGHT))

    let totalColumns = 0;
    for(let i=0; i < clusters.length; i++){
        let clusterColumns = Math.ceil(clusters[i].variants.length/maxVerticalShapes);
        totalColumns = totalColumns + clusterColumns;
    }

    let columnWidth = width/totalColumns;  
    let columnsDrawn = 0;

    for(let i=0; i < clusters.length; i++){
        let clusterColumns = Math.ceil(clusters[i].variants.length/maxVerticalShapes);
        let xPos = columnsDrawn * columnWidth;
        let yPos = MENU_BAR_HEIGHT + ((height - MENU_BAR_HEIGHT)/2) ;
        clusters[i].x = xPos;
        clusters[i].y = yPos;
        clusters[i].width = columnWidth * clusterColumns;

        let variants = clusters[i].variants;
        let variantsColumn = 0;
        let variantsRow = 0;
        for(let j=0; j < variants.length; j++){
            let variantXPos = xPos + (variantsColumn*columnWidth);
            let variantYPos;
            if(j % 2 === 0){
                variantYPos = yPos - ((variantsRow + 1) * VARIANT_HEIGHT)
            }
            else{
                variantYPos = yPos + CLUSTER_HEIGHT + (variantsRow * VARIANT_HEIGHT)
                variantsColumn++;
            }

            variants[j].width = columnWidth;
            variants[j].height = VARIANT_HEIGHT;
            variants[j].x = variantXPos
            variants[j].y = variantYPos;     

            if(variantsColumn == clusterColumns){
                variantsColumn = 0;
                variantsRow++;
            }
        }
        columnsDrawn = columnsDrawn + clusterColumns;
    }
}

class Menu{
    constructor(x, y, width, height, title){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.title = title;
        this.margin = 5;
    }

    draw(){
        noStroke();
        fill(BACKGROUND_COLOUR);
        rect(this.x, this.y, this.width, this.height);    
        fill(FOREGROUND_COLOUR);
        textSize(12);
        textAlign(LEFT, CENTER);
        text(this.title, this.x + this.margin, this.y, this.width - this.margin, this.height)
    }
}

class Cluster {
    constructor(id, colour, variants, x=0, y=0, width=0, height=0){
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.colour = colour;
        this.variants = variants;
    }
}

class Variant {
    constructor(id, colour, category, designerId, designer, x=0, y=0, width=0, height=0){
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.colour = colour;
        this.category = category;
        this.designer = designer;
        this.designerId = designerId;

        this.fade = false;
    }

    draw(){
        stroke(BACKGROUND_COLOUR);
        strokeWeight(VARIANT_BORDER);

        let displayColour = color(this.colour);
        if(this.fade){
            displayColour.setAlpha(70);    
        }
        else{
            
        }
    
        fill(displayColour);
        rect(this.x, this.y, this.width, this.height);
    }
}