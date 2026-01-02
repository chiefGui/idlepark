import * as Ariakit from '@ariakit/react'

export type DrawerStore = Ariakit.DialogStore

export function useDrawerStore(props?: Ariakit.DialogStoreProps): DrawerStore {
  return Ariakit.useDialogStore(props)
}

export function useDrawerContext(): DrawerStore {
  const store = Ariakit.useDialogContext()
  if (!store) {
    throw new Error('Drawer components must be used within a Drawer')
  }
  return store
}
