(function initClockCommon(global) {
    const UK_TIMEZONE = 'Europe/London';
    const BORDER_MARGIN = 50;
    const LABEL_OFFSET = 24;
    const SECOND_DURATION_MS = 60 * 1000;
    const SECONDS_PER_DAY = 24 * 60 * 60;
    const ELAPSED_FILL_VALUE = 100;
    const SECOND_FILL_ALPHA = 40;
    const CLOCK_HAND_STROKE_WEIGHT = 1.5;
    const HUNGRY_MARKER_STROKE_WEIGHT = 2;

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

    const LIFE_CLOCK_CELL_FILL_ALPHA = 95;
    const LIFE_CLOCK_COMPLETE_FILL_ALPHA = 95;

    const STYLE = {
        BORDER_MARGIN,
        LABEL_OFFSET,
        ELAPSED_FILL_VALUE,
        SECOND_FILL_ALPHA,
        CLOCK_HAND_STROKE_WEIGHT,
        HUNGRY_MARKER_STROKE_WEIGHT,
        LIFE_CLOCK_CELL_FILL_ALPHA,
        LIFE_CLOCK_COMPLETE_FILL_ALPHA,
        SECTION_TITLE_Y: 14
    };

    const SIGNIFICANT_DAY_CATEGORY_PERSONAL = 'personal';
    const SIGNIFICANT_DAY_CATEGORY_WORLD = 'world';
    const SIGNIFICANT_PERIOD_CATEGORY_PERSONAL = 'period-personal';
    const SIGNIFICANT_DAY_COLORS = {
        [SIGNIFICANT_DAY_CATEGORY_PERSONAL]: [196, 86, 70],
        [SIGNIFICANT_DAY_CATEGORY_WORLD]: [38, 114, 136],
        [SIGNIFICANT_PERIOD_CATEGORY_PERSONAL]: [196, 86, 70]
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

    function getLifeYearProgress(year, ukNow, milliseconds) {
        const startMs = Date.UTC(year, LIFE_YEAR_START_MONTH_INDEX, LIFE_YEAR_START_DAY, 0, 0, 0, 0);
        const endMs = Date.UTC(year + 1, LIFE_YEAR_START_MONTH_INDEX, LIFE_YEAR_START_DAY, 0, 0, 0, 0);
        const nowMs = getUkNowUtcMs(ukNow, milliseconds);
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

    function drawSectionTitle(p, title) {
        p.noStroke();
        p.fill(0);
        p.textAlign(p.CENTER, p.TOP);
        p.textSize(24);
        p.text(title, p.width / 2, STYLE.SECTION_TITLE_Y);
    }

    function formatDayTooltipDate(date) {
        return DAY_TOOLTIP_DATE_FORMATTER.format(date);
    }

    function formatNumber(number) {
        return DAY_TOOLTIP_NUMBER_FORMATTER.format(number);
    }

    function setupVisibilityPause(p, elementId) {
        if (!('IntersectionObserver' in global)) {
            return;
        }

        const element = document.getElementById(elementId);
        if (!element) {
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                p.loop();
            } else {
                p.noLoop();
            }
        }, { threshold: 0 });

        observer.observe(element);
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
        calculateCircleLayout,
        createFaceLayer,
        drawProgressClock,
        drawEventClock,
        drawSectionTitle,
        formatDayTooltipDate,
        formatNumber,
        setupVisibilityPause
    };
}(window));


