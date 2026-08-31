new p5((p) => {
    let faceLayer;
    let layout;

    function rebuildFace() {
        const clockFace = ClockCommon.createClockFace(p, faceLayer);
        layout = clockFace.layout;
        faceLayer = clockFace.faceLayer;
    }

    p.setup = () => {
        const size = ClockCommon.getCanvasSize(p, 'clock-time-canvas');
        p.createCanvas(size.width, size.height).parent('clock-time-canvas');
        rebuildFace();
    };

    p.windowResized = () => {
        ClockCommon.scheduleCanvasResize(p, 'clock-time-canvas', rebuildFace);
    };

    p.draw = () => {
        if (!ClockCommon.isCanvasVisible(p)) {
            return;
        }

        p.image(faceLayer, 0, 0);

        const now = Date.now();
        const secondProgress = (now % ClockCommon.SECOND_DURATION_MS) / ClockCommon.SECOND_DURATION_MS;
        const secondArcEnd = secondProgress * p.TWO_PI - p.HALF_PI;

        ClockCommon.drawClockArc(p, layout, -p.HALF_PI, secondArcEnd);
        ClockCommon.drawClockHand(p, layout, secondArcEnd);
    };

    p.setup = ((setup) => () => {
        setup();
        p.frameRate(30);
        ClockCommon.setupVisibilityPause(p, 'clock-time-canvas');
    })(p.setup);
}, 'clock-time-canvas');
