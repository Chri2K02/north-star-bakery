# North Star Bakery Website

Client website for **Client A: North Star Bakery**, built for Introduction to Web Development.

| Folder | Touchstone | What it contains |
|---|---|---|
| [`touchstone-2/`](touchstone-2/) | Task 2: Client Website Structure Build | Four semantic HTML pages (no CSS or JavaScript) |
| [`touchstone-3/`](touchstone-3/) | Task 3: Visual Design and Responsive Layout | The same four pages with an external stylesheet (`css/styles.css`), a mobile-first responsive layout, Flexbox, and media queries |
| [`touchstone-4/`](touchstone-4/) | Task 4: Interactivity and Client-Side Data | Adds JavaScript (`js/`): a pre-order list on the Products page, form validation on the Contact page, and localStorage that remembers the list and the customer's name and email |

## Pages
- `index.html`: Home (welcome, what we're known for, featured item, hours and location)
- `products.html`: Breads, pastries, and cakes with price ranges
- `about.html`: Story, sourcing philosophy, and staff
- `contact.html`: Pre-order and inquiry form, location, and hours

## Media
Both versions load their images, audio, and video from their own `media/` folder. These are the course-provided North Star Bakery files. The behind-the-scenes video was re-encoded to 720p (from a 99 MB original to 1.7 MB) so it loads quickly on the web.

## Design (Touchstone 3)
- **Colors:** Cream `#FFF8EE`, Espresso `#3B2316`, Rust `#A4471C`, Honey `#F2C46D`
- **Fonts:** Lora (headings) and Open Sans (body)
- **Breakpoints:** 768px (header row, side-by-side cards) and 1000px (two-column contact page)

## JavaScript (Touchstone 4)
- `js/shared.js`: product catalog (array of objects), storage keys, and localStorage helper functions
- `js/preorder.js`: the "My Pre-Order List" feature on the Products page (add, change quantity, remove, clear, estimated total)
- `js/contact.js`: form validation with messages next to each field, the 48-hour custom cake rule, and pre-filling the form from localStorage
