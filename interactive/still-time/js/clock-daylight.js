new p5((p) => {
    const DAYLIGHT_CONFIG = {
        latitude: 53.6522,
        longitude: -2.6197,
        civilTwilightZenith: 96,
        labelTickGap: 5,
        labelHoverMargin: 8,
        markerInnerRatio: 0.93,
        markerOuterRatio: 1
    };

    let faceLayer;
    let layout;
    const solarLimitsCache = {};
    const solarEventCache = {};

    function rebuildFace() {
        const clockFace = ClockCommon.createClockFace(p, faceLayer);
        layout = clockFace.layout;
        faceLayer = clockFace.faceLayer;
    }

    function getDayOfYear(year, month, day) {
        const startOfYear = Date.UTC(year, 0, 1);
        const date = Date.UTC(year, month - 1, day);
        return Math.floor((date - startOfYear) / ClockCommon.DAY_DURATION_MS) + 1;
    }

    // NOAA's sunrise equation, using 96 degrees for civil dawn and dusk.
    function getSolarEvent(dateParts, eventType) {
        const dayOfYear = getDayOfYear(dateParts.year, dateParts.month, dateParts.day);
        const longitudeHour = DAYLIGHT_CONFIG.longitude / 15;
        const isDawn = eventType === 'dawn';
        const approximateTime = dayOfYear + ((isDawn ? 6 : 18) - longitudeHour) / 24;
        const meanAnomaly = 0.9856 * approximateTime - 3.289;
        let sunLongitude = meanAnomaly
            + 1.916 * Math.sin(meanAnomaly * Math.PI / 180)
            + 0.020 * Math.sin(2 * meanAnomaly * Math.PI / 180)
            + 282.634;
        sunLongitude = (sunLongitude + 360) % 360;

        let rightAscension = Math.atan(0.91764 * Math.tan(sunLongitude * Math.PI / 180)) * 180 / Math.PI;
        rightAscension = (rightAscension + 360) % 360;
        rightAscension += 90 * Math.floor(sunLongitude / 90) - 90 * Math.floor(rightAscension / 90);
        rightAscension /= 15;

        const sinDeclination = 0.39782 * Math.sin(sunLongitude * Math.PI / 180);
        const cosDeclination = Math.cos(Math.asin(sinDeclination));
        const latitudeRadians = DAYLIGHT_CONFIG.latitude * Math.PI / 180;
        const zenithRadians = DAYLIGHT_CONFIG.civilTwilightZenith * Math.PI / 180;
        const cosHourAngle = (
            Math.cos(zenithRadians) - sinDeclination * Math.sin(latitudeRadians)
        ) / (cosDeclination * Math.cos(latitudeRadians));

        if (cosHourAngle < -1 || cosHourAngle > 1) {
            return null;
        }

        const hourAngle = Math.acos(cosHourAngle) * 180 / Math.PI / 15;
        const localMeanTime = rightAscension
            + (isDawn ? 24 - hourAngle : hourAngle)
            - 0.06571 * approximateTime
            - 6.622;
        const utcHour = ((localMeanTime - longitudeHour) % 24 + 24) % 24;
        const eventDate = new Date(Date.UTC(dateParts.year, dateParts.month - 1, dateParts.day));
        eventDate.setUTCHours(Math.floor(utcHour), Math.floor((utcHour % 1) * 60), 0, 0);

        return {
            date: eventDate,
            local: ClockCommon.getUkNowParts(eventDate)
        };
    }

    function getCachedSolarEvent(dateParts, eventType) {
        const cacheKey = `${dateParts.year}-${dateParts.month}-${dateParts.day}-${eventType}`;
        if (!(cacheKey in solarEventCache)) {
            solarEventCache[cacheKey] = getSolarEvent(dateParts, eventType);
        }
        return solarEventCache[cacheKey];
    }

    function getNextSolarEvent(dateParts, eventType, now) {
        let event = getCachedSolarEvent(dateParts, eventType);

        if (event && event.date.getTime() <= now.getTime()) {
            const nextDate = new Date(Date.UTC(dateParts.year, dateParts.month - 1, dateParts.day + 1));
            event = getCachedSolarEvent({
                year: nextDate.getUTCFullYear(),
                month: nextDate.getUTCMonth() + 1,
                day: nextDate.getUTCDate()
            }, eventType);
        }

        return event;
    }

    function getSolarLimits(year, eventType) {
        const cacheKey = `${year}-${eventType}`;
        if (solarLimitsCache[cacheKey]) {
            return solarLimitsCache[cacheKey];
        }

        const daysInYear = 365 + (new Date(Date.UTC(year, 1, 29)).getUTCMonth() === 1 ? 1 : 0);
        let earliest = null;
        let latest = null;

        for (let day = 1; day <= daysInYear; day += 1) {
            const date = new Date(Date.UTC(year, 0, day));
            const event = getCachedSolarEvent({
                year,
                month: date.getUTCMonth() + 1,
                day: date.getUTCDate()
            }, eventType);

            if (!event) {
                continue;
            }

            const minutes = event.local.hour * 60 + event.local.minute + event.local.second / 60;
            if (!earliest || minutes < earliest.minutes) {
                earliest = { event, minutes };
            }
            if (!latest || minutes > latest.minutes) {
                latest = { event, minutes };
            }
        }

        solarLimitsCache[cacheKey] = { earliest, latest };
        return solarLimitsCache[cacheKey];
    }

    function drawDaylightArc(dawn, dusk) {
        if (!dawn || !dusk) {
            return;
        }

        ClockCommon.drawClockArc(
            p,
            layout,
            ClockCommon.getAngleForClockTime(dawn.local.hour, dawn.local.minute, dawn.local.second),
            ClockCommon.getAngleForClockTime(dusk.local.hour, dusk.local.minute, dusk.local.second)
        );
    }

    function drawSolarTick(event) {
        if (!event) {
            return;
        }

        const markerAngle = ClockCommon.getAngleForClockTime(event.local.hour, event.local.minute, event.local.second);
        ClockCommon.drawRadialMarker(
            p,
            layout,
            markerAngle,
            DAYLIGHT_CONFIG.markerInnerRatio,
            DAYLIGHT_CONFIG.markerOuterRatio
        );
    }

    function drawSolarLimitLabel(event) {
        if (!event) {
            return;
        }

        const markerAngle = ClockCommon.getAngleForClockTime(event.local.hour, event.local.minute, event.local.second);
        const labelX = layout.radius * DAYLIGHT_CONFIG.markerInnerRatio - DAYLIGHT_CONFIG.labelTickGap;
        const labelText = ClockCommon.formatDayTooltipDate(event.date);
        ClockCommon.drawRotatedLabel(p, layout, markerAngle, labelX, labelText, 10);
    }

    function isSolarLabelHovered(event, eventType, now) {
        if (!event || !layout || !Number.isFinite(p.mouseX) || !Number.isFinite(p.mouseY)) {
            return false;
        }

        const markerAngle = ClockCommon.getAngleForClockTime(event.local.hour, event.local.minute, event.local.second);
        const innerRadius = layout.radius * DAYLIGHT_CONFIG.markerInnerRatio;
        const minutesUntil = Math.max(0, Math.ceil((event.date.getTime() - now.getTime()) / (60 * 1000)));
        const labelText = `${minutesUntil} minutes until ${eventType}`;
        const labelMetrics = ClockCommon.getLabelMetrics(p, labelText, 12);

        const x = p.mouseX - layout.centerX;
        const y = p.mouseY - layout.centerY;
        const localX = x * p.cos(markerAngle) + y * p.sin(markerAngle);
        const localY = -x * p.sin(markerAngle) + y * p.cos(markerAngle);
        const margin = DAYLIGHT_CONFIG.labelHoverMargin;
        const labelX = innerRadius - DAYLIGHT_CONFIG.labelTickGap;

        return localX >= labelX - labelMetrics.width - 4 - margin
            && localX <= labelX + 4 + margin
            && localY >= -labelMetrics.height / 2 - 2 - margin
            && localY <= labelMetrics.height / 2 + 2 + margin;
    }

    function drawSolarLimits(event, eventType, isHovered) {
        if (!isHovered) {
            return;
        }

        const limits = getSolarLimits(event.local.year, eventType);
        if (!limits.earliest || !limits.latest) {
            return;
        }

        ClockCommon.drawClockArc(
            p,
            layout,
            ClockCommon.getAngleForClockTime(
                limits.earliest.event.local.hour,
                limits.earliest.event.local.minute,
                limits.earliest.event.local.second
            ),
            ClockCommon.getAngleForClockTime(
                limits.latest.event.local.hour,
                limits.latest.event.local.minute,
                limits.latest.event.local.second
            )
        );
        drawSolarTick(limits.earliest.event);
        drawSolarTick(limits.latest.event);
        drawSolarLimitLabel(limits.earliest.event);
        drawSolarLimitLabel(limits.latest.event);
    }

    function drawHoverBackground() {
        p.noStroke();
        p.fill(0);
        p.circle(layout.centerX, layout.centerY, layout.diameter);
    }

    function drawSolarMarker(event, eventType, now) {
        if (!event) {
            return;
        }

        const markerAngle = ClockCommon.getAngleForClockTime(event.local.hour, event.local.minute, event.local.second);
        const innerRadius = layout.radius * DAYLIGHT_CONFIG.markerInnerRatio;

        drawSolarTick(event);

        const minutesUntil = Math.max(0, Math.ceil((event.date.getTime() - now.getTime()) / (60 * 1000)));
        const labelText = `${minutesUntil} minutes until ${eventType}`;
        const labelX = innerRadius - DAYLIGHT_CONFIG.labelTickGap;
        ClockCommon.drawRotatedLabel(p, layout, markerAngle, labelX, labelText, 12);
    }

    p.setup = () => {
        const size = ClockCommon.getCanvasSize(p, 'clock-daylight-canvas');
        p.createCanvas(size.width, size.height).parent('clock-daylight-canvas');
        rebuildFace();
    };

    p.windowResized = () => {
        ClockCommon.scheduleCanvasResize(p, 'clock-daylight-canvas', rebuildFace);
    };

    p.draw = () => {
        if (!ClockCommon.isCanvasVisible(p)) {
            return;
        }

        p.image(faceLayer, 0, 0);

        const now = new Date();
        const milliseconds = now.getMilliseconds();
        const ukNow = ClockCommon.getUkNowParts(now);
        const dayProgress = ClockCommon.getUkDayProgress(ukNow, milliseconds);
        const dayHandEnd = dayProgress * p.TWO_PI - p.HALF_PI;
        const dateParts = { year: ukNow.year, month: ukNow.month, day: ukNow.day };
        const daylightDawn = getCachedSolarEvent(dateParts, 'dawn');
        const daylightDusk = getCachedSolarEvent(dateParts, 'dusk');
        const dawn = getNextSolarEvent(dateParts, 'dawn', now);
        const dusk = getNextSolarEvent(dateParts, 'dusk', now);
        const dawnHovered = isSolarLabelHovered(dawn, 'dawn', now);
        const duskHovered = isSolarLabelHovered(dusk, 'dusk', now);

        if (dawnHovered || duskHovered) {
            drawHoverBackground();
            if (dawnHovered) {
                drawSolarLimits(dawn, 'dawn', dawnHovered);
            }
            if (duskHovered) {
                drawSolarLimits(dusk, 'dusk', duskHovered);
            }
        } else {
            drawDaylightArc(daylightDawn, daylightDusk);
        }
        ClockCommon.drawClockHand(p, layout, dayHandEnd);
        drawSolarMarker(dawn, 'dawn', now);
        drawSolarMarker(dusk, 'dusk', now);
    };

    p.setup = ((setup) => () => {
        setup();
        p.frameRate(2);
        ClockCommon.setupVisibilityPause(p, 'clock-daylight-canvas');
    })(p.setup);
}, 'clock-daylight-canvas');
