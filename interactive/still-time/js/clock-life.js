new p5((p) => {
    const LIFE_LAYOUT = {
        gridMargin: 24,
        titleOffsetY: 26,
        clockDiameterRatio: 0.62,
        labelFontMin: 8,
        labelFontMax: 11,
        labelGap: 3
    };

    function drawLifeClocks(ukNow, milliseconds, nowUtcMs) {
        const { columns, cellWidth, cellHeight, gridLeft, gridTop } = ClockCommon.calculateGridLayout(
            p.width,
            p.height,
            ClockCommon.LIFE_CLOCK_COUNT,
            LIFE_LAYOUT.gridMargin,
            LIFE_LAYOUT.titleOffsetY
        );
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
            const x = gridLeft + (column + 0.5) * cellWidth;
            const y = gridTop + (row + 0.5) * cellHeight;
            const progress = ClockCommon.getLifeYearProgress(year, ukNow, milliseconds, nowUtcMs);
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
        const size = ClockCommon.getCanvasSize(p, 'clock-life-canvas');
        p.createCanvas(size.width, size.height).parent('clock-life-canvas');
    };

    p.windowResized = () => {
        ClockCommon.scheduleCanvasResize(p, 'clock-life-canvas', () => {});
    };

    p.draw = () => {
        if (!ClockCommon.isCanvasVisible(p)) {
            return;
        }

        const now = Date.now();
        const ukNow = ClockCommon.getUkNowParts(new Date(now));
        const milliseconds = now % 1000;
        const nowUtcMs = Date.UTC(
            ukNow.year,
            ukNow.month - 1,
            ukNow.day,
            ukNow.hour,
            ukNow.minute,
            ukNow.second,
            milliseconds
        );

        p.clear();
        drawLifeClocks(ukNow, milliseconds, nowUtcMs);
    };

    p.setup = ((setup) => () => {
        setup();
        p.frameRate(1);
        ClockCommon.setupVisibilityPause(p, 'clock-life-canvas');
    })(p.setup);
}, 'clock-life-canvas');
