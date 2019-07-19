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
        $("#saved").html("<h2>Saved Articles</h2>")
        for (var i = 0; i < data.length; i++) {
          $("#saved").append("<p data-id='" + data[i]._id + "'>" + "<b>" + "Title: " + "</b>" + data[i].title + "<br />" + "<b>" + "Link: " + "</b>" + "<br />" + data[i].link + "<br />" + "<b>" + "Summary: " + "</b>" + data[i].summary + "<button button-id='" + data[i]._id + "' class=notes-button>" + 'Add a Note' + "</button>" +  "<button button-id='" + data[i]._id + "' class=article-delete>" + 'Delete Article' + "</button>" + "</p>");
        }
        $("#notes").empty();
        $("#notes").html("<h2>Notes</h2>")
        for (var i = 0; i < data.length; i++) {
            if(data[i].note === undefined) {
                console.log("no note to display")
            }
            else {
                $("#notes").append("<p data-id='" + data[i]._id + "'>" + "<b>" + "Title: " + "</b>" + data[i].title + "<br />" + "<b>" + "Note: " + "</b>" + data[i].note + "<button button-id='" + data[i]._id + "' class=delete-note>" + 'Delete Note' + "</button>" + "</p>");
            }
        }
    });
})

    //Delete article
    $(document).on("click", ".article-delete", function() {
        var saveArticleID = $(this).attr("button-id")
        $(this).parent().remove();
        
        $.ajax({
            method: "POST",
            url: "/articles/" + saveArticleID + "/delete",
            data: {
                id: saveArticleID
            }
        })
        .then(function(){
            console.log("done")
        }) 
    });  

// Notes Functionality

$(document).on("click", ".notes-button", function() {
    var saveArticleID = $(this).attr("button-id")
    var notesInput = prompt("Add a note for this article");

    $.ajax({
        method: "POST",
        url: "/articles/" + saveArticleID + "/notes/save",
        data: {
            note: notesInput
        },
        success: function(data){
            $("#notes").append("<p data-id='" + saveArticleID + "'>" +"<b>" + "Title: "+ "</b>" + data.title + "<br />" +"<b>" + "Note: "+ "</b>" + notesInput + "<br />" +  "<button button-id='" + saveArticleID + "' class=delete-note>" + 'Delete Note' + "</button>" + "</p>" )
        }
    })
});

//Delete note
$(document).on("click", ".delete-note", function() {
    var saveArticleID = $(this).attr("button-id")
    $(this).parent().remove()
    $.ajax({
        method: "POST",
        url: "/articles/" + saveArticleID + "/deletenote",
        data: {
            note: "none"
        },
        success: function(){
            console.log("removed note")
        }
    })
})
