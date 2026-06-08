## Frontend Design Guidelines

Build the actual usable product experience, not a marketing shell, unless explicitly asked for a landing page.

Prioritize clarity, density, and usability. Match the product domain:
- SaaS, admin tools, CRM, dashboards, and operational apps should feel quiet, utilitarian, and work-focused.
- Avoid oversized hero sections, decorative card-heavy layouts, and marketing-style composition for tool-like apps.
- Prefer dense but organized information, restrained styling, predictable navigation, and interfaces built for repeated use.

Use existing project conventions first:
- Match the current design system, spacing, typography, colors, component patterns, and framework.
- Do not introduce unrelated visual styles or new abstractions unless needed.
- Keep changes scoped to the requested feature.

UI controls should be familiar:
- Use icons for common actions such as save, download, undo, redo, search, filter, close, and settings.
- Use icon buttons with tooltips when the action is compact or repeated.
- Use segmented controls for modes, toggles/checkboxes for binary settings, sliders/inputs for numeric values, menus for option sets, and tabs for distinct views.
- Prefer established icon libraries already present in the app, such as lucide-react.

Layout rules:
- Do not place cards inside cards.
- Do not style entire page sections as floating cards.
- Use cards mainly for repeated items, modals, and genuinely framed tools.
- Keep card border radius modest, usually 8px or less unless the existing design system differs.
- Use stable dimensions for fixed-format elements such as boards, grids, toolbars, tiles, counters, and icon buttons so hover states or dynamic content do not shift layout.

Typography:
- Use hero-scale type only for real heroes.
- Use smaller, tighter headings inside panels, cards, dashboards, sidebars, and tool surfaces.
- Do not scale font size directly with viewport width.
- Avoid negative letter spacing.
- Make sure text fits inside buttons, cards, panels, and mobile layouts without overlap or clipping.

Visual style:
- Avoid one-note palettes dominated by a single hue family.
- Avoid overusing purple/blue gradients, beige/sand/tan, dark navy/slate, or brown/orange palettes unless the brand clearly requires it.
- Do not use decorative gradient orbs, bokeh blobs, or generic abstract backgrounds.
- Use meaningful visual assets when building websites, games, or product pages.
- Primary images should show the actual product, place, object, gameplay, or state when inspection matters.

Interaction quality:
- Build complete expected states: empty, loading, error, disabled, selected, hover, focus, and active where relevant.
- Ensure common workflows are ergonomic and efficient.
- Do not add visible instructional text explaining obvious UI behavior, keyboard shortcuts, or visual design choices unless the product truly needs it.

Responsive behavior:
- Verify that text and UI elements do not overlap on mobile or desktop.
- Use responsive constraints such as grid tracks, min/max widths, aspect-ratio, and container-relative sizing.
- Make the first screen immediately useful and relevant.

For landing pages only:
- The hero should make the brand/product/place/person obvious in the first viewport.
- Use a relevant real or generated image, immersive scene, or strong product visual as the hero background.
- Do not use split text/media card layouts for heroes.
- Do not put hero text inside a card.
- The H1 should be the brand/product/place/person name or a literal offer/category; put value props in supporting copy.

For 3D:
- Use Three.js for 3D elements.
- Make the 3D scene full-bleed or unframed, not trapped inside a decorative preview card.
- Verify that the canvas is nonblank, framed correctly, interactive or moving if expected, and works on desktop and mobile.