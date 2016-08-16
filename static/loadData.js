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
fetchJSONFile('https://raw.githubusercontent.com/processing/p5.js-website/9f1a4cd299c1330b046373407d42894e274d20e7/reference/data.min.json', function(data){
    allData = data;
});
