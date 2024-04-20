import { availableMaps, getMapData } from "../data/availableMaps.js";
import { prettifyName, getUrlParams, changeUrlParams } from "./utils.js";

// If we're adding more maps, leave this as true
const editMode = true;

if (editMode && JSON.parse(localStorage.getItem("mapNamesWithCoords")) === null) 
  localStorage.setItem("mapNamesWithCoords", JSON.stringify([]));

$(document).ready(function () {
  if (editMode) {
    $('#readd').css('display', 'flex');
    $('#search').css('display', 'none');
    $('#select-map').css('display', 'none');
  }
});

var selectedMap;
var mapNamesWithCoords;
let lastSelectedMap = undefined;
let myCurrentPosition = undefined;
let innerLayer = false;
var lastMapFromDesktopApp;
var isOnDesktopApp;

var marker = L.icon({
  iconUrl: './assets/images/marker.png',
  iconSize: [80, 81],
  iconAnchor: [40, 80],
  popupAnchor: [10, -50]
});

var myLocationIcon = L.icon({
  iconUrl: './assets/images/mypos.png',
  iconSize: [80, 81],
  iconAnchor: [40, 70],
  popupAnchor: [0, -60]
});

// Initialize the map
const map = L.map('map', {
  maxBounds: [
    [-90, -180],
    [90, 180]
  ],
  center: [51.50048998936459, -0.08522987365722658],
  doubleClickZoom: false,
  scrollWheelZoom: false, // disable original zoom function
}).setView([51.50048998936459, -0.08522987365722658], 15);

var transparentIcon = L.icon({
  iconUrl: './assets/images/node.png',
  iconSize: [0, 0],
  iconAnchor: [0, 0]
});

var imageBounds = [[51.49, -0.11], [51.51, -0.06]];

// Event listener for mouse click
map.on('click', function (e) {
  // e.latlng contains the coordinates where the click occurred
  const lat = e.latlng.lat;
  const lng = e.latlng.lng;
  const currentTime = new Date().getTime();
  const lastClickTime = $(this).data('last-click-time');

  if (lastClickTime && (currentTime - lastClickTime) < 300) {
    if (myCurrentPosition !== undefined) {
      map.removeLayer(myCurrentPosition);
    }

    const currentPositionMapMarker = L.marker([lat, lng], { icon: window.isOnDesktopApp ? marker : myLocationIcon }).addTo(map)
      .bindPopup("You are here");

    myCurrentPosition = currentPositionMapMarker;

    const newURL = `${window.location.href.split('?')[0]}?map=${selectedMap}&x=${lat}&y=${lng}&inner=${innerLayer}`;
    changeUrlParams(newURL);

    // Part used on edit mode
    if (editMode) {
      L.marker([lat, lng]).addTo(map)
        .bindPopup(map.name);

      console.log(`x: ${lat} y: ${lng}`)

      console.log("x: " + lat + ", y: " + lng);

      const name = $('#placename').val();

      $('#copy').val(`{ name: "${name.toUpperCase()}", x: ${lat}, y: ${lng} }`);

      const allMaps = JSON.parse(localStorage.getItem('mapNamesWithCoords'));
      let newArray = [...allMaps];
      if (!newArray.includes(map => map.name.toLowerCase()) && name !== undefined && name !== "") {
        newArray.push({ name: name.toUpperCase(), x: lat, y: lng });
        const newMapValues = JSON.stringify(newArray);
        localStorage.setItem('mapNamesWithCoords', newMapValues);
        mapNamesWithCoords = newMapValues;

        $('#placename').removeData();

        $("#search").val("");
      } else {
        alert('já existe');
      }
    }
  }
  $(this).data('last-click-time', currentTime);
});

let geocoder = L.Control.geocoder().addTo(map);

// To make it easier to search
$(document).on("keypress", function (event) {
  $('#search').focus();
});

// Wait for the document to be ready
$(document).ready(function () {
  // gets the url
  var params = getUrlParams();
  const xIsNumber = !isNaN(Number(params.x)) && params.hasOwnProperty('x');
  const yIsNumber = !isNaN(Number(params.y)) && params.hasOwnProperty('y');
  const isInner = params.hasOwnProperty('inner');
  const hasSelectedMap = params.hasOwnProperty('map');

  // makes the selection of the current map
  selectedMap = hasSelectedMap ? params.map.toLowerCase() : 'main';

  var imageBounds = [[51.49, -0.11], [51.51, -0.06]];
  var imageOverlay = L.imageOverlay(getMapData(selectedMap)?.imgOverlayBase, imageBounds);

  imageOverlay.addTo(map);

  mapNamesWithCoords = editMode ? JSON.parse(localStorage.getItem('mapNamesWithCoords')) : getMapData(selectedMap)?.mapData;


  // Function to update player position - USED ON THE DESKTOP APP
  window.setDesktopApp = () => {
    window.isOnDesktopApp = true;
  };

  window.updatePlayerPosition = (newPosition, isDesktop) => {
    const theMapToMark = mapNamesWithCoords?.find(map => map.inGameName === newPosition);

    window.isOnDesktopApp = isDesktop;

    if (theMapToMark && lastMapFromDesktopApp?.toLowerCase() === '' || lastMapFromDesktopApp?.toLowerCase() !== theMapToMark?.name?.toLowerCase()) {
      markPlaceDesktopApp(theMapToMark.name)
      lastMapFromDesktopApp = theMapToMark?.name;
    } if (newPosition === "client_closed") {
      myCurrentPosition = undefined;
    }
  };


  if (xIsNumber && yIsNumber) {
    const coordsData = {
      x: Number(params.x),
      y: Number(params.y),
      inner: params.inner
    }
    markPlaceFromCoords(coordsData);
  } else if (params.hasOwnProperty('where') && typeof params.where === 'string') {
    markPlace(decodeURI(params.where));
  }

  /**
   * Which data we're picking, whether the localstorage when editing or the normal data if not
   * */
  function getWhichData() {
    return (editMode && localStorage.getItem('mapNamesWithCoords')) ? JSON.parse(localStorage.getItem('mapNamesWithCoords')) : getMapData(selectedMap)?.mapData;
  }

  getWhichData().map(mapObject => {
    // Add markers for interactivity
    const manaNode = mapObject.node ? '<img id="small-icon" src="./assets/images/node.png" /> Mana node<br/>' : '';
    const vault = mapObject.vault ? '<img id="small-icon" src="./assets/images/vault.png" /> Vault<br/>' : '';
    const bank = mapObject.bank ? '<img id="small-icon" src="./assets/images/bank.png"/> Bank<br/>' : '';
    const img = mapObject.print !== undefined ? mapObject.print : 'wip.png';
    const all = manaNode + vault + bank;
    L.marker([mapObject.x, mapObject.y], !editMode ? { icon: transparentIcon } : undefined).addTo(map)
      .bindPopup('<div id="tooltip"><b>' + prettifyName(mapObject.name) + `</b><br /><a href="./assets/prints/${mapObject.print}" target="_blank"><img class="miniature" src="./assets/prints/${img}" /></a><br><div class="description">${all}</div></div>`);
  });

  // Populates the selectable maps select
  function populateSelect() {
    const select = $('#select-map');
    $.each(availableMaps, function (_, item) {
      select.append($('<option>', {
        value: item.urlName,
        text: item.alias
      }));
    });
    $('#select-map').val(selectedMap);
  }

  populateSelect();

  // Attach change event handler to the input field
  $('#search').change(function () {
    // Get the value of the input field
    const inputValue = $(this).val();
  });

  $('#placename').change(function () {
    // Get the value of the input field
    const inputValue = $(this).val();
  });

  // Change selected map
  $('#select-map').change(function () {
    // Get the value of the input field
    const inputValue = $(this).val();

    selectedMap = inputValue;

    changeUrlParams(replaceQueryStringValue('map', inputValue, ["where"]));

    window.location.reload();
  });

  // Autocompletion
  $("#search").autocomplete({
    source: getMapData(selectedMap)?.mapData.map(map => {
      return prettifyName(map.name);
    }),
    select: function (event, ui) {
      const selectedValue = ui.item.value;
      markPlace(selectedValue);
      $("#search").val("");
      return false;
    }
  });
});

// Search box
$('#search').on("keypress", function (event) {
  if (event.which == 13) {
    event.preventDefault();
    const inputValue = $("#search").val();
    markPlace(inputValue);
    $("#search").val('');
  }
});

var overlayZoomed = (getMapData(selectedMap).imgOverlayZoomed !== '' && getMapData(selectedMap).imgOverlayZoomed !== undefined) ?
  L.imageOverlay(getMapData(selectedMap).imgOverlayZoomed, imageBounds) : null;

// Função para adicionar a imagem sobreposta apenas em uma área específica quando o zoom é aplicado
function addOverlayImageIfZoomedIn(latlng) {
  const zoomLevelThreshold = 18; // Defina o nível de zoom para ativar a imagem sobreposta

  if (getMapData(selectedMap).imgOverlayZoomed !== '' && getMapData(selectedMap).imgOverlayZoomed !== undefined) {
    if (map.getZoom() >= zoomLevelThreshold) {
      overlayZoomed.addTo(map);
      innerLayer = true;
    } if (map.getZoom() < zoomLevelThreshold) {
      map.removeLayer(overlayZoomed);
      innerLayer = false;
    }
  }
}

// Evento de zoomend para chamar a função addOverlayImageIfZoomedIn
map.on('zoomend', function () {
  addOverlayImageIfZoomedIn(map.getCenter());
});

// When we click to clear the array
$('#clear').on("click", function () {
  clear();
  alert('map cleared')
});

$('#undo').on("click", function () {
  undo();
  alert('undo')
});

/**
 * Marks the spot
 * @param selectedValue valor
 **/
function markPlace(selectedValue) {
  const foundMap = getMapData(selectedMap)?.mapData.find(map => map.name.toLowerCase() === selectedValue.toLowerCase());
  if (foundMap && selectedValue !== undefined) {
    const manaNode = foundMap.node ? '<img id="small-icon" src="./assets/images/node.png" /> Mana node<br/>' : '';
    const vault = foundMap.vault ? '<img id="small-icon" src="./assets/images/vault.png" /> Vault<br/>' : '';
    const bank = foundMap.bank ? '<img id="small-icon" src="./assets/images/bank.png"/> Bank<br/>' : '';
    const img = foundMap.print !== undefined ? foundMap.print : 'wip.png';
    const all = manaNode + vault + bank;

    if (lastSelectedMap !== undefined && !window.isOnDesktopApp) {
      map.removeLayer(lastSelectedMap);
    }

    const foundMapMarker = L.marker([foundMap.x, foundMap.y], { icon: marker }).addTo(map)
      .bindPopup('<div id="tooltip"><b>' + prettifyName(foundMap.name) + `</b><br /><a href="./assets/prints/${foundMap.print}" target="_blank"><img class="miniature" src="./assets/prints/${img}" /></a><br><div class="description">${all}</div></div>`);

    foundMapMarker.openPopup();
    setTimeout(() => {
      foundMapMarker.closePopup();
    }, 3000);
    
    if (!foundMap.inner) {
      map.setView([foundMap.x, foundMap.y], 15.5);
    } else {
      map.setView([foundMap.x, foundMap.y], 18.2);
    }
   
    if (!window.isOnDesktopApp) {
      lastSelectedMap = undefined;

    } // TODO: tava vendo aqui

    

    const newURL = `${window.location.href.split('?')[0]}?map=${selectedMap}&where=${encodeURI(foundMap.name.toLowerCase())}`;
    changeUrlParams(newURL);

    $("#search").val("");
  }
}


function markPlaceDesktopApp(selectedValue) {
  const foundMap = getMapData(selectedMap)?.mapData.find(map => map.name.toLowerCase() === selectedValue.toLowerCase());
  if (foundMap && selectedValue !== undefined) {
    const manaNode = foundMap.node ? '<img id="small-icon" src="./assets/images/node.png" /> Mana node<br/>' : '';
    const vault = foundMap.vault ? '<img id="small-icon" src="./assets/images/vault.png" /> Vault<br/>' : '';
    const bank = foundMap.bank ? '<img id="small-icon" src="./assets/images/bank.png"/> Bank<br/>' : '';
    const img = foundMap.print !== undefined ? foundMap.print : 'wip.png';
    const all = manaNode + vault + bank;

    if (lastSelectedMap !== undefined) {
      map.removeLayer(lastSelectedMap);
    }

    const foundMapMarker = L.marker([foundMap.x, foundMap.y], { icon: myLocationIcon }).addTo(map)
      .bindPopup('<div id="tooltip"><b>' + prettifyName(foundMap.name) + `</b><br /><a href="./assets/prints/${foundMap.print}" target="_blank"><img class="miniature" src="./assets/prints/${img}" /></a><br><div class="description">${all}</div></div>`);

    lastSelectedMap = foundMapMarker;
      
    const newURL = `${window.location.href.split('?')[0]}?map=${selectedMap}&where=${encodeURI(foundMap.name.toLowerCase())}`;
    changeUrlParams(newURL);

    $("#search").val("");
  }
}

/**
 * Marks the place from URL
 **/
function markPlaceFromCoords(coords) {
  if (lastSelectedMap !== undefined) {
    map.removeLayer(lastSelectedMap);
  }

  const foundMapMarker = L.marker([coords.x, coords.y], { icon: marker }).addTo(map);

  if (coords.inner === 'false') {
    map.setView([coords.x, coords.y], 15.5);
  } else {
    map.setView([coords.x, coords.y], 18.2);
  }

  lastSelectedMap = foundMapMarker;

  $("#search").val("");
}
