<?php

namespace App\Providers;

use App\Family\Domain\Interfaces\FamilyRepositoryInterface;
use App\Family\Infrastructure\Persistence\Repositories\EloquentFamilyRepository;
use App\Product\Domain\Interfaces\ProductRepositoryInterface;
use App\Product\Infrastructure\Persistence\Repositories\EloquentProductRepository;
use App\Restaurant\Domain\Interfaces\RestaurantRepositoryInterface;
use App\Restaurant\Infrastructure\Persistence\Repositories\EloquentRestaurantRepository;
use App\Tax\Domain\Interfaces\TaxRepositoryInterface;
use App\Tax\Infrastructure\Persistence\Repositories\EloquentTaxRepository;
use App\User\Domain\Interfaces\PasswordHasherInterface;
use App\User\Domain\Interfaces\TokenGeneratorInterface;
use App\User\Domain\Interfaces\UserRepositoryInterface;
use App\User\Infrastructure\Persistence\Repositories\EloquentUserRepository;
use App\User\Infrastructure\Services\LaravelPasswordHasher;
use App\User\Infrastructure\Services\SanctumTokenGenerator;
use App\Table\Domain\Interfaces\TableRepositoryInterface;
use App\Zone\Domain\Interfaces\ZoneRepositoryInterface;
use App\Table\Infrastructure\Persistence\Repositories\EloquentTableRepository;
use App\Zone\Infrastructure\Persistence\Repositories\EloquentZoneRepository;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    
    public function register(): void
    {
        // User
        $this->app->bind(UserRepositoryInterface::class, EloquentUserRepository::class);
        $this->app->bind(PasswordHasherInterface::class, LaravelPasswordHasher::class);
        $this->app->bind(TokenGeneratorInterface::class, SanctumTokenGenerator::class);

        // Family
        $this->app->bind(FamilyRepositoryInterface::class, EloquentFamilyRepository::class);

        // Tax
        $this->app->bind(TaxRepositoryInterface::class, EloquentTaxRepository::class);

        // Product
        $this->app->bind(ProductRepositoryInterface::class, EloquentProductRepository::class);

        // Zone
        $this->app->bind(ZoneRepositoryInterface::class, EloquentZoneRepository::class);

        // Table
        $this->app->bind(TableRepositoryInterface::class, EloquentTableRepository::class);

        // Restaurant
        $this->app->bind(RestaurantRepositoryInterface::class, EloquentRestaurantRepository::class);
        $this->app->bind(\App\Restaurant\Domain\Interfaces\PasswordHasherInterface::class, \App\Restaurant\Infrastructure\Services\LaravelPasswordHasher::class);

        // Sale
        $this->app->bind(\App\Sale\Domain\Interfaces\SaleRepositoryInterface::class, \App\Sale\Infrastructure\Persistence\Repositories\EloquentSaleRepository::class);

        // Order
        $this->app->bind(\App\Order\Domain\Interfaces\OrderRepositoryInterface::class, \App\Order\Infrastructure\Persistence\Repositories\EloquentOrderRepository::class);
    }

    
    public function boot(): void
    {
        //
    }
}
