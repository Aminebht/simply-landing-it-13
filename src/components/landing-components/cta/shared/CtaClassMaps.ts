
export const CtaClassMaps = {
  // Container styles
  container: {
    minimal: 'py-16 px-4 bg-background',
    gradient: 'py-20 px-4 bg-gradient-to-br from-primary to-primary/80',
    split: 'py-16 px-4 bg-muted/50',
    floating: 'py-20 px-4 bg-gradient-to-r from-background to-muted/30',
    sidebar: 'py-12 px-4 bg-background',
    banner: 'py-24 px-4 bg-primary text-primary-foreground relative overflow-hidden'
  },

  // Headline styles
  headline: {
    minimal: 'text-3xl md:text-4xl font-bold text-foreground mb-4',
    gradient: 'text-4xl md:text-5xl font-bold text-primary-foreground mb-6',
    split: 'text-3xl md:text-4xl font-bold text-foreground mb-4',
    floating: 'text-4xl md:text-5xl font-bold text-foreground mb-6',
    sidebar: 'text-2xl md:text-3xl font-bold text-foreground mb-4',
    banner: 'text-4xl md:text-6xl font-bold mb-6'
  },

  // Subheadline styles
  subheadline: {
    minimal: 'text-lg text-muted-foreground mb-8',
    gradient: 'text-xl text-primary-foreground/90 mb-8',
    split: 'text-lg text-muted-foreground mb-6',
    floating: 'text-xl text-muted-foreground mb-8',
    sidebar: 'text-base text-muted-foreground mb-6',
    banner: 'text-xl md:text-2xl text-primary-foreground/90 mb-8'
  },

  // Button styles
  button: {
    minimal: 'bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg',
    gradient: 'bg-background text-foreground hover:bg-background/90 px-10 py-5 rounded-xl font-bold text-xl transition-all transform hover:scale-105 shadow-2xl',
    split: 'bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-lg font-semibold transition-colors',
    floating: 'bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-5 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl',
    sidebar: 'bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-semibold transition-colors w-full',
    banner: 'bg-background text-foreground hover:bg-background/90 px-12 py-6 rounded-xl font-bold text-xl transition-all transform hover:scale-105 shadow-2xl'
  },

  // Card styles
  card: {
    minimal: 'bg-card border border-border rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow',
    gradient: 'bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-12',
    split: 'bg-card border border-border rounded-xl p-6 shadow-md',
    floating: 'bg-card border border-border rounded-3xl p-10 shadow-2xl transform hover:scale-105 transition-all',
    sidebar: 'bg-card border border-border rounded-xl p-6 shadow-md',
    banner: 'bg-background/10 backdrop-blur-md border border-white/20 rounded-2xl p-8'
  },

  // Form styles
  form: {
    container: 'space-y-4',
    input: 'w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
    select: 'w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
    checkbox: 'h-4 w-4 text-primary focus:ring-primary border-border rounded'
  }
};
