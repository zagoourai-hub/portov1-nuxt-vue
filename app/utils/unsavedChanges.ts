export function confirmDiscardChanges(current: unknown, saved: string, confirm: () => boolean) {
  return JSON.stringify(current) === saved || confirm()
}
