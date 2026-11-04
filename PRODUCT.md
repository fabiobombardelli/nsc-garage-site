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

Track pedigree applied to every car: the same team and methods that build competition drift cars maintain street cars. Founded and led by Neto; over a decade of results, international titles and a pioneering role in structuring drift in Brazil (all confirmed as true by the client).

## Operating Context

- Contact happens on WhatsApp; there is no backend. The form composes a WhatsApp message.
- The client loves two existing pieces and they must stay: the hero video (night drift footage of the team's car) and the top-down 350Z that drifts along an S-shaped track as the visitor scrolls the timeline.

## Capabilities and Constraints

- Stack: React 19 + TypeScript + Vite + Tailwind CSS 4, static build.
- Contact data (WhatsApp number, address, hours, Instagram) is still placeholder in `src/content/site.ts` and must be replaced before launch.
- Timeline milestones (2015–2024) are provisional content written by the client; real facts still to come.
- Accessibility target: WCAG 2.2 level AA (confirmed by the client), with Brazilian eMAG-style access shortcuts, screen-reader semantics, a high-contrast mode (including colour-blind users), a reduced-motion mode and font enlargement that does not break the layout. The client will send the WCAG reference document; the visual system must be ready for these modes now.
- Planned: an internal system for opening and tracking service requests ("chamados"). The client will send requirements and a traceability matrix; the current contact form is its seed (a work order that composes a WhatsApp message).

## Brand Commitments

- Name: NSC Garage. Logo: carbon-fibre "NSC" block letters with red/white outlines and a red script "Garage" (`src/assets/brand/logo.webp`). Brand colours: red, black, white.
- Tagline, non-negotiable and always complete: "Carros são nossa paixão. Competir é a obsessão." Never split it, shorten it or move half of it into supporting copy.
- The client rejected a light/white ground (too white; it made the track and car look too dark).
- Language: Brazilian Portuguese.

## Evidence on Hand

- Real: hero footage (`public/media/hero-drift*.{webm,mp4}`), stills taken from that footage (`src/assets/images/footage/`), the 350Z livery top view (`src/assets/images/drift-car-top.webp`), the logo.
- Illustrative, to be replaced by real photos the client will send: `workshop-drift.jpg`, `parts-drift.jpg`.
- Absent, must not be fabricated: testimonials, client names, review scores, sponsor logos, specific title names/years, business statistics.

## Product Principles

1. The track is the proof: every claim about quality points back to competition work.
2. One action: talk to the team on WhatsApp.
3. Keep what the owner loves (the drifting car, the hero video) and build around it.
4. Never invent proof; leave clearly marked slots for real facts and photos.
