<?php
echo "PHP is working!";
echo "\nPHP Version: " . PHP_VERSION;
echo "\nCurrent directory: " . __DIR__;
echo "\nParent directory: " . dirname(__DIR__);

// 检查vendor目录
$vendor_path = dirname(__DIR__) . '/vendor';
if (is_dir($vendor_path)) {
    echo "\nVendor directory exists";
} else {
    echo "\nVendor directory does not exist";
}

// 检查autoload文件
$autoload_path = $vendor_path . '/autoload.php';
if (file_exists($autoload_path)) {
    echo "\nAutoload file exists";
} else {
    echo "\nAutoload file does not exist";
}
?>
