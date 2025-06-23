# 🚀 Flowmatik Professional Backend

Backend profesional para Flowmatik con 8 Agentes de IA especializados, integración con Doubao 1.5-pro y sistema de memoria eterna.

## ✨ Características

- **8 AI Agents especializados** con personalidades únicas
- **Doubao 1.5-pro** integración via 302.AI (94% más barato que GPT-4)
- **Sistema de memoria eterna** que nunca olvida
- **Terminal administrativo** para admin.flowmatik.co
- **Analytics avanzados** con tracking de costos
- **API REST completa** para flowmatik.co

## 🤖 Agentes Disponibles

1. **FLOWI CEO** - Leadership & Strategy
2. **TREND RESEARCHER** - Trending Topics Analysis  
3. **HOOK CREATOR** - Engaging Hook Generator
4. **EDITOR PRO** - Professional Video Editor
5. **THUMBNAIL WIZARD** - Thumbnail Design Expert
6. **OPTIMIZER** - Performance Optimization
7. **GROWTH EXPERT** - Growth Hacking Specialist
8. **DATA MASTER** - Advanced Analytics Expert

## 🚀 Deploy en Glitch

### Paso 1: Importar desde GitHub
1. Ve a [Glitch](https://glitch.com)
2. Haz clic en "New Project"
3. Selecciona "Import from GitHub"
4. Pega esta URL: `https://github.com/tu-usuario/flowmatik-backend`

### Paso 2: Configurar Variables de Entorno
En Glitch, ve a `.env` y agrega:
```
AI_302_API_KEY=tu-api-key-de-302ai
NODE_ENV=production
```

### Paso 3: ¡Listo!
El proyecto se desplegará automáticamente. Tu backend estará disponible en:
`https://tu-proyecto.glitch.me`

## 📡 Endpoints API

### Para flowmatik.co (Web pública)
- `GET /api/agents` - Lista de agentes disponibles
- `POST /api/agents/:agentId/chat` - Chat con agente específico

### Para admin.flowmatik.co (Terminal admin)
- `POST /api/terminal/chat` - Chat administrativo
- `GET /api/analytics` - Dashboard de analytics
- `GET /api/memory/search` - Búsqueda en memoria eterna

### Generales
- `GET /health` - Health check
- `GET /` - Información del sistema

## 💰 Costos Optimizados

- **Doubao 1.5-pro**: $0.11 input + $0.28 output por 1M tokens
- **94% más barato** que GPT-4
- **ROI proyectado**: +50,000% primer año
- **Deploy gratuito** en Glitch

## 🔧 Desarrollo Local

```bash
npm install
npm start
```

El servidor estará disponible en `http://localhost:3000`

## 📊 Ejemplo de Uso

```javascript
// Chat con FLOWI CEO
const response = await fetch('/api/agents/flowi-ceo/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "¿Cuál es la mejor estrategia para escalar Flowmatik?",
    context: "Startup de contenido con IA"
  })
});

const data = await response.json();
console.log(data.response); // Respuesta del CEO
```

## 🛡️ Seguridad

- Rate limiting (100 req/min)
- Helmet.js para headers de seguridad
- Validación con Joi
- CORS configurado
- Variables de entorno para secrets

## 📈 Analytics

El sistema trackea automáticamente:
- Requests por agente
- Costos por operación
- Tokens utilizados
- Performance metrics

---

**Desarrollado para Flowmatik** - La plataforma de contenido con IA más avanzada del mercado.

