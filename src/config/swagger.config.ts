import { type INestApplication, Logger } from "@nestjs/common";
import { DocumentBuilder, type SwaggerCustomOptions, SwaggerModule } from "@nestjs/swagger";

/**
 * Custom client-side search script injected into Swagger UI.
 * Intercepts SwaggerUIBundle to provide case-insensitive filtering across:
 * - Tag names
 * - Paths (e.g. /admin/leads, /tasks)
 * - HTTP methods (GET, POST, PATCH, DELETE)
 * - Operation summaries and descriptions
 * - Operation IDs
 */
export const SWAGGER_FILTER_SCRIPT = `
(function() {
  var FilterPlugin = function() {
    return {
      fn: {
        opsFilter: function(taggedOps, phrase) {
          if (!phrase || typeof phrase !== 'string') return taggedOps;
          var q = phrase.trim().toLowerCase();
          if (!q) return taggedOps;

          try {
            return taggedOps.map(function(tagObj, tag) {
              var tagStr = String(tag || '').toLowerCase();
              var tagMatches = tagStr.indexOf(q) !== -1;
              var ops = tagObj ? tagObj.get('operations') : null;
              if (!ops) return tagObj;

              if (tagMatches) return tagObj;

              var filteredOps = ops.filter(function(op) {
                try {
                  var path = String(op.get('path') || '').toLowerCase();
                  var method = String(op.get('method') || '').toLowerCase();
                  var summary = String(op.getIn(['operation', 'summary']) || '').toLowerCase();
                  var desc = String(op.getIn(['operation', 'description']) || '').toLowerCase();
                  var opId = String(op.getIn(['operation', 'operationId']) || '').toLowerCase();

                  return path.indexOf(q) !== -1 ||
                         method.indexOf(q) !== -1 ||
                         summary.indexOf(q) !== -1 ||
                         desc.indexOf(q) !== -1 ||
                         opId.indexOf(q) !== -1;
                } catch (err) {
                  return false;
                }
              });

              return tagObj.set('operations', filteredOps);
            }).filter(function(tagObj, tag) {
              var tagStr = String(tag || '').toLowerCase();
              if (tagStr.indexOf(q) !== -1) return true;
              var ops = tagObj ? tagObj.get('operations') : null;
              return ops && ops.size > 0;
            });
          } catch (e) {
            console.error("Filter error:", e);
            return taggedOps.filter(function(tagObj, tag) {
              return String(tag || '').toLowerCase().indexOf(q) !== -1;
            });
          }
        }
      }
    };
  };

  var initInterceptor = function() {
    if (typeof SwaggerUIBundle !== 'undefined') {
      var originalSwaggerUIBundle = SwaggerUIBundle;
      window.SwaggerUIBundle = function(config) {
        config = config || {};
        config.plugins = (config.plugins || []).concat([FilterPlugin]);
        return originalSwaggerUIBundle(config);
      };
      Object.assign(window.SwaggerUIBundle, originalSwaggerUIBundle);
    } else {
      setTimeout(initInterceptor, 20);
    }
  };
  initInterceptor();

  function updatePlaceholder() {
    var input = document.querySelector('.operation-filter-input');
    if (input) {
      input.placeholder = "Filter by keyword (e.g. leads, auth, POST, /tasks)...";
    } else {
      setTimeout(updatePlaceholder, 300);
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updatePlaceholder);
  } else {
    updatePlaceholder();
  }
})();
`;

/**
 * Custom dark theme styling for Swagger UI matching the Ember/MarineCloudX theme.
 */
export const SWAGGER_CUSTOM_CSS = `
  body { background-color: #161b22; color: #c9d1d9; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
  .swagger-ui .topbar { background-color: #0d1117; border-bottom: 1px solid #30363d; padding: 10px 0; }
  .swagger-ui .info { margin: 25px 0 20px; }
  .swagger-ui .info .title { color: #f0f6fc; font-size: 32px; font-weight: 700; }
  .swagger-ui .info .title small { background: #238636; color: #ffffff; border-radius: 4px; padding: 2px 8px; font-size: 13px; font-weight: 600; margin-left: 10px; }
  .swagger-ui .info .title small.version-stamp { background: #388bfd; }
  .swagger-ui .info p, .swagger-ui .info li { color: #8b949e; font-size: 14px; margin-top: 6px; }
  .swagger-ui .scheme-container { background-color: transparent; box-shadow: none; padding: 15px 0; border-bottom: 1px solid #21262d; margin-bottom: 20px; }
  .swagger-ui .servers > label { color: #8b949e; font-weight: 600; font-size: 12px; text-transform: uppercase; margin-bottom: 6px; }
  .swagger-ui .servers > label select { background-color: #0d1117; color: #f0f6fc; border: 1px solid #30363d; border-radius: 6px; padding: 8px 12px; font-size: 14px; width: 100%; max-width: 450px; }
  .swagger-ui .btn.authorize { background: transparent; color: #3fb950; border: 1px solid #238636; border-radius: 6px; font-weight: 600; padding: 6px 16px; transition: all 0.2s; }
  .swagger-ui .btn.authorize:hover { background: #238636; color: #fff; }
  .swagger-ui .btn.authorize svg { fill: #3fb950; }
  .swagger-ui .btn.authorize:hover svg { fill: #fff; }
  .swagger-ui .wrapper { max-width: 1400px; padding: 0 24px; }
  .swagger-ui .opblock-tag { color: #f0f6fc; font-size: 18px; border-bottom: 1px solid #30363d; padding: 12px 0; }
  .swagger-ui .opblock-tag small { color: #8b949e; }
  .swagger-ui .opblock { border-radius: 6px; margin: 0 0 12px; box-shadow: none; border: 1px solid #30363d; background: #0d1117; }
  .swagger-ui .opblock .opblock-summary { padding: 10px 14px; }
  .swagger-ui .opblock .opblock-summary-method { border-radius: 4px; font-weight: 700; font-size: 13px; min-width: 70px; }
  .swagger-ui .opblock .opblock-summary-path { color: #f0f6fc; font-size: 14px; font-weight: 600; }
  .swagger-ui .opblock .opblock-summary-description { color: #8b949e; font-size: 13px; }
  .swagger-ui .opblock.opblock-get { border-color: #1f3d5c; background: rgba(56, 139, 253, 0.06); }
  .swagger-ui .opblock.opblock-get .opblock-summary-method { background: #1f6feb; }
  .swagger-ui .opblock.opblock-post { border-color: #1b4b2f; background: rgba(46, 160, 67, 0.06); }
  .swagger-ui .opblock.opblock-post .opblock-summary-method { background: #238636; }
  .swagger-ui .opblock.opblock-patch { border-color: #593c13; background: rgba(210, 153, 34, 0.06); }
  .swagger-ui .opblock.opblock-patch .opblock-summary-method { background: #9e6a03; }
  .swagger-ui .opblock.opblock-delete { border-color: #591e24; background: rgba(248, 81, 73, 0.06); }
  .swagger-ui .opblock.opblock-delete .opblock-summary-method { background: #da3633; }
  .swagger-ui .filter .operation-filter-input { background: #0d1117; color: #f0f6fc; border: 1px solid #30363d; border-radius: 6px; padding: 8px 12px; margin: 15px 0; }
  .swagger-ui section.models { border: 1px solid #30363d; border-radius: 6px; background: #0d1117; }
  .swagger-ui section.models h4 { color: #f0f6fc; }
  .swagger-ui .model-box { background: #161b22; }
  .swagger-ui .dialog-ux .modal-ux { background: #161b22; border: 1px solid #30363d; color: #c9d1d9; }
  .swagger-ui .dialog-ux .modal-ux-header { border-bottom: 1px solid #30363d; }
  .swagger-ui .dialog-ux .modal-ux-header h3 { color: #f0f6fc; }
  .swagger-ui .dialog-ux .modal-ux-content h4 { color: #f0f6fc; }
  .swagger-ui input[type=text], .swagger-ui input[type=password] { background: #0d1117; color: #f0f6fc; border: 1px solid #30363d; }
`;

/**
 * Initializes and mounts Swagger UI at `/api/docs`.
 */
export function setupSwagger(app: INestApplication, port: number): void {
  const swaggerConfig = new DocumentBuilder()
    .setTitle("MarineCloudX API")
    .setDescription("API Documentation")
    .setVersion("1.0")
    .addServer(`http://localhost:${port}`, "Local Server")
    .addServer("https://dev-api.marinecloudx.in", "Development Server")
    .addServer("https://api.marinecloudx.in", "Production Server")
    // Cookie-based session auth
    .addCookieAuth(
      process.env.AUTH_COOKIE_NAME ?? "mcx_session",
      {
        type: "apiKey",
        in: "cookie",
        name: process.env.AUTH_COOKIE_NAME ?? "mcx_session",
        description: "Session cookie set automatically by POST /auth/login",
      },
      "mcx_session",
    )
    .addTag("Health", "Liveness and readiness probes")
    .addTag("Auth", "Login, logout, session and token refresh")
    .addTag("Public — Leads", "Anonymous lead capture (website forms, chatbot)")
    .addTag("Public — Blog", "Published blog posts — no auth required")
    .addTag("Public — Services", "Published services — no auth required")
    .addTag("Public — Industries", "Active industries — no auth required")
    .addTag("Public — Projects", "Published projects — no auth required")
    .addTag("Public — Case Studies", "Published case studies — no auth required")
    .addTag("Public — Testimonials", "Published testimonials — no auth required")
    .addTag("Public — FAQs", "Published FAQs — no auth required")
    .addTag("Public — Conversations", "Visitor chat sessions — no auth required")
    .addTag("Public — Utilities", "Sitemap and other public utility endpoints")
    .addTag("Admin — Leads", "Lead management — requires crm:read / crm:write capability")
    .addTag("Admin — Contacts", "Contact management — requires crm:read / crm:write capability")
    .addTag("Admin — Tasks", "Task management — requires crm:read / crm:write capability")
    .addTag("Admin — CRM", "CRM config, dashboard and pipeline board — requires crm:read")
    .addTag("Admin — CMS", "Headless CMS for all 12 content types — requires cms:read / cms:write")
    .addTag("Admin — Media", "Media upload and deletion — requires cms:read / cms:write")
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: "none",
      filter: true,
      tagsSorter: "alpha",
      operationsSorter: "alpha",
      tryItOutEnabled: true,
      requestSnippetsEnabled: true,
    },
    customSiteTitle: "MarineCloudX API Docs",
    customCssUrl: [
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.2/swagger-ui.min.css",
    ],
    customJsStr: SWAGGER_FILTER_SCRIPT,
    customCss: SWAGGER_CUSTOM_CSS,
  };

  SwaggerModule.setup("api/docs", app, document, customOptions);
}
