/** Browser entry for the mobile layout plugin. */

/** Declared client dependencies used by the mobile shell. */
export const inject = [
  'slots',
  'sessions',
  'workspaces',
  'locale',
] as const

/** Registers the mobile shell once the layout extension point is available. */
export function apply(): void {}
