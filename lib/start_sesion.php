<?php

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