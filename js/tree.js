function setLast() {
  last_min_fre = min_show_fre;
  last_max_fre = max_show_fre;
  last_min_card = min_show_card;
  last_max_card = max_show_card;
  lastTitle = document.getElementById("listitemsets").textContent;
  lastBuffer = [];

  buffer.children.forEach(function (d) {
    lastBuffer.push(deepCopy(d));
  });
  lastMode = sup_sub;
}

function deepCopy(obj) {
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
var initialBufferCopy = []; //frequent_itemsets.children;
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

function preCal() {
  max_fre = Math.max.apply(
    Math,
    displayed_list.map(function (o) {
      return o.frequency;
    })
  );
  min_fre = Math.min.apply(
    Math,
    displayed_list.map(function (o) {
      return o.frequency;
    })
  );

  max_card = Math.max.apply(
    Math,
    displayed_list.map(function (o) {
      return o.itemset.length;
    })
  );
  min_card = Math.min.apply(
    Math,
    displayed_list.map(function (o) {
      return o.itemset.length;
    })
  );

  // radius = d3.scale.linear().domain([0, 7]).range([0, r]);
}

function getDisplayed(obj) {
  if (obj.children.length > 0) {
    obj.children.forEach(function (d) {
      getDisplayed(d);
    });
  }

  if (!obj.notShow) {
    displayed_list.push(obj);
  }
}

function filter(list) {
  var result = [];

  for (var i = 0; i < list.length; i++) {
    if (
      list[i].frequency >= min_show_fre &&
      list[i].frequency <= max_show_fre &&
      list[i].itemset.length >= min_show_card &&
      list[i].itemset.length <= max_show_card
    ) {
      result.push(list[i]);
    }
  }

  return result;
}

function getMinMaxEachCard() {
  var result = [];

  for (var i = min_card; i <= max_card; i++) {
    result.push([Number.MAX_VALUE, Number.MIN_VALUE]);
  }

  for (var i = 0; i < curr_set_to_display.length; i++) {
    var currCard = curr_set_to_display[i].itemset.length;
    var currFreq = curr_set_to_display[i].frequency;

    if (result[currCard - min_card][0] > currFreq) {
      result[currCard - min_card][0] = currFreq;
    }

    if (result[currCard - min_card][1] < currFreq) {
      result[currCard - min_card][1] = currFreq;
    }
  }

  return result;
}

function setAnglesWeight(buffer) {
  var totalWeight = 0;

  for (var i = 0; i < buffer.length; i++) {
    buffer[i].weight = countCardLevel(buffer[i], 1);
    totalWeight += buffer[i].weight;
  }

  return totalWeight;
}

function countCardLevel(obj, weight) {
  var result = weight;

  for (var i = 0; i < obj.children.length; i++) {
    if (result < countCardLevel(obj.children[i], weight + 1)) {
      result = countCardLevel(obj.children[i], weight + 1);
    }
  }

  return result;
}

function sortBuffer(buffer) {
  for (var i = 0; i < buffer.length; i++) {
    if (buffer[i].children.length > 0) {
      sortBuffer(buffer[i].children);
    }
  }

  if (sectorOrderMode == 0) {
    buffer.sort(function (a, b) {
      return (
        a.itemset[a.itemset.length - 1] - b.frequency[b.itemset.length - 1]
      );
    });
  } else if (sectorOrderMode == 1) {
    buffer.sort(function (a, b) {
      return a.frequency - b.frequency;
    });
  } else if (sectorOrderMode == 2) {
    buffer.sort(function (a, b) {
      return b.frequency - a.frequency;
    });
  }
}

function init() {
  flattenList = [];
  flatten_itemsets(buffer);

  var filteredList = filter(flattenList);
  buffer = buildTree(filteredList);
  sortBuffer(buffer.children);

  // var text = JSON.stringify(flattenList, null, '  ');
  // console.log(text);
  drawTree(buffer);

  updataHeatmap();
}

//from https://gist.github.com/mjackson/5311256
function hsv_to_rgb(h, s, v) {
  var r, g, b;

  var i = Math.floor(h * 6);
  var f = h * 6 - i;
  var p = v * (1 - s);
  var q = v * (1 - f * s);
  var t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0:
      (r = v), (g = t), (b = p);
      break;
    case 1:
      (r = q), (g = v), (b = p);
      break;
    case 2:
      (r = p), (g = v), (b = t);
      break;
    case 3:
      (r = p), (g = q), (b = v);
      break;
    case 4:
      (r = t), (g = p), (b = v);
      break;
    case 5:
      (r = v), (g = p), (b = q);
      break;
  }

  return [r * 255, g * 255, b * 255];
}

function flatten_itemsets(list) {
  for (var i = list.length - 1; i >= 0; i--) {
    if (list[i].children.length > 0) {
      flatten_itemsets(list[i].children);
    }

    flattenList.push(list[i]);
    flattenList[flattenList.length - 1].d = 1;
  }
}

function showHints() {
  if (document.getElementById("hintText").checked) {
    document.getElementById("hints").classList.add("showHints");
  } else {
    document.getElementById("hints").className = document
      .getElementById("hints")
      .classList.remove("showHints");
  }

  if (document.getElementById("showHeatmap").checked) {
    document.getElementById("heatmap").classList.add("showHeatmap");
    document.getElementById("scale").classList.add("showScale");
  } else {
    document.getElementById("heatmap").className = document
      .getElementById("heatmap")
      .classList.remove("showHeatmap");
    document.getElementById("scale").className = document
      .getElementById("scale")
      .classList.remove("showScale");
  }
}

function resetShow(obj) {
  if (obj.children.length > 0) {
    obj.children.forEach(function (d) {
      resetShow(d);
    });
  }

  obj.notShow = false;
}

function setChildShow(obj, selectedSet, notShow) {
  obj.notShow = notShow;

  if (equal(obj.itemset, selectedSet)) {
    notShow = false;
  }

  if (obj.children.length > 0) {
    obj.children.forEach(function (d) {
      setChildShow(d, selectedSet, notShow);
    });
  }
}

function buildTree(list) {
  list.sort(function (a, b) {
    var result = 0;

    var i = 0;
    while (result == 0) {
      if (i == a.itemset.length || i == b.itemset.length) {
        result = a.itemset.length - b.itemset.length;
      } else {
        result = a.itemset[i].localeCompare(b.itemset[i]);
      }
      i++;
    }

    return result;
  });

  var root = { itemset: "ROOT", children: [] };

  for (var i = 0; i < list.length; i++) {
    var support = list[i].frequency;
    var superset = list[i].itemset;
    children = root.children;

    children = add_children(children, superset, support);
  }

  return root;
}

function filterLeftClick(d) {
  document.getElementById("resetZoom").click();

  if (document.getElementById("mode1").checked) {
    var extension = false;
    var chosed = d.data;

    if (chosed.children.length != 0) {
      setLast();

      buffer = d.data.children;
      sup_sub = true;

      init();

      extension = true;
    }

    if (extension) {
      document.getElementById("itemsetsQuery").checked = false;
      setItemsetQuery();

      document.getElementById("listitemsets").textContent =
        "Viewing extensions of { " +
        d.data.itemset +
        " } -> " +
        d.data.frequency +
        ", which satisfy:\r\n";
      showCriteria();
    } else {
      var toast = document.getElementById("toast");
      document.getElementById("desc").innerHTML =
        "It does not have extension under criteria.";
      toast.classList.add("show");
      setTimeout(function () {
        toast.className = toast.classList.remove("show");
      }, 2000);
    }
  } else if (document.getElementById("mode2").checked) {
    var supersetsList = findSuperset(d.data.itemset);

    if (supersetsList.length > 0) {
      document.getElementById("itemsetsQuery").checked = false;
      setItemsetQuery();
      setLast();

      document.getElementById("listitemsets").textContent =
        "Viewing supersets of { " +
        d.data.itemset +
        " } -> " +
        d.data.frequency +
        ", which satisfy:\r\n";
      showCriteria();

      buffer = buildTree(supersetsList);

      sup_sub = true;
      init();
    } else {
      var toast = document.getElementById("toast");
      document.getElementById("desc").innerHTML =
        "It does not have superset under criteria.";
      toast.classList.add("show");
      setTimeout(function () {
        toast.className = toast.classList.remove("show");
      }, 2000);
    }
  }
}

function filterSet(obj, set) {
  if (
    list_iter_index == set.length ||
    !equal(obj.itemset, set[list_iter_index])
  ) {
    obj.notShow = true;
  } else {
    obj.notShow = false;
    list_iter_index++;
  }

  if (obj.children.length > 0) {
    obj.children.forEach(function (d) {
      filterSet(d, set);
    });
  }
}

function equal(set1, set2) {
  if (set1.length != set2.length) {
    return false;
  }

  for (var i = 0; i < set1.length; i++) {
    if (!set2.includes(set1[i])) {
      return false;
    }
  }

  return true;
}

function filterCri(obj) {
  if (obj.children.length > 0) {
    obj.children.forEach(function (d) {
      filterCri(d);
    });
  }

  if (
    obj.frequency < min_show_fre ||
    obj.frequency > max_show_fre ||
    obj.itemset.length < min_show_card ||
    obj.itemset.length > max_show_card
  ) {
    obj.notShow = true;
  }
}

function findSubset(superset) {
  var subsets = [];

  for (var i = 0; i < initialFlattenCopy.length; i++) {
    var currSet = initialFlattenCopy[i];

    if (
      isSubset(currSet.itemset, superset) &&
      satisfyCriteria(currSet) &&
      superset.length != currSet.itemset.length
    ) {
      subsets.push(currSet);
    }
  }

  return subsets;
}

function findSuperset(subset) {
  var supersets = [];

  for (var i = 0; i < initialFlattenCopy.length; i++) {
    var currSet = initialFlattenCopy[i];

    if (
      isSubset(subset, currSet.itemset) &&
      satisfyCriteria(currSet) &&
      subset.length != currSet.itemset.length
    ) {
      supersets.push(currSet);
    }
  }

  return supersets;
}

function isSubset(subset, set) {
  for (var i = 0; i < subset.length; i++) {
    if (!set.includes(subset[i])) {
      return false;
    }
  }

  return true;
}

function satisfyCriteria(set) {
  if (
    set.frequency >= min_show_fre &&
    set.frequency <= max_show_fre &&
    set.itemset.length >= min_show_card &&
    set.itemset.length <= max_show_card
  ) {
    return true;
  }
  return false;
}

function findPrefix(set) {
  var prefixItemsetList = [];
  for (var n = 1; n < set.length; n++) {
    var prefixItemset = set.slice(0, set.length - n);
    prefixItemsetList.push(prefixItemset);
  }
  prefixItemsetList.reverse();

  var resultList = [];
  var j = 0;
  for (var i = 0; i < initialFlattenCopy.length; i++) {
    if (j == prefixItemsetList.length) {
      break;
    }

    var currSet = initialFlattenCopy[i];

    if (equal(currSet.itemset, prefixItemsetList[j])) {
      resultList.push(currSet);
      j++;
    }
  }

  return resultList;
}

function filterRightClick(d) {
  document.getElementById("resetZoom").click();

  var mode1 = document.getElementById("mode1").checked;

  if (mode1) {
    if (d.data.itemset.length > 1) {
      document.getElementById("itemsetsQuery").checked = false;
      setItemsetQuery();
      setLast();

      document.getElementById("listitemsets").textContent =
        "Viewing prefixes of { " +
        d.data.itemset +
        " } -> " +
        d.data.frequency +
        ", which satisfy:\r\n";
      showCriteria();

      var prefixItemsetList = findPrefix(d.data.itemset);

      buffer = buildTree(prefixItemsetList);

      sup_sub = true;
      init();
    } else {
      var toast = document.getElementById("toast");
      document.getElementById("desc").innerHTML =
        "It does not have prefix under criteria.";
      toast.classList.add("show");
      setTimeout(function () {
        toast.className = toast.classList.remove("show");
      }, 2000);
    }
  } else {
    var subsetList = findSubset(d.data.itemset);

    if (subsetList.length > 0) {
      document.getElementById("itemsetsQuery").checked = false;
      setItemsetQuery();
      setLast();

      document.getElementById("listitemsets").textContent =
        "Viewing subsets of { " +
        d.data.itemset +
        " } -> " +
        d.data.frequency +
        ", which satisfy:\r\n";
      showCriteria();

      buffer = buildTree(subsetList);

      sup_sub = true;
      init();
    } else {
      var toast = document.getElementById("toast");
      document.getElementById("desc").innerHTML =
        "It does not have subset under criteria.";
      toast.classList.add("show");
      setTimeout(function () {
        toast.className = toast.classList.remove("show");
      }, 2000);
    }
  }
}

function showCriteria() {
  var titleContainer = document.getElementById("listitemsets");
  titleContainer.innerHTML += "Min frequency = " + min_show_fre;
  if (max_show_fre == Number.MAX_VALUE) {
    titleContainer.innerHTML += "\r\nMax frequency = +&#8734";
  } else {
    titleContainer.innerHTML += "\r\nMax frequency = " + max_show_fre;
  }
  titleContainer.innerHTML += "\r\nMin cardinality = " + min_show_card;
  if (max_show_card == Number.MAX_VALUE) {
    titleContainer.innerHTML += "\r\nMax cardinality = +&#8734";
  } else {
    titleContainer.innerHTML += "\r\nMax cardinality = " + max_show_card;
  }

  if (document.getElementById("itemsetsQuery").checked) {
    var querySet = document.getElementById("itemsetsQuerySet").value.trim();
    if (document.getElementById("itemsetsQueryMode1").checked) {
      titleContainer.innerHTML += "\r\nContain some {" + querySet + "}";
    } else if (document.getElementById("itemsetsQueryMode2").checked) {
      titleContainer.innerHTML += "\r\nContain all {" + querySet + "}";
    } else if (document.getElementById("itemsetsQueryMode3").checked) {
      titleContainer.innerHTML += "\r\nExclusive all {" + querySet + "}";
    } else if (document.getElementById("itemsetsQueryMode4").checked) {
      titleContainer.innerHTML += "\r\nContain exact {" + querySet + "}";
    }
  }

  if (document.getElementById("filterGlobalMode").checked) {
    titleContainer.innerHTML += "\r\nGlobal filter";
  } else {
    titleContainer.innerHTML += "\r\nLocal filter.";
  }
}

//reset graph
function resetAll() {
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

  document.getElementById("listitemsets").textContent = "Viewing all itemsets.";

  buffer = Array.from(initialBufferCopy);
  buffer.forEach(function (d) {
    resetShow(d);
  });

  init();
}

//criteria filter
function filterCriteria() {
  setLast();

  var minFrequency = document.getElementById("minfrequency").value;
  var maxFrequency = document.getElementById("maxfrequency").value;
  var minCardinality = document.getElementById("mincardinality").value;
  var maxCardinality = document.getElementById("maxcardinality").value;

  if (minFrequency.trim() == "") {
    minFrequency = 1;
  } else {
    minFrequency = parseInt(minFrequency);
  }

  if (maxFrequency.trim() == "") {
    maxFrequency = Number.MAX_VALUE;
  } else {
    maxFrequency = parseInt(maxFrequency);
  }

  if (minCardinality.trim() == "") {
    minCardinality = 1;
  } else {
    minCardinality = parseInt(minCardinality);
  }

  if (maxCardinality.trim() == "") {
    maxCardinality = Number.MAX_VALUE;
  } else {
    maxCardinality = parseInt(maxCardinality);
  }

  if (minFrequency > maxFrequency) {
    alert("Frequency range is illegal.");
    return;
  }

  if (minCardinality > maxCardinality) {
    alert("Cardinality range is illegal.");
    return;
  }

  if (!isNaN(minFrequency)) {
    min_show_fre = minFrequency;
  } else {
    alert("Min frequency is illegal.");
  }

  if (!isNaN(maxFrequency)) {
    max_show_fre = maxFrequency;
  } else {
    alert("Max frequency is illegal.");
  }

  if (!isNaN(minCardinality)) {
    min_show_card = minCardinality;
  } else {
    alert("Min cardinality is illegal.");
  }

  if (!isNaN(maxCardinality)) {
    max_show_card = maxCardinality;
  } else {
    alert("Max cardinality is illegal.");
  }

  var filterGlobalMode = document.getElementById("filterGlobalMode");
  if (filterGlobalMode.checked) {
    buffer = Array.from(initialBufferCopy);

    buffer.forEach(function (d) {
      resetShow(d);
    });
  } else buffer = buffer.children;

  flattenList = [];
  flatten_itemsets(buffer);

  var itemsetsQuery = document.getElementById("itemsetsQuery");
  if (itemsetsQuery.checked) {
    var containSome = document.getElementById("itemsetsQueryMode1");
    var containAll = document.getElementById("itemsetsQueryMode2");
    var exclusiveAll = document.getElementById("itemsetsQueryMode3");
    var containExact = document.getElementById("itemsetsQueryMode4");
    var querySet = document
      .getElementById("itemsetsQuerySet")
      .value.trim()
      .split(" ");

    var temp = [];
    if (containSome.checked) {
      for (var i = 0; i < flattenList.length; i++) {
        var curr = flattenList[i];
        for (var j = 0; j < querySet.length; j++) {
          if (curr.itemset.includes(querySet[j])) {
            temp.push(curr);
            break;
          }
        }
      }
    } else if (containAll.checked) {
      for (var i = 0; i < flattenList.length; i++) {
        var curr = flattenList[i];
        var contain = true;
        for (var j = 0; j < querySet.length; j++) {
          if (!curr.itemset.includes(querySet[j])) {
            contain = false;
            break;
          }
        }
        if (contain) {
          temp.push(curr);
        }
      }
    } else if (exclusiveAll.checked) {
      for (var i = 0; i < flattenList.length; i++) {
        var curr = flattenList[i];
        var contain = false;
        for (var j = 0; j < querySet.length; j++) {
          if (curr.itemset.includes(querySet[j])) {
            contain = true;
            break;
          }
        }
        if (!contain) {
          temp.push(curr);
        }
      }
    } else if (containExact.checked) {
      var found = false;

      for (var i = 0; i < flattenList.length && !found; i++) {
        var curr = flattenList[i];
        if (curr.itemset.length != querySet.length) {
          continue;
        }

        var contain = true;
        for (var j = 0; j < querySet.length; j++) {
          if (!curr.itemset.includes(querySet[j])) {
            contain = false;
            break;
          }
        }

        if (contain) {
          found = true;
          temp.push(curr);
        }
      }
    }

    buffer = buildTree(temp);
    buffer = buffer.children;
  }

  if (
    min_show_fre == 1 &&
    max_show_fre == Number.MAX_VALUE &&
    min_show_card == 1 &&
    max_show_card == Number.MAX_VALUE &&
    !itemsetsQuery.checked
  ) {
    document.getElementById("listitemsets").textContent =
      "Viewing all itemsets.";
  } else {
    document.getElementById("listitemsets").textContent =
      "Viewing itemsets satisfy:\r\n";
    showCriteria();
  }

  sup_sub = true;
  init();
}

function containExactQuery(obj, querySet) {
  if (obj.itemset.length == querySet.length) {
    var same = true;
    for (var j = 0; j < querySet.length; j++) {
      if (!obj.itemset.includes(querySet[j])) {
        same = false;
        break;
      }
    }

    if (!same) {
      obj.notShow = true;
    }
  } else {
    obj.notShow = true;
  }

  if (obj.children.length > 0) {
    obj.children.forEach(function (d) {
      containExactQuery(d, querySet);
    });
  }
}

function exclusiveAllQuery(obj, querySet) {
  var contain = false;

  for (var j = 0; j < querySet.length; j++) {
    if (obj.itemset.includes(querySet[j])) {
      contain = true;
      break;
    }
  }

  if (contain) {
    obj.notShow = true;
  }

  if (obj.children.length > 0) {
    obj.children.forEach(function (d) {
      exclusiveAllQuery(d, querySet);
    });
  }
}

function containAllQuery(obj, querySet) {
  var containAll = true;

  for (var j = 0; j < querySet.length; j++) {
    if (!obj.itemset.includes(querySet[j])) {
      containAll = false;
      break;
    }
  }

  if (!containAll) {
    obj.notShow = true;
  }

  if (obj.children.length > 0) {
    obj.children.forEach(function (d) {
      containAllQuery(d, querySet);
    });
  }
}

function containSomeQuery(obj, querySet) {
  var containSome = false;

  for (var j = 0; j < querySet.length; j++) {
    if (obj.itemset.includes(querySet[j])) {
      containSome = true;
      break;
    }
  }

  if (!containSome) {
    obj.notShow = true;
  }

  if (obj.children.length > 0) {
    obj.children.forEach(function (d) {
      containSomeQuery(d, querySet);
    });
  }
}

//display maximal itemsets
function dispMaximalSets() {
  document.getElementById("itemsetsQuery").checked = false;
  setItemsetQuery();
  setLast();

  document.getElementById("minfrequency").value = "";
  document.getElementById("maxfrequency").value = "";
  document.getElementById("mincardinality").value = "";
  document.getElementById("maxcardinality").value = "";

  //setLast();
  document.getElementById("listitemsets").textContent =
    "Viewing Maximal itemsets with support >= " + min_show_fre + ".";

  var maximalItemset = [];

  for (var i = 0; i < initialFlattenCopy.length; i++) {
    var currSet = initialFlattenCopy[i];

    if (currSet.frequency >= min_show_fre) {
      var supersetList = findImmeSuperset(currSet.itemset, 0);

      if (supersetList.length == 0) {
        maximalItemset.push(currSet);
      }
    }
  }

  buffer = buildTree(maximalItemset);

  buffer = buffer.children;

  sup_sub = true;
  init();
}

//display closed itemsets
function dispClosedSets() {
  document.getElementById("itemsetsQuery").checked = false;
  setItemsetQuery();
  setLast();

  document.getElementById("minfrequency").value = "";
  document.getElementById("maxfrequency").value = "";
  document.getElementById("mincardinality").value = "";
  document.getElementById("maxcardinality").value = "";

  //setLast();
  document.getElementById("listitemsets").textContent =
    "Viewing Closed itemsets with support >= " + min_show_fre + ".";

  var closedItemsets = [];

  for (var i = 0; i < initialFlattenCopy.length; i++) {
    var currSet = initialFlattenCopy[i];

    if (currSet.frequency >= min_show_fre) {
      var supersetList = findImmeSuperset(currSet.itemset, 1);

      var closed = true;
      for (var j = 0; j < supersetList.length; j++) {
        if (currSet.frequency == supersetList[j].frequency) {
          closed = false;
          break;
        }
      }

      if (closed) {
        closedItemsets.push(currSet);
      }
    }
  }

  buffer = buildTree(closedItemsets);
  buffer = buffer.children;
  sup_sub = true;
  init();
}

function findClosedItemset(obj) {
  if (obj.frequency >= min_show_fre) {
    var supersetList = findImmeSuperset(obj.itemset, 1);

    var closed = true;
    for (var j = 0; j < supersetList.length; j++) {
      if (obj.frequency == supersetList[j].frequency) {
        closed = false;
        break;
      }
    }

    if (closed) {
      obj.notShow = false;
    } else {
      obj.notShow = true;
    }
  } else {
    obj.notShow = true;
  }

  if (obj.children.length > 0) {
    obj.children.forEach(function (d) {
      findClosedItemset(d);
    });
  }
}

function findMaximalItemset(obj) {
  if (
    obj.frequency >= min_show_fre &&
    findImmeSuperset(obj.itemset, 0).length == 0
  ) {
    obj.notShow = false;
  } else {
    obj.notShow = true;
  }

  if (obj.children.length > 0) {
    obj.children.forEach(function (d) {
      findMaximalItemset(d);
    });
  }
}

function findImmeSuperset(set, mode) {
  var immeSupersets = [];

  for (var i = 0; i < initialFlattenCopy.length; i++) {
    var currSet = initialFlattenCopy[i];

    if (
      currSet.itemset.length == set.length + 1 &&
      isSubset(set, currSet.itemset) &&
      currSet.frequency >= min_show_fre
    ) {
      immeSupersets.push(currSet);

      if (mode == 0) {
        return immeSupersets;
      }
    }
  }

  return immeSupersets;
}

function setItemsetQuery() {
  var itemsetsQuery = document.getElementById("itemsetsQuery");
  var containSome = document.getElementById("itemsetsQueryMode1");
  var containAll = document.getElementById("itemsetsQueryMode2");
  var exclusiveAll = document.getElementById("itemsetsQueryMode3");
  var containExact = document.getElementById("itemsetsQueryMode4");
  var setBox = document.getElementById("itemsetsQuerySet");

  if (itemsetsQuery.checked) {
    containSome.disabled = false;
    containAll.disabled = false;
    exclusiveAll.disabled = false;
    containExact.disabled = false;
    setBox.disabled = false;
  } else {
    containSome.disabled = true;
    containAll.disabled = true;
    exclusiveAll.disabled = true;
    containExact.disabled = true;
    setBox.disabled = true;
  }
}

function returnBack() {
  if (lastBuffer.length != 0) {
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

function setSectorOrder() {
  if (document.getElementById("alphaOrder").checked) {
    sectorOrderMode = 0;
  } else if (document.getElementById("decreaseFreqOrder").checked) {
    sectorOrderMode = 1;
  } else if (document.getElementById("increaseFreqOrder").checked) {
    sectorOrderMode = 2;
  }

  buffer = buffer.children;
  init();
}

function add_children(children, ith_itemset, ith_frequency) {
  for (var i = 0; i < children.length; i++) {
    var is_superset = children[i].itemset.every(function (val) {
      return ith_itemset.indexOf(val) >= 0;
    });

    //   if( matchIndex == children[i].itemset.length-1){
    if (is_superset) {
      return add_children(children[i].children, ith_itemset, ith_frequency);
    }
    //   }
  }
  children.push({
    itemset: ith_itemset,
    frequency: ith_frequency,
    children: [],
  });

  return children[children.length - 1].children;
}

var read_data = function (event) {
  //event
  var file = event.target.files[0];

  if (file) {
    var root = { itemset: "ROOT", children: [] };

    var reader = new FileReader();

    reader.onload = function (e) {
      var text = reader.result;
      var lines = text.split("\n");
      for (var i = 0; i < lines.length; i++) {
        if (lines[i].length > 0) {
          var items = lines[i].split(" ");

          children = root.children;

          var support = parseInt(items[items.length - 1]);

          var superset = [];
          for (var j = 0; j < items.length - 2; j++) {
            superset.push(items[j]);
          }
          children = add_children(children, superset, support);
        }
      }

      frequent_itemsets = root;
      initialBufferCopy = root.children;
      buffer = Array.from(initialBufferCopy);
      //   buffer = root.children;

      flattenList = [];
      flatten_itemsets(initialBufferCopy);
      initialFlattenCopy = Array.from(flattenList);
      initialFlattenCopy.reverse();

        var text = JSON.stringify(flattenList, null, '');
        console.log(text);
      init();

      //   drawTree(root);
    };
    reader.readAsText(file);
  }
};

function drawTree(root) {
  const treemap = d3.tree().size([500, 500]);
  let nodes = d3.hierarchy(root, (d) => d.children);
  nodes = treemap(nodes);
  console.log("OOOO", nodes.descendants());
  //   const svg = d3
  //       .select("body")
  //       .append("svg")
  //       .attr("width", width + padding.left + padding.right)
  //       .attr("height", height + padding.top + padding.bottom),
  //     g = svg
  //       .append("g")
  //       .attr("transform", "translate(" + padding.left + "," + padding.top + ")");
  // const g = svgContainer;//.selectAll(".blocks");
  // const g = svg.append("g");
  // const svgContainer = svg;//.select("parentChart");

  svgContainer.html("");

  const node = svgContainer
    .selectAll(".node")
    .data(nodes.descendants())
    .enter()
    .append("g")
    .attr(
      "class",
      (d) => "node" + (d.children ? " node--internal" : " node--leaf")
    )
    .attr("transform", (d) => "translate(" + d.y + "," + d.x + ")")
    .on("click", filterLeftClick)
    .on("contextmenu", filterRightClick);

  const shades = [
    "#900c00",
    "#900c00",
    "#900c00",
    "#910c00",
    "#910b00",
    "#920c00",
    "#930c00",
    "#940c00",
    "#950c00",
    "#960d00",
    "#980e00",
    "#9a0e00",
    "#9b0f00",
    "#9d1000",
    "#9f1101",
    "#a11202",
    "#a31302",
    "#a51403",
    "#a81604",
    "#aa1704",
    "#ac1805",
    "#af1a05",
    "#b11b06",
    "#b41d07",
    "#b61f07",
    "#b92108",
    "#bb2309",
    "#be2409",
    "#c1260a",
    "#c3280b",
    "#c62a0b",
    "#c92d0c",
    "#cb2f0d",
    "#ce310d",
    "#d0330e",
    "#d3360f",
    "#d5380f",
    "#d83a10",
    "#da3d10",
    "#dd3f11",
    "#df4212",
    "#e24412",
    "#e44713",
    "#e64913",
    "#e84c14",
    "#ea4f14",
    "#ec5115",
    "#ee5415",
    "#f05716",
    "#f25916",
    "#f45c17",
    "#f65f18",
    "#f76118",
    "#f96418",
    "#fa6719",
    "#fc6a19",
    "#fd6c1a",
    "#ff6f1a",
    "#ff721b",
    "#ff751b",
    "#ff781c",
    "#ff7a1c",
    "#ff7d1d",
    "#ff801d",
    "#ff831d",
    "#ff851e",
    "#ff881e",
    "#ff8b1f",
    "#ff8e1f",
    "#ff9020",
    "#ff9320",
    "#ff9621",
    "#ff9921",
    "#ff9b21",
    "#ff9e22",
    "#ffa022",
    "#ffa323",
    "#ffa623",
    "#ffa824",
    "#ffab24",
    "#ffad25",
    "#ffb025",
    "#ffb226",
    "#ffb526",
    "#ffb727",
    "#feb927",
    "#fdbc28",
    "#fbbe28",
    "#fac029",
    "#f8c329",
    "#f7c52a",
    "#f5c72b",
    "#f3c92b",
    "#f1cb2c",
    "#f0ce2c",
    "#eed02d",
    "#ecd22e",
    "#e9d42f",
    "#e7d52f",
    "#e5d730",
    "#e3d931",
    "#e0db32",
    "#dedd32",
    "#dcdf33",
    "#d9e034",
    "#d7e235",
    "#d4e336",
    "#d1e537",
    "#cfe738",
    "#cce839",
    "#c9e93a",
    "#c6eb3b",
    "#c3ec3c",
    "#c1ed3d",
    "#beef3e",
    "#bbf03f",
    "#b8f141",
    "#b5f242",
    "#b2f343",
    "#aff444",
    "#acf546",
    "#a9f647",
    "#a6f748",
    "#a2f84a",
    "#9ff84b",
    "#9cf94d",
    "#99fa4e",
    "#96fa50",
    "#93fb51",
    "#90fb53",
    "#8dfc55",
    "#8afc56",
    "#87fd58",
    "#84fd5a",
    "#81fd5c",
    "#7efd5d",
    "#7bfe5f",
    "#78fe61",
    "#75fe63",
    "#72fe65",
    "#6ffe67",
    "#6cfd69",
    "#69fd6b",
    "#66fd6d",
    "#64fd6f",
    "#61fd71",
    "#5efc74",
    "#5cfc76",
    "#59fb78",
    "#56fb7a",
    "#54fa7d",
    "#51fa7f",
    "#4ff981",
    "#4df884",
    "#4af786",
    "#48f788",
    "#46f68b",
    "#44f58d",
    "#42f490",
    "#40f392",
    "#3ef295",
    "#3cf197",
    "#3af09a",
    "#39ef9c",
    "#37ed9f",
    "#35eca1",
    "#34eba4",
    "#32e9a6",
    "#31e8a9",
    "#30e6ac",
    "#2ee5ae",
    "#2de3b1",
    "#2ce2b3",
    "#2be0b6",
    "#2adfb8",
    "#29ddbb",
    "#29dbbe",
    "#28d9c0",
    "#27d8c3",
    "#27d6c5",
    "#26d4c8",
    "#26d2ca",
    "#26d0cc",
    "#25cecf",
    "#25ccd1",
    "#25cad3",
    "#25c8d6",
    "#25c6d8",
    "#25c3da",
    "#25c1dc",
    "#26bfdf",
    "#26bde1",
    "#26bbe3",
    "#27b8e5",
    "#27b6e6",
    "#28b4e8",
    "#28b1ea",
    "#29afec",
    "#2aaced",
    "#2aaaef",
    "#2ba7f0",
    "#2ca5f1",
    "#2da2f3",
    "#2ea0f4",
    "#2f9df5",
    "#309bf6",
    "#3198f7",
    "#3295f7",
    "#3393f8",
    "#3590f8",
    "#368df9",
    "#378bf9",
    "#3888f9",
    "#3985f9",
    "#3a83f9",
    "#3c80f8",
    "#3d7df7",
    "#3e7af7",
    "#3f78f6",
    "#4075f5",
    "#4172f3",
    "#426ff2",
    "#446df0",
    "#446aee",
    "#4567ec",
    "#4664ea",
    "#4761e7",
    "#485fe5",
    "#495ce2",
    "#4959de",
    "#4a56db",
    "#4a54d7",
    "#4b51d3",
    "#4b4ecf",
    "#4b4cca",
    "#4b49c5",
    "#4b46c0",
    "#4a44bb",
    "#4a41b5",
    "#493eaf",
    "#493ca8",
    "#4839a2",
    "#46369b",
    "#453493",
    "#44318b",
    "#422f83",
    "#402c7b",
    "#3e2a72",
    "#3b2768",
    "#39255f",
    "#362354",
    "#32204a",
    "#2f1e3f",
    "#2b1c33",
    "#271a28",
    "#23171b",
  ];
  var scale = d3.scaleQuantize().domain([0, 256]).range(shades);

  node
    .append("circle")
    .attr("r", 20)
    // .data(d3.range(101))
    // .style("stroke", (d) => d.data.type)
    // .style("fill", "yellow");
    .style("fill", (d) => scale(d.data.frequency));

  const link = svgContainer
    .selectAll(".link")
    .data(nodes.descendants().slice(1))
    .enter()
    .append("path")
    .attr("class", "link")
    .style("stroke", "orange")
    .attr("d", (d) => {
      return "M" + d.y + "," + d.x + " " + d.parent.y + "," + d.parent.x;
    });

  var tooltip = d3
    .select("body")
    .append("div")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .text("a simple tooltip");

  node
    .append("text")
    .text((d) => {
      if( d.data.itemset == 'ROOT')
        return d.data.itemset;
      return '{'+d.data.itemset+'}:'+d.data.frequency;//[d.depth - 1];
    })
    .attr("dx", 15 + "px")
    .attr("dy", -15 + "px")
    .on("mouseover", function (d) {
      tooltip.text(d.data.itemset);
      return tooltip.style("visibility", "visible");
    })
    .on("mousemove", function () {
      return tooltip
        .style("top", d3.event.pageY - 10 + "px")
        .style("left", d3.event.pageX + 10 + "px");
    })
    .on("mouseout", function () {
      return tooltip.style("visibility", "hidden");
    });
}

//**********************heatmap***************************/
function updataHeatmap() {
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

  for (var h = 0; h <= 300; h = h + gap) {
    for (var i = 1; i <= num_iter; i++) {
      var ratio = i / num_iter;
      var s = 0.5 + ratio * 0.5,
        v = 1 - ratio * 0.5;
      // s = 100 - ratio * 50,
      // l = 75 - ratio * 50;

      var rgbResult = hsv_to_rgb(h / 360, s, v);

      //return "rgb(" + hsvResult[0] + "," + hsvResult[1] + "," + hsvResult[2] +  ")";

      var li_ = document.createElement("li");

      var span_ = document.createElement("span");
      span_.style =
        "background-color: rgb(" +
        rgbResult[0] +
        "," +
        rgbResult[1] +
        "," +
        rgbResult[2] +
        ")";

      span_.style.height = 100 / (300 / gap) + "px";
      li_.style.height = 100 / (300 / gap) + "px";

      li_.appendChild(span_);
      heatmapBar.appendChild(li_);
    }

    var thisItemsetText = document.createElement("text");
    thisItemsetText.style.height = 100 / (300 / gap) + "px";

    thisItemsetText.textContent = min_card + h / gap + "-itemset";

    itemsetText.appendChild(thisItemsetText);
  }
}
