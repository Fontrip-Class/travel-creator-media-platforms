<?php

namespace App\Services;

use PDO;
use PDOException;
use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use Monolog\Formatter\LineFormatter;

class DatabaseService
{
    private ?PDO $pdo = null;
    private Logger $logger;
    private array $config;
    private int $maxRetries = 3;
    private int $retryDelay = 1000; // 毫秒

    public function __construct(array $config)
    {
        $this->config = $config;
        $this->setupLogger();
    }

    private function setupLogger(): void
    {
        $this->logger = new Logger('database');
        
        // 創建日誌目錄
        $logDir = __DIR__ . '/../../logs';
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
        
        $handler = new StreamHandler($logDir . '/database.log', Logger::DEBUG);
        $formatter = new LineFormatter("[%datetime%] %channel%.%level_name%: %message% %context%\n");
        $handler->setFormatter($formatter);
        
        $this->logger->pushHandler($handler);
    }

    private function connect(): void
    {
        if ($this->pdo !== null) {
            return;
        }

        $attempt = 0;
        while ($attempt < $this->maxRetries) {
            try {
                $driver = $this->config['driver'] ?? 'sqlite';
                
                switch ($driver) {
                    case 'sqlite':
                        $dsn = "sqlite:{$this->config['database']}";
                        $this->pdo = new PDO($dsn, null, null, $this->config['options'] ?? []);
                        break;
                        
                    case 'mysql':
                        $host = $this->config['mysql']['host'] ?? 'localhost';
                        $port = $this->config['mysql']['port'] ?? '3306';
                        $database = $this->config['mysql']['database'] ?? 'travel_platform';
                        $username = $this->config['mysql']['username'] ?? 'root';
                        $password = $this->config['mysql']['password'] ?? '';
                        $charset = $this->config['mysql']['charset'] ?? 'utf8mb4';
                        
                        $dsn = "mysql:host={$host};port={$port};dbname={$database};charset={$charset}";
                        $this->pdo = new PDO($dsn, $username, $password, $this->config['mysql']['options'] ?? []);
                        break;
                        
                    case 'pgsql':
                        $host = $this->config['pgsql']['host'] ?? 'localhost';
                        $port = $this->config['pgsql']['port'] ?? '5432';
                        $database = $this->config['pgsql']['database'] ?? 'travel_platform';
                        $username = $this->config['pgsql']['username'] ?? 'postgres';
                        $password = $this->config['pgsql']['password'] ?? '';
                        $charset = $this->config['pgsql']['charset'] ?? 'utf8';
                        
                        $dsn = "pgsql:host={$host};port={$port};dbname={$database};charset={$charset}";
                        $this->pdo = new PDO($dsn, $username, $password, $this->config['pgsql']['options'] ?? []);
                        
                        // 設置PostgreSQL特定選項
                        $this->pdo->exec("SET timezone = 'UTC'");
                        $this->pdo->exec("SET client_encoding = 'UTF8'");
                        break;
                        
                    default:
                        throw new PDOException("Unsupported database driver: {$driver}");
                }
                
                $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                $this->pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
                $this->pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
                
                $this->logger->info("Database connection established successfully using {$driver}");
                return;
                
            } catch (PDOException $e) {
                $attempt++;
                $this->logger->error("Database connection attempt {$attempt} failed: " . $e->getMessage());
                
                if ($attempt >= $this->maxRetries) {
                    throw new PDOException('Database connection failed after ' . $this->maxRetries . ' attempts: ' . $e->getMessage());
                }
                
                // 等待後重試
                usleep($this->retryDelay * 1000);
            }
        }
    }

    public function getConnection(): PDO
    {
        $this->connect();
        return $this->pdo;
    }

    public function isConnected(): bool
    {
        try {
            if ($this->pdo === null) {
                return false;
            }
            $this->pdo->query('SELECT 1');
            return true;
        } catch (PDOException $e) {
            return false;
        }
    }

    public function reconnect(): void
    {
        $this->pdo = null;
        $this->connect();
    }

    public function beginTransaction(): bool
    {
        $this->connect();
        return $this->pdo->beginTransaction();
    }

    public function commit(): bool
    {
        if ($this->pdo && $this->pdo->inTransaction()) {
            return $this->pdo->commit();
        }
        return false;
    }

    public function rollback(): bool
    {
        if ($this->pdo && $this->pdo->inTransaction()) {
            return $this->pdo->rollback();
        }
        return false;
    }

    public function query(string $sql, array $params = []): \PDOStatement
    {
        try {
            $this->connect();
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            $this->logger->error('Query failed: ' . $e->getMessage(), [
                'sql' => $sql,
                'params' => $params,
                'error_code' => $e->getCode()
            ]);
            
            // 如果是連接問題，嘗試重連
            if ($e->getCode() == '08000' || $e->getCode() == '08003') {
                $this->reconnect();
                return $this->query($sql, $params);
            }
            
            throw $e;
        }
    }

    public function fetchAll(string $sql, array $params = []): array
    {
        $stmt = $this->query($sql, $params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function fetchOne(string $sql, array $params = []): ?array
    {
        $stmt = $this->query($sql, $params);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ?: null;
    }

    public function fetchColumn(string $sql, array $params = [], int $column = 0): mixed
    {
        $stmt = $this->query($sql, $params);
        return $stmt->fetchColumn($column);
    }

    public function insert(string $table, array $data): string
    {
        $columns = implode(', ', array_keys($data));
        $placeholders = ':' . implode(', :', array_keys($data));
        
        $driver = $this->config['driver'] ?? 'sqlite';
        
        if ($driver === 'sqlite') {
            $sql = "INSERT INTO {$table} ({$columns}) VALUES ({$placeholders})";
            $this->query($sql, $data);
            return $this->pdo->lastInsertId();
        } else {
            // PostgreSQL 和 MySQL 使用 RETURNING
            $sql = "INSERT INTO {$table} ({$columns}) VALUES ({$placeholders}) RETURNING id";
            $stmt = $this->query($sql, $data);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result['id'];
        }
    }

    public function insertBatch(string $table, array $rows): array
    {
        if (empty($rows)) {
            return [];
        }

        $columns = array_keys($rows[0]);
        $placeholders = '(' . implode(', ', array_fill(0, count($columns), '?')) . ')';
        $values = array_fill(0, count($rows), $placeholders);
        
        $driver = $this->config['driver'] ?? 'sqlite';
        
        $params = [];
        foreach ($rows as $row) {
            $params = array_merge($params, array_values($row));
        }
        
        if ($driver === 'sqlite') {
            $sql = "INSERT INTO {$table} (" . implode(', ', $columns) . ") VALUES " . implode(', ', $values);
            $this->query($sql, $params);
            return [$this->pdo->lastInsertId()];
        } else {
            // PostgreSQL 和 MySQL 使用 RETURNING
            $sql = "INSERT INTO {$table} (" . implode(', ', $columns) . ") VALUES " . implode(', ', $values) . " RETURNING id";
            $stmt = $this->query($sql, $params);
            return $stmt->fetchAll(PDO::FETCH_COLUMN);
        }
    }

    public function update(string $table, array $data, string $where, array $whereParams = []): int
    {
        $setClause = implode(', ', array_map(fn($key) => "{$key} = :{$key}", array_keys($data)));
        
        $sql = "UPDATE {$table} SET {$setClause} WHERE {$where}";
        
        $params = array_merge($data, $whereParams);
        $stmt = $this->query($sql, $params);
        
        return $stmt->rowCount();
    }

    public function delete(string $table, string $where, array $params = []): int
    {
        $sql = "DELETE FROM {$table} WHERE {$where}";
        $stmt = $this->query($sql, $params);
        
        return $stmt->rowCount();
    }

    public function count(string $table, string $where = '1=1', array $params = []): int
    {
        $sql = "SELECT COUNT(*) as count FROM {$table} WHERE {$where}";
        $result = $this->fetchOne($sql, $params);
        
        return (int) $result['count'];
    }

    public function exists(string $table, string $where, array $params = []): bool
    {
        return $this->count($table, $where, $params) > 0;
    }

    public function rawQuery(string $sql): \PDOStatement
    {
        $this->connect();
        return $this->pdo->query($sql);
    }

    public function getLastInsertId(): string
    {
        $this->connect();
        return $this->pdo->lastInsertId();
    }

    public function getStats(): array
    {
        return [
            'connected' => $this->isConnected(),
            'in_transaction' => $this->pdo ? $this->pdo->inTransaction() : false,
            'server_version' => $this->pdo ? $this->pdo->getAttribute(PDO::ATTR_SERVER_VERSION) : null,
            'client_version' => $this->pdo ? $this->pdo->getAttribute(PDO::ATTR_CLIENT_VERSION) : null
        ];
    }

    public function __destruct()
    {
        if ($this->pdo && $this->pdo->inTransaction()) {
            $this->rollback();
        }
        $this->pdo = null;
    }
}
