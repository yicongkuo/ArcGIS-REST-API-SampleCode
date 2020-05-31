(function (global, $){
    // 載入Openlayer模組
    var VectorSource = ol.source.Vector;
    var VectorLayer = ol.layer.Vector;
    var EsriJSON = ol.format.EsriJSON;
    var {Icon, Fill, Stroke, Style} = ol.style;
    var tileStrategy = ol.loadingstrategy.tile;
    var createXYZ = ol.tilegrid.createXYZ;

    /**
     * ArcGIS Feature Layer
     */
    var ArcGISFeatureLayer = function (url, map){
        this.url = url;
        this.map = map;
        
        var layer = new VectorLayer({
            source: this.FeatureLayerSource(this.url, this.map, this)
        });

        this._setLayerSymbol(this.url, layer, this);
        return layer;
    };

    ArcGISFeatureLayer.prototype = {
        _olMapExtent: function (map){
            return map.getView().calculateExtent();
        }, 
        _olMapSR: function (map){
            return map.getView().getProjection().getCode().split(':')[1];
        },
        _arcgisExtent: function (extent, SR){
            return {
                xmin: extent[0],
                ymin: extent[1],
                xmax: extent[2],
                ymax: extent[3],
                spatialReference: { wkid: SR } 
            };
        },
        _defaultQueryParams: function (map){
            var extent = this._olMapExtent(map);
            var SR = this._olMapSR(map);
            return {
                geometry : this._arcgisExtent(extent, SR),
                geometryType : 'esriGeometryEnvelope',
                inSR : SR,
                spatialRel : 'esriSpatialRelIntersects',
                returnGeometry: true,
                outFields: '*',
                f: 'json'
            };
        },
        _defaultQueryUri: function (params){
            var uri = '';
            var geometryUri = 'geometry=' + encodeURIComponent(
                JSON.stringify(params.geometry)
            );

            for (key in params) {
                if (key !== 'geometry')
                    uri += ( key+'='+JSON.stringify(params[key])+'&' );
            }
           
            return this.url + '/query?' + uri.replace(/\"/g,"") 
                    + geometryUri;
        },
        FeatureLayerSource: function (url, map, FeatureLayer){
            var vectorsource = new VectorSource({
                loader: function (){
                    var params = FeatureLayer._defaultQueryParams(map);
                    var endpoint = FeatureLayer._defaultQueryUri(params);
                    FeatureLayer._queryDefaultLayerSource(
                        endpoint, vectorsource, map
                    );
                },
                strategy: function(extent, resolution) {
                    if(this.resolution && this.resolution != resolution){
                        this.loadedExtentsRtree_.clear();
                    }
                    return [extent];
                }
            });
            return vectorsource;
        },
        _queryDefaultLayerSource: function (url, vectorsource, map){
            $.post(url).then(function (response){
                // dataProjection will be read from document
                if (response.error) {
                    console.log(
                        response.error.message + '\n' + 
                        response.error.details.join('\n')
                    );
                } else {
                    // dataProjection will be read from document
                    var features = new EsriJSON().readFeatures(response, {
                        featureProjection:  map.getView().getProjection().getCode().split(':')[1]
                    });
                    if (features.length > 0) {
                        vectorsource.addFeatures(features);
                    }
                }
            });
        },
        _setLayerSymbol: function (url, layer, FeatureLayer){
           var url = url + '?f=json';
            $.post(url).then(function (response){
                var type = JSON.parse(response).geometryType;
                if(type === 'esriGeometryPoint' )
                    layer.setStyle( FeatureLayer._pointIconSymbol() );

                if(type === 'esriGeometryPolyline' )
                    layer.setStyle( FeatureLayer._polylineSymbol() ) ;

                if(type === 'esriGeometryPolygon' )
                    layer.setStyle( FeatureLayer._polygonSymbol() );

                if(type === 'esriGeometryEnvelope' )
                    layer.setStyle( FeatureLayer._polygonSymbol() );
            });
        },
        _pointIconSymbol: function (){
            return new Style({
                image: new Icon(({
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'fraction',
                    src: './icon.png'
                }))
            });
        },
        _polylineSymbol: function (){           
            return new Style({
                stroke: new Stroke({
                    color: 'brown',
                    width: 1
                })
            });
        },
        _polygonSymbol: function (){
            return new Style({
                stroke: new Stroke({ 
                    color: 'blue', 
                    lineDash: [4], 
                    width: 3 
                }),
                fill: new Fill({ color: 'rgba(0, 0, 255, 0.1)'})
            });
        }
    };

    // 匯出模組
    global.ol.layer.ArcGISFeatureLayer = ArcGISFeatureLayer;

}(window, jQuery));