<?php
set_time_limit(60);

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


$connection;

function openConnection(){
	global $connection, $baza_host, $baza_uzytkownik, $bazw_haslo, $baza_nazwa;
	
	if(isset($connection) && !is_null($connection) && mysqli_ping($connection)){
		return;
	}
	
	$connection = mysqli_connect($baza_host, $baza_uzytkownik, $bazw_haslo, $baza_nazwa);// or die('Brak połączenia z serwerem MySQL');
	mysqli_query($connection, "SET CHARSET utf8");
	mysqli_query($connection, "SET NAMES `utf8` COLLATE `utf8_unicode_ci`");
}

function idsToGPS($points){
	global $connection, $table_prefix;
	
	$ids = implode(', ', array_map(function($v){
		return -$v;
	}, $points));
	
	$Query = "SELECT ID, X(GPS) AS lat, Y(GPS) AS lon FROM {$table_prefix}elements{$table_suffix} WHERE ID IN ({$ids}) AND TYPE = 'node'";
	$result = mysqli_query($connection, $Query);
	
	$x = '';
	if($result){
		while($row=mysqli_fetch_array($result)) { 
			if(!empty($x)){
				$x .= ', ';
			}
			$x .= "POINT({$row['lat']} {$row['lon']})";
		}
	}
	
	return "GEOMETRYCOLLECTION({$x})";
}

function idsToNumber($points){
	global $connection, $table_prefix, $table_suffix;
	
	openConnection();
	
	//write_log('XXX');
	//write_log($points);
	
	$ids = implode(', ', array_map(function($v){
		return -$v;
	}, $points));
	
	//write_log($ids);
	
	$Query = "SELECT FK_ID, NUMBER FROM {$table_prefix}nodes{$table_suffix} 
	WHERE FK_ID IN ({$ids})
	ORDER BY FIELD(FK_ID, {$ids})";
	$result = mysqli_query($connection, $Query);
	
	$r = array();
	if($result){
		while($row=mysqli_fetch_array($result)) { 
			$r[-$row['FK_ID']] = $row['NUMBER'];
		}
	}
	
	mysqli_close($connection);
	$connection = null;
	
	$result = array();	
	foreach ($points as $key){
		$result[] = array($key, $r[$key]);
	}
	
	
	//write_log($r);
	
	return $result;
}

function getGraph($points){
	global $connection, $table_prefix, $table_suffix;
	
	openConnection();
	
	$bbox = array();
	if(isset($_POST['bbox'])){
		$bbox = $_POST['bbox'];
	}
	
	$bbox_q = " MBRIntersects(Envelope(GeomFromText('LineString({$bbox[1]} {$bbox[0]}, {$bbox[3]} {$bbox[2]})')), ENVELOPE) = 1";
	$bbox_q2 = " MBRContains(Envelope(GeomFromText('LineString({$bbox[1]} {$bbox[0]}, {$bbox[3]} {$bbox[2]})')), ENVELOPE) = 1";
	
	$results = array();
	if(!empty($points)){
		//$temp = idsToGPS($points);

		$Query = "SELECT FK_ID, DISTANCE, ONEWAY, NODE_START, NODE_END FROM {$table_prefix}ways{$table_suffix} 
			WHERE {$bbox_q} AND TYPE = 'base'";// OR {$bbox_q2}";
		
		//var_dump($Query);
		$result = mysqli_query($connection, $Query, MYSQLI_USE_RESULT);
		
		$nodes = array();	
		if($result){
			while($row = $result->fetch_assoc()) {	
				$id_node_start = $row['NODE_START'];
				$id_node_end = $row['NODE_END'];
				$id_way = "".-$row['FK_ID'];
				$distance = floatval($row['DISTANCE']);
				$oneway = filter_var($row['ONEWAY'], FILTER_VALIDATE_BOOLEAN);
				
				
				
				if(!array_key_exists($id_node_start, $nodes)){
					$nodes[$id_node_start] = array();				
				}
				if(!array_key_exists($id_node_end, $nodes[$id_node_start])){
					$nodes[$id_node_start][$id_node_end] = array($distance, $id_way);				
				}
				
				if(!$oneway){
					$t = $id_node_start;
					$id_node_start = $id_node_end;
					$id_node_end = $t;
					
					//var_dump(array($id_way, $oneway, $id_node_start, $id_node_end));
					
					if(!array_key_exists($id_node_start, $nodes)){
						$nodes[$id_node_start] = array();				
					}
					if(!array_key_exists($id_node_end, $nodes[$id_node_start])){
						$nodes[$id_node_start][$id_node_end] = array($distance, $id_way);				
					}
				}
			}
		}		
		$results = $nodes;
		
		//var_dump(json_encode($results));
	}

	mysqli_close($connection);
	$connection = null;
	
	return $results;//json_encode(); 
}
?>