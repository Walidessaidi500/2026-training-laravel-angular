<?php

namespace App\Product\Infrastructure\Entrypoint\Http;

use App\Product\Application\DeleteProduct\DeleteProduct;
use Illuminate\Http\JsonResponse;

class DeleteProductController{
    public function __construct(
        private DeleteProduct $deleteProduct
    ){}

    public function __invoke(string $uuid):JsonResponse
    {
        try {
            ($this->deleteProduct)($uuid);

            return new JsonResponse(null, 204);
        } catch (\InvalidArgumentException $e){
            return new JsonResponse(['message' => $e->getMessage()], 404);
        }
    }
}