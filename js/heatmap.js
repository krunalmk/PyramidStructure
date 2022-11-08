var num_iter = 256;

var heatmapBar = document.getElementById("heatmapBar1");
var lineBreak = document.createElement("heatmapBar1.b");

for(var h = 0; h <= 300; h = h + 5){

    for(var i = 1; i <= num_iter; i++){
        var ratio = (i / num_iter);
        var s, l;
        s = 100 - ratio * 50,
        l = 75 - ratio * 50;

        var li_ = document.createElement("li");

        var span_ = document.createElement("span");
        span_.style = "background-color: hsl(" + h + "," + s + "%," + l + "%)";
        
        li_.appendChild(span_);
        heatmapBar.appendChild(li_);
    }
}