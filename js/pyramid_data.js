var flattenList = [];
var initialBufferCopy = []; //frequent_itemsets.children;
var buffer = Array.from(initialBufferCopy);
// flatten_itemsets(initialBufferCopy);
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

var padding = { top: 20, right: 20, bottom: 20, left: 20 },
  width = 900 + 1,
  height = 700 + 1,
  r = height / 2 - 2 * padding.top;

var zoom = d3.zoom().on("zoom", zoomed).scaleExtent([1, 100]);

function zoomed() {
  svgContainer.attr(
    "transform",
    "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")"
  );

  svgContainer.selectAll(".blocks").attr("stroke-width", 1 / d3.event.scale);
}

function resetZoom() {
  svgContainer.attr("transform", d3.zoomIdentity);
  svgContainer.selectAll(".blocks").attr("stroke-width", "1");

  // zoom.scaleTo(1).translate([0,0]);
}

//svg container
var svg = d3
  .select("#chart")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(" + width / 6 + "," + 15 + ")")
  // .attr("class", "parentChart")
  .call(zoom);

var svgContainer = svg.append("g");

//for heatmap scale
var heatmapStartPos = 40;
var heatmapLength = 256;

var lineContainer = d3
  .select("#scale")
  .append("svg")
  .attr("width", 330)
  .attr("height", 50);
var scaleLine = lineContainer
  .append("line")
  .attr("x1", heatmapStartPos)
  .attr("y1", 0)
  .attr("x2", heatmapStartPos + heatmapLength - 3)
  .attr("y2", 0)
  .style("stroke", "black")
  .style("stroke-width", "3");

var lastBuffer = [];
var lastTitle = "";
var lastMode;
var last_min_fre = 1,
  last_max_fre = Number.MAX_VALUE,
  last_min_card = 1,
  last_max_card = Number.MAX_VALUE;




  function flatten_itemsets(list) {
    for (var i = list.length - 1; i >= 0; i--) {
      if (list[i].children.length > 0) {
        flatten_itemsets(list[i].children);
      }
  
      flattenList.push(list[i]);
      flattenList[flattenList.length - 1].d = 1;
    }
  }

function reverseArray(arr, i1, i2) {
  var temp;
  for (var i = i1; i <= (i2-i1)/2; i++) {
    temp = arr[i];
    arr[i] = arr[i2-i];
    arr[i2-i] = temp;
    console.log(arr[i]);
  }
  console.log("QQQQQQQQQQ");
  return arr;
}

function sortDataset(lines) {
  var itemset = [];
  var indexToReverse = 0,
    prevIndexToReverse = 0;

  for (var i = 0; i < lines.length; i++) {
    if (lines[i].length > 0) {
      var items = lines[i].split(" ");
      var superset = [];

      for (var j = 0; j < items.length - 2; j++) {
        superset.push(items[j]);
      }

      var itemsetIsSuperset = superset.every(function (val) {
        return itemset.indexOf(val) >= 0;
      });
      console.log(prevIndexToReverse,indexToReverse);
      if (!itemsetIsSuperset) {
        if ( itemset.length < superset.length || (itemset.length == 1 && superset.length == 1 && i != 0)) {
          itemset = superset;
          indexToReverse = i;
        }
    }
        else{
          lines = reverseArray(lines, prevIndexToReverse, indexToReverse);
          prevIndexToReverse = indexToReverse;
        }
      }
  }
  console.log("PPPPP", lines);
}

function add_children(children, ith_itemset, ith_frequency, lvl) {
  for (var i = 0; i < children.length; i++) {
    var is_superset = children[i].itemset.every(function (val) {
      return ith_itemset.indexOf(val) >= 0;
    });

    //   if( matchIndex == children[i].itemset.length-1){
    if (is_superset) {
      return add_children(children[i].children, ith_itemset, ith_frequency, lvl+1);
    }
    //   }
  }
  children.push({
    itemset: ith_itemset,
    frequency: ith_frequency,
    level: lvl,
    children: [],
  });

  return children[children.length - 1].children;
}

var read_data = function (event) {
  var file = event.target.files[0];

  if (file) {
    var root = { itemset: "ROOT", children: [] };

    var reader = new FileReader();

    reader.onload = function (e) {
      var text = reader.result;
      var lines = text.split("\n");
      var lvl = 0;
      // sortDataset(lines);
      for (var i = 0; i < lines.length; i++) {
        if (lines[i].length > 0) {
          var items = lines[i].split(" ");

          children = root.children;

          var support = parseInt(items[items.length - 1]);

          var superset = [];
          for (var j = 0; j < items.length - 2; j++) {
            superset.push(items[j]);
          }
          // console.log(children, superset, support);
          children = add_children(children, superset, support, lvl);
        }
      }

      frequent_itemsets = root;
      initialBufferCopy = root.children;
      buffer = Array.from(initialBufferCopy);
      //   buffer = root.children;

      flattenList = [];
      flatten_itemsets(initialBufferCopy);
      // initialFlattenCopy = Array.from(flattenList);
      // initialFlattenCopy.reverse();

      var text = JSON.stringify(flattenList, null, "  ");
      console.log(text);
      // init();

      //   drawTree(root);
    };
    reader.readAsText(file);
  }
};
