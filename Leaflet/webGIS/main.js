/********************************
 *  step 1: 取得 webmap
 ********************************/
var mapId = "13b6d83585fe4943947b67b1242618a1";

var webmap = L.esri.webMap(mapId, { map: L.map('mapDiv') });

console.log(webmap);