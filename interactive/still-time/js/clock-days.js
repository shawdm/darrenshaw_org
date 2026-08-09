new p5((p) => {
    const DAYS_LAYOUT = {
        gridMargin: 24,
        titleOffsetY: 30,
        clockDiameterRatio: 1,
        circleGapPx: 0.5
    };

    const TOOLTIP = {
        offsetX: 14,
        offsetY: 14,
        paddingX: 8,
        paddingY: 6,
        fontSize: 12,
        cornerRadius: 4,
        fillAlpha: 220
    };

    let daysGridLayout = null;
    let daysLayer = null;
    let cachedCompletedDays = -1;
    let cachedHoveredPeriod = null;

    function getCanvasSize() {
        const container = document.getElementById('clock-days-canvas');
        const width = Math.max(320, container ? container.clientWidth : p.windowWidth);
        return {
            width,
            height: Math.min(p.windowHeight, Math.max(400, width * 1.5))
        };
    }

    function getHoveredDayIndex(x, y) {
        if (!daysGridLayout) {
            return -1;
        }

        const localX = x - daysGridLayout.gridLeft;
        const localY = y - daysGridLayout.gridTop;

        if (localX < 0 || localY < 0) {
            return -1;
        }

        const column = Math.floor(localX / daysGridLayout.cellWidth);
        const row = Math.floor(localY / daysGridLayout.cellHeight);

        if (column < 0 || column >= daysGridLayout.columns || row < 0 || row >= daysGridLayout.rows) {
            return -1;
        }

        const dayIndex = row * daysGridLayout.columns + column;

        if (dayIndex < 0 || dayIndex >= ClockCommon.DAYS_CLOCK_COUNT) {
            return -1;
        }

        const centerXForCell = daysGridLayout.gridLeft + (column + 0.5) * daysGridLayout.cellWidth;
        const centerYForCell = daysGridLayout.gridTop + (row + 0.5) * daysGridLayout.cellHeight;
        const deltaX = x - centerXForCell;
        const deltaY = y - centerYForCell;

        if (deltaX * deltaX + deltaY * deltaY > daysGridLayout.clockRadius * daysGridLayout.clockRadius) {
            return -1;
        }

        return dayIndex;
    }

    function getHoveredPeriodEvent() {
        const hoveredDayIndex = getHoveredDayIndex(p.mouseX, p.mouseY);

        if (hoveredDayIndex < 0) {
            return null;
        }

        const hoveredDayDate = ClockCommon.getLifeDateForDay(hoveredDayIndex + 1);
        const hoveredEvent = ClockCommon.getImportantDayEvent(hoveredDayDate);
        return ClockCommon.isSignificantPeriodEvent(hoveredEvent) ? hoveredEvent : null;
    }

    function getDayTooltipText(dayDateText, dayNumberText, importantEvent) {
        const baseLine = `${dayDateText} - Day ${dayNumberText}`;

        if (!importantEvent) {
            return baseLine;
        }

        if (ClockCommon.isSignificantPeriodEvent(importantEvent)) {
            const periodEndDateKey = ClockCommon.getEffectivePeriodEndDateKey(importantEvent);
            const periodDurationDays = ClockCommon.getPeriodDurationDays(importantEvent.date, periodEndDateKey);
            const isOngoingPeriod = !importantEvent.endDate;
            const periodDurationText = periodDurationDays === null
                ? `unknown duration${isOngoingPeriod ? ' (so far)' : ''}`
                : `${ClockCommon.formatNumber(periodDurationDays)} days${isOngoingPeriod ? ' (so far)' : ''}`;

            return `${baseLine}\n${importantEvent.description} for ${periodDurationText}`;
        }

        return `${baseLine}\n${importantEvent.description}`;
    }

    function calculateDaysGridLayout() {
        const columns = Math.max(1, Math.ceil(Math.sqrt((ClockCommon.DAYS_CLOCK_COUNT * p.width) / Math.max(1, p.height))));
        const rows = Math.ceil(ClockCommon.DAYS_CLOCK_COUNT / columns);
        const contentWidth = Math.max(1, p.width - DAYS_LAYOUT.gridMargin * 2);
        const contentTop = DAYS_LAYOUT.gridMargin + DAYS_LAYOUT.titleOffsetY;
        const contentHeight = Math.max(1, p.height - contentTop - DAYS_LAYOUT.gridMargin);
        const cellWidth = contentWidth / columns;
        const cellHeight = contentHeight / rows;
        const gridLeft = DAYS_LAYOUT.gridMargin;
        const gridTop = contentTop;
        const clockDiameter = Math.max(0, Math.min(cellWidth, cellHeight) * DAYS_LAYOUT.clockDiameterRatio - DAYS_LAYOUT.circleGapPx);
        const clockRadius = clockDiameter / 2;
        daysGridLayout = {
            columns,
            rows,
            cellWidth,
            cellHeight,
            gridLeft,
            gridTop,
            clockRadius
        };
    }

    function drawDayCell(target, i, completedDays, currentDayArcEnd, hoveredPeriodEvent) {
        const { columns, cellWidth, cellHeight, gridLeft, gridTop } = daysGridLayout;
        const column = i % columns;
        const row = Math.floor(i / columns);
        const x = gridLeft + (column + 0.5) * cellWidth;
        const y = gridTop + (row + 0.5) * cellHeight;
        const dayDate = ClockCommon.getLifeDateForDay(i + 1);
        const importantEvent = ClockCommon.getImportantDayEvent(dayDate);
        const isComplete = i < completedDays;
        const isPartial = i === completedDays && completedDays < ClockCommon.DAYS_CLOCK_COUNT;

        if (hoveredPeriodEvent && ClockCommon.isDateWithinEventPeriod(dayDate, hoveredPeriodEvent)) {
            ClockCommon.drawEventClock(target, x, y, daysGridLayout.clockRadius * 2,
                ClockCommon.getImportantDayColor(hoveredPeriodEvent), isPartial, currentDayArcEnd);
        } else if (importantEvent) {
            ClockCommon.drawEventClock(target, x, y, daysGridLayout.clockRadius * 2,
                ClockCommon.getImportantDayColor(importantEvent), isPartial, currentDayArcEnd);
        } else {
            ClockCommon.drawProgressClock(target, x, y, daysGridLayout.clockRadius * 2, {
                isComplete,
                isPartial,
                arcEnd: currentDayArcEnd,
                partialAlpha: ClockCommon.STYLE.LIFE_CLOCK_CELL_FILL_ALPHA
            });
        }
    }

    function rebuildDaysLayer(completedDays, currentDayArcEnd, hoveredPeriodEvent) {
        daysLayer = p.createGraphics(p.width, p.height);
        daysLayer.noStroke();

        for (let i = 0; i < ClockCommon.DAYS_CLOCK_COUNT; i += 1) {
            if (i !== completedDays) {
                drawDayCell(daysLayer, i, completedDays, currentDayArcEnd, hoveredPeriodEvent);
            }
        }
    }

    function drawDaysClocks(ukNow, milliseconds) {
        if (!daysGridLayout || !daysLayer) {
            calculateDaysGridLayout();
        }

        const elapsedDays = ClockCommon.getLifeDayElapsed(ukNow, milliseconds);
        const completedDays = Math.floor(elapsedDays);
        const currentDayProgress = elapsedDays - completedDays;
        const currentDayArcEnd = currentDayProgress * p.TWO_PI - p.HALF_PI;
        const hoveredPeriodEvent = getHoveredPeriodEvent();

        if (completedDays !== cachedCompletedDays || hoveredPeriodEvent !== cachedHoveredPeriod) {
            rebuildDaysLayer(completedDays, currentDayArcEnd, hoveredPeriodEvent);
            cachedCompletedDays = completedDays;
            cachedHoveredPeriod = hoveredPeriodEvent;
        }

        p.image(daysLayer, 0, 0);
        if (completedDays < ClockCommon.DAYS_CLOCK_COUNT) {
            drawDayCell(p, completedDays, completedDays, currentDayArcEnd, hoveredPeriodEvent);
        }
        return elapsedDays;
    }

    function drawDaysTooltip() {
        const hoveredDayIndex = getHoveredDayIndex(p.mouseX, p.mouseY);

        if (hoveredDayIndex < 0) {
            return;
        }

        const dayNumber = hoveredDayIndex + 1;
        const dayDate = ClockCommon.getLifeDateForDay(dayNumber);
        const importantEvent = ClockCommon.getImportantDayEvent(dayDate);
        const tooltipText = getDayTooltipText(
            ClockCommon.formatDayTooltipDate(dayDate),
            ClockCommon.formatNumber(dayNumber),
            importantEvent
        );
        const tooltipLines = tooltipText.split('\n');

        p.push();
        p.textSize(TOOLTIP.fontSize);
        p.textAlign(p.LEFT, p.TOP);

        const tooltipLineHeight = p.textAscent() + p.textDescent();
        const tooltipWidth = tooltipLines.reduce((maxWidth, line) => Math.max(maxWidth, p.textWidth(line)), 0) + TOOLTIP.paddingX * 2;
        const tooltipHeight = tooltipLineHeight * tooltipLines.length + TOOLTIP.paddingY * 2;
        const tooltipX = p.constrain(p.mouseX + TOOLTIP.offsetX, 0, p.width - tooltipWidth);
        const tooltipY = p.constrain(p.mouseY + TOOLTIP.offsetY, 0, p.height - tooltipHeight);

        p.noStroke();
        p.fill(0, TOOLTIP.fillAlpha);
        p.rect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, TOOLTIP.cornerRadius);
        p.fill(255);
        p.text(tooltipText, tooltipX + TOOLTIP.paddingX, tooltipY + TOOLTIP.paddingY);
        p.pop();
    }

    p.setup = () => {
        const size = getCanvasSize();
        p.createCanvas(size.width, size.height).parent('clock-days-canvas');
    };

    p.windowResized = () => {
        const size = getCanvasSize();
        p.resizeCanvas(size.width, size.height);
        daysGridLayout = null;
        daysLayer = null;
        cachedCompletedDays = -1;
        cachedHoveredPeriod = null;
    };

    p.draw = () => {
        const now = Date.now();
        const ukNow = ClockCommon.getUkNowParts(new Date(now));
        const milliseconds = now % 1000;

        p.clear();
        const elapsedDays = drawDaysClocks(ukNow, milliseconds);
        drawDaysTooltip();

        ClockCommon.drawSectionTitle(p, `${ClockCommon.getDaysCompletionPercentText(elapsedDays)}% complete`);
    };

    p.setup = ((setup) => () => {
        setup();
        p.frameRate(10);
        ClockCommon.setupVisibilityPause(p, 'clock-days-canvas');
    })(p.setup);
}, 'clock-days-canvas');
