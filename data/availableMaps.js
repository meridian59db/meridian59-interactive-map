import * as mapsData  from './mapsData/index.js';
const IMG_PATH = "../assets/images/";

/**
 * Gets the image with its path
 * 
 * @param {string} fileName Img name
 * @returns The file with its path
 */
const getImageWithPath = (fileName) => {
  return `${IMG_PATH}/${fileName}`;
}

export const availableMaps = [
  {
    urlName: 'main',
    alias: "Main-land",
    imgOverlayBase: getImageWithPath("map-mainland-dark.svg"),
    imgOverlayZoomed: getImageWithPath("map-mainland-dark-overlay.svg"),
    mapData: [...mapsData.mapNamesWithCoordsReal, ...mapsData.parsedInnerMaps]
  },
  {
    urlName: 'kocatan-jungle',
    alias: "Ko'catan Jungle",
    imgOverlayBase: getImageWithPath("map-ko-catan.svg"),
    imgOverlayZoomed: "",
    mapData: [...mapsData.kocatanMapNames]
  },
];

/**
 * Returns the map data
 * 
 * @param {string} selectedMapURL The selected map
 * @returns The selected map data
 */
export function getMapData(selectedMapURL) {
  return availableMaps.find(map => map.urlName === selectedMapURL?.toLowerCase()) ?? availableMaps[0];
}