FormUtils = {
  // Serialize the contents of a DOM form element into a javascript object tree
  // where the keys are the names of input fields and values are the values
  // of the input fields.  This is intended to make it easy to map forms to
  // mongo documents for easy two way data binding.

  // If the name of an input has periods in it, it is split as a path - e.g.
  // <input name="x.y" value="value" /> will give:
  // {
  //   x: {
  //     y: "value"
  //   }
  // }

  // If the name of an object has brackets at the end, it is added to an
  // array which is named the same except without the brackets:
  // <input name="x.y[0]" value="value1" />
  // <input name="x.y[1]" value="value1" /> will give:
  // {
  //   x: {
  //     y: ["value1", "value2"]
  //   }
  // }

  serializeForm: function (form) {
    var root = {};

    // iterate through the form inputs
    _.each(form.elements, function (el) {

      // only use named inputs
      if (el.name) {

        // split the name of the input into path tokens
        var path = el.name.split(".");

        // the last part of the path will be the key of the leaf of the tree
        var attrName = _.last(path);
        path = _.initial(path);
        
        // traverse the tree starting from the root
        var node = root;

        // for each token in the path, add an object if it does not yet exist
        path.forEach(function (pathNode) {
          if(! node[pathNode]) {
            node[pathNode] = {};
          }

          node = node[pathNode];
        });

        // check for names with brackets at the end
        var isListAttribute = function (name) {
          return name[name.length - 1] === "]" && name.indexOf("[") !== -1;
        };

        var value = el.value;

        // parse numbers if input fields of type number are encountered
        if (el.type === "number") {
          value = parseFloat(el.value, 10);
          if (isNaN(value)) {
            value = 0;
          }
        }

        if (el.type === "checkbox") {
          value = el.checked;
        }

        if ((el.type !== "radio") || el.checked) {
          // this code works with name[0] or name[], it just gets rid of
          // everything in brackets
          if (isListAttribute(attrName)) {
            openBracketIndex = attrName.indexOf("[");
            attrName = attrName.slice(0, openBracketIndex);

            // if the array exists, push the value, if not create an array
            if (node[attrName]) {
              node[attrName].push(value);
            } else {
              node[attrName] = [value];
            }
          } else {
            // if the attribute isn't an array, just set the value
            node[attrName] = value;
          }
        }
      }
    });

    // return the resulting tree after iterating over the whole form
    return root;
  },

  // doesn't work with radio buttons or arrays, lol
  populateForm: function (form, object) {
    _.each(form.elements, function (element) {
      
      // only works with named elements
      if (element.name) {
        // split the name of the input into path tokens
        var path = element.name.split(".");

        // get the node at the path
        var node = object;
        _.each(path, function (key) {
          if (node) {
            node = node[key];
          }
        });

        var data;
        if (node) {
          data = node;
        }

        if (element.type === "checkbox") {
          element.checked = !! data;
          if (data) {
            $(element).attr("checked", "checked");
          }
        } else {
          element.value = data;
        }
      }
    });
  }
};