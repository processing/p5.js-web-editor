var Interceptor = {
  prevTotalCount :0,
  totalCount : 0,
  currentColor : 'white',
  objectArea : 0,
  objectDescription : '',
  bgColor : 'white',
  coordinates : [],
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
  noRows: 10,
  noCols: 10,
  coordLoc : {},

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

  /* return which part of the canvas an object os present */
  canvasLocator : function(x,arguments,canvasX,canvasY){
    var x_loc, y_loc;
    var locX, locY;
    for(var i=0;i<arguments.length;i++) {
      a = arguments[i];
      if(x.params[i].description.indexOf("x-coordinate")>-1) {
        x_loc = a;
      }
      else if(x.params[i].description.indexOf("y-coordinate")>-1) {
        y_loc = a;
      }
    }

    locX = Math.floor((x_loc/canvasX)*this.noRows);
    locY = Math.floor((y_loc/canvasY)*this.noCols);
    if( locX == this.noRows) {
      locX = locX - 1;
    }
    if( locY == this.noCols) {
      locY = locY - 1;
    }
    return({
      locX: locX,
      locY: locY
    })

  },

  clearVariables : function(object) {
    object.objectTypeCount = {};
    object.objectCount = 0;
    this.isCleared = true;
    return object;
  },

  createShadowDOMElement : function(document) {
      var contentTable = document.getElementById('textOutput-content-table');
      for(var i=0; i<this.noRows; i++) {
        var row = document.createElement('tr');

        for(var j=0; j<this.noCols; j++) {
          var col = document.createElement('td');
          col.className = "textOutput-cell-content";
          col.innerHTML = 'test';
          row.appendChild(col);
        }
        contentTable.appendChild(row);
      }
      shadowDOMElement = document.getElementById('textOutput-content');

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
    /* Here - most of the functions are generalised, but some need specific outputs */

    /* for `fill` function */
    if(!x.name.localeCompare('fill')) {
      this.currentColor = this.getColorName(arguments);
    }

    /* for `background` function */
    else if(!x.name.localeCompare('background')) {
      this.bgColor = this.getColorName(arguments);
    }

    /* for 2D functions and text function */
    else if(!x.module.localeCompare('Shape') || !x.module.localeCompare('Typography') &&((!x.submodule)||(x.submodule.localeCompare('Attributes')!=0)) ){
      this.objectArea = this.getObjectArea(x.name, arguments);
      var canvasLocation = this.canvasAreaLocation(x, arguments ,width,height);
      this.coordLoc = this.canvasLocator(x,arguments,width,height);

      /* in case of text, the description should be what is in the content */
      if(x.name.localeCompare('text')){
        this.objectDescription = x.name;
      }
      else {
        this.objectDescription = arguments[0].substring(0,20);
      }
      objectArray[objectCount] = {
        'type' : this.currentColor + ' - ' + this.objectDescription ,
        'location': canvasLocation, //top left vs top right etc
        'coordLoc': this.coordLoc, // 3,3 vs 5,3 etc
        'area': this.objectArea,
        'co-ordinates': this.coordinates // coordinates of where the objects are drawn
      };
      this.coordinates = [];


      /*add the object(shape/text) parameters in objectArray */
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
      objectCount++;
    }
    return ({
      objectCount : objectCount,
      objectArray : objectArray,
      objectTypeCount : objectTypeCount
    });
  },

  populateTable : function(objectArray,document_passed) {
    if(this.totalCount<100) {
    for(var i=0;i<objectArray.length;i++) {
      var cellLoc = objectArray[i].coordLoc.locY*this.noRows + objectArray[i].coordLoc.locX;
      //add link in table
      var cellLink = document_passed.createElement('a');
      cellLink.innerHTML += objectArray[i].type;
      var objectId = '#object'+i;
      cellLink.setAttribute('href',objectId);
      document_passed.getElementsByClassName('textOutput-cell-content')[cellLoc].appendChild(cellLink);
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

  /* helper function to populate object Details */
  populateObjectDetails : function(object1, object2, elementSummary, elementDetail) {
    this.prevTotalCount = this.totalCount;
    this.totalCount = object1.objectCount + object2.objectCount;
    elementSummary.innerHTML = '';
    elementDetail.innerHTML = '';
    elementSummary.innerHTML +=  this.bgColor + ' canvas is ' + this.canvasDetails.width + ' by ' + this.canvasDetails.height + ' of area ' + this.canvasDetails.width*this.canvasDetails.height;
    if(this.totalCount > 1 ) {
      elementSummary.innerHTML += ' Contains ' + this.totalCount + ' objects - ';
    }
    else {
      elementSummary.innerHTML += ' Contains ' + this.totalCount + ' object - ';
    }


    if(object2.objectCount>0 || object1.objectCount>0 ) {

      totObjectTypeCount = MergeObjRecursive(object1.objectTypeCount, object2.objectTypeCount);
      var keys = Object.keys(totObjectTypeCount);
      for(var i=0;i<keys.length;i++) {
        elementSummary.innerHTML += totObjectTypeCount[keys[i]] + ' ' + keys[i] + ' ';
      }

      var objectList = document.createElement('ul');

      if(this.totalCount<100){
        for(var i=0; i <object1.objectArray.length; i++) {
          var objectListItem = document.createElement('li');
          objectListItem.id = 'object' + i;
          objectList.appendChild(objectListItem);
          var objKeys = Object.keys(object1.objectArray[i]);
          for(var j=0;j<objKeys.length;j++) {
            if(objKeys[j].localeCompare('coordLoc'))
            {
              if(objKeys[j].localeCompare('type')){
                objectListItem.innerHTML += objKeys[j] + ' = ' + object1.objectArray[i][objKeys[j]] + ' ';
              }
              else {
                objectListItem.innerHTML += object1.objectArray[i][objKeys[j]] + ' ';
              }
            }

          }
        }
        for(var i=0; i <object2.objectArray.length; i++) {
          var objectListItem = document.createElement('li');
          objectListItem.id = 'object' + (object1.objectArray.length + i);
          objectList.appendChild(objectListItem);
          var objKeys = Object.keys(object2.objectArray[i]);
          for(var j=0;j<objKeys.length;j++) {
            if(objKeys[j].localeCompare('coordLoc'))
            {
              if(objKeys[j].localeCompare('type')){
                objectListItem.innerHTML += objKeys[j] + ' = ' + object2.objectArray[i][objKeys[j]] + ' ';
              }
              else {
                objectListItem.innerHTML += object2.objectArray[i][objKeys[j]] + ' ';
              }
            }
          }
        }
        elementDetail.appendChild(objectList);
      }

    }
  }
};
