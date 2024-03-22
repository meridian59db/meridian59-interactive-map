// popup.js

$(document).ready(function () {
  var open = false;

  $(".help").click(function (e) {
    // Create the popup element
    var popup = $(
      '<div id="popup" class="popup"><span class="title">Help</span><br><br>- Type anything to search, or click on the selectbox, it should mark the destination<br>- If you double-click the canvas, it will mark your current spot<br/>- You can click the destination marks to have a small description of the place you are going, and see if the map has special npcs <div class="center">Click anywhere to close.</div></div>'
    );

    // Append the popup to the body
    if (!open) {
      $("body").append(popup);

      // Show the popup
      popup.fadeIn();
      e.stopPropagation();
    }
    open = true;
  });

  // Holds the clicking to on anything of the page, to close the help box
  $(document).on("click", function (event) {
    if (
      !$(event.target).closest(".popup").length &&
      !$(event.target).is(".popup")
    ) {
      $(".popup").fadeOut(function () {
        // Remove the popup from the DOM after fadeOut animation completes
        $(this).remove();
        open = false;
      });
    }
  });

  // Hide also when clicking on the popup
  $(document).on("click", "#popup", function () {
    $(".popup").fadeOut(function () {
      // Remove the popup from the DOM after fadeOut animation completes
      $(this).remove();
      open = false;
    });
  });
});
