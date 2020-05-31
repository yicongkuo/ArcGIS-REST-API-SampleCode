require([
	"esri/map",
	"esri/layers/FeatureLayer",
	"esri/dijit/PopupTemplate",
	
	"esri/renderers/UniqueValueRenderer",
	"esri/symbols/SimpleMarkerSymbol",
	"esri/symbols/SimpleLineSymbol",

	"esri/Color",

	"dojo/domReady!"
], function (
	Map, FeatureLayer, PopupTemplate,
	UniqueValueRenderer, SimpleMarkerSymbol, SimpleLineSymbol,
	Color
) {
	
	/*********************
	 *  step 1: 建立圖框
	 *******************/ 
	var map = new Map("mapDiv", {
		basemap: 'gray',
		center: [120.677584, 24.15294],
		zoom  : 13
	});
		
	/*********************
	 *  step 2: 加入圖層
	 *******************/
	var url = "https://services5.arcgis.com/phO4kHKUZUUmLNgD/ArcGIS/rest/services/migxq/FeatureServer/0";
	var treeLayer = new FeatureLayer(url, {
		outFields: ["*"]
	});
	map.addLayer(treeLayer);

	/********************************
	 *  step 3: 設計符號 & 資訊視窗
	 ********************************/
	/// 設計符號
	var defaultSymbol = pointSymbol({
		line: { width: 1.5, color: new Color([255, 255, 255, 1]) },
		marker: { size: 14, color: new Color([71, 71, 71, 0.52]) }
	});
	
	var renderer = new UniqueValueRenderer(defaultSymbol, "f4");
		renderer.addValue({
			value: "蟲害",
			symbol: pointSymbol({
				line: { width: 1.5, color: new Color([255, 255, 255, 1]) },
				marker: { size: 14, color: new Color([230, 0, 169, 0.52]) }
			})
			});
		renderer.addValue({
			value: "病害",
			symbol: pointSymbol({
				line: { width: 1.5, color: new Color([255, 255, 255, 1]) },
				marker: { size: 14, color: new Color([230, 152, 0, 0.52]) }
			})
		});
		renderer.addValue({
			value: "生理性",
			symbol: pointSymbol({
				line: { width: 1.5, color: new Color([255, 255, 255, 1]) },
				marker: { size: 14, color: new Color([0, 115, 76, 0.52]) }
			})
		});

	/// 設定資訊視窗
	var popup = new PopupTemplate({
	    title: "案件編號: {f1}",

	    fieldInfos: [
	      { fieldName: "f4", visible: true, label: '危害種類' },
	      { fieldName: "f5", visible: true, label: '案件連結' },
	      { fieldName: "f6", visible: true, label: '紀錄時間', format: { dateFormat: 'shortDate' } }
	    ],
	});

	/// 對圖層套用樣式與資訊視窗規則
	treeLayer.setRenderer(renderer);
	treeLayer.setInfoTemplate(popup);

	/********************************
	 *  step 4: 主功能設計
	 ********************************/

	 // 例如 圖層編輯, 查詢 ...


	/********************************
	 *  utilities
	 ********************************/
	function pointSymbol (option) {
		var line = new SimpleLineSymbol();
			line.setWidth(option.line.width);
			line.setColor(option.line.color);
		var marker = new SimpleMarkerSymbol();
			marker.setColor(option.marker.color);
			marker.setOutline(line);
			marker.setSize(option.marker.size);

		return marker;
	}
});