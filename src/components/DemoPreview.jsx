import { useRef, useState } from "react";
import { toggleFullscreen } from "../utils/webApis.js";

export default function DemoPreview({ demo }) {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const containerRef = useRef(null);

  const renderContent = () => {
    switch (demo.kind) {
      case "shop":
        return (
          <div className="demo-product">
            <div className="demo-product-icon" aria-hidden="true">🧢</div>
            <div>
              <strong>Gorra edición neón</strong>
              <span>$25.00 · Disponible</span>
            </div>
            <button
              className="btn btn-primary-custom btn-sm"
              type="button"
              onClick={() => setCount((v) => v + 1)}
            >
              Añadir · {count}
            </button>
          </div>
        );
      case "brand":
        return (
          <div className="demo-brand">
            <div className="color-swatches">
              {["#D6FF62", "#A9A1FF", "#F8F7F1", "#21211E"].map((color) => (
                <span
                  key={color}
                  style={{ "--swatch-color": color }}
                  title={color}
                >
                  <span className="visually-hidden">{color}</span>
                </span>
              ))}
            </div>
            <p>Identidad visual armónica y escalable.</p>
          </div>
        );
      case "habits":
        return (
          <div className="demo-habit">
            <span aria-hidden="true">💧</span>
            <div className="flex-grow-1">
              <strong>Tomar agua</strong>
              <span>Progreso de hoy</span>
              <div className="habit-progress">
                <span style={{ width: `${done ? 100 : 65}%` }} />
              </div>
            </div>
            <button
              className="demo-complete"
              type="button"
              onClick={() => setDone((v) => !v)}
            >
              {done ? "✓" : "+1"}
            </button>
          </div>
        );
      case "dashboard":
        return (
          <div className="demo-dashboard">
            <span>MÉTRICA · HOY</span>
            <strong>${(1248 + count * 35).toLocaleString("es-AR")}</strong>
            <span className="demo-growth">↗ 14,2% de incremento</span>
            <button
              className="btn btn-outline-custom btn-sm"
              type="button"
              onClick={() => setCount((v) => v + 1)}
            >
              Actualizar datos
            </button>
          </div>
        );
      case "gallery":
        return (
          <div className="demo-gallery" aria-label="Ilustración editorial">
            {["✳", "✷", "◈", "✿"].map((symbol, index) => (
              <span key={symbol} style={{ "--gallery-index": index }} aria-hidden="true">
                {symbol}
              </span>
            ))}
            <small>Exploración visual interactiva</small>
          </div>
        );
      case "arcade":
        return (
          <div className="demo-arcade">
            <span aria-hidden="true">{done ? "🏆" : "🎮"}</span>
            <strong>Puntos: {count * 1250}</strong>
            <button
              className="btn btn-primary-custom"
              type="button"
              onClick={() => {
                setCount((v) => v + 1);
                setDone(true);
              }}
            >
              {done ? "Jugar otra vez" : "Jugar partida"}
            </button>
          </div>
        );
      default:
        return (
          <p className="empty-state">
            Demo en preparación interactiva.
          </p>
        );
    }
  };

  return (
    <div className="demo-wrapper" ref={containerRef}>
      <div className="demo-header-toolbar">
        <button
          type="button"
          className="demo-fullscreen-btn"
          onClick={() => toggleFullscreen(containerRef.current)}
          title="Pantalla completa (Fullscreen API)"
          aria-label="Ver demo en pantalla completa"
        >
          ⛶ Pantalla completa
        </button>
      </div>
      {renderContent()}
    </div>
  );
}
