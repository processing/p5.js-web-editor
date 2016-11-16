var canvasLocation ='';
var shadowDOMElement;

funcNames = allData["classitems"].map(function(x){
  if(x["overloads"]) {
    tempParam = x["overloads"][0]["params"];
  } else {
    tempParam = x["params"];
  }
   return {
    name: x["name"],
    params: tempParam,
    class: x["class"],
    module: x["module"],
    submodule: x["submodule"]
  };
});

funcNames = funcNames.filter(function(x) {
  var className = x["class"];
  return (x["name"] && x["params"] && (className==='p5'));
})


funcNames.forEach(function(x){
  var document = parent.document;
  var originalFunc = p5.prototype[x.name];
  p5.prototype[x.name] = function(){
    orgArg = arguments;
    if(frameCount == 0) { //for setup
      document.getElementById('textOutput-content-table').innerHTML = '';
      document.getElementById('textOutput-content-details').innerHTML = '';
      document.getElementById('textOutput-content-summary').innerHTML = '';
      Interceptor.createShadowDOMElement(document);
      Interceptor.setupObject = Interceptor.populateObject(x,arguments, Interceptor.setupObject,  document.getElementById('textOutput-content-details'),false);
      Interceptor.populateObjectDetails(Interceptor.setupObject,Interceptor.drawObject,document.getElementById('textOutput-content-summary'),document.getElementById('textOutput-content-details'));
      var table = document.getElementById('textOutput-content-details');
      Interceptor.populateTable(table,Interceptor.setupObject);
    }

    else if(frameCount%50 == 0 ) {
      Interceptor.drawObject = Interceptor.populateObject(x,arguments, Interceptor.drawObject, document.getElementById('textOutput-content-details'),true);

      Interceptor.isCleared = false;
    }
    //reset some of the variables
    else if(frameCount%50 == 1 ) {
      if(!Interceptor.isCleared){
        var cells = document.getElementsByClassName('textOutput-cell-content');
        for( i =0;i<cells.length;i++) {
          cells[i].innerHTML = '';
        }
        Interceptor.populateObjectDetails(Interceptor.setupObject,Interceptor.drawObject,document.getElementById('textOutput-content-summary'),document.getElementById('textOutput-content-details'));
        Interceptor.populateTable(Interceptor.setupObject.objectArray.concat(Interceptor.drawObject.objectArray),document);
      }
      Interceptor.drawObject = Interceptor.clearVariables(Interceptor.drawObject);
    }
    return originalFunc.apply(this,arguments);
  }
});
