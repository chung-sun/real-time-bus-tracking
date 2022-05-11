// Add your own access token
mapboxgl.accessToken = 'pk.eyJ1IjoiY2h1bmdzdW4iLCJhIjoiY2wyd25hZDViMDMwbjNqcGh1cmZubThwMSJ9.LlIZ-Yk75SmAS5tpGSdgEA';
let markerObjects = [];
let marker;

async function run(){
  // get bus data    
const locations = await getBusLocations();
console.log(new Date());
console.log(locations);

// marker(locations);
locations.forEach(function (location, i) {

  const busInService = markerObjects.find(element => {
    return element.id === location.id;
  });
  
  if (busInService) {
    busInService.obj.setLngLat([location.attributes.longitude, location.attributes.latitude]);
    busInService.obj.setPopup(new mapboxgl.Popup().setHTML(`
      <h1>Bus: ${location.id.toUpperCase()}</h1>
      <h2>Route: ${location.attributes.direction_id === 0 ? 'North Bound' : 'South Bound'}</h2>
      <h3>To Station: ${location.relationships.stop.data === null ? 'No Info' : stationName(location)}</h3>
      <h3>Seats: ${location.attributes.occupancy_status === null ? 'No Seat Info' : location.attributes.occupancy_status.replace(/_/g, ' ')}</h3>`))
      .addTo(map);
  } else {
    pinMarker(location);
  }
});

// timer to loop over based on the time
setTimeout(run, 60000);
}

// Request bus data from MBTA on route 1
async function getBusLocations(){
const url = 'https://api-v3.mbta.com/vehicles?filter[route]=1&include=trip';
const response = await fetch(url);
const json     = await response.json();
return json.data;
}

let map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [-71.104081, 42.365554],
  zoom: 12,
  });

let pinMarker = location => {
  
  marker = new mapboxgl.Marker({
    color: '#ffc72c',
    
  }).setLngLat([location.attributes.longitude, location.attributes.latitude])
    .setPopup(new mapboxgl.Popup().setHTML(`
      <h1>Bus: ${location.id.toUpperCase()}</h1>
      <h2>Route: ${location.attributes.direction_id === 0 ? 'North Bound' : 'South Bound'}</h2>
      <h3>To Station: ${location.relationships.stop.data === null ? 'No Info' : stationName(location)}</h3>
      <h3>Seats: ${location.attributes.occupancy_status === null ? 'No Seat Info' : location.attributes.occupancy_status.replace(/_/g, ' ')}</h3>`))
    .addTo(map);

  markerObjects.push({
    id: location.id,
    obj: marker,
  });
    
};

// get the station name based on stop.data.id
function stationName (location) {
  const result = busLine.find(el => el.stop == location.relationships.stop.data.id);
  if (result) {
    return result.station;
  } else {
    return 'No Info';
  }
  
};

run();