import { createServer } from 'node:http'
import pg from 'pg'

const { Pool } = pg

const PORT = 3001

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.PGHOST ?? 'localhost',
  port: Number(process.env.PGPORT ?? 5432),
  database: process.env.PGDATABASE ?? 'tasks',
  user: process.env.PGUSER ?? 'postgres',
  password: process.env.PGPASSWORD ?? '',
})

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id        TEXT        PRIMARY KEY,
      title     TEXT        NOT NULL,
      completed BOOLEAN     NOT NULL DEFAULT FALSE,
      position  INTEGER     NOT NULL DEFAULT 0
    )
  `)
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
  })
  response.end(JSON.stringify(payload))
}

function normalizeTasks(tasks) {
  if (!Array.isArray(tasks)) {
    return null
  }

  const normalized = tasks.filter(
    (task) =>
      task &&
      typeof task === 'object' &&
      typeof task.id === 'string' &&
      typeof task.title === 'string' &&
      typeof task.completed === 'boolean',
  )

  return normalized
}

async function readTasksFromDb() {
  const result = await pool.query(
    'SELECT id, title, completed FROM tasks ORDER BY position ASC, id ASC',
  )
  return result.rows.map((row) => ({
    id: row.id,
    title: row.title,
    completed: row.completed,
  }))
}

async function writeTasksToDb(tasks) {
  const normalizedTasks = normalizeTasks(tasks)

  if (!normalizedTasks) {
    return { ok: false, message: 'Tasks payload must be a valid task array.' }
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query('DELETE FROM tasks')

    if (normalizedTasks.length > 0) {
      const ids = normalizedTasks.map((t) => t.id)
      const titles = normalizedTasks.map((t) => t.title)
      const completeds = normalizedTasks.map((t) => t.completed)
      const positions = normalizedTasks.map((_, i) => i)

      await client.query(
        `INSERT INTO tasks (id, title, completed, position)
         SELECT * FROM unnest($1::text[], $2::text[], $3::boolean[], $4::int[])`,
        [ids, titles, completeds, positions],
      )
    }

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }

  return { ok: true }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', `http://${request.headers.host}`)

  if (url.pathname !== '/api/tasks') {
    sendJson(response, 404, { error: 'Not found.' })
    return
  }

  if (request.method === 'GET') {
    try {
      const tasks = await readTasksFromDb()
      sendJson(response, 200, { tasks })
    } catch (error) {
      sendJson(response, 500, {
        error: error instanceof Error ? error.message : 'Failed to read tasks.',
      })
    }
    return
  }

  if (request.method === 'PUT') {
    let body = ''

    for await (const chunk of request) {
      body += chunk
    }

    try {
      const parsedBody = JSON.parse(body)
      const result = await writeTasksToDb(parsedBody?.tasks)

      if (!result.ok) {
        sendJson(response, 400, { error: result.message })
        return
      }

      sendJson(response, 200, { ok: true })
    } catch (error) {
      sendJson(response, 400, {
        error:
          error instanceof Error
            ? error.message
            : 'Invalid JSON payload received.',
      })
    }
    return
  }

  sendJson(response, 405, { error: 'Method not allowed.' })
})

initDb()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Task backend listening on http://localhost:${PORT}`)
    })
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error.message)
    process.exit(1)
  })
