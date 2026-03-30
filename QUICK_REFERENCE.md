# 🗂️ Mapa Rápido: Estado de Implementación

## Backend: Estado por Dominio

```
┌─────────────────┬──────────┬────────────┬──────────┬────────────────────┐
│ Dominio         │ Domain   │ Application│ Infr.    │ Casos de Uso       │
├─────────────────┼──────────┼────────────┼──────────┼────────────────────┤
│ USER       ✅   │ ✅       │ ✅ (2)     │ ✅       │ CreateUser         │
│                 │          │            │          │ LoginUser          │
├─────────────────┼──────────┼────────────┼──────────┼────────────────────┤
│ FAMILY     ✅   │ ✅       │ ✅ (6)     │ ✅       │ Create, List, Get  │
│ (REFERENCIA)    │          │            │          │ Update, Delete     │
│                 │          │            │          │ ToggleActive       │
├─────────────────┼──────────┼────────────┼──────────┼────────────────────┤
│ PRODUCT    ✅   │ ✅       │ ✅ (7)     │ ✅       │ CRUD + Toggle      │
│                 │          │            │          │                    │
├─────────────────┼──────────┼────────────┼──────────┼────────────────────┤
│ RESTAURANT ✅   │ ✅       │ ✅ (5)     │ ✅       │ CRUD               │
│                 │          │            │          │                    │
├─────────────────┼──────────┼────────────┼──────────┼────────────────────┤
│ TAX        ✅   │ ✅       │ ✅ (5)     │ ✅       │ CRUD               │
│                 │          │            │          │                    │
├─────────────────┼──────────┼────────────┼──────────┼────────────────────┤
│ ZONE       ✅   │ ✅       │ ✅ (10)    │ ✅       │ Zone: CRUD         │
│ (2 entidades)   │          │            │          │ Table: CRUD        │
├─────────────────┼──────────┼────────────┼──────────┼────────────────────┤
│ ORDER      ⚠️   │ ❌       │ ❌         │ ✅       │ FALTA: 6+ casos    │
│ (INCOMPLETO)    │          │            │          │ Necesita refactor  │
├─────────────────┼──────────┼────────────┼──────────┼────────────────────┤
│ SALE       ⚠️   │ ❌       │ ❌         │ ✅       │ FALTA: 6+ casos    │
│ (INCOMPLETO)    │          │            │          │ Necesita refactor  │
├─────────────────┼──────────┼────────────┼──────────┼────────────────────┤
│ SHARED     ✅   │ Uuid     │   (N/A)    │   -      │ Email, DomainDTm   │
│                 │ Email    │            │          │ (VOs compartidos)  │
│                 │ DateTime │            │          │                    │
└─────────────────┴──────────┴────────────┴──────────┴────────────────────┘
```

## Backend: Estructura de archivos por Dominio

### Family (Patrón a Seguir) ✅
```
Family/
├── Domain/
│   ├── Entity/
│   │   └── Family.php
│   ├── Interfaces/
│   │   └── FamilyRepositoryInterface.php
│   └── ValueObject/
│       └── FamilyName.php
├── Application/
│   ├── CreateFamily/CreateFamily.php
│   ├── ListFamilies/ListFamilies.php
│   ├── GetFamily/GetFamily.php
│   ├── UpdateFamily/UpdateFamily.php
│   ├── DeleteFamily/DeleteFamily.php
│   ├── ToggleFamilyActive/ToggleFamilyActive.php
│   └── Shared/FamilyResponse.php
└── Infrastructure/
    ├── Entrypoint/Http/
    │   └── FamilyController.php
    └── Persistence/
        ├── Models/EloquentFamily.php
        └── Repositories/EloquentFamilyRepository.php
```

### Order (Antes vs. Después)

#### ❌ ACTUAL (INCOMPLETO)
```
Order/
├── Domain/
│   └── (VACÍO)
├── Application/
│   └── (NO EXISTE)
└── Infrastructure/
    ├── Entrypoint/Http/OrderController.php
    │   └── Depende directamente de EloquentOrderRepository ❌
    └── Persistence/
        ├── Models/EloquentOrder.php
        ├── Models/EloquentOrderLine.php
        └── Repositories/EloquentOrderRepository.php
```

#### ✅ REQUERIDO (Similar a Family)
```
Order/
├── Domain/
│   ├── Entity/
│   │   ├── Order.php (dddCreate, fromPersistence)
│   │   └── OrderLine.php
│   ├── Interfaces/
│   │   └── OrderRepositoryInterface.php
│   └── ValueObject/
│       └── (crear según necesidad)
├── Application/
│   ├── CreateOrder/CreateOrder.php
│   ├── ListOrders/ListOrders.php
│   ├── GetOrder/GetOrder.php
│   ├── UpdateOrder/UpdateOrder.php
│   ├── DeleteOrder/DeleteOrder.php
│   ├── CloseOrder/CloseOrder.php
│   └── Shared/OrderResponse.php
└── Infrastructure/
    ├── Entrypoint/Http/
    │   └── OrderController.php (refactorizado)
    └── Persistence/
        ├── Models/EloquentOrder.php
        ├── Models/EloquentOrderLine.php
        └── Repositories/
            └── EloquentOrderRepository.php (implementa OrderRepositoryInterface)
```

---

## Frontend: Estructura Implementada

```
frontend/src/app/
├── 📄 app.component.ts
├── app.routes.ts
├── 📁 pages/
│   ├── core/
│   │   ├── home/
│   │   ├── login/
│   │   └── register/
│   └── admin/
│       ├── admin.routes.ts
│       ├── dashboard/
│       │   └── dashboard.page.ts (usa todos los servicios)
│       └── layout/
│           └── admin-layout.component.ts
├── 📁 components/
│   ├── auth-card/
│   ├── button/
│   ├── card/
│   ├── stat-card/
│   └── index.ts
├── 📁 services/
│   ├── api/
│   │   └── base-api.service.ts
│   ├── auth/
│   │   └── auth.service.ts
│   └── domain/
│       ├── family.service.ts
│       ├── product.service.ts
│       ├── restaurant.service.ts
│       ├── tax.service.ts
│       ├── zone.service.ts
│       ├── table.service.ts
│       ├── order.service.ts
│       ├── sale.service.ts
│       └── user.service.ts
├── 📁 core/
│   └── guards/
│       └── guest.guard.ts
└── 📁 pipes/
```

### Páginas Implementadas vs. Faltantes

```
┌──────────────────┬──────────┬─────────────────────────────┐
│ Página           │ Estado   │ Ubicación                   │
├──────────────────┼──────────┼─────────────────────────────┤
│ Login            │ ✅       │ pages/core/login/           │
│ Register         │ ✅       │ pages/core/register/        │
│ Home             │ ✅       │ pages/core/home/            │
│ Dashboard        │ ✅       │ pages/admin/dashboard/      │
│ Admin Layout     │ ✅       │ pages/admin/layout/         │
├──────────────────┼──────────┼─────────────────────────────┤
│ Families CRUD    │ ❌       │ pages/admin/families/ (TODO)│
│ Products CRUD    │ ❌       │ pages/admin/products/ (TODO)│
│ Restaurants CRUD │ ❌       │ pages/admin/restaurants/    │
│ Zones CRUD       │ ❌       │ pages/admin/zones/          │
│ Tables CRUD      │ ❌       │ pages/admin/tables/         │
│ Users CRUD       │ ❌       │ pages/admin/users/          │
│ Orders CRUD      │ ❌       │ pages/admin/orders/         │
│ Sales CRUD       │ ❌       │ pages/admin/sales/          │
└──────────────────┴──────────┴─────────────────────────────┘
```

---

## Rutas HTTP: Vista Completa

### Públicas (2 rutas)
```
POST /users                 → Registro
POST /login                 → Login
```

### Protegidas por Dominio (70+ rutas)

#### Restaurantes (5)
```
GET    /restaurants
POST   /restaurants
GET    /restaurants/{uuid}
PUT    /restaurants/{uuid}
DELETE /restaurants/{uuid}
```

#### Familias (6)
```
GET    /families
POST   /families
GET    /families/{uuid}
PUT    /families/{uuid}
DELETE /families/{uuid}
PATCH  /families/{uuid}/toggle-active
```

#### Impuestos (5)
```
GET    /taxes
POST   /taxes
GET    /taxes/{uuid}
PUT    /taxes/{uuid}
DELETE /taxes/{uuid}
```

#### Productos (6)
```
GET    /products
POST   /products
GET    /products/{uuid}
PUT    /products/{uuid}
DELETE /products/{uuid}
PATCH  /products/{uuid}/toggle-active
```

#### Zonas (5)
```
GET    /zones
POST   /zones
GET    /zones/{uuid}
PUT    /zones/{uuid}
DELETE /zones/{uuid}
```

#### Mesas (5)
```
GET    /tables
POST   /tables
GET    /tables/{uuid}
PUT    /tables/{uuid}
DELETE /tables/{uuid}
```

#### Usuarios (6)
```
GET    /users
POST   /users-admin
GET    /users/{uuid}
PUT    /users/{uuid}
DELETE /users/{uuid}
PATCH  /users/{uuid}/toggle-active
```

#### Órdenes (6)
```
GET    /orders
POST   /orders
GET    /orders/{uuid}
PUT    /orders/{uuid}
DELETE /orders/{uuid}
POST   /orders/{uuid}/close
```

#### Ventas (6)
```
GET    /sales
POST   /sales
GET    /sales/{uuid}
PUT    /sales/{uuid}
DELETE /sales/{uuid}
POST   /sales/{uuid}/close
```

---

## Patrones DDD Observados

### ✅ CORRECTO (Dominios Family, Product, Restaurant, Tax, Zone)

#### 1. Entidad con Factory
```php
class Family {
    private function __construct(...) {}
    public static function dddCreate(FamilyName $name): self
    public static function fromPersistence(...): self
}
```

#### 2. Value Object Privado
```php
class FamilyName {
    private function __construct(private string $value) {}
    public static function create(string $value): self
    public function value(): string
}
```

#### 3. Interfaz de Repositorio
```php
interface FamilyRepositoryInterface {
    public function save(Family $family): void;
    public function find(string $uuid): ?Family;
}
```

#### 4. Caso de Uso Invocable
```php
class CreateFamily {
    public function __construct(private FamilyRepositoryInterface $repo) {}
    public function __invoke(string $name): FamilyResponse
}
```

#### 5. Response DTO
```php
class FamilyResponse {
    public static function create(Family $family): self
    public function toArray(): array
}
```

#### 6. Controlador Ligero
```php
class FamilyController {
    public function __construct(
        private FamilyRepositoryInterface $repo,
        private CreateFamily $createFamily,
        private GetFamily $getFamily,
        // ... más casos de uso
    ) {}
    
    public function store(Request $request): JsonResponse {
        $response = ($this->createFamily)($validated['name']);
        return new JsonResponse($response->toArray(), 201);
    }
}
```

### ❌ INCORRECTO (Order y Sale)

```php
// ❌ MALO - Dependencia directa de Eloquent
class OrderController {
    public function __construct(private EloquentOrderRepository $repo) {}
    public function show(string $uuid) {
        return $this->repo->find($uuid);  // Retorna array/Eloquent Model
    }
}

// ✅ CORRECTO
class OrderController {
    public function __construct(private OrderRepositoryInterface $repo) {}
    public function show(string $uuid) {
        $order = ($this->getOrder)($uuid);  // Usa caso de uso
        return new JsonResponse($order->toArray(), 200);
    }
}
```

---

## Estadísticas Rápidas

### Backend
| Métrica | Cantidad |
|---------|----------|
| Dominios Totales | 9 |
| Dominios Completos | 6 |
| Entidades | ~11 |
| Casos de Uso | 40+ |
| Controladores | 11 |
| Rutas HTTP | 70+ |
| VOs Compartidos | 3 (Uuid, Email, DateTime) |
| VOs Específicos | 15+ |

### Frontend
| Métrica | Cantidad |
|---------|----------|
| Componentes | 5+ |
| Servicios de Dominio | 9 |
| Servicios Base | 3 |
| Páginas Públicas | 3 |
| Páginas Admin | 2 |
| Guards | 1 |

### Completitud General
- Backend: **65% Completo** (Order y Sale faltan Domain/Application)
- Frontend: **40% Completo** (Falta páginas admin CRUD)
- **Global: ~55% Completo**

---

## Próximos Pasos Recomendados

### 🔴 CRÍTICO (2-3 días)
1. [ ] Completar Order Domain (copiar estructura Family)
2. [ ] Completar Sale Domain

### 🟡 IMPORTANTE (3-4 días)
3. [ ] Crear páginas admin CRUD para cada dominio
4. [ ] Implementar formularios de crear/editar
5. [ ] Añadir paginación y búsqueda

### 🟢 MEJORA (2-3 días)
6. [ ] Escribir tests (unitarios e integración)
7. [ ] Implementar roles y permisos
8. [ ] Mejorar validaciones

### ⚪ OPCIONAL Después
9. [ ] E2E tests
10. [ ] Documentación API (Swagger/OpenAPI)
11. [ ] Performance optimization
12. [ ] PWA features

---

## Archivos Clave para Comenzar

### Para copiar estructura (patrón Family)
- `backend/app/Family/Domain/Entity/Family.php`
- `backend/app/Family/Application/CreateFamily/CreateFamily.php`
- `backend/app/Family/Application/Shared/FamilyResponse.php`
- `backend/app/Family/Infrastructure/Entrypoint/Http/FamilyController.php`

### Para frontend
- `frontend/src/app/services/domain/family.service.ts`
- `frontend/src/app/pages/admin/dashboard/dashboard.page.ts`
- `frontend/src/app/components/`

### Importante verificar
- Routes: `backend/routes/api.php`
- Environment: `backend/.env` y `frontend/src/environments/`
- Sanctum config: `backend/config/sanctum.php`

---

## Tickets de Trabajo Sugeridos

### Ticket 1: Completar Order Domain
**Descripción**: Implementar Domain y Application layers para Order  
**Archivos**: 10 nuevos PHP  
**Patrón**: Copiar Family  
**Esfuerzo**: 4-6 horas  

### Ticket 2: Completar Sale Domain
**Descripción**: Implementar Domain y Application layers para Sale  
**Archivos**: 10 nuevos PHP  
**Patrón**: Copiar Family  
**Esfuerzo**: 4-6 horas  

### Ticket 3: Crear Admin Pages
**Descripción**: Implementar CRUD pages para familias, productos, etc.  
**Archivos**: 20+ archivos TypeScript  
**Patrón**: Basarse en servicios existentes  
**Esfuerzo**: 10-15 horas  

### Ticket 4: Tests Backend
**Descripción**: Unit + Integration tests  
**Archivos**: 20+ archivos PHP test  
**Cobertura Target**: 70%+  
**Esfuerzo**: 15-20 horas  

### Ticket 5: Tests Frontend
**Descripción**: Unit tests para servicios y componentes  
**Archivos**: 10+ archivos TypeScript spec  
**Cobertura Target**: 60%+  
**Esfuerzo**: 8-10 horas  

---

**Última actualización**: 30 Marzo 2026  
**Versión del análisis**: 1.0
