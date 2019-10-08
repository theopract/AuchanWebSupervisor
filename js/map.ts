import { Map } from './modules/google_maps';
import "@babel/polyfill"

const SHOPLIST_URL = '/api/shopslist/'

const oneDayInMilliseconds = 1000 * 60 * 60 * 24;

const mapStyles = [
  {
    featureType: "administrative.country",
    elementType: "geometry.stroke",
    stylers: [
      {
        color: "#000000"
      },
      {
        visibility: "on"
      },
      {
        weight: 2
      }
    ]
  },
];
const RUSSIA_CENTER = { lat: 48.3181598, lng: 60.3837915 };
const MOSCOW_CENTER = { lat: 55.755826, lng: 37.6172999 };



const russiaMapOptions = {
  center: RUSSIA_CENTER,
  zoom: 6,
  disableDefaultUI: true,
  styles: mapStyles
}
const moscowMapOptions = {
  center: MOSCOW_CENTER,
  zoom: 11, 
  disableDefaultUI: true,
  styles: Object.assign(mapStyles, { featureType: "administrative.province"})
}

let sites = [];

const elementOnlineSites = document.getElementById('sites-online');
const elementOfflineSites = document.getElementById('sites-offline');

let numberOfOnlineSites = 0, numberOfOfflineSites = 0;

async function getSitesData(url) {
  const sites = await fetch(url)
  .then(res => res.json())
  .then(data => data.map(({nameRu: name, location, ip, salesArea, status}) => {
    const [lat, lng] = location.split(',').map(el => Number(el));
    return {
      name,
      lat,
      lng,
      ip,
      salesArea,
      status
    }
  }));
  return sites;
}

function updateAvailabilityInfo(sites) {
  numberOfOnlineSites = 0;
  numberOfOfflineSites = 0;

  sites.forEach(({ status }) => {
    status === 'online' ? numberOfOnlineSites++ : numberOfOfflineSites++
  })
  

  elementOnlineSites.innerText = numberOfOnlineSites.toString();
  elementOfflineSites.innerText = numberOfOfflineSites.toString();
}

function onLoad() {
  let russiaElement = document.getElementById('map_russia');
  let moscowElement = document.getElementById('map_moscow');
  
  Map.loadGoogleMapsApi().then(async function(googleMaps) {
    const russiaMap = Map.createMap(googleMaps, russiaElement, russiaMapOptions);
    const moscowMap = Map.createMap(googleMaps, moscowElement, moscowMapOptions);
        
    sites = await getSitesData(SHOPLIST_URL);

    updateAvailabilityInfo(sites);

    Map.drawMarkers(sites, russiaMap);
    Map.drawMarkers(sites, moscowMap);

    setInterval(async () => {
      console.log(`Updating site's information...`)
      sites = await getSitesData(SHOPLIST_URL);
      updateAvailabilityInfo(sites);
      Map.clearMarkers();
      Map.drawMarkers(sites, russiaMap);
      Map.drawMarkers(sites, moscowMap);
      console.log(`Updated finished successfully!`);
    }, oneDayInMilliseconds);

  }).catch(err => console.log(err));
}


document.addEventListener("DOMContentLoaded", onLoad);
