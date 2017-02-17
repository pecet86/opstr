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

include ('geDisplay.php');

?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" itemscope itemtype="http://schema.org/Article">
	<head prefix="og: http://ogp.me/ns# fb: http://ogp.me/ns/fb# object: http://ogp.me/ns/activity# article: http://ogp.me/ns/article#">
		
		<title>Polska Sieć Tras Rowerowych</title>
		<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
		
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" type="text/css"/>
		<link rel="stylesheet" href="http://code.jquery.com/ui/1.11.4/themes/smoothness/jquery-ui.css" type="text/css"/>
		<link rel="stylesheet" href="css/ol.min.css" type="text/css"/>
		<link rel="stylesheet" href="css/ol3-layerswitcher.min.css" type="text/css"/>
		<link rel="stylesheet" href="css/ol3-popup.min.css" type="text/css"/>		
		<link rel="stylesheet" href="css/BootSideMenu.min.css" type="text/css"/>
		
		<script src="http://code.jquery.com/jquery-1.11.2.min.js"></script>
		<script src="js/jquery.highlight.js"></script>
		<script src="http://code.jquery.com/ui/1.11.4/jquery-ui.js"></script>		
		<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" ></script>
		
		<script src="js/jspdf.min.js"></script>	
		<script src="js/jspdf.plugin.addimage.js"></script>		
		<script src="js/FileSaver.min.js"></script>
		
		<script src="js/ol.min.js"></script>
		<script src="js/ol3-layerswitcher.min.js"></script>
		<script src="js/ol3-popup.min.js"></script>		
		<script src="js/BootSideMenu.min.js"></script>
		
		<script src="http://d3js.org/d3.v3.min.js"></script>
		
		<!-- [START] GeoCoder -->
		<link href="//cdn.jsdelivr.net/openlayers.geocoder/latest/ol3-geocoder.min.css" rel="stylesheet">
		<script src="//cdn.jsdelivr.net/openlayers.geocoder/latest/ol3-geocoder.js"></script>
		<!-- [END] GeoCoder -->
		
		<link rel="stylesheet" href="main.css" type="text/css"/>
		<script src="select.js"></script>
		<script src="main.js"></script>
		
		<!-- [START] Elevation Profile -->
		<link rel="stylesheet" href="ele_profile.css" type="text/css"/>
		<script src="ele_profile.js"></script>
		<!-- [END] Elevation Profile -->
		
		<script>function ga(){};</script>
	</head>
	<body onload='init()'>
		<div id="dialog-message" title="Ładowanie danych" style="display: none;">
			<p style="margin: 0px;"><span class="ui-icon ui-icon-info" style="float:left; margin:0 7px 10px 0;"></span>Pobieranie i ładowanie danych. Proszę chwilę poczekać.</p>
		</div>
		<div id="header">
			<a href="http://pstr.mirl.info.pl" data-outbound="true" rel="nofollow">
				<img src="/PSTR_logo.png" style="height: 32px;float: left;">
			</a>
			<div class="text">
				<span class="title">Polska Sieć Tras Rowerowych</span>
			</div>		
		</div>
		<div id="menu">
			<div class="panel panel-primary">			
				<div class="panel-heading">
					<h3 class="panel-title">Informacje</h3>
				</div>
				<div class="panel-body">
					<div class="panel panel-info">
						<div class="panel-heading" data-toggle="collapse" href="#collapse1">
							<h3 class="panel-title">Informacje ogólne</h3> 
						</div>
						<div id="collapse1" class="panel-collapse collapse">
							<div class="panel-body" >
								<div id="informacje_ogolne">
									<p>Sieć zawiera <?php echo getCountNodes();?> węzłów nawigacyjnych.</p>
									<p>Łączna długość dróg w sieci to <?php echo geDistanceSum();?> km.</p>
								</div>							
							</div>
						</div>						
					</div>
					<div class="panel panel-info">
						<div class="panel-heading" data-toggle="collapse" href="#collapse2">
							<h3 class="panel-title">Legenda</h3> 
						</div>
						<div id="collapse2" class="panel-collapse collapse">
							<div class="panel-body" >
								<!--<div class="media">
									<div class="media-left media-middle">
										<a href="#">
											<span class="media-object" style="width: 24px; height: 24px; background-color: red;"></span>
										</a>
									</div>
									<div class="media-body">
										<h4 class="media-heading">węzły</h4>
									</div>
								</div>
								<div class="media">
									<div class="media-left media-middle">
										<a href="#">
											<span class="media-object" style="width: 24px; height: 24px; background-color: blue;"></span>
										</a>
									</div>
									<div class="media-body">
										<h4 class="media-heading">drogi twarde</h4>
									</div>
								</div>-->
								<div class="media">
									<div class="media-left media-middle">
										<a href="#">
											<span class="media-object" style="width: 24px; height: 24px; background-color: rgb(76, 175, 80);"></span>
										</a>
									</div>
									<div class="media-body">
										<h4 class="media-heading">drogi zielone</h4>
									</div>
								</div>
								<div class="media">
									<div class="media-left media-middle">
										<a href="#">
											<span class="media-object" style="width: 24px; height: 24px; background-color: rgb(255, 152, 0);"></span>
										</a>
									</div>
									<div class="media-body">
										<h4 class="media-heading">drogi brukowe</h4>
									</div>
								</div>
								<div class="media">
									<div class="media-left media-middle">
										<a href="#">
											<span class="media-object" style="width: 24px; height: 24px; background-color: rgb(8, 188, 212);"></span>
										</a>
									</div>
									<div class="media-body">
										<h4 class="media-heading">drogi półtwarde</h4>
									</div>
								</div>						
							</div>
						</div>
					</div>
					<div class="panel panel-default">
						<div class="panel-heading">
							<h3 class="panel-title">Planowanie trasy:</h3> 
						</div>
						<div class="panel-body" >
							<div id="opis">
								<p><b>Wybór trasy:</b>
									<ol>
										<li>Zaznaczaj kolejne węzły klikając na niego</li>
										<li>Usuwaj ostatnie zaznaczone węzły klikając z przytrzymaniem CTRL</li>
									</ol> 
								</p>
							</div>
							<div id="trasa"></div>
							<div class="btn-group" role="group">
								<div class="btn-group" role="group">
									<button id="remove_last" type="button" class="btn btn-danger" disabled >Usuń ostatni</button>
								</div>
								<div class="btn-group" role="group">
									<button id="reset" type="button" class="btn btn-danger" disabled >Wyczyść</button>
								</div>							
							</div>
							<button id="search_location" type="button" class="btn btn-info">Szukaj</button>
						</div>						
					</div>
					<div class="panel panel-success">
						<div class="panel-heading" data-toggle="collapse" href="#collapse4">
							<h3 class="panel-title">Pobieranie</h3>
						</div>
						<div id="collapse4" class="panel-collapse collapse">
							<div class="panel-body" >
								<h4>Pobierz GPX</h4>
								<div class="btn-group btn-group-justified" role="group" id="download">
									<div class="btn-group" role="group">
										<button type="button" class="btn btn-primary" data-type="track" disabled >Ślad (track)</button>
									</div>
									<div class="btn-group" role="group">
										<button type="button" class="btn btn-primary" data-type="track_poi" disabled >Ślad + POI</button>
									</div>
									<div class="btn-group" role="group">
										<button type="button" class="btn btn-primary" data-type="route" disabled >Trasa (route)</button>
									</div>
								</div>
								<div class="input-group" id="download2">
									<span class="input-group-addon">
										<input type="checkbox"/>
									</span>
									<input type="number" class="form-control" step="1" min="2" placeholder="Ograniczenie do N punktów, np. 500" title="Uprość do N punktów"/>
								</div>
								
								<h4>Inne</h4>
								<!--style="/*display: none;*/"-->						
								<div class="btn-group" role="group">
									<div class="btn-group" role="group">
										<button id="brochure_direction" disabled type="button" class="btn btn-info">Broszurka</button>
									</div>
									<div class="btn-group" role="group">
										<button id="print_direction" disabled type="button" class="btn btn-info" >Drukuj</button>
									</div>
								</div>
								<a href="export_csv" class="btn btn-info">Export CSV</a>
								
								<div class="btn-group" role="group">
									<div class="btn-group" role="group">
										<button id="save_session" disabled type="button" class="btn btn-default" title="Zapisz sesje">
											<span class="glyphicon glyphicon-floppy-save" aria-hidden="true"></span>
										</button>
									</div>
									<div class="btn-group" role="group">
										<label id="load_session" class="btn btn-default btn-file" title="Załaduj sesje">
											<span class="glyphicon glyphicon-floppy-open" aria-hidden="true"></span>
											<input type="file" style="display: none;" accept=".json"/>
										</label>
									</div>
								</div>					
							</div>						
						</div>
					</div>
					<div class="panel panel-default">
						<div class="panel-heading" data-toggle="collapse" href="#collapse5">													
							<h3 class="panel-title">Profil wysokości</h3>
						</div>
						<div id="collapse5" class="panel-collapse collapse">
							<div class="panel-body" >
								<div id="ele_profile" style="overflow-y: hidden; overflow-x: scroll;"></div>
							</div>
						</div>	
					</div>
				</div> 			
			</div>
		</div>
		<div id="content">
			<div id="map" class="map fill"></div>
		</div>
		
		<div id="dialog_download" title="Informacja">
			<p>Proszę najpierw wybrać trasę.</p>
		</div>
		<div class="modal" id="print_modal" style="z-index: 10000;" ><!-- tabindex="-1" role="dialog"-->
			<div class="modal-dialog modal-lg">
				<div class="modal-content">
					<div class="modal-header">
						<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
						<h4 class="modal-title">Wygenerowana trasa</h4>
					</div>
					<div class="modal-body">
						<iframe height="100" style="width: 100%; height: 100%;"></iframe>
					</div>
				</div>
			</div>
		</div>
	</body>
</html>