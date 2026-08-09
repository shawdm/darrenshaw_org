new p5((p) => {
    const LIFE_LAYOUT = {
        gridMargin: 24,
        titleOffsetY: 26,
        clockDiameterRatio: 0.62,
        labelFontMin: 8,
        labelFontMax: 11,
        labelGap: 3
    };

    function getCanvasSize() {
        const container = document.getElementById('clock-life-canvas');
        const width = Math.max(320, container ? container.clientWidth : p.windowWidth);
        return {
            width,
            height: Math.min(p.windowHeight, Math.max(400, width * 1.5))
        };
    }

    function drawLifeClocks(ukNow, milliseconds) {
        const columns = Math.max(1, Math.ceil(Math.sqrt((ClockCommon.LIFE_CLOCK_COUNT * p.width) / Math.max(1, p.height))));
        const rows = Math.ceil(ClockCommon.LIFE_CLOCK_COUNT / columns);
        const contentWidth = Math.max(1, p.width - LIFE_LAYOUT.gridMargin * 2);
        const contentTop = LIFE_LAYOUT.gridMargin + LIFE_LAYOUT.titleOffsetY;
        const contentHeight = Math.max(1, p.height - contentTop - LIFE_LAYOUT.gridMargin);
        const cellWidth = contentWidth / columns;
        const cellHeight = contentHeight / rows;
        const clockDiameter = Math.min(cellWidth, cellHeight) * LIFE_LAYOUT.clockDiameterRatio;
        const labelSize = p.constrain(
            Math.min(cellWidth, cellHeight) * 0.14,
            LIFE_LAYOUT.labelFontMin,
            LIFE_LAYOUT.labelFontMax
        );

        p.noStroke();
        p.textAlign(p.CENTER, p.TOP);
        p.textSize(labelSize);

        for (let i = 0; i < ClockCommon.LIFE_CLOCK_COUNT; i += 1) {
            const year = ClockCommon.LIFE_START_YEAR + i;
            const yearCount = i + 1;
            const column = i % columns;
            const row = Math.floor(i / columns);
            const x = LIFE_LAYOUT.gridMargin + (column + 0.5) * cellWidth;
            const y = contentTop + (row + 0.5) * cellHeight;
            const progress = ClockCommon.getLifeYearProgress(year, ukNow, milliseconds);
            const isComplete = progress >= 1;
            const isPartial = progress > 0 && progress < 1;

            ClockCommon.drawProgressClock(p, x, y, clockDiameter, {
                isComplete,
                isPartial,
                arcEnd: progress * p.TWO_PI - p.HALF_PI,
                partialAlpha: ClockCommon.STYLE.LIFE_CLOCK_CELL_FILL_ALPHA
            });

            p.fill(0);
            p.text(String(yearCount), x, y + clockDiameter / 2 + LIFE_LAYOUT.labelGap);
        }
    }

    p.setup = () => {
        const size = getCanvasSize();
        p.createCanvas(size.width, size.height).parent('clock-life-canvas');
    };

    p.windowResized = () => {
        const size = getCanvasSize();
        p.resizeCanvas(size.width, size.height);
    };

    p.draw = () => {
        const now = Date.now();
        const ukNow = ClockCommon.getUkNowParts(new Date(now));
        const milliseconds = now % 1000;

        drawLifeClocks(ukNow, milliseconds);
    };

    p.setup = ((setup) => () => {
        setup();
        p.frameRate(1);
        ClockCommon.setupVisibilityPause(p, 'clock-life-canvas');
    })(p.setup);
}, 'clock-life-canvas');
