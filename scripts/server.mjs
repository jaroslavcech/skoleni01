import { createServer } from 'node:http'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const PORT = 3001
const DATA_FILE = resolve(process.cwd(), 'data/tasks.json')
const DATA_DIR = dirname(DATA_FILE)

const fallbackTasks = [
  {
    id: 'outline-launch-checklist',
    title: 'Outline launch checklist',
    completed: true,
  },
  {
    id: 'draft-onboarding-copy',
    title: 'Draft onboarding copy',
    completed: false,
  },
  {
    id: 'test-mobile-task-flow',
    title: 'Test mobile task flow',
    completed: false,
  },
]

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

async function readTasksFromDisk() {
  if (!existsSync(DATA_FILE)) {
    await mkdir(DATA_DIR, { recursive: true })
    await writeFile(
      DATA_FILE,
      JSON.stringify({ version: 1, tasks: fallbackTasks }, null, 2),
      'utf8',
    )
    return fallbackTasks
  }

  const rawContent = await readFile(DATA_FILE, 'utf8')

  try {
    const parsedContent = JSON.parse(rawContent)
    const tasks = normalizeTasks(parsedContent?.tasks)

    if (!tasks) {
      throw new Error('Invalid tasks payload.')
    }

    return tasks
  } catch (error) {
    throw new Error('Stored task JSON is invalid or corrupted.')
  }
}

async function writeTasksToDisk(tasks) {
  const normalizedTasks = normalizeTasks(tasks)

  if (!normalizedTasks) {
    return { ok: false, message: 'Tasks payload must be a valid task array.' }
  }

  await mkdir(DATA_DIR, { recursive: true })
  await writeFile(
    DATA_FILE,
    JSON.stringify({ version: 1, tasks: normalizedTasks }, null, 2),
    'utf8',
  )

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
      const tasks = await readTasksFromDisk()
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
      const result = await writeTasksToDisk(parsedBody?.tasks)

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

server.listen(PORT, () => {
  console.log(`Task backend listening on http://localhost:${PORT}`)
})
