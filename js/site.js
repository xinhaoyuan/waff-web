var player = "";
var mod = "";
var tag;

function resetScene()
{
    $(document).clearQueue("waff");
    $("#log-wrapper").removeClass("pause");
    $("#bg-container").empty();
}

function doAction(succ)
{
    $("#loading-progress").text("0");
    $("#loading-screen").clearQueue().show();
    $.ajax({
        url: "/cgi-bin/waff.pl",
        type: "GET",
        dataType: "xml",
        data: { "player" : player, "mod" : mod },
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
            var loading_img = 0;
            var img_count = 0;
            
            $(xml).find("ctl").each(function (i) {
                if ($(this).attr("type") == "text")
                {
                    var text = $(this).text();
                    $(document).queue("waff", function () {
                        var obj = $("<p style='display: none'>" + text + "</p>");
                        $("#log-container").append(obj);
                        obj.fadeIn(500);
                        setTimeout(function () {
                            if (tag_now == tag)
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
                            if (tag_now == tag)
                            {
                                $("#log-container").html("");
                                $("#log-wrapper").removeClass("pause");
                                $(document).dequeue("waff");
                            }
                        });
                    });
                }
                else if ($(this).attr("type") == "bg-gfx")
                {
                    var id = parseInt($(this).text());
                    var bgimg = $("<img id='bg-gfx-" + id + "' class='bg-gfx' style='position: absolute; display:none'/>");
                    $("#bg-container").append(bgimg);
                    bgimg.load(function () {
                        if (-- loading_img == 0)
                        {
                            succ();
                            $("#loading-screen").fadeOut(500);
                            $(document).dequeue("waff");
                        }
                        else
                        {
                            $("#loading-progress").text(String(Math.round(loading_img * 100.0 / img_count)));
                        }
                    });
                    ++ loading_img;
                    ++ img_count;
                    bgimg.attr("src", "/content/" + mod + "/" + player + ".bg." + id + ".jpg?" + tag);

                    $(document).queue("waff", function () {
                        if (tag_now == tag)
                        {
                            if (id > 0)
                            {
                                $("#bg-gfx-" + (id - 1)).fadeOut(500);
                            }
                            bgimg.fadeIn(500, function () {
                                if (tag_now == tag)
                                    $(document).dequeue("waff");
                            });
                        }
                    });
                }
            });
        },
    });
}

$(document).ready(function () {
    $("#button-start").click(function () {
        player = $("#player-name").val();
        if (player.length <= 0 || player.length >= 10)
            alert("请输入长度在(0,10)之间名字");
        else
        {
            var chk = $('input[name="mod"]:checked');
            if (chk.size() == 0)
                mod = "startup";
            else mod = chk.val(); 
            $("#login-container").hide();
            doAction(function () {
                $("#scene-container").show();
            });
        }
    });
});
