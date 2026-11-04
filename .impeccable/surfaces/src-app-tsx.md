---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: []
---

Scope: the NSC Garage one-page site (src/App.tsx and its sections). Visitor mode: Persuade.

Audience and job: drift/competition drivers and owners of sports and imported cars, mostly on phones, deciding whether to trust NSC with their car. Action: start a WhatsApp conversation (work-order form composes the message; floating button; footer contact). Proof: the team's own footage, the 350Z #69 livery, Neto as founder, over a decade of results, international titles and the pioneering role in structuring drift in Brazil (confirmed). Constraints: hero video full-bleed from the first frame; the 350Z drifting along the S-track in the middle of the page; the full tagline "Carros são nossa paixão. Competir é a obsessão." leads the hero (non-negotiable); footer car loops without stopping; WCAG 2.2 AA-ready (shortcuts, semantics, high contrast, reduced motion, font scaling); no invented proof; contact data and timeline facts are placeholders.

Client steer behind this round: the paper world read as too white and made the track and car look too dark; hero type read small and simple; the inline video in the Trajetória title read as strange (replace with a photo fading toward the text); header must feel premium; more motion (Motion library).

Client steer behind the latest round: remove the panel over the video (keep only the tagline), make the tagline a little smaller so the video gets the focus, pin the video while the two lines slide away on scroll, make the track look like a real black-asphalt track with a subtle dashed centre line and wider relative to the car, and lighten the car image.

Memorable moment: the 350Z drifts down a black-asphalt track on the box floor, leaving rubber and lighting each cone; the page closes on a red field where it runs figure-eights without stopping.

## Direction contract

THESIS: The site is the NSC box after hours: the workshop where the race car rests, lit by white LED bars over a graphite epoxy floor, with the red tool chest by the wall. It refuses the white paper sheet the client rejected and the category default of a black page with neon red, icon cards and a centred hero.

OWN-WORLD: Graphite epoxy ground (never pure black), cool LED-white ink, brand red as tool-chest lacquer on actions, cones, the services chest and the closing field; white painted floor lines; red-and-white cones; rubber black. Archivo compressed 800 capitals for monument lines, normal width for text. Square corners. No hairlines, glows or gradients beyond photo scrims and the requested photo fade.

STORY: The night run fills the screen under the tagline; the course painted on the box floor carries the milestones; the box itself shows who NSC is; the tool chest holds the services; the work order books the evaluation; the red field closes with the car running eights.

FIRST VIEWPORT: Full-bleed team video from the first frame under a neutral scrim. "Carros são nossa paixão." top-left and "Competir é a obsessão." bottom-right in Archivo compressed 800 capitals at about 79% of the measure, with nothing between them so the video carries the frame; on scroll the stage pins for one screen while the lines slide out sideways and the scrim lifts, then the video scrolls away; a pause control bottom-left; transparent header with logo, three links and the action.

FORM: The box at night, position 4 of 7 on the re-rolled list (1 carbon fibre, 2 livery and decals, 3 tyre marks and track paint, 4 the box at night, 5 pit board and timing tower, 6 racing poster and magazine, 7 setup sheet and torque card), chosen by the client after the paper sheet was rejected. seed:e1b1cf794a102dde (re-roll 1, degraded, no challengers).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
