<?php

namespace Database\Seeders;

use App\Family\Infrastructure\Persistence\Models\EloquentFamily;
use App\Product\Infrastructure\Persistence\Models\EloquentProduct;
use App\Tax\Infrastructure\Persistence\Models\EloquentTax;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $families = EloquentFamily::all()->keyBy('name');
        $taxes = EloquentTax::all()->keyBy('name');

        $ivaReducido = $taxes['IVA Reducido']->id;
        $ivaGeneral = $taxes['IVA General']->id;

        $products = [
            // Bebidas — IVA Reducido (10%)
            ['family' => 'Bebidas', 'tax_id' => $ivaReducido, 'name' => 'Agua mineral', 'price' => 150, 'stock' => 100],
            ['family' => 'Bebidas', 'tax_id' => $ivaReducido, 'name' => 'Coca-Cola', 'price' => 200, 'stock' => 80],
            ['family' => 'Bebidas', 'tax_id' => $ivaReducido, 'name' => 'Fanta Naranja', 'price' => 200, 'stock' => 60],
            ['family' => 'Bebidas', 'tax_id' => $ivaReducido, 'name' => 'Zumo de naranja', 'price' => 250, 'stock' => 50],
            ['family' => 'Bebidas', 'tax_id' => $ivaReducido, 'name' => 'Tónica', 'price' => 220, 'stock' => 40],

            // Cervezas — IVA General (21%)
            ['family' => 'Cervezas', 'tax_id' => $ivaGeneral, 'name' => 'Caña', 'price' => 180, 'stock' => 200],
            ['family' => 'Cervezas', 'tax_id' => $ivaGeneral, 'name' => 'Tercio', 'price' => 250, 'stock' => 150],
            ['family' => 'Cervezas', 'tax_id' => $ivaGeneral, 'name' => 'Jarra', 'price' => 350, 'stock' => 100],
            ['family' => 'Cervezas', 'tax_id' => $ivaGeneral, 'name' => 'Cerveza sin alcohol', 'price' => 200, 'stock' => 60],

            // Vinos — IVA General (21%)
            ['family' => 'Vinos', 'tax_id' => $ivaGeneral, 'name' => 'Copa de vino tinto', 'price' => 300, 'stock' => 80],
            ['family' => 'Vinos', 'tax_id' => $ivaGeneral, 'name' => 'Copa de vino blanco', 'price' => 300, 'stock' => 60],
            ['family' => 'Vinos', 'tax_id' => $ivaGeneral, 'name' => 'Botella Rioja Crianza', 'price' => 1400, 'stock' => 30],
            ['family' => 'Vinos', 'tax_id' => $ivaGeneral, 'name' => 'Botella Ribera del Duero', 'price' => 1800, 'stock' => 20],

            // Cafés e Infusiones — IVA Reducido (10%)
            ['family' => 'Cafés e Infusiones', 'tax_id' => $ivaReducido, 'name' => 'Café solo', 'price' => 120, 'stock' => 200],
            ['family' => 'Cafés e Infusiones', 'tax_id' => $ivaReducido, 'name' => 'Café con leche', 'price' => 150, 'stock' => 200],
            ['family' => 'Cafés e Infusiones', 'tax_id' => $ivaReducido, 'name' => 'Cortado', 'price' => 130, 'stock' => 200],
            ['family' => 'Cafés e Infusiones', 'tax_id' => $ivaReducido, 'name' => 'Infusión', 'price' => 150, 'stock' => 100],

            // Entrantes — IVA Reducido (10%)
            ['family' => 'Entrantes', 'tax_id' => $ivaReducido, 'name' => 'Patatas bravas', 'price' => 550, 'stock' => 40],
            ['family' => 'Entrantes', 'tax_id' => $ivaReducido, 'name' => 'Croquetas caseras (6 uds)', 'price' => 700, 'stock' => 35],
            ['family' => 'Entrantes', 'tax_id' => $ivaReducido, 'name' => 'Tabla de quesos', 'price' => 950, 'stock' => 25],
            ['family' => 'Entrantes', 'tax_id' => $ivaReducido, 'name' => 'Ensalada mixta', 'price' => 650, 'stock' => 30],
            ['family' => 'Entrantes', 'tax_id' => $ivaReducido, 'name' => 'Jamón ibérico', 'price' => 1500, 'stock' => 15],

            // Carnes — IVA Reducido (10%)
            ['family' => 'Carnes', 'tax_id' => $ivaReducido, 'name' => 'Entrecot de ternera', 'price' => 1600, 'stock' => 20],
            ['family' => 'Carnes', 'tax_id' => $ivaReducido, 'name' => 'Solomillo a la pimienta', 'price' => 1800, 'stock' => 15],
            ['family' => 'Carnes', 'tax_id' => $ivaReducido, 'name' => 'Pollo al ajillo', 'price' => 1100, 'stock' => 25],
            ['family' => 'Carnes', 'tax_id' => $ivaReducido, 'name' => 'Costillas BBQ', 'price' => 1300, 'stock' => 20],

            // Pescados — IVA Reducido (10%)
            ['family' => 'Pescados', 'tax_id' => $ivaReducido, 'name' => 'Merluza a la plancha', 'price' => 1400, 'stock' => 18],
            ['family' => 'Pescados', 'tax_id' => $ivaReducido, 'name' => 'Lubina al horno', 'price' => 1600, 'stock' => 12],
            ['family' => 'Pescados', 'tax_id' => $ivaReducido, 'name' => 'Gambas al ajillo', 'price' => 1200, 'stock' => 20],
            ['family' => 'Pescados', 'tax_id' => $ivaReducido, 'name' => 'Calamares a la romana', 'price' => 900, 'stock' => 25],

            // Postres — IVA Reducido (10%)
            ['family' => 'Postres', 'tax_id' => $ivaReducido, 'name' => 'Tarta de queso', 'price' => 500, 'stock' => 20],
            ['family' => 'Postres', 'tax_id' => $ivaReducido, 'name' => 'Brownie con helado', 'price' => 550, 'stock' => 15],
            ['family' => 'Postres', 'tax_id' => $ivaReducido, 'name' => 'Helado (2 bolas)', 'price' => 400, 'stock' => 30],
            ['family' => 'Postres', 'tax_id' => $ivaReducido, 'name' => 'Flan casero', 'price' => 350, 'stock' => 25],
        ];

        foreach ($products as $productData) {
            $familyName = $productData['family'];
            unset($productData['family']);

            EloquentProduct::factory()->create(array_merge($productData, [
                'family_id' => $families[$familyName]->id,
            ]));
        }
    }
}
