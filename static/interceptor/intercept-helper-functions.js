String.prototype.paddingLeft = function (paddingValue) {
   return String(paddingValue + this).slice(-paddingValue.length);
};

function MergeObjRecursive(obj1, obj2) {
  var obj3 = {};
  for(p in obj1) {
    obj3[p] = obj1[p];
  }
  for(p in obj2) {
    if(Object.keys(obj3).indexOf(p)<0){
      obj3[p] = obj2[p];
    }
    else {
      obj3[p] = obj3[p] + obj2[p];
    }
  }
  return obj3;
}

if(Array.prototype.equals)
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});
