# Configuración del Proyecto

## Requisitos Previos
- Node.js >= 14
- PostgreSQL >= 12
- npm o yarn

## Pasos de Instalación

### 1. Clonar el Repositorio
```bash
git clone <url-del-repositorio>
cd testfavoritosmarket
```

### 2. Configurar la Base de Datos
```bash
# Iniciar sesión en PostgreSQL
psql -U postgres

# Ejecutar el script de inicialización
\i backend/db/init.sql
```

### 3. Configurar Variables de Entorno

En el directorio backend, crear archivo .env:
```env
JWT_SECRET=tu_clave_secreta
DB_HOST=localhost
DB_PORT=5432
DB_NAME=marketplace
DB_USER=postgres
DB_PASSWORD=tu_contraseña
```

En el directorio frontend, crear archivo .env:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Instalar Dependencias

Backend:
```bash
cd backend
npm install
```

Frontend:
```bash
cd frontend
npm install
```

### 5. Iniciar la Aplicación

Backend:
```bash
cd backend
npm run dev
```

Frontend (en otra terminal):
```bash
cd frontend
npm start
```

## Verificación
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

## Estructura de la Base de Datos

### Tabla usuarios
- id: SERIAL PRIMARY KEY
- email: VARCHAR(255) UNIQUE
- password: VARCHAR(255)
- nombre: VARCHAR(255)
- foto_perfil: TEXT
- fecha_registro: TIMESTAMP

### Tabla publicaciones
- id: SERIAL PRIMARY KEY
- titulo: VARCHAR(255)
- descripcion: TEXT
- categoria: VARCHAR(100)
- precio: DECIMAL(10,2)
- imagen: TEXT
- usuario_id: INTEGER (FK)
- fecha_creacion: TIMESTAMP
- estado: VARCHAR(50)

### Tabla favoritos
- id: SERIAL PRIMARY KEY
- usuario_id: INTEGER (FK)
- publicacion_id: INTEGER (FK)
- fecha_creacion: TIMESTAMP
