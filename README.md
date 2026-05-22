# 2026 Training: Laravel + Angular Starter Kit

Este repositorio sirve como proyecto base para prácticas de desarrollo backend y frontend, con **Laravel 12** en el backend y **Angular + Ionic** en el frontend.


---

## Índice

- [2026 Training: Laravel + Angular Starter Kit](#2026-training-laravel--angular-starter-kit)
  - [Índice](#índice)
  - [Prerrequisitos](#prerrequisitos)
  - [Cómo empezar](#cómo-empezar)
  - [Estructura del proyecto](#estructura-del-proyecto)
    - [Backend (`backend/`)](#backend-backend)
    - [Frontend (`frontend/`)](#frontend-frontend)
    - [DbGate (cliente de base de datos)](#dbgate-cliente-de-base-de-datos)
  - [Sobre el Proyecto](#sobre-el-proyecto)
    - [Funcionalidades principales:](#funcionalidades-principales)
  - [Usuarios de Prueba (Restaurante: Los Gomez)](#usuarios-de-prueba-restaurante-los-gomez)
    - [Acceso al Backoffice (Administración)](#acceso-al-backoffice-administración)
    - [Acceso al TPV (Terminal Punto de Venta)](#acceso-al-tpv-terminal-punto-de-venta)

---

## Prerrequisitos

Para seguir esta guía necesitas tener instalado en tu máquina:

- **Docker** (y Docker Compose), para levantar la API, el frontend, la base de datos y DbGate. Sin Docker no podrás ejecutar `make start` ni el resto de comandos que dependen de los contenedores.
- **Make** (GNU Make), para usar los objetivos del `Makefile` (`make start`, `make install`, `make db-migrate`, etc.).
- **Git**, para clonar el repositorio.

---

## Cómo empezar

1. **Clonar el repositorio:**

   ```bash
   git clone <repo-url>
   cd 2026-training-laravel-angular
   ```

2. **Configurar entorno backend (solo la primera vez):** copiar el archivo de ejemplo:

   ```bash
   cp backend/.env.example backend/.env
   ```

3. **Levantar los contenedores Docker:**

   ```bash
   make start
   ```

4. **Instalar dependencias backend, migrar la base de datos y generar clave de aplicación:**

   ```bash
   make install   # composer install + migraciones (requiere que los contenedores estén levantados: make start)
   docker compose run --rm api php artisan key:generate
   ```

   Si el contenedor `api` no quedó en marcha, vuelve a levantar: `make start`.

5. **Frontend (Angular):** El repositorio ya incluye el proyecto en `frontend/`. Con `make start` el contenedor levanta la app automáticamente. Para desarrollo en primer plano con live reload: `make serve-frontend`.

Tras seguir estos pasos tendrás:

- **API (Laravel):** [http://localhost:8000](http://localhost:8000)
- **Frontend (Angular):** [http://localhost:4200](http://localhost:4200)
- **DbGate (MySQL):** [http://localhost:9051](http://localhost:9051) (conexión **Training MySQL** preconfigurada)

---

## Estructura del proyecto

### Backend (`backend/`)

El backend sigue un enfoque **DDD + Hexagonal**, con cada dominio encapsulado bajo su propio namespace dentro de `app/`.

```text
backend/app/
├── <Domain>/          # Ejemplos: User, Product, Sale, Movement...
│   ├── Application/   # Casos de uso y handlers
│   ├── Domain/        # Lógica de negocio pura (Entidades, Value Objects, Interfaces)
│   └── Infrastructure/# Adaptadores (Persistencia, Entrypoints HTTP, Repositorios)
├── Shared/            # Dominio compartido para lógica transversal
└── Providers/         # Service Providers del framework Laravel
```

**Dominios actuales:** `Family`, `Movement`, `Order`, `Product`, `Restaurant`, `Sale`, `Table`, `Tax`, `User`, `Zone`.

| Carpeta | Descripción |
|---------|-------------|
| **Domain/** | Lógica de negocio pura, entidades y value objects. |
| **Application/** | Casos de uso que orquestan la lógica del dominio. |
| **Infrastructure/** | Adaptadores que conectan el dominio con el mundo externo (Base de datos, API REST). |
| **Shared/** | Código reutilizable por múltiples dominios para evitar duplicación. |

### Frontend (`frontend/`)

Proyecto **Angular + Ionic** utilizando **Standalone Components** y una arquitectura modular.

```text
frontend/src/app/
├── core/              # Singleton services, interceptors, guards y facades
├── pages/             # Páginas de la aplicación organizadas por módulos:
│   ├── admin/         # Gestión administrativa
│   ├── auth/          # Autenticación y Login
│   ├── pda/           # Interfaz para dispositivos móviles (PDA)
│   ├── supervisor/    # Panel de supervisión
│   └── tpv/           # Terminal Punto de Venta (POS)
└── shared/            # Recursos compartidos (Features, Pipes, UI components)
```

| Carpeta | Descripción |
|---------|-------------|
| **core/** | Lógica central del sistema que debe estar disponible globalmente. |
| **pages/** | Vistas principales de la aplicación divididas por contexto de uso. |
| **shared/** | Componentes UI, pipes y lógica compartida entre diferentes páginas. |
| **facades/** | (Dentro de core) Abstracción para simplificar el acceso a servicios y estado. |

### DbGate (cliente de base de datos)

Interfaz web para explorar y consultar la base MySQL. La conexión **Training MySQL** queda preconfigurada y apunta a la base `training` del servicio `db`.

---

## Sobre el Proyecto

Este proyecto es un **Sistema de Punto de Venta (TPV/POS)** diseñado específicamente para el sector de la restauración. Permite gestionar de manera integral el flujo de trabajo de un restaurante, desde la organización física del local hasta el cierre de ventas y control de inventario.

### Funcionalidades principales:
- **Gestión Multi-Restaurante:** Soporte para múltiples establecimientos con configuraciones independientes.
- **Distribución de Mesa y Zonas:** Organización del local por zonas (ej. Terraza, Comedor) y gestión de mesas.
- **Catálogo de Productos:** Gestión de categorías (Familias), productos, precios e impuestos (IVA).
- **Gestión de Comandas:** Toma de pedidos (Orders) y líneas de pedido en tiempo real.
- **Proceso de Venta:** Conversión de comandas en ventas finales (Sales) con diversos métodos de pago.
- **Control de Movimientos:** Registro de movimientos de stock y auditoría.
- **Arquitectura Robusta:** Backend con Laravel siguiendo principios DDD y Hexagonal, y Frontend con Angular + Ionic para una experiencia multiplataforma (Web y Móvil).

---

## Usuarios de Prueba (Restaurante: Los Gomez)

Para facilitar las pruebas, a continuación se detallan las credenciales de acceso para el restaurante **"Los Gomez"**.

### Acceso al Backoffice (Administración)
Utiliza estas credenciales para acceder al panel de gestión (backend/admin).
- **Usuario:** `admin@yurest.com`
- **Contraseña:** `password`

### Acceso al TPV (Terminal Punto de Venta)
Para entrar al TPV, primero se identifica el establecimiento y luego el empleado mediante su PIN.

**1. Identificación del Restaurante:**
- **Email:** `losgomez@yurest.com`
- **Contraseña:** `password`

**2. Empleados Disponibles (Acceso por PIN):**

| Rol | Empleado | Email (para Supervisor) | PIN |
|-----|----------|-------------------------|-----|
| **Supervisor** | María García | `maria-4@tpv.com` | `2345` |
| **Camarero** | Carlos López | - | `3456` |
| **Camarero** | Laura Martínez | - | `4567` |
| **Camarero** | Pedro Sánchez | - | `5678` |

---

> **Nota:** El correo del **Supervisor** (`maria-4@tpv.com`) también permite el acceso al Backoffice/Administración utilizando la contraseña `password`, aunque con permisos limitados en comparación con la cuenta de Administrador.

