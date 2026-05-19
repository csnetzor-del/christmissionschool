# Christ Mission School — Purnea, Bihar

A premium, responsive, faith-based school website homepage built with vanilla
HTML, CSS, and JavaScript — no build step required.

## Highlights

- Elegant navy + gold palette with a warm beige accent
- Sticky header with mobile hamburger nav
- Hero section with inspirational headline and dual CTAs
- Four-column faith / values feature strip
- Two-card admissions panel (Students Admission 2025–26 + Admission Open)
- Mission / recruitment grid (Vacancies, Teacher qualities, Qualifications)
- Calling banner with map of Bihar visual
- Rich footer with quick links, contact, and social icons
- Smooth scroll, scroll-spy nav highlight, and reveal-on-scroll animations
- Fully responsive (desktop, tablet, mobile)
- Accessible (semantic landmarks, ARIA labels, reduced-motion support)

## File structure

```
WEB-CHRIST,BIHAR/
├── index.html      # Page markup
├── styles.css      # Design system + sections + responsive rules
├── script.js       # Mobile nav, scroll-spy, reveal animations
└── README.md       # This file
```

## Running locally

This is a fully static site. You can simply open `index.html` in a browser,
or serve the directory with any static server:

```bash
# Python
python -m http.server 8080

# Node (no install)
npx serve .
```

Then visit `http://localhost:8080`.

## Customization

- **Colors / typography** are defined as CSS custom properties at the top of
  `styles.css` under `:root`. Adjust `--navy`, `--gold`, `--beige`, etc.
- **Imagery** uses Unsplash placeholder URLs. Replace the `src` attributes in
  `index.html` with your own school photos for production.
- **Phone numbers, address, and email** are placeholders — update the values
  in the admissions card and the footer's `Contact Us` section.
- **Logo** is an inline SVG shield in the header (and footer). Replace with
  your official logo asset if available.

## Browser support

Modern Chromium, Firefox, and Safari. Uses CSS Grid, Flexbox, and
`IntersectionObserver` (gracefully degrades on older browsers).

## License

Provided to Christ Mission School for use on their official website.
