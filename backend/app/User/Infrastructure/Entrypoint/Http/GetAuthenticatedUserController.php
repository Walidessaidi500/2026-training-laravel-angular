<?php

namespace App\User\Infrastructure\Entrypoint\Http;

use App\User\Application\GetAuthenticatedUser\GetAuthenticatedUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetAuthenticatedUserController
{
    public function __invoke(Request $request, GetAuthenticatedUser $useCase): JsonResponse
    {
        $response = $useCase->execute($request->user());

        return response()->json($response->toArray());
    }
}
