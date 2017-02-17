<?php
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
?>

<!DOCTYPE html>
<html>
	<head>		
		<title>Polska Sieć Tras Rowerowych</title>
		<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
		
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" type="text/css"/><!--integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous"-->
		<link rel="stylesheet" href="http://code.jquery.com/ui/1.11.4/themes/smoothness/jquery-ui.css" type="text/css"/>
		<link rel="stylesheet" href="css/ol.min.css" type="text/css"/>

		
		<script src="http://code.jquery.com/jquery-1.11.2.min.js"></script>
		<script src="http://code.jquery.com/ui/1.11.4/jquery-ui.js"></script>		
		<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script><!--
			integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"-->
		
		<script src="js/jspdf.min.js"></script>		
		<script src="js/ol.min.js"></script>		
		<script src="http://d3js.org/d3.v3.min.js"></script>
				
		<link rel="stylesheet" href="route_map.min.css" type="text/css"/>
		<script src="route_map.min.js"></script>
		
		<script src="lib/google_analytics.js"></script>
		<!--<script>function ga(){};</script>-->
	</head>
	<body onload='init()'>
		<div class="container-fluid">
			<div class="row">
				<h1 style="text-align: center;">Wygenerowana trasa</h1>
			</div>
			<div class="row">
				<div class="col-xs-2 col-sm-2 col-md-1">
					<table id="route">
						<tr>
							<td class="rte">3</td>
							<td class="km">0.0<br/>0.0</td>
						</tr>
					</table>
				</div>
				<div class="col-xs-10 col-sm-10 col-md-11">
					<div class="row" id="opis">
						<button id="print" class="btn btn-default" type="button">Drukuj listwę skrzyżowań</button>
						<p>Listwa skrzyżowań wraz z paskiem taśmy bezbarwnej. Wklej na górnej rurze roweru. To proste, wodoodporne i utrzymuje swoje doskonałe właściwości aerodynamiczne!</p>

						<div>
							<div class="checkbox">
								<label>
									<input id="add_distance" type="checkbox"/> Pokaż przebieg między skrzyżowaniami
								</label>
							</div>
							<div class="checkbox">
								<label>
									<input id="add_distance_total" type="checkbox" checked /> Pokaż całkowity przebieg
								</label>
							</div>
							<div class="checkbox">
								<label>
									<input id="add_map" type="checkbox" checked /> Dodaj mapę
								</label>
							</div>
						</div>
					</div>
					<div class="row">
						<div id="map" class="map fill"></div>
					</div>
				</div>
			</div>
		</div>
	</body>
</html>