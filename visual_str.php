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
header('Content-Type: application/xml; charset=utf-8', true);


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


function printTag($k, $v){
	return "<tag k=\"{$k}\" v=\"{$v}\"/>";
}
function printNode($id, $lon, $lat, $main, $nr){
	$xml2 = "<node id=\"-{$id}\" lon=\"{$lon}\" lat=\"{$lat}\">";
	if($main){
		$xml2 .= printTag('name', $nr);
		$xml2 .= printTag('type', 'node');
	}
	$xml2 .= "</node>"."\n";
	return $xml2;
}
function printWay($id, $nodes){
	$xml2 = "<way id=\"-{$id}\">";
	foreach ($nodes as $id_node){		
		$xml2 .= "<nd ref=\"-{$id_node}\"/>";
	}
	$xml2 .= "</way>"."\n";
	return $xml2;
}

echo '<?xml version="1.0" encoding="UTF-8"?><osm version="0.6">'."\n";
if(!empty($bbox)){
	$bbox_q = " MBRIntersects(Envelope(GeomFromText('LineString({$bbox[1]} {$bbox[0]}, {$bbox[3]} {$bbox[2]})')), w.ENVELOPE) = 1";
	
	$Query = '';
	if($simple){
		$Query = "SELECT wn.FK_way, wn.FK_node, X(n.GPS) AS lat, Y(n.GPS) AS lon, n.TYPE, n.NUMBER
			FROM {$table_prefix}ways{$table_suffix} w INNER JOIN {$table_prefix}way_nodes{$table_suffix} wn ON w.FK_ID = wn.FK_way AND w.TYPE = '{$type}' INNER JOIN {$table_prefix}nodes{$table_suffix} n ON n.FK_ID = wn.FK_node
			WHERE n.TYPE = 'main' AND {$bbox_q}"; 
	}else{
		$Query = "SELECT wn.FK_way, wn.FK_node, X(n.GPS) AS lat, Y(n.GPS) AS lon, n.TYPE, n.NUMBER
			FROM {$table_prefix}ways{$table_suffix} w INNER JOIN {$table_prefix}way_nodes{$table_suffix} wn ON w.FK_ID = wn.FK_way AND w.TYPE = '{$type}' INNER JOIN {$table_prefix}nodes{$table_suffix} n ON n.FK_ID = wn.FK_node
			WHERE {$bbox_q}"; 	
	}
	//var_dump($Query);
	
	$result = mysqli_query($connection, $Query, MYSQLI_USE_RESULT);

	$nodes = array();
	$ways = array();	
	if($result){
		while($row = $result->fetch_assoc()) {			
			$id_way = $row['FK_way'];
			$id_node = $row['FK_node'];
			if(!array_key_exists($id_way, $ways)){
				$ways[$id_way] = array();				
			}
			$ways[$id_way][] = $id_node;
						
			if(!in_array($id_node, $nodes)){
				$nodes[] = $id_node;
				echo printNode($id_node, $row['lon'], $row['lat'], $row['TYPE']=='main', $row['NUMBER']);
			}			
		}
		$result->close();		
	}
	
	foreach ($ways as $id_way => $way_nodes){		
		echo printWay($id_way, $way_nodes);
	}
}
echo '</osm>';	
	
mysqli_close($connection);
?>