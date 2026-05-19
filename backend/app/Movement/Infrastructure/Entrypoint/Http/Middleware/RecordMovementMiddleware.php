<?php

namespace App\Movement\Infrastructure\Entrypoint\Http\Middleware;

use App\Movement\Application\Services\MovementRecorderService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RecordMovementMiddleware
{
    public function __construct(
        private MovementRecorderService $movementRecorder
    ) {}

    
    public function handle(Request $request, Closure $next): Response
    {
        $this->movementRecorder->preCheckOrderExisted($request);

        $response = $next($request);

        if ($response->isSuccessful() && in_array($request->method(), ['POST', 'PUT', 'DELETE', 'PATCH'])) {
            $this->movementRecorder->record($request);
        }

        return $response;
    }
}