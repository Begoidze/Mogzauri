"use client"

interface PageHeaderProps {
  title: string
  subtitle: string
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <section className="relative flex min-h-[40vh] items-center justify-center overflow-hidden bg-primary">
      <div className="relative z-10 flex flex-col items-center gap-4 px-6 pt-20 pb-12 text-center">
        <h1 className="font-serif text-4xl font-bold tracking-wide text-primary-foreground sm:text-5xl md:text-6xl text-balance">
          {title}
        </h1>
        <p className="max-w-lg text-sm uppercase tracking-[0.2em] text-primary-foreground/70">
          {subtitle}
        </p>
      </div>
    </section>
  )
}
