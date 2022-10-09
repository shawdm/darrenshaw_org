const DATA_MISSED_OPPORTUNITIES = "/interactive/spotify/data/missed-opportunities.csv";
const DATA_ARTIST_HISTORY = "/interactive/spotify/data/artist-history.csv";
const DATA_TIME_OF_DAY = "/interactive/spotify/data/time-of-day-alldays-combined.csv";
const DATA_TIME_OF_DAY_YEARS = "/interactive/spotify/data/time-of-day-weekdays-years.csv";

function initJoyChart(){
    loadCsvData(DATA_ARTIST_HISTORY)
        .then(renderJoyChart)
}

function renderJoyChart(data){
    const chartWidth = document.getElementById('vis-spotify-joy').offsetWidth;
    const joyChartData = transformDataForJoyChart(data);

    const joyChart = JoyChart(joyChartData,{
        width: chartWidth,
        height: 600,
        marginTop: 50,
        marginBottom: 20,
        marginLeft: 0,
        marginRight: 0,
        overlap: 15,
        backgroundColour: "#222",
        dullColour: "#444",
        foregroundColour: "#ccc"
    });

    document.getElementById('vis-spotify-joy').append(joyChart);
}

function transformDataForJoyChart(artistHistoryData){
    const dates = artistHistoryData.meta.fields
        .filter(field => field != 'artist');

    const series = artistHistoryData.data
        .map(artisitHistory => {
            return {
                name: artisitHistory.artist,
                values: dates
                    .map(date => artisitHistory[date])
                    .map(value => parseInt(value))
            };
        }
    );

    const transformedData = {
        dates: dates.map(date => moment(date).toDate()),
        series: series
    };

    return transformedData;
}

function initMissedOpportunities(){
    loadCsvData(DATA_MISSED_OPPORTUNITIES)
        .then(renderMissedOpportunities)
}

function renderMissedOpportunities(data){
    const artists = data.data;

    const transformedArtists = artists.map(artist =>  {
        return {
            first_consistent_play: moment(artist.first_consistent_play).toDate(),
            first_play: moment(artist.first_play).toDate(),
            artist: artist.artist,
            days_lost: artist.days_lost
        }
    });

    transformedArtists.sort(function(a,b){
        return a.days_lost - b.days_lost;
    });

    const chartWidth = document.getElementById('vis-spotify-joy').offsetWidth;

    const missedOpportunitiesChart = MissedOpportunities(transformedArtists, {
        width: chartWidth,
        height: 600,
        marginTop: 25,
        marginLeft: 0,
        marginRight: 0,
        dullColour: "#444",
        foregroundColour: "#ccc"
    });

    document.getElementById('vis-spotify-missed').append(missedOpportunitiesChart);
}   

function initTimeOfDay(){
    loadCsvData(DATA_TIME_OF_DAY)
        .then(renderTimeOfDayChart)
}

function renderTimeOfDayChart(data){
    const chartWidth = document.getElementById('vis-spotify-time').offsetWidth;

    const timeOfDaychart = TimeOfDay(data, {
        width: chartWidth,
        height: 50,
        marginLeft: 0,
        marginRight: 0,
        foregroundColour: "#ccc",
        backgroundColour: "#222",
        dullColour: "#444"
    });

    document.getElementById('vis-spotify-time').append(timeOfDaychart);
}

function initTimeOfDayYears(){
    loadCsvData(DATA_TIME_OF_DAY_YEARS)
        .then(renderTimeOfDayYearsChart)
}

function renderTimeOfDayYearsChart(data){
    const chartWidth = document.getElementById('vis-spotify-time-years').offsetWidth;

    const timeOfDayYearsChart = TimeOfDay(data, {
        width: chartWidth,
        height: 650,
        marginLeft: 0,
        marginRight: 0,
        foregroundColour: "#ccc",
        backgroundColour: "#222",
        dullColour: "#444"
    });

    document.getElementById('vis-spotify-time-years').append(timeOfDayYearsChart);
}

function loadCsvData(url){
    return new Promise(function(complete, error) {
        Papa.parse(url, {
            download: true,
            header: true,
            skipEmptyLines: true,
            complete, 
            error
        });
      });
}

initJoyChart();
initMissedOpportunities();
initTimeOfDay();
initTimeOfDayYears();