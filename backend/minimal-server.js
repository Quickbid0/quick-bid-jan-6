// Minimal backend test
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: `${__dirname}/.env` });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PORT = process.env.LIVE_BACKEND_PORT || 4010;

console.log('Starting minimal backend test...');
console.log('PORT:', PORT);
console.log('SUPABASE_URL:', SUPABASE_URL ? 'Set' : 'Not set');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

try {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  console.log('Supabase client created');

  const app = express();

  // CORS configuration
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-CSRF-Token, X-Client-Version, X-Requested-At');

    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  app.use(express.json());

  app.get('/api/test', async (req, res) => {
    try {
      const { data, error } = await supabase.from('users').select('count').limit(1);
      if (error) {
        return res.status(500).json({ error: error.message });
      }
      res.json({ message: 'Backend working', userCount: data?.length || 0 });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.listen(PORT, () => {
    console.log(`Minimal backend listening on http://localhost:${PORT}`);
    console.log('Test endpoint: http://localhost:' + PORT + '/api/test');
  });

} catch (err) {
  console.error('Failed to start minimal backend:', err);
  process.exit(1);
}
