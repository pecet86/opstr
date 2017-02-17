/**
* @package   PSTR
* @author    Paweł Cal <MapaInfryRowerowejLublina@gmail.com>
* @copyright (c) 2016 Paweł Cal <MapaInfryRowerowejLublina@gmail.com>
* @license   GPL-3.0+
*
* Niniejszy program jest wolnym oprogramowaniem; możesz go 
* rozprowadzać dalej i/lub modyfikować na warunkach Powszechnej
* Licencji Publicznej GNU, wydanej przez Fundację Wolnego
* Oprogramowania - według wersji 2-giej tej Licencji lub którejś
* z późniejszych wersji. 
* Niniejszy program rozpowszechniany jest z nadzieją, iż będzie on 
* użyteczny - jednak BEZ JAKIEJKOLWIEK GWARANCJI, nawet domyślnej 
* gwarancji PRZYDATNOŚCI HANDLOWEJ albo PRZYDATNOŚCI DO OKREŚLONYCH 
* ZASTOSOWAŃ. W celu uzyskania bliższych informacji - Powszechna 
* Licencja Publiczna GNU. 
* Z pewnością wraz z niniejszym programem otrzymałeś też egzemplarz 
* Powszechnej Licencji Publicznej GNU (GNU General Public License);
* jeśli nie - napisz do Free Software Foundation, Inc., 675 Mass Ave,
* Cambridge, MA 02139, USA. 
*/

var Config = {};
Config.map;
Config.select;
Config.lat = 51.110668;
Config.lon = 17.034993;
Config.gg = "EPSG:4326";
Config.sm = "EPSG:900913";
Config.zoom = 13; //start zoom
Config.zoomMaxMap = 16; //max przybliżenie mapy
Config.zoomMinMap = 8; //max oddalenie mapy
Config.extent = [];
Config.wgs84Sphere = new ol.Sphere(6378137);
Config.transparency = 0.8;
Config.width_line = 3;

if(!Array.prototype.equals){
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
}
if(!('scaleFromCenter' in ol.extent)){
	ol.extent.scaleFromCenter = function(extent, value) {
	  var deltaX = ((extent[2] - extent[0]) / 2) * (value - 1);
	  var deltaY = ((extent[3] - extent[1]) / 2) * (value - 1);
	  extent[0] -= deltaX;
	  extent[2] += deltaX;
	  extent[1] -= deltaY;
	  extent[3] += deltaY;
	};
}

function tt2(lon, lat) {
	return ol.proj.transform([lon, lat], Config.gg, Config.sm);
}
function getValuesInputs(select){
	return $(select).map(function () {
		var t = $(this);
		if(t[0].type == "checkbox"){
			return t.prop('checked');
		}else if(t[0].type == "number"){
			return +t.val();
		}else{
			return t.val();
		}	
	});
}

function init() {
	//config pre map
	var dataBase = {
		zoom : Config.zoom,
		center : tt2(Config.lon, Config.lat),
		rotation : 0,
		layers : ''
	}
	var view = new ol.View({
		center : dataBase.center,
		zoom : dataBase.zoom,
		rotation : dataBase.rotation,
		minZoom : Config.zoomMinMap,
		maxZoom : Config.zoomMaxMap
	});
	
	Config.raster = new ol.layer.Tile({
		type : 'base',
		visible : true,
		source : new ol.source.OSM({
			crossOrigin : "anonymous"
		})
	});
	Config.STR_layer = layerInfra();
	
	//map
	Config.map = new ol.Map({
		layers : [
			Config.raster, Config.STR_layer			
		],
		target : 'map',
		view : view,
		controls : ol.control.defaults({
				mouseWheelZoom : false, 
				zoom : false,
				rotate : false
			}).extend([
			/*new ol.control.ZoomToExtent({
				extent : extent
			}),*/
			new ol.control.ScaleLine({
				units : 'metric'
			}),
			new ol.control.Attribution({
				collapsible : true
			})
		])
	});

	Config.map.getInteractions().forEach(function(interaction) {
		if (interaction instanceof ol.interaction.MouseWheelZoom) {
			interaction.setActive(false);
		}
	}, this);
	$(window).bind("resize", function fixContentHeight(event, data) {
		if (Config.map instanceof ol.Map) {
			var size = Config.map.getSize();
			Config.map.setSize([size[0], size[0]]);
		}
	});	
}

//layers
function layerInfra(){
	var layer;
	var source = new ol.source.Vector();
	var format = new ol.format.OSMXML();
	
	function styleFunction(feature, resolution) {
		var type = feature.getGeometry().getType();
		var zoom = Config.map.getView().getZoom();
		
		if(type === "Point"){
			var name = feature.get("name");		
			var scale = zoom >= 13 ? 1.5 : 1;
				
			return [new ol.style.Style({
				image : new ol.style.Circle({
					radius : 12 * scale,
					fill : new ol.style.Fill({
						color : [255, 0, 0, Config.transparency]
					}),
					stroke : new ol.style.Stroke({
						color : [255, 0, 0, 1],
						width : 2 * scale
					})
				}),
				text : new ol.style.Text({
					text : "" + parseInt(name),
					scale : 1 * scale,
					fill : new ol.style.Fill({
						color : [255, 255, 255, 1]
					}),
					stroke : new ol.style.Stroke({
						color : [0, 0, 0, Config.transparency],
						width : 3.5
					})
				}),
				zIndex : 200
			})];
		}else if(type === "LineString"){		
			return [new ol.style.Style({
					fill : new ol.style.Fill({
						color : [0, 0, 0, 0]
					}),
					stroke : new ol.style.Stroke({
						color : [0, 0, 0, Config.transparency/2],
						width : Config.width_line,
						lineCap : 'round'
					}),
					zIndex : 100
				}),
				new ol.style.Style({
					fill : new ol.style.Fill({
						color : [0, 0, 0, 0]
					}),
					stroke : new ol.style.Stroke({
						color : [0, 0, 255, Config.transparency],
						width : Config.width_line-2,
						lineCap : 'round'
					}),
					zIndex : 100
				})];
		}
	}

	layer = new ol.layer.Vector({
		source : source,
		style : styleFunction,
		visible : true
	});

	return layer;
}

//load data
function generate(data){
	var table = d3.select('#route');
	table.selectAll("*").remove();
	
	var add_distance_total = getValuesInputs('#add_distance_total')[0];
	var add_distance = getValuesInputs('#add_distance')[0];
	
	var distance = 0;
	var data2 = [];
	var columns = ['name', 'distance', 'total'];
	for(var i = 0; i < data.points.length; i++){
		var d = parseFloat(data.distance[i] || 0) / 1000;
		
		data2.push({
			'name' : data.points[i][1],
			'distance' : d < 100 ? d.toFixed(1) : d.toFixed(0),
			'total' : distance < 100 ? distance.toFixed(1) : distance.toFixed(0)
		});
		distance += d;
	}
	
	var rows = table.selectAll('tr')
		.data(data2)
		.enter()
		.append('tr');

	var cells = rows.selectAll('td')
		.data(function (row) {
			var r = [];
			
			r.push({
				'class' : 'rte',
				'value' : row['name'],
				'type' : 1
			});
			r.push({
				'class' : 'km',
				'value2' : row['total'],
				'value1' : row['distance'],
				'type' : 2
			});
			
			return r;
		})
		.enter()
		.append('td')
		.attr("class", function(d, dx, dy){
			return d.class;
		})
		.html(function (d, dx, dy) { 
			if(d.type == 1){
				return d.value; 
			}else if(d.type == 2){
				var r = [];
				if(add_distance) r.push(d.value1);
				if(add_distance_total) r.push(d.value2);
				return r.join('<br/>'); 
			}
			
		});
}
function loadData(data){
	Config.data = data;
	generate(data);
	
	$.ajax({
		type: 'POST',
		url: 'create_print',
		dataType: 'json',
		timeout: 60000,
		data: {
			routes : data.routes,
			point_start : data.points[0][0],
			point_end : data.points[data.points.length-1][0]
		},
		success: function(data) {
			var source = Config.STR_layer.getSource();
			
			var features = new ol.format.GeoJSON().readFeatures(data, { featureProjection: Config.sm })
			source.addFeatures(features);

			var dataExtent = source.getExtent();
			if(Config.map)
				Config.map.getView().fit(dataExtent, Config.map.getSize());
		},
		failure: function(msg) {
			console.log(msg);
		}
	});
}

//side menu 
$(document).ready(function(){
	var beforePrint = function(){
		$('#opis').hide();
		ga('send', 'event', 'func_print', 'before');
	};
    var afterPrint = function(){
		$('#opis').show();
		ga('send', 'event', 'func_print', 'after');
	};
	if (window.matchMedia) {
        var mediaQueryList = window.matchMedia('print');
        mediaQueryList.addListener(function(mql) {
            if (mql.matches) {
                beforePrint();
            } else {
                afterPrint();
            }
        });
    }	
	window.onbeforeprint = beforePrint;
    window.onafterprint = afterPrint;
	
	$('#print').click(function(){
		window.print();
	});
	$('#add_distance_total').click(function(){
		generate(Config.data);
		ga('send', 'event', 'func_print', 'add_distance_total');
	});
	$('#add_distance').click(function(){
		generate(Config.data);
		ga('send', 'event', 'func_print', 'add_distance');
	});
	$('#add_map:checkbox').change(function() {
		if($('#map').is(":visible")){
			$('#map').hide();
		}else{
			$('#map, canvas').show();
		}
		ga('send', 'event', 'func_print', 'map_show');		
	}); 
});