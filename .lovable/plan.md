

## Add Brochure Formatting Customization

Give users a visual settings panel on the Brochure Preview screen to tweak the PDF layout, colors, typography, and branding before downloading.

---

### What You'll Be Able to Customize

**Colors**
- Primary color (headers, accent bars, badges) -- color picker
- Secondary color (backgrounds, borders)
- Card background color
- Text color (dark/light)

**Layout**
- Page format: A4 or US Letter
- Margins: Small / Medium / Large
- Image-to-text ratio: controls how wide the food/exercise image tile is vs. the text tile (e.g., 40/60, 50/50, 60/40)
- Hero banner height: Small / Medium / Large / Hidden

**Typography**
- Title font size (cover page)
- Day header font size
- Body text font size

**Branding**
- Custom title text (replaces "Food Challenge" / "Fitness Challenge")
- Tagline text (replaces "Your transformation starts here")
- Show/hide disclaimer footer

---

### How It Works in the UI

A collapsible "Customize Design" panel appears on the Brochure Preview page, between the page previews and the download buttons. It uses accordions to group settings by category (Colors, Layout, Typography, Branding). Changes update the preview card thumbnails in real-time where possible, and are passed directly into the PDF generator on download.

---

### Technical Details

#### 1. New type: `BrochureFormatConfig` (`src/types/brochure.ts`)

```typescript
export interface BrochureFormatConfig {
  colors: {
    primary: [number, number, number];
    secondary: [number, number, number];
    accent: [number, number, number];
    cardBg: [number, number, number];
    text: [number, number, number];
  };
  layout: {
    pageFormat: 'a4' | 'letter';
    margin: 'small' | 'medium' | 'large';   // 6mm, 10mm, 16mm
    imageRatio: number;                       // 0.3 to 0.7 (fraction of row for image)
    heroBannerHeight: 'hidden' | 'small' | 'medium' | 'large';
  };
  typography: {
    titleSize: number;    // 32-56
    headerSize: number;   // 16-28
    bodySize: number;     // 8-14
  };
  branding: {
    customTitle: string;
    tagline: string;
    showDisclaimer: boolean;
  };
}
```

A `DEFAULT_FORMAT_CONFIG` constant provides sensible defaults matching the current hard-coded values.

#### 2. New component: `BrochureFormatPanel` (`src/components/BrochureFormatPanel.tsx`)

- Collapsible card with accordion sections for each category
- **Colors**: Uses native `<input type="color">` pickers that convert hex to RGB tuples
- **Layout**: Radio groups and a slider for image ratio
- **Typography**: Sliders with numeric labels for font sizes
- **Branding**: Text inputs for title and tagline, a switch for disclaimer
- Emits an `onChange(config: BrochureFormatConfig)` callback on every change

#### 3. Update `BrochurePreview` component

- Adds `useState<BrochureFormatConfig>` initialized with defaults
- Renders `<BrochureFormatPanel>` between the page grid and the export card
- Passes `formatConfig` into `generateTileBasedPDF(challenge, images, formatConfig)`
- The preview card thumbnails update their gradient colors to match the selected primary color

#### 4. Update `generateTileBasedPDF` (`src/lib/pdf-tile-generator.ts`)

- Accept `formatConfig?: BrochureFormatConfig` as a third parameter (falls back to current defaults)
- Replace all hard-coded constants with config-driven values:

```text
MARGIN         --> formatConfig.layout.margin ('small'=6, 'medium'=10, 'large'=16)
PAGE_WIDTH/H   --> derived from formatConfig.layout.pageFormat ('a4'=210x297, 'letter'=216x279)
heroTileH      --> formatConfig.layout.heroBannerHeight ('hidden'=0, 'small'=35, 'medium'=50, 'large'=70)
tileWidth      --> split by formatConfig.layout.imageRatio
Font sizes     --> formatConfig.typography.*
Color palette  --> formatConfig.colors.*
Title text     --> formatConfig.branding.customTitle
Tagline        --> formatConfig.branding.tagline
Disclaimer     --> conditionally rendered based on formatConfig.branding.showDisclaimer
```

- The existing `FOOD_COLORS` / `FITNESS_COLORS` constants become the defaults when no config is provided

#### 5. Files changed

| File | Change |
|------|--------|
| `src/types/brochure.ts` | Add `BrochureFormatConfig` interface and `DEFAULT_FORMAT_CONFIG` |
| `src/components/BrochureFormatPanel.tsx` | New component -- customization accordion panel |
| `src/components/BrochurePreview.tsx` | Add format state, render panel, pass config to PDF generator |
| `src/lib/pdf-tile-generator.ts` | Accept and use `BrochureFormatConfig` instead of hard-coded values |

No backend or database changes required -- all customization is client-side.

