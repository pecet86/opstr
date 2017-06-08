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

function createElevationProfile(data, el) {
	if(data.routes.length == 0){
		return;
	}
	$.ajax({
		type : 'POST',
		url : 'create_ele_profile',
		dataType : 'json',
		timeout : 60000,
		data : {
			routes : data.routes,
			point_start : data.points[0][0],
			point_end : data.points[data.points.length - 1][0],
			points : $.map(data.points, function(v){
				return +v[0];
			})
		},
		success : function (result) {
			updateMeasure(result);

			createElevationGraph(result, el);
		},
		failure : function (msg) {
			console.log(msg);
		}
	});
}

function createElevationGraph(data, el) {
	$el = $(el);
	
	var dx = 6;
	var dy = 5;
	
	var margin = {
		top : 60,
		right : 50,
		bottom : 30,
		left : 50
	},
		width = $el.parents('.panel:first').width()*2 - margin.left - margin.right,
		height = 300 - margin.top - margin.bottom;

	var x = d3.scale.linear()
		.range([0, width]);

	var y = d3.scale.linear()
		.range([height, 0]);

	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom")
		.ticks(dx)
		.tickFormat(function(v){
			return d3.format("s")(v)+'m';
		});

	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left")
		.ticks(dy)
		.tickFormat(function(v){
			return d3.format("s")(v)+'m';
		});

	var area = d3.svg.area()
		.x(function (d) {
			return x(d.dist);
		})
		.y0(height)
		.y1(function (d) {
			return y(d.ele);
		});

	var svg = d3.select($el[0]).append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


	x.domain(d3.extent(data, function (d) {
		return d.dist;
	}));
	y.domain(d3.extent(data, function (d) {
		return d.ele;
	}));

	function getNode(d){
		var n = false;
		$.each(d, function(k,v){
			if(v.name){
				n = v;
				return false;
			}
		})
		return n;
	}
	
	var bisectDist = d3.bisector(function(d) { return d.dist; }).left;
	var dataPOI = data.filter(function(d){ return !!d.name; });
	var l = data.length;
	var ls = Math.round(l * 0.1);
	if(ls > 2){
		ls = 2;
	}
	function isp(i){
		if(i < 0) return 0;
		if(i >= l) return l-1;
		return i;
	}
	function ex(i){
		if(data[i].name){
			var id = (+data[i].id);

			if(id != Config.highlighted_elevation){
				Config.highlighted_elevation = id;
				
				refreshHighlightedCenter();
				
			}
			
			return true;
		}
		return false;
	}
	svg.append("path")
		.datum(data)
		.attr("class", "area")
		.attr("d", area)
		.on("mousemove", function mousemove() {
			var x0 = x.invert(d3.mouse(this)[0]);
			var i = bisectDist(data, x0, 1);
			var d0 = data[i - 1],
				d1 = data[i];			
			i = x0 - d0.dist > d1.dist - x0 ? i : i-1;
			
			if(ex(i)){
				return;
			}
			
			for(var dx = ls; dx >= 0; dx--){
				if(ex(isp(i-dx))){
					return;
				}else if(ex(isp(i+dx))){
					return;
				}
			}
			
			Config.highlighted_elevation = null;
			refreshHighlightedCenter();
		})
		.on("mouseout", function mousemove(d, i) {
			if(!Config.highlighted_elevation) return;
			Config.highlighted_elevation = null;
			refreshHighlightedCenter();
		});

	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);

	svg.append("g")
		.attr("class", "y axis")
		.call(yAxis)
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("Wysokość");

	var pois = $.grep( data, function( d, i ) {
		return d.name;
	});
	var dxp = Math.max(1, Math.floor(pois.length / dx));

	for (i = dxp; i < pois.length; i+=dxp) { 
		var d = pois[i];
		
		var poi = svg.append("g")
			.attr("class", "poi");

		poi.append("text")
			.attr("x", 9)
			.attr("dy", ".35em")
			.attr("transform", "rotate(-60)");
		poi.attr("transform", "translate(" + x(d.dist) + "," + (y(d.ele) - 20) + ")");
		poi.select("text").text([d.name, (+d.ele).toFixed(2) + 'm'].join(' - '));

		// FIXME use only one group
		var poiLine = svg.append("g");
		poiLine.append("svg:line")
			.attr("class", "poi")
			.attr("x1", x(d.dist))
			.attr("y1", y(0))
			.attr("x2", x(d.dist))
			.attr("y2", y(d.ele));

		poiLine.append("svg:line")
			.attr("class", "poi2")
			.attr("x1", x(d.dist))
			.attr("y1", y(d.ele))
			.attr("x2", x(d.dist))
			.attr("y2", y(d.ele) - 20);
	}
}

/*
data = [{
	id : '', //id z bazy
	name : '', //numer jeżeli WĘZEŁ
	ele : , //wysokość nad poziom morza
	gps : []
}]
 */
function updateMeasure(data) {
	var last_feature;
	var dist = 0;
	$.each(data, function (k, v) {
		if (last_feature) {
			dist += lengthPoints([last_feature.gps, v.gps]);
			v.dist = dist;
		} else {
			v.dist = 0;			
		}
		last_feature = v;
	});
}

function lengthPoints(coord) {
	return Config.wgs84Sphere.haversineDistance(coord[0], coord[1]);
};

/*$( "body" ).on( "init", function() {
	
});*/
$(function(){
	var checkExist = setInterval(function() {
		if (Config.STR_layer) {
			Config.STR_layer.on('change:routesData',function(e){
				var rd = Config.STR_layer.get('routesData');
				if(rd){
					createElevationProfile(rd, $('#ele_profile').empty());
				}else{
					$('#ele_profile').empty()
				}
			});
			
			
			clearInterval(checkExist);
		}
	}, 100);
});