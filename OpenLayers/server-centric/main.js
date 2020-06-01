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
var {Fill, Stroke, Circle, Style} = ol.style;

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
    source: layerSource,
	style: styleMarker
});

map.addLayer(layer);

/********************************
 *  step 3: 設計符號 & 資訊視窗
 ********************************/
/// 設計符號
function styleMarker (feature, resolution) {
	var type = feature.values_.f4;
	
	if (type === "蟲害")
		return getStyle({ fillColor: "rgba(230, 0, 169, 0.5)" });
	
	else if (type === "病害")
		return getStyle({ fillColor: "rgba(230, 152, 0, 0.5)" });
	
	else if (type === "生理性")
		return getStyle({ fillColor: "rgba(0, 115, 76, 0.5)" });
	
	else
		return getStyle({ fillColor: "rgba(71, 71, 71, 0.5)" });
}

function getStyle (options) {
	var styleOps = new Object();
		styleOps.radius      = !(options.radius)? 8: options.radius;
		styleOps.fillColor   = !(options.fillColor)? "rgba(71, 71, 71, 0.52)": options.fillColor;
		styleOps.color       = !(options.color)? "#ffffff": options.fillColor;
		styleOps.weight      = !(options.weight)? 1.5: options.weight;

	var fill = new Fill({
		color: styleOps.fillColor
	});

	var stroke = new Stroke({
		color: styleOps.color,
		width: styleOps.weight 
	});

	return new Style({
		image: new Circle({ fill: fill, stroke: stroke, radius: styleOps.radius }),
		fill: fill,
		stroke: stroke
	});
}

/// 設定資訊視窗
var select = new ol.interaction.Select({
	hitTolerance: 5,
	multi: true,
	condition: ol.events.condition.singleClick
});
map.addInteraction(select);

var popup = new ol.Overlay.PopupFeature({
	popupClass: 'default anim',
	select: select,
	canFix: true,
	template: {
		title: function(f) { return '案件編號: ' + f.get('f1'); },
    	attributes: {
			'f4': { title: '危害種類' },
			'f5': { 
				title: '案件連結',
				format: function (value, f) {
					return '<a href="' + value + '">更多資訊</a>'
				} 
			},
			'f6': { 
				title: '紀錄時間',
				format: function (value, f) {
					var time = new Date(value);
					var timeStr = time.getFullYear() + '/' + time.getMonth() + '/' + time.getDate();

					return timeStr;
				} 
			}
    	}
	}
});
map.addOverlay (popup);

/********************************
*  step 4: 主功能設計
********************************/

// 例如 圖層編輯, 查詢 ...

}; // End of window.onload