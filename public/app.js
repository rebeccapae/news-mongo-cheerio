//Scraping the article and displaying it on page
  $(document).on("click", "#scrapeFunction", function() {
    $.ajax({
        method: "GET",
        url: "/scrape"
    })
    .then(function() {
        $("#articles").show()
        $("#saved").hide()
        $.getJSON("/articles", function(data) {
            for (var i = 0; i < data.length; i++) {
              $("#articles").append("<p data-id='" + data[i]._id + "'>" +"<b>" + "Title: "+ "</b>" + data[i].title + "<br />" + "<b>" + "Link: " + "</b>" + data[i].link + "<br />" + "<b>" + "Summary: " + "</b>" + data[i].summary + "<br />" + "</p>" +  "<button button-id='" + data[i]._id + "' class=save-button>" + 'Save This Article' + "</button>");
            }
        });
    })
})

  //Home Button
  $(document).on("click", "#home-button", function() {
    $("#articles").show()
    $("#saved").hide()
})

  //Saving the article
$(document).on("click", ".save-button", function() {
    var saveArticleID = $(this).attr("button-id")
    console.log(saveArticleID)

    $.ajax({
        method: "POST",
        url: "/articles/" + saveArticleID + "/save",
        data: {
            saved: true
        }
    })
    .then(function() {
        console.log("saved article and going to route")
    })
})

// Going to saved articles page
$("#savedPage-button").on("click", function() {
    $.getJSON("/articles/saved", function(data) {
        $("#saved").empty()
        $("#articles").hide()
        $("#saved").show()
        for (var i = 0; i < data.length; i++) {
          $("#saved").append("<p data-id='" + data[i]._id + "'>" + "<b>" + "Title: " + "</b>" + data[i].title + "<br />" + "<b>" + "Link: " + "</b>" + "<br />" + data[i].link + "<br />" + "<b>" + "Summary: " + "</b>" + data[i].summary + "</p>" +  "<button button-id='" + data[i]._id + "' class=notes-button>" + 'Add a Note' + "</button>");
        }
    });
})

// Notes Functionality

  //Form when notes button clicked and Saving the Note
  $(document).on("click", ".notes-button", function() {
    var saveArticleID = $(this).attr("button-id")
    var notesInput = prompt("Add a note for this article");
    console.log(notesInput)

    $.ajax({
        method: "POST",
        url: "/articles/" + saveArticleID + "/notes",
        data: {
            title: saveArticleID,
            body: notesInput
        }
    })
    .then(function() {
        console.log("note saved")
    })
})

//Viewing Note
$(document).on("click", ".notes-view", function() {
    var saveArticleID = $(this).attr("button-id")
    $.ajax({
        method: "GET",
        url: "/notes"
    })
    .then(function() {
        $.getJSON("/notes", function(data) {
            for (var i = 0; i < data.length; i++) {
              $("#articles").append("<p data-id='" + data[i]._id + "'>" +"<b>" + "Title: "+ "</b>" + data[i].title + "<br />" + "<b>" + "Link: " + "</b>" + data[i].link + "<br />" + "<b>" + "Summary: " + "</b>" + data[i].summary + "<br />" + "</p>" +  "<button button-id='" + data[i]._id + "' class=save-button>" + 'Save This Article' + "</button>");
            }
        });
    })
})

$(document).on("click", "p", function() {
    $("#notes").empty();
    var thisID = $(this).attr("data-id");

    $.ajax({
        method: "GET",
        url: "/articles/" + thisID
    })
    .then(function(data){
        $("#notes").append("<h2>" + data.title + "</h2>")
      $("#notes").append("<input id='titleinput' name='title' >");
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      //If note already there
      if (data.note) {
          $("#titleinput").val(data.note.title);
          $("#bodyinput").val(data.note.body);
      }
    })
});


//Saving Note
$(document).on("click", "#savenote", function(){
    var thisID = $(this).attri("data-id");

    $.ajax({
        method: "POST",
        url: "/articles/" + thisID,
        data: {
            title: $("#titleinput").val(),
            body: $("#bodyinput").val()
        }
    })
    .then(function(data) {
        $("#notes").empty()
    })
    $("#titleinput").val("");
    $("#bodyinput").val("");
});