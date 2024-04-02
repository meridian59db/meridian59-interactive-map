/**
 * Makes the city name prettified instead of the default (capitalized)
 * 
 * @param { string } name 
 * @returns Prettified name
 */
function prettifyName(name) {
  // Split the name into words
  var words = name.split(" ");

  // Array of words to keep lowercase
  var lowercaseWords = ["of", "to", "the", "in"];

  // Function to capitalize the first letter of each word except the ones in lowercaseWords
  function capitalize(word, index) {
    // Special handling for (South) or (North)
    if (word.startsWith("(") && word.endsWith(")")) {
      return word.charAt(0) + word.charAt(1).toUpperCase() + word.slice(2).toLowerCase();
    } else if (index !== 0 && lowercaseWords.includes(word.toLowerCase())) {
      return word.toLowerCase();
    } else {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
  }

  // Capitalize each word and join them back into a string
  var prettifiedName = words.map(capitalize).join(" ");

  return prettifiedName;
}

/**
 * Call this in console to clear the map in storage
 */
function clear() {
  localStorage.setItem('mapNamesWithCoords', JSON.stringify([]));
  window.location.reload();
}

/**
 * Undo the addition
 */
function undo() {
  let current = JSON.parse(localStorage.getItem('mapNamesWithCoords'));
  console.log(new Date().getTime(), current);
  current.pop();
  localStorage.setItem('mapNamesWithCoords', JSON.stringify(current));
}

/**
 * gets the current url params
 * 
 * @returns 
 */
function getUrlParams() {
  var params = {};
  var queryString = window.location.search.substring(1);
  var vars = queryString.split("&");
  for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split("=");
      params[pair[0]] = decodeURIComponent(pair[1]);
  }
  return params;
}

/**
 * Changes the url params
 * @param {string} newURI The new URI
 */
function changeUrlParams(newURI) {
  window.history.replaceState({}, document.title, newURI);
}