# Notificaciones de consultas y respuestas por email

La función `notify-contact` notifica las consultas nuevas y las respuestas de
la conversación. Los mensajes y sus respuestas se guardan en las tablas
`portfolio_messages` y `portfolio_message_replies`; el email es una notificación
adicional. Utiliza Resend y credenciales de servidor que permanecen **únicamente
en Supabase**. No agregues claves de Resend o de servicio al frontend, GitHub,
archivos versionados ni al historial de Git.

1. Verifica un dominio y un remitente en [Resend](https://resend.com/).
2. Desde esta carpeta, ejecuta `npx supabase login` y
   `npx supabase link --project-ref ID_DE_TU_PROYECTO`.
3. En **Supabase → Edge Functions → Secrets**, configura
   `RESEND_API_KEY`, `CONTACT_EMAIL`, `CONTACT_FROM_EMAIL` (el remitente
   verificado de Resend) y `CONTACT_SITE_URL` (URL pública completa del
   portfolio, necesaria para enviar el enlace privado a quienes escriben sin
   cuenta). Supabase proporciona `SUPABASE_URL`, `SUPABASE_ANON_KEY` y
   `SUPABASE_SERVICE_ROLE_KEY` automáticamente a la función.
4. Publica con `npx supabase functions deploy notify-contact`.

La función marca cada notificación inicial antes de enviarla, verifica los
tokens de sesión para correos de clientes/equipo y valida el enlace privado de
los invitados. Un error de correo no elimina la consulta ni la respuesta, que
siguen disponibles en la conversación de Supabase.
