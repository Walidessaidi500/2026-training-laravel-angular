<?php

namespace App\Restaurant\Domain\Entity;

use App\Restaurant\Domain\ValueObject\LegalName;
use App\Restaurant\Domain\ValueObject\PasswordHash;
use App\Restaurant\Domain\ValueObject\RestaurantName;
use App\Restaurant\Domain\ValueObject\RestaurantTaxId;
use App\Shared\Domain\ValueObject\DomainDateTime;
use App\Shared\Domain\ValueObject\Email;
use App\Shared\Domain\ValueObject\Uuid;

class Restaurant
{
    private function __construct(
        private Uuid $id,
        private RestaurantName $name,
        private LegalName $legalName,
        private RestaurantTaxId $taxId,
        private Email $email,
        private PasswordHash $passwordHash,
        private DomainDateTime $createdAt,
        private DomainDateTime $updatedAt,
    ) {}

    public static function dddCreate(
        RestaurantName $name,
        LegalName $legalName,
        RestaurantTaxId $taxId,
        Email $email,
        PasswordHash $passwordHash,
    ): self {
        $now = DomainDateTime::now();

        return new self(
            Uuid::generate(),
            $name,
            $legalName,
            $taxId,
            $email,
            $passwordHash,
            $now,
            $now,
        );
    }

    public static function fromPersistence(
        string $id,
        string $name,
        string $legalName,
        string $taxId,
        string $email,
        string $passwordHash,
        \DateTimeImmutable $createdAt,
        \DateTimeImmutable $updatedAt,
    ): self {
        return new self(
            Uuid::create($id),
            RestaurantName::create($name),
            LegalName::create($legalName),
            RestaurantTaxId::create($taxId),
            Email::create($email),
            PasswordHash::create($passwordHash),
            DomainDateTime::create($createdAt),
            DomainDateTime::create($updatedAt),
        );
    }

    public function id(): Uuid
    {
        return $this->id;
    }

    public function name(): string
    {
        return $this->name->value();
    }

    public function legalName(): string
    {
        return $this->legalName->value();
    }

    public function taxId(): string
    {
        return $this->taxId->value();
    }

    public function email(): Email
    {
        return $this->email;
    }

    public function passwordHash(): string
    {
        return $this->passwordHash->value();
    }

    public function createdAt(): DomainDateTime
    {
        return $this->createdAt;
    }

    public function updatedAt(): DomainDateTime
    {
        return $this->updatedAt;
    }

    public function update(
        RestaurantName $name,
        LegalName $legalName,
        RestaurantTaxId $taxId,
        Email $email,
    ): void {
        $this->name = $name;
        $this->legalName = $legalName;
        $this->taxId = $taxId;
        $this->email = $email;
        $this->updatedAt = DomainDateTime::now();
    }
}
