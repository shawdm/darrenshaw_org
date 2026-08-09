new p5((p) => {
    let faceLayer;
    let layout;

    function getCanvasSize() {
        const container = document.getElementById('clock-time-canvas');
        const width = Math.max(320, container ? container.clientWidth : p.windowWidth);
        return {
            width,
            height: Math.min(p.windowHeight, Math.max(400, width * 1.5))
        };
    }

    function rebuildFace() {
        layout = ClockCommon.calculateCircleLayout(p.width, p.height, ClockCommon.STYLE.BORDER_MARGIN);
        faceLayer = ClockCommon.createFaceLayer(p, p.width, p.height, layout, true);
    }

    function drawTimeClock(secondArcEnd) {
        p.blendMode(p.ADD);
        p.noStroke();
        p.fill(
            ClockCommon.STYLE.ELAPSED_FILL_VALUE,
            ClockCommon.STYLE.ELAPSED_FILL_VALUE,
            ClockCommon.STYLE.ELAPSED_FILL_VALUE,
            ClockCommon.STYLE.SECOND_FILL_ALPHA
        );
        p.arc(layout.centerX, layout.centerY, layout.radius * 2, layout.radius * 2, -p.HALF_PI, secondArcEnd, p.PIE);
        p.blendMode(p.BLEND);
    }

    function drawSecondHand(secondArcEnd) {
        p.stroke(255);
        p.strokeWeight(ClockCommon.STYLE.CLOCK_HAND_STROKE_WEIGHT);
        p.line(
            layout.centerX,
            layout.centerY,
            layout.centerX + p.cos(secondArcEnd) * layout.radius,
            layout.centerY + p.sin(secondArcEnd) * layout.radius
        );
    }

    p.setup = () => {
        const size = getCanvasSize();
        p.createCanvas(size.width, size.height).parent('clock-time-canvas');
        rebuildFace();
    };

    p.windowResized = () => {
        const size = getCanvasSize();
        p.resizeCanvas(size.width, size.height);
        rebuildFace();
    };

    p.draw = () => {
        p.image(faceLayer, 0, 0);

        const now = Date.now();
        const secondProgress = (now % ClockCommon.SECOND_DURATION_MS) / ClockCommon.SECOND_DURATION_MS;
        const secondArcEnd = secondProgress * p.TWO_PI - p.HALF_PI;

        drawTimeClock(secondArcEnd);
        drawSecondHand(secondArcEnd);
    };

    p.setup = ((setup) => () => {
        setup();
        ClockCommon.setupVisibilityPause(p, 'clock-time-canvas');
    })(p.setup);
}, 'clock-time-canvas');
