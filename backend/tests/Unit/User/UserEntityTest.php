<?php

namespace Tests\Unit\User;

use App\Shared\Domain\ValueObject\DomainDateTime;
use App\Shared\Domain\ValueObject\Email;
use App\User\Domain\Entity\User;
use PHPUnit\Framework\TestCase;

class UserEntityTest extends TestCase
{
    public function test_ddd_create_builds_entity_with_attributes_and_vos(): void
    {
        $email = Email::create('user@example.com');
        $name = 'Test User';
        $passwordHash = 'hashed';

        $user = User::dddCreate($email, $name, $passwordHash);

        $this->assertInstanceOf(User::class, $user);
        $this->assertMatchesRegularExpression(
            '/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i',
            $user->id()->value()
        );
        $this->assertSame($name, $user->name());
        $this->assertSame('user@example.com', $user->email()->value());
        $this->assertSame($passwordHash, $user->passwordHash());
        $this->assertInstanceOf(DomainDateTime::class, $user->createdAt());
        $this->assertInstanceOf(DomainDateTime::class, $user->updatedAt());
        $this->assertEquals($user->createdAt()->value()->getTimestamp(), $user->updatedAt()->value()->getTimestamp(), 1);
    }
}
