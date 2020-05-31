window.onload = function() {
/***********************
 * 載入模組
 ***********************/
/// 從 Openlayers 中載入模組
var Map = ol.Map; 
var View = ol.View;
var {fromLonLat} = ol.proj;
var TileLayer = ol.layer.Tile;
var {XYZ} = ol.source;
var VectorSource = ol.source.Vector;
var VectorLayer = ol.layer.Vector;
var EsriJSON = ol.format.EsriJSON;

/*********************
 *  step 1: 建立圖框
 *******************/ 
/// 建立地圖控制器 MapView
var mapView = new View({
    center: new fromLonLat([120.677584, 24.15294]),
    zoom  : 13
});

/// 建立地圖容器
var map = new Map({
    target: 'mapDiv',
    view  : mapView
});

/*********************
 *  step 2: 加入圖層
 *******************/
/// 加入底圖
var basemapLayer = new TileLayer({
	source: new XYZ({
		attributions: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
		'rest/services/Canvas/World_Light_Gray_Base/MapServer">ArcGIS</a>',
		url: 'https://server.arcgisonline.com/ArcGIS/rest/services/' +
		'Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'
	})
});
map.addLayer(basemapLayer);

var basemapReferenceLayer = new TileLayer({
	source: new XYZ({
		attributions: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
		'rest/services/Canvas/World_Light_Gray_Reference/MapServer">ArcGIS</a>',
		url: 'https://server.arcgisonline.com/ArcGIS/rest/services/' +
		'Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}'
	})
});
map.addLayer(basemapReferenceLayer);

/// 加入主題圖層
var layerSource = new VectorSource({
	loader: function(extent, resolution, projection) {
		var url = 'https://services5.arcgis.com/phO4kHKUZUUmLNgD/ArcGIS/rest/services/migxq/FeatureServer/0/query/?f=json&' +
			'returnGeometry=true&spatialRel=esriSpatialRelIntersects&geometry=' +
			encodeURIComponent('{"xmin":' + extent[0] + ',"ymin":' +
			extent[1] + ',"xmax":' + extent[2] + ',"ymax":' + extent[3] +
			',"spatialReference":{"wkid":102100}}') +
			'&geometryType=esriGeometryEnvelope&inSR=102100&outFields=*' +
			'&outSR=102100';
		$.post(url).then(function(response) {
			if (response.error) {
				alert(response.error.message + '\n' +
				response.error.details.join('\n'));
			} else {
				// dataProjection will be read from document
				var features = new EsriJSON().readFeatures(response, {
					featureProjection: projection
				});
				if (features.length > 0) {
					layerSource.addFeatures(features);
				}
			}
		});
	},
	strategy: function(extent, resolution) {
		if(this.resolution && this.resolution != resolution){
			this.loadedExtentsRtree_.clear();
		}
		return [extent];
	}
});

var layer = new VectorLayer({
    source: layerSource
});

map.addLayer(layer);

/********************************
 *  step 3: 設計符號 & 資訊視窗
 ********************************/

};