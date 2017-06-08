<?php
set_time_limit(30);

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
if(!isset($_POST['points'])) {
	echo json_encode(array('type' => 'error', 'message' => 'brak points')); 
	exit;
}

//var_dump($_POST['points']);

$points = $_POST['points'];//json_decode($_POST['points'], true);
if(count($points) < 2){
	echo json_encode(array('type' => 'error', 'message' => 'minmum 2 punkty')); 
	exit;
}

$connection;

//ob_start();

function openConnection(){
	global $connection, $baza_host, $baza_uzytkownik, $bazw_haslo, $baza_nazwa;
	
	if(isset($connection) && !is_null($connection) && mysqli_ping($connection)){
		return;
	}
	
	$connection = mysqli_connect($baza_host, $baza_uzytkownik, $bazw_haslo, $baza_nazwa);// or die('Brak połączenia z serwerem MySQL');
	mysqli_query($connection, "SET CHARSET utf8");
	mysqli_query($connection, "SET NAMES `utf8` COLLATE `utf8_unicode_ci`");
}

function geDisplay($points){
	global $connection, $table_prefix, $table_suffix;
	
	openConnection();
	
	$nodes = array();
	if(!empty($points)){
		$points = array_map(function($v){
			return $v;
		}, $points);
		
		$ids = implode(', ', array_unique($points));
		
		$Query = "SELECT n.FK_ID, al.PROVINCE, al.PROVINCE_SORT, al.DISTRICT, al.COMMUNE
				FROM {$table_prefix}nodes{$table_suffix} as n, {$table_prefix}admin_level{$table_suffix} as al
				WHERE n.FK_ID IN ({$ids}) AND al.ID = n.FK_ADMIN_LEVEL
				ORDER BY FIELD(n.FK_ID, {$ids})";
		$result = mysqli_query($connection, $Query, MYSQLI_USE_RESULT);
		
			
		if($result){
			while($row = $result->fetch_assoc()) {	
				$id = $row['FK_ID'];
				
				$nodes[$id] = array(
					'województwo_srt' => $row['PROVINCE_SORT'],
					//'województwo' => $row['PROVINCE'],
					'powiat' => $row['DISTRICT'],
					'gmina' => $row['COMMUNE']				
				);
			}
		}	
	}
	
	mysqli_close($connection);
	$connection = null;
	
	return $nodes; 
}

echo json_encode(geDisplay($points));

//ob_end_flush();
?>