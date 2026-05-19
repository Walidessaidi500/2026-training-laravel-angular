<?php

namespace App\Shared\Infrastructure\Services;

use App\User\Domain\Interfaces\UserRepositoryInterface;
use App\Family\Domain\Interfaces\FamilyRepositoryInterface;
use App\Tax\Domain\Interfaces\TaxRepositoryInterface;
use App\Table\Domain\Interfaces\TableRepositoryInterface;
use App\Zone\Domain\Interfaces\ZoneRepositoryInterface;
use App\Product\Domain\Interfaces\ProductRepositoryInterface;
use App\Shared\Domain\ValueObject\Uuid;

class EntityNameResolver
{
    public function __construct(
        private UserRepositoryInterface $userRepository,
        private FamilyRepositoryInterface $familyRepository,
        private TaxRepositoryInterface $taxRepository,
        private TableRepositoryInterface $tableRepository,
        private ZoneRepositoryInterface $zoneRepository,
        private ProductRepositoryInterface $productRepository
    ) {}

    public function resolveIdToName(string $key, $value)
    {
        if (!$value || !is_string($value) || strlen($value) < 20) {
            return $value;
        }

        try {
            $uuid = Uuid::create($value);
            
            if (in_array($key, ['family_id', 'family'])) {
                return ($entity = $this->familyRepository->findById($uuid)) ? $entity->name() : $value;
            }
            if (in_array($key, ['tax_id', 'tax'])) {
                return ($entity = $this->taxRepository->findById($uuid)) ? $entity->name() : $value;
            }
            if (in_array($key, ['table_id', 'table_uuid', 'joined_to_uuid', 'table'])) {
                return ($entity = $this->tableRepository->findById($uuid)) ? $entity->name() : $value;
            }
            if (in_array($key, ['zone_id', 'zone'])) {
                return ($entity = $this->zoneRepository->findById($uuid)) ? $entity->name() : $value;
            }
            if (in_array($key, ['user_id', 'user_uuid', 'opened_by_user_uuid', 'user'])) {
                return ($entity = $this->userRepository->findById($uuid)) ? $entity->name() : $value;
            }
            if (in_array($key, ['product_id', 'product'])) {
                return ($entity = $this->productRepository->findById($uuid)) ? $entity->name() : $value;
            }
        } catch (\Exception $e) {
            // Not a UUID or other error
        }

        return $value;
    }
}