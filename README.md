# Happy Spoon

Shared brand, website and product-development workspace for the Happy Spoon founding team.

## Live site pages

The site is published with GitHub Pages from the `main` branch. After a push, changes can take a few minutes to appear (hard refresh with Cmd+Shift+R if you still see the old version).

| Name | Link | Source |
| --- | --- | --- |
| Home page (Shop, 4 tub minimum, Flavor Flood brand) | [/](https://happyspoonyogurt.com/) | `index.html` (styles and script in `shop/`) |
| Waitlist (Lineup, connected to Kit) | [/waitlist/](https://happyspoonyogurt.com/waitlist/) | `waitlist/index.html` |
| Our story (About page) | [/about/](https://happyspoonyogurt.com/about/) | `about/index.html` |
| Brand guidelines (Flavor Flood, the official brand) | [/brand/](https://happyspoonyogurt.com/brand/) | `brand/index.html` |
| 3D Flavor Studio | [/viewer/](https://happyspoonyogurt.com/viewer/) | `viewer/index.html` |
| Old links that forward | /shop/ → home, /waitlist/concepts/05-lineup.html → /waitlist/ | `shop/index.html`, `waitlist/concepts/05-lineup.html` |

The waitlist's flavor shelf code lives in `waitlist/concepts/shared.js` and `shared.css`, and the shop's in `shop/shop.css` and `shop/shop.js`, so keep those files.

When you add a new page, add a row here too. If the page should show up on Google, also add it to `sitemap.xml` and give it a `<link rel="canonical">` and `<meta name="description">` (pages that should stay out of search get `<meta name="robots" content="noindex">`).

## Team resources

- [Manufacturing & Product Development Guide](docs/manufacturing-partners.md) — producer contacts, packaging guidance, manufacturer questions, outreach template and shared contact tracker.
- [3D Product Viewer](viewer/README.md) — instructions for the interactive Happy Spoon container viewer.

When a partner contacts a manufacturer, update the outreach tracker in the manufacturing guide so the entire team can see the response and next action.
