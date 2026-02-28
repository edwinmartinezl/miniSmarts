
# miniSmarts

**Ecosistema open source de mini inteligencias modulares.**

miniSmarts es una arquitectura basada en microservicios especializados (mini inteligencias) diseñados para:

* Funcionar con **modelos pequeños (3B parámetros en adelante)**
* Ejecutarse en **equipos comunes**
* Mantener **uso económico de recursos y tokens**
* Operar bajo contratos claros y determinísticos

---

## 🎯 Filosofía del Proyecto

Una miniSmart es:

* Una mini inteligencia
* Con una sola función (un solo skill)
* Pasiva (no actúa si no recibe una solicitud)
* Basada en contrato explícito
* Diseñada para ser consumida por modelos o agentes externos

No hay loops autónomos.
No hay análisis innecesario.
No hay orquestación interna compleja.

La orquestación ocurre externamente (por un LLM mayor o un sistema coordinador).

---

## 🧠 ¿Por qué miniSmarts?

El ecosistema está pensado para:

* Hardware doméstico
* Servidores modestos
* Arquitecturas distribuidas simples
* Entornos donde el consumo de tokens debe ser eficiente

Se prioriza:

* Simplicidad
* Determinismo
* Modularidad
* Bajo consumo

---

## 🧩 Arquitectura General

Cada miniSmart expone:

* `/api/{id}/capabilities` → Qué hace
* `/api/{id}/contract` → Cómo debes hablarle
* `/api/{id}/process` o endpoint funcional → Ejecuta
* `/api/{id}/health` → Estado
* `/api/{id}/docs` → Documentación humana

Puerto estándar del ecosistema:

```
7000
```

Namespace por mini:

```
/api/01
/api/02
/api/03
...
```

---

## 🚀 miniSmart-01 — Telegram Gateway

Primer módulo del ecosistema.

Función:
Gateway de entrada y salida para Telegram, con API local estandarizada.

Características:

* Servicio Linux (systemd)
* CLI administrativa (`minismarts`)
* Gestión obligatoria de BOT_TOKEN
* Persistencia por usuario
* Estructura multiusuario
* Optimizado para integración con modelos pequeños

---

## 💻 CLI Global

Comandos principales:

### Ciclo de vida del servicio

```
minismarts install 01
minismarts uninstall 01
minismarts start 01
minismarts stop 01
minismarts restart 01
minismarts status 01
minismarts logs 01
minismarts docs 01
```

### Gestión de Token

```
minismarts token set 01
minismarts token get 01
minismarts token validate 01
```

---

## 🗂 Estructura de Conversaciones

Cada usuario tiene su propia carpeta:

```
users/<instance_id>/conversation.jsonl
```

Cada entrada registra:

* actor: "user" | "model"
* timestamp
* mensaje
* metadata
* identificadores

Esto prepara el sistema para integración futura con LLM.

---

## 🔌 Integración con Modelos

Cualquier modelo o agente externo puede consumir una miniSmart:

1. Consultar capacidades
2. Consultar contrato
3. Enviar request válido
4. Recibir respuesta estructurada

El diseño está optimizado para que modelos pequeños (3B+) puedan operar eficientemente.

---

## 🛣 Roadmap

* miniSmart-02 (Transcripción)
* miniSmart-03 (Conversión de documentos)
* miniSmart-00 (Supervisor / Control Plane)
* Estándar miniSmarts v1.0 formal

---

## 📜 Licencia

MIT License
© 2026 Edwin Martinez L.
Santo Domingo, República Dominicana


