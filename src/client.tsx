/** Mobile session navigation overlay. */
import { useState } from 'react'
import type { ClientContext, SessionId, WorkspaceId, SessionSummary, WorkspaceView } from '@deepseek-ai/dsh-client-runtime/client'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { CSSProperties, ReactNode } from 'react'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface SlotMap {
    'shell.overlay': { kind: 'list'; scope: 'root'; owner: Record<string, never> }
  }
}

type MobileOverlayProps = PropsRuntime<'shell.overlay'> & MobileInjected

interface MobileInjected {
  open: (sessionId: SessionId) => void
  startSession: (workspaceId?: WorkspaceId) => void
}

type Route = 'list' | 'conversation'

const overlayStyle: CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 40, display: 'flex', flexDirection: 'column',
  background: 'var(--dsw-alias-bg-base, #fff)', color: 'var(--dsw-alias-label-primary, #111)',
}

const headerStyle: CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  minHeight: 64, padding: 'env(safe-area-inset-top) 18px 0', boxSizing: 'content-box',
}

const actionStyle: CSSProperties = {
  border: 0, borderRadius: 999, padding: '10px 14px', background: 'transparent',
  color: 'inherit', fontSize: 16,
}

function MobileShell({ useSessions, useWorkspaces, open, startSession }: MobileOverlayProps): ReactNode {
  const [route, setRoute] = useState<Route>('list')
  const sessions = useSessions(state => state)
  const workspaces = useWorkspaces(state => state)
  const archived = new Set(workspaces.archivedSessionIds)
  const visible = sessions.ids
    .map(id => sessions.byId[id])
    .filter((session): session is SessionSummary => session !== undefined && !archived.has(session.id))
  const grouped = new Map<WorkspaceId, { workspace: WorkspaceView; sessions: SessionSummary[] }>()
  for (const workspace of workspaces.items) grouped.set(workspace.workspaceId, { workspace, sessions: [] })
  for (const session of visible) {
    const group = workspaces.items.find(workspace => workspace.sessionIds.includes(session.id))
    if (group !== undefined) grouped.get(group.workspaceId)?.sessions.push(session)
  }

  if (route === 'conversation') {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, zIndex: 41, paddingTop: 'env(safe-area-inset-top)' }}>
        <button type="button" style={actionStyle} aria-label="返回会话列表" onClick={() => setRoute('list')}>‹ 会话</button>
      </div>
    )
  }

  return (
    <div style={overlayStyle}>
      <header style={headerStyle}>
        <strong style={{ fontSize: 24 }}>万物智汇</strong>
        <button type="button" style={actionStyle} onClick={() => startSession()}>新建会话</button>
      </header>
      <main style={{ flex: 1, overflowY: 'auto', padding: '20px 18px calc(96px + env(safe-area-inset-bottom))' }}>
        <h1 style={{ margin: '8px 0 24px', fontSize: 30 }}>会话</h1>
        {Array.from(grouped.values()).map(({ workspace, sessions: rows }) => (
          <section key={workspace.workspaceId} style={{ marginBottom: 26 }}>
            <h2 style={{ margin: '0 0 10px', fontSize: 17, opacity: 0.72 }}>{workspace.title}</h2>
            {rows.map(session => (
              <button
                key={session.id}
                type="button"
                style={{ display: 'block', width: '100%', margin: '4px 0', padding: '15px 0', border: 0, borderBottom: '1px solid color-mix(in srgb, currentColor 12%, transparent)', background: 'transparent', color: 'inherit', textAlign: 'left', fontSize: 18 }}
                onClick={() => { open(session.id); setRoute('conversation') }}
              >
                {session.displayTitle}
              </button>
            ))}
            {rows.length === 0 && <p style={{ opacity: 0.55 }}>暂无会话</p>}
          </section>
        ))}
        {grouped.size === 0 && <p style={{ opacity: 0.65 }}>还没有工作区</p>}
      </main>
    </div>
  )
}

/** Client services required by the mobile overlay. */
export const inject = ['slots', 'sessions', 'workspaces']

/** Register an additive mobile overlay; hosts without the slot remain unchanged. */
export function apply(ctx: ClientContext): void {
  ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay',
    id: 'dsh-mobile-layout',
    inject: (): MobileInjected => ({
      open: id => { ctx.sessions.open(id) },
      startSession: workspaceId => { ctx.workspaces.startSession(workspaceId) },
    }),
  }, MobileShell))
}
