//PDA GeoJSON
async function GetPDAGeoJSONData() {

    console.log("Fetching Forerunner GeoJSON Data");
    let geojsonResponse = await fetch("https://central-ap.hernandoclerk.org/forerunner/api/damage-assessment/2024-09-26");
    let geojsonData = await geojsonResponse.json();

    let houseIcon = (color) => L.divIcon({
        className: "custom-icon",
        html: `<div style="background-color: ${color}; border-radius: 50%; width: 10px; height: 10px; text-align: center; line-height: 20px;">&nbsp;</div>`,
        iconSize: [10, 10],
    });

    L.geoJSON(geojsonData, {
        pointToLayer: function (feature, latlng) {
            if (feature.properties.damage == 'Major') {
                color = 'red';
            } else if(feature.properties.damage == 'Minor'){
                color = 'orange';
            } else if(feature.properties.damage == 'Affected'){
                color = 'limegreen';
            }else{
                color = ' rgb(115, 1, 1)';
            }
            return L.marker(latlng, { icon: houseIcon(color) });
    }
    })
        .bindPopup(function (layer) {



        color = (layer.feature.properties.damage == 'Major') ? 'red' : 'orange';
        return `Address: ${layer.feature.properties.address}<br>
                 Form: ${layer.feature.properties.form}<br>
                 Description: ${layer.feature.properties.description}<br>
                 Damage Cause: ${layer.feature.properties.damage}<br>
                 Foundation: ${layer.feature.properties.foundation}<br>
                Type of Residence: ${layer.feature.properties.type_of_residence}<br>
                Owner/Renter: ${layer.feature.properties.owner_renter}<br>
                 Use of Structure: ${layer.feature.properties.structure_use}<br>
                 Type of Structure: ${layer.feature.properties.type_of_structure}<br>
                 Superstructure: ${layer.feature.properties.superstructure}<br>
                 Roofing: ${layer.feature.properties.roofing}<br>
                 Flooding: ${layer.feature.properties.flooded}<br>
                 Type of Damage: ${layer.feature.properties.type_of_damage}<br>
                 Water Intrusion: ${layer.feature.properties.water_intrusion}<br>
                 Est. Water Intrusion: ${layer.feature.properties.est_water_intrusion}<br>
                 Accessible: ${layer.feature.properties.accessible}<br>
                 Ext. Finish: ${layer.feature.properties.exterior_finish}<br>
                 Int. Finish: ${layer.feature.properties.interior_finish}<br>
                 Door/Windows: ${layer.feature.properties.doos_windows}<br>
                 Public URL: ${layer.feature.properties.public_url}<br>
                `;
    })

    .addTo(map);
        // console.log('Map updated');
}

// Initial call to update data
GetPDAGeoJSONData();

// Set interval to update data every minute (60000 milliseconds)
setInterval(GetPDAGeoJSONData, 30000);




//jQuery for the Filter button
// $('body').on("click", ".dropdown-menu", function (e) {
//     $(this).parent().is(".open") && e.stopPropagation();
// });

// $('.selectall').click(function() {
//     if ($(this).is(':checked')) {
//         $('.option').prop('checked', true);
//         var total = $('input[name="options[]"]:checked').length;
//         $(".dropdown-text").html('(' + total + ') Selected');
//         $(".select-text").html(' Deselect');
//     } else {
//         $('.option').prop('checked', false);
//         $(".dropdown-text").html('Filter');
//         $(".select-text").html(' Select');
//     }
// });

// $("input[type='checkbox'].justone").change(function(){
//     var a = $("input[type='checkbox'].justone");
//     if(a.length == a.filter(":checked").length){
//         $('.selectall').prop('checked', true);
//         $(".select-text").html(' Deselect');
//     }
//     else {
//         $('.selectall').prop('checked', false);
//         $(".select-text").html(' Select');
//     }
//   var total = $('input[name="options[]"]:checked').length;
//   $(".dropdown-text").html('(' + total + ') Filter Selected');
// });