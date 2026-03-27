<?php

namespace Database\Seeders;

use App\Family\Infrastructure\Persistence\Models\EloquentFamily;
use App\Product\Infrastructure\Persistence\Models\EloquentProduct;
use App\Restaurant\Infrastructure\Persistence\Models\EloquentRestaurant;
use App\Tax\Infrastructure\Persistence\Models\EloquentTax;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $restaurants = EloquentRestaurant::all();

        $products = [
            // Bebidas — IVA Reducido (10%)
            ['family' => 'Bebidas', 'tax_name' => 'IVA Reducido', 'name' => 'Agua mineral', 'price' => 150, 'stock' => 100],
            ['family' => 'Bebidas', 'tax_name' => 'IVA Reducido', 'name' => 'Coca-Cola', 'price' => 200, 'stock' => 80],
            ['family' => 'Bebidas', 'tax_name' => 'IVA Reducido', 'name' => 'Fanta Naranja', 'price' => 200, 'stock' => 60],
            ['family' => 'Bebidas', 'tax_name' => 'IVA Reducido', 'name' => 'Zumo de naranja', 'price' => 250, 'stock' => 50],
            ['family' => 'Bebidas', 'tax_name' => 'IVA Reducido', 'name' => 'Tónica', 'price' => 220, 'stock' => 40],

            // Cervezas — IVA General (21%)
            ['family' => 'Cervezas', 'tax_name' => 'IVA General', 'name' => 'Caña', 'price' => 180, 'stock' => 200],
            ['family' => 'Cervezas', 'tax_name' => 'IVA General', 'name' => 'Tercio', 'price' => 250, 'stock' => 150],
            ['family' => 'Cervezas', 'tax_name' => 'IVA General', 'name' => 'Jarra', 'price' => 350, 'stock' => 100],
            ['family' => 'Cervezas', 'tax_name' => 'IVA General', 'name' => 'Cerveza sin alcohol', 'price' => 200, 'stock' => 60],

            // Vinos — IVA General (21%)
            ['family' => 'Vinos', 'tax_name' => 'IVA General', 'name' => 'Copa de vino tinto', 'price' => 300, 'stock' => 80],
            ['family' => 'Vinos', 'tax_name' => 'IVA General', 'name' => 'Copa de vino blanco', 'price' => 300, 'stock' => 60],
            ['family' => 'Vinos', 'tax_name' => 'IVA General', 'name' => 'Botella Rioja Crianza', 'price' => 1400, 'stock' => 30],
            ['family' => 'Vinos', 'tax_name' => 'IVA General', 'name' => 'Botella Ribiera del Duero', 'price' => 1800, 'stock' => 20],

            // Cafés e Infusiones — IVA Reducido (10%)
            ['family' => 'Cafés e Infusiones', 'tax_name' => 'IVA Reducido', 'name' => 'Café solo', 'price' => 120, 'stock' => 200],
            ['family' => 'Cafés e Infusiones', 'tax_name' => 'IVA Reducido', 'name' => 'Café con leche', 'price' => 150, 'stock' => 200],
            ['family' => 'Cafés e Infusiones', 'tax_name' => 'IVA Reducido', 'name' => 'Cortado', 'price' => 130, 'stock' => 200],
            ['family' => 'Cafés e Infusiones', 'tax_name' => 'IVA Reducido', 'name' => 'Infusión', 'price' => 150, 'stock' => 100],

            // Entrantes — IVA Reducido (10%)
            ['family' => 'Entrantes', 'tax_name' => 'IVA Reducido', 'name' => 'Patatas bravas', 'price' => 550, 'stock' => 40],
            ['family' => 'Entrantes', 'tax_name' => 'IVA Reducido', 'name' => 'Croquetas caseras (6 uds)', 'price' => 700, 'stock' => 35],
            ['family' => 'Entrantes', 'tax_name' => 'IVA Reducido', 'name' => 'Tabla de quesos', 'price' => 950, 'stock' => 25],
            ['family' => 'Entrantes', 'tax_name' => 'IVA Reducido', 'name' => 'Ensalada mixta', 'price' => 650, 'stock' => 30],
            ['family' => 'Entrantes', 'tax_name' => 'IVA Reducido', 'name' => 'Jamón ibérico', 'price' => 1500, 'stock' => 15],

            // Carnes — IVA Reducido (10%)
            ['family' => 'Carnes', 'tax_name' => 'IVA Reducido', 'name' => 'Entrecot de ternera', 'price' => 1600, 'stock' => 20],
            ['family' => 'Carnes', 'tax_name' => 'IVA Reducido', 'name' => 'Solomillo a la pimienta', 'price' => 1800, 'stock' => 15],
            ['family' => 'Carnes', 'tax_name' => 'IVA Reducido', 'name' => 'Pollo al ajillo', 'price' => 1100, 'stock' => 25],
            ['family' => 'Carnes', 'tax_name' => 'IVA Reducido', 'name' => 'Costillas BBQ', 'price' => 1300, 'stock' => 20],

            // Pescados — IVA Reducido (10%)
            ['family' => 'Pescados', 'tax_name' => 'IVA Reducido', 'name' => 'Merluza a la plancha', 'price' => 1400, 'stock' => 18],
            ['family' => 'Pescados', 'tax_name' => 'IVA Reducido', 'name' => 'Lubina al horno', 'price' => 1600, 'stock' => 12],
            ['family' => 'Pescados', 'tax_name' => 'IVA Reducido', 'name' => 'Gambas al ajillo', 'price' => 1200, 'stock' => 20],
            ['family' => 'Pescados', 'tax_name' => 'IVA Reducido', 'name' => 'Calamares a la romana', 'price' => 900, 'stock' => 25],

            // Postres — IVA Reducido (10%)
            ['family' => 'Postres', 'tax_name' => 'IVA Reducido', 'name' => 'Tarta de queso', 'price' => 500, 'stock' => 20],
            ['family' => 'Postres', 'tax_name' => 'IVA Reducido', 'name' => 'Brownie con helado', 'price' => 550, 'stock' => 15],
            ['family' => 'Postres', 'tax_name' => 'IVA Reducido', 'name' => 'Helado (2 bolas)', 'price' => 400, 'stock' => 30],
            ['family' => 'Postres', 'tax_name' => 'IVA Reducido', 'name' => 'Flan casero', 'price' => 350, 'stock' => 25],
        ];

        foreach ($restaurants as $restaurant) {
            foreach ($products as $productData) {
                $familyName = $productData['family'];
                $taxName = $productData['tax_name'];
                unset($productData['family'], $productData['tax_name']);

                $family = EloquentFamily::where('restaurant_id', $restaurant->id)
                    ->where('name', $familyName)
                    ->first();

                $tax = EloquentTax::where('restaurant_id', $restaurant->id)
                    ->where('name', $taxName)
                    ->first();

                if ($family && $tax) {
                    EloquentProduct::factory()->create(array_merge($productData, [
                        'restaurant_id' => $restaurant->id,
                        'family_id' => $family->id,
                        'tax_id' => $tax->id,
                    ]));
                }
            }
        }
    }
}
