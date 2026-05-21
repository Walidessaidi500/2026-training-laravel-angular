<?php

namespace App\Movement\Application\Services;

use App\Shared\Infrastructure\Services\MovementLogger;
use App\User\Domain\Interfaces\UserRepositoryInterface;
use App\Order\Domain\Interfaces\OrderRepositoryInterface;
use App\Movement\Application\Services\MovementDescriptor;
use App\Shared\Domain\ValueObject\Uuid;
use Illuminate\Http\Request;

class MovementRecorderService
{
    public function __construct(
        private MovementLogger $logger,
        private MovementDescriptor $descriptor,
        private UserRepositoryInterface $userRepository,
        private OrderRepositoryInterface $orderRepository
    ) {}

    public function preCheckOrderExisted(Request $request): void
    {
        if ($request->method() === 'POST' && str_contains($request->path(), 'orders/sync')) {
            $tableUuid = $request->input('table_uuid');
            if ($tableUuid) {
                try {
                    $existingOrder = $this->orderRepository->findByTable(Uuid::create($tableUuid), 'open');
                    $request->attributes->set('movement_order_existed', $existingOrder !== null);
                } catch (\Exception $e) {
                }
            }
        }
    }

    public function record(Request $request): void
    {
        $action = $this->descriptor->determineAction($request);
        
        if ($action === 'login' || str_contains($request->path(), 'movements')) {
            return;
        }

        $this->logger->log(
            $action,
            $this->descriptor->generateHumanDescription($request),
            $this->descriptor->determineResourceType($request),
            $this->descriptor->determineResourceId($request),
            $this->descriptor->extractSimplifiedChanges($request),
            $this->resolveWorker($request)
        );
    }

    private function resolveWorker(Request $request): ?array
    {
        $userUuid = $request->input('user_uuid') ?? $request->input('opened_by_user_uuid');
        
        if (!$userUuid) return null;

        try {
            $worker = $this->userRepository->findById(Uuid::create($userUuid));
            if ($worker) {
                return [
                    'id' => null, 
                    'name' => $worker->name(),
                    'email' => $worker->email()->value(),
                    'restaurant_id' => $worker->restaurantId()->value()
                ];
            }
        } catch (\Exception $e) {
        }

        return null;
    }
}