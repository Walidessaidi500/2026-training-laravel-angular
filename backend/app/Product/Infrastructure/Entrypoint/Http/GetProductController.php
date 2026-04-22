<?php

namespace App\Product\Infrastructure\Entrypoint\Http;

use App\Product\Application\GetProduct\GetProduct;
use Illuminate\Http\JsonResponse;
use PhpParser\Node\Stmt\TryCatch;


class GetProductController{
    public function __construct(
        private GetProduct $getProduct,
    ){
    }

    public function __invoke(string $uuid): JsonResponse
    {
        try {
            $response = ($this->getProduct)($uuid);

            return new JsonResponse($response->toArray(), 200);
        } catch (\InvalidArgumentException $e){
            return new JsonResponse(['message' => $e->getMessage()], 404);
        }
    }
}