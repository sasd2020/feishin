import japandiOverridesCss from './japandi_overrides.css?inline';

import { AppThemeConfiguration } from '/@/shared/themes/app-theme-types';

// Warm charcoal, paper and oak: a quiet dark theme with serif titles.
export const japandiDark: AppThemeConfiguration = {
    app: {
        'overlay-header':
            'linear-gradient(transparent 0%, rgb(20 18 16 / 85%) 100%), var(--theme-background-noise)',
        'overlay-subheader':
            'linear-gradient(180deg, rgb(20 18 16 / 5%) 0%, var(--theme-colors-background) 100%), var(--theme-background-noise)',
        'scrollbar-handle-background': 'rgba(200, 164, 126, 18%)',
        'scrollbar-handle-hover-background': 'rgba(200, 164, 126, 35%)',
    },
    colors: {
        background: 'rgb(20, 18, 16)',
        'background-alternate': 'rgb(16, 14, 12)',
        black: 'rgb(0, 0, 0)',
        foreground: 'rgb(230, 223, 211)',
        'foreground-muted': 'rgb(162, 154, 141)',
        primary: 'rgb(200, 164, 126)',
        'state-error': 'rgb(196, 106, 90)',
        'state-info': 'rgb(138, 163, 176)',
        'state-success': 'rgb(147, 162, 131)',
        'state-warning': 'rgb(209, 169, 92)',
        surface: 'rgb(32, 29, 26)',
        'surface-foreground': 'rgb(230, 223, 211)',
        white: 'rgb(255, 255, 255)',
    },
    mode: 'dark',
    stylesheets: [japandiOverridesCss],
};
