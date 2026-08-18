# Mobile shell integration

## Host-side extension required

The shipped layout currently owns the exclusive `root` slot and renders `AppFrame`. A third-party plugin must not register a second `root` occupant because that would conflict with the desktop layout and remove its child slots.

The smallest host extension is a `root.mobile` child slot declared by the layout owner:

```ts
'root.mobile': { kind: 'single', scope: 'root' }
```

The layout owner renders this slot only when its measured frame width is below the mobile breakpoint. The desktop `AppFrame` remains responsible for all existing columns when the breakpoint is not active.

The mobile slot owner receives no business objects. It uses the standard root shares:

- `useSessions` for the workspace/session list and current session;
- `useWorkspaces` for workspace grouping and session creation;
- the declared locale and injected callbacks for navigation actions.

The mobile shell keeps its own transient navigation state:

```ts
type MobileRoute = 'session-list' | 'conversation'
```

Selecting a session calls the existing runtime session-selection action and changes the local route to `conversation`. The back action changes only the local route; it does not archive, dispose, or mutate the session.

## Why this is a host extension

The existing `conversation` and `sidebar` slots are exclusive occupants of separate desktop columns. Registering a mobile component into either one cannot create a two-screen mobile navigation flow, and registering another root occupant would conflict with `ui-layout`. The additive mobile child slot keeps ownership and teardown with the shipped layout while allowing the mobile presentation to remain independently installable.

## Compatibility target

The plugin must work when the host provides `root.mobile`. On hosts without that slot it should remain inert and leave the desktop composition unchanged.
