function JoyChart(data, {
    marginTop = 0,
    marginRight = 0,
    marginBottom = 0,
    marginLeft = 0,
    width = 1000,
    height = 400,
    overlap = 5,
    backgroundColour = "#222",
    dullColour = "#444",
    foregroundColour = "#ccc"
} = {}) {

    const x = d3.scaleTime()
        .domain(d3.extent(data.dates))
        .range([marginLeft, width -  marginRight]);

    const y = d3.scalePoint()
        .domain(data.series.map(d => d.name))
        .range([marginTop, height - marginBottom]);

    const z = d3.scaleLinear()
        .domain([0, d3.max(data.series, d => d3.max(d.values))]).nice()
        .range([0, -overlap * y.step()]);

    const xAxis = g => g
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x)
            .ticks(width / 80)
            .tickSizeOuter(0));

    const area = d3.area()
        .curve(d3.curveBasis)
        .defined(d => !isNaN(d))
        .x((d, i) => x(data.dates[i]))
        .y0(0)
        .y1(d => z(d));

    const line = area.lineY1()

    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    svg.append("g")
        .call(xAxis);

    const group = svg.append("g")
        .selectAll("g")
        .data(data.series)
        .join("g")
            .attr("transform", d => `translate(0,${y(d.name) + 1})`);

    group.append("path")
        .attr("fill", backgroundColour)
        .attr("d", d => area(d.values));

    group.append("path")
        .attr("fill", "none")
        .attr("stroke", foregroundColour)
        .attr("stroke-width", "2")
        .attr("class", "artist-line")
        .attr("d", d => line(d.values))
        .attr("data-artist", d => d.name)
        .on("mouseover", function(event, element) {
            dullLines(d3.select(this));
            updateTooltip(
                event.offsetX, 
                event.offsetY, 
                d3.select(this).attr("data-artist")
            );
        })
        .on("mouseout", function() {
            d3.select(this).attr("stroke", backgroundColour);
            brightenLines();
            hideTooltip();
        });

    const tooltip = svg.append("g");

    const tooltipTextShadow = tooltip.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("text-anchor", "start")
        .attr("class", "tooltip-shadow");
    
    const tooltipText = tooltip.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("text-anchor", "start")
        .attr("class", "tooltip");

    const updateTooltip = function(x, y, artist){
        const tooltipMouseMargin = 10;
        const tooltipMinY = 15;
        let tooltipX = 0;
        let tooltipY = Math.max(y - tooltipMouseMargin, tooltipMinY);
        
        let tooltipXAnchor;

        if(x > svg.attr("width")/2){
            tooltipXAnchor = "end";
            tooltipX = x - tooltipMouseMargin;
        }
        else{
            tooltipXAnchor = "start";
            tooltipX = x + tooltipMouseMargin;
        }
        tooltip.attr("transform","translate("+tooltipX+","+tooltipY+")")
    
        tooltipText.attr("text-anchor", tooltipXAnchor)
        tooltipTextShadow.attr("text-anchor", tooltipXAnchor)
        tooltipText.text(artist);
        tooltipTextShadow.text(artist);

        tooltip.style("visibility", "visible");
    };

    const hideTooltip = function(){
        tooltip.style("visibility", "hidden");
    }

    const dullLines = function(exclude){
        group.selectAll(".artist-line")
            .attr("stroke", dullColour);
        exclude.attr("stroke", foregroundColour);
    };

    const brightenLines = function(){
        group.selectAll(".artist-line")
            .attr("stroke", foregroundColour);
    }

    return svg.node();
}


function MissedOpportunities(data, {
    width = 1000,
    height = 400,
    marginTop = 0,
    marginRight = 0,
    marginBottom = 0,
    marginLeft = 0,
    dullColour = "#444",
    foregroundColour = "#ccc"
} = {}) {

    const xAxisHeight = 20;

    const formatTooltipMessage = function(artist, daysLost){
      return `${artist}, days lost: ${daysLost}`;
    }

    const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    const y = d3.scaleBand()
      .domain(d3.range(data.length))
      .range([marginTop , height - (xAxisHeight+3)])
      .padding(0.2)

    const x = d3.scaleTime()
      .domain([d3.min(data, d => d.first_play), d3.max(data, d => d.first_consistent_play)])
      .range([marginLeft, width - marginRight]);

    const getRect = function(d, i){
      const el = d3.select(this);
      const sx = x(d.first_play);
      const sy = y(i);
      const w = x(d.first_consistent_play) - x(d.first_play);
    
      el
        .style("cursor", "pointer")
        .append("rect")
        .attr("class", "artist-line")
        .attr("data-artist", d => d.artist)
        .attr("data-dayslost", d => d.days_lost)
        .attr("x", sx)
        .attr("y", sy)
        .attr("height", y.bandwidth())
        .attr("width", w)
        .attr("fill", foregroundColour);
      }

      const axisBottom = d3.axisBottom(x)
        .ticks(width / 80)
        .tickSizeOuter(0);

      const groups = svg
        .selectAll("g")
        .data(data)
        .enter()
        .append("g")

      groups
        .each(getRect)
        .on("mouseover", function(d) {
          dullLines(d3.select(this).select("rect"));
          updateTooltip(
            d3.select(this).select("rect"),
            d3.select(this).select("rect").attr("data-artist"),
            d3.select(this).select("rect").attr("data-dayslost")
          );
        })
        .on("mouseleave", function(d) {
          brightenLines();
          hideTooltip();
        });
  
      svg
        .append("g")
        .attr("transform", `translate(0,${height - xAxisHeight})`)
        .call(axisBottom)
  
      const tooltip = svg.append("g");

      const tooltipTextShadow = tooltip.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("text-anchor", "start")
        .attr("class", "tooltip-shadow");
          
      const tooltipText = tooltip.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("text-anchor", "start")
        .attr("class", "tooltip");
    
      const updateTooltip = function(hoverRect, artist, daysLost){
        const tooltipMouseYMargin = 10;
        const tooltipMouseXMargin = 5;
        const tooltipMessage = formatTooltipMessage(artist, daysLost);
        const tooltipY = parseFloat(hoverRect.attr("y")) - tooltipMouseYMargin;
        let tooltipX = 0;
        let tooltipXAnchor;
    
        if(hoverRect.attr("x") > svg.attr("width")/2){
            tooltipXAnchor = "end";
            tooltipX = parseInt(hoverRect.attr("x")) + parseInt(hoverRect.attr("width")) - tooltipMouseXMargin;
        }
        else{
            tooltipXAnchor = "start";
            tooltipX = parseInt(hoverRect.attr("x")) + tooltipMouseXMargin;
        }
        tooltip.attr("transform",`translate(${tooltipX},${tooltipY})`)
        tooltipText.attr("text-anchor", tooltipXAnchor)
        tooltipTextShadow.attr("text-anchor", tooltipXAnchor)
        tooltipText.text(tooltipMessage);
        tooltipTextShadow.text(tooltipMessage);
        tooltip.style("visibility", "visible");
      };
      
      const hideTooltip = function(){
        tooltip.style("visibility", "hidden");
      }

      const dullLines = function(exclude){
        groups.selectAll(".artist-line")
          .attr("fill", dullColour);
        exclude.attr("fill", foregroundColour);
      };
    
      const brightenLines = function(){
          groups.selectAll(".artist-line")
            .attr("fill", foregroundColour);
      }

      return svg.node();
}


function TimeOfDay(data, {
    width = 1000,
    height = 400,
    foregroundColour = "#fff",
    backgroundColour = "#222",
    dullColour = "#444",
    marginLeft = 0,
    marginRight = 0
} = {}) {

    const xAxisHeight = 20;
    const padding = 5;

    const parseData = function(data){
        let parsedData = [];
        for(let i=0 ; i < data.length; i++){
            let year = data[i]["YEAR"];
            let keys = Object.keys(data[i]).filter(key => key != "YEAR");
            let values = keys.map(key => {
                return {
                    time: timeToSeconds(key),
                    plays: data[i][key],
                    year: year
                };
            });
            parsedData = parsedData.concat(values);
        }
        return parsedData;
    }

    const parseYears = function(data){
        let parsedYears = [];
        for(let i=0 ; i < data.length; i++){
            parsedYears.push(data[i]["YEAR"]);
        }
        return parsedYears;
    }

    const formatTime = function(time){
        let hour = Math.floor(time / 60);
        let minute = time % 60;
        return (`00${hour}`).slice(-2) + ":" + (`00${minute}`).slice(-2);
    }

    const formatTooltipMessage = function(year, time, plays){
        if(plays > 1){
            return `${plays} songs played at ${formatTime(time)}.`;
        }
        else if (plays == 1){
            return `${plays} song played at ${formatTime(time)}.`;
        }
        else{
            return `No songs played at ${formatTime(time)}.`;
        }
    }

    const timeToSeconds = function(time){
        const pattern = /^(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])$/;
        let match = time.match(pattern);
        if(match){
            return parseInt(match[1])*60 + parseInt(match[2]);
        }
        return false;
    }

    const years = parseYears(data.data);
    const values = parseData(data.data);
    
    const x = d3.scaleLinear()
        .domain([0,24*60])
        .range([marginLeft, width-marginRight]);

    const axisBottom = d3.axisBottom(x)
        .tickValues([6*60, 12*60, 18*60])
        .tickFormat(formatTime);

    const y = d3.scaleBand()
        .domain(years)
        .range([0, height])
        .padding(0.1);

    const calculateWidth = function(item, nextItem){
        if(nextItem && nextItem.year == item.year){
            return x(nextItem.time)-x(item.time);
        }
        else{
            return width - (x(item.time) +marginRight);
        }
    }

    const calculateOpacity = function(plays){
        return plays / d3.max(values, d => d.plays);
    }

    const getRect = function(d, i){
        const el = d3.select(this);
        const sx = x(d.time);
        const sy = y(d.year);
        const width = calculateWidth(d,values[i+1]);
        const opacity = calculateOpacity(d.plays);
      
        el
          .append("rect")
          .attr("class", "time-play")
          .attr("data-year", d => d.year)
          .attr("data-time", d => d.time)
          .attr("data-plays", d => d.plays)
          .attr("x", sx)
          .attr("y", sy)
          .attr("height", y.bandwidth())
          .attr("width", width)
          .attr("fill", foregroundColour)
          .attr("stroke", backgroundColour)
          .style("opacity", opacity)
          .on("mouseover", function(d) {
            highlightLine(d3.select(this));
            updateTooltip(
                d3.select(this),
                d3.select(this).attr("data-year"),
                d3.select(this).attr("data-time"),
                d3.select(this).attr("data-plays")
            );
          })
          .on("mouseleave", function(d) {
            dullLine(d3.select(this));
            hideTooltip();
          });
    }

    const getYearLabel = function(d, i){
        const el = d3.select(this);
        const sx = x(padding);
        const sy = y(d) + y.bandwidth()/2;

        el
            .append("text")
            .text(d)
            .attr("text-anchor", "start")
            .attr("dominant-baseline", "middle")
            .attr("class", "label-shadow")
            .attr("x", sx)
            .attr("y", sy);
        el
            .append("text")
            .text(d)
            .attr("text-anchor", "start")
            .attr("dominant-baseline", "middle")
            .attr("class", "label")
            .attr("x", sx)
            .attr("y", sy);
    }

    const svg = d3.create("svg")
        .attr("viewBox", [0, 0, width, height + xAxisHeight])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    const timePlays = svg
        .append("g")
        .attr("class", "time-plays");

    const timePlayGroups = timePlays
      .selectAll("g")
      .data(values)
      .enter()
      .append("g")

    timePlayGroups
      .each(getRect);

    const labels = svg
        .append("g")
        .attr("class", "year-labels")

    if(years && years.length > 1){
        const yearGroups = labels
            .selectAll("g")
            .data(years)
            .enter()
            .append("g")

        yearGroups
            .each(getYearLabel);
    }

    const tooltip = svg
        .append("g")
        .attr("class", "tooltip");

    const tooltipTextShadow = tooltip.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("dominant-baseline", "middle")
        .attr("text-anchor", "start")
        .attr("class", "tooltip-shadow");
        
    const tooltipText = tooltip.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("dominant-baseline", "middle")
        .attr("text-anchor", "start")
        .attr("class", "tooltip");

    const updateTooltip = function(element, year, time, plays){
        const tooltipMouseMargin = 30;
        const graphWidth = x.range()[1]-x.range()[0];
        const tooltipMessage = formatTooltipMessage(year, time, plays);
        
        let tooltipX = parseInt(element.attr("x"));
        let tooltipY = parseInt(element.attr("y")) + (y.bandwidth())/2;
        let tooltipXAnchor;
        if(tooltipX > graphWidth/2){
            tooltipXAnchor = "end";
            tooltipX = tooltipX - tooltipMouseMargin;
        }
        else{
            tooltipXAnchor = "start";
            tooltipX = tooltipX + tooltipMouseMargin;
        }
       
        tooltipText.attr("text-anchor", tooltipXAnchor)
        tooltipTextShadow.attr("text-anchor", tooltipXAnchor)
        tooltipText.text(tooltipMessage);
        tooltipTextShadow.text(tooltipMessage);
        tooltip.style("visibility", "visible");
        tooltip.attr("transform","translate("+tooltipX+","+tooltipY+")")
    };

    const highlightLine = function(line){
        // no stroke makes the fill appear bigger
        line.attr("stroke", "none");
    };
    
    const dullLine = function(line){
        line.attr("stroke", backgroundColour);
    }    
          
    const hideTooltip = function(){
        tooltip.style("visibility", "hidden");
    }

    svg
        .append("g")
        .attr("transform", (d,i)=>`translate(${0} ${height})`)
        .call(axisBottom)

    return svg.node();
}
