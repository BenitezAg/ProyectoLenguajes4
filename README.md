# Portfolio Full Stack · Trabajo Práctico Integrador · Lenguajes IV

Portfolio interactivo grupal desarrollado por un equipo de **4 integrantes** con **React 19**, **Supabase** (Auth, PostgreSQL relacional con Row Level Security y Edge Functions), **Bootstrap 5**, **APIs Web nativas** y **esbuild**.

Cumple de forma integral con todas las condiciones de regularización y promoción del Trabajo Práctico Integrador de **Lenguajes 4**.

---

## 👥 Equipo de Desarrollo (4 Integrantes)

La información y perfiles de los 4 integrantes se configuran de forma centralizada en [`src/data/portfolio.js`](src/data/portfolio.js):

1. **Ángel Benítez** — *Full Stack Lead & Cloud Architect* (Arquitectura, Supabase/SQL, CI/CD, React 19).
2. **Sofía Romero** — *Frontend Engineer & UI/UX Specialist* (Interfaces reactivas, CSS moderno, animaciones fluidas, accesibilidad).
3. **Lucas Maidana** — *Backend & Database Developer* (Lógica de servidor, optimización SQL, validaciones estrictas y APIs REST).
4. **Valentina Torres** — *Fullstack & QA / Security Engineer* (Políticas RLS en PostgreSQL, pruebas unitarias automatizadas y Web APIs).

> Cada tarjeta de integrante incluye accesos directos interactivos impulsados por Web APIs (lectura por voz, copiado al portapapeles y enlaces a GitHub/LinkedIn).

---

## 🚀 Cumplimiento de Requisitos de la Cátedra

### A. Navegación como Usuario / Visitante
* **Perfil Profesional y Equipo:** Sección del colectivo y fichas individuales de los 4 integrantes con tecnologías del stack, servicios y trayectoria.
* **Formulario de Contacto vía Email:** Módulo con validación estricta de campos para:
  * Cotización de proyectos
  * Asesoría técnica
  * Consultas generales
  * Selección opcional de destinatario preferido (o todo el equipo).
* **Sección de Proyectos y Demos (con Registración Obligatoria):**
  * Vista previa pública de proyectos seleccionados.
  * El detalle técnico completo y las **demos interactivas** requieren iniciar sesión o registrarse.
  * Autenticación gestionada mediante Supabase Auth y protegida por políticas de Row Level Security (RLS) en PostgreSQL.

### B. Navegación como Operador / Gestión del Sitio (Condiciones de Promoción)
1. **CRUD Completo de Contenido:** Crear, editar, visualizar y eliminar Proyectos, Demos y Servicios desde el panel.
2. **Registro de Usuarios Registrados:** Panel de control de usuarios con buscador por nombre/correo y conmutador para activar o desactivar su acceso a las demos.
3. **Métricas y Contadores de Visitas (Analytics):**
   * Contador de visitas generales (tráfico total del sitio).
   * Contador de visitas de usuarios autenticados.
4. **Consultas Parametrizadas y Gráficos Interactivos:**
   * Gráfico de actividad y flujo diario con selector de rango (7 días / 14 días).
   * Gráfico visual de distribución de tipos de consultas más frecuentes (Cotizaciones vs Asesorías vs Proyectos vs Generales) con barras de progreso y cálculo porcentual en tiempo real.
   * Filtros parametrizados en la bandeja de entrada por estado y tipo de consulta.

### C. Escalabilidad por 4 Integrantes (Animaciones y Web APIs)
* **Web Speech API (`speechSynthesis`):** Narración accesible en voz alta del perfil de los integrantes y de la ficha de proyectos.
* **Clipboard API (`navigator.clipboard`):** Copiado rápido de emails de contacto con notificación instantánea.
* **Web Share API (`navigator.share`):** Compartir proyectos en un clic en dispositivos móviles y navegadores compatibles.
* **Fullscreen API:** Visualización inmersiva en pantalla completa de las demos interactivas.
* **Network Information / Online Status API:** Detección y badge en tiempo real del estado de conexión (Online / Offline) en el Navbar.
* **Animaciones fluidas:** Efecto typing dinámico en Hero, scroll progress bar en tiempo real, transiciones de revelado (Reveal con Intersection Observer) y microinteracciones de tarjetas.

---

## 🛠️ Cómo Ejecutar el Proyecto

### Opción 1: Acceso rápido en Windows
Haz doble clic en **`ABRIR PROYECTO.bat`**. La primera vez instalará dependencias si es necesario y abrirá automáticamente tu navegador en `http://localhost:3000`.

### Opción 2: Ejecución manual por terminal
Requiere Node.js 20.19 o superior:

```powershell
npm install
npm test
npm start
```

Para generar la compilación optimizada en `dist/`:
```powershell
npm run build
```

---

## 🗄️ Conectar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com/).
2. Copia `.env.example` a `.env` y añade tus credenciales públicas:
   ```dotenv
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu_clave_publishable
   ```
3. En el **SQL Editor** de Supabase, ejecuta el archivo [`supabase/migrations/20261031000000_initial_schema.sql`](supabase/migrations/20261031000000_initial_schema.sql).
4. Para otorgar rol de operador a un email registrado, en **Authentication → Users → Edit user → App Metadata**, añade:
   ```json
   { "portfolio_role": "operator" }
   ```
   Al recargar el sitio, se desbloqueará el **Panel del operador**.

---

## 📐 Anteproyecto: Manual de Diseño y Estilo

* **Paleta de Colores (#HEX):**
  * Fondo principal: `#100E19`
  * Superficies y tarjetas: `#181620` (elevada: `#201E29`)
  * Acento primario (Lima neón): `#D6FF62`
  * Acento secundario (Lavanda): `#A9A1FF`
  * Tipografía principal: `#F2F0F7`
  * Tipografía secundaria / Muted: `#A4A0B0`
  * Estado exitoso: `#8AE0AE`
  * Estado alerta / peligro: `#FF909C`
* **Tipografía:** *Space Grotesk* para títulos y números; *DM Sans* para el cuerpo e interfaz.
* **Diseño adaptativo (Responsive):** Grillas fluidas optimizadas para celulares, tablets y escritorios de alta resolución.
