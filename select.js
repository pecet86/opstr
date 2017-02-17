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

ol.interaction.SelectCustom = function (opt_options) {

	ol.interaction.Pointer.call(this, {
		handleEvent : ol.interaction.SelectCustom.prototype.handleEvent
	});

	var options = opt_options ? opt_options : {};

	this.condition_ = options.condition ? options.condition : ol.events.condition.singleClick;
	this.addCondition_ = options.addCondition ? options.addCondition : ol.events.condition.never;
	this.removeCondition_ = options.removeCondition ? options.removeCondition : ol.events.condition.never;
	this.filter_ = options.filter ? options.filter : function () {return true;};
	
	if (options.layers) {
		this.layers_ = options.layers;
		this.layerFilter_ = function (layer) {
			return options.layers.indexOf(layer) >= 0;
		};
	} else {
		this.layers_ = [];
		this.layerFilter_ = ol.functions.TRUE;
	}
	
	this.callback_ = options.callback ? options.callback : function() {};
	
	this.features_ = [];

};
ol.inherits(ol.interaction.SelectCustom, ol.interaction.Pointer);
ol.interaction.SelectCustom.prototype.handleEvent = function (mapBrowserEvent) {
	if (!this.condition_(mapBrowserEvent)) {
		return true;
	}
	var add = this.addCondition_(mapBrowserEvent);
	var remove = this.removeCondition_(mapBrowserEvent);
	var map = mapBrowserEvent.map;
	var features = this.features_;
	
	var feature_first = features[0];
	var feature_last = features[features.length-1];
	var length = this.features_.length;

	var change = false;
	map.forEachFeatureAtPixel(mapBrowserEvent.pixel,
		function (feature, layer) {
		if (this.filter_(feature, layer)) {
			if(add){
				if(length == 0){
					var f = feature.clone();
					f.setId(feature.getId())
					this.features_.push(f);
					change = true;
				}else if(feature_last.getId() == feature.getId()){
					//dodawaj ale tylko raz po sobie
				}else{
					var f = feature.clone();
					f.setId(feature.getId())
					this.features_.push(f);
					change = true;
				}
			}else if(remove){
				if(length == 0){
					//ignore
				}else if(feature_last.getId() == feature.getId()){
					this.features_.pop();
					change = true;
				}else{
					//usuwaj tylko ostatni
				}
			}
			return true;
		}
	}, this, this.layerFilter_);
	
	
	if (change) {
		this.callback_(this.features_.slice(0));
	}
	
	return ol.events.condition.pointerMove(mapBrowserEvent);	
};
ol.interaction.SelectCustom.prototype.reset = function(){
	if(this.features_.length > 0){
		this.features_ = [];
		this.callback_([]);
	}
}
ol.interaction.SelectCustom.prototype.remove_last = function(){
	if(this.features_.length > 0){
		this.features_.pop();
		this.callback_(this.features_.slice(0));
	}
}

function createSelection(){
	var select_options = {
		layers: [Config.STR_layer],
		condition: ol.events.condition.singleClick,
		addCondition: function(evt){
			return ol.events.condition.singleClick(evt) && ol.events.condition.noModifierKeys(evt);
		},//ol.events.condition.shiftKeyOnly,
		removeCondition: ol.events.condition.platformModifierKeyOnly,
		filter: function(feature, layer){
			var type = feature.getGeometry().getType();
			return (type === "Point")? true : false;
		},
		callback : function(features){
			/*if(features.length > 0){
				var sp = $('#menu .panel:first').parent();
				$('#menu').trigger('open');
				sp.animate({
					scrollTop: sp.scrollTop() + $("#trasa").offset().top + $("#trasa").height()
				}, 1000);
			}*/
			
			$('#reset, #remove_last, #brochure_direction, #print_direction, #download button, #save_session').attr("disabled", "disabled");
			if(features.length == 0){
				Config.STR_layer.set('routesData', false);
				createOpis(false);
				Config.STR_layer.getSource().refresh();
				return;
			}else if(features.length < 2){
				Config.STR_layer.set('routesData', {
					points : [[features[0].getId()]],
					routes : []
				});
				createOpis(false);
				Config.STR_layer.getSource().refresh();
				return;
			}
			$('#reset, #remove_last, #brochure_direction, #print_direction, #download button, #save_session').attr("disabled", null);			
			
			var projection = Config.map.getView().getProjection();
			var metersPerUnit = projection.getMetersPerUnit();
			var pointResolution = projection.getPointResolution(
				Config.map.getView().getResolution(), 
				Config.map.getView().getCenter()
			) * metersPerUnit;
				
			var extent = Config.map.getView().calculateExtent(Config.map.getSize());
			$.each(features, function(key, feature){	
				var e2 = ol.geom.Polygon.circular(Config.wgs84Sphere, 
					ol.proj.transform(feature.getGeometry().getCoordinates(), Config.sm, Config.gg),
					5000, 64).transform(Config.gg, Config.sm).getExtent();
				extent = ol.extent.extend(extent, e2);
			});
			ol.extent.scaleFromCenter(extent, 2);
			
			var data = {
				points : $.map(features, function(value, key){
					return value.getId();
				}),
				bbox : ol.proj.transformExtent(extent, Config.sm, Config.gg)
			};
			
			$.ajax({
				type: 'POST',
				url: 'routes',
				dataType: 'json',
				timeout: 60000,
				data: data,
				success: function(data) {
					var source = Config.STR_layer.getSource();
					
					Config.STR_layer.set('routesData', data);
					createOpis(data, source);
					Config.STR_layer.getSource().refresh();
					
					ga('send', 'event', 'map', 'select', JSON.stringify(data.points));	
				},
				failure: function(msg) {
					Config.STR_layer.set('routesData', false);
					createOpis(false);
					Config.STR_layer.getSource().refresh();
					
					Config.select.remove_last();
					
					//błąd
					console.log(msg);
				},
				error: function(msg) {
					Config.STR_layer.set('routesData', false);
					createOpis(false);
					Config.STR_layer.getSource().refresh();
					
					Config.select.remove_last();
					
					//błąd
					console.log(msg);
				}
			});
		}
	};
	Config.select = new ol.interaction.SelectCustom(select_options);
	Config.map.addInteraction(Config.select);
	
	$('#reset, #remove_last, #brochure_direction, #print_direction, #save_session').attr("disabled", "disabled");
	
	$('#reset').click(function(){
		if (confirm("Zresetować?") == true) {
			Config.select.reset();
			ga('send', 'event', 'func', 'select', 'reset_all');
		}		
	});
	$('#remove_last').click(function(){
		Config.select.remove_last();
		ga('send', 'event', 'func', 'select', 'reset_last');
	});

	$('#brochure_direction').click(function(){
		brochure_direction(Config.STR_layer.get('routesData'));
		ga('send', 'event', 'func', 'brochure_direction');
	});
	$('#print_direction').click(function(){
		var data = Config.STR_layer.get('routesData');
		if(!data || data.points.length < 2){
			return;
		}
		
		$('#menu').trigger('close');
		
		iframe = $('#print_modal iframe')[0];	
		iframe.onload = function() {
			var w2 = iframe.contentWindow;
			w2.loadData(data);
			autoResize(iframe);
			
			setTimeout(function(){
				autoResize(iframe);
			}, 500);
		};
		iframe.src = "route_map";
		$( "#print_modal" ).modal();
		ga('send', 'event', 'func', 'print', 'model');		
	});
	
	
	$('#save_session').click(function(){
		save_session(Config.STR_layer.get('routesData'));
		ga('send', 'event', 'func', 'session', 'save');
	});
	$('#load_session :file').on('fileselect', function(event, numFiles, label) {
		var file = $(this).get(0).files[0];
		if (file) {
			var reader = new FileReader();
			reader.readAsText(file, "UTF-8");
			reader.onload = function (evt) {
				load_session(JSON.parse(evt.target.result));
				ga('send', 'event', 'func', 'session', 'load');
			};
			reader.onerror = function (evt) {
				console.log("error reading file");
			};
		}
	});
}

function autoResize(f) {
	function getDocHeight(D) {
		return Math.max(
			Math.max(D.body.scrollHeight, D.documentElement.scrollHeight),
			Math.max(D.body.offsetHeight, D.documentElement.offsetHeight),
			Math.max(D.body.clientHeight, D.documentElement.clientHeight)
		);
	}
	
    try {
		var doc = 'contentDocument' in f ? f.contentDocument : f.contentWindow.document;
		
        var newheight = 0;
        f.removeAttribute("height");
		newheight = getDocHeight(doc) + 30;
        f.height = (newheight) + "px";
		$('#print_modal .modal-body').css('height', newheight + 42);
    } catch (err) {
    }
}

//broszurka
function brochure_direction(data) {
	if(!data) return;
	
	var dims = {
		a0: [1189, 841],
		a1: [841, 594],
		a2: [594, 420],
		a3: [420, 297],
		a4: [297, 210],
		a5: [210, 148]
	};
	
	var format = 'a4';
	var resolution = 72;
	var dim = dims[format];
	var w = 361;
	var h = 241;
	
	var l = data.points.length;
	if(l < 2){
		return;
	}
	
	var l1 = l - 14; // koniec	
	var p = 0;
	var k = 1;
	if(l1 > 0){
		p = Math.floor(l1 / 16);
		if(l1 % 16 > 0){
			p++;
		}
	}

	var pdf = new jsPDF('portrait', 'pt', format);
	var page = 0;
	function c(start, distance, x, y){
		page++;
		if(page > 3){
			pdf.addPage();
			x = 20;
			y = 20;
			page = 0;
		}
		if(p > 0){
			p--;
			updateSVG(data, start, start + 16, "początek", distance, x, y, pdf, function(distance2, x2, y2){
				c(start + 16, distance2, x2, y2 + h);			
			});
		}else{
			updateSVG(data, start, -1, "koniec", distance, x, y, pdf, function(distance2, x2, y2){
				pdf.save('Broszurka - PSTR.pdf');
			});
		}		
	}
	c(0, 0, 20, 20);
}  
function updateSVG(data, start, end, type, distance, x, y, pdf, callback){
	if(type == "początek"){
		loadSVG('broszurka/broszurka_'+type+'.svg', function(svg_text){
			var svg = d3.select(svg_text);
			
			for(var i = 1; i <= 16; i++){
				svg.select('#pkt_'+i+' tspan').text("");
				svg.select('#md_'+i+' tspan').text("");
				svg.select('#td_'+i+' tspan').text("");
			}
					
			var ii = 1;
			for(var i = start; i < end && i < data.points.length-1; i++){
				svg.select('#pkt_'+ii+' tspan').text(data.points[i][1]);
				
				var d = parseFloat(data.distance[i]) / 1000;
				svg.select('#md_'+ii+' tspan').text(d < 100 ? d.toFixed(1) : d.toFixed(0));
								
				svg.select('#td_'+ii+' tspan').text(distance < 100 ? distance.toFixed(1) : distance.toFixed(0));
				distance += d;
				ii++;
			}
			if(start+ii == data.points.length){ 
				svg.select('#pkt_'+ii+' tspan').text(data.points[data.points.length-1][1]);
			}
			
			drawInlineSVG(svg, function(image, width, height){
				pdf.addImage(image, 'PNG', x, y, width, height);
				
				callback(distance, x, y);
			})
		});
	}else if(type == "koniec"){
		loadSVG('broszurka/broszurka_'+type+'.svg', function(svg_text){
			var svg = d3.select(svg_text);
			
			for(var i = 1; i <= 13; i++){
				svg.select('#pkt_'+i+' tspan').text("");
				svg.select('#md_'+i+' tspan').text("");
				svg.select('#td_'+i+' tspan').text("");
			}
			svg.select('#pkt_14 tspan').text("");
			
			var ii = 1;
			for(var i = start; i < data.points.length-1; i++){
				svg.select('#pkt_'+ii+' tspan').text(data.points[i][1]);
								
				if(ii < 14){
					var d = parseFloat(data.distance[i]) / 1000;
					svg.select('#md_'+ii+' tspan').text(d < 100 ? d.toFixed(1) : d.toFixed(0));
									
					svg.select('#td_'+ii+' tspan').text(distance < 100 ? distance.toFixed(1) : distance.toFixed(0));
					distance += d;
				}
				
				ii++;
			}
			if(start+ii == data.points.length){
				svg.select('#pkt_'+ii+' tspan').text(data.points[data.points.length-1][1]);
			}
			
			svg.select('#td tspan').text(distance.toFixed(1) + " km");
			
			drawInlineSVG(svg, function(image, width, height){
				pdf.addImage(image, 'JPEG', x, y, width, height);//'PNG'
				
				callback(distance, x, y);
			})
		});
	}
}
function loadSVG(url, callback){
	d3.xml(url).mimeType("image/svg+xml").get(function(error, xml) {
		if (error) return;
		callback(xml.documentElement);
	});
}
function drawInlineSVG(svg_element, callback) {
	var doctype = '<?xml version="1.0" standalone="no"?>'
	  + '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

	var source = (new XMLSerializer()).serializeToString(svg_element.node());
	var blob = new Blob([ doctype + source], { type: 'image/svg+xml;charset=utf-8' });
	var url = window.URL.createObjectURL(blob);
	
	var canvas = document.createElement("canvas");
	var ctx = canvas.getContext('2d');

	image = new Image();
    image.onload = function () {
        canvas.width = image.width;
		canvas.height = image.height;		
		ctx.drawImage(image, 0, 0, image.width, image.height);  
        
		var dataUrl = canvas.toDataURL('image/jpeg');//png
		callback(dataUrl, image.width, image.height);
    };
    image.src = url;
}

//session
function save_session(data){
	var json = JSON.stringify(data);
	var blob = new Blob([json], {type: "application/json"});
	var url  = URL.createObjectURL(blob);

	var a = document.createElement('a');
	a.download    = "pstr_session.json";
	a.href        = url;
	//a.click();
	
	var clickEvent = new MouseEvent("click", {
		"view": window,
		"bubbles": true,
		"cancelable": false
	});
	a.dispatchEvent(clickEvent);
}
function load_session(file){
	var source = Config.STR_layer.getSource();
					
	Config.STR_layer.set('routesData', file);
	createOpis(file, source, true);
	Config.STR_layer.getSource().refresh();
}