<?php

namespace Tests\Unit\User;

use App\User\Application\CreateUser\CreateUser;
use App\User\Application\CreateUser\CreateUserResponse;
use App\User\Domain\Entity\User;
use App\User\Domain\Interfaces\PasswordHasherInterface;
use App\User\Domain\Interfaces\UserRepositoryInterface;
use Mockery;
use PHPUnit\Framework\TestCase;

class CreateUserTest extends TestCase
{
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_invoke_creates_user_saves_via_repository_and_returns_response(): void
    {
        $repository = Mockery::mock(UserRepositoryInterface::class);
        $passwordHasher = Mockery::mock(PasswordHasherInterface::class);

        $passwordHasher->shouldReceive('hash')
            ->once()
            ->with('plain-password')
            ->andReturn('hashed');

        $repository->shouldReceive('save')
            ->once()
            ->with(Mockery::on(function (User $user) {
                return $user->email()->value() === 'create@example.com'
                    && $user->name() === 'Create User'
                    && $user->passwordHash() === 'hashed';
            }));

        $createUser = new CreateUser($repository, $passwordHasher);
        $response = $createUser('create@example.com', 'Create User', 'plain-password');

        $this->assertInstanceOf(CreateUserResponse::class, $response);
        $this->assertSame('create@example.com', $response->email);
        $this->assertSame('Create User', $response->name);
        $this->assertMatchesRegularExpression(
            '/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i',
            $response->id
        );
        $array = $response->toArray();
        $this->assertArrayHasKey('created_at', $array);
        $this->assertArrayHasKey('updated_at', $array);
    }
}
