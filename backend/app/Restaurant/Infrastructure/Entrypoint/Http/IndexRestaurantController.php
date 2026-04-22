<?php

namespace App\Restaurant\Infrastructure\Entrypoint\Http;

use App\Restaurant\Application\ListRestaurants\ListRestaurants;
use Illuminate\Http\JsonResponse;

class IndexRestaurantController
{
    public function __construct(
        private ListRestaurants $listRestaurants
    ){}

    public function __invoke():JsonResponse
    {
        $restaurants = ($this->listRestaurants)();

        return new JsonResponse($restaurants, 200);
    }
}