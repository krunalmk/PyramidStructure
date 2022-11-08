d3.pyramid = function() {
    var size = [1,1],
        value = function(d) { return d.value},
        coordinates;
    
    var percentageValues = function (data) {
      var values = data.map(value);
      var sum = d3.sum(values, function (d){
        return +d;
      });
      var percentValues = data.map(function (d,i){
        d.value = +values[i];
        return values[i]/sum*100;
      });
      percentValues.sort(function(a,b){
        return b-a;
      });
      return percentValues;
    }
    var coordinatesCalculation = function(data){
      var w = size[0],
          h = size[1],
          ratio = (w/2)/h,
          percentValues = percentageValues(data),
          coordinates = [],
          area_of_triangle = (w * h) / 2;
      function d3Sum (i) {
        return d3.sum(percentValues,function (d, j){
          if (j>=i) {
            return d;
          }
        });
      }
      for (var i=0,len=data.length;i<len; i++){
        var selectedPercentValues = d3Sum(i),
            area_of_element = selectedPercentValues/100 * area_of_triangle,
            height1 = Math.sqrt(area_of_element/ratio),
            base = 2 * ratio * height1,
            xwidth = (w-base)/2;
        if (i===0){
          coordinates[i] = {"values":[{"x":w/2,"y":0},{"x":xwidth,"y":height1},{"x":base+xwidth,"y":height1}]};
        }else{
          coordinates[i] = {"values":[coordinates[i-1].values[1],{"x":xwidth,"y":height1},{"x":base+xwidth,"y":height1},coordinates[i-1].values[2]]};
        }
  
      }
      coordinates[0].values[1] = coordinates[coordinates.length-1].values[1];
      coordinates[0].values[2] = coordinates[coordinates.length-1].values[2];
      var first_data = coordinates.splice(0,1);
      coordinates = coordinates.reverse();
      coordinates.splice(0,0,first_data[0]);
      return coordinates;
    } 
    function pyramid(data) {
      var i = 0,
          coordinates = coordinatesCalculation(data);
      
      data.sort(function(a,b) {
        return b.value - a.value;
      })
      
      data.forEach(function(){
        data[i].coordinates = coordinates[i].values;
        i++;
      })
      return data;
    }
    pyramid.size = function(s){
      if(s.length === 2) {
        size = s;                    
      }
      return pyramid;
    }
    pyramid.value = function(v) {
      if (!arguments.length) return value;
      value = v;
      return pyramid;
    };
    return pyramid;
  }


var width = 1000,
      height = 1500,
      radius = Math.min(width, height) / 2;

  var color = d3.scale.ordinal()
  .range(["#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd","#8c564b","#e377c2","#7f7f7f","#bcbd22","#17becf"]);//["#255aee","#3a6fff","#4f84ff","rgb(101,154,302)","rgb(122,175,323)", "rgb(144,197,345)", "rgb(165,218,366)"]);

  var svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
  //*    
  // const data = [
  //   { Name: "G", level: 1},
  //   { Name: "F", level: 2},
  //   { Name: "DE", level: 2},
  //   { Name: "C", level: 3},
  //   { Name: "B", level: 3},
  //   { Name: "A", level: 3, team: [1,2,3]}
  // ];

  const data = [
    {
      "itemset": [
        "3",
        "4",
        "5"
      ],
      "frequency": 20,
      "level": 2,
      "children": [],
      "d": 1
    },
    {
      "itemset": [
        "3",
        "4"
      ],
      "frequency": 40,
      "level": 1,
      "children": [],
      "d": 1
    },
    {
      "itemset": [
        "3"
      ],
      "frequency": 70,
      "level": 0,
      "children": [],
      "d": 1
    },
    {
      "itemset": [
        "2",
        "4"
      ],
      "frequency": 50,
      "level": 1,
      "children": [],
      "d": 1
    },
    {
      "itemset": [
        "2",
        "3",
        "4",
        "5"
      ],
      "frequency": 20,
      "level": 3,
      "children": [],
      "d": 1
    },
    {
      "itemset": [
        "2",
        "3",
        "4"
      ],
      "frequency": 20,
      "level": 2,
      "children": [],
      "d": 1
    },
    {
      "itemset": [
        "2",
        "3"
      ],
      "frequency": 50,
      "level": 1,
      "children": [],
      "d": 1
    },
    {
      "itemset": [
        "2"
      ],
      "frequency": 80,
      "level": 0,
      "children": [],
      "d": 1
    },
    {
      "itemset": [
        "1",
        "4"
      ],
      "frequency": 60,
      "level": 1,
      "children": [],
      "d": 1
    },
    {
      "itemset": [
        "1",
        "3",
        "4"
      ],
      "frequency": 50,
      "level": 2,
      "children": [],
      "d": 1
    },
    {
      "itemset": [
        "1",
        "3"
      ],
      "frequency": 70,
      "level": 1,
      "children": [],
      "d": 1
    },
    {
      "itemset": [
        "1",
        "2",
        "4"
      ],
      "frequency": 50,
      "level": 2,
      "children": [],
      "d": 1
    },
    {
      "itemset": [
        "1",
        "2",
        "3",
        "4",
        "5"
      ],
      "frequency": 10,
      "level": 4,
      "children": [],
      "d": 1
    },
    {
      "itemset": [
        "1",
        "2",
        "3",
        "4"
      ],
      "frequency": 40,
      "level": 3,
      "children": [],
      "d": 1
    },
    {
      "itemset": [
        "1",
        "2",
        "3"
      ],
      "frequency": 50,
      "level": 2,
      "children": [],
      "d": 1
    },
    {
      "itemset": [
        "1",
        "2"
      ],
      "frequency": 80,
      "level": 1,
      "children": [],
      "d": 1
    },
    {
      "itemset": [
        "1"
      ],
      "frequency": 90,
      "level": 0,
      "children": [],
      "d": 1
    },
    {
      "itemset": [
        ""
      ],
      "frequency": 10,
      "level": 5,
      "children": [],
      "d": 1
    }
  ]

  //*/
  const grouped = Object.values(data.reduce((aggObj, item) => {
    
    if (!aggObj[item.level]){
      aggObj[item.level] = {level: item.level, names: []};
    }
    aggObj[item.level].names.push({name: item.itemset, team: item.team});
    return aggObj;
  }, {}));
  
  //console.log(grouped);
  
      var pyramid = d3.pyramid()
          .size([width,height])
          .value(function(d) { return d.level; });

      var line = d3.svg.line()
          .interpolate('linear-closed')
          .x(function(d,i) { return d.x; })
          .y(function(d,i) { return d.y; });

      var g = svg.selectAll(".pyramid-group")
          .data(pyramid(grouped)) //swap for grouped data
          .enter().append("g")
          .attr("class", "pyramid-group");

      g.append("path")
          .attr("d", function (d){ return line(d.coordinates); })
          .style("fill", function(d) { return "none";});//color(d.level); });

      var textBoxes = g.selectAll(".textBoxes")
          .data((d) => {
            const helperObj = {};
            helperObj.coordinates = d.coordinates;
            helperObj.level = d.level;
            const len = d.names.length;
            helperObj.len = d.names.length;
            if(d.coordinates.length === 4) {
                const left = d.coordinates[0].x;
                const right = d.coordinates[3].x;
                const topLeft = d.coordinates[1].x;
                const topRight = d.coordinates[2].x;
                const start = left;// + ((topLeft - left) / 15);
                const end = right;// - ((right - topRight) / 15);
                const sep = (end - start) / len;
                helperObj.start = start;
                helperObj.end = end;
                helperObj.sep = sep;
                const yCenter = (((d.coordinates[0].y-d.coordinates[1].y)/2)+d.coordinates[1].y) + 5;
                helperObj.yCenter = yCenter;
                helperObj.yDiff = (d.coordinates[0].y-d.coordinates[1].y);
            } else {
                const left = d.coordinates[1].x;
                const right = d.coordinates[2].x;
                const start = left ;//+ ((right - left) / 4);
                const end = right;// - ((right - left) / 4);
                const sep = (end - start) / len;
                helperObj.start = start;
                helperObj.end = end;
                helperObj.sep = sep;
                helperObj.yCenter = (d.coordinates[0].y + d.coordinates[1].y)/2 + 10;
                helperObj.yDiff = (d.coordinates[1].y-d.coordinates[0].y) ;//* 0.9;

                helperObj.coordinates[1].x = d.coordinates[1].x;
                helperObj.coordinates[2].x = d.coordinates[2].x;
                helperObj.coordinates[0].x = d.coordinates[0].y;
                helperObj.coordinates[1].x = d.coordinates[1].y;
            } 
                  
            return d.names.map((e,i) => {
              const name = e.name;
              const team = e.team || [];
              const teamLen = team.length;
              return {...helperObj, i, name, team, teamLen};
            })
          })
          .enter().append("g");
          
          textBoxes
          .append("path") // kmk
          .attr("d", (d,i)=>{
            // for( var i=0; i<d.len; i++){
            var DY =d.yCenter;
            var DX =  (d.start + ((i+0.05) * d.sep));

            var DXleft = d.start+((i+0.05) * d.sep);//d.coordinates[1].x;
            var DXtopleft = DXleft+d.sep;//d.coordinates[2].x;
            var DYleft = d.coordinates[0].y;
            var DYtopleft = d.coordinates[1].y;

            var yUp = 180;
            var yDown = 90;

            var YDIFF = d.yDiff;//d.sep;
            // console.log("GGGGGGGGG", d);
          // }
            // console.log(i,DY,DX,YDIFF);
            // for( var j=0; j)
            if(  d.level == 4){
              console.log("GGGGGGGGG", d);
              return 'M ' + (d.coordinates[0].x) +' '+ (d.coordinates[0].y) + ' L '+ (d.coordinates[2].x)+ ' ' + (d.coordinates[2].y) + ' L '+ (d.coordinates[3].x) +' '+ (d.coordinates[3].y);
            }
            // if( d.coordinates[1].x == 0 && d.coordinates[1].y == 0){
            //   d.coordinates[1].x = d.coordinates[2].x;
            //   d.coordinates[1].y = d.coordinates[2].y;
            // }
            if( i == d.len-1)
            return 'M ' + (DXleft) +' '+ (DYleft) + ' L '+ (DXtopleft)+ ' ' + (DYleft) + ' L '+ (d.coordinates[2].x) +' '+ (DYtopleft)+ ' L ' + ( DXleft)+ ' '+ (DYtopleft);
          else if( i != 0)
              return 'M ' + (DXleft) +' '+ (DYleft) + ' L '+ (DXtopleft)+ ' ' + (DYleft) + ' L '+ (DXtopleft) +' '+ (DYtopleft)+ ' L ' + ( DXleft)+ ' '+ (DYtopleft);
          else if(i == 0){
              return 'M ' + (DXleft) +' '+ DYleft + ' L '+ (DXtopleft)+ ' ' + (DYleft) + ' L '+ (DXtopleft) +' '+ (DYtopleft)+ ' L ' + ( d.coordinates[1].x)+ ' '+ (DYtopleft);
            }
            }
            // if( i == d.len-1)
            //   return 'M ' + (DX) +' '+ (DY-yUp) + ' L '+ (DX+ YDIFF)+ ' ' + (DY) + ' L '+ (DX+ YDIFF+ d.sep/1.5) +' '+ (DY+ YDIFF+yDown)+ ' L ' + ( DX)+ ' '+ (DY+ YDIFF+yDown);
            // else if( i != 0)
            //     return 'M ' + (DX) +' '+ (DY-yUp) + ' L '+ (DX+ YDIFF)+ ' ' + (DY-yUp) + ' L '+ (DX+ YDIFF) +' '+ (DY+ YDIFF+yDown)+ ' L ' + ( DX)+ ' '+ (DY+ YDIFF+yDown);
            // else if(i == 0)
            //     return 'M ' + (DX) +' '+ DY + ' L '+ (DX+ YDIFF)+ ' ' + (DY) + ' L '+ (DX+ YDIFF) +' '+ (DY+ YDIFF)+ ' L ' + ( DX-d.sep/3)+ ' '+ (DY+ YDIFF);
            //   }
          )// + d.x+ ' '+ d.y+ ' z'});//' l 4 4 l -8 0 z';})
          .style("fill","yellow")
          .style("stroke","black")
        .style("stroke-width", "1px")
          .style("z-index", '10');
      // textBoxes.append("rect")
      //     .attr({
      //         "y": function (d,i) {
      //             //console.log(d)
      //             return d.yCenter - (d.yDiff/8);
      //         },
      //         "x": function (d,i) {
      //             return d.start + ((i+0.05) * d.sep);
      //         },
      //         "width": function (d,i) {
      //             return d.sep * 0.9;         
      //         },
      //         "height": function (d,i) {
      //             return (d.yDiff/8) * 3;         
      //         },
      //         "fill": function (d,i) {
      //             return "#e0f4ff";         
      //         },
      //         "rx": function (d,i) {
      //             return d.sep * 0.1;   
      //         }
      //     });
          
      textBoxes.append("text")
          .attr({
              "y": function (d,i) {
                  //console.log(d)
                  return d.yCenter;
              },
              "x": function (d,i) {
                  return d.start + ((i+0.5) * d.sep);
              }
          })          
          .style("text-anchor", "middle")
          .style("alignment-baseline", "hanging")
          .style("font-size", "x-large")
          .text(function(d) { return d.name; });
          
      var teamMembers = textBoxes.selectAll(".teamMembers")
          .data((d) => {
            const itemCopy = {...d};
            const teamCopy = [...d.team];
            delete itemCopy.team;
            return d.team.map(e => ({...itemCopy, teamMember: e}));
          });
      teamMembers.enter().append("line")
          .attr({
              "y1": function (d,i) {
                  //console.log(d)
                  return d.yCenter + (d.yDiff/3);
              },
              "x1": function (d,i) {
                  return d.start + ((d.i+0.15) * d.sep) + ((i+0.5) * ((0.7*d.sep)/d.teamLen));
              },
              "y2": function (d,i) {
                  //console.log(d)
                  return d.yCenter + (d.yDiff/6);
              },
              "x2": function (d,i) {
                  return d.start + ((d.i+0.15) * d.sep) + (0.5 * (0.7*d.sep));
              },
              "stroke": function (d,i) {
                  //console.log(d)
                  return "black";
              },
              "stroke-width": function (d,i) {
                  return "2";
              }
          });    
      teamMembers.enter().append("circle")
          .attr({
              "cy": function (d,i) {
                  //console.log(d)
                  return d.yCenter + (d.yDiff/3);
              },
              "cx": function (d,i) {
                  return d.start + ((d.i+0.15) * d.sep) + ((i+0.5) * ((0.7*d.sep)/d.teamLen));
              },
              "r": function (d,i) {
                  return d.sep * 0.05;
              }
          });
      teamMembers.enter().append("text")
          .attr({
              "y": function (d,i) {
                  //console.log(d)
                  return d.yCenter + (d.yDiff/3);
              },
              "x": function (d,i) {
                  return d.start + ((d.i+0.15) * d.sep) + ((i+0.5) * ((0.7*d.sep)/d.teamLen));
              },
              "fill": function (d,i) {
                  return "white";
              }
          })
          .style("text-anchor", "middle")
          .style("alignment-baseline", "middle")
          .style("font-size", "large")
          .text(function(d) { return d.teamMember; });

      d3.select("body").append("table")
          .attr({
              "id" : "footer",
              "width": width + "px"
          });