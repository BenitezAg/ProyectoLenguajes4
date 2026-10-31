import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { initialPortfolio } from "../data/portfolio.js";
import { createId, toDatabaseRecord } from "../utils/records.js";
import { supabase, supabaseIsConfigured } from "../utils/supabase.js";

const PortfolioContext = createContext(null);
const EMPTY_ANALYTICS = () => ({ visits: 0, registeredVisits: 0, dailyVisits: [] });
const TABLES = {
  projects: "portfolio_projects",
  demos: "portfolio_demos",
  services: "portfolio_services",
};

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
          isOperator
            ? supabase
                .from("portfolio_messages")
                .select("id, user_id, name, email, subject, message, status, notification_status, created_at, responded_at")
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

      const projects = (projectsResult.data ?? []).map((project) => ({
        ...project,
        description:
          project.description ||
          "Regístrate para descubrir los detalles de este proyecto.",
        technologies: project.technologies ?? "",
      }));

      setPortfolio({
        projects,
        services: servicesResult.data ?? [],
        demos: demosResult.data ?? [],
        messages: messagesResult.data ?? [],
        users: usersResult.data ?? [],
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
      throw new Error(
        "Supabase todavía no está configurado. Sigue las instrucciones del README.",
      );
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
    async ({ name, email, subject, message }) => {
      requireBackend();
      const result = await supabase
        .from("portfolio_messages")
        .insert({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          subject,
          message: message.trim(),
          user_id: user?.id ?? null,
        })
        .select("id")
        .single();
      const saved = throwOnError(result);

      await refreshPortfolio();
      const notification = await supabase.functions.invoke("notify-contact", {
        body: { messageId: saved.id },
      });
      if (notification.error) {
        console.error(
          "La consulta se guardó, pero no se pudo enviar el correo.",
          notification.error,
        );
        return { emailSent: false };
      }

      await refreshPortfolio();
      return { emailSent: notification.data?.sent === true };
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
