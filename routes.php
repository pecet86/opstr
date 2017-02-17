<?php
set_time_limit(120);

/**
 * @package   PSTR
 * @author    Pawe³ Cal <MapaInfryRowerowejLublina@gmail.com>
 * @copyright (c) 2016 Pawe³ Cal <MapaInfryRowerowejLublina@gmail.com>
 * @license   GPL-3.0+
 *
* Niniejszy program jest wolnym oprogramowaniem; mo¿esz go 
* rozprowadzaæ dalej i/lub modyfikowaæ na warunkach Powszechnej
* Licencji Publicznej GNU, wydanej przez Fundacjê Wolnego
* Oprogramowania - wed³ug wersji 2-giej tej Licencji lub którejœ
* z póŸniejszych wersji. 
* Niniejszy program rozpowszechniany jest z nadziej¹, i¿ bêdzie on 
* u¿yteczny - jednak BEZ JAKIEJKOLWIEK GWARANCJI, nawet domyœlnej 
* gwarancji PRZYDATNOŒCI HANDLOWEJ albo PRZYDATNOŒCI DO OKREŒLONYCH 
* ZASTOSOWAÑ. W celu uzyskania bli¿szych informacji - Powszechna 
* Licencja Publiczna GNU. 
* Z pewnoœci¹ wraz z niniejszym programem otrzyma³eœ te¿ egzemplarz 
* Powszechnej Licencji Publicznej GNU (GNU General Public License);
* jeœli nie - napisz do Free Software Foundation, Inc., 675 Mass Ave,
* Cambridge, MA 02139, USA. 
*/

include ('lib/FileCache.php');
include ('lib/ustawienia.php');

if($_SERVER['REQUEST_METHOD'] != "POST") {
    header("HTTP/1.0 403 Forbidden");
    print("Forbidden");
    exit();
}

header('Content-Type: application/json; charset=utf-8', true);
if(!isset($_POST['points'])) {
	echo json_encode(array('type' => 'error', 'message' => 'brak points')); 
	exit;
}

$points = $_POST['points'];//json_decode($_POST['points'], true);
if(count($points) < 2){
	echo json_encode(array('type' => 'error', 'message' => 'minmum 2 punkty')); 
	exit;
}

$cache = new FileCache();
include("lib/Dijkstra.php");
use Fisharebest\Algorithm\Dijkstra;
include('graph_str.php');

function findShort($pointS, $pointE){
	global $results, $graph;
	if (array_key_exists($pointS, $graph)){//jeszeli bezpoœredni nastêpnik
		//$time_start1 = microtime(true);
	
		$ways = $graph[$pointS];	
		if (array_key_exists($pointE, $ways)){
			$way = $ways[$pointE];
			
			array_push($results['points'], $pointS);
			array_push($results['routes'], $way[1]);
			array_push($results['distance'], $way[0]);
			array_push($results['ds'], true);
			
			//write_log('(findShort):'. round((microtime(true) - $time_start1) * 1000, 5) .' ms');
			return $pointE;
		}		
	}
	return false;
}
function findPath($pointS, $pointE){
	global $dijkstra, $results;
	//$time_start1 = microtime(true);
	
	$path = $dijkstra->shortestPaths($pointS, $pointE);
	if(empty($path)){
		echo json_encode(array('type' => 'error', 'message' => 'nie znaleziono')); 
		return false;
	}
	
	$points2 = $path[0][0];
	array_pop($points2);
	
	toCache($pointS, $pointE, $points2, $path[1][0], $path[2][0]);
	
	$results['points'] = array_merge($results['points'], $points2);
	$results['routes'] = array_merge($results['routes'], $path[1][0]);
	$results['distance'] = array_merge($results['distance'], $path[2][0]);
	array_push($results['ds'], false);

	//write_log('(findPath):'. round((microtime(true) - $time_start1) * 1000, 5) .' ms');
	return $pointE;
}
function fromCache($pointS, $pointE){
	global $cache, $results;
	//$time_start1 = microtime(true);
	
	$key = 'str_route_'.$pointS.'-'.$pointE;
	
	//$cache->delete($key);//usun¹æ gdu koniec
	$result = $cache->fetch($key);		
	if (!$result) {
		return false;
	}
	
	$results['points'] = array_merge($results['points'], $result[0]);
	$results['routes'] = array_merge($results['routes'], $result[1]);
	$results['distance'] = array_merge($results['distance'], $result[2]);
	array_push($results['ds'], false);
	
	//write_log('(fromCache):'. round((microtime(true) - $time_start1) * 1000, 5) .' ms');
	return $pointE;
}
function toCache($pointS, $pointE, $points, $routes, $distance){
	global $cache;
	//$time_start1 = microtime(true);
	
	$key = 'str_route_'.$pointS.'-'.$pointE;
	$result = $cache->fetch($key);
	if (!$result) {	
		$result = array($points, $routes, $distance);
		$cache->store($key, $result, 86400);
		
		//write_log('(toCache):'. round((microtime(true) - $time_start1) * 1000, 5) .' ms');
	}
}


//$time_start = microtime(true);
//error_log('START ROUTES');
$graph = getGraph($points);
//write_log('(GRAPH):'. round((microtime(true) - $time_start) * 1000, 5) .' ms');
//$time_start = microtime(true);



$dijkstra = new Dijkstra($graph);
$results = array('points' => array(), 'routes' => array(), 'distance' => array(), 'ds' => array());
$point1 = array_shift($points);
while (count($points) > 0) {
	$point2 = array_shift($points);
	
	$found = findShort($point1, $point2);
	if(!is_bool($found)){
		$point1 = $found;
		continue;
	}
	
	$found = fromCache($point1, $point2);
	if(!is_bool($found)){
		$point1 = $found;
		continue;
	}
	
	$found = findPath($point1, $point2);
	if(!is_bool($found)){
		$point1 = $found;
	}else if(!$found){
		die();
	}
}
$results['points'][] = $point1;
$results['points'] = idsToNumber($results['points']);

//write_log('(SEARCH):'. round((microtime(true) - $time_start) * 1000, 5) .' ms');

echo json_encode($results);
?>