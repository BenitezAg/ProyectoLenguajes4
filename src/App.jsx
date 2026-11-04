import { useCallback, useEffect, useRef, useState } from "react";
import AdminDashboard from "./components/AdminDashboard.jsx";
import AuthModal from "./components/AuthModal.jsx";
import ContactSection from "./components/ContactSection.jsx";
import CustomerInbox from "./components/CustomerInbox.jsx";
import Footer from "./components/Footer.jsx";
import GuestMessageInbox from "./components/GuestMessageInbox.jsx";
import Hero from "./components/Hero.jsx";
import Navbar from "./components/Navbar.jsx";
import ProjectModal from "./components/ProjectModal.jsx";
import ProjectsSection from "./components/ProjectsSection.jsx";
import ServicesSection from "./components/ServicesSection.jsx";
import SkillsSection from "./components/SkillsSection.jsx";
import TeamSection from "./components/TeamSection.jsx";
import { PortfolioProvider, usePortfolio } from "./context/PortfolioContext.jsx";
import { getGuestAccessToken } from "./utils/guestAccess.js";

function getPageFromHash() {
  if (getGuestAccessToken()) return "guestInbox";
  if (window.location.hash === "#mis-consultas") return "customerInbox";
  if (window.location.hash === "#operador") return "operator";
  return "portfolio";
}

function Portfolio() {
  const {
    portfolio,
    user,
    register,
    login,
    logout,
    loading,
    storageError,
    backendConfigured,
    recordVisit,
  } = usePortfolio();
  const [page, setPage] = useState(getPageFromHash);
  const [guestAccessToken, setGuestAccessToken] = useState(getGuestAccessToken);
  const [authMode, setAuthMode] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [notice, setNotice] = useState("");
  const recordedVisits = useRef(new Set());

  useEffect(() => {
    if (!backendConfigured || loading) return;

    const visitKey = user?.id ?? "anonymous";
    if (recordedVisits.current.has(visitKey)) return;
    recordedVisits.current.add(visitKey);

    void recordVisit().catch(() => {
      recordedVisits.current.delete(visitKey);
      setNotice(
        "No se pudo registrar la visita en Supabase. Revisa las políticas y la migración.",
      );
    });
  }, [backendConfigured, loading, user?.id, recordVisit]);

  const openAdmin = useCallback((event) => {
    if (!user?.isOperator) {
      event?.preventDefault();
      setNotice("El panel de gestión requiere una cuenta de operador autorizada en Supabase.");
      return;
    }
    setPage("operator");
    setNotice("");
  }, [user?.isOperator]);

  const closeAdmin = useCallback(() => {
    window.history.replaceState(null, "", window.location.pathname + window.location.search + "#inicio");
    setPage("portfolio");
    setNotice("");
  }, []);
  const closeInbox = useCallback(() => {
    window.history.replaceState(null, "", window.location.pathname + window.location.search + "#inicio");
    setPage("portfolio");
    setGuestAccessToken("");
    setNotice("");
  }, []);

  const openCustomerInbox = useCallback(() => {
    window.location.hash = "mis-consultas";
    setPage("customerInbox");
    setNotice("");
  }, []);

  useEffect(() => {
    function syncPage() {
      setPage(getPageFromHash());
      setGuestAccessToken(getGuestAccessToken());
    }
    window.addEventListener("hashchange", syncPage);
    return () => window.removeEventListener("hashchange", syncPage);
  }, []);

  useEffect(() => {
    function updateScrollProgress() {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0);
    }
    updateScrollProgress();
    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    window.addEventListener("resize", updateScrollProgress);
    return () => {
      window.removeEventListener("scroll", updateScrollProgress);
      window.removeEventListener("resize", updateScrollProgress);
    };
  }, [page]);

  const closeProject = useCallback(() => setSelectedProject(null), []);
  const operatorPage = page === "operator" && user?.isOperator;
  const customerInboxPage =
    page === "customerInbox" && user && !user.isOperator;
  const guestInboxPage = page === "guestInbox" && guestAccessToken;

  return (
    <>
      <div className="reading-progress" style={{ width: `${scrollProgress}%` }} aria-hidden="true" />
      <div className="ambient-background" aria-hidden="true">
        <span className="ambient-blob blob-pink" />
        <span className="ambient-blob blob-green" />
        <span className="ambient-grid" />
      </div>
      <Navbar
        user={user}
        onLogin={() => setAuthMode("login")}
        onLogout={() => void logout().catch((error) => {
          console.error("No se pudo cerrar la sesión.", error);
          setNotice("No se pudo cerrar la sesión en Supabase. Vuelve a intentarlo.");
        })}
        onOperator={openAdmin}
        onCustomerMessages={openCustomerInbox}
      />
      {operatorPage ? (
        <AdminDashboard onExit={closeAdmin} />
      ) : customerInboxPage ? (
        <CustomerInbox onExit={closeInbox} />
      ) : guestInboxPage ? (
        <GuestMessageInbox accessToken={guestAccessToken} onExit={closeInbox} />
      ) : (
        <main aria-busy={loading}>
          {notice && <div className="container"><p className="admin-notice mt-3" role="status">{notice}</p></div>}
          {storageError && <div className="container"><p className="alert alert-danger mt-3" role="alert">{storageError}</p></div>}
          <Hero />
          <TeamSection />
          <ServicesSection />
          <ProjectsSection
            user={user}
            onLogin={() => setAuthMode(user ? "login" : "register")}
            onSelectProject={setSelectedProject}
          />
          <SkillsSection />
          <ContactSection user={user} />
        </main>
      )}
      <Footer isOperator={user?.isOperator} onOperator={openAdmin} />
      {authMode && (
        <AuthModal
          initialMode={authMode}
          onClose={() => setAuthMode(null)}
          onLogin={login}
          onRegister={register}
          backendConfigured={backendConfigured}
        />
      )}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          demos={portfolio.demos.filter(
            (demo) => demo.projectId === selectedProject.id,
          )}
          onClose={closeProject}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <PortfolioProvider>
      <Portfolio />
    </PortfolioProvider>
  );
}
