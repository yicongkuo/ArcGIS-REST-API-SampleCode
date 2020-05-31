require([
	"esri/arcgis/utils",
	"dojo/domReady!"
], function (arcgisUtils) {
	/********************************
	 *  step 1: 取得 webmap
	 ********************************/
	var mapId = "13b6d83585fe4943947b67b1242618a1";
	var getWebmap = arcgisUtils.createMap(mapId, "mapDiv");
	
	/********************************
	 *  step 2: 主功能設計
	 ********************************/
	getWebmap.then(function (mapObj) {
		console.log(mapObj);

		/// 例如 圖層編輯, 查詢 ...
	});
});