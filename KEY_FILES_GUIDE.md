# 📂 Ficheros Clave: Guía de Lectura

## 📖 Lectura Recomendada (en orden)

### 1. Entender la Estructura General (5 min)
```
AGENTS.md                    ← Convenciones y reglas del proyecto
QUICK_REFERENCE.md           ← Este documento: mapas rápidos
PROJECT_STRUCTURE_ANALYSIS.md ← Análisis exhaustivo (puedes volver aquí)
DATA_MODEL.md                ← Modelo de datos (si existe)
```

### 2. Patrones Backend - Dominio Completo (15 min)
Sigue el código de Family (es el patrón a seguir):

```
backend/app/Family/Domain/Entity/Family.php
├─ Observa: dddCreate(), fromPersistence(), getters
└─ Nota: constructor privado, propiedades immutables

backend/app/Family/Domain/ValueObject/FamilyName.php
├─ Observa: constructor privado, create() estático
└─ Nota: validación en constructor

backend/app/Family/Domain/Interfaces/FamilyRepositoryInterface.php
├─ Observa: contrato del repositorio
└─ Nota: retorna entidades, no arrays

backend/app/Family/Application/CreateFamily/CreateFamily.php
├─ Observa: invocable, inyecta interfaz
└─ Nota: orquesta dominio, retorna Response DTO

backend/app/Family/Application/Shared/FamilyResponse.php
├─ Observa: DTO con toArray()
└─ Nota: serialización centralizada

backend/app/Family/Infrastructure/Entrypoint/Http/FamilyController.php
├─ Observa: inyecta casos de uso, NO lógica de negocio
└─ Nota: válida entrada, llama caso de uso, retorna JSON

backend/app/Family/Infrastructure/Persistence/Models/EloquentFamily.php
├─ Observa: modelo Eloquent básico
└─ Nota: solo usado por repositorio

backend/app/Family/Infrastructure/Persistence/Repositories/EloquentFamilyRepository.php
├─ Observa: implementa FamilyRepositoryInterface
└─ Nota: mapea Eloquent ↔ Entidad
```

### 3. Código Compartido (5 min)

```
backend/app/Shared/Domain/ValueObject/Uuid.php
├─ UUID generación y validación
└─ Usada en TODAS las entidades

backend/app/Shared/Domain/ValueObject/Email.php
├─ Email validación
└─ Usada en User y Restaurant

backend/app/Shared/Domain/ValueObject/DomainDateTime.php
├─ DateTimeImmutable wrapper
└─ Usada en TODAS las entidades para timestamps
```

### 4. Problemas a Evitar - Dominios Incompletos (5 min)

```
❌ VISTA ACTUAL (Order + Sale):
backend/app/Order/Infrastructure/Entrypoint/Http/OrderController.php
├─ Problema: Depende de EloquentOrderRepository directamente
├─ Problema: Sin casos de uso
└─ Problema: Sin entidad Domain

✅ DEBERÍA SER (como Family):
backend/app/Order/Domain/Entity/Order.php
backend/app/Order/Domain/Interfaces/OrderRepositoryInterface.php
backend/app/Order/Application/CreateOrder/CreateOrder.php
backend/app/Order/Application/Shared/OrderResponse.php
└─ THEN refactor OrderController
```

### 5. Frontend - Autenticación (5 min)

```
frontend/src/app/services/auth/auth.service.ts
├─ login() y register() llaman a API
├─ Token almacenado en localStorage
├─ BehaviorSubject para estado reactivo
└─ Observable isAuthenticated$ para guards

frontend/src/app/core/guards/guest.guard.ts
├─ Protege rutas públicas
└─ Redirige a dashboard si está autenticado

frontend/src/app/providers/interceptor.ts (o http.interceptor.ts)
├─ Añade token a headers automáticamente
└─ Prefija URL base de API
```

### 6. Frontend - Servicios de Dominio (5 min)

```
frontend/src/app/services/domain/family.service.ts
├─ Patrón genérico: list(), get(), create(), update(), delete(), toggle()
├─ Tipado con interfaces
└─ Usa HttpClient inyectado

frontend/src/app/services/domain/product.service.ts
├─ Idéntico a family.service
└─ Cambia solo la URL

frontend/src/app/services/api/base-api.service.ts
├─ Cliente HTTP base
└─ Puede extenderse con métodos compartidos
```

### 7. Frontend - Páginas Existentes (5 min)

```
frontend/src/app/pages/core/login/login.page.ts
├─ Inyecta AuthService
├─ Formulario reactivo
└─ Navega a /admin/dashboard tras login

frontend/src/app/pages/core/register/register.page.ts
├─ Inyecta AuthService
├─ Validación de confirmación password
└─ Navega a /admin/dashboard tras registro

frontend/src/app/pages/admin/dashboard/dashboard.page.ts
├─ ✅ Implementado con StatCard
├─ ❌ Queda vacío porque no hay ABM pages
└─ TODO: Añadir tablas/listados
```

---

## 🔍 Checklist: Qué Revisar Antes de Codificar

### Backend: Completar Order Domain

- [ ] Leer `backend/app/Family/Domain/Entity/Family.php` (patrón exacto)
- [ ] Copiar estructura a `backend/app/Order/Domain/Entity/Order.php`
- [ ] Adaptaciones: Order tiene más atributos (date, user_id, restaurant_id, etc)
- [ ] Crear `backend/app/Order/Domain/ValueObject/` (si necesitas VOs específicos)
- [ ] Crear `backend/app/Order/Domain/Interfaces/OrderRepositoryInterface.php`
- [ ] Copiar `backend/app/Family/Application/CreateFamily/` a `backend/app/Order/Application/CreateOrder/`
- [ ] Adaptar para Order (parámetros específicos)
- [ ] Crear `backend/app/Order/Application/Shared/OrderResponse.php`
- [ ] Refactorizar `backend/app/Order/Infrastructure/Entrypoint/Http/OrderController.php`
  - Inyectar OrderRepositoryInterface (NO EloquentOrderRepository)
  - Inyectar todos los casos de uso
  - Usar ($this->createOrder)(...) en lugar de $this->repo->...
- [ ] Refactorizar `backend/app/Order/Infrastructure/Persistence/Repositories/EloquentOrderRepository.php`
  - Implementar `implements OrderRepositoryInterface`
  - Cambiar tipo de retorno de métodos
  
**Pasos idénticos para SALE**

### Frontend: Crear Admin Pages

- [ ] Analizar `frontend/src/app/pages/admin/dashboard/dashboard.page.ts` (estructura Ionic/Angular)
- [ ] Crear `frontend/src/app/pages/admin/families/`
  - `families.routes.ts`
  - `list/list.page.ts` (tabla con paginación)
  - `create-edit/create-edit.page.ts` (formulario)
- [ ] Usar `FamilyService` inyectado para CRUD
- [ ] Usar componentes existentes (Card, Button)
- [ ] Repetir para Products, Restaurants, Users, etc.

### Testing

- [ ] Leer cómo están estructurados los tests (buscar en `/tests`)
- [ ] Crear `backend/tests/Unit/Family/Application/CreateFamilyTest.php` como patrón
- [ ] Tests para Order y Sale al completar

---

## 📍 Ubicaciones Críticas

### Rutas
```
backend/routes/api.php

Cambios necesarios:
- Añadir imports para Order/Application casos de uso
- Asegurar que OrderController usa casos de uso (cuando refactoricemos)
```

### Configuración de Autenticación
```
backend/config/sanctum.php
backend/config/auth.php

Se usa:
- Sanctum para tokens
- Guard 'sanctum' en rutas protegidas
```

### Environment
```
backend/.env
- APP_KEY debe estar seteado
- DB_* configurado para MySQL
- SANCTUM_STATEFUL_DOMAINS

frontend/src/environments/environment.ts
- apiUrl apunta a http://localhost:8000
```

### Providers (DI)
```
backend/app/Providers/AppServiceProvider.php

Donde se registran:
- Binding de interfaces a implementaciones concretas
- Ej: bind(PasswordHasherInterface::class, LaravelPasswordHasher::class)

Verificar que todos los servicios estén registrados
```

---

## 🚀 Comandos Útiles

### Backend
```bash
# Desde backend/
php artisan migrate           # Ejecutar migraciones
php artisan tinker            # REPL para probar código
php artisan route:list        # Ver todas las rutas
php artisan cache:clear       # Limpiar caché

# Testing
php artisan test              # Ejecutar tests
php artisan test --coverage   # Con cobertura

# Code style
./vendor/bin/pint             # Laravel formatter
```

### Frontend
```bash
# Desde frontend/
npm install               # Instalar dependencies
ng serve                  # Dev server (4200)
ng generate component ...  # Crear componente
ng build                  # Build para producción
ng test                   # Tests
npm run lint              # ESLint
```

### Docker
```bash
# Desde raíz
make start                # Levantar todo
make install              # composer install + npm install
make db-migrate           # Migraciones
make test                 # Tests backend
make restart              # Reiniciar
```

---

## 📊 Matriz de Decisión: ¿Qué Revisar?

| Necesidad | Archivo | Tiempo |
|-----------|---------|--------|
| Entender DDD en el proyecto | AGENTS.md + Family domain | 20 min |
| Completar Order | Family como referencia + AGENTS.md | 2-3 días |
| Crear admin pages | Dashboard + FamilyService como referencia | 2-3 días |
| Tests | /tests existentes (si hay) + ejemplos | 1-2 días |
| Desplegar | docker-compose.yml + Makefile + .env | 1 día |

---

## 🎯 Tareas por Prioridad

### Now (Esta semana)
1. [ ] Leer PROJECT_STRUCTURE_ANALYSIS.md (120 min)
2. [ ] Completar Order domain (copiar Family) (4-6 horas)
3. [ ] Completar Sale domain (4-6 horas)
4. [ ] Refactorizar OrderController y SaleController (2 horas)

### Next (Próxima semana)
5. [ ] Crear paginas admin CRUD (10-15 horas)
6. [ ] Tests unitarios backend (10 horas)
7. [ ] Tests frontend (5 horas)

### Later (Si hay tiempo)
8. [ ] Roles y permisos
9. [ ] Documentación API
10. [ ] E2E tests

---

## 💡 Tips de Desarrollo

### PHP/Laravel
- Los casos de uso usan `__invoke()` para ser "callables": `($useCase)($param)`
- Destructores en constructores de casos de uso para inyección limpia
- Excepciones personalizadas para errores de dominio
- Repositories retornan entidades, NO Eloquent models

### TypeScript/Angular
- Servicios inyectables con `providedIn: 'root'`
- Interfaces para tipado de respuestas HTTP
- Observables en servicios, suscripción en componentes
- Validators para formularios reactivos
- Standalone components con imports explícitos

### Errores Comunes a Evitar
```
❌ class OrderController {
    constructor(private EloquentOrderRepository $repo) {}  // Directo Eloquent
}

✅ class OrderController {
    constructor(
        private OrderRepositoryInterface $repo,      // Interfaz
        private CreateOrder $createOrder,             // Caso de uso
    ) {}
}

❌ Email::create(...) // Email no tiene create() si no está bien definido
✅ Email::create(...) // Create() siempre en VOs, constructor privado

❌ new Family(...)     // Instancia con new
✅ Family::dddCreate() // Factory method en entidades
```

---

## 🔗 Referencias Rápidas

### Donde encontrar cada cosa

**Order Domain (a crear)**:
```
Patrón: backend/app/Family/
Crear: backend/app/Order/Domain/Entity/Order.php
        backend/app/Order/Domain/Interfaces/OrderRepositoryInterface.php
        backend/app/Order/Application/<CasoDeUso>/
        backend/app/Order/Application/Shared/OrderResponse.php
```

**Admin Pages (a crear)**:
```
Patrón: frontend/src/app/pages/admin/dashboard/
Crear: frontend/src/app/pages/admin/families/
        frontend/src/app/pages/admin/products/
        ... (una carpeta por dominio)
```

**Shared (ya existe, usar)**:
```
backend/app/Shared/Domain/ValueObject/Uuid.php
backend/app/Shared/Domain/ValueObject/Email.php
backend/app/Shared/Domain/ValueObject/DomainDateTime.php
```

---

## ⏱️ Tiempo Estimado Total

- Leer documentación: 2-3 horas
- Completar Order + Sale: 8-12 horas
- Admin pages frontend: 10-15 horas
- Tests: 10-15 horas
- **Total: 30-45 horas (~1 semana)**

---

Última actualización: 30 Marzo 2026
