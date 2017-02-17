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
Config.zoom = 12; //start zoom
Config.zoomMaxMap = 16; //max przybliżenie mapy
Config.zoomMinMap = 8; //max oddalenie mapy
Config.extent = [];
Config.wgs84Sphere = new ol.Sphere(6378137);
Config.transparency = 0.8;
Config.width_line = 3;
Config.highlighted_description = null;
Config.highlighted_elevation = null;

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
function CenterMap(lon, lat) {
    console.log("Long: " + lon + " Lat: " + lat);//tt2(lon, lat)
    Config.map.getView().setCenter([lon, lat]);
    Config.map.getView().setZoom(Config.zoom);
}


function init() {
	loadingData();
	
	//popup
	var popup = new ol.Overlay.Popup();

	//config pre map
	var dataBase = {
		zoom : Config.zoom,
		center : tt2(Config.lon, Config.lat),
		rotation : 0,
		layers : ''
	}
	dataBase = loadFromURL(dataBase);
	var view = new ol.View({
		center : dataBase.center,
		zoom : dataBase.zoom,
		rotation : dataBase.rotation,
		minZoom : Config.zoomMinMap,
		maxZoom : Config.zoomMaxMap
	});
	
	var raster = new ol.layer.Tile({
		title : 'OSM',
		type : 'base',
		visible : false,
		source : new ol.source.OSM({
			crossOrigin : "anonymous"
		})
	});
	Config.STR_layer = layerInfra();
	
	var base_layers = new ol.layer.Group({
		title : 'Warstwy podstawowe',
		layers : [
			new ol.layer.Tile({
				title : 'Geoportal Ortofoto',
				type : 'base',
				visible : false,
				source : new ol.source.TileWMS({
					url : 'http://mapy.geoportal.gov.pl/wss/service/img/guest/ORTO/MapServer/WMSServer',
					params : {
						LAYERS : 'Raster',
						REQUEST : 'GetMap',
						FORMAT : 'image/png',
						VERSION : '1.1.1'
					},
					projection : 'EPSG:3857',
					crossOrigin : null
				})
			}),
			new ol.layer.Tile({
				title : 'Carto Dark Matter',
				type : 'base',
				visible : true,
				source : new ol.source.XYZ({
					url : "http://{a-d}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
					attributions : [new ol.Attribution({
						html : "&copy; Map tiles by Carto, under CC BY 3.0. Data by <a href='//www.openstreetmap.org/copyright'>OpenStreetMap</a>, under ODbL."
					})],
					crossOrigin : "anonymous"
				})
			}),
			new ol.layer.Tile({
				source: new ol.source.Stamen({
					layer: 'toner',
					crossOrigin : "anonymous"
				}),
				title : 'Stamen - toner',
				type : 'base',
				visible : false,
			}),
			raster
		]
	});
	
	//map
	Config.map = new ol.Map({
			layers : [
				base_layers,
				new ol.layer.Group({
					title : 'Nakładki',
					type : 'checkbox',
					layers : [					
						layerInfra2('green'),
						layerInfra2('paving'),
						layerInfra2('semifixed'),
						Config.STR_layer
					]
				})			
			],
			overlays: [popup],
			target : 'map',
			view : view,
			controls : ol.control.defaults().extend([
				new ol.control.FullScreen(),
				/*new ol.control.ZoomToExtent({
					extent : extent
				}),*/
				new ol.control.ScaleLine({
					units : 'metric'
				}),
				new ol.control.OverviewMap({
					layers : [base_layers]
				}),
				new ol.control.Attribution({
					collapsible : true
				})
			])
		});
	configure();
		
	//layerSwitcher
	var layerSwitcher = new ol.control.LayerSwitcher({
			tipLabel : 'Warstwy' // Optional label for button
		});
	Config.map.addControl(layerSwitcher);
	configLayers(dataBase);
	
	//selection
	if(createSelection) createSelection();
	
	//geocoder
	//Instantiate with some options and add the Control
	var geocoder = new Geocoder('nominatim', {
			provider : 'osm',
			autoComplete : true,
			lang : 'pl-PL',
			placeholder : 'Wyszukiwanie adresu',
			limit : 5,
			keepOpen : false,
			//debug : true
		});
	Config.map.addControl(geocoder);
	geocoder.on('addresschosen', function (evt) {
		var feature = evt.feature,
			coord = evt.coordinate,
			address = evt.address;
		// some popup solution
		//content.innerHTML = '<p>'+ address.formatted +'</p>';
		//overlay.setPosition(coord);
		ga('send', 'event', 'func', 'search', address);
	});

	
	var currentZoomLevel = Config.zoom;
	Config.map.on('moveend', checknewzoom);

	function checknewzoom(evt) {
		var oldZoomLevel = currentZoomLevel;
		var newZoomLevel = Config.map.getView().getZoom();
		if (newZoomLevel != currentZoomLevel) {
			currentZoomLevel = newZoomLevel;
			$(document).trigger("zoomend", [oldZoomLevel, newZoomLevel]);
		}
	}	
	
	//Google analytics
	try{
		listenersGA();
	} catch (err) {
        console.log(err);
    } 

	$("body").trigger("init");
	$(".gcd-gl-btn")
		.attr('title', 'Szukaj');
	$(".ol-geocoder")
		.hover(function () {
			$(this).find(".ol-control").addClass("gcd-gl-expanded");
			$(this).find(".gcd-gl-input").focus();
		}, function () {
			$(this).find(".ol-control").removeClass("gcd-gl-expanded");
		});
	
	
}

//permlink
function loadFromURL(data){
	if (window.location.hash !== '') {
		var hash = window.location.hash;
		if(hash.indexOf('#map=') !== 0){
			return data;
		}
		
		// try to restore center, zoom-level and rotation from the URL
		hash = hash.replace('#map=', '');
		var parts = hash.split('/');
		if (parts.length === 5) {
			data.zoom = parseInt(parts[0], 10);
			data.center = [
				parseFloat(parts[1]),
				parseFloat(parts[2])
			];
			data.rotation = parseFloat(parts[3]);
			data.layers = parts[4];
		}
		
		if(data.layers !== ''){			
			function cl(layers, arry){
				var l = layers.substring(0, 1);
				layers = layers.slice(1);
				
				if(l === 'T' || l === 'F'){
					arry.push(l === 'T');
				}else if(l === '['){
					var a = [];
					var ls2 = layers;
					
					while(ls2.length > 0){
						ls2 = cl(ls2, a);
						if(ls2.indexOf('#') === 0){
							layers = ls2.slice(1);
							ls2 = '';
						}							
					}
					
					arry.push(a);				
				}else if(l === ']'){
					return '#'+layers;
				}else{
					return '';
				}

				return layers;				
			}
			
			var ls = data.layers;
			data.layers = [];
			while(ls.length > 0){
				ls = cl(ls, data.layers);	
			}
		}
	}
	
	return data;
}
function configure(){
	var shouldUpdate = true;
	var view = Config.map.getView();
	
	function layerToPath(layer, path){
		var parent = layer || Config.map;
		parent.getLayers().getArray().forEach(function(layer){
			if("layers" in layer.getProperties()){
				path += '[' + layerToPath(layer, '') + ']';
			}else if("title" in layer.getProperties()){
				path += layer.getVisible()?'T':'F';
			}
		});
		
		return path;
	}
	
	var updatePermalink = function () {
		if (!shouldUpdate) {
			// do not update the URL when the view was changed in the 'popstate' handler
			shouldUpdate = true;
			return;
		}

		var center = view.getCenter();
		var layers = layerToPath(Config.map, '');
		var hash = '#map=' +
			view.getZoom() + '/' +
			Math.round(center[0] * 100) / 100 + '/' +
			Math.round(center[1] * 100) / 100 + '/' +
			view.getRotation() + '/' +
			layers;
		var state = {
			zoom : view.getZoom(),
			center : view.getCenter(),
			rotation : view.getRotation(),
			layers : layers
		};
		window.history.pushState(state, 'map', hash);
	};

	Config.map.on('moveend', updatePermalink);
	function lon(layer){
		var parent = layer || Config.map;
		parent.getLayers().getArray().forEach(function(layer){
			if("layers" in layer.getProperties()){
				lon(layer);
			}else if("title" in layer.getProperties()){
				layer.on('change:visible', updatePermalink);
			}
		});
	}
	lon(Config.map);

	// restore the view state when navigating through the history, see
	// https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onpopstate
	window.addEventListener('popstate', function (event) {
		if (event.state === null) {
			return;
		}
		Config.map.getView().setCenter(event.state.center);
		Config.map.getView().setZoom(event.state.zoom);
		Config.map.getView().setRotation(event.state.rotation);
		shouldUpdate = false;
	});
}
function configLayers(data){
	if(data.layers === ''){
		return;
	}
	
	function layersArray(layer){
		var ls = [];
		var parent = layer || Config.map;
		parent.getLayers().getArray().forEach(function(layer){
			if("layers" in layer.getProperties()){
				ls.push(layersArray(layer));
			}else if("title" in layer.getProperties()){
				ls.push(layer);
			}
		});
		
		return ls;
	}
	
	function cl(layers, ls){
		for(var i = 0; i < Math.min(ls.length, ls.length); i++){
			var layer = layers[i];
			var l = ls[i];
			if(Array.isArray(layer) && Array.isArray(l)){
				cl(layer, l);
			}else if(!Array.isArray(layer) && !Array.isArray(l)){
				layer.setVisible(l);
			}else{
				return;
			}
		}
	}
	
	setTimeout(function(){cl(layersArray(Config.map), data.layers);},800);
}

//layers
function readFeatures(json, buffor){
	var parser = new jsts.io.olParser();
	var format = new ol.format.GeoJSON();
	var features = format.readFeatures(json, {featureProjection: Config.sm});//'EPSG:3857'

	for (var i = 0; i < features.length; i++) {
		var feature = features[i];
		// convert the OpenLayers geometry to a JSTS geometry
		var jstsGeom = parser.read(feature.getGeometry());

		// create a buffer of 'buffor' meters around each line
		var buffered = jstsGeom.buffer(buffor);

		// convert back from JSTS and replace the geometry on the feature
		feature.setGeometry(parser.write(buffered));
	}
	
	return features;
}
function clearUnion(features){
	var parser = new jsts.io.olParser();
	
	var i = 0;
	while(i < features.length){
		var f1 = features[i];
		var f1g = parser.read(f1.getGeometry());
		
		var j = i+1;
		var tak = true;
		while(j < features.length){
			var f2 = features[j];
			var f2g = parser.read(f2.getGeometry());
			
			if (f1g.intersects(f2g)) {
				f1g = f1g.union(f2g);
				features.splice(j, 1);
				tak = false;
			}else{
				j++;
			}				
		}
		f1.setGeometry(parser.write(f1g));//unshift
		if(tak) i++;  				
	}
	return features;
}
function filter(features, keys, values){
	var fs = [];
	for (var i = 0; i < features.length; i++) {
		var feature = features[i];

		for (var j = 0; j < keys.length; j++) {
			var kv = "";
			if(keys[j] in feature.getProperties()){
				kv = feature.get(keys[j]);
			}else if('tags' in feature.getProperties() && keys[j] in feature.get("tags")){
				kv = feature.get("tags")[keys[j]];
			}
			if(kv === values[j]){
				fs.push(feature);
				break;
			}
		}		
	}
	return fs;
}

function refreshHighlightedCenter(center){
	if(center){
		var s = Config.STR_layer.getSource();
		s.forEachFeature(function(f){
			var geo = f.getGeometry();
			if(geo.getType() == 'Point' && (+f.getId() == Config.highlighted_description || +f.getId() == Config.highlighted_elevation)){
				CenterMap.apply(this, geo.getCoordinates())
				return;
			}
		});
	}
			
	Config.STR_layer.getSource().refresh();
}
function layerInfra(){
	var layer;
	var source;
	var format = new ol.format.OSMXML();
	var simpleZoom = 11;
	
	$(document).on('zoomend', function (event, old, neww) {
		if(old <= simpleZoom && neww >= simpleZoom + 1){
			source.clear();
		}
	});
	
	source = new ol.source.Vector({
        loader: function (extent, resolution, projection) {
            loadingData();
			//dispatch your custom event
			this.set('loadstart', Math.random());
			var zoom = Config.map.getView().getZoom();
			
			ol.extent.scaleFromCenter(extent, 1.5);
			var e2 = ol.proj.transformExtent(extent, Config.sm, Config.gg);
			
			source.clear()
			//console.log(source.getFeatures().length);
			
			
			var params = {
				bbox : e2.join(","),
			};
			if(zoom <= 11){
				params['simple'] = 'true';
			}
			params['type'] = 'base';
			
			
			$.get( 'visual_str?' + $.param(params), function( data ) {
				console.log('layerInfra done!');

				//source.clear();
				var features = format.readFeatures(data, {featureProjection: Config.sm});//projection, dataProjection: 
				source.addFeatures(features);
				console.log(source.getFeatures().length);
				closeLD();

				//dispatch your custom event
                source.set('loadend', Math.random());

				ga('send', 'event', 'map', 'network_str', params.bbox);				
			}).fail(function(){
				closeLD();
			});
        },
        strategy: ol.loadingstrategy.bbox//,
		//format: format
    });
	
	function styleFunction(feature, resolution) {
		var type = feature.getGeometry().getType();
		var zoom = Config.map.getView().getZoom();
		var routesData = layer.get('routesData');
		
		var rd_points = [];
		if(routesData){
			rd_points = $.map(routesData.points, function(v){
				return +v[0];
			});
		}
		
		if(type === "Point"){
			var name = feature.get("name");
			if(name && zoom >= 10){
				var scale = zoom >= 13 ? 1.5 : 1;
				
				if(routesData && $.inArray( +feature.getId(), rd_points) >= 0){
					var cs = [0, 255, 0];
					var ws = 0;
					if(rd_points[rd_points.length-1] == +feature.getId()){
						cs = [0, 128, 0];
					}else if(Config.highlighted_description == +feature.getId()){
						cs = [244, 67, 54];
						ws = 2;
					}else if(Config.highlighted_elevation == +feature.getId()){
						cs = [156, 39, 176];
						ws = 2;
					}				
					
					return [new ol.style.Style({
							image : new ol.style.Circle({
								radius : 10 * scale,
								fill : new ol.style.Fill({
									color : cs.concat([Config.transparency])
								}),
								stroke : new ol.style.Stroke({
									color : cs.concat([1]),
									width : 2 * scale + ws
								})
							}),
							text : new ol.style.Text({
								text : ""+parseInt(name),
								scale : 1 * scale,
								fill : new ol.style.Fill({
									color : [255, 255, 255, 1]
								}),
								stroke : new ol.style.Stroke({
									color : [0, 0, 0, Config.transparency],
									width : 3.5
								})
							}),
							zIndex : 1000
						})];
				}else{
					return [new ol.style.Style({
						image : new ol.style.Circle({
							radius : 10 * scale,
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
				}				
			}
		}else if(type === "LineString"){		
			if(routesData && $.inArray( feature.getId(), routesData.routes) >= 0){
				return [new ol.style.Style({
						fill : new ol.style.Fill({
							color : [0, 0, 0, 0]
						}),
						stroke : new ol.style.Stroke({
							color : [0, 255, 0, Config.transparency],
							width : Config.width_line,
							lineCap : 'round'
						}),
						zIndex : 999
					})];
			}else{		
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
		}else{
			return [new ol.style.Style({
				fill : new ol.style.Fill({
					color : [0, 0, 255, 1]
				}),
				stroke : new ol.style.Stroke({
					color : [0, 0, 0, 255.6],
					width : 5,
					lineCap : 'round'
				})
			})];
		}
	}

	layer = new ol.layer.Vector({
		//title : 'STR',
		source : source,
		style : styleFunction,
		visible : true
	});

	$('#download [data-type]').click(function(){
		var type = $(this).data('type');
		
		var x = layer.get('routesData');
		if(x){
			writeGPX(x, source, type, getValuesInputs('#download2 input'));
		}else{
			$( "#dialog_download" ).dialog();
		}
	});
	
	return layer;
}
function createOpis(data, source, cache){
	Config.highlighted_description = null;
	if(!data){
		$('#trasa').replaceWith($('<div/>',{
			id: 'trasa'
		}));
		$('#menu:not(.ol-touch)').trigger('open');
		return;
	}
	
	var ul = $('<ul/>',{
		class: 'list-group',
		id: 'trasa'
	});
	
	var suma = 0;
	var suma_posrednia = 0;
	var old_id = '';
	for(var i = 0; i < data.routes.length; i++){	
		var p = data.points[i];
		var r = data.routes[i];
		var d = data.distance[i];
		
		var p_id = p[0];
		var p_nr = p[1];
		
		
		suma_posrednia += d;
		if(p_nr){
			suma_posrednia = 0;
			old_id = p_id;
			ul.append(
				$('<li/>', {
					class: 'list-group-item',
					'data-id': old_id,
					text: parseInt(p_nr)
				}).append(
					$('<span/>',{
						class: 'badge',
						id: 'p' + old_id, 
						text: Math.round(suma / 1000 * 100) / 100 + ' km'
					})
				).append(
					$('<span/>',{
						class: 'display badge badge2',
						'data-id': old_id,
						text: ''
					})
				)
			);
			suma_posrednia = d;
		}else{
			ul.find('#p'+old_id).html(Math.round(suma_posrednia / 1000 * 100) / 100 + ' km');
		}
		suma += d;		
	}
	
	
	p_id = data.points[data.points.length-1][0];
	p_nr = data.points[data.points.length-1][1];
	ul.append(
		$('<li/>', {
			class: 'list-group-item list-group-item-info',
			'data-id': p_id, 
			text: parseInt(p_nr)
		}).append(
			$('<span/>',{
				class: 'badge',
				text: Math.round(suma / 1000 * 100) / 100 + ' km'
			})
		).append(
			$('<span/>',{
				class: 'display badge badge2',
				'data-id': p_id,
				text: ''
			})
		)
	);
	
	$('#trasa').replaceWith(ul);
	
	var lg = $('#trasa li.list-group-item');
	lg.click(function(m){
		m.stopPropagation();
		var t = $(this);
		Config.highlighted_description = t.data('id');
		
		lg.each(function(){
			$(this).removeClass('active');
		});
		$(this).addClass('active');
		
		refreshHighlightedCenter(true);
	});
		
	if(cache){
		$.each(data.points, function(k, dd){
			var el = ul.find('.display[data-id=' + dd[0] + ']');
			
			var last;
			var prefix = " ";
			$.each(dd[2], function(k, v){
				if(last != v){
					el.append(
						$('<span/>',{
							'data-leval' : k,
							html: '<small>' + prefix + v + '</small>'
						})
					);
					prefix = ", ";
				}else{
					return false;
				}
				last = v;
			});
		});
	}else{
		$.ajax({
			type: 'POST',
			url: 'geDisplayPoi',
			dataType: 'json',
			timeout: 60000,
			data: {
				'points' : $.map(data.points, function(v){
					return +v[0];
				})
			},
			success: function(data2) {
				$.each(data2, function(k, display){
					var el = ul.find('.display[data-id='+k+']');
					
					var last;
					var prefix = " ";
					$.each(display, function(k,v){
						if(last != v){
							el.append(
								$('<span/>',{
									'data-leval' : k,
									html: '<small>' + prefix + v + '</small>'
								})
							);
							prefix = ", ";
						}else{
							return false;
						}
						last = v;
					});
				});		
				$.each(data.points, function(k, v){
					v.push(data2[v[0]]);
				});
			},
			failure: function(msg) {
				//błąd
				console.log(msg);
			},
			error: function(msg) {
				//błąd
				console.log(msg);
			}
		});
	}
	
	if(data.points.length >= 0){
		var sp = $('#menu .panel:first').parent();
		$('#menuu:not(.ol-touch)').trigger('open');
		sp.animate({
			scrollTop: sp.scrollTop() + $("#trasa").offset().top + $("#trasa").outerHeight() - $('#trasa li').outerHeight()*6
		}, 1000);
	}
}
function layerInfra2(type){
	var layer;
	var source;
	var format = new ol.format.OSMXML();
	var simpleZoom = 11;
	
	$(document).on('zoomend', function (event, old, neww) {
		if(old <= simpleZoom && neww >= simpleZoom + 1){
			source.clear();
		}
	});
	
	source = new ol.source.Vector({
        loader: function (extent, resolution, projection) {
			//dispatch your custom event
			this.set('loadstart', Math.random());
			var zoom = Config.map.getView().getZoom();
			
			ol.extent.scaleFromCenter(extent, 1.5);
			var e2 = ol.proj.transformExtent(extent, Config.sm, Config.gg);
			
			source.clear()
			//console.log(source.getFeatures().length);
			
			
			var params = {
				bbox : e2.join(","),
			};
			if(zoom <= 11){
				return;
				//params['simple'] = 'true';
			}
			params['type'] = type;
			
			
			$.get( 'visual_str?' + $.param(params), function( data ) {
				console.log('layerInfra '+type+' done!');

				//source.clear();
				var features = format.readFeatures(data, {featureProjection: Config.sm});//projection, dataProjection: 
				source.addFeatures(features);
				console.log(source.getFeatures().length);

				//dispatch your custom event
                source.set('loadend', Math.random());

				ga('send', 'event', 'map', 'network_'+type, params.bbox);				
			}).fail(function(){
			});
        },
        strategy: ol.loadingstrategy.bbox//,
		//format: format
    });
	
	function styleFunction(feature, resolution) {
		var type2 = feature.getGeometry().getType();
		var zoom = Config.map.getView().getZoom();
		
		var color;
		color_t = Config.transparency;//*3/4;
		if(type == "green"){
			color = [76, 175, 80, color_t];
		}else if(type == "paving"){
			color = [255, 152, 0, color_t];
		}else if(type == "semifixed"){
			color = [8, 188, 212, color_t];
		}
		
		if(type2 === "LineString"){		
			return [new ol.style.Style({
					fill : new ol.style.Fill({
						color : [0, 0, 0, 0]
					}),
					stroke : new ol.style.Stroke({
						color : [0, 0, 0, Config.transparency/2],
						width : Config.width_line * 3,
						lineCap : 'round'
					}),
					zIndex : 110
				}),
				new ol.style.Style({
					fill : new ol.style.Fill({
						color : [0, 0, 0, 0]
					}),
					stroke : new ol.style.Stroke({
						color : color,
						width : Config.width_line * 3 - 2,
						lineCap : 'round'
					}),
					zIndex : 110
				})];
		}else{
			return [new ol.style.Style({
				fill : new ol.style.Fill({
					color : [0, 0, 255, 1]
				}),
				stroke : new ol.style.Stroke({
					color : [0, 0, 0, 255.6],
					width : 5,
					lineCap : 'round'
				})
			})];
		}
	}

	var name = '';
	switch(type){
		case 'green' : name = 'zielone'; break;
		case 'paving' : name = 'brukowe'; break;
		case 'semifixed' : name = 'półtwarde'; break;
	}
	
	layer = new ol.layer.Vector({
		title : 'drogi ' + name,
		source : source,
		style : styleFunction,
		visible : true
	});
	
	return layer;
}


function toJSONLocal (date) {
    var local = new Date(date);
    local.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return local.toJSON().slice(0, 16).replace(/:/g,'-').replace(/-/g,'').replace(/T/g,'-');
}
function writeGPX(data, source, type, opt_options){
	var length_points = function (value){
		var sum = 0;
		var m = [];
		if(value instanceof ol.geom.MultiLineString){
			var m = $.map(value.getLineStrings(), function (v) {
				return v.getCoordinates().length;
			});
			$.each(m, function (v) {
				sum += v;
			});
		}else if(value instanceof ol.geom.LineString){
			sum = value.getCoordinates().length;
		}
		return sum;
	}
	var simplifi = function(value, pts){
		var st = 0.1;
		
		if(!pts){
			return value;
		}
		
		var p = pts+1;
		var lp;
		var t;
		var c = 5;
		while(p > pts){
			t = value.simplify(st);
			p = length_points(t);
			st *= 1.1;
			if(lp == p){
				c--;
			}
			lp = p;
			if(c <= 0 ){
				break;
			}
		}
		return t;
	}
	
	var simplificar = opt_options[0];
	var max_points = opt_options[1];
	if(max_points < 2){
		max_points = 2;
	}
	
	var types = type.split("_");	
	var name_trasa = $.map([data.points[0], data.points[data.points.length-1]], function(v){
		return +v[1];
	}).join("-");
	
	
	var suma = 0;
	for(var i = 0; i < data.routes.length; i++){	
		suma += data.distance[i];	
	}
	name_trasa += "_"+(Math.round(suma / 1000 * 100) / 100 + 'km')+"_"+toJSONLocal(new Date());
	
	function createFile(features){
		var format = new ol.format.GPX();
		
		var features_points = $.map(features, function(feature, key){
			var type = feature.getGeometry().getType();
			if(type == 'Point')return feature;
		});
		var features_lines = $.map(features, function(feature, key){
			var type = feature.getGeometry().getType();
			if(type == 'LineString')return feature;
		});

		/*var fs = features_points[0].getGeometry().getFirstCoordinate();		
		$.each(features_lines, function(key,feature){
			if(feature.getGeometry().getFirstCoordinate().equals(fs)){
				fs = feature.getGeometry().getLastCoordinate();
			}else{
				feature.getGeometry().setCoordinates(feature.getGeometry().getCoordinates().reverse());
				
				fs = feature.getGeometry().getLastCoordinate();
			}
		});*/
		
		if($.inArray('track', types) > -1){
			var coordinates = $.map(features_lines, function(feature, key){
				return [feature.getGeometry().getCoordinates()];	
			});
			
			if(simplificar){
				var temp = new ol.geom.MultiLineString(coordinates).getLineString();
				temp = simplifi(temp, max_points);
				coordinates = [temp.getCoordinates()];
			}
			
			var result_feature = new ol.Feature({
				name: "Trasa " + name_trasa + ", track",
				geometry: new ol.geom.MultiLineString(coordinates)
			});
			
			var fs = [result_feature];
			if($.inArray('poi', types) > -1){
				fs = features_points.concat(fs);
			}
			
			var result = format.writeFeatures(fs, {
				featureProjection: Config.map.getView().getProjection()
			});

			var blob = new Blob([result], {type: "application/gpx+xml;charset=utf-8"});
			saveAs(blob, "STR_track_"+name_trasa+".gpx");
		}else if($.inArray('route', types) > -1){
			var coordinates = $.map(features_lines, function(feature, key){
				var c = feature.getGeometry().getCoordinates();
				if(c.length > 1){
					c = c.slice(0, -1);
					if(c.length > 1){
						return c;
					}else{
						return [c];
					}
				}

				return [];		
			});
			coordinates.push(features_points.slice(-1)[0].getGeometry().getFirstCoordinate());	
			
			if(simplificar){
				var temp = new ol.geom.LineString(coordinates);
				temp = simplifi(temp, max_points);
				coordinates = temp.getCoordinates();
			}
			
			//route
			var result_feature = new ol.Feature({
				name: "Trasa "+name_trasa + ", route",
				geometry: new ol.geom.LineString(coordinates)
			});
			
			var fs = [result_feature];
			if($.inArray('poi', types) > -1){
				fs = features_points.concat(fs);
			}
			
			var result = format.writeFeatures(fs, {
				featureProjection: Config.map.getView().getProjection()
			});
			
			//https://github.com/eligrey/FileSaver.js
			var blob = new Blob([result], {type: "application/gpx+xml;charset=utf-8"});
			saveAs(blob, "STR_route_"+name_trasa+".gpx");
		}	
	}
	
	ga('send', 'event', 'GPX', type, name_trasa);
	
	$.ajax({
		type: 'POST',
		url: 'create_gpx',
		dataType: 'json',
		timeout: 60000,
		data: {
			routes : data.routes,
			point_start : data.points[0][0],
			point_end : data.points[data.points.length-1][0],
			pois : $.inArray('poi', types) > -1
		},
		success: function(data) {
			var features = new ol.format.GeoJSON().readFeatures(data, { featureProjection: Config.sm })
			createFile(features);

		},
		failure: function(msg) {
			console.log(msg);
		}
	});
}

//dialog info
function loadingData() {
	$("#dialog-message").dialog({
		closeOnEscape : false,
		modal : true,
		minHeight : "auto",
		open : function (event, ui) {
			$(".ui-dialog-titlebar-close", ui.dialog | ui).hide();
		}
	});
}
function closeLD() {
	$("#dialog-message").dialog("close");
}

//google analytics
function listenerLayers(layerGroup, type, fun) {
	var layers = layerGroup.getLayers().getArray();
	layers.forEach(function (layer, index, array) {
		layer.on(type, function (event) {
			if (event.target.getVisible() && !event.oldValue) {
				fun(event.key, event.target);
			}
		});
	});
};
function listenersGA() {
	var ls = Config.map.getLayers().getArray();
	var layersBase = ls[0];
	var layersOverlay = ls[1];

	function eventSend(name, type) {
		ga('send', 'event', 'map', type, name);
	}

	listenerLayers(ls[0], 'change:visible', function (key, target) {
		eventSend('changebaselayer', target.get('title'));
	});
	listenerLayers(ls[1], 'change:visible', function (key, target) {
		eventSend('changelayer', target.get('title') + ":" + key);
	});
}

//side menu 
$(document).ready(function(){
	$('#menu').BootSideMenu({side:"left", autoClose: false});
	$('#menu').addClass((ol.has.TOUCH ? ' ol-touch' : ''));
	$('[data-toggle="tooltip"]').tooltip(); 
    //$('#header .title').html(document.title);
	
	$('#search_location').click(function(){
		$('#menu').trigger('close');
		var t = $('.ol-geocoder .ol-control');
		t.highlightOverlay({
			onStartCallback : function(){
				t.find('button').addClass('highlight-element');
			},
			onDismissCallback : function(){
				t.find('button').removeClass('highlight-element');
			}
		});
		ga('send', 'event', 'func', 'search', 'highlight');
	});
	
	$(document).on('change', ':file', function() {
		var input = $(this),
			numFiles = input.get(0).files ? input.get(0).files.length : 1,
			label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
		input.trigger('fileselect', [numFiles, label]);
	});
});