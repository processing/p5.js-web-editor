var allData;
function fetchJSONFile(path, callback) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4) {
            if (httpRequest.status === 200) {
                var data = JSON.parse(httpRequest.responseText);
                if (callback) callback(data);
            }
        }
    };
    httpRequest.open('GET', path,false);
    httpRequest.send();
}
fetchJSONFile('https://rawgit.com/processing/p5.js-website/master/reference/data.json', function(data){
    allData = data;
});
