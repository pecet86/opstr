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

include(dirname(__FILE__).'/start_sesion.php');

/* Ustawienia formularza kontaktowego */
$adres_odbiorcy = 'MapaInfryRowerowejLublina@gmail.com'; 	//tu wpisz adres e-mail na który mają przychodzić wiadomości

//baza
$baza_nazwa = 'NAZWA';
$baza_uzytkownik = 'USER';
$baza_host = 'localhost';
$bazw_haslo = 'HASŁO';
$table_prefix = "str_";
$table_suffix = "";

if ( ! function_exists('write_log')) {
   function write_log ( $log )  {
      if ( is_array( $log ) || is_object( $log ) ) {
         error_log( print_r( $log, true ) ."\n" , 3, dirname(__FILE__) . '/php-errors.log' );
      } else {
         error_log( $log . "\n", 3, dirname(__FILE__) . '/php-errors.log' );
      }
   }
}