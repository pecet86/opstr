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


if($_SERVER['REQUEST_METHOD'] != "POST") {
    header("HTTP/1.0 403 Forbidden");
    print("Forbidden");
    exit();
}

header('Content-Type: application/json; charset=utf-8', true);
if(!isset($_POST['routes'])) {
	echo json_encode(array('type' => 'error', 'message' => 'brak połączeń')); 
	exit;
}


$routes = $_POST['routes'];
if(count($routes) < 1){
	echo json_encode(array('type' => 'error', 'message' => 'minmum 1 połaczenie')); 
	exit;
}
$point_start = - intval ($_POST['point_start']);
$point_end = - intval ($_POST['point_end']);
$routes = array_map(function($v){
	return -$v;
}, $routes);


$connection = mysqli_connect($baza_host, $baza_uzytkownik, $bazw_haslo, $baza_nazwa);// or die('Brak połączenia z serwerem MySQL');
mysqli_query($connection, "SET CHARSET utf8");
mysqli_query($connection, "SET NAMES `utf8` COLLATE `utf8_unicode_ci`");

$geojson = array(); 

function getWay($ways, $id_way, $node){
	$nodes = $ways[$id_way];
	
	$fn = reset($nodes);
	$ln = end($nodes);
	
	if($fn['id'] == $node){
		return array(
			'id_way' => $id_way, 
			'nodes' => $nodes, 
			'last_node' => $ln
		);
	}else if($ln['id'] == $node){
		return array(
			'id_way' => $id_way, 
			'nodes' => array_reverse($nodes), 
			'last_node' => $fn
		);
	}
		
	return NULL;
}
function printNode($node){
	$feature = array(
		'id' => $node['id'],
		'ele' => $node['ele'] > -1 ? floatval($node['ele']) : 0,
		'gps' => array_map('floatval',  $node['gps'])
	);
	
	if(array_key_exists('nr', $node) && $node['nr'] > -1){
		$feature['name'] = "{$node['nr']}";
	}

	return $feature;
}
function printWay($way, $last){	
	$features = array();
	foreach ($way['nodes'] as $node){
		array_push($features, printNode($node));
	}
	
	if(!$last){
		array_pop($features);
	}
	
	return $features;
}


$ids = implode(', ', array_unique($routes));
$Query = "SELECT wn.FK_way, wn.FK_node, X(n.GPS) AS lat, Y(n.GPS) AS lon, n.TYPE, n.NUMBER, n.ELEVATION  
		FROM {$table_prefix}ways{$table_suffix} w INNER JOIN {$table_prefix}way_nodes{$table_suffix} wn ON w.FK_ID = wn.FK_way AND w.TYPE = 'base' INNER JOIN {$table_prefix}nodes{$table_suffix} n ON n.FK_ID = wn.FK_node
		WHERE wn.FK_way IN ({$ids})
		ORDER BY FIELD(wn.FK_way, {$ids}), wn.ID";
$result = mysqli_query($connection, $Query);

if($result){
	$ways = array();
	
	while($row=mysqli_fetch_array($result)) {  
		$id_way = $row['FK_way'];
		
		if(!array_key_exists($id_way, $ways)){
			$ways[$id_way] = array();				
		}
		
		$node = array(
			'id' => $row['FK_node'],
			'gps' =>  array($row['lon'], $row['lat']),
			'ele' => $row['ELEVATION']
		);
		
		if($row['TYPE'] == 'main'){
			$node['nr'] = $row['NUMBER'];
		}
		
		$ways[$id_way][] = $node;
	}
	

	$curr = $point_start;	
	while(!empty($routes)){
		$id_way = array_shift($routes);
		$way_d = getWay($ways, $id_way, $curr);
		if(empty($way_d)){
			var_dump($id_way);
			var_dump($curr);
			var_dump($ways);		
			break;
		}

		$curr = $way_d['last_node']['id'];		
		$geojson = array_merge($geojson, printWay($way_d, empty($routes)));		
	}
}
	
mysqli_close($connection);
echo json_encode($geojson); 
?>