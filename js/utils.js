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
      if (index !== 0 && lowercaseWords.includes(word.toLowerCase())) {
          return word.toLowerCase();
      } else {
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
  }

  // Capitalize each word and join them back into a string
  var prettifiedName = words.map(capitalize).join(" ");

  return prettifiedName;
}