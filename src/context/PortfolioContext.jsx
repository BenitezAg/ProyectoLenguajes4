import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { initialPortfolio } from "../data/portfolio.js";
import {
  createId,
  normalizeMessageRecord,
  toCamelCaseRecord,
  toDatabaseRecord,
} from "../utils/records.js";
import { supabase, supabaseIsConfigured } from "../utils/supabase.js";

const PortfolioContext = createContext(null);
const EMPTY_ANALYTICS = () => ({ visits: 0, registeredVisits: 0, dailyVisits: [] });
const TABLES = {
  projects: "portfolio_projects",
  demos: "portfolio_demos",
  services: "portfolio_services",
};
const MESSAGE_SELECT =
  "id, user_id, name, email, subject, message, recipient, status, notification_status, created_at, responded_at, portfolio_message_replies(id, author_id, author_role, body, created_at)";

function getErrorMessage(error) {
  return error instanceof Error ? error.message : "Error inesperado en Supabase.";
}

function throwOnError(result) {
  if (result.error) {
    throw new Error(result.error.message, { cause: result.error });
  }
  return result.data;
}

export function PortfolioProvider({ children }) {
  const [portfolio, setPortfolio] = useState(() => structuredClone(initialPortfolio));
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [storageError, setStorageError] = useState("");
  const generation = useRef(0);

  const user = authUser
    ? {
        id: authUser.id,
        name: authUser.user_metadata?.full_name ?? "Usuario",
        email: authUser.email ?? "",
        role: authUser.app_metadata?.portfolio_role ?? "user",
        isOperator: authUser.app_metadata?.portfolio_role === "operator",
      }
    : null;

  const refreshPortfolio = useCallback(async (currentUser = authUser) => {
    if (!supabase) return;

    const currentGeneration = ++generation.current;
    setLoading(true);
    setStorageError("");

    try {
      const isOperator =
        currentUser?.app_metadata?.portfolio_role === "operator";
      const projectQuery = currentUser
        ? supabase
            .from("portfolio_projects")
            .select("*")
            .order("position")
        : supabase.rpc("get_public_project_previews");

      const [projectsResult, servicesResult, demosResult, messagesResult, usersResult, analyticsResult] =
        await Promise.all([
          projectQuery,
          (isOperator
            ? supabase.from("portfolio_services").select("*")
            : supabase
                .from("portfolio_services")
                .select("*")
                .eq("active", true)
          ).order("position"),
          currentUser
            ? supabase
                .from("portfolio_demos")
                .select("*")
                .order("position")
            : Promise.resolve({ data: [], error: null }),
          currentUser
            ? supabase
                .from("portfolio_messages")
                .select(MESSAGE_SELECT)
                .order("created_at", { ascending: false })
            : Promise.resolve({ data: [], error: null }),
          isOperator
            ? supabase
                .from("portfolio_users")
                .select("id, name, email, active, created_at")
                .order("created_at", { ascending: false })
            : Promise.resolve({ data: [], error: null }),
          isOperator
            ? supabase
                .from("portfolio_daily_visits")
                .select("visit_date, total_visits, registered_visits")
                .order("visit_date")
            : Promise.resolve({ data: [], error: null }),
        ]);

      for (const result of [
        projectsResult,
        servicesResult,
        demosResult,
        messagesResult,
        usersResult,
        analyticsResult,
      ]) {
        throwOnError(result);
      }

      if (currentGeneration !== generation.current) return;

      const projects = (projectsResult.data ?? []).map((record) => {
        const project = toCamelCaseRecord(record);
        return {
        ...project,
        description:
          project.description ||
          "Regístrate para descubrir los detalles de este proyecto.",
        technologies: project.technologies ?? "",
        };
      });
      const messages = (messagesResult.data ?? []).map(normalizeMessageRecord);

      setPortfolio({
        projects,
        services: (servicesResult.data ?? []).map(toCamelCaseRecord),
        demos: (demosResult.data ?? []).map(toCamelCaseRecord),
        messages,
        users: (usersResult.data ?? []).map(toCamelCaseRecord),
        analytics: (analyticsResult.data ?? []).reduce(
          (summary, visit) => ({
            visits: summary.visits + Number(visit.total_visits),
            registeredVisits:
              summary.registeredVisits + Number(visit.registered_visits),
            dailyVisits: [
              ...summary.dailyVisits,
              {
                date: visit.visit_date,
                visits: Number(visit.total_visits),
                registered: Number(visit.registered_visits),
              },
            ],
          }),
          EMPTY_ANALYTICS(),
        ),
      });
    } catch (error) {
      console.error("No se pudieron cargar los datos de Supabase.", error);
      if (currentGeneration === generation.current) {
        setStorageError(
          `No se pudieron cargar los datos del portfolio. Comprueba la configuración de Supabase y las migraciones: ${getErrorMessage(error)}`,
        );
      }
      throw error;
    } finally {
      if (currentGeneration === generation.current) setLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    if (!supabase) return undefined;
    let active = true;

    async function restoreSession() {
      const { data, error } = await supabase.auth.getSession();
      if (!active) return;
      if (error) {
        console.error("No se pudo restaurar la sesión de Supabase.", error);
        setStorageError(`No se pudo restaurar la sesión: ${error.message}`);
        setLoading(false);
        return;
      }
      setAuthUser(data.session?.user ?? null);
    }

    void restoreSession();
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setAuthUser(session?.user ?? null);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (supabase) void refreshPortfolio(authUser).catch(() => {});
  }, [authUser, refreshPortfolio]);

  const requireBackend = useCallback(() => {
    if (!supabase) {
      throw new Error("Las consultas no están disponibles en este momento.");
    }
  }, []);

  const register = useCallback(async ({ name, email, password }) => {
    requireBackend();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { full_name: name.trim() } },
    });
    if (error) throw error;
    return { emailConfirmationRequired: !data.session };
  }, [requireBackend]);

  const login = useCallback(async ({ email, password }) => {
    requireBackend();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) throw error;
  }, [requireBackend]);

  const logout = useCallback(async () => {
    requireBackend();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, [requireBackend]);

  const recordVisit = useCallback(async () => {
    requireBackend();
    throwOnError(await supabase.rpc("record_portfolio_visit"));
    await refreshPortfolio();
  }, [refreshPortfolio, requireBackend]);

  const addMessage = useCallback(
    async ({ name, email, subject, message, recipient, guestAccessHash, guestAccessToken }) => {
      requireBackend();
      let messageId;
      if (user) {
        const result = await supabase
          .from("portfolio_messages")
          .insert({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            subject,
            message: message.trim(),
            recipient,
            user_id: user.id,
            guest_access_hash: null,
          })
          .select("id")
          .single();
        messageId = throwOnError(result).id;
      } else {
        messageId = throwOnError(
          await supabase.rpc("submit_guest_portfolio_message", {
            p_name: name.trim(),
            p_email: email.trim().toLowerCase(),
            p_subject: subject,
            p_message: message.trim(),
            p_recipient: recipient,
            p_guest_access_hash: guestAccessHash,
          }),
        );
      }

      let emailSent = false;
      try {
        const notification = await supabase.functions.invoke("notify-contact", {
          body: {
            action: "new_message",
            messageId,
            guestAccessToken: user ? null : guestAccessToken ?? null,
          },
        });
        if (notification.error) {
          console.error("La consulta se guardó, pero no se pudo enviar el correo.", notification.error);
        } else {
          emailSent = notification.data?.sent === true;
        }
      } catch (error) {
        console.error("La consulta se guardó, pero falló el aviso por correo.", error);
      }

      try {
        await refreshPortfolio();
      } catch (error) {
        console.error("La consulta se guardó, pero no se pudo actualizar la bandeja local.", error);
      }
      return { emailSent, saved: true };
    },
    [refreshPortfolio, requireBackend, user?.id],
  );

  const saveEntity = useCallback(async (kind, item) => {
    requireBackend();
    const table = TABLES[kind];
    if (!table) throw new Error(`Entidad no reconocida: ${kind}.`);

    const record = toDatabaseRecord(item);
    if (!record.id) record.id = createId(kind);
    const { error } = await supabase.from(table).upsert(record);
    if (error) throw error;
    await refreshPortfolio();
  }, [refreshPortfolio, requireBackend]);

  const deleteEntity = useCallback(async (kind, id) => {
    requireBackend();
    const table = TABLES[kind];
    if (!table) throw new Error(`Entidad no reconocida: ${kind}.`);

    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) throw error;
    await refreshPortfolio();
  }, [refreshPortfolio, requireBackend]);

  const setMessageStatus = useCallback(async (id, status) => {
    requireBackend();
    const { error } = await supabase
      .from("portfolio_messages")
      .update({
        status,
        responded_at: status === "respondida" ? new Date().toISOString() : null,
      })
      .eq("id", id);
    if (error) throw error;
    await refreshPortfolio();
  }, [refreshPortfolio, requireBackend]);

  const replyToMessage = useCallback(async (messageId, body) => {
    requireBackend();
    const replyId = throwOnError(
      await supabase.rpc(
        user?.isOperator
          ? "reply_to_operator_portfolio_message"
          : "reply_to_portfolio_message",
        {
          p_message_id: messageId,
          p_body: body.trim(),
        },
      ),
    );

    let emailSent = false;
    try {
      const notification = await supabase.functions.invoke("notify-contact", {
        body: {
          action: user?.isOperator ? "operator_reply" : "customer_reply",
          replyId,
        },
      });
      if (notification.error) {
        console.error("La respuesta se guardó, pero no se pudo enviar el correo.", notification.error);
      } else {
        emailSent = notification.data?.sent === true;
      }
    } catch (error) {
      console.error("La respuesta se guardó, pero falló el aviso por correo.", error);
    }

    try {
      await refreshPortfolio();
    } catch (error) {
      console.error("La respuesta se guardó, pero no se pudo actualizar la conversación.", error);
    }
    return { emailSent, saved: true };
  }, [refreshPortfolio, requireBackend, user?.id, user?.isOperator]);

  const getGuestMessage = useCallback(async (accessToken) => {
    requireBackend();
    const result = throwOnError(
      await supabase.rpc("get_guest_portfolio_message", {
        p_access_token: accessToken,
      }),
    );
    return result;
  }, [requireBackend]);

  const replyToGuestMessage = useCallback(async (accessToken, body) => {
    requireBackend();
    const replyId = throwOnError(
      await supabase.rpc("reply_to_guest_portfolio_message", {
        p_access_token: accessToken,
        p_body: body.trim(),
      }),
    );
    let emailSent = false;
    try {
      const notification = await supabase.functions.invoke("notify-contact", {
        body: {
          action: "guest_reply",
          replyId,
          accessToken,
        },
      });
      if (notification.error) {
        console.error("La respuesta se guardó, pero no se pudo notificar al equipo.", notification.error);
      } else {
        emailSent = notification.data?.sent === true;
      }
    } catch (error) {
      console.error("La respuesta se guardó, pero falló el aviso al equipo.", error);
    }
    return { emailSent, saved: true };
  }, [requireBackend]);

  const setUserActive = useCallback(async (id, active) => {
    requireBackend();
    const { error } = await supabase
      .from("portfolio_users")
      .update({ active })
      .eq("id", id);
    if (error) throw error;
    await refreshPortfolio();
  }, [refreshPortfolio, requireBackend]);

  return (
    <PortfolioContext.Provider
      value={{
        portfolio,
        user,
        loading,
        storageError,
        backendConfigured: supabaseIsConfigured,
        register,
        login,
        logout,
        recordVisit,
        addMessage,
        saveEntity,
        deleteEntity,
        setMessageStatus,
        replyToMessage,
        getGuestMessage,
        replyToGuestMessage,
        setUserActive,
        refreshPortfolio,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error("usePortfolio debe usarse dentro de PortfolioProvider.");
  }
  return context;
}
