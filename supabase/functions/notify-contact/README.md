# Notificaciones de consultas por email

La función `notify-contact` manda cada consulta nueva al email configurado; los
mensajes originales se guardan en la tabla `portfolio_messages`. Utiliza Resend
como proveedor de correo y credenciales de servidor que permanecen **únicamente
en Supabase**. No agregues ni publiques claves de Resend o de servicio en React,
GitHub, archivos `.env` compartidos ni el historial de Git.

1. Verifica un dominio y un remitente en [Resend](https://resend.com/).
2. Desde esta carpeta, ejecuta `npx supabase login` y
   `npx supabase link --project-ref ID_DE_TU_PROYECTO`.
3. En **Supabase → Edge Functions → Secrets**, configura
   `RESEND_API_KEY`, `CONTACT_EMAIL` y `CONTACT_FROM_EMAIL` (el remitente
   verificado de Resend). Supabase proporciona `SUPABASE_URL` y
   `SUPABASE_SERVICE_ROLE_KEY` automáticamente a la función.
4. Publica con `npx supabase functions deploy notify-contact`.

La función marca atómicamente cada mensaje antes de enviarlo: las solicitudes
repetidas no generan correos duplicados. Un error de correo no elimina la
consulta, que sigue disponible para gestionarse desde el panel.
