<?php

namespace App\Helpers;

class AccessCodeHelper
{
    public static function generateCode($prefix = 'JRNL')
    {
        return $prefix . '-' . mt_rand(1000, 9999);
    }
}
