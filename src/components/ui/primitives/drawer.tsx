import { forwardRef, type ReactNode, type ComponentPropsWithoutRef } from 'react'
import * as Ariakit from '@ariakit/react'
import { motion, AnimatePresence } from 'framer-motion'

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

type DrawerRootProps = {
  store: DrawerStore
  children: ReactNode
}

export function DrawerRoot({ store, children }: DrawerRootProps) {
  return (
    <Ariakit.DialogProvider store={store}>
      {children}
    </Ariakit.DialogProvider>
  )
}

type DrawerTriggerProps = ComponentPropsWithoutRef<typeof Ariakit.DialogDisclosure>

export const DrawerTrigger = forwardRef<HTMLButtonElement, DrawerTriggerProps>(
  function DrawerTrigger(props, ref) {
    return <Ariakit.DialogDisclosure ref={ref} {...props} />
  }
)

type DrawerContentProps = {
  children: ReactNode
  className?: string
  side?: 'left' | 'right'
}

export function DrawerContent({ children, className, side = 'left' }: DrawerContentProps) {
  const store = useDrawerContext()
  const open = store.useState('open')

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40"
            onClick={() => store.hide()}
          />
          <Ariakit.Dialog
            store={store}
            backdrop={false}
            portal
            unmountOnHide
            modal={false}
            autoFocusOnShow={false}
            render={
              <motion.div
                initial={{ x: side === 'left' ? '-100%' : '100%' }}
                animate={{ x: 0 }}
                exit={{ x: side === 'left' ? '-100%' : '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              />
            }
            className={`fixed inset-y-0 ${side === 'left' ? 'left-0' : 'right-0'} z-50 outline-none ${className ?? ''}`}
          >
            {children}
          </Ariakit.Dialog>
        </>
      )}
    </AnimatePresence>
  )
}

type DrawerCloseProps = ComponentPropsWithoutRef<typeof Ariakit.DialogDismiss>

export const DrawerClose = forwardRef<HTMLButtonElement, DrawerCloseProps>(
  function DrawerClose(props, ref) {
    return <Ariakit.DialogDismiss ref={ref} {...props} />
  }
)

type DrawerTitleProps = ComponentPropsWithoutRef<typeof Ariakit.DialogHeading>

export const DrawerTitle = forwardRef<HTMLHeadingElement, DrawerTitleProps>(
  function DrawerTitle(props, ref) {
    return <Ariakit.DialogHeading ref={ref} {...props} />
  }
)

type DrawerDescriptionProps = ComponentPropsWithoutRef<typeof Ariakit.DialogDescription>

export const DrawerDescription = forwardRef<HTMLParagraphElement, DrawerDescriptionProps>(
  function DrawerDescription(props, ref) {
    return <Ariakit.DialogDescription ref={ref} {...props} />
  }
)

export const Drawer = {
  Root: DrawerRoot,
  Trigger: DrawerTrigger,
  Content: DrawerContent,
  Close: DrawerClose,
  Title: DrawerTitle,
  Description: DrawerDescription,
  useStore: useDrawerStore,
  useContext: useDrawerContext,
}
