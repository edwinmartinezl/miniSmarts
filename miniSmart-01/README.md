# miniSmart-01 - miniSmarts Ecosystem

Objetivo del Proyecto:

miniSmart-01 es la primera mini inteligencia del ecosistema miniSmarts.
Actua como gateway Telegram desacoplado, instalable como servicio Linux,
con API estandarizada para integracion con modelos, agentes y sistemas externos.

Esta especialmente diseñada para funcionar eficientemente con modelos pequeños
(3B parametros en adelante) y equipos comunes, priorizando bajo consumo de recursos
y uso economico de tokens.

Aunque esta optimizada para modelos ligeros, cualquier modelo o agente externo
puede consumir su API conforme al contrato definido.

## Diseño enfocado en

- Modelos pequeños (3B+)
- Equipos comunes
- Uso eficiente de memoria
- Bajo consumo de tokens
- Arquitectura pasiva y deterministica

## Arquitectura general

miniSmart-01 opera como microservicio especializado:
- Adapter Telegram para entrada/salida de mensajeria.
- API local versionada bajo `/api/01`.
- Persistencia local de eventos, offset y usuarios.
- Servicio systemd para ejecucion continua.
- Gestion de token obligatoria desde CLI y entorno externo por mini.

## Instalacion

Instalacion global recomendada:

`npm install -g minismarts-01`

Tambien puede instalarse desde codigo fuente local con `npm install -g .`.

## Configuracion de token

- Archivo oficial: `/etc/minismarts/01.env`
- Clave requerida: `BOT_TOKEN`
- En `minismarts install 01`, si el archivo no existe, se solicita token y se valida contra Telegram antes de continuar.

## CLI Commands

### Service Lifecycle

- `minismarts install 01`: instala la unidad systemd y arranca miniSmart-01 (si falta token, lo solicita y valida).
- `minismarts uninstall 01`: detiene y elimina la unidad systemd de miniSmart-01.
- `minismarts start 01`: inicia el servicio.
- `minismarts stop 01`: detiene el servicio.
- `minismarts restart 01`: reinicia el servicio.
- `minismarts status 01`: muestra estado actual del servicio.
- `minismarts logs 01`: abre logs en tiempo real.
- `minismarts docs 01`: abre la documentación local.

Ejemplos reales:
- `minismarts install 01`
- `minismarts status 01`
- `minismarts docs 01`

### Token Management

- `minismarts token set 01`: solicita BOT_TOKEN, valida con Telegram y actualiza `/etc/minismarts/01.env`.
- `minismarts token get 01`: muestra BOT_TOKEN enmascarado.
- `minismarts token validate 01`: valida BOT_TOKEN actual con Telegram usando `getMe`.

Ejemplos reales:
- `minismarts token set 01`
- `minismarts token get 01`
- `minismarts token validate 01`

## Endpoints API

- `/api/01/capabilities`
- `/api/01/contract`
- `/api/01/send`
- `/api/01/health`
- `/api/01/docs`

## Multi-User Conversation Storage

miniSmart-01 implementa almacenamiento estructurado de conversaciones por usuario, separando claramente mensajes del usuario y respuestas del modelo.

### Estructura de directorios

```
users/
├── telegram:1234567890/
│   └── conversation.jsonl
├── telegram:9876543210/
│   └── conversation.jsonl
└── ...
```

Cada carpeta se crea automáticamente con formato `<source>:<user_id>` al recibir el primer mensaje de un usuario.

### Formato conversation.jsonl

Cada línea es un objeto JSON independiente con la siguiente estructura:

```json
{
  "timestamp": "2026-02-28T00:01:01.905Z",
  "actor": "user" | "model",
  "model_name": "miniSmart-01" | null,
  "message": "texto del mensaje",
  "chat_id": "1972831850",
  "message_id": 25,
  "meta": {}
}
```

**Campos:**
- `timestamp`: ISO 8601 del evento
- `actor`: "user" para mensajes de usuario, "model" para respuestas de miniSmart-01
- `model_name`: Nombre del modelo (relleno solo cuando actor="model")
- `message`: Contenido textual del mensaje
- `chat_id`: ID del chat en Telegram
- `message_id`: ID del mensaje en Telegram (puede ser null para respuestas del modelo)
- `meta`: Metadatos adicionales (source, type, update_id, etc)

### Flujo de almacenamiento

1. **Al recibir mensaje de usuario (Telegram)**:
	- Se registra evento en `data/events.jsonl` (flujo existente)
	- Se crea/actualiza entrada en `users/<instance_id>/conversation.jsonl` con `actor: "user"`

2. **Al enviar respuesta del modelo**:
	- Se envía mensaje a través de Telegram adapter
	- Se registra entrada en `users/<instance_id>/conversation.jsonl` con `actor: "model"`

### Gestión automática

- Directories se crean automáticamente con la primera interacción
- Archivos conversation.jsonl se generan bajo demanda
- No se generan errores si ya existen
- Completamente independiente del flujo de events.jsonl existente

### Compatibilidad

El almacenamiento multiusuario fue diseñado para:
- Preparar integración futura con LLMs
- Mantener historial conversacional estructurado por usuario
- **No afectar** el sistema actual (events.jsonl sigue guardándose normalmente)

## Ejemplo de integracion con LLM externo

Un orquestador con LLM externo puede consultar `/api/01/capabilities` y `/api/01/contract` al iniciar, usar `/api/01/health` para monitoreo y enviar respuestas al usuario final mediante `/api/01/send`, manteniendo al modelo separado de la capa de transporte Telegram.

## Filosofia de diseño

- Microservicios especializados
- Agentes pasivos
- Sin loops autonomos
- Contratos explicitos
- Bajo consumo de tokens

## Roadmap futuro

- Nuevos adapters de canales adicionales.
- Metricas operativas estandarizadas por mini.
- Plantillas de contratos para mas minis del ecosistema.
- Herramientas de pruebas de compatibilidad entre minis.

## Contribuciones

Las contribuciones son bienvenidas mediante issues y pull requests.
Se recomienda abrir primero una propuesta corta con objetivo, alcance y validacion esperada para mantener coherencia con los estandares miniSmarts.

## GitHub

Perfil oficial: https://github.com/edwinmartinezl
