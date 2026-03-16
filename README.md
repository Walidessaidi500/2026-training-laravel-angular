# 2026 Training: Laravel + Angular Starter Kit

Este repositorio sirve como proyecto base para prácticas de desarrollo backend y frontend, con **Laravel 12** en el backend y **Angular 20** en el frontend.  

El objetivo es que los alumnos aprendan a trabajar con **arquitectura hexagonal** y **Domain-Driven Design (DDD)** desde el primer día.

---

## Índice

- [Estructura del proyecto](#estructura-del-proyecto)
  - [Backend (`backend/`)](#backend-backend)
  - [Frontend (`frontend/`)](#frontend-frontend)
  - [DbGate (cliente de base de datos)](#dbgate-cliente-de-base-de-datos)
- [Cómo empezar](#cómo-empezar)
- [Objetivos de aprendizaje](#objetivos-de-aprendizaje)
- [Buenas prácticas](#buenas-prácticas)
- [Estilo de código](#estilo-de-código)

---

## Estructura del proyecto

### Backend (`backend/`)

El backend sigue un enfoque **DDD + Hexagonal**, con cada dominio encapsulado bajo su propio namespace.  
El ejemplo que se muestra a continuación es para el dominio `User`.

```text
App/
└── User/
    ├── Domain/
    │   ├── Entity/
    │   ├── ValueObject/
    │   └── Interfaces/
    ├── Application/
    │   └── CreateUser.php
    └── Infrastructure/
        ├── Persistence/
        └── Entrypoint/Http/
```

Domain/ → lógica de negocio pura, entidades y value objects.
Interfaces/ → contratos del dominio (por ejemplo UserRepositoryInterface).
Application/ → casos de uso y handlers.
Infrastructure/ → adaptadores que conectan el dominio con el mundo externo: persistencia, HTTP, colas.
Entrypoint/Http/ → controladores o endpoints HTTP.

### Frontend (`frontend/`)

Proyecto **Angular 20**.  
Monta un cliente mínimo que consume la API del backend.  
Servido en **http://localhost:4200**.

### DbGate (cliente de base de datos)

Interfaz web para explorar y consultar la base MySQL del proyecto.  
Tras levantar los contenedores (`make start`), accede en:

- **URL:** [http://localhost:9051](http://localhost:9051)

La conexión **Training MySQL** queda preconfigurada por variables de entorno y apunta a la base `training` del servicio `db`.

---

## Cómo empezar

1. **Clonar el repositorio:**

   ```bash
   git clone <repo-url>
   cd 2026-training-laravel-angular
   ```

2. **Levantar los contenedores Docker:**

   ```bash
   make start
   ```

3. **Instalar dependencias backend:**

   ```bash
   make install-laravel   # solo si aún no existe el proyecto Laravel en backend/
   make install           # composer install
   ```

4. **Instalar frontend (solo si aún no existe el proyecto Angular en frontend/):**

   ```bash
   make install-frontend  # crea el proyecto Angular 20 en frontend/
   ```

5. **Migrar base de datos:**

   ```bash
   make db-migrate
   ```

6. **Frontend (Angular):** Al hacer `make start`, el contenedor `frontend` ya ejecuta `npm install && npm start`, así que Angular queda levantado y servido en **http://localhost:4200**. No hace falta arrancarlo a mano.

   Si prefieres ejecutar Angular en tu máquina en lugar del contenedor:

   ```bash
   cd frontend
   npm install
   npm start
   ```

---

## Objetivos de aprendizaje

- Comprender y aplicar **DDD**: separar Domain, Application e Infrastructure.
- Aprender a usar **repositorios e interfaces** para desacoplar dominio de la persistencia.
- Practicar la implementación de **casos de uso y handlers**.
- Exponer la lógica de negocio a través de **HTTP entrypoints** y mantener el dominio independiente del framework.
- Familiarizarse con **Docker**, **Composer** y **Node** en un flujo de desarrollo profesional.

---

## Buenas prácticas

- Programar contra **interfaces**, no implementaciones concretas.
- Evitar lógica de negocio en Controllers o Eloquent Models.
- Mantener los dominios **autocontenidos**, siguiendo la convención: `App/<Dominio>/{Domain, Application, Infrastructure}`.
- Escribir **tests** que dependan de la interfaz del dominio, no de la implementación concreta.

---

## Estilo de código

Para mantener un código consistente entre todos los colaboradores (humanos y IAs), se siguen estas pautas:

- **Backend (PHP):** PSR-12 y las recomendaciones de [Symfony Coding Standards](https://symfony.com/doc/current/contributing/code/standards.html).
- **Frontend (Angular):** [Angular Style Guide](https://angular.dev/style-guide).
- **Convenciones básicas**:
  - Una **clase por archivo**.
  - `camelCase` para variables y métodos, `PascalCase` para clases, `SCREAMING_SNAKE_CASE` para constantes.
  - Propiedades antes de los métodos; métodos públicos antes que protegidos y privados.
  - Imports (`use`) para todas las clases que no estén en el espacio de nombres actual.
- **Estructura y formato**:
  - Siempre usar paréntesis al instanciar clases (`new Foo()`).
  - En arrays multilínea, dejar **coma final** en cada elemento.
  - Añadir una línea en blanco antes de un `return` cuando mejore la legibilidad.
  - Evitar lógica compleja en una sola línea; preferir bloques claros con llaves siempre presentes.

Antes de subir cambios, se recomienda:

```bash
make test   # tests del backend (PHPUnit)
make lint   # formatear código PHP (Laravel Pint)
```
