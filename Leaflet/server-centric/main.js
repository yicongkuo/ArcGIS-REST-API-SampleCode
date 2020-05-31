/*********************
 *  step 1: 建立圖框
 *******************/ 
var map = L.map('mapDiv');
map.setView([24.15294, 120.677584], 13);

/*********************
 *  step 2: 加入圖層
 *******************/
/// 加入底圖
var basemapLayer = L.esri.basemapLayer('Gray');
map.addLayer(basemapLayer);

var basemapReferenceLayer = L.esri.basemapLayer('GrayLabels');
map.addLayer(basemapReferenceLayer);

/// 加入主題圖層
var layer = L.esri.featureLayer({
	url: 'https://services5.arcgis.com/phO4kHKUZUUmLNgD/ArcGIS/rest/services/migxq/FeatureServer/0',
	pointToLayer: styleMarker
});

map.addLayer(layer);

/********************************
 *  step 3: 設計符號 & 資訊視窗
 ********************************/
/// 設計符號
function styleMarker (feature, latlng) {
	var type = feature.properties.f4;
	var styleOps;

	if (type === "蟲害")
		styleOps = getStyle({ fillColor: "#e600a9" });
	else if (type === "病害")
		styleOps = getStyle({ fillColor: "#e69800" });
	else if (type === "生理性")
		styleOps = getStyle({ fillColor: "#00734c" });
	else
		styleOps = getStyle({ fillColor: "#474747" });

	return L.circleMarker(latlng, styleOps);
}

function getStyle (options) {
	var styleOps = new Object();
		styleOps.radius      = !(options.radius)? 8: options.radius;
		styleOps.fill        =  (options.fill === undefined)? true: options.fill;
		styleOps.fillColor   = !(options.fillColor)? "#474747": options.fillColor;
		styleOps.fillOpacity = !(options.fillOpacity)? 0.5: options.fillOpacity;
		styleOps.stroke		 =  (options.stroke === undefined)? true: options.fill;
		styleOps.color       = !(options.color)? "#ffffff": options.fillColor;
		styleOps.weight      = !(options.weight)? 1.5: options.weight;
		styleOps.opacity     = !(options.opacity)? 1: options.opacity;

	return styleOps;
}

/// 設計資訊視窗


layer.bindPopup(function (layer) {
	var time = new Date(layer.feature.properties.f6);
	
	var timeStr = time.getFullYear() + '/' + time.getMonth() + '/' + time.getDate();

	var content = '<h4>案件編號: {f1}</h4>' + 
			  '<p>危害種類: {f4}</p>' + 
			  '<p>案件連結: <a href={f5}>更多資訊</a></p>' + 
			  '<p>紀錄時間: ' + timeStr + '</p>';

	return L.Util.template(content, layer.feature.properties);
});