<?php
set_time_limit(360);
ini_set ("memory_limit", "100M");

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

include ('lib/ustawienia.php');
header('Content-Type: application/vnd.geo+json; charset=utf-8', true);


$bbox = array();
if(isset($_GET['bbox'])){
	$bbox = explode(",",$_GET['bbox']);
}
$simple = isset($_GET['simple']);
$type = 'base';
if(isset($_GET['type'])){
	$type = $_GET['type'];
}

$connection = mysqli_connect($baza_host, $baza_uzytkownik, $bazw_haslo, $baza_nazwa);// or die('Brak połączenia z serwerem MySQL');
mysqli_query($connection, "SET CHARSET utf8");
mysqli_query($connection, "SET NAMES `utf8` COLLATE `utf8_unicode_ci`");
mysqli_query($connection, "SET SESSION group_concat_max_len = 1000000");



$geojson = array("type" => "FeatureCollection", "features" => array());
if(!empty($bbox)){
	$bbox_q = " MBRIntersects(Envelope(GeomFromText('LineString({$bbox[1]} {$bbox[0]}, {$bbox[3]} {$bbox[2]})')), w.ENVELOPE) = 1";
	
	$Query = '';
	if($simple){
		$Query = "SELECT w.FK_ID, GROUP_CONCAT(CONCAT('[', Y( n.GPS ), ',', X( n.GPS ), ']') ORDER BY wn.ID ASC SEPARATOR ', ') AS gpsx
			FROM {$table_prefix}ways{$table_suffix} w
			INNER JOIN {$table_prefix}way_nodes{$table_suffix} wn ON w.FK_ID = wn.FK_way
			AND w.TYPE =  '{$type}' 
			INNER JOIN {$table_prefix}nodes{$table_suffix} n ON n.FK_ID = wn.FK_node
			WHERE n.TYPE = 'main' AND {$bbox_q} 
			GROUP BY w.FK_ID";
	}else{
		$Query = "SELECT w.FK_ID, GROUP_CONCAT(CONCAT('[', Y( n.GPS ), ',', X( n.GPS ), ']') ORDER BY wn.ID ASC SEPARATOR ', ') AS gpsx
			FROM {$table_prefix}ways{$table_suffix} w
			INNER JOIN {$table_prefix}way_nodes{$table_suffix} wn ON w.FK_ID = wn.FK_way
			AND w.TYPE =  '{$type}' 
			INNER JOIN {$table_prefix}nodes{$table_suffix} n ON n.FK_ID = wn.FK_node
			WHERE {$bbox_q} 
			GROUP BY w.FK_ID";
	}
	//var_dump($Query);

	$time_start1 = microtime(true);
	$result = mysqli_query($connection, $Query, MYSQLI_USE_RESULT);
	write_log('(mysql):'. round((microtime(true) - $time_start1) * 1000, 5) .' ms');
	
	$time_start2 = microtime(true);
	if($result){		
		while($row = $result->fetch_assoc()) {	
			$gpsx = json_decode('['.$row['gpsx'].']', true);
			if(is_null($gpsx)) continue;
		
			$geojson["features"][] = array(
				"id" => $row['FK_ID'],
				"type" => "Feature",
				"geometry" => array(
					"type" => "LineString",
					"coordinates" => 	$gpsx
				),
				"properties" => array(
					"ID" => $row['FK_ID']
				)
			);
		}
		$result->close();		
	}
	write_log('(php):'. round((microtime(true) - $time_start2) * 1000, 5) .' ms');
	
	if($type == 'hard'){
		$Query = "SELECT DISTINCT n.FK_ID, n.NUMBER, n.TYPE, CONCAT('[', Y( n.GPS ), ',', X( n.GPS ), ']') as gpsx
			FROM {$table_prefix}ways{$table_suffix} w
			INNER JOIN {$table_prefix}way_nodes{$table_suffix} wn ON w.FK_ID = wn.FK_way
			AND w.TYPE =  'hard' 
			INNER JOIN {$table_prefix}nodes{$table_suffix} n ON n.FK_ID = wn.FK_node 
			AND n.TYPE = 'main'
			WHERE {$bbox_q}";
		//var_dump($Query);

		$result = mysqli_query($connection, $Query, MYSQLI_USE_RESULT);
		if($result){
			while($row = $result->fetch_assoc()) {	
				$gpsx = json_decode($row['gpsx'], true);
				if(is_null($gpsx)) continue;
			
				$geojson["features"][] = array(
					"id" => $row['FK_ID'],
					"type" => "Feature",
					"geometry" => array(
						"type" => "Point",
						"coordinates" => $gpsx
					),
					"properties" => array(
						"ID" => $row['FK_ID'],
						"type" => 'node',
						"name" => $row['NUMBER']
					)
				);
			}
			$result->close();		
		}
	}
}
echo json_encode($geojson);	
	
mysqli_close($connection);
?>