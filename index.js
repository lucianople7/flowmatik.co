/**
 * FLOWMATIK UNIFIED BACKEND
 * Backend unificado para flowmatik.co y admin.flowmatik.co
 * Con 8 AI Agents, Memoria Eterna, y Doubao 1.5-pro via 302.AI
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { timing } from 'hono/timing';
import { compress } from 'hono/compress';

// Importar sistemas actualizados
import AIAgentSystem from './agents/ai-agent-system.js';
import EternalMemory from './memory/eternal-memory.js';
import DoubaoIntegration from './integrations/doubao-integration.js';

const app = new Hono();

// Middleware
app.use('*', cors({
  origin: ['https://flowmatik.co', 'https://admin.flowmatik.co', 'http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', timing());
app.use('*', compress());

// Inicializar sistemas
let aiAgents;
let eternalMemory;
let doubaoIntegration;

// ==========================================
// HEALTH CHECK Y STATUS
// ==========================================

app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      aiAgents: aiAgents ? 'active' : 'initializing',
      memory: eternalMemory ? 'active' : 'initializing',
      doubao: doubaoIntegration ? 'active' : 'initializing'
    },
    provider: '302.AI',
    model: 'Doubao-1.5-pro-32k',
    version: '1.0.0'
  });
});

app.get('/status', async (c) => {
  try {
    const [agentStats, memoryStats, doubaoStats] = await Promise.all([
      aiAgents?.getSystemStats() || { status: 'not_initialized' },
      eternalMemory?.getStats() || { status: 'not_initialized' },
      doubaoIntegration?.getUsageStats() || { status: 'not_initialized' }
    ]);

    return c.json({
      system: 'Flowmatik Unified Backend',
      status: 'operational',
      aiAgents: agentStats,
      memory: memoryStats,
      doubao: doubaoStats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// ==========================================
// ENDPOINTS PARA FLOWMATIK.CO (LANDING PAGE)
// ==========================================

// Listar agentes disponibles
app.get('/api/agents', async (c) => {
  try {
    if (!aiAgents) {
      return c.json({ error: 'AI Agents not initialized' }, 503);
    }

    const agents = aiAgents.getAgentList();
    return c.json({
      agents,
      total: agents.length,
      provider: '302.AI',
      model: 'Doubao-1.5-pro-32k',
      features: ['Deep Thinking', 'Multimodal', 'Streaming', 'Cost Optimized']
    });
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Información específica de un agente
app.get('/api/agents/:id', async (c) => {
  try {
    const agentId = c.req.param('id');
    const agent = aiAgents.getAgentInfo(agentId);
    
    return c.json({
      agent,
      capabilities: {
        deepThinking: agent.capabilities.deepThinking,
        multimodal: agent.capabilities.multimodal,
        streaming: agent.capabilities.streaming,
        languages: agent.capabilities.languages
      },
      pricing: agent.pricing
    });
  } catch (error) {
    return c.json({ error: error.message }, 404);
  }
});

// Generar contenido con agente específico
app.post('/api/agents/:id/generate', async (c) => {
  try {
    const agentId = c.req.param('id');
    const { prompt, options = {} } = await c.req.json();

    if (!prompt) {
      return c.json({ error: 'Prompt is required' }, 400);
    }

    const result = await aiAgents.generateWithAgent(agentId, prompt, options);
    
    // Guardar en memoria eterna si está disponible
    if (eternalMemory) {
      await eternalMemory.storeConversation({
        sessionId: options.sessionId || 'anonymous',
        userMessage: prompt,
        assistantResponse: result.content,
        agentId: agentId,
        metadata: { cost: result.cost, model: result.model }
      });
    }

    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Streaming con agente específico
app.post('/api/agents/:id/stream', async (c) => {
  try {
    const agentId = c.req.param('id');
    const { prompt, options = {} } = await c.req.json();

    if (!prompt) {
      return c.json({ error: 'Prompt is required' }, 400);
    }

    const stream = await aiAgents.streamWithAgent(agentId, prompt, options);
    
    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const data = `data: ${JSON.stringify(chunk)}\n\n`;
              controller.enqueue(new TextEncoder().encode(data));
            }
            controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          } catch (error) {
            controller.error(error);
          } finally {
            controller.close();
          }
        }
      }),
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      }
    );
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Funciones especializadas de agentes
app.post('/api/hooks/create', async (c) => {
  try {
    const { platform, topic, style = 'viral' } = await c.req.json();
    const result = await aiAgents.createHook(platform, topic, style);
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

app.post('/api/trends/analyze', async (c) => {
  try {
    const { topic, timeframe = '7 days' } = await c.req.json();
    const result = await aiAgents.analyzeTrend(topic, timeframe);
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

app.post('/api/content/optimize', async (c) => {
  try {
    const { content, metrics, goal = 'engagement' } = await c.req.json();
    const result = await aiAgents.optimizeContent(content, metrics, goal);
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

app.post('/api/thumbnails/design', async (c) => {
  try {
    const { videoTitle, targetAudience, platform = 'youtube' } = await c.req.json();
    const result = await aiAgents.designThumbnail(videoTitle, targetAudience, platform);
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// ==========================================
// ENDPOINTS PARA ADMIN.FLOWMATIK.CO (TERMINAL)
// ==========================================

// Chat con Doubao 1.5-pro y memoria eterna
app.post('/api/terminal/chat', async (c) => {
  try {
    const { message, sessionId, agentId = 'flowi-ceo', options = {} } = await c.req.json();

    if (!message) {
      return c.json({ error: 'Message is required' }, 400);
    }

    // Obtener contexto de memoria eterna
    let context = {};
    if (eternalMemory && sessionId) {
      context = await eternalMemory.getSessionContext(sessionId);
    }

    // Generar respuesta con agente
    const result = await aiAgents.generateWithAgent(agentId, message, {
      ...options,
      context
    });

    // Guardar en memoria eterna
    if (eternalMemory && sessionId) {
      await eternalMemory.storeConversation({
        sessionId,
        userMessage: message,
        assistantResponse: result.content,
        agentId,
        metadata: { 
          cost: result.cost, 
          model: result.model,
          deepThinking: result.reasoning ? true : false
        }
      });
    }

    return c.json({
      ...result,
      sessionId,
      memoryActive: !!eternalMemory
    });
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Chat streaming para terminal
app.post('/api/terminal/chat/stream', async (c) => {
  try {
    const { message, sessionId, agentId = 'flowi-ceo', options = {} } = await c.req.json();

    if (!message) {
      return c.json({ error: 'Message is required' }, 400);
    }

    // Obtener contexto de memoria
    let context = {};
    if (eternalMemory && sessionId) {
      context = await eternalMemory.getSessionContext(sessionId);
    }

    const stream = await aiAgents.streamWithAgent(agentId, message, {
      ...options,
      context
    });

    return new Response(
      new ReadableStream({
        async start(controller) {
          let fullResponse = '';
          try {
            for await (const chunk of stream) {
              if (chunk.type === 'content') {
                fullResponse += chunk.content;
              }
              const data = `data: ${JSON.stringify(chunk)}\n\n`;
              controller.enqueue(new TextEncoder().encode(data));
            }
            
            // Guardar respuesta completa en memoria
            if (eternalMemory && sessionId && fullResponse) {
              await eternalMemory.storeConversation({
                sessionId,
                userMessage: message,
                assistantResponse: fullResponse,
                agentId,
                metadata: { streaming: true }
              });
            }
            
            controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          } catch (error) {
            controller.error(error);
          } finally {
            controller.close();
          }
        }
      }),
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      }
    );
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Comandos naturales para terminal
app.post('/api/terminal/command', async (c) => {
  try {
    const { command, sessionId } = await c.req.json();

    // Interpretar comando con FLOWI CEO
    const interpretation = await aiAgents.generateWithAgent('flowi-ceo', 
      `Interpreta este comando de terminal y ejecuta la acción correspondiente: "${command}"`
    );

    return c.json({
      command,
      interpretation: interpretation.content,
      executed: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Estado del sistema para terminal
app.get('/api/terminal/status', async (c) => {
  try {
    const status = await aiAgents.getSystemStats();
    const memoryStatus = eternalMemory ? await eternalMemory.getStats() : null;
    const doubaoStatus = await doubaoIntegration.getUsageStats();

    return c.json({
      system: 'Flowmatik Terminal',
      status: 'operational',
      agents: status,
      memory: memoryStatus,
      doubao: doubaoStatus,
      uptime: process.uptime ? `${Math.floor(process.uptime())}s` : 'N/A',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Backup manual
app.post('/api/terminal/backup', async (c) => {
  try {
    if (!eternalMemory) {
      return c.json({ error: 'Memory system not available' }, 503);
    }

    const backup = await eternalMemory.createBackup();
    return c.json({
      backup,
      message: 'Backup created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// ==========================================
// ANÁLISIS MULTIMODAL
// ==========================================

app.post('/api/analyze/image', async (c) => {
  try {
    const { imageUrl, analysisType = 'general', agentId = 'trend-researcher' } = await c.req.json();

    if (!imageUrl) {
      return c.json({ error: 'Image URL is required' }, 400);
    }

    const result = await doubaoIntegration.analyzeImage(imageUrl, analysisType);
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

app.post('/api/content/optimize-platform', async (c) => {
  try {
    const { content, platform, contentType = 'post' } = await c.req.json();

    if (!content || !platform) {
      return c.json({ error: 'Content and platform are required' }, 400);
    }

    const result = await doubaoIntegration.optimizeForPlatform(content, platform, contentType);
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

app.post('/api/content/series', async (c) => {
  try {
    const { topic, platform, episodes = 5 } = await c.req.json();

    if (!topic || !platform) {
      return c.json({ error: 'Topic and platform are required' }, 400);
    }

    const result = await doubaoIntegration.generateContentSeries(topic, platform, episodes);
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// ==========================================
// MEMORIA Y CONTEXTO
// ==========================================

app.get('/api/memory/sessions/:sessionId', async (c) => {
  try {
    if (!eternalMemory) {
      return c.json({ error: 'Memory system not available' }, 503);
    }

    const sessionId = c.req.param('sessionId');
    const context = await eternalMemory.getSessionContext(sessionId);
    
    return c.json({
      sessionId,
      context,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

app.post('/api/memory/search', async (c) => {
  try {
    if (!eternalMemory) {
      return c.json({ error: 'Memory system not available' }, 503);
    }

    const { query, limit = 10 } = await c.req.json();
    const results = await eternalMemory.semanticSearch(query, limit);
    
    return c.json({
      query,
      results,
      count: results.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// ==========================================
// INICIALIZACIÓN Y EXPORT
// ==========================================

export default {
  async fetch(request, env, ctx) {
    try {
      // Inicializar sistemas si no están inicializados
      if (!aiAgents) {
        aiAgents = new AIAgentSystem(env);
        await aiAgents.initialize();
      }

      if (!eternalMemory) {
        eternalMemory = new EternalMemory(env);
        await eternalMemory.initialize();
      }

      if (!doubaoIntegration) {
        doubaoIntegration = new DoubaoIntegration(env);
        await doubaoIntegration.initialize();
      }

      return app.fetch(request, env, ctx);
    } catch (error) {
      console.error('Error in fetch handler:', error);
      return new Response(JSON.stringify({
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};

