<?php

namespace App\User\Domain\Interfaces;

use App\User\Domain\Entity\User;

interface TokenGeneratorInterface
{
    
    public function generate(User $user): string;
}
