import { useEffect, useId, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type Task = {
  id: string
  title: string
  completed: boolean
}

const TASKS_STORAGE_KEY = 'task-manager.tasks'

const initialTasks: Task[] = [
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

function loadStoredTasks(): Task[] {
  if (typeof window === 'undefined') {
    return initialTasks
  }

  const storedTasks = window.localStorage.getItem(TASKS_STORAGE_KEY)

  if (!storedTasks) {
    return initialTasks
  }

  try {
    const parsedTasks = JSON.parse(storedTasks) as unknown

    if (!Array.isArray(parsedTasks)) {
      return initialTasks
    }

    return parsedTasks.filter(
      (task): task is Task =>
        typeof task === 'object' &&
        task !== null &&
        'id' in task &&
        'title' in task &&
        'completed' in task &&
        typeof task.id === 'string' &&
        typeof task.title === 'string' &&
        typeof task.completed === 'boolean',
    )
  } catch {
    return initialTasks
  }
}

function App() {
  const [tasks, setTasks] = useState<Task[]>(loadStoredTasks)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const inputId = useId()

  useEffect(() => {
    window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  const completedCount = tasks.filter((task) => task.completed).length
  const pendingCount = tasks.length - completedCount

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextTitle = draft.trim()

    if (!nextTitle) {
      setError('Enter a task before adding it to the board.')
      return
    }

    setTasks((currentTasks) => [
      {
        id: crypto.randomUUID(),
        title: nextTitle,
        completed: false,
      },
      ...currentTasks,
    ])
    setDraft('')
    setError('')
  }

  const toggleTask = (taskId: string) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? { ...task, completed: !task.completed }
          : task,
      ),
    )
  }

  const deleteTask = (taskId: string) => {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== taskId),
    )
  }

  return (
    <main className="app-shell">
      <section className="hero-panel" aria-labelledby="task-board-title">
        <p className="eyebrow">React + TypeScript + Vite</p>
        <h1 id="task-board-title">Task board for teams that ship on time.</h1>
        <p className="hero-copy">
          Capture work quickly, focus on what is still open, and keep completed
          items visible without turning the interface into clutter.
        </p>

        <dl className="stats" aria-label="Task summary">
          <div>
            <dt>Total tasks</dt>
            <dd>{tasks.length}</dd>
          </div>
          <div>
            <dt>Completed</dt>
            <dd>{completedCount}</dd>
          </div>
          <div>
            <dt>Pending</dt>
            <dd>{pendingCount}</dd>
          </div>
        </dl>
      </section>

      <section className="board-panel" aria-labelledby="task-form-title">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Today</p>
            <h2 id="task-form-title">Manage your queue</h2>
          </div>
          <span className="status-pill">{pendingCount} open items</span>
        </div>

        <form className="task-form" onSubmit={handleSubmit} noValidate>
          <label className="sr-only" htmlFor={inputId}>
            Task title
          </label>
          <input
            id={inputId}
            name="task"
            type="text"
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value)
              if (error) {
                setError('')
              }
            }}
            placeholder="Add a task, milestone, or follow-up"
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : undefined}
          />
          <button type="submit">Add task</button>
        </form>

        {error ? (
          <p className="form-error" id={`${inputId}-error`} role="alert">
            {error}
          </p>
        ) : null}

        <ul className="task-list" aria-label="Task items">
          {tasks.map((task) => (
            <li className="task-card" key={task.id}>
              <div className="task-main">
                <input
                  id={`task-${task.id}`}
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  aria-describedby={`task-status-${task.id}`}
                />
                <div className="task-copy">
                  <label className="task-label" htmlFor={`task-${task.id}`}>
                    <strong>{task.title}</strong>
                  </label>
                  <small id={`task-status-${task.id}`}>
                    {task.completed ? 'Completed and archived for reference.' : 'Pending and ready for action.'}
                  </small>
                </div>
              </div>
              <button
                type="button"
                className="ghost-button"
                onClick={() => deleteTask(task.id)}
                aria-label={`Delete ${task.title}`}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}

export default App
