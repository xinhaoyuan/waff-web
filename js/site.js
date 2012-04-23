var player = "";
var tag;

function resetScene()
{
    $(document).clearQueue("waff");
}

function doAction(succ)
{
    $.ajax({
        url: "/cgi-bin/waff.pl",
        type: "GET",
        dataType: "xml",
        data: { "player" : player },
        error:
        function(XMLHttpRequest,textStatus,errorThrown){
            alert(textStatus);
        },
        success:
        function (xml) {
            
            resetScene();

            d = new Date();
            tag = String(d.getTime());
            var tag_now = tag;
            
            $(xml).find("ctl").each(function (i) {
                if ($(this).attr("type") == "text")
                {
                    var text = $(this).text();
                    $(document).queue("waff", function () {
                        var obj = $("<p style='display: none'>" + text + "</p>");
                        $("#log-container").append(obj);
                        obj.fadeIn(500);
                        setTimeout(function () {
                            if (tag_now === tag)
                            {
                                $(document).dequeue("waff");
                            }
                        }, 1000);
                    });
                }
                else if ($(this).attr("type") == "pause")
                {
                    $(document).queue("waff", function () {
                        $("#log-wrapper").addClass("pause");
                        $(document).one("click", function() {
                            if (tag_now === tag)
                            {
                                $("#log-container").html("");
                                $("#log-wrapper").removeClass("pause");
                                $(document).dequeue("waff");
                            }
                        });
                    });
                }
            });

            if ($(xml).find("with-scene").text() != "0")
            {
                
                $("#scene-img").load(function () {
                    succ();
                    $(document).dequeue("waff");
                });
                $("#scene-img").attr("src", "/content/" + player + ".scene.jpg?" + tag);
            }            
        },
    });
}

$(document).ready(function () {
    $("#button-start").click(function () {
        player = $("#player-name").val();
        if (player.length <= 0 || player.length > 10)
            alert("请输入长度在(0,10)之间名字");
        else
        {
            doAction(function () {
                $("#login-container").hide();
                $("#scene-container").show();
            });
        }
    });
});
