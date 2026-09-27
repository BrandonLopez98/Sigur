require('dotenv').config()
const { conn } = require('../src/db')

async function migrate() {
  try {
    await conn.authenticate()

    await conn.transaction(async (transaction) => {
      await conn.query(`
        ALTER TABLE public."Queries"
          ADD COLUMN IF NOT EXISTS provider_poll_attempts INTEGER NOT NULL DEFAULT 0,
          ADD COLUMN IF NOT EXISTS provider_last_polled_at TIMESTAMP WITH TIME ZONE,
          ADD COLUMN IF NOT EXISTS provider_next_poll_at TIMESTAMP WITH TIME ZONE,
          ADD COLUMN IF NOT EXISTS provider_started_at TIMESTAMP WITH TIME ZONE,
          ADD COLUMN IF NOT EXISTS provider_retry_count INTEGER NOT NULL DEFAULT 0;
      `, { transaction })

      await conn.query(`
        CREATE INDEX IF NOT EXISTS "Queries_status_next_poll_idx"
          ON public."Queries" (status, provider_next_poll_at)
          WHERE status IN ('pending', 'processing');
      `, { transaction })

      await conn.query(`
        CREATE INDEX IF NOT EXISTS "Queries_user_document_recent_idx"
          ON public."Queries" (user_id, document_type, document_number, created_at DESC)
          WHERE status <> 'failed';
      `, { transaction })
    })

    console.log('Migración de seguimiento de Tusdatos completada.')
  } finally {
    await conn.close()
  }
}

migrate().catch((error) => {
  console.error('No fue posible ejecutar la migración:', error.message)
  process.exitCode = 1
})
