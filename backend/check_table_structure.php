<?php
try {
    $pdo = new PDO('sqlite:database/sqlite.db');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "檢查 users 表結構:\n";
    $stmt = $pdo->query('PRAGMA table_info(users)');
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach($columns as $col) {
        echo "  {$col['name']} ({$col['type']})\n";
    }
    
    echo "\n檢查 tasks 表結構:\n";
    $stmt = $pdo->query('PRAGMA table_info(tasks)');
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach($columns as $col) {
        echo "  {$col['name']} ({$col['type']})\n";
    }
    
} catch(Exception $e) {
    echo '錯誤: ' . $e->getMessage() . "\n";
}
