import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      expand={true}
      richColors={true}
      closeButton={true}
      toastOptions={{
        duration: 4000,
        style: {
          background: 'var(--background)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          boxShadow: '0 10px 38px -10px rgba(22, 23, 24, 0.35), 0 10px 20px -15px rgba(22, 23, 24, 0.2)',
          backdropFilter: 'blur(8px)',
          fontSize: '14px',
          fontWeight: '500',
          padding: '16px',
        },
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background/95 group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-xl group-[.toaster]:backdrop-blur-sm group-[.toaster]:rounded-xl group-[.toaster]:border group-[.toaster]:p-4",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-sm group-[.toast]:mt-1",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:hover:bg-primary/90 group-[.toast]:rounded-lg group-[.toast]:px-3 group-[.toast]:py-2 group-[.toast]:text-sm group-[.toast]:font-medium group-[.toast]:transition-colors",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:hover:bg-muted/80 group-[.toast]:rounded-lg group-[.toast]:px-3 group-[.toast]:py-2 group-[.toast]:text-sm group-[.toast]:font-medium group-[.toast]:transition-colors",
          closeButton:
            "group-[.toast]:bg-transparent group-[.toast]:border-0 group-[.toast]:text-muted-foreground group-[.toast]:hover:text-foreground group-[.toast]:transition-colors",
          error:
            "group-[.toast]:bg-destructive/10 group-[.toast]:text-destructive group-[.toast]:border-destructive/20",
          success:
            "group-[.toast]:bg-green-50 group-[.toast]:text-green-900 group-[.toast]:border-green-200 dark:group-[.toast]:bg-green-950 dark:group-[.toast]:text-green-100 dark:group-[.toast]:border-green-800",
          warning:
            "group-[.toast]:bg-yellow-50 group-[.toast]:text-yellow-900 group-[.toast]:border-yellow-200 dark:group-[.toast]:bg-yellow-950 dark:group-[.toast]:text-yellow-100 dark:group-[.toast]:border-yellow-800",
          info:
            "group-[.toast]:bg-blue-50 group-[.toast]:text-blue-900 group-[.toast]:border-blue-200 dark:group-[.toast]:bg-blue-950 dark:group-[.toast]:text-blue-100 dark:group-[.toast]:border-blue-800",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
