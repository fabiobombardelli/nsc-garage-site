# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences with equal weight (confirmed):

- **Drivers and teams in drift and motorsport** looking for a shop that builds and sets up competition cars: chassis, engine, suspension geometry, telemetry, machined parts.
- **Owners of sports and imported cars** looking for premium maintenance, who trust a shop that also prepares race cars.

Both arrive mostly from Instagram, WhatsApp and word of mouth, very often on a phone.

## Product Purpose

Marketing site for NSC Garage, a premium maintenance shop and preparer of competition and drift cars in Brazil. Success means a visitor understands who NSC is, believes the shop's track pedigree, and starts a conversation on WhatsApp to book an evaluation.

## Positioning

Track pedigree applied to every car: the same team and methods that build competition drift cars maintain street cars. NSC = Neto Street Car. Founded and led by Walter Santana Neto ("Neto"), who discovered drift while living in Japan. Documented record (see `docs/historia-nsc.md`): Neto created the Super Drift Brasil (2015); the house car won 6 consecutive SDB titles (2015–2020), 4 Brazilian championships (2016–2019), the King of Nations world vice-championship (2016) and Netflix's Hyperdrive (2019, Mustang #69); Formula Drift in the US since 2023. Address: R. Braz Cubas, 270, Santos (SP), phone (13) 3232-3920.

## Operating Context

- Contact happens on WhatsApp; there is no backend. The form composes a WhatsApp message.
- Booking system (academic prototype, no backend yet): customers pick a service, day and free time
  slot, get a protocol, then track, cancel (up to 24 h before) or rate it with phone + protocol; the
  shop confirms, completes or cancels in a password-protected panel and notifies the customer
  through a prepared WhatsApp message. Data lives in the browser's localStorage behind a repository
  interface, ready to move to Supabase.
- The client loves two existing pieces and they must stay: the hero video (night drift footage of the team's car) and the top-down 350Z that drifts along an S-shaped track as the visitor scrolls the timeline.

## Capabilities and Constraints

- Stack: React 19 + TypeScript + Vite + Tailwind CSS 4, static build.
- Address, phone and Instagram (@nscgarage) are real; the WhatsApp number and opening hours are still placeholders in `src/content/site.ts`.
- Timeline milestones (2012–2026) come from the team's sourced research (section 11 cards). Their photos are public third-party images shown with credit; they must be replaced by treated versions or the NSC archive, with permission, before launch.
- Accessibility target: WCAG 2.2 level AA (confirmed by the client), with Brazilian eMAG-style access shortcuts, screen-reader semantics, a high-contrast mode (including colour-blind users), a reduced-motion mode and font enlargement that does not break the layout. The client will send the WCAG reference document; the visual system must be ready for these modes now.
- Requirements, use cases and the traceability matrix come from the team's requirements review (23/10/2026); see `docs/rastreabilidade.md`. Business-rule values (hours, slot length, lead time, cancel window) are provisional in `src/content/scheduling.ts`.
- This is also a university extension project (Accessibility + Software Engineering); the README is the presentation document.

## Brand Commitments

- Name: NSC Garage. Logo: carbon-fibre "NSC" block letters with red/white outlines and a red script "Garage" (`src/assets/brand/logo.webp`). Brand colours: red, black, white.
- Tagline, non-negotiable and always complete: "Carros são nossa paixão. Competir é a obsessão." Never split it, shorten it or move half of it into supporting copy.
- The client rejected a light/white ground (too white; it made the track and car look too dark).
- Language: Brazilian Portuguese.

## Evidence on Hand

- Real: hero footage (`public/media/hero-drift*.{webm,mp4}`), stills taken from that footage (`src/assets/images/footage/`), the 350Z livery top view (`src/assets/images/drift-car-top.webp`), the logo.
- Illustrative, to be replaced by real photos the client will send: `workshop-drift.jpg`, `parts-drift.jpg`.
- Absent, must not be fabricated: testimonials, client names, review scores, sponsor logos, business statistics, and any title or date not listed as confirmed in `docs/historia-nsc.md` (e.g. the 7th and 8th SDB titles are undocumented).

## Product Principles

1. The track is the proof: every claim about quality points back to competition work.
2. One action: talk to the team on WhatsApp.
3. Keep what the owner loves (the drifting car, the hero video) and build around it.
4. Never invent proof; leave clearly marked slots for real facts and photos.
