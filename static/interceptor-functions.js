var Interceptor = {
  prevTotalCount :0,
  totalCount : 0,
  currentColor : 'white',
  bgColor : 'white',
  objectArea : 0,
  coordinates : [],
  objectDescription : '',
  canvasDetails : {
    width : 0,
    height: 0
  },
  setupObject : {
    objectArray : [],
    objectCount : 0,
    objectTypeCount : {}
  },
  drawObject : {
    objectArray : [],
    objectCount : 0,
    objectTypeCount : {}
  },
  isCleared : false,

  getColorName : function(arguments) {
    if(arguments.length==3) {
      //assuming that we are doing RGB - convert RGB values to a name
      var color = '#' + arguments[0].toString(16).paddingLeft("00") + arguments[1].toString(16).paddingLeft("00") + arguments[2].toString(16).paddingLeft("00");
      var n_match  = ntc.name(color);
      return n_match[1];
    }
    else if(arguments.length==1) {
      if(!(typeof(arguments[0])).localeCompare("number")) {
        //assuming that we are doing RGB - this would be a grayscale number
        if(arguments[0]<10) {
          return 'black';
        }
        else if(arguments[0]>240) {
          return 'white';
        }
        else {
          return 'grey';
        }
      }
      else if(!(typeof(arguments[0])).localeCompare("string")) {
        if(!arguments[0].charAt(0).localeCompare('#')) {
          //if user has entered a hex color
          var n_match = ntc.name(arguments[0]);
          return n_match[1];
        }
        else {
          return arguments[0];
        }
      }
    }
  },

  /* return which part of the canvas an object os present */
  canvasAreaLocation : function(x,arguments,canvasX,canvasY){

    var x_loc,y_loc;

    for(var i=0;i<arguments.length;i++) {
      a = arguments[i];
      if(x.params[i].description.indexOf("x-coordinate")>-1) {
        x_loc = a;
      }
      else if(x.params[i].description.indexOf("y-coordinate")>-1) {
        y_loc = a;
      }
    }

    if(x_loc<0.4*canvasX) {
      if(y_loc<0.4*canvasY) {
        return 'top left';
      }
      else if(y_loc>0.6*canvasY) {
        return 'bottom left';
      }
      else {
        return 'mid left';
      }
    }
    else if(x_loc>0.6*canvasX) {
      if(y_loc<0.4*canvasY) {
        return 'top right';
      }
      else if(y_loc>0.6*canvasY) {
        return 'bottom right';
      }
      else {
        return 'mid right';
      }
    }
    else {
      if(y_loc<0.4*canvasY) {
        return 'top middle';
      }
      else if(y_loc>0.6*canvasY) {
        return 'bottom middle';
      }
      else {
        return 'middle';
      }
    }
  },

  clearVariables : function(object) {
    object.objectTypeCount = {};
    object.objectCount = 0;
    this.isCleared = true;
    return object;
  },

  populateObject : function(x,arguments, object ,table, isDraw) {
    objectCount = object.objectCount;
    objectArray = object.objectArray;
    objectTypeCount = object.objectTypeCount;
    if(!isDraw) {
      //check for special function in setup -> createCanvas
      if(!x.name.localeCompare('createCanvas')) {
        this.canvasDetails.width = arguments[0];
        this.canvasDetails.height = arguments[1];
      }
    }
    //check for speacial functions in general -> background/fill
    if(!x.name.localeCompare('fill')) {
      this.currentColor = this.getColorName(arguments);
    }
    else if(!x.name.localeCompare('background')) {
      this.bgColor = this.getColorName(arguments);
    }
    else if(!x.module.localeCompare('Shape') || !x.module.localeCompare('Typography') &&((!x.submodule)||(x.submodule.localeCompare('Attributes')!=0)) ){
      this.objectArea = this.getObjectArea(x.name, arguments);
      var canvasLocation = this.canvasAreaLocation(x, arguments ,width,height);
      if(x.name.localeCompare('text')){
        this.objectDescription = x.name;
      }
      else {
        this.objectDescription = String(arguments[0]).substring(0,20);
      }

      this.coordinates = [];

      objectArray[objectCount] = {
        'type' : this.currentColor + ' colored ' + this.objectDescription ,
        'location': canvasLocation,
        'area': this.objectArea,
        'co-ordinates': this.coordinates
      };

      //make edits if it is a text object
      if(!x.name.localeCompare('text')){
        objectArray[objectCount]['type'] = this.objectDescription;
        objectArray[objectCount]['color of text'] = this.currentColor;
      }

      //add the object(shape/text) parameters in objectArray
      for(var i=0;i<arguments.length;i++) {
        if(!(typeof(arguments[i])).localeCompare('number')){
          arguments[i] = round(arguments[i]);
        }
        if(x.params[i].description.indexOf("x-coordinate")>-1) {
          objectArray[objectCount]['co-ordinates'].push(arguments[i]+'x')
        }
        else if(x.params[i].description.indexOf("y-coordinate")>-1) {
          objectArray[objectCount]['co-ordinates'].push(arguments[i]+'y')
        }
        else{
          objectArray[objectCount][x.params[i].description]=arguments[i];
        }
      }
      if(objectTypeCount[x.name]) {
        objectTypeCount[x.name]++;
      }
      else {
        objectTypeCount[x.name]=1;
      }
      //creating the table to contain the object(shape/text) details

      objectCount++;
    }
    return ({
      objectCount : objectCount,
      objectArray : objectArray,
      objectTypeCount : objectTypeCount
    });
  },

  populateTable : function(table, objectArray) {
    if(this.totalCount<100) {
      if(this.prevTotalCount > this.totalCount) {
        for(var j =0;j<this.totalCount;j++) {
          var row = table.children[j];
          var tempCol = row.children.length;
          var properties =  Object.keys(objectArray[j]);

          if(tempCol<properties.length){ //ie - there are more cols now
            for(var i =0;i<tempCol;i++) {
              if(properties[i].localeCompare('type')) {
                row.children[i].innerHTML = properties[i] + ' = ' + objectArray[j][properties[i]];
              }
              else {
                row.children[i].innerHTML = objectArray[j][properties[i]];
              }

            }
            for(var i=tempCol;i < properties.length;i++) {
              var col = document.createElement('td');
              if(properties[i].localeCompare('type')) {
                col.children[i].innerHTML = properties[i] + ' = ' + objectArray[j][properties[i]];
              }
              else {
                col.children[i].innerHTML = objectArray[j][properties[i]];
              }

              row.appendChild(col);
            }
          }

          else{ // ie - there are fewer cols now
            for(var i =0;i<properties.length;i++) {
              if(properties[i].localeCompare('type')) {
                row.children[i].innerHTML = properties[i] + ' = ' + objectArray[j][properties[i]];
              }
              else {
                row.children[i].innerHTML = objectArray[j][properties[i]];
              }

            }
            for(var i=properties.length;i<tempCol;i++) {
              var tempCol = row.children[i];
              row.removeChild(tempCol);
            }
          }

        }
        for(var j = this.totalCount;j<this.prevTotalCount;j++) {
          var tempRow = table.children[j];
          table.removeChild(tempRow);
        }
      } else if(this.prevTotalCount <= this.totalCount) {
        for(var j =0;j<this.prevTotalCount;j++) {
          var row = table.children[j];
          var tempCol = row.children.length;
          var properties =  Object.keys(objectArray[j]);

          if(tempCol<properties.length){ //ie - there are more cols now

            for(var i =0;i<=tempCol;i++) {
              if(properties[i].localeCompare('type')) {
                row.children[i].innerHTML = properties[i] + ' = ' + objectArray[j][properties[i]];
              }
              else {
                row.children[i].innerHTML = objectArray[j][properties[i]];
              }
            }
            for(var i=tempCol;i < properties.length;i++) {
              var col = document.createElement('td');

              if(properties[i].localeCompare('type')) {
                col.innerHTML = properties[i] + ' = ' + objectArray[j][properties[i]];
              }
              else {
                col.innerHTML = objectArray[j][properties[i]];
              }

              row.appendChild(col);
            }
          }

          else{ // ie - there are fewer cols now
            for(var i =0;i<properties.length;i++) {
              if(properties[i].localeCompare('type')) {
                row.children[i].innerHTML = properties[i] + ' = ' + objectArray[j][properties[i]];
              }
              else {
                row.children[i].innerHTML = objectArray[j][properties[i]];
              }

            }
            for(var i=properties.length;i<tempCol;i++) {
              var tempCol = row.children[i];
              row.removeChild(tempCol);
            }
          }

        }
        for(var j = this.prevTotalCount;j<this.totalCount;j++) {
          var row = document.createElement('tr');
          row.id = 'object' + j;
          var properties =  Object.keys(objectArray[j]);
          for(var i =0;i<properties.length;i++) {
            var col = document.createElement('td');
            if(properties[i].localeCompare('type')) {
              col.innerHTML = properties[i] + ' = ' + objectArray[j][properties[i]];
            }
            else {
              col.innerHTML = objectArray[j][properties[i]];
            }

            row.appendChild(col);
          }
          table.appendChild(row);
        }
      }
    }
  },

  getObjectArea : function(objectType,arguments){
    var objectArea = 0;
    if(!objectType.localeCompare('arc')) {
      objectArea = 0;
    }
    else if(!objectType.localeCompare('ellipse')) {
      objectArea = 3.14 * arguments[2]*arguments[3]/4;
    }
    else if(!objectType.localeCompare('line')) {
      objectArea = 0;
    }
    else if(!objectType.localeCompare('point')) {
      objectArea = 0;
    }
    else if(!objectType.localeCompare('quad')) {
      //x1y2+x2y3+x3y4+x4y1−x2y1−x3y2−x4y3−x1y4
      objectArea = (arguments[0]*arguments[1]+arguments[2]*arguments[3]+arguments[4]*arguments[5]+arguments[6]*arguments[7]) - (arguments[2]*arguments[1]+arguments[4]*arguments[3]+arguments[6]*arguments[5]+arguments[0]*arguments[7]);
    }
    else if(!objectType.localeCompare('rect')) {
      objectArea = arguments[2]*arguments[3];
    }
    else if(!objectType.localeCompare('triangle')) {
      objectArea = abs( arguments[0]*(arguments[3] - arguments[5]) + arguments[2]*(arguments[5] - arguments[1]) + arguments[4]*(arguments[1] - arguments[3]));
      //A	x 	 (	 B	y 	−	 C	y 	) 	+	 B	x 	 (	 C	y 	−	 A	y 	) 	+	 C	x 	 (	 A	y 	−	 B	y 	)
    }
    return objectArea;
  },

  getSummary : function(object1, object2, element) {
    this.prevTotalCount = this.totalCount;
    this.totalCount = object1.objectCount + object2.objectCount;
    element.innerHTML = '';
    element.innerHTML +=  this.bgColor + ' coloured canvas is ' + this.canvasDetails.width + ' by ' + this.canvasDetails.height + ' of area ' + this.canvasDetails.width*this.canvasDetails.height;
    if(this.totalCount > 1 ) {
      element.innerHTML += ' Contains ' + this.totalCount + ' objects - ';
    }
    else {
      element.innerHTML += ' Contains ' + this.totalCount + ' object - ';
    }

    if(object2.objectCount>0 || object1.objectCount>0 ) {

      totObjectTypeCount = MergeObjRecursive(object1.objectTypeCount, object2.objectTypeCount);
      var keys = Object.keys(totObjectTypeCount);
      for(var i=0;i<keys.length;i++) {
        element.innerHTML += totObjectTypeCount[keys[i]] + ' ' + keys[i] + ' ';
      }

      var objectList = document.createElement('ul');

      if(this.totalCount<100){
        for(var i=0; i <object1.objectArray.length; i++) {
          var objectListItem = document.createElement('li');
          objectList.appendChild(objectListItem);
          var objKeys = Object.keys(object1.objectArray[i]);
          var objLink = document.createElement('a');
          objLink.href = "#object" + i;
          objLink.innerHTML = object1.objectArray[i]['type'];
          objectListItem.appendChild(objLink);
          objectListItem.innerHTML += '; area = ' + object1.objectArray[i]['area'] + '; location = ' + object1.objectArray[i]['location'];
        }
        for(var i=0; i <object2.objectArray.length; i++) {
          var objectListItem = document.createElement('li');
          objectList.appendChild(objectListItem);
          var objKeys = Object.keys(object2.objectArray[i]);
          var objLink = document.createElement('a');
          objLink.href = "#object" + (i + object1.objectArray.length);;
          objLink.innerHTML = object2.objectArray[i]['type'];
          objectListItem.appendChild(objLink);
          objectListItem.innerHTML +=  '; area = ' + object2.objectArray[i]['area'] + '; location = ' + object2.objectArray[i]['location'];
        }
        element.appendChild(objectList);
      }

    }
  }
};
