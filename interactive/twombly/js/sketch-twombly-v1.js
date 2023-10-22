// https://library.superhi.com/posts/how-to-paint-with-code-creating-paintbrushes
// https://forum.processing.org/one/topic/how-to-find-points-on-a-curve-and-display-them.html
// https://pomax.github.io/bezierinfo/

let DRAWN_LAYERS_COUNT = 0;
let BACKGROUND_LAYERS_COUNT = 0;
let SCALLED_LINE_HEIGHT = 0

let SETTINGS = {
    BORDER: 20,
    BACKGROUND_COLOUR_RGB: '80,80,85',
    BACKGROUND_BRUSH_COLOUR_RGB: '150,150,155',
    BACKGROUND_BRUSH_INITIAL_VERTICES: 6,
    BACKGROUND_COMPLEXITY: 5,
    BACKGROUND_DETAIL: 180,
    BACKGROUND_FRAME_ITERATIONS: 10,
    PEN_COLOUR_RGB: '186,190,190',
    LAYERS_COUNT: 1,
    LINE_COUNT: 5,
    LINE_ALPHA_FACTOR: 0.3,
    LINE_HEIGHT_SCALE: 1,
    CHAR_ASPECT_RATIO: 1,
    CHAR_FIRST_X_OFFSET_JITTER_PERCENT: 0,
    CHAR_X_OVERLAP_CHAR_PERCENT: 0,
    CHAR_Y_OVERLAP_CANVAS_PERCENT: 0,
    CHAR_X_OFFSET_JITTER_PERCENT: 0,
    CHAR_Y_OFFSET_JITTER_PERCENT: 0,
    CHAR_X_JITTER_PERCENT: 0,
    CHAR_Y_JITTER_PERCENT: 0,
    CHAR_WIDTH_JITTER_PERCENT: 0,
    CHAR_HEIGHT_JITTER_PERCENT: 0,
    BEZIER_POINT_FACTOR: 4,
    BRUSH_ENABLED: false,
    BRUSH_WEIGHT: 1,
    BRUSH_LENGTH: 1,
    BRUSH_ANGLE: 140
}

class WatercolourBrush{
    constructor(xPos, yPos, radius, initialVerticesCount = 10) {
        this.xPos = xPos;
        this.yPos = yPos;
        this.radius = radius;
        this.initialVerticesCount = initialVerticesCount;
        this.vertices = this.createStartingVertices();
    }

    createStartingVertices(){
        angleMode(DEGREES);
        let angle = 360 / this.initialVerticesCount;
        let vertices = [];
        for(let i=0; i < this.initialVerticesCount; i++){
            let x = this.xPos + sin(angle*i) * this.radius;
            let y = this.yPos + cos(angle*i) * this.radius;
            vertices.push({x: x, y: y})
        }
        return vertices;
    }

    iterate(){
        let newVertices = [];

        for(let i=0; i < this.vertices.length; i++){
            let fromVertex = this.vertices[i];
            let toVertex;
            if(i+1 == this.vertices.length){
                toVertex = this.vertices[0];
            }
            else{
                toVertex = this.vertices[i+1];
            }

            let xDist = toVertex.x - fromVertex.x;
            let yDist = toVertex.y - fromVertex.y
            let midPointX = fromVertex.x + xDist/2;
            let midPointY = fromVertex.y + yDist/2;

            let maxDistance = Math.sqrt(Math.pow(xDist,2) + Math.pow(yDist,2))/2;

            let newPointX = midPointX + random(-maxDistance,maxDistance);
            let newPointY = midPointY + random(-maxDistance,maxDistance);
            let newPoint = {x:newPointX,y:newPointY};

            newVertices.push(fromVertex);
            newVertices.push(newPoint);
            newVertices.push(toVertex);
        
        }

        this.vertices = newVertices;
    }

    draw(){
        noStroke();
        fill(calcRgbColour(SETTINGS.BACKGROUND_BRUSH_COLOUR_RGB,0.04));
        beginShape()
        for(let i=0; i < this.vertices.length; i++){
            vertex(this.vertices[i].x,this.vertices[i].y);
        }
        endShape(CLOSE);
    }
}

class Line {
    constructor(startX, startY, endX, endY, colour, useBrush = false) {
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
        this.colour = colour;
        this.useBrush = useBrush;
        this.bezierDescriptions = this.createBezierDescriptions();
    }

    createBezierDescriptions(){
        let curves = [];
    
        let stepWidth = (this.endY - this.startY) * SETTINGS.CHAR_ASPECT_RATIO;
        let xPos = this.jitterCharacterStartXPos(stepWidth);
        let xStepOverlap = stepWidth * SETTINGS.CHAR_X_OVERLAP_CHAR_PERCENT
        
        while(curves.length == 0 || curves[curves.length-1].startAnchorPointX < (this.endX-stepWidth)){
            
            let lastVertexX = curves.length >0 ? curves[curves.length-1].endAnchorPointX : false;
            let lastVertexY = curves.length >0 ? curves[curves.length-1].endAnchorPointY : false;

            let jitteredWidth = this.jitterCharacterWidth(stepWidth);
            let jitteredHeight = this.jitterCharacterHeight(this.endY - this.startY);

            let jitteredXpos = this.jitterCharacterXPos(xPos, jitteredWidth);
            let jitteredYPos = this.jitterCharacterYPos(this.startY, jitteredHeight);

            let character = new CharacterE(jitteredXpos, jitteredYPos, jitteredXpos + jitteredWidth, jitteredYPos + jitteredHeight, lastVertexX, lastVertexY);
            
            let newCurves = character.getBezierDescriptions();
            curves = curves.concat(newCurves)
            xPos = xPos + (stepWidth - xStepOverlap);           
        }
        return curves;
    }

    toBrushPoints(curves){
        let points = [];
        for(let i=0; i < curves.length; i++){
            points = points.concat(curves[i].toBrushPoints());
        }
        return points;
    }

    draw(){       
        for(let i=0; i < this.bezierDescriptions.length; i++){
            let bezierDescription = this.bezierDescriptions[i];
            if(this.useBrush){
                this.drawCurveBrushPoints(bezierDescription);
            }
            else{
                this.drawCurve(bezierDescription);
            }    
        }
        
    }

    drawCurve(bezierDescription){
        bezierDescription.draw(this.colour);
    }

    drawCurveBrushPoints(bezierDescription){
        let vertices = bezierDescription.toBrushPoints();
        for(let i=0; i < vertices.length; i++){
            brushFountainPen(vertices[i].x, vertices[i].y, this.colour);
        }
    }

    jitterCharacterWidth(width){
        return random(width, width + (width * SETTINGS.CHAR_WIDTH_JITTER_PERCENT));
    }

    jitterCharacterHeight(height){
        return random(height, height +(height * SETTINGS.CHAR_HEIGHT_JITTER_PERCENT));
    }

    jitterCharacterXPos(xPos, width){
        return random(xPos, xPos + (width * SETTINGS.CHAR_X_OFFSET_JITTER_PERCENT));
    }

    jitterCharacterYPos(yPos, height){
        return random(yPos, yPos + (height * SETTINGS.CHAR_Y_OFFSET_JITTER_PERCENT));
    }

    jitterCharacterStartXPos(width){
        return random(0, SETTINGS.CHAR_FIRST_X_OFFSET_JITTER_PERCENT * width * -1);
    }
}

class CharacterE{
    constructor(startX, startY, endX, endY, precedingX = false, precedingY = false ) {
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
        this.precedingX = precedingX;
        this.precedingY = precedingY;
    }

    calcPointIncrement(startX, startY, endX, endY){
        let pointDistance = Math.sqrt(Math.pow(endX-startX,2) + Math.pow(endY-startY,2));
        return 1/(Math.ceil(pointDistance)*SETTINGS.BEZIER_POINT_FACTOR);
    }

    getBezierDescriptions(){
        let bezierDescriptions = [];

        let widthC = this.endX - this.startX;
        let heightC = this.endY - this.startY;

        let p0xPos = this.startX + this.xJitter(widthC);
        let p0yPos = this.endY + this.yJitter(heightC);

        let p1xPos = this.endX + this.xJitter(widthC);
        let p1yPos = (this.startY + heightC * 0.25) + this.yJitter(heightC);

        let p2xPos = (this.startX + widthC * 0.75) + this.xJitter(widthC);
        let p2yPos = this.startY + this.yJitter(heightC);

        let p3xPos = this.startX + (widthC * 0.5) + this.xJitter(widthC);
        let p3yPos = this.startY + (heightC * 0.5) + this.yJitter(heightC);

        // if there's a preceding point to connect to
        if(this.precedingX && this.precedingY){
            bezierDescriptions.push(
                new BezierDescription(
                    this.precedingX,
                    this.precedingY,
                    this.precedingX,
                    p0yPos,
                    (p0xPos - this.precedingX) * 0.5 + this.precedingX,
                    p0yPos,
                    p0xPos,
                    p0yPos
                )
            );
        }

        bezierDescriptions.push(
            new BezierDescription(
                p0xPos,
                p0yPos,
                (p1xPos - p0xPos) * 0.5 + p0xPos,
                p0yPos,
                p1xPos,
                (p0yPos - p1yPos)* 0.5 + p1yPos,
                p1xPos,
                p1yPos
            )
        );

        bezierDescriptions.push(
            new BezierDescription(
                p1xPos,
                p1yPos,
                p1xPos,
                (p1yPos - p2yPos)* 0.5 + p2yPos,
                (p1xPos - p2xPos)* 0.5 + p2xPos,
                p2yPos,
                p2xPos,
                p2yPos
            )
        );

        bezierDescriptions.push(
            new BezierDescription(
                p2xPos,
                p2yPos,
                (p2xPos - p3xPos) * 0.5 + p3xPos,
                p2yPos,
                p3xPos,
                (p3yPos - p2yPos) * 0.5 + p2yPos,
                p3xPos,
                p3yPos
            )
        );

        return bezierDescriptions;
    }

    xJitter(width){
        return random(-width * SETTINGS.CHAR_X_JITTER_PERCENT, width * SETTINGS.CHAR_X_JITTER_PERCENT);
    }

    yJitter(height){
        return random(-height * SETTINGS.CHAR_Y_JITTER_PERCENT, height * SETTINGS.CHAR_Y_JITTER_PERCENT);
    }
}

class BezierDescription{
    constructor(
        startAnchorPointX, 
        startAnchorPointY,
        startControlPointX,
        startControlPointY,
        endControlPointX,
        endControlPointY,
        endAnchorPointX,
        endAnchorPointY) {
      
        this.startAnchorPointX = startAnchorPointX;
        this.startAnchorPointY = startAnchorPointY;
        this.startControlPointX = startControlPointX;
        this.startControlPointY = startControlPointY;
        this.endControlPointX = endControlPointX;
        this.endControlPointY = endControlPointY;
        this.endAnchorPointX = endAnchorPointX;
        this.endAnchorPointY = endAnchorPointY
    }

    draw(colour){
        noFill();
        stroke(colour)
        bezier(
            this.startAnchorPointX, 
            this.startAnchorPointY,
            this.startControlPointX,
            this.startControlPointY,
            this.endControlPointX,
            this.endControlPointY,
            this.endAnchorPointX,
            this.endAnchorPointY
        );
    }

    toBrushPoints(){
        let brushPoints = [];
        const tIncrement = this.calcPointIncrement(this.startAnchorPointX, this.startAnchorPointY, this.endAnchorPointX, this.endAnchorPointY);
        for(let t = 0; t <= 1; t = t + tIncrement){
            let xPos = bezierPoint(
                this.startAnchorPointX, 
                this.startControlPointX,
                this.endControlPointX,
                this.endAnchorPointX,
                t
            )

            let yPos = bezierPoint(
                this.startAnchorPointY,
                this.startControlPointY, 
                this.endControlPointY,
                this.endAnchorPointY,
                t
            )
            brushPoints.push({x:xPos, y:yPos})
        }

        return brushPoints;
    }

    calcPointIncrement(startX, startY, endX, endY){
        let pointDistance = Math.sqrt(Math.pow(endX-startX,2) + Math.pow(endY-startY,2));
        return 1/(Math.ceil(pointDistance)*SETTINGS.BEZIER_POINT_FACTOR);
    }

}

function brushFountainPen(xPos, yPos, colour){
    stroke(colour);
    strokeWeight(SETTINGS.BRUSH_WEIGHT);
    angleMode(DEGREES);

    xEnd = xPos + (cos(SETTINGS.BRUSH_ANGLE) * SETTINGS.BRUSH_LENGTH);
    yEnd = yPos + (sin(SETTINGS.BRUSH_ANGLE) * SETTINGS.BRUSH_LENGTH);
    line(xPos, yPos, xEnd, yEnd);
}

function printSettings(){
    console.dir(SETTINGS);
}

function calcScalledHeight(){
    let sum = 0;
    for(let i=0; i < SETTINGS.LINE_COUNT; i++){
        sum = sum + Math.pow(SETTINGS.LINE_HEIGHT_SCALE,i);
    }
    let heightWithBorders = height - (3*SETTINGS.BORDER);
    let availableHeight = heightWithBorders - ((SETTINGS.LINE_COUNT - 1) * (SETTINGS.CHAR_Y_OVERLAP_CANVAS_PERCENT * heightWithBorders));
    return availableHeight / sum;
}

function calcLineColour(zIndex, maxZindex, line){
    let distanceToMiddle = Math.abs(line - Math.ceil(SETTINGS.LINE_COUNT/2));
    let zIndexMultiplier = Math.pow(zIndex/maxZindex,2);

    
    let alpha = (1 - distanceToMiddle*SETTINGS.LINE_ALPHA_FACTOR) * random(0.9,1) * zIndexMultiplier;
    return calcRgbColour(SETTINGS.PEN_COLOUR_RGB,alpha);
}

function calcRgbColour(rgbString, alpha){
    return 'rgba('+rgbString+','+alpha+')';
}

function drawBackroundLayer(){
    for(let j=0; j < SETTINGS.BACKGROUND_FRAME_ITERATIONS; j++){
        let startX = random(0,width);
        let startY = random(0,height);
        let brush = new WatercolourBrush(startX, startY, height/3, SETTINGS.BACKGROUND_BRUSH_INITIAL_VERTICES);
        for(let i=0; i < SETTINGS.BACKGROUND_COMPLEXITY; i++){
            brush.iterate();
        }
        brush.draw();
    }   
}

function drawForegroundLayer(){
    let startY = SETTINGS.BORDER;
    let zIndex = DRAWN_LAYERS_COUNT+1;
    let maxZIndex = SETTINGS.LAYERS_COUNT;

    for(let i=0; i < SETTINGS.LINE_COUNT; i++){
        let startX = SETTINGS.BORDER;
        let endX = width - SETTINGS.BORDER;
        let endY = startY + Math.pow(SETTINGS.LINE_HEIGHT_SCALE,i) * SCALLED_LINE_HEIGHT;
        let colour = calcLineColour(zIndex, maxZIndex, i+1);
        let line = new Line(startX, startY, endX, endY, colour, SETTINGS.BRUSH_ENABLED);
        line.draw();
        startY = endY + SETTINGS.CHAR_Y_OVERLAP_CANVAS_PERCENT * height;
    }
}

function drawUpate(){
    if(BACKGROUND_LAYERS_COUNT < SETTINGS.BACKGROUND_DETAIL){
        drawBackroundLayer();
        BACKGROUND_LAYERS_COUNT = BACKGROUND_LAYERS_COUNT + SETTINGS.BACKGROUND_FRAME_ITERATIONS
    }
    else if(DRAWN_LAYERS_COUNT < SETTINGS.LAYERS_COUNT){
        drawForegroundLayer();
        DRAWN_LAYERS_COUNT++;
    }
}

function reset(){
    // printSettings();

    BACKGROUND_LAYERS_COUNT = 0;
    background(calcRgbColour(SETTINGS.BACKGROUND_COLOUR_RGB,1));
    
    DRAWN_LAYERS_COUNT = 0;
    SCALLED_LINE_HEIGHT = calcScalledHeight();
}

function draw(){
    let newBackgroundDetail = document.getElementById('control_backgrounddetail').value;
    if(newBackgroundDetail != SETTINGS.BACKGROUND_DETAIL){
        SETTINGS.BACKGROUND_DETAIL = newBackgroundDetail;
        reset();
    }

    let newBackgroundComplexity= document.getElementById('control_backgroundcomplexity').value;
    if(newBackgroundComplexity != SETTINGS.BACKGROUND_COMPLEXITY){
        SETTINGS.BACKGROUND_COMPLEXITY = newBackgroundComplexity;
        reset();
    }

    let newXStepOverlap = document.getElementById('control_xoverlap').value;
    if(newXStepOverlap != SETTINGS.CHAR_X_OVERLAP_CHAR_PERCENT){
        SETTINGS.CHAR_X_OVERLAP_CHAR_PERCENT = newXStepOverlap;
        reset();
    }

    let newYStepOverlap = document.getElementById('control_yoverlap').value;
    if(newYStepOverlap != SETTINGS.CHAR_Y_OVERLAP_CANVAS_PERCENT){
        SETTINGS.CHAR_Y_OVERLAP_CANVAS_PERCENT = newYStepOverlap;
        reset();
    }

    let newXJitter = document.getElementById('control_xjitter').value;
    if(newXJitter != SETTINGS.CHAR_X_JITTER_PERCENT){
        SETTINGS.CHAR_X_JITTER_PERCENT = newXJitter;
        reset();
    }

    let newYJitter = document.getElementById('control_yjitter').value;
    if(newYJitter != SETTINGS.CHAR_Y_JITTER_PERCENT){
        SETTINGS.CHAR_Y_JITTER_PERCENT = newYJitter;
        reset();
    }

    let newWidthJitter = document.getElementById('control_widthjitter').value;
    if(newWidthJitter != SETTINGS.CHAR_WIDTH_JITTER_PERCENT){
        SETTINGS.CHAR_WIDTH_JITTER_PERCENT = newWidthJitter;
        reset();
    }

    let newHeightJitter = document.getElementById('control_heightjitter').value;
    if(newHeightJitter != SETTINGS.CHAR_HEIGHT_JITTER_PERCENT){
        SETTINGS.CHAR_HEIGHT_JITTER_PERCENT = newHeightJitter;
        reset();
    }

    let newCharacterAspectRatio = document.getElementById('control_aspect').value;
    if(newCharacterAspectRatio != SETTINGS.CHAR_ASPECT_RATIO){
        SETTINGS.CHAR_ASPECT_RATIO = newCharacterAspectRatio;
        reset();
    }

    let newBrushAngle = document.getElementById('control_brushangle').value;
    if(newBrushAngle != SETTINGS.BRUSH_ANGLE){
        SETTINGS.BRUSH_ANGLE = newBrushAngle;
        reset();
    }

    let newBrushLength = document.getElementById('control_brushlength').value;
    if(newBrushLength != SETTINGS.BRUSH_LENGTH){
        SETTINGS.BRUSH_LENGTH = newBrushLength;
        reset();
    }

    let newBrushWeight = document.getElementById('control_brushweight').value;
    if(newBrushWeight != SETTINGS.BRUSH_WEIGHT){
        SETTINGS.BRUSH_WEIGHT = newBrushWeight;
        reset();
    }

    let newLayersCount = document.getElementById('control_layers').value;
    if(newLayersCount != SETTINGS.LAYERS_COUNT){
        SETTINGS.LAYERS_COUNT = newLayersCount;
        reset();
    }

    let newXOffsetJitter = document.getElementById('control_xoffsetjitter').value;
    if(newXOffsetJitter != SETTINGS.CHAR_X_OFFSET_JITTER_PERCENT){
        SETTINGS.CHAR_X_OFFSET_JITTER_PERCENT = newXOffsetJitter;
        reset();
    }

    let newYOffsetJitter = document.getElementById('control_yoffsetjitter').value;
    if(newYOffsetJitter != SETTINGS.CHAR_Y_OFFSET_JITTER_PERCENT){
        SETTINGS.CHAR_Y_OFFSET_JITTER_PERCENT = newYOffsetJitter;
        reset();
    }

    let newXStartOffsetJitter = document.getElementById('control_xstartjitter').value;
    if(newXStartOffsetJitter != SETTINGS.CHAR_FIRST_X_OFFSET_JITTER_PERCENT){
        SETTINGS.CHAR_FIRST_X_OFFSET_JITTER_PERCENT = newXStartOffsetJitter;
        reset();
    }

    let newLineScaling = document.getElementById('control_linescaling').value;
    if(newLineScaling != SETTINGS.LINE_HEIGHT_SCALE){
        SETTINGS.LINE_HEIGHT_SCALE = newLineScaling;
        reset();
    }

    drawUpate();

}