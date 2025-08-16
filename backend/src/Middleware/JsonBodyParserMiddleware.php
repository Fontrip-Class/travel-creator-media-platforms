<?php

namespace App\Middleware;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

class JsonBodyParserMiddleware implements MiddlewareInterface
{
    public function process(Request $request, RequestHandlerInterface $handler): Response
    {
        $contentType = $request->getHeaderLine('Content-Type');
        
        if (strpos($contentType, 'application/json') !== false) {
            $contents = $request->getBody()->getContents();
            if (!empty($contents)) {
                $jsonData = json_decode($contents, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $request = $request->withParsedBody($jsonData);
                }
            }
        }
        
        return $handler->handle($request);
    }
}
