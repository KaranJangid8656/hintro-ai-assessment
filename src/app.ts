import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import routes from './routes';
import { traceIdMiddleware } from './middleware/traceId';
import { requestLoggerMiddleware } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { swaggerSpec } from './docs/swagger';

export function createApp() {
  const app = express();

  app.use(cors({ origin: '*' }));
  app.use(express.json({ limit: '2mb' }));
  app.use(traceIdMiddleware);
  app.use(requestLoggerMiddleware);

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api-docs.json', (_req, res) => {
    res.json(swaggerSpec);
  });

  app.use(routes);

  app.use(errorHandler);

  return app;
}
