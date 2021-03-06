<?php
// Our class
class FileCache {
	// This is the function you store information with
	function store($key,$data,$ttl) {
		// Opening the file
		$h = fopen($this->getFileName($key),'w');
		if (!$h) throw new Exception('Could not write to cache');
			// Serializing along with the TTL
			$data = serialize(array(time()+$ttl,$data));
			if (fwrite($h,$data)===false) {
			throw new Exception('Could not write to cache');
		}
		fclose($h);
	}

	function delete($key) {
		$filename = $this->getFileName($key);
		if (!file_exists($filename) || !is_readable($filename)) return false;
		
		unlink($filename);
		return true;
	}

	// General function to find the filename for a certain key
	private function getFileName($key) {
		return '/tmp/s_cache' . md5($key);
	}

	// The function to fetch data returns false on failure
	function fetch($key) {
		$filename = $this->getFileName($key);
		if (!file_exists($filename) || !is_readable($filename)) return false;

		$data = file_get_contents($filename);

		$data = @unserialize($data);
		if (!$data) {
			// Unlinking the file when unserializing failed
			unlink($filename);
			return false;
		}

		// checking if the data was expired
		if (time() > $data[0]) {
			// Unlinking
			unlink($filename);
			return false;
		}
		return $data[1];
	}
	
	function remainingTime($key) {
		$filename = $this->getFileName($key);
		if (!file_exists($filename) || !is_readable($filename)) return false;

		$data = file_get_contents($filename);

		$data = @unserialize($data);
		if (!$data) {
			// Unlinking the file when unserializing failed
			unlink($filename);
			return 0;
		}
		
		return $data[0];
	}

}
?>