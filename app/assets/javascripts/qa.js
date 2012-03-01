$(document).ready(function() {

  var numberOfQuestionsToAsk = 3;
  var questionsData;

  function loadQuestions(callBack) {
    $.get("questions.json", function(data) {
      questionsData = data;
      callBack();
    });
  }


  function renderQuestions(data, num) {
    $("#questions .question").remove();
    $(".content #continue").remove();
    $(".content #overlay").remove();
    $(".content").append("<div id='overlay'></div>");
    $(".content").append("<a id='continue' href='#' class='btn large'>Continue</a>");
 
    $("#continue").hide();
    var toRender = $.shuffle(data).slice(0, num);
    $.each(toRender, function(index, item) {

      var template =
              "<div class='question'>" +
                      "<h2>{{question}}</h2>" +
                      "<div class='options'>" +
                      "<ol class='choices'>" +
                      "{{#choices}}" +
                      "<li>" +
                      "<a href='#' class='btn large primary'>{{.}}</a>" +
                      "</li>" +
                      "{{/choices}}" +
                      "</ol>" +
                      "</div>" +
                      "<div class='answer'>{{correct_choice}}</div>" +
					  "<div class='correct_answer_description'>{{correct_answer_description}}</div>"
                      "</div>";

      var question = Mustache.to_html(template, item);
      $("#questions").append(question);
    });
  }

  function play() {
    $("#win").hide();
    $("#lose").hide();
    renderQuestions(questionsData, numberOfQuestionsToAsk);
    ask($(".question").first(), 0, 0);
  }

  function intermediate(chosenAnswer, correctAnswer, question, continuation) {	
	    var content = "";
		var description = question.find(".correct_answer_description").text();
	    $("#continue").show();
	    var proxy = function(event) {
		    question.hide();
		    $("#overlay").empty().hide();
		    continuation();
		    $("#continue").on("click", function() {});
		    event.preventDefault();
	    };
	    question.find(".choices a").each(function (index, element) {
		    if($(element).text() !== chosenAnswer) {
			    $(element).hide();
		    } else {
			    if (chosenAnswer === correctAnswer) {
				    content += "<p>Correct!</p>";
			    } else {
				    $(element).addClass("incorrect"); 
				    content += "<p>The correct answer is \"" + correctAnswer + "\"</p>";
			    }
		    }
	    });
	
	    content += "<p>"+description+"</p>";
	
	    $("#overlay").html(content);
	    $("#overlay").show();
	    $("#continue").bind("click", proxy);
  }


  function showQuestion(question) {
    question.show();
    question.find(".choices a").each(function (index, element) {
      $(element).removeClass('incorrect').show();
    });
  }

  function ask(question, questionsAsked, score) {
    if (questionsAsked === numberOfQuestionsToAsk) {
      mark(score);
    } else {
	  showQuestion(question);
    }
    var answered = false;

    question.on("click", ".choices a", function(event) {
	  if (answered) { return false; }
	  answered = true;
      var chosenAnswer = $(this).text();
      var correctAnswer = question.find(".answer").text();
      
      if (chosenAnswer === correctAnswer) {
        score += 1;
      }
	  
      var continuation = function() {
		  $("#continue").hide();
	      ask(question.next(), questionsAsked += 1, score);
      };
    
      intermediate(chosenAnswer, correctAnswer, question, continuation);
	  
	  event.preventDefault();
    });
  }

  function mark(score) {
    if (score === numberOfQuestionsToAsk) {
      $("#win").toggle();
    } else {
      $("#lose").toggle();
    }
  }

  $(".alert-actions a").on("click", function(event) {
    play();
  });

  loadQuestions(play);
});
