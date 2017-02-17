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


if($_SERVER['REQUEST_METHOD'] != "GET") {
    header("HTTP/1.0 403 Forbidden");
    print("Forbidden");
    exit();
}
header('Content-Encoding: UTF-8');
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename=nodes.csv');

$connection = mysqli_connect($baza_host, $baza_uzytkownik, $bazw_haslo, $baza_nazwa);// or die('Brak połączenia z serwerem MySQL');
mysqli_query($connection, "SET CHARSET utf8");
mysqli_query($connection, "SET NAMES `utf8` COLLATE `utf8_unicode_ci`");


$Query = "SELECT X( n.GPS ) AS lat, Y( n.GPS ) AS lon, n.NUMBER, al.PROVINCE_SORT, al.DISTRICT, al.COMMUNE
		FROM {$table_prefix}nodes{$table_suffix} AS n, {$table_prefix}admin_level{$table_suffix} AS al
		WHERE n.TYPE = 'main'
		AND al.ID = n.FK_ADMIN_LEVEL";
$result = mysqli_query($connection, $Query);

if($result){
	$nodes = array();
	
	while($row=mysqli_fetch_array($result)) {  
		$nodes[] = array(			
			'lon' => $row['lon'],
			'lat' => $row['lat'],
			'number' => $row['NUMBER'],
			'name' => $row['PROVINCE_SORT'] . ' ' . $row['DISTRICT'] . ' ' . $row['COMMUNE']
		);	
	}

	echo "\xEF\xBB\xBF";
	$out = fopen('php://output', 'w');
	
	fputcsv($out, array('lon', 'lat', 'number', 'name'));
	foreach ($nodes as $fields) {
		fputcsv($out, $fields);
	}
	
	fclose($out);
}
	
mysqli_close($connection);
?>