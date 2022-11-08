var jsonForm = {};

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
            // console.log(children, superset, support);
            children = add_children(children, superset, support);
          }
        }
  
        var text = JSON.stringify(root, null, "  ");
        console.log(text);
      };
      reader.readAsText(file);
    }
  };