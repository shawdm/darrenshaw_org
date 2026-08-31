new p5((p) => {
    const DAYS_LAYOUT = {
        gridMargin: 24,
        titleOffsetY: 0,
        clockDiameterRatio: 1,
        circleGapPx: 0.5,
        pulsePeriodSeconds: 3,
        pulseBaseExpansionPx: 2,
        pulseExpansionPx: 3
    };

    const TOOLTIP = {
        offsetX: 14,
        offsetY: 14,
        paddingX: 8,
        paddingTop: 6,
        paddingBottom: 0,
        fontSize: 12,
        cornerRadius: 4,
        fillAlpha: 220
    };

    let daysGridLayout = null;
    let daysLayer = null;
    let cachedCompletedDays = -1;
    let cachedHoveredPeriod = null;
    const dayMetadataCache = [];

    function getDayMetadata(dayIndex) {
        if (!dayMetadataCache[dayIndex]) {
            const date = ClockCommon.getLifeDateForDay(dayIndex + 1);
            dayMetadataCache[dayIndex] = {
                date,
                importantEvent: ClockCommon.getImportantDayEvent(date)
            };
        }

        return dayMetadataCache[dayIndex];
    }

    function getHoveredDayIndex(x, y) {
        if (!daysGridLayout || !Number.isFinite(x) || !Number.isFinite(y)) {
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

    function getHoveredPeriodEvent(hoveredDayIndex) {
        if (hoveredDayIndex < 0) {
            return null;
        }

        const hoveredEvent = getDayMetadata(hoveredDayIndex).importantEvent;
        return ClockCommon.isSignificantPeriodEvent(hoveredEvent) ? hoveredEvent : null;
    }

    function getDayTooltipText(dayDateText, dayNumberText, importantEvent, completionText) {
        const baseLine = `${dayDateText} - Day ${dayNumberText}`;
        const completionLine = completionText ? `\nLife ${completionText}% complete` : '';

        if (!importantEvent) {
            return `${baseLine}${completionLine}`;
        }

        if (ClockCommon.isSignificantPeriodEvent(importantEvent)) {
            const periodEndDateKey = ClockCommon.getEffectivePeriodEndDateKey(importantEvent);
            const periodDurationDays = ClockCommon.getPeriodDurationDays(importantEvent.date, periodEndDateKey);
            const isOngoingPeriod = !importantEvent.endDate;
            const periodDurationText = periodDurationDays === null
                ? `unknown duration${isOngoingPeriod ? ' (so far)' : ''}`
                : `${ClockCommon.formatNumber(periodDurationDays)} days${isOngoingPeriod ? ' (so far)' : ''}`;

            return `${baseLine}${completionLine}\n${importantEvent.description} for ${periodDurationText}`;
        }

        return `${baseLine}${completionLine}\n${importantEvent.description}`;
    }

    function calculateDaysGridLayout() {
        const gridLayout = ClockCommon.calculateGridLayout(
            p.width,
            p.height,
            ClockCommon.DAYS_CLOCK_COUNT,
            DAYS_LAYOUT.gridMargin,
            DAYS_LAYOUT.titleOffsetY
        );
        const { cellWidth, cellHeight } = gridLayout;
        const clockDiameter = Math.max(0, Math.min(cellWidth, cellHeight) * DAYS_LAYOUT.clockDiameterRatio - DAYS_LAYOUT.circleGapPx);
        const clockRadius = clockDiameter / 2;
        daysGridLayout = {
            ...gridLayout,
            clockRadius
        };
    }

    function drawDayCell(target, i, completedDays, currentDayArcEnd, hoveredPeriodEvent) {
        const { columns, cellWidth, cellHeight, gridLeft, gridTop } = daysGridLayout;
        const column = i % columns;
        const row = Math.floor(i / columns);
        const x = gridLeft + (column + 0.5) * cellWidth;
        const y = gridTop + (row + 0.5) * cellHeight;
        const { date: dayDate, importantEvent } = getDayMetadata(i);
        const isComplete = i < completedDays;
        const isPartial = i === completedDays && completedDays < ClockCommon.DAYS_CLOCK_COUNT;

        if (isPartial) {
            ClockCommon.drawProgressClock(target, x, y, daysGridLayout.clockRadius * 2, {
                isComplete: false,
                isPartial: false,
                arcEnd: currentDayArcEnd,
                partialAlpha: ClockCommon.STYLE.LIFE_CLOCK_CELL_FILL_ALPHA
            });
        } else if (hoveredPeriodEvent && ClockCommon.isDateWithinEventPeriod(dayDate, hoveredPeriodEvent)) {
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
        ClockCommon.removeGraphicsLayer(daysLayer);
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
        const hoveredDayIndex = getHoveredDayIndex(p.mouseX, p.mouseY);
        const hoveredPeriodEvent = getHoveredPeriodEvent(hoveredDayIndex);

        if (completedDays !== cachedCompletedDays || hoveredPeriodEvent !== cachedHoveredPeriod) {
            rebuildDaysLayer(completedDays, currentDayArcEnd, hoveredPeriodEvent);
            cachedCompletedDays = completedDays;
            cachedHoveredPeriod = hoveredPeriodEvent;
        }

        p.image(daysLayer, 0, 0);
        if (completedDays < ClockCommon.DAYS_CLOCK_COUNT) {
            drawDayCell(p, completedDays, completedDays, currentDayArcEnd, hoveredPeriodEvent);
        }
        return { elapsedDays, hoveredDayIndex };
    }

    function drawDaysTooltip(hoveredDayIndex, elapsedDays) {
        if (hoveredDayIndex < 0) {
            return;
        }

        const dayNumber = hoveredDayIndex + 1;
        const { date: dayDate, importantEvent } = getDayMetadata(hoveredDayIndex);
        const currentDayIndex = Math.floor(elapsedDays);
        const completionText = hoveredDayIndex === currentDayIndex
            ? ClockCommon.getDaysCompletionPercentText(elapsedDays)
            : null;
        const tooltipText = getDayTooltipText(
            ClockCommon.formatDayTooltipDate(dayDate),
            ClockCommon.formatNumber(dayNumber),
            importantEvent,
            completionText
        );
        const tooltipLines = tooltipText.split('\n');

        p.push();
        p.textSize(TOOLTIP.fontSize);
        p.textAlign(p.LEFT, p.TOP);

        const tooltipLineHeight = p.textAscent() + p.textDescent();
        const tooltipWidth = tooltipLines.reduce((maxWidth, line) => Math.max(maxWidth, p.textWidth(line)), 0) + TOOLTIP.paddingX * 2;
        const tooltipHeight = tooltipLineHeight * tooltipLines.length + TOOLTIP.paddingTop + TOOLTIP.paddingBottom;
        const tooltipX = p.constrain(p.mouseX + TOOLTIP.offsetX, 0, p.width - tooltipWidth);
        const tooltipY = p.constrain(p.mouseY + TOOLTIP.offsetY, 0, p.height - tooltipHeight);

        p.noStroke();
        p.fill(0, TOOLTIP.fillAlpha);
        p.rect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, TOOLTIP.cornerRadius);
        p.fill(255);
        p.text(tooltipText, tooltipX + TOOLTIP.paddingX, tooltipY + TOOLTIP.paddingTop);
        p.pop();
    }

    function drawCurrentDayPulse(elapsedDays) {
        const currentDayIndex = Math.floor(elapsedDays);
        if (currentDayIndex >= ClockCommon.DAYS_CLOCK_COUNT || !daysGridLayout) {
            return;
        }

        const { columns, cellWidth, cellHeight, gridLeft, gridTop } = daysGridLayout;
        const column = currentDayIndex % columns;
        const row = Math.floor(currentDayIndex / columns);
        const x = gridLeft + (column + 0.5) * cellWidth;
        const y = gridTop + (row + 0.5) * cellHeight;
        const pulse = (Math.sin((Date.now() / 1000) * Math.PI * 2 / DAYS_LAYOUT.pulsePeriodSeconds) + 1) / 2;
        const diameter = daysGridLayout.clockRadius * 2
            + DAYS_LAYOUT.pulseBaseExpansionPx
            + pulse * DAYS_LAYOUT.pulseExpansionPx;

        p.push();
        p.noFill();
        p.stroke(0, 80 + pulse * 120);
        p.strokeWeight(2);
        p.circle(x, y, diameter);
        p.pop();
    }

    p.setup = () => {
        const size = ClockCommon.getCanvasSize(p, 'clock-days-canvas');
        p.createCanvas(size.width, size.height).parent('clock-days-canvas');
    };

    function resetDaysLayer() {
        daysGridLayout = null;
        ClockCommon.removeGraphicsLayer(daysLayer);
        daysLayer = null;
        cachedCompletedDays = -1;
        cachedHoveredPeriod = null;
    }

    p.windowResized = () => {
        ClockCommon.scheduleCanvasResize(p, 'clock-days-canvas', resetDaysLayer);
    };

    p.draw = () => {
        if (!ClockCommon.isCanvasVisible(p)) {
            return;
        }

        const now = Date.now();
        const ukNow = ClockCommon.getUkNowParts(new Date(now));
        const milliseconds = now % 1000;

        p.clear();
        const { elapsedDays, hoveredDayIndex } = drawDaysClocks(ukNow, milliseconds);
        drawCurrentDayPulse(elapsedDays);
        drawDaysTooltip(hoveredDayIndex, elapsedDays);
    };

    p.setup = ((setup) => () => {
        setup();
        p.frameRate(30);
        ClockCommon.setupVisibilityPause(p, 'clock-days-canvas');
    })(p.setup);
}, 'clock-days-canvas');
