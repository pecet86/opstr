<?php

/**
 * @package   PSTR
 * @author    Pawe� Cal <MapaInfryRowerowejLublina@gmail.com>
 * @copyright (c) 2016 Pawe� Cal <MapaInfryRowerowejLublina@gmail.com>
 * @license   GPL-3.0+
 *
* Niniejszy program jest wolnym oprogramowaniem; mo�esz go 
* rozprowadza� dalej i/lub modyfikowa� na warunkach Powszechnej
* Licencji Publicznej GNU, wydanej przez Fundacj� Wolnego
* Oprogramowania - wed�ug wersji 2-giej tej Licencji lub kt�rej�
* z p�niejszych wersji. 
* Niniejszy program rozpowszechniany jest z nadziej�, i� b�dzie on 
* u�yteczny - jednak BEZ JAKIEJKOLWIEK GWARANCJI, nawet domy�lnej 
* gwarancji PRZYDATNO�CI HANDLOWEJ albo PRZYDATNO�CI DO OKRE�LONYCH 
* ZASTOSOWA�. W celu uzyskania bli�szych informacji - Powszechna 
* Licencja Publiczna GNU. 
* Z pewno�ci� wraz z niniejszym programem otrzyma�e� te� egzemplarz 
* Powszechnej Licencji Publicznej GNU (GNU General Public License);
* je�li nie - napisz do Free Software Foundation, Inc., 675 Mass Ave,
* Cambridge, MA 02139, USA. 
*/

	if (isset($ignore_start) && $ignore_start){
		return;
	}

    if (version_compare(phpversion(), '5.4.0', '<')) {
        if(session_id() == '') {
            session_start();
        }
    } else {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
    }
?>