new p5((p) => {
    const HUNGRY_CONFIG = {
        labelTickGap: 5,
        markerInnerRatio: 0.93,
        markerOuterRatio: 1,
        mealsByDayType: {
            weekday: [
                { label: 'breakfast', hour: 5, minute: 0 },
                { label: 'lunch', hour: 12, minute: 0 },
                { label: 'dinner', hour: 20, minute: 30 }
            ],
            weekend: [
                { label: 'breakfast', hour: 5, minute: 0 },
                { label: 'lunch', hour: 11, minute: 0 },
                { label: 'dinner', hour: 17, minute: 0 }
            ]
        }
    };

    let faceLayer;
    let layout;

    function getCanvasSize() {
        const container = document.getElementById('clock-hungry-canvas');
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

    function getMealLabelWithCountdown(meal, ukNow) {
        const nowSeconds = ukNow.hour * 3600 + ukNow.minute * 60 + ukNow.second;
        const mealSeconds = meal.hour * 3600 + meal.minute * 60;
        const secondsUntil = mealSeconds > nowSeconds
            ? mealSeconds - nowSeconds
            : mealSeconds + ClockCommon.SECONDS_PER_DAY - nowSeconds;

        return `${Math.ceil(secondsUntil / 60)} minutes until ${meal.label}`;
    }

    function drawDayHand(dayHandEnd) {
        p.stroke(255);
        p.strokeWeight(ClockCommon.STYLE.CLOCK_HAND_STROKE_WEIGHT);
        p.line(
            layout.centerX,
            layout.centerY,
            layout.centerX + p.cos(dayHandEnd) * layout.radius,
            layout.centerY + p.sin(dayHandEnd) * layout.radius
        );
    }

    function drawHungryMarkers(meals, ukNow) {
        p.stroke(255);
        p.strokeWeight(ClockCommon.STYLE.HUNGRY_MARKER_STROKE_WEIGHT);
        p.fill(255);
        p.textAlign(p.RIGHT, p.CENTER);
        p.textSize(12);

        meals.forEach((meal) => {
            const markerAngle = ClockCommon.getAngleForClockTime(meal.hour, meal.minute, 0);
            const innerRadius = layout.radius * HUNGRY_CONFIG.markerInnerRatio;
            const outerRadius = layout.radius * HUNGRY_CONFIG.markerOuterRatio;

            p.line(
                layout.centerX + p.cos(markerAngle) * innerRadius,
                layout.centerY + p.sin(markerAngle) * innerRadius,
                layout.centerX + p.cos(markerAngle) * outerRadius,
                layout.centerY + p.sin(markerAngle) * outerRadius
            );

            p.push();
            p.translate(layout.centerX, layout.centerY);
            p.rotate(markerAngle);
            p.noStroke();

            const labelText = getMealLabelWithCountdown(meal, ukNow);
            const labelX = innerRadius - HUNGRY_CONFIG.labelTickGap;
            const labelWidth = p.textWidth(labelText);
            const labelHeight = p.textAscent() + p.textDescent();

            p.fill(0, 255);
            p.rect(
                labelX - labelWidth - 4,
                -labelHeight / 2 - 2,
                labelWidth + 8,
                labelHeight + 4,
                2
            );

            p.fill(255);
            p.text(labelText, labelX, 0);
            p.pop();

            p.stroke(255);
        });
    }

    p.setup = () => {
        const size = getCanvasSize();
        p.createCanvas(size.width, size.height).parent('clock-hungry-canvas');
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
        const milliseconds = now % 1000;
        const ukNow = ClockCommon.getUkNowParts(new Date(now));
        const dayProgress = ClockCommon.getUkDayProgress(ukNow, milliseconds);
        const dayHandEnd = dayProgress * p.TWO_PI - p.HALF_PI;
        const meals = ukNow.isWeekend
            ? HUNGRY_CONFIG.mealsByDayType.weekend
            : HUNGRY_CONFIG.mealsByDayType.weekday;

        drawDayHand(dayHandEnd);
        drawHungryMarkers(meals, ukNow);
    };

    p.setup = ((setup) => () => {
        setup();
        p.frameRate(10);
        ClockCommon.setupVisibilityPause(p, 'clock-hungry-canvas');
    })(p.setup);
}, 'clock-hungry-canvas');
