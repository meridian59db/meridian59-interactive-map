
// If we're adding more maps, leave this as true
const editMode = false;

$(document).ready(function () {
  if (editMode) {
    $('#readd').css('display', 'flex');
    $('#search').css('display', 'none');
    $('#select-map').css('display', 'none');
  }
});

