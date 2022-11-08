//data set, from Byran's radialViz design
var frequent_itemsets =
    {
        "itemset": "ROOT",
        "children": [
            {
                "itemset": ["a"], "frequency": 4,
                "children": [
                    {
                        "itemset": ["a", "b"], "frequency": 3,
                        "children": [
                            {
                                "itemset": ["a", "b", "c"], "frequency": 2,
                                "children": [
                                    {
                                        "itemset": ["a", "b", "c", "d"], "frequency": 1,
                                        "children": []
                                    }
                                ]
                            },
                            {
                                "itemset": ["a", "b", "d"], "frequency": 2,
                                "children": []
                            }
                        ]
                    },
                    {
                        "itemset": ["a", "c"], "frequency": 4,
                        "children": [
                            {
                                "itemset": ["a", "c", "d"], "frequency": 3,
                                "children": []
                            }
                        ]
                    },
                    {
                        "itemset": ["a", "d"], "frequency": 4,
                        "children": []
                    }
                ]
            },
            {
                "itemset": ["b"], "frequency": 8,
                "children": [
                    {
                        "itemset": ["b", "c"], "frequency": 5,
                        "children": [
                            {
                                "itemset": ["b", "c", "d"], "frequency": 3,
                                "children": []
                            }
                        ]
                    },
                    {
                        "itemset": ["b", "d"], "frequency": 6,
                        "children": []
                    }
                ]
            },
            {
                "itemset": ["c"], "frequency": 6,
                "children": [
                    {
                        "itemset": ["c", "d"], "frequency": 3,
                        "children": []
                    }
                ]
            },
            {
                "itemset": ["d"], "frequency": 6,
                "children": []
            },
            {
                "itemset": ["e"], "frequency": 7,
                "children": [
                    {
                        "itemset": ["e", "f"], "frequency": 5,
                        "children": []
                    }
                ]
            },
            {
                "itemset": ["f"], "frequency": 5,
                "children": []
            }
        ]
    };

var padding = {top: 20, right: 20, bottom: 20, left: 20},
    width = 900 + 1,
    height = 700 + 1,
    r = height/2 - 2*padding.top;

var zoom = d3.behavior.zoom().on("zoom", zoomed)
    .scaleExtent([1, 100]);

function zoomed(){
    svgContainer.attr("transform", "translate(" + d3.event.translate + ")"
        + " scale(" + d3.event.scale + ")");

    svgContainer.selectAll(".blocks").attr("stroke-width", 1/d3.event.scale);
}

function resetZoom(){
    svgContainer.attr("transform", d3.zoomIdentity);
    svgContainer.selectAll(".blocks").attr("stroke-width", "1");

    zoom.scale(1).translate([0,0]);
}

//svg container
var svg = d3.select("#chart").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width/2 + "," + (height/2+15) + ")")
    .call(zoom);

var svgContainer = svg.append("g");

svgContainer.append("rect")
    .attr("width", width*2)
    .attr("height", height*2)
    .style("fill", "white")
    .attr("transform", "translate(" + (width*-1) + "," + ((height+15)*-1) + ")");

//for heatmap scale
var heatmapStartPos = 40;
var heatmapLength = 256;

var lineContainer = d3.select("#scale").append("svg").attr("width",330).attr("height",50);
var scaleLine = lineContainer.append("line")
    .attr("x1", heatmapStartPos).attr("y1", 0)
    .attr("x2", heatmapStartPos+heatmapLength-3 ).attr("y2", 0)
    .style("stroke", "black")
    .style("stroke-width", "3");

var lastBuffer = [];
var lastTitle = "";
var lastMode;
var last_min_fre = 1, last_max_fre = Number.MAX_VALUE,
    last_min_card = 1, last_max_card = Number.MAX_VALUE;

function setLast(){
    last_min_fre = min_show_fre;
    last_max_fre = max_show_fre;
    last_min_card = min_show_card;
    last_max_card = max_show_card;
    lastTitle = document.getElementById("listitemsets").textContent;
    lastBuffer = [];
    buffer.forEach(function (d) {
        lastBuffer.push(deepCopy(d));
    });
    lastMode = sup_sub;
}

function deepCopy(obj){
    var objCopy = new Object();

    objCopy.itemset = obj.itemset;
    objCopy.frequency = obj.frequency;
    objCopy.children = [];
    objCopy.notShow = obj.notShow;

    if (obj.children.length > 0) {
        obj.children.forEach(function (d) {
            objCopy.children.push(deepCopy(d));
        });
    }

    return objCopy;
}

var flattenList = [];
var initialBufferCopy = frequent_itemsets.children;
var buffer = Array.from(initialBufferCopy);
flatten_itemsets(initialBufferCopy);
var initialFlattenCopy = Array.from(flattenList);
initialFlattenCopy.reverse();
var curr_set_to_display = [];
var displayed_list = [];
var radius, min_fre, max_fre, min_card, max_card;
var min_show_fre = 1;
var max_show_fre = Number.MAX_VALUE;
var min_show_card = 1;
var max_show_card = Number.MAX_VALUE;
var list_iter_index = 0;
var sup_sub = false;
var sectorOrderMode = 0;

function preCal() {
    max_fre = Math.max.apply(Math,displayed_list.map(function(o) { return o.frequency; }));
    min_fre = Math.min.apply(Math,displayed_list.map(function(o) { return o.frequency; }));

    max_card = Math.max.apply(Math,displayed_list.map(function(o) { return o.itemset.length; }));
    min_card = Math.min.apply(Math,displayed_list.map(function(o) { return o.itemset.length; }));

    radius = d3.scale.linear().domain([0, 7]).range([0, r]);
}

function getDisplayed(obj){
    if (obj.children.length > 0) {
        obj.children.forEach(function (d) {
            getDisplayed(d);
        });
    }

    if(!obj.notShow) {
        displayed_list.push(obj);
    }
}

function filter(list){
    var result = [];

    for(var i=0; i<list.length; i++){
        if(list[i].frequency>=min_show_fre && list[i].frequency<=max_show_fre
            && list[i].itemset.length>=min_show_card && list[i].itemset.length<=max_show_card) {
            result.push(list[i]);
        }
    }

    return result;
}

function getMinMaxEachCard(){
    var result = [];

    for(var i=min_card; i<=max_card; i++){
        result.push([Number.MAX_VALUE, Number.MIN_VALUE]);
    }

    for(var i=0; i<curr_set_to_display.length; i++){
        var currCard = curr_set_to_display[i].itemset.length;
        var currFreq = curr_set_to_display[i].frequency;

        if(result[currCard-min_card][0] > currFreq){
            result[currCard-min_card][0] = currFreq;
        }

        if(result[currCard-min_card][1] < currFreq){
            result[currCard-min_card][1] = currFreq;
        }
    }

    return result;
}

function setAnglesWeight(buffer) {
    var totalWeight = 0;

    for(var i=0; i<buffer.length; i++){
        buffer[i].weight = countCardLevel(buffer[i], 1);
        totalWeight += buffer[i].weight;
    }

    return totalWeight;
}

function countCardLevel(obj, weight){
    var result = weight;

    for(var i=0; i<obj.children.length; i++){
        if(result < countCardLevel(obj.children[i], weight+1)) {
            result = countCardLevel(obj.children[i], weight + 1);
        }
    }

    return result;
}

function sortBuffer(buffer){
    for(var i=0; i<buffer.length; i++){
        if(buffer[i].children.length > 0){
            sortBuffer(buffer[i].children);
        }
    }

    if(sectorOrderMode == 0){
        buffer.sort(function(a,b){
            return a.itemset[a.itemset.length-1] - b.frequency[b.itemset.length-1];
        });
    }
    else if(sectorOrderMode == 1){
        buffer.sort(function(a,b){
            return a.frequency - b.frequency;
        });
    }   
    else if(sectorOrderMode == 2){
        buffer.sort(function(a,b){
            return b.frequency - a.frequency;
        });
    }
}

function init() {
    var ito = document.getElementById("dispMode1").checked;

    flattenList = [];
    flatten_itemsets(buffer);

    var filteredList = filter(flattenList);

    buffer = buildTree(filteredList);

    if(ito){
        flattenList = [];
        flatten_itemsets(buffer);
        curr_set_to_display = flattenList;
        displayed_list = [];

        if(sup_sub){
            buffer.forEach(function (d) {
                getDisplayed(d);
            });
        }
        else{
            displayed_list = flattenList;
        }

        preCal();
        buffer.forEach(function (d) {
            set_rank(d, min_card, 0);
        });
    }
    else{
        flattenList = [];
        flatten_itemsets(buffer);
        curr_set_to_display = flattenList;
        displayed_list = [];

        if(sup_sub){
            buffer.forEach(function (d) {
                getDisplayed(d);
            });
        }
        else{
            displayed_list = flattenList;
        }

        preCal();
        buffer.forEach(function (d) {
            set_rank(d, max_card, 1);
        });
    }

    var totalWeight = setAnglesWeight(buffer);

    sortBuffer(buffer);

    set_angles(buffer, 0, 2*Math.PI, totalWeight);

    var min_max_freq_on_each_card = getMinMaxEachCard();
    display(min_max_freq_on_each_card);

    updataHeatmap();
}

//from https://gist.github.com/mjackson/5311256
function hsv_to_rgb(h, s, v){
    var r, g, b;

    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    return [ r * 255, g * 255, b * 255 ];
}

function display(min_max_freq_on_each_card) {
    var pie = d3.layout.pie()
        .value(function(d) { return d.value;})
        .sort(null);

    var sectors = svgContainer.selectAll(".blocks")
        .data([curr_set_to_display]);

    sectors.enter()
        .append("g")
        .attr("class", "blocks")
        .attr("stroke", "black")
        .attr("stroke-width", 1);

    var path = d3.svg.arc();
    path.startAngle(function(d) { return d.data.startAngle; })
        .endAngle(function(d) { return d.data.endAngle; })
        .innerRadius(function(d) { return d.data.innerRadius; })
        .outerRadius(function(d) { return d.data.outerRadius; });

    var arc_paths = sectors.selectAll(".blocks .slice")
        .data(pie, function(d) { return d.data.itemset;});

    // Transitions.
    var exit = d3.transition().duration(0).each(function(){
        arc_paths.exit()
            .transition()
            .remove();
    });

    let freqSet = new Set();

    var update = exit.transition().duration(0).each(function(){
        arc_paths.transition()
            .attr("d", path)
            .attr("fill", function(d, i){
                freqSet.add(curr_set_to_display[i].frequency);

                var thisCardinality = curr_set_to_display[i].itemset.length;
                var thisMinFreq = min_max_freq_on_each_card[thisCardinality-min_card][0];
                var thisMaxFreq = min_max_freq_on_each_card[thisCardinality-min_card][1];
                var freq = curr_set_to_display[i].frequency;

                var ratio;
                /*if(thisMaxFreq == thisMinFreq){
                    ratio = 0.5;
                }
                else {
                    ratio = (freq - thisMinFreq) / (thisMaxFreq - thisMinFreq);
                }*/

                if(max_fre == min_fre){
                    ratio = 0.5;
                }
                else {
                    ratio = (freq - min_fre) / (max_fre - min_fre);
                }
                
                var gap = 360 / (max_card - min_card + 1);
                
                // var h = (thisCardinality - min_card) * gap,
                //     s = 100 - ratio * 50,
                //     l = 75 - ratio * 50;
                var h = ((thisCardinality - min_card) * gap) / 360,
                    s = 0.5 + ratio * 0.5,
                    v = 1 - ratio * 0.5;
                
                var hsvResult = hsv_to_rgb(h,s,v);
                
                return "rgb(" + hsvResult[0] + "," + hsvResult[1] + "," + hsvResult[2] +  ")";
            });
    });

    var enter = update.transition().duration(0).each(function(){
        var curr_arc_paths = arc_paths.enter()
            .append("path")
            .attr("class", "slice")
            .attr("data-itemset", function(d, i){return curr_set_to_display[i].itemset;})
            .attr("data-frequency", function(d, i){return curr_set_to_display[i].frequency;})
            .attr("fill", function(d, i){
                freqSet.add(curr_set_to_display[i].frequency);

                var thisCardinality = curr_set_to_display[i].itemset.length;
                var thisMinFreq = min_max_freq_on_each_card[thisCardinality-min_card][0];
                var thisMaxFreq = min_max_freq_on_each_card[thisCardinality-min_card][1];
                var freq = curr_set_to_display[i].frequency;

                var ratio;
                /*if(thisMaxFreq == thisMinFreq){
                    ratio = 0.5;
                }
                else {
                    ratio = (freq - thisMinFreq) / (thisMaxFreq - thisMinFreq);
                }*/

                if(max_fre == min_fre){
                    ratio = 0.5;
                }
                else {
                    ratio = (freq - min_fre) / (max_fre - min_fre);
                }
                
                var gap = 360 / (max_card - min_card + 1);

                // var h = (thisCardinality - min_card) * gap,
                //     s = 100 - ratio * 50,
                //     l = 75 - ratio * 50;
                var h = ((thisCardinality - min_card) * gap) / 360,
                    s = 0.5 + ratio * 0.5,
                    v = 1 - ratio * 0.5;
                
                var hsvResult = hsv_to_rgb(h,s,v);
                
                return "rgb(" + hsvResult[0] + "," + hsvResult[1] + "," + hsvResult[2] +  ")";
            })
            .on("click", filterLeftClick)
            .on("contextmenu", filterRightClick)
            .each(function(d) {this._current = d;});

        curr_arc_paths.transition()
            .attr("d", path);

        curr_arc_paths.append("title")
            .text(function(d, i){
                var displaySet = curr_set_to_display[i].itemset.slice(
                    curr_set_to_display[i].rank-1, curr_set_to_display[i].itemset.length);

                return "{" + curr_set_to_display[i].itemset + "}: " + curr_set_to_display[i].frequency;
            });
    });


    if(displayed_list.length != 0){
        document.getElementById("max_freq").innerHTML = max_fre;
        document.getElementById("min_freq").innerHTML = min_fre;
        document.getElementById("max_card").innerHTML = max_card;
        document.getElementById("min_card").innerHTML = min_card;
        document.getElementById("num_itemsets").innerHTML = displayed_list.length;
    }
    else{
        document.getElementById("max_freq").innerHTML = "-";
        document.getElementById("min_freq").innerHTML = "-";
        document.getElementById("max_card").innerHTML = "-";
        document.getElementById("min_card").innerHTML = "-";
        document.getElementById("num_itemsets").innerHTML = "0";
    }

    //set heatmap scale
    var MAX_HEATMAP_SCALE = 8;
    if(max_fre > 10000){
        MAX_HEATMAP_SCALE = 5;
    }
    var freqList = Array.from(freqSet);
    freqList.sort();

    var gap = -1;
    var num = -1;
    if(freqList.length > MAX_HEATMAP_SCALE){
        gap = heatmapLength/(MAX_HEATMAP_SCALE-1);
        num = MAX_HEATMAP_SCALE;
    }
    else{
        gap = heatmapLength/(freqList.length-1);
        num = freqList.length;
    }

    var tempList = [];
    for(var i=0; i<num; i++){
        tempList.push(i*gap);
    }

    lineContainer.selectAll(".heatmapscale").remove();

    var text = lineContainer.selectAll()
        .data(tempList).enter()
        .append("text")
        .attr("class", "heatmapscale")
        .attr("x", function (d) {
            if(tempList.length == 1){
                return (heatmapStartPos-5) + heatmapLength/2;
            }

            return (heatmapStartPos-5) + d;
        }).attr("y", 20)
        .text(function (d) {
            if(tempList.length == 1){
                return min_fre + (max_fre-min_fre)/2;
            }
            return min_fre + Math.round(d/heatmapLength*(max_fre-min_fre));
        });
}

function flatten_itemsets(list){
    for (var i = list.length-1; i >=0 ; i--) {
        if(list[i].children.length > 0){
            flatten_itemsets(list[i].children);
        }

        flattenList.push(list[i]);
        flattenList[flattenList.length-1].d = 1;
    }
}

function set_angles(arr, parentStart, parentEnd, totalWeight){
    var lastAngle = parentStart;

    for (var i = 0; i < arr.length; i++) {
        var ratio = arr[i].weight / totalWeight;

        arr[i].startAngle = lastAngle;
        arr[i].endAngle = arr[i].startAngle + (Math.abs(parentEnd) - Math.abs(parentStart)) * ratio * -1;
        lastAngle = arr[i].endAngle;

        arr[i].innerRadius = radius(arr[i].rank - 1); // start plotting from centre
        arr[i].outerRadius = radius(arr[i].rank); // Use the rank to determine its radial length

        if (arr[i].children.length > 0) {
            var nextTotalWeight = setAnglesWeight(arr[i].children);

            set_angles(arr[i].children, arr[i].startAngle, arr[i].endAngle, nextTotalWeight); // <---- this is where you tell it how to divide the sectors among descendant children
        }
    }
}

function set_rank(obj, rank, mode){
    if(mode == 0) {
        if (obj.children.length > 0) {
            obj.children.forEach(function (d) {
                set_rank(d, rank, 0);
            });
        }
        obj.rank = (obj.itemset.length - rank) + 1;
    }
    else if(mode == 1){
        if (obj.children.length > 0) {
            obj.children.forEach(function (d) {
                set_rank(d, rank, 1);
            });
        }
        obj.rank = rank - (obj.itemset.length - 1);
    }
}

function showHints() {
    if(document.getElementById("hintText").checked){
        document.getElementById("hints").classList.add("showHints");
    }
    else{
        document.getElementById("hints").className = document.getElementById("hints").classList.remove("showHints");
    }

    if(document.getElementById("showHeatmap").checked){
        document.getElementById("heatmap").classList.add("showHeatmap");
        document.getElementById("scale").classList.add("showScale");
    }
    else{
        document.getElementById("heatmap").className = document.getElementById("heatmap").classList.remove("showHeatmap");
        document.getElementById("scale").className = document.getElementById("scale").classList.remove("showScale");
    }
}

function displayMode() {
    init();
}

function resetShow(obj){
    if (obj.children.length > 0) {
        obj.children.forEach(function (d) {
            resetShow(d);
        });
    }

    obj.notShow = false;
}

function setChildShow(obj, selectedSet, notShow){
    obj.notShow = notShow;

    if( equal(obj.itemset,selectedSet) ){
        notShow = false;
    }

    if (obj.children.length > 0) {
        obj.children.forEach(function (d) {
            setChildShow(d, selectedSet, notShow);
        });
    }
}

function buildTree(list){
    list.sort(function (a, b) {
        var result = 0;

        var i = 0;
        while (result == 0) {
            if (i == a.itemset.length || i == b.itemset.length) {
                result = a.itemset.length - b.itemset.length;
            }
            else {
                result = a.itemset[i].localeCompare(b.itemset[i]);
            }
            i++;
        }

        return result;
    });

    var root = {itemset:"ROOT", children:[]};

    for(var i=0; i<list.length; i++){
        var support = list[i].frequency;
        var superset = list[i].itemset;
        children = root.children;

        children = add_children(children, superset, support);
    }

    return root.children;
}

function filterLeftClick(d){
    document.getElementById('resetZoom').click();

    if(document.getElementById("mode1").checked){
        var extension = false;
        var chosed = d.data;

        if(chosed.children.length != 0) {
            setLast();

            buffer = d.data.children;
            sup_sub = true;

            init();

            extension = true;
        }

        if(extension){
            document.getElementById("itemsetsQuery").checked = false;
            setItemsetQuery();

            document.getElementById("listitemsets")
                .textContent = "Viewing extensions of { " + d.data.itemset
                + " } -> " + d.data.frequency + ", which satisfy:\r\n";
            showCriteria();
        }
        else{
            var toast = document.getElementById("toast");
            document.getElementById("desc").innerHTML = "It does not have extension under criteria.";
            toast.classList.add("show");
            setTimeout(function(){ toast.className = toast.classList.remove("show"); }, 2000);
        }
    }
    else if(document.getElementById("mode2").checked){
        var supersetsList = findSuperset(d.data.itemset);

        if(supersetsList.length > 0){
            document.getElementById("itemsetsQuery").checked = false;
            setItemsetQuery();
            setLast();

            document.getElementById("listitemsets")
                .textContent = "Viewing supersets of { " + d.data.itemset
                + " } -> " + d.data.frequency + ", which satisfy:\r\n";
            showCriteria();

            buffer = buildTree(supersetsList);

            sup_sub = true;
            init();
        }
        else{
            var toast = document.getElementById("toast");
            document.getElementById("desc").innerHTML = "It does not have superset under criteria.";
            toast.classList.add("show");
            setTimeout(function () {
                toast.className = toast.classList.remove("show");
            }, 2000);
        }
    }
}

function filterSet(obj, set){
    if(list_iter_index==set.length || !equal(obj.itemset, set[list_iter_index])){
        obj.notShow = true;
    }
    else{
        obj.notShow = false;
        list_iter_index ++;
    }

    if (obj.children.length > 0) {
        obj.children.forEach(function (d) {
            filterSet(d, set);
        });
    }
}

function equal(set1, set2){
    if(set1.length != set2.length){
        return false;
    }

    for(var i=0; i<set1.length; i++){
        if(!set2.includes(set1[i])){
            return false;
        }
    }

    return true;
}

function filterCri(obj){
    if (obj.children.length > 0) {
        obj.children.forEach(function (d) {
            filterCri(d);
        });
    }

    if(obj.frequency<min_show_fre || obj.frequency>max_show_fre
        || obj.itemset.length<min_show_card || obj.itemset.length>max_show_card){
        obj.notShow = true;
    }
}

function findSubset(superset){
    var subsets = [];

    for(var i=0; i<initialFlattenCopy.length; i++){
        var currSet = initialFlattenCopy[i];

        if(isSubset(currSet.itemset, superset) && satisfyCriteria(currSet) && superset.length!=currSet.itemset.length){
            subsets.push(currSet);
        }
    }

    return subsets;
}

function findSuperset(subset){
    var supersets = [];

    for(var i=0; i<initialFlattenCopy.length; i++){
        var currSet = initialFlattenCopy[i];

        if(isSubset(subset, currSet.itemset) && satisfyCriteria(currSet) && subset.length!=currSet.itemset.length){
            supersets.push(currSet);
        }
    }

    return supersets;
}

function isSubset(subset, set){
    for(var i=0; i<subset.length; i++){
        if (!set.includes(subset[i])){
            return false;
        }
    }

    return true;
}

function satisfyCriteria(set){
    if(set.frequency>=min_show_fre && set.frequency<=max_show_fre
        && set.itemset.length>=min_show_card && set.itemset.length<=max_show_card){
        return true;
    }
    return false;
}

function findPrefix(set){
    var prefixItemsetList = [];
    for(var n=1; n<set.length; n++){
        var prefixItemset = set.slice(0, set.length - n);
        prefixItemsetList.push(prefixItemset);
    }
    prefixItemsetList.reverse();

    var resultList = [];
    var j = 0;
    for(var i=0; i<initialFlattenCopy.length; i++){
        if(j == prefixItemsetList.length){
            break;
        }

        var currSet = initialFlattenCopy[i];

        if( equal(currSet.itemset, prefixItemsetList[j]) ){
            resultList.push(currSet);
            j++;
        }
    }

    return resultList;
}

function filterRightClick(d){
    document.getElementById('resetZoom').click();

    var mode1 = document.getElementById("mode1").checked;

    if(mode1){
        if(d.data.itemset.length > 1) {
            document.getElementById("itemsetsQuery").checked = false;
            setItemsetQuery();
            setLast();

            document.getElementById("listitemsets")
                .textContent = "Viewing prefixes of { " + d.data.itemset
                + " } -> " + d.data.frequency + ", which satisfy:\r\n";
            showCriteria();

            var prefixItemsetList = findPrefix(d.data.itemset);

            buffer = buildTree(prefixItemsetList);

            sup_sub = true;
            init();
        }
        else{
            var toast = document.getElementById("toast");
            document.getElementById("desc").innerHTML = "It does not have prefix under criteria.";
            toast.classList.add("show");
            setTimeout(function () {
                toast.className = toast.classList.remove("show");
            }, 2000);
        }
    }
    else{
        var subsetList = findSubset(d.data.itemset);

        if(subsetList.length > 0) {
            document.getElementById("itemsetsQuery").checked = false;
            setItemsetQuery();
            setLast();

            document.getElementById("listitemsets")
                .textContent = "Viewing subsets of { " + d.data.itemset
                + " } -> " + d.data.frequency + ", which satisfy:\r\n";
            showCriteria();

            buffer = buildTree(subsetList);

            sup_sub = true;
            init();
        }
        else{
            var toast = document.getElementById("toast");
            document.getElementById("desc").innerHTML = "It does not have subset under criteria.";
            toast.classList.add("show");
            setTimeout(function () {
                toast.className = toast.classList.remove("show");
            }, 2000);
        }
    }
}

function showCriteria(){
    var titleContainer = document.getElementById("listitemsets");
    titleContainer.innerHTML += "Min frequency = " + min_show_fre;
    if(max_show_fre == Number.MAX_VALUE){
        titleContainer.innerHTML += "\r\nMax frequency = +&#8734";
    }
    else{
        titleContainer.innerHTML += "\r\nMax frequency = " + max_show_fre;
    }
    titleContainer.innerHTML += "\r\nMin cardinality = " + min_show_card;
    if(max_show_card == Number.MAX_VALUE){
        titleContainer.innerHTML += "\r\nMax cardinality = +&#8734";
    }
    else{
        titleContainer.innerHTML += "\r\nMax cardinality = " + max_show_card;
    }

    if(document.getElementById("itemsetsQuery").checked){
        var querySet = document.getElementById("itemsetsQuerySet").value.trim();
        if(document.getElementById("itemsetsQueryMode1").checked){
            titleContainer.innerHTML += "\r\nContain some {" + querySet + "}";
        }
        else if(document.getElementById("itemsetsQueryMode2").checked){
            titleContainer.innerHTML += "\r\nContain all {" + querySet + "}";
        }
        else if(document.getElementById("itemsetsQueryMode3").checked){
            titleContainer.innerHTML += "\r\nExclusive all {" + querySet + "}";
        }
        else if(document.getElementById("itemsetsQueryMode4").checked){
            titleContainer.innerHTML += "\r\nContain exact {" + querySet + "}";
        }
    }

    if(document.getElementById("filterGlobalMode").checked){
        titleContainer.innerHTML += "\r\nGlobal filter";
    }
    else{
        titleContainer.innerHTML += "\r\nLocal filter.";
    }
}

//reset graph
function resetAll(){
    document.getElementById("itemsetsQuery").checked = false;
    setItemsetQuery();
    setLast();

    document.getElementById("minfrequency").value = "";
    document.getElementById("maxfrequency").value = "";
    document.getElementById("mincardinality").value = "";
    document.getElementById("maxcardinality").value = "";

    min_show_fre = 1;
    max_show_fre = Number.MAX_VALUE;
    min_show_card = 1;
    max_show_card = Number.MAX_VALUE;

    document.getElementById("listitemsets")
        .textContent = "Viewing all itemsets.";

    buffer = Array.from(initialBufferCopy);
    buffer.forEach(function (d) {
        resetShow(d);
    });

    init();
}

//criteria filter
function filterCriteria(){
    setLast();

    var minFrequency = document.getElementById("minfrequency").value;
    var maxFrequency = document.getElementById("maxfrequency").value;
    var minCardinality = document.getElementById("mincardinality").value;
    var maxCardinality = document.getElementById("maxcardinality").value;

    if(minFrequency.trim() == ""){
        minFrequency = 1;
    }
    else{
        minFrequency = parseInt(minFrequency);
    }

    if(maxFrequency.trim() == ""){
        maxFrequency = Number.MAX_VALUE;
    }
    else{
        maxFrequency = parseInt(maxFrequency);
    }

    if(minCardinality.trim() == ""){
        minCardinality = 1;
    }
    else{
        minCardinality = parseInt(minCardinality);
    }

    if(maxCardinality.trim() == ""){
        maxCardinality = Number.MAX_VALUE;
    }
    else{
        maxCardinality = parseInt(maxCardinality);
    }


    if(minFrequency > maxFrequency){
        alert("Frequency range is illegal.");
        return;
    }

    if(minCardinality > maxCardinality){
        alert("Cardinality range is illegal.");
        return;
    }

    if(!isNaN(minFrequency)){
        min_show_fre = minFrequency;
    }
    else{
        alert("Min frequency is illegal.");
    }

    if(!isNaN(maxFrequency)){
        max_show_fre = maxFrequency;
    }
    else{
        alert("Max frequency is illegal.");
    }


    if(!isNaN(minCardinality)){
        min_show_card = minCardinality;
    }
    else{
        alert("Min cardinality is illegal.");
    }

    if(!isNaN(maxCardinality)){
        max_show_card = maxCardinality;
    }
    else{
        alert("Max cardinality is illegal.");
    }

    var filterGlobalMode = document.getElementById("filterGlobalMode");
    if(filterGlobalMode.checked){
        buffer = Array.from(initialBufferCopy);

        buffer.forEach(function (d) {
            resetShow(d);
        });
    }

    flattenList = [];
    flatten_itemsets(buffer);

    var itemsetsQuery = document.getElementById("itemsetsQuery");
    if(itemsetsQuery.checked){
        var containSome = document.getElementById("itemsetsQueryMode1");
        var containAll = document.getElementById("itemsetsQueryMode2");
        var exclusiveAll = document.getElementById("itemsetsQueryMode3");
        var containExact = document.getElementById("itemsetsQueryMode4");
        var querySet = (document.getElementById("itemsetsQuerySet").value).trim().split(" ");

        var temp = [];
        if(containSome.checked){
            for(var i=0; i<flattenList.length; i++){
                var curr = flattenList[i];
                for(var j=0; j<querySet.length; j++){
                    if(curr.itemset.includes(querySet[j])){
                        temp.push(curr);
                        break;
                    }
                }
            }
        }
        else if(containAll.checked){
            for(var i=0; i<flattenList.length; i++){
                var curr = flattenList[i];
                var contain = true;
                for(var j=0; j<querySet.length; j++){
                    if(!curr.itemset.includes(querySet[j])){
                        contain = false;
                        break;
                    }
                }
                if(contain){
                    temp.push(curr);
                }
            }
        }
        else if(exclusiveAll.checked){
            for(var i=0; i<flattenList.length; i++){
                var curr = flattenList[i];
                var contain = false;
                for(var j=0; j<querySet.length; j++){
                    if(curr.itemset.includes(querySet[j])){
                        contain = true;
                        break;
                    }
                }
                if(!contain){
                    temp.push(curr);
                }
            }
        }
        else if(containExact.checked){
            var found = false;

            for(var i=0; i<flattenList.length && !found; i++){
                var curr = flattenList[i];
                if(curr.itemset.length != querySet.length){
                    continue;
                }

                var contain = true;
                for(var j=0; j<querySet.length; j++){
                    if(!curr.itemset.includes(querySet[j])){
                        contain = false;
                        break;
                    }
                }

                if(contain){
                    found = true;
                    temp.push(curr);
                }
            }
        }

        buffer = buildTree(temp);
    }

    if(min_show_fre==1 && max_show_fre==Number.MAX_VALUE
        && min_show_card==1 && max_show_card==Number.MAX_VALUE && !itemsetsQuery.checked){
        document.getElementById("listitemsets").textContent = "Viewing all itemsets.";
    }
    else{
        document.getElementById("listitemsets").textContent = "Viewing itemsets satisfy:\r\n";
        showCriteria();
    }

    sup_sub = true;
    init();
}

function containExactQuery(obj, querySet){
    if(obj.itemset.length == querySet.length) {
        var same = true;
        for (var j = 0; j < querySet.length; j++) {
            if (!obj.itemset.includes(querySet[j])) {
                same = false;
                break;
            }
        }

        if(!same){
            obj.notShow = true;
        }
    }
    else{
        obj.notShow = true;
    }

    if (obj.children.length > 0) {
        obj.children.forEach(function (d) {
            containExactQuery(d, querySet);
        });
    }
}

function exclusiveAllQuery(obj, querySet){
    var contain = false;

    for(var j=0; j<querySet.length; j++){
        if(obj.itemset.includes(querySet[j])){
            contain = true;
            break;
        }
    }

    if(contain){
        obj.notShow = true;
    }

    if (obj.children.length > 0) {
        obj.children.forEach(function (d) {
            exclusiveAllQuery(d, querySet);
        });
    }
}

function containAllQuery(obj, querySet){
    var containAll = true;

    for(var j=0; j<querySet.length; j++){
        if(!obj.itemset.includes(querySet[j])){
            containAll = false;
            break;
        }
    }

    if(!containAll){
        obj.notShow = true;
    }

    if (obj.children.length > 0) {
        obj.children.forEach(function (d) {
            containAllQuery(d, querySet);
        });
    }
}

function containSomeQuery(obj, querySet){
    var containSome = false;

    for(var j=0; j<querySet.length; j++){
        if(obj.itemset.includes(querySet[j])){
            containSome = true;
            break;
        }
    }

    if(!containSome){
        obj.notShow = true;
    }

    if (obj.children.length > 0) {
        obj.children.forEach(function (d) {
            containSomeQuery(d, querySet);
        });
    }
}

//display maximal itemsets
function dispMaximalSets(){
    document.getElementById("itemsetsQuery").checked = false;
    setItemsetQuery();
    setLast();

    document.getElementById("minfrequency").value = "";
    document.getElementById("maxfrequency").value = "";
    document.getElementById("mincardinality").value = "";
    document.getElementById("maxcardinality").value = "";

    //setLast();
    document.getElementById("listitemsets")
        .textContent = "Viewing Maximal itemsets with support >= " + min_show_fre + ".";

    var maximalItemset = [];

    for(var i=0; i<initialFlattenCopy.length; i++){
        var currSet = initialFlattenCopy[i];

        if(currSet.frequency>=min_show_fre){
            var supersetList = findImmeSuperset(currSet.itemset, 0);

            if(supersetList.length == 0){
                maximalItemset.push(currSet);
            }
        }
    }

    buffer = buildTree(maximalItemset);

    sup_sub = true;
    init();
}

//display closed itemsets
function dispClosedSets(){
    document.getElementById("itemsetsQuery").checked = false;
    setItemsetQuery();
    setLast();

    document.getElementById("minfrequency").value = "";
    document.getElementById("maxfrequency").value = "";
    document.getElementById("mincardinality").value = "";
    document.getElementById("maxcardinality").value = "";

    //setLast();
    document.getElementById("listitemsets")
        .textContent = "Viewing Closed itemsets with support >= " + min_show_fre + ".";

    var closedItemsets = [];

    for(var i=0; i<initialFlattenCopy.length; i++){
        var currSet = initialFlattenCopy[i];

        if(currSet.frequency>=min_show_fre){
            var supersetList = findImmeSuperset(currSet.itemset, 1);

            var closed = true;
            for(var j = 0; j < supersetList.length; j++){
                if (currSet.frequency == supersetList[j].frequency) {
                    closed = false;
                    break;
                }
            }

            if(closed){
                closedItemsets.push(currSet);
            }
        }
    }

    buffer = buildTree(closedItemsets);

    sup_sub = true;
    init();
}

function findClosedItemset(obj) {
    if(obj.frequency>=min_show_fre){
        var supersetList = findImmeSuperset(obj.itemset, 1);

        var closed = true;
        for(var j = 0; j < supersetList.length; j++){
            if (obj.frequency == supersetList[j].frequency) {
                closed = false;
                break;
            }
        }

        if(closed){
            obj.notShow = false;
        }
        else{
            obj.notShow = true;
        }
    }
    else{
        obj.notShow = true;
    }

    if (obj.children.length > 0) {
        obj.children.forEach(function (d) {
            findClosedItemset(d);
        });
    }
}

function findMaximalItemset(obj){
    if(obj.frequency>=min_show_fre && findImmeSuperset(obj.itemset, 0).length==0 ){
        obj.notShow = false;
    }
    else{
        obj.notShow = true;
    }

    if (obj.children.length > 0) {
        obj.children.forEach(function (d) {
            findMaximalItemset(d);
        });
    }
}

function findImmeSuperset(set, mode){
    var immeSupersets = [];

    for(var i=0; i<initialFlattenCopy.length; i++){
        var currSet = initialFlattenCopy[i];

        if(currSet.itemset.length==set.length+1 && isSubset(set, currSet.itemset) && currSet.frequency>=min_show_fre){
            immeSupersets.push(currSet);

            if(mode == 0) {
                return immeSupersets;
            }
        }
    }

    return immeSupersets;
}

function setItemsetQuery(){
    var itemsetsQuery = document.getElementById("itemsetsQuery");
    var containSome = document.getElementById("itemsetsQueryMode1");
    var containAll = document.getElementById("itemsetsQueryMode2");
    var exclusiveAll = document.getElementById("itemsetsQueryMode3");
    var containExact = document.getElementById("itemsetsQueryMode4");
    var setBox = document.getElementById("itemsetsQuerySet");

    if(itemsetsQuery.checked){
        containSome.disabled = false;
        containAll.disabled = false;
        exclusiveAll.disabled = false;
        containExact.disabled = false;
        setBox.disabled = false;
    }
    else{
        containSome.disabled = true;
        containAll.disabled = true;
        exclusiveAll.disabled = true;
        containExact.disabled = true;
        setBox.disabled = true;
    }
}

function returnBack(){
    if(lastBuffer.length != 0){
        min_show_fre = last_min_fre;
        max_show_fre = last_max_fre;
        min_show_card = last_min_card;
        max_show_card = last_max_card;
        sup_sub = lastMode;

        document.getElementById("listitemsets").textContent = lastTitle;

        buffer = Array.from(lastBuffer);
        init();
    }
}

function setSectorOrder(){
    if(document.getElementById("alphaOrder").checked){
        sectorOrderMode = 0;
    }
    else if(document.getElementById("decreaseFreqOrder").checked){
        sectorOrderMode = 1;
    }
    else if(document.getElementById("increaseFreqOrder").checked){
        sectorOrderMode = 2;
    }

    init();
}

var read_data = function(event) {
    var file = event.target.files[0];

    if (file) {
        //var element = document.getElementById('quad_selector');
        //element.value = "";

        var root = {itemset:"ROOT", children:[]};

        var reader = new FileReader();

        reader.onload = function(e){
            var text = reader.result;
            var lines = text.split("\n");

            for (var i = 0; i < lines.length; i++) {
                if (lines[i].length > 0) {
                    var items = lines[i].split(" ");

                    children = root.children;

                    var support = parseInt(items[items.length-1]);

                    var superset = [];
                    for (var j = 0; j < items.length - 2; j++) {
                        superset.push(items[j]);
                    }

                    children = add_children(children, superset, support);
                }
            }

            frequent_itemsets = root;
            initialBufferCopy = frequent_itemsets.children;
            buffer = Array.from(initialBufferCopy);

            flattenList = [];
            flatten_itemsets(initialBufferCopy);
            initialFlattenCopy = Array.from(flattenList);
            initialFlattenCopy.reverse();

            init();
        };
        reader.readAsText(file);
    }
};

function add_children(children, ith_itemset, ith_frequency) {
    // Look for immediate parent.
    for (var i = 0; i < children.length; i++) {

        var is_superset = children[i].itemset.every(function(val) { return ith_itemset.indexOf(val) >= 0;});

        if (is_superset) {
            return add_children(children[i].children, ith_itemset, ith_frequency);
        }
    }
    children.push({"itemset": ith_itemset, "frequency": ith_frequency, "children":[]});

    return children[children.length-1].children;
}

init();

//**********************heatmap***************************/
function updataHeatmap(){
    var num_iter = 256;

    var itemsetText = document.getElementById("itemset");
    var heatmapBar = document.getElementById("heatmapBar1");

    while (heatmapBar.hasChildNodes()) {
        heatmapBar.removeChild(heatmapBar.lastChild);
    }

    while (itemsetText.hasChildNodes()) {
        itemsetText.removeChild(itemsetText.lastChild);
    }

    var gap = 360 / (max_card - min_card + 1);

    for(var h = 0; h <= 300; h = h + gap){

        for(var i = 1; i <= num_iter; i++){
            var ratio = (i / num_iter);
            var s = 0.5 + ratio * 0.5,
                v = 1 - ratio * 0.5;
            // s = 100 - ratio * 50,
            // l = 75 - ratio * 50;

            var rgbResult = hsv_to_rgb(h/360, s, v);
       
                
            //return "rgb(" + hsvResult[0] + "," + hsvResult[1] + "," + hsvResult[2] +  ")";

            var li_ = document.createElement("li");

            var span_ = document.createElement("span");
            span_.style = "background-color: rgb(" + rgbResult[0] + "," + rgbResult[1] + "," + rgbResult[2] + ")";

            span_.style.height = (100/(300/gap)) + "px";
            li_.style.height = (100/(300/gap)) + "px";
            
            li_.appendChild(span_);
            heatmapBar.appendChild(li_);
        }

        var thisItemsetText = document.createElement("text");
        thisItemsetText.style.height = (100/(300/gap)) + "px";

        thisItemsetText.textContent = "itemset-" + (min_card+h/gap);

        itemsetText.appendChild(thisItemsetText);
    }
}