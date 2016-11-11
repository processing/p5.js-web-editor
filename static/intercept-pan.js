var textOutputElement;
var canvasLocation ='';
var maxFreq = 1000;
var minFreq = 250;
var currFreq, currVol, currPan;
var xPosDiff=0, yPosDiff=0;

//initialise parameters
var objectCount = 0;
var currFrame = 2;
var prevFrame = 2;
var objects = [];

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

// create web audio api context
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// create Oscillator node
var oscillatorNode = audioCtx.createOscillator();
var gainNode = audioCtx.createGain();
var panNode = audioCtx.createStereoPanner();

funcNames = funcNames.filter(function(x) {
  var className = x["class"];
  return (x["name"] && x["params"] && (className==='p5'));
})

funcNames.forEach(function(x){
  var originalFunc = p5.prototype[x.name];
  p5.prototype[x.name] = function(){
    orgArg = arguments;
    if(frameCount == 1 && (x.module.localeCompare('Shape') === 0)) {
      for(var i =0; i < x.params.length; i++) {
        if(x.params[i].description.indexOf('x-coordinate')>-1){
          xPosPrev = arguments[i];
          xPosCurr = arguments[i];
        }
        if(x.params[i].description.indexOf('y-coordinate')>-1){
          yPosPrev = arguments[i];
          yPosCurr = arguments[i];
        }
      }
    }
    // Pull out only the shapes in draw()
    else if(frameCount > 1 && (frameCount%1 == 0) && (x.module.localeCompare('Shape') === 0)) {
      if(frameCount != currFrame) {
        currFrame ++;
        objectCount = 0;
      }
      objectCount ++;

      if(!objects[objectCount-1]){
          objects[objectCount-1] = new Object({
          xPosCurr:0,
          xPosDiff:0,
          xPosPrev:0,
          yPosCurr:0,
          yPosDiff:0,
          yPosPrev:0
        });
      }
      //pull out only the x coord values and compare with prev value
      for(var i =0; i < x.params.length; i++) {
        if(x.params[i].description.indexOf('x-coordinate')>-1){

          objects[objectCount-1].xPosCurr = arguments[i];
          objects[objectCount-1].xPosDiff = objects[objectCount-1].xPosCurr - objects[objectCount-1].xPosPrev;
          objects[objectCount-1].xPosPrev = objects[objectCount-1].xPosCurr;
        }
        if(x.params[i].description.indexOf('y-coordinate')>-1){
          objects[objectCount-1].yPosCurr = arguments[i];
          objects[objectCount-1].yPosDiff = objects[objectCount-1].yPosCurr - objects[objectCount-1].yPosPrev;
          objects[objectCount-1].yPosPrev = objects[objectCount-1].yPosCurr;
        }
        if(abs(objects[objectCount-1].xPosDiff>0)||abs(objects[objectCount-1].yPosDiff>0))
        {
          currNote = (1-objects[objectCount-1].yPosCurr/height)*(12); // mapping hieghts to notes from 1-100
          //fn = f0 * (a)n
          currLogFreq = 440 * Math.pow(Math.pow(2,(1/12)),currNote);
          currVol = 0.4;
          x_coord = frameCount%10 - 5;
          currVol = 2*objectCount*Math.exp(-((x_coord+2*objectCount)*(x_coord+2*objectCount)));
          currPan = (objects[objectCount-1].xPosCurr/width)*2 - 1;
          oscillatorNode.frequency.value = currLogFreq;
          gainNode.gain.value = currVol;
          panNode.pan.value = currPan;
        }
        else {
          gainNode.gain.value = 0;
        }
      }
    }
  return originalFunc.apply(this,arguments);
  }
});
//
//
// funcNames.forEach(function(x){
//   var originalFunc = p5.prototype[x.name];
//   p5.prototype[x.name] = function(){
//     orgArg = arguments;
//
//     // set up all the initial values
//     if(frameCount == 1 && x.module=='Shape') {
//       for(var i =0; i < x.params.length; i++) {
//         if(x.params[i].description.indexOf('x-coordinate')>-1){
//           xPosPrev = arguments[i];
//           xPosCurr = arguments[i];
//         }
//         if(x.params[i].description.indexOf('y-coordinate')>-1){
//           yPosPrev = arguments[i];
//           yPosCurr = arguments[i];
//         }
//       }
//     }
//
//     // Pull out only the shapes in draw()
//     else if(frameCount > 1 && (frameCount%1 == 0) && x.module=='Shape') {
//
//       if(frameCount != currFrame) {
//         currFrame ++;
//         objectCount = 0;
//       }
//       objectCount ++;
//
//       if(!objects[objectCount-1]){
//           objects[objectCount-1] = new Object({
//           xPosCurr:0,
//           xPosDiff:0,
//           xPosPrev:0,
//           yPosCurr:0,
//           yPosDiff:0,
//           yPosPrev:0
//         });
//       }
//       //pull out only the x coord values and compare with prev value
//       for(var i =0; i < x.params.length; i++) {
//         if(x.params[i].description.indexOf('x-coordinate')>-1){
//
//           objects[objectCount-1].xPosCurr = arguments[i];
//           objects[objectCount-1].xPosDiff = objects[objectCount-1].xPosCurr - objects[objectCount-1].xPosPrev;
//           objects[objectCount-1].xPosPrev = objects[objectCount-1].xPosCurr;
//         }
//         if(x.params[i].description.indexOf('y-coordinate')>-1){
//           objects[objectCount-1].yPosCurr = arguments[i];
//           objects[objectCount-1].yPosDiff = objects[objectCount-1].yPosCurr - objects[objectCount-1].yPosPrev;
//           objects[objectCount-1].yPosPrev = objects[objectCount-1].yPosCurr;
//         }
//         if(abs(objects[objectCount-1].xPosDiff>0)||abs(objects[objectCount-1].yPosDiff>0))
//         {
//           currNote = (1-objects[objectCount-1].yPosCurr/height)*(12); // mapping hieghts to notes from 1-100
//           //fn = f0 * (a)n
//           currLogFreq = 440 * Math.pow(Math.pow(2,(1/12)),currNote);
//           currVol = 0.4;
//           x_coord = frameCount%10 - 5;
//           currVol = 2*objectCount*Math.exp(-((x_coord+2*objectCount)*(x_coord+2*objectCount)));
//           currPan = (objects[objectCount-1].xPosCurr/width)*2 - 1;
//           oscillatorNode.frequency.value = currLogFreq;
//           gainNode.gain.value = currVol;
//           panNode.pan.value = currPan;
//         }
//         else {
//           gainNode.gain.value = 0;
//         }
//       }
//
//     }
//     return originalFunc.apply(this,arguments);
//   }
// });

window.onload = function() {
  oscillatorNode.type = 'sine';
  oscillatorNode.frequency.value = 440; // value in hertz
  oscillatorNode.start();
  oscillatorNode.connect(gainNode);
  gainNode.connect(panNode);
  panNode.connect(audioCtx.destination);
  gainNode.gain.value = 0;
}
