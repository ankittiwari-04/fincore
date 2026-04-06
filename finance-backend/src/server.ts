import app from './app';
import { config } from './config/env';

app.listen(config.port, '0.0.0.0', () => {
  console.log(`Server running on port ${config.port}`);
  if (config.nodeEnv === 'production' && config.frontendOrigins.length === 0) {
    console.warn(
      'FRONTEND_URL is not set — CORS allows any origin. Set FRONTEND_URL to your deployed frontend URL(s) for tighter security.'
    );
  }
});
