(function initClockCommon(global) {
    const UK_TIMEZONE = 'Europe/London';
    const BORDER_MARGIN = 50;
    const LABEL_OFFSET = 24;
    const SECOND_DURATION_MS = 60 * 1000;
    const SECONDS_PER_DAY = 24 * 60 * 60;
    const ELAPSED_FILL_VALUE = 100;
    const SECOND_FILL_ALPHA = 40;
    const CLOCK_HAND_STROKE_WEIGHT = 1.5;
    const MARKER_STROKE_WEIGHT = 2;

    const LIFE_START_YEAR = 1979;
    const LIFE_CLOCK_COUNT = 85;
    const LIFE_YEAR_START_MONTH_INDEX = 9;
    const LIFE_YEAR_START_DAY = 7;
    const LIFE_END_YEAR = LIFE_START_YEAR + LIFE_CLOCK_COUNT;
    const DAY_DURATION_MS = 24 * 60 * 60 * 1000;
    const LIFE_START_UTC_MS = Date.UTC(LIFE_START_YEAR, LIFE_YEAR_START_MONTH_INDEX, LIFE_YEAR_START_DAY, 0, 0, 0, 0);
    const DAYS_CLOCK_COUNT = Math.round(
        (
            Date.UTC(LIFE_END_YEAR, LIFE_YEAR_START_MONTH_INDEX, LIFE_YEAR_START_DAY, 0, 0, 0, 0)
            - LIFE_START_UTC_MS
        ) / DAY_DURATION_MS
    );
    const LIFE_YEAR_RANGES = Array.from({ length: LIFE_CLOCK_COUNT }, (_, index) => ({
        startMs: Date.UTC(LIFE_START_YEAR + index, LIFE_YEAR_START_MONTH_INDEX, LIFE_YEAR_START_DAY, 0, 0, 0, 0),
        endMs: Date.UTC(LIFE_START_YEAR + index + 1, LIFE_YEAR_START_MONTH_INDEX, LIFE_YEAR_START_DAY, 0, 0, 0, 0)
    }));

    const LIFE_CLOCK_CELL_FILL_ALPHA = 95;
    const LIFE_CLOCK_COMPLETE_FILL_ALPHA = 95;

    const STYLE = {
        BORDER_MARGIN,
        LABEL_OFFSET,
        ELAPSED_FILL_VALUE,
        SECOND_FILL_ALPHA,
        CLOCK_HAND_STROKE_WEIGHT,
        MARKER_STROKE_WEIGHT,
        HUNGRY_MARKER_STROKE_WEIGHT: MARKER_STROKE_WEIGHT,
        LIFE_CLOCK_CELL_FILL_ALPHA,
        LIFE_CLOCK_COMPLETE_FILL_ALPHA,
        SECTION_TITLE_Y: 14
    };

    const SIGNIFICANT_DAY_CATEGORY_PERSONAL = 'personal';
    const SIGNIFICANT_DAY_CATEGORY_WORLD = 'world';
    const SIGNIFICANT_PERIOD_CATEGORY_PERSONAL = 'period-personal';
    const SIGNIFICANT_DAY_COLORS = {
        [SIGNIFICANT_DAY_CATEGORY_PERSONAL]: [230, 86, 70],
        [SIGNIFICANT_DAY_CATEGORY_WORLD]: [38, 114, 160],
        [SIGNIFICANT_PERIOD_CATEGORY_PERSONAL]: [230, 86, 70]
    };

    // Top-level const from another script is not always attached to window, so support both access paths.
    const significantDayEventsFromConst = typeof SIGNIFICANT_DAY_EVENTS !== 'undefined' ? SIGNIFICANT_DAY_EVENTS : null;
    const significantDayEvents = Array.isArray(significantDayEventsFromConst)
        ? significantDayEventsFromConst
        : (Array.isArray(global.SIGNIFICANT_DAY_EVENTS) ? global.SIGNIFICANT_DAY_EVENTS : []);
    const SIGNIFICANT_DAY_EVENTS_BY_DATE = significantDayEvents.reduce((eventsByDate, event) => {
        eventsByDate[event.date] = {
            ...event,
            category: event.category || SIGNIFICANT_DAY_CATEGORY_PERSONAL
        };
        return eventsByDate;
    }, {});

    const UK_NOW_FORMATTER = new Intl.DateTimeFormat('en-GB', {
        timeZone: UK_TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
        timeZoneName: 'short'
    });
    let cachedUkNowSecond = null;
    let cachedUkNowParts = null;
    const labelMetricsCaches = new WeakMap();

    const DAY_TOOLTIP_DATE_FORMATTER = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'UTC',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });

    const DAY_TOOLTIP_NUMBER_FORMATTER = new Intl.NumberFormat('en-GB');

    function clamp(value, minValue, maxValue) {
        return Math.min(maxValue, Math.max(minValue, value));
    }

    function getUkNowParts(date) {
        const timestampSecond = Math.floor(date.getTime() / 1000);
        if (timestampSecond === cachedUkNowSecond) {
            return cachedUkNowParts;
        }

        const parsed = {};

        UK_NOW_FORMATTER.formatToParts(date).forEach((part) => {
            if (part.type !== 'literal') {
                parsed[part.type] = part.value;
            }
        });

        const weekday = parsed.weekday || '';
        const year = Number(parsed.year || 0);
        const month = Number(parsed.month || 1);
        const day = Number(parsed.day || 1);
        const hour = Number(parsed.hour || 0);
        const minute = Number(parsed.minute || 0);
        const second = Number(parsed.second || 0);

        cachedUkNowSecond = timestampSecond;
        cachedUkNowParts = {
            year,
            month,
            day,
            hour,
            minute,
            second,
            isWeekend: weekday === 'Sat' || weekday === 'Sun',
            tz: parsed.timeZoneName || 'UK'
        };

        return cachedUkNowParts;
    }

    function getUkNowUtcMs(ukNow, milliseconds) {
        return Date.UTC(
            ukNow.year,
            ukNow.month - 1,
            ukNow.day,
            ukNow.hour,
            ukNow.minute,
            ukNow.second,
            milliseconds
        );
    }

    function getUkDayProgress(ukNow, milliseconds) {
        const secondsInDay = ukNow.hour * 3600 + ukNow.minute * 60 + ukNow.second + milliseconds / 1000;
        return secondsInDay / SECONDS_PER_DAY;
    }

    function getAngleForClockTime(hour, minute, second) {
        const dayFraction = (hour * 3600 + minute * 60 + second) / SECONDS_PER_DAY;
        return dayFraction * Math.PI * 2 - Math.PI / 2;
    }

    function getLifeYearProgress(year, ukNow, milliseconds, nowUtcMs) {
        const cachedRange = LIFE_YEAR_RANGES[year - LIFE_START_YEAR];
        const startMs = cachedRange
            ? cachedRange.startMs
            : Date.UTC(year, LIFE_YEAR_START_MONTH_INDEX, LIFE_YEAR_START_DAY, 0, 0, 0, 0);
        const endMs = cachedRange
            ? cachedRange.endMs
            : Date.UTC(year + 1, LIFE_YEAR_START_MONTH_INDEX, LIFE_YEAR_START_DAY, 0, 0, 0, 0);
        const nowMs = Number.isFinite(nowUtcMs) ? nowUtcMs : getUkNowUtcMs(ukNow, milliseconds);
        return clamp((nowMs - startMs) / (endMs - startMs), 0, 1);
    }

    function getLifeDayElapsed(ukNow, milliseconds) {
        const nowMs = getUkNowUtcMs(ukNow, milliseconds);
        return clamp((nowMs - LIFE_START_UTC_MS) / DAY_DURATION_MS, 0, DAYS_CLOCK_COUNT);
    }

    function getLifeDateForDay(dayNumber) {
        const dayOffset = clamp(dayNumber - 1, 0, DAYS_CLOCK_COUNT - 1);
        return new Date(LIFE_START_UTC_MS + dayOffset * DAY_DURATION_MS);
    }

    function getUtcDateKey(dayDate) {
        const year = dayDate.getUTCFullYear();
        const month = String(dayDate.getUTCMonth() + 1).padStart(2, '0');
        const day = String(dayDate.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function getUtcMsFromDateKey(dateKey) {
        const [yearText, monthText, dayText] = dateKey.split('-');
        const year = Number(yearText);
        const month = Number(monthText);
        const day = Number(dayText);

        if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
            return null;
        }

        return Date.UTC(year, month - 1, day, 0, 0, 0, 0);
    }

    function getTodayUtcDateKey() {
        const now = new Date();
        return getUtcDateKey(new Date(Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate(),
            0,
            0,
            0,
            0
        )));
    }

    function getYesterdayUtcDateKey() {
        const now = new Date();
        return getUtcDateKey(new Date(Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate() - 1,
            0,
            0,
            0,
            0
        )));
    }

    function getImportantDayEvent(dayDate) {
        const dayKey = getUtcDateKey(dayDate);
        return SIGNIFICANT_DAY_EVENTS_BY_DATE[dayKey] || null;
    }

    function getImportantDayColor(event) {
        return SIGNIFICANT_DAY_COLORS[event.category] || SIGNIFICANT_DAY_COLORS[SIGNIFICANT_DAY_CATEGORY_PERSONAL];
    }

    function isSignificantPeriodEvent(event) {
        return Boolean(event && event.category === SIGNIFICANT_PERIOD_CATEGORY_PERSONAL);
    }

    function getEffectivePeriodEndDateKey(event) {
        if (!isSignificantPeriodEvent(event)) {
            return null;
        }

        if (event.endDate) {
            return event.endDate;
        }

        return getYesterdayUtcDateKey();
    }

    function isOngoingSignificantPeriodEvent(event) {
        return isSignificantPeriodEvent(event) && !event.endDate;
    }

    function isDateWithinEventPeriod(dayDate, event) {
        const dayKey = getUtcDateKey(dayDate);
        const endDateKey = getEffectivePeriodEndDateKey(event);
        const periodEndForDisplay = isOngoingSignificantPeriodEvent(event)
            ? getTodayUtcDateKey()
            : endDateKey;

        if (!periodEndForDisplay) {
            return false;
        }

        return dayKey >= event.date && dayKey <= periodEndForDisplay;
    }

    function getPeriodDurationDays(startDateKey, endDateKey) {
        if (!startDateKey || !endDateKey) {
            return null;
        }

        const startUtcMs = getUtcMsFromDateKey(startDateKey);
        const endUtcMs = getUtcMsFromDateKey(endDateKey);

        if (startUtcMs === null || endUtcMs === null || endUtcMs < startUtcMs) {
            return null;
        }

        return Math.floor((endUtcMs - startUtcMs) / DAY_DURATION_MS) + 1;
    }

    function getDaysCompletionPercentText(elapsedDays) {
        const completedPercentage = (elapsedDays / DAYS_CLOCK_COUNT) * 100;
        return (Math.round(completedPercentage * 10) / 10).toFixed(1);
    }

    function getCanvasSize(p, elementId) {
        const container = global.document.getElementById(elementId);
        const width = Math.max(320, container ? container.clientWidth : p.windowWidth);
        return {
            width,
            height: Math.min(p.windowHeight, Math.max(400, width * 1.5))
        };
    }

    function scheduleCanvasResize(p, elementId, onResize) {
        if (p.__clockResizeFrame !== undefined && p.__clockResizeFrame !== null) {
            return;
        }

        const requestFrame = typeof global.requestAnimationFrame === 'function'
            ? global.requestAnimationFrame.bind(global)
            : (callback) => global.setTimeout(callback, 0);
        p.__clockResizeFrame = requestFrame(() => {
            p.__clockResizeFrame = null;
            const size = getCanvasSize(p, elementId);

            if (size.width === p.width && size.height === p.height) {
                return;
            }

            p.resizeCanvas(size.width, size.height);
            onResize(size);
            p.redraw();
        });
    }

    function calculateCircleLayout(width, height, borderMargin) {
        const diameter = Math.max(0, Math.min(width, height) - borderMargin * 2);
        return {
            centerX: width / 2,
            centerY: height / 2,
            radius: diameter / 2,
            diameter
        };
    }

    function createFaceLayer(p, width, height, layout, shouldDrawBaseCircle) {
        const faceLayer = p.createGraphics(width, height);

        if (shouldDrawBaseCircle) {
            faceLayer.noStroke();
            faceLayer.fill(0);
            faceLayer.circle(layout.centerX, layout.centerY, layout.diameter);
        }

        return faceLayer;
    }

    function removeGraphicsLayer(layer) {
        if (layer && typeof layer.remove === 'function') {
            layer.remove();
        }
    }

    function createClockFace(p, previousFaceLayer) {
        const layout = calculateCircleLayout(p.width, p.height, STYLE.BORDER_MARGIN);
        removeGraphicsLayer(previousFaceLayer);
        return {
            layout,
            faceLayer: createFaceLayer(p, p.width, p.height, layout, true)
        };
    }

    function calculateGridLayout(width, height, itemCount, gridMargin, titleOffsetY) {
        const columns = Math.max(1, Math.ceil(Math.sqrt((itemCount * width) / Math.max(1, height))));
        const rows = Math.ceil(itemCount / columns);
        const contentWidth = Math.max(1, width - gridMargin * 2);
        const contentTop = gridMargin + titleOffsetY;
        const contentHeight = Math.max(1, height - contentTop - gridMargin);

        return {
            columns,
            rows,
            cellWidth: contentWidth / columns,
            cellHeight: contentHeight / rows,
            gridLeft: gridMargin,
            gridTop: contentTop
        };
    }

    function drawClockHand(p, layout, angle) {
        p.stroke(255);
        p.strokeWeight(STYLE.CLOCK_HAND_STROKE_WEIGHT);
        p.line(
            layout.centerX,
            layout.centerY,
            layout.centerX + p.cos(angle) * layout.radius,
            layout.centerY + p.sin(angle) * layout.radius
        );
    }

    function drawClockArc(p, layout, startAngle, endAngle) {
        p.blendMode(p.ADD);
        p.noStroke();
        p.fill(
            STYLE.ELAPSED_FILL_VALUE,
            STYLE.ELAPSED_FILL_VALUE,
            STYLE.ELAPSED_FILL_VALUE,
            STYLE.SECOND_FILL_ALPHA
        );
        p.arc(
            layout.centerX,
            layout.centerY,
            layout.radius * 2,
            layout.radius * 2,
            startAngle,
            endAngle,
            p.PIE
        );
        p.blendMode(p.BLEND);
    }

    function drawRadialMarker(p, layout, angle, innerRatio, outerRatio) {
        const innerRadius = layout.radius * innerRatio;
        const outerRadius = layout.radius * outerRatio;

        p.stroke(255);
        p.strokeWeight(STYLE.MARKER_STROKE_WEIGHT);
        p.line(
            layout.centerX + p.cos(angle) * innerRadius,
            layout.centerY + p.sin(angle) * innerRadius,
            layout.centerX + p.cos(angle) * outerRadius,
            layout.centerY + p.sin(angle) * outerRadius
        );
    }

    function getLabelMetrics(p, labelText, textSize) {
        let metricsCache = labelMetricsCaches.get(p);
        if (!metricsCache) {
            metricsCache = new Map();
            labelMetricsCaches.set(p, metricsCache);
        }

        const cacheKey = `${textSize}:${labelText}`;
        if (metricsCache.has(cacheKey)) {
            return metricsCache.get(cacheKey);
        }

        p.push();
        p.textSize(textSize);
        const metrics = {
            width: p.textWidth(labelText),
            height: p.textAscent() + p.textDescent()
        };
        p.pop();
        metricsCache.set(cacheKey, metrics);
        return metrics;
    }

    function drawRotatedLabel(p, layout, angle, labelX, labelText, textSize) {
        const { width, height } = getLabelMetrics(p, labelText, textSize);

        p.push();
        p.translate(layout.centerX, layout.centerY);
        p.rotate(angle);
        p.noStroke();
        p.textAlign(p.RIGHT, p.CENTER);
        p.textSize(textSize);
        p.fill(0, 255);
        p.rect(labelX - width - 4, -height / 2 - 2, width + 8, height + 4, 2);
        p.fill(255);
        p.text(labelText, labelX, 0);
        p.pop();
    }

    function drawProgressClock(p, x, y, diameter, config) {
        const { isComplete, isPartial, arcEnd, partialAlpha } = config;

        if (isComplete) {
            drawElapsedClock(p, x, y, diameter, STYLE.LIFE_CLOCK_COMPLETE_FILL_ALPHA);
            return;
        }

        if (isPartial) {
            drawElapsedClock(p, x, y, diameter, partialAlpha);
            drawRemainingMask(p, x, y, diameter, arcEnd);
            return;
        }

        drawUnstartedClock(p, x, y, diameter);
    }

    function drawEventClock(p, x, y, diameter, color, isPartial, arcEnd) {
        p.fill(color[0], color[1], color[2]);
        p.circle(x, y, diameter);

        if (isPartial) {
            drawRemainingMask(p, x, y, diameter, arcEnd);
        }
    }

    function drawElapsedClock(p, x, y, diameter, alpha) {
        p.fill(STYLE.ELAPSED_FILL_VALUE, STYLE.ELAPSED_FILL_VALUE, STYLE.ELAPSED_FILL_VALUE, alpha);
        p.circle(x, y, diameter);
    }

    function drawUnstartedClock(p, x, y, diameter) {
        p.fill(0);
        p.circle(x, y, diameter);
    }

    function drawRemainingMask(p, x, y, diameter, arcEnd) {
        p.fill(0);
        p.arc(x, y, diameter, diameter, arcEnd, -p.HALF_PI + p.TWO_PI, p.PIE);
    }

    function formatDayTooltipDate(date) {
        return DAY_TOOLTIP_DATE_FORMATTER.format(date);
    }

    function formatNumber(number) {
        return DAY_TOOLTIP_NUMBER_FORMATTER.format(number);
    }

    function setupVisibilityPause(p, elementId) {
        const element = global.document.getElementById(elementId);
        if (!element) {
            return;
        }

        let isIntersecting = false;
        const updateLoopState = () => {
            p.__clockIsVisible = global.document.visibilityState !== 'hidden' && isIntersecting;
            if (!p.__clockIsVisible) {
                p.noLoop();
            } else {
                p.loop();
            }
        };

        p.noLoop();

        if ('IntersectionObserver' in global) {
            const observer = new global.IntersectionObserver((entries) => {
                isIntersecting = entries[0].isIntersecting;
                updateLoopState();
            }, { threshold: 0 });

            observer.observe(element);
        } else {
            const updateIntersectionFallback = () => {
                const bounds = element.getBoundingClientRect();
                isIntersecting = bounds.bottom > 0
                    && bounds.right > 0
                    && bounds.top < global.innerHeight
                    && bounds.left < global.innerWidth;
                updateLoopState();
            };

            global.addEventListener('scroll', updateIntersectionFallback, { passive: true });
            global.addEventListener('resize', updateIntersectionFallback, { passive: true });
            updateIntersectionFallback();
        }

        global.document.addEventListener('visibilitychange', updateLoopState);
        updateLoopState();
    }

    function isCanvasVisible(p) {
        return p.__clockIsVisible === true;
    }

    global.ClockCommon = {
        STYLE,
        SECOND_DURATION_MS,
        SECONDS_PER_DAY,
        LIFE_START_YEAR,
        LIFE_CLOCK_COUNT,
        DAY_DURATION_MS,
        DAYS_CLOCK_COUNT,
        getUkNowParts,
        getUkDayProgress,
        getAngleForClockTime,
        getLifeYearProgress,
        getLifeDayElapsed,
        getLifeDateForDay,
        getImportantDayEvent,
        getImportantDayColor,
        isSignificantPeriodEvent,
        getEffectivePeriodEndDateKey,
        isDateWithinEventPeriod,
        getPeriodDurationDays,
        getDaysCompletionPercentText,
        getCanvasSize,
        scheduleCanvasResize,
        isCanvasVisible,
        createClockFace,
        removeGraphicsLayer,
        calculateGridLayout,
        drawClockHand,
        drawClockArc,
        drawRadialMarker,
        getLabelMetrics,
        drawRotatedLabel,
        drawProgressClock,
        drawEventClock,
        formatDayTooltipDate,
        formatNumber,
        setupVisibilityPause
    };
}(window));


