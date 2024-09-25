

//Filter Button
let filterBtn = document.getElementById('show_pda');
let showPDA = filterBtn.checked;
console.log('Showing PDA: ', filterBtn);

filterBtn.onchange = () => {
    updateWeatherData();
}

// Your WeatherFlow API token
var apiToken = "42845b2e-4af9-4843-8139-ea3a1e3a8efb";
var lightningToken = "0d2e0ba1-bd36-41f2-bf5a-742e521e6751";

// WeatherFlow Tempest Lightning API URL
var lightningApiUrl = "https://swd.weatherflow.com/swd/rest/lightning?lat=28.554899&lon=-82.387863&radius=33000&minutes_offset=60&api_key=" + lightningToken;

function degToCompass(num) {
    var val = Math.floor(num / 22.5 + 0.5);
    var arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    return arr[val % 16];
}

// Function to create a custom icon based on wind direction and speed
function createWindIcon(direction, speed) {
    if (typeof speed === "undefined") {
        return L.divIcon({
            className: "custom-icon",
            html: `<div>x</div>`,
            iconSize: [40, 40],
        });
    } else {
        var colorClass = "";
        if (speed < 20) {
            colorClass = "green";
        } else if (speed >= 20 && speed < 30) {
            colorClass = "yellow";
        } else {
            colorClass = "red";
        }

        return L.divIcon({
            className: `custom-arrow-icon ${colorClass}`,
            html: `<div style="transform: rotate(${direction}deg);">&#x27A4;</div>`,
            iconSize: [40, 40],
        });
    }
}

// Function to create a lightning icon (yellow circle)
function createLightningIcon() {
    return L.divIcon({
        className: "custom-icon",
        html: `<div style="background-color: yellow; border-radius: 50%; width: 10px; height: 10px; text-align: center; line-height: 20px;">&nbsp;</div>`,
        iconSize: [10, 10],
    });
}

// Function to fetch and update lightning data
function updateLightningData() {
    fetch(lightningApiUrl)
        .then(response => response.json())
        .then(data => {
            // Remove existing lightning markers before adding updated ones
            map.eachLayer(layer => {
                if (layer instanceof L.Marker && layer.options.icon && layer.options.icon.options.className === "custom-icon") {
                    map.removeLayer(layer);
                }
            });

            // Iterate through the lightning strikes and add markers to the map
            data.strikes.forEach(strike => {
                const marker = L.marker([strike.lat, strike.lon], { icon: createLightningIcon() }).addTo(map);
                // No popup for lightning markers
            });
        })
        .catch(error => {
            console.error("Error fetching lightning data:", error);
        });
}

//PDA GeoJSON
async function GetPDAGeoJSONData() {

    if(!filterBtn.checked){
        return;
    }

    console.log("Fetching Forerunner GeoJSON Data");
    let geojsonResponse = await fetch("https://central-ap.hernandoclerk.org/forerunner/api/damage-assessment");
    let geojsonData = await geojsonResponse.json();

    // let houseIcon = L.divIcon({
    // 	// iconUrl: "fire.png",
    // 	iconSize: [10, 10],
    // 	iconAnchor: [10, 94],
    // 	popupAnchor: [-3, -76],
    // 	// shadowUrl: "fire.png",
    // 	shadowSize: [68, 95],
    // 	shadowAnchor: [22, 94],
    // });

    let houseIcon = L.divIcon({
        className: "custom-icon",
        html: `<div style="background-color: orange; border-radius: 50%; width: 10px; height: 10px; text-align: center; line-height: 20px;">&nbsp;</div>`,
        iconSize: [10, 10],
    });
    
    L.geoJSON(geojsonData, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, { icon: houseIcon });
        }
    })
        .bindPopup(function (layer) {
            return `Address: ${layer.feature.properties.street}<br>
                 Damage Cause: ${layer.feature.properties.damage_cause}<br>
                 Foundation: ${layer.feature.properties.foundation}<br>
                 Superstructure: ${layer.feature.properties.superstructure}<br>
                 Roofing: ${layer.feature.properties.roofing}<br>
                 Ext. Finish: ${layer.feature.properties.exterior_finish}<br>
                 Int. Finish: ${layer.feature.properties.interior_finish}<br>
                 Door/Windows: ${layer.feature.properties.door_windows}<br>
                 Remarks: ${layer.feature.properties.remarks}<br>
                `;
        })

        .addTo(map);
        // console.log('Map updated');
}

// Function to fetch and update station data
function updateWeatherData() {
    fetch(`https://swd.weatherflow.com/swd/rest/stations?token=${apiToken}`)
        .then(response => response.json())
        .then(data => {

            GetPDAGeoJSONData();

            // Remove existing markers before adding updated ones
            map.eachLayer(layer => {
                if (layer instanceof L.Marker) {
                    map.removeLayer(layer);
                }
            });

            GetPDAGeoJSONData();

            // Iterate through the stations and add markers to the map
            data.stations.forEach(station => {
                // Fetch observation data for each station
                fetch(`https://swd.weatherflow.com/swd/rest/observations/station/${station.station_id}?bucket=1&units_temp=f&units_wind=mph&units_pressure=mb&units_precip=in&units_distance=mi&token=${apiToken}`)
                    .then(response => response.json())
                    .then(observationData => {

                        console.log('Fetching WeatherFlow Data for Station ID: ', station.station_id);

                        if(observationData.obs.length > 0){
                            const observation = observationData.obs[0];
                            const windAvg = Math.round(observation.wind_avg ?? 0 * 2.23);
                            const windGust = Math.round(observation.wind_gust * 2.23);
                            const windDirection = observation.wind_direction;
                            const timestamp = observation.timestamp;
                            const reportInterval = observation.report_interval;
                            const airTemp = Math.round((observation.air_temperature * 9) / 5 + 32);
                            const windLull = Math.round(observation.wind_lull * 2.23);
                            const stationPressure = observation.station_pressure;
                            const seaLevelPressure = observation.sea_level_pressure;
                            const rh = observation.relative_humidity;
                            const uv = observation.uv;
                            const solarRadiation = observation.solar_radiation;
                            const precipAccumulation = (observation.precip / 25.4).toFixed(2);
                            const localDayPrecipAccumulation = (observation.precip_accum_local_day / 25.4).toFixed(2);
                            const precipType = observation.precip_type;
                            const strikeCount = observation.lightning_strike_count;
                            const strikeDistance = observation.lightning_strike_last_distance;
                            const airTempTodayHigh = observation.air_temp_today_high;
                            const airTempTodayLow = observation.air_temp_today_low;
                            const airTempYesterdayHigh = observation.air_temp_yesterday_high;
                            const airTempYesterdayLow = observation.air_temp_yesterday_low;
                            const seaLevelPressureTodayHigh = observation.sea_level_pressure_today_high;
                            const seaLevelPressureTodayLow = observation.sea_level_pressure_today_low;
                            const humidityTodayHigh = observation.humidity_today_high;
                            const humidityTodayLow = observation.humidity_today_low;
                            const windCardinal = degToCompass(observation.wind_direction);

                            // Create a marker with a label containing the wind speed and gust strength
                            const windLabel = L.divIcon({
                                className: "wind-label",
                                html: `<div><b>${station.name}:<br> ${windAvg}g${windGust} ${windCardinal}</b></div>`,
                                iconSize: [150, 140],
                                popupAnchor: [0, -30],
                            });

                            // Create marker with popup containing all observation data
                            const marker = L.marker([station.latitude, station.longitude], { icon: createWindIcon(windDirection - 90, windAvg) }).addTo(map);

                            // Add wind speed label to the map
                            L.marker([station.latitude, station.longitude], { icon: windLabel })
                                .bindPopup(
                                    `
                                        <b>${station.name} | ${station.station_id}</b><br>
                                        Air Temperature: ${airTemp} °F<br>
                                        Wind Lull: ${windLull} mph ${windCardinal}<br>
                                        Wind Average: ${windAvg} mph<br>
                                        Wind Gust: ${windGust} mph<br>
                                        Wind Direction: ${windDirection}°<br>
                                        Station Pressure: ${stationPressure} mb<br>
                                        Sea Level Pressure: ${seaLevelPressure} mb<br>
                                        Relative Humidity: ${rh}%<br>
                                        UV Index: ${uv}<br>
                                        Solar Radiation: ${solarRadiation} W/m²<br>
                                        Precipitation Accumulation: ${precipAccumulation} in<br>
                                        Local Day Precipitation Accumulation: ${localDayPrecipAccumulation} in<br>
                                        Lightning Strikes Count: ${strikeCount}<br>
                                        Lightning Strikes Distance: ${strikeDistance}<br>
                                    `
                                )
                                .addTo(map);

                            //EOC

                            const EOCLabel = L.divIcon({
                                className: "wind-label",
                                html: `<div><b>EOC</b></div>`,
                                iconSize: [100, 120],
                                popupAnchor: [0, -30],
                            });

                            var EOCmarker = L.marker([28.54752, -82.421412]).addTo(map);

                            //Damage Assessment
                            const HouseLabel = L.divIcon({
                                className: "custom-icon",
                                html: `<div style="color: white; border-radius: 50%; width: 10px; height: 10px; text-align: center; line-height: 20px;">
                                    <i class='bx bxs-building'></i></div>`,
                                iconSize: [100, 100],
                            });
                            //Courthouse
                            L.marker([28.55698845950199, -82.38642536699768], { icon: HouseLabel }).addTo(map);
                        }
                        
                    })
                    .catch(error => {
                        console.error("Error fetching observation data:", error);
                    }).finally(() => {
                        
                    });

                    
                    
            });

            
            
            // Update lightning data after weather data
            updateLightningData();
           
        })
        .catch(error => {
            console.error("Error fetching weather station data:", error);
        });

    
}

// Initial call to update data
updateWeatherData();

// Set interval to update data every minute (60000 milliseconds)
setInterval(updateWeatherData, 10000);




//jQuery for the Filter button
$('body').on("click", ".dropdown-menu", function (e) {
    $(this).parent().is(".open") && e.stopPropagation();
});

$('.selectall').click(function() {
    if ($(this).is(':checked')) {
        $('.option').prop('checked', true);
        var total = $('input[name="options[]"]:checked').length;
        $(".dropdown-text").html('(' + total + ') Selected');
        $(".select-text").html(' Deselect');
    } else {
        $('.option').prop('checked', false);
        $(".dropdown-text").html('Filter');
        $(".select-text").html(' Select');
    }
});

$("input[type='checkbox'].justone").change(function(){
    var a = $("input[type='checkbox'].justone");
    if(a.length == a.filter(":checked").length){
        $('.selectall').prop('checked', true);
        $(".select-text").html(' Deselect');
    }
    else {
        $('.selectall').prop('checked', false);
        $(".select-text").html(' Select');
    }
  var total = $('input[name="options[]"]:checked').length;
  $(".dropdown-text").html('(' + total + ') Filter Selected');
});