# Portfolio del equipo · Trabajo Práctico Integrador · Lenguajes IV

Portfolio interactivo del equipo de **4 integrantes**, realizado para el Trabajo Práctico Integrador de **Lenguajes IV**. El proyecto utiliza **React 19**, **Supabase** (Auth, PostgreSQL con Row Level Security y Edge Functions), **Bootstrap 5**, **APIs Web** y **esbuild**.

---

## 👥 Equipo de Desarrollo (4 Integrantes)

La información del equipo se configura de forma centralizada en [`src/data/portfolio.js`](src/data/portfolio.js):

1. **Santiago Daniel Acuña**
2. **Angel Gabriel Benitez**
3. **Abel Villafañe**
4. **Wilson Lopez**

Los roles, correos y enlaces personales se pueden agregar cuando el equipo confirme esos datos.

---

## 🚀 Cumplimiento de Requisitos de la Cátedra

### A. Navegación como Usuario / Visitante
* **Presentación del equipo:** Sección del colectivo y fichas de sus cuatro integrantes, sin atribuirles perfiles profesionales no confirmados.
* **Formulario de consultas:** Módulo con validación de campos para:
  * Cotización de proyectos
  * Asesoría técnica
  * Consultas generales
  * Selección opcional de destinatario preferido (o todo el equipo).
  * Envío sin cuenta o con cuenta; cada consulta se guarda en PostgreSQL. Las notificaciones por correo son opcionales y requieren configurar Resend.
  * Los visitantes reciben un enlace privado para ver respuestas; los clientes registrados tienen la sección **Mis consultas**.
* **Sección de Proyectos y Demos:**
  * Vista previa pública de los proyectos que el equipo publique desde el panel.
  * El detalle técnico completo y las **demos interactivas** requieren iniciar sesión o registrarse.
  * Autenticación gestionada mediante Supabase Auth y protegida por políticas de Row Level Security (RLS) en PostgreSQL.
  * Las cuentas de cliente pueden consultar y responder sus propias conversaciones; solo los operadores pueden revisar la bandeja completa.

### B. Navegación como Operador / Gestión del Sitio (Condiciones de Promoción)
1. **CRUD Completo de Contenido:** Crear, editar, visualizar y eliminar Proyectos, Demos y Servicios desde el panel.
2. **Registro de Usuarios Registrados:** Panel de control de usuarios con buscador por nombre/correo y conmutador para activar o desactivar su acceso a las demos.
- El registro solicita nombre, apellido, teléfono, correo y contraseña. El teléfono se conserva en el perfil privado de Supabase y no se muestra en el portfolio público.
3. **Métricas y Contadores de Visitas (Analytics):**
   * Contador de visitas generales (tráfico total del sitio).
   * Contador de visitas de usuarios autenticados.
4. **Consultas Parametrizadas y Gráficos Interactivos:**
   * Gráfico de actividad y flujo diario con selector de rango (7 días / 14 días).
   * Gráfico visual de distribución de tipos de consultas más frecuentes (Cotizaciones vs Asesorías vs Proyectos vs Generales) con barras de progreso y cálculo porcentual en tiempo real.
   * Filtros parametrizados en la bandeja de entrada por estado y tipo de consulta.

### C. Escalabilidad por 4 Integrantes (Animaciones y Web APIs)
* **Web Speech API (`speechSynthesis`):** Narración en voz alta de los nombres de integrantes y de la ficha de proyectos.
* **Clipboard API (`navigator.clipboard`):** Copiado del enlace privado de seguimiento de una consulta.
* **Web Share API (`navigator.share`):** Compartir proyectos en un clic en dispositivos móviles y navegadores compatibles.
* **Fullscreen API:** Visualización inmersiva en pantalla completa de las demos interactivas.
* **Online Status API:** Indicador de conexión web en la navegación.
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
3. Configura los siguientes secretos en **GitHub → Settings → Secrets and variables → Actions** para habilitar el despliegue automático de migraciones:
   * `SUPABASE_ACCESS_TOKEN`: token de acceso personal generado en Supabase.
   * `SUPABASE_DB_PASSWORD`: contraseña de la base de datos del proyecto (no la contraseña de inicio de sesión de Supabase).
   * `SUPABASE_PROJECT_ID`: referencia del proyecto, visible en su URL de Supabase.
4. Si ya ejecutaste la migración inicial manualmente desde el SQL Editor, vincula primero el proyecto con Supabase CLI y registra esa versión como aplicada para que no intente ejecutarla de nuevo:
   ```sh
   supabase link --project-ref <SUPABASE_PROJECT_ID>
   supabase migration repair --status applied 20261105014451
   ```
5. Al hacer push a `main` con cambios en `supabase/migrations/`, GitHub Actions aplicará las migraciones pendientes. También se puede iniciar manualmente desde **Actions → Aplicar migraciones de Supabase → Run workflow**. El workflow utiliza la CLI para aplicar migraciones versionadas con `supabase db push`.
   Para este proyecto, verifica que `20261105014451_initial_schema`, `20261105020000_message_conversations`, `20261105020100_hide_unverified_seed_content` y `20261105020200_user_profiles_and_public_access` aparezcan aplicadas. La última concede lectura pública únicamente de los servicios activos y agrega los campos de perfil; si queda pendiente, la consulta de servicios falla y el sitio bloquea el envío para no perder mensajes.
6. Para usar la base de datos localmente, copia `.env.example` a `.env` y reemplaza los valores de ejemplo por el **Project URL** y la **Publishable key** del proyecto Supabase. Si faltan credenciales o no se pueden cargar los datos, el sitio permanece en modo vista previa y el formulario de contacto se desactiva; no guarda mensajes localmente.
   Las migraciones nuevas ocultan el contenido de ejemplo no confirmado. El equipo puede publicar proyectos y servicios reales desde el panel del operador.
7. Para publicar el sitio con Supabase conectado, configura también los secretos `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` que consume el workflow de GitHub Pages. La clave pública se incluye en el frontend; nunca configures una `service_role` key como variable `VITE_*`.
8. Para otorgar rol de operador a un email registrado, en **Authentication → Users → Edit user → App Metadata**, añade:
   ```json
   { "portfolio_role": "operator" }
   ```
   Al recargar el sitio, se desbloqueará el **Panel del operador**.
9. Despliega las Edge Functions `notify-contact` y `manage-users` desde el proyecto Supabase. `manage-users` permite a un operador invitar y eliminar cuentas de clientes; las cuentas con rol de operador y la cuenta activa del propio administrador están protegidas. Configura `PORTFOLIO_SITE_URL` como secreto si quieres que las invitaciones regresen al sitio publicado. Para entregar invitaciones a correos externos, configura un proveedor SMTP en **Authentication → SMTP Settings**.
10. Para recibir notificaciones y responder por correo, configura en **Supabase → Edge Functions → Secrets** `RESEND_API_KEY`, `CONTACT_EMAIL`, `CONTACT_FROM_EMAIL` (remitente verificado en Resend) y `CONTACT_SITE_URL` (URL pública completa del portfolio). El almacenamiento y las conversaciones funcionan aunque la entrega de correo no esté configurada; en ese caso el equipo puede responder desde su bandeja del operador y el visitante conserva su enlace privado.

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
