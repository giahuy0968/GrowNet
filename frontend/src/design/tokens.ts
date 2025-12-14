// Design tokens and small utilities shared across UI components

export const colors = {
    bg: 'rgb(var(--bg))',
    fg: 'rgb(var(--fg))',
    muted: 'rgb(var(--muted))',
    primary: 'rgb(var(--primary))',
    primaryFg: 'rgb(var(--primary-foreground))',
    secondary: 'rgb(var(--secondary))',
    secondaryFg: 'rgb(var(--secondary-foreground))',
    border: 'rgb(var(--border))',
    ring: 'rgb(var(--ring))',
};

export const radii = {
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
};

export const shadow = {
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
};

// Simple classnames helper
export const cn = (
    ...classes: Array<string | false | null | undefined>
): string => classes.filter(Boolean).join(' ');
