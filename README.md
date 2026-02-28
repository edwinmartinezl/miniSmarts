<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>miniSmarts</title>
  <meta name="description" content="Ecosistema open source de mini inteligencias (miniSmarts) optimizadas para modelos pequeños (3B+) y equipos comunes." />
  <style>
    :root { --bg:#0b0f14; --fg:#e8eef6; --muted:#a8b3c2; --card:#121a24; --accent:#7bdcff; --line:#1f2a38; }
    body { margin:0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; background:var(--bg); color:var(--fg); }
    .wrap { max-width: 980px; margin: 0 auto; padding: 28px 18px 64px; }
    header { display:flex; gap:16px; align-items:center; padding: 18px; background: linear-gradient(180deg, rgba(123,220,255,.08), transparent); border:1px solid var(--line); border-radius:16px; }
    header img { width:72px; height:72px; object-fit:contain; border-radius:14px; background: rgba(255,255,255,.04); border:1px solid var(--line); padding:10px; }
    h1 { margin:0; font-size: 30px; letter-spacing: .2px; }
    .subtitle { margin-top:6px; color:var(--muted); line-height: 1.4; }
    .grid { display:grid; grid-template-columns: 1fr; gap: 14px; margin-top: 18px; }
    @media (min-width: 900px){ .grid { grid-template-columns: 1.2fr .8fr; } }
    .card { background: var(--card); border:1px solid var(--line); border-radius:16px; padding: 18px; }
    h2 { margin: 0 0 10px; font-size: 18px; }
    p, li { color: var(--fg); line-height: 1.55; }
    .muted { color: var(--muted); }
    code, pre { background: rgba(255,255,255,.06); border:1px solid var(--line); border-radius: 10px; }
    code { padding: 2px 6px; }
    pre { padding: 12px; overflow:auto; }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .tag { display:inline-block; font-size: 12px; padding: 4px 10px; border:1px solid var(--line); border-radius: 999px; color: var(--muted); margin-right: 8px; }
    footer { margin-top: 18px; color: var(--muted); font-size: 12px; }
    .hr { height:1px; background: var(--line); margin: 14px 0; }
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <!-- Coloca tu icono aquí: assets/icon.png -->
      <img src="assets/icon.png" alt="miniSmarts icon" />
      <div>
        <h1>miniSmarts</h1>
        <div class="subtitle">
          Ecosistema open source de <strong>mini inteligencias</strong>: microservicios especializados, pasivos y con contratos claros.<br/>
          Optimizado para <strong>modelos pequeños (3B+)</strong> y equipos comunes, con uso <strong>económico</strong> de recursos y tokens.
        </div>
        <div style="margin-top:10px">
          <span class="tag">Open Source</span>
          <span class="tag">3B+ friendly</span>
          <span class="tag">API-first</span>
          <span class="tag">Linux + systemd</span>
        </div>
      </div>
    </header>

    <div class="grid">
      <section class="card">
        <h2>¿Qué es una miniSmart?</h2>
        <p>
          Una <strong>miniSmart</strong> es una mini inteligencia con <strong>una sola función</strong> (un skill).
          No decide rutas complejas ni “murmura” por sí sola: <strong>recibe un request</strong>, valida el contrato, ejecuta su función y <strong>responde</strong>.
        </p>
        <div class="hr"></div>
        <h2>Filosofía de diseño</h2>
        <ul>
          <li><strong>Simplicidad primero</strong>: una mini = un skill.</li>
          <li><strong>Contratos explícitos</strong>: si no cumples el formato, se rechaza.</li>
          <li><strong>Pasivas</strong>: no consumen recursos si no reciben trabajo.</li>
          <li><strong>Interoperables</strong>: cualquier modelo o agente puede consumirlas.</li>
          <li><strong>Optimización real</strong>: pensadas para hardware común y modelos 3B+.</li>
        </ul>

        <div class="hr"></div>
        <h2>Cómo se integran con modelos o agentes</h2>
        <p class="muted">
          Un agente/LLM “grande” actúa como orquestador externo:
          consulta capacidades y contrato, construye el request válido, llama el endpoint de ejecución y usa la respuesta para continuar el flujo.
        </p>
        <pre><code>1) GET  /api/XX/capabilities
2) GET  /api/XX/contract
3) POST /api/XX/process (request válido)
4) ← respuesta estructurada</code></pre>
      </section>

      <aside class="card">
        <h2>miniSmart-01 (Telegram Gateway)</h2>
        <p class="muted">
          Primer módulo del ecosistema. Conector Telegram + API local para entrada/salida.
          Diseñado para operar como servicio resiliente (systemd) y administración por CLI.
        </p>
        <ul>
          <li>Puerto: <code>7000</code></li>
          <li>Namespace: <code>/api/01</code></li>
          <li>Docs humanas: <code>/api/01/docs</code></li>
        </ul>

        <div class="hr"></div>
        <h2>Inicio rápido (ejemplo)</h2>
        <pre><code># instalar global (cuando esté publicado)
npm install -g minismarts-01

# instalar servicio y configurar token
minismarts install 01

# ver estado
minismarts status 01</code></pre>

        <div class="hr"></div>
        <h2>Repositorio</h2>
        <p class="muted">
          Este repo agrupa múltiples minis bajo un mismo estándar (miniSmarts).
        </p>
        <ul>
          <li><a href="./miniSmart-01">miniSmart-01</a></li>
          <li class="muted">miniSmart-02 (próximamente)</li>
        </ul>
      </aside>
    </div>

    <footer>
      <div>Autor: Edwin Martinez L. · Santo Domingo, República Dominicana</div>
      <div>Licencia: MIT</div>
    </footer>
  </div>
</body>
</html>
