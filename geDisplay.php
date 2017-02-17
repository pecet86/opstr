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

$ignore_start = true;
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

function geDistanceSum(){
	global $connection, $table_prefix, $table_suffix;
	
	openConnection();
	
	$Query = "SELECT SUM(total) as DISTANCE FROM (SELECT (SUM(`DISTANCE`) * 2) as total FROM {$table_prefix}ways{$table_suffix} WHERE ONEWAY=FALSE AND TYPE = 'base' 
	UNION ALL 
	SELECT SUM(`DISTANCE`) as total FROM {$table_prefix}ways{$table_suffix} WHERE ONEWAY = TRUE AND TYPE = 'base') s";
	$result = mysqli_query($connection, $Query, MYSQLI_USE_RESULT);

	$finfo = 0;
	if($result){
		$finfo = $result->fetch_row();
		$finfo = $finfo[0];
		$finfo = intval ($finfo / 1000); //na kilometry i zaokrąglić 
	}	
	
	mysqli_close($connection);
	$connection = null;
	
	return $finfo; 
}
function getCountNodes(){
	global $connection, $table_prefix, $table_suffix;
	
	openConnection();
	
	$Query = "SELECT COUNT( * ) FROM  {$table_prefix}nodes{$table_suffix} WHERE `TYPE` = 'main'";
	$result = mysqli_query($connection, $Query, MYSQLI_USE_RESULT);
	
	$finfo = 0;
	if($result){
		$finfo = $result->fetch_row();
		$finfo = $finfo[0];
	}
	
	mysqli_close($connection);
	$connection = null;
	
	return $finfo; 
}

?>