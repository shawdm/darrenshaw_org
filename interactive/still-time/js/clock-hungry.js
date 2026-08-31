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

    function rebuildFace() {
        const clockFace = ClockCommon.createClockFace(p, faceLayer);
        layout = clockFace.layout;
        faceLayer = clockFace.faceLayer;
    }

    function getMealLabelWithCountdown(meal, ukNow) {
        const nowSeconds = ukNow.hour * 3600 + ukNow.minute * 60 + ukNow.second;
        const mealSeconds = meal.hour * 3600 + meal.minute * 60;
        const secondsUntil = mealSeconds > nowSeconds
            ? mealSeconds - nowSeconds
            : mealSeconds + ClockCommon.SECONDS_PER_DAY - nowSeconds;

        return `${Math.ceil(secondsUntil / 60)} minutes until ${meal.label}`;
    }

    function drawHungryMarkers(meals, ukNow) {
        meals.forEach((meal) => {
            const markerAngle = ClockCommon.getAngleForClockTime(meal.hour, meal.minute, 0);
            ClockCommon.drawRadialMarker(
                p,
                layout,
                markerAngle,
                HUNGRY_CONFIG.markerInnerRatio,
                HUNGRY_CONFIG.markerOuterRatio
            );

            const labelText = getMealLabelWithCountdown(meal, ukNow);
            const labelX = layout.radius * HUNGRY_CONFIG.markerInnerRatio - HUNGRY_CONFIG.labelTickGap;
            ClockCommon.drawRotatedLabel(p, layout, markerAngle, labelX, labelText, 12);
        });
    }

    p.setup = () => {
        const size = ClockCommon.getCanvasSize(p, 'clock-hungry-canvas');
        p.createCanvas(size.width, size.height).parent('clock-hungry-canvas');
        rebuildFace();
    };

    p.windowResized = () => {
        ClockCommon.scheduleCanvasResize(p, 'clock-hungry-canvas', rebuildFace);
    };

    p.draw = () => {
        if (!ClockCommon.isCanvasVisible(p)) {
            return;
        }

        p.image(faceLayer, 0, 0);

        const now = Date.now();
        const milliseconds = now % 1000;
        const ukNow = ClockCommon.getUkNowParts(new Date(now));
        const dayProgress = ClockCommon.getUkDayProgress(ukNow, milliseconds);
        const dayHandEnd = dayProgress * p.TWO_PI - p.HALF_PI;
        const meals = ukNow.isWeekend
            ? HUNGRY_CONFIG.mealsByDayType.weekend
            : HUNGRY_CONFIG.mealsByDayType.weekday;

        ClockCommon.drawClockHand(p, layout, dayHandEnd);
        drawHungryMarkers(meals, ukNow);
    };

    p.setup = ((setup) => () => {
        setup();
        p.frameRate(1);
        ClockCommon.setupVisibilityPause(p, 'clock-hungry-canvas');
    })(p.setup);
}, 'clock-hungry-canvas');
