# Zaid Hsaine — Portfolio

[![Architecture diagram](https://gitdiagram.com/diagram-badge.svg)](https://gitdiagram.com/hsainezaid0/my-portfolio?utm_source=readme&utm_medium=badge)

My personal portfolio, presenting my background, skills and projects in software development and cybersecurity. I am a computer science student at EMSI, on exchange at EPITECH Paris.

[Website](https://zaidhsaine.com) · [GitHub](https://github.com/hsainezaid0) · [Online CV](https://hsainezaid0.github.io/CV---RESUME/)

## Features

- Five pages: Home, About, Skills, Projects and Contact.
- Responsive layouts with a floating navigation dock on mobile.
- A terminal-inspired interface with an animated particle background.
- Scroll reveals, a typing effect and support for reduced-motion preferences.
- A contact form connected to FormSubmit.
- A custom SVG favicon and technology icons.

## Built with

HTML, CSS and vanilla JavaScript, including the Canvas API for the background animation. No framework, package installation or build step is required.

## Architecture

The portfolio is a static website. Its five pages share styles, animations and visual assets; the contact form submits to FormSubmit.

```mermaid
flowchart TD
    subgraph Architecture["PORTFOLIO / ARCHITECTURE"]
        direction TB
        Visitor[Visitor / Browser] --> Pages

        subgraph Pages[Portfolio pages]
            Home[index.html - Home]
            About[about.html - Background]
            Skills[skills.html - Skills]
            Projects[projects.html - Projects]
            Contact[contact.html - Contact]
        end

        Pages --> CSS[style.css - Layout and styling]
        Pages --> JS[script.js - Icons and animations]
        Pages --> Favicon[favicon.svg - Browser icon]
        Home --> Portrait[epitech pic.jpg - Profile photo]
        Contact --> Portrait
        Skills --> Icons[assets/icons - Technology icons]
        JS --> Canvas[Canvas - Particle background]
        Contact -->|Form submission| FormSubmit[FormSubmit - External service]
        FormSubmit --> Inbox[Email inbox]

        classDef page fill:#102929,stroke:#63ead3,color:#edf3ff
        classDef asset fill:#1c2038,stroke:#b0a0ff,color:#edf3ff
        class Home,About,Skills,Projects,Contact page
        class CSS,JS,Favicon,Portrait,Icons,Canvas asset
    end

    style Architecture fill:#080d1b,stroke:#35405d,stroke-width:2px,color:#edf3ff
    style Pages fill:#0b2028,stroke:#63ead3,stroke-width:2px,color:#edf3ff
    classDef service fill:#152039,stroke:#63ead3,color:#edf3ff
    class Visitor,FormSubmit,Inbox service
    linkStyle default stroke:#8da5bf,stroke-width:2px,color:#b0a0ff
```

## Run locally

Clone the repository and enter its directory:

```sh
git clone https://github.com/hsainezaid0/My-Portfolio.git
cd My-Portfolio
```

Open `index.html` in your browser, or serve the directory with Python 3:

```sh
python -m http.server 8000
```

Then visit [localhost:8000](http://localhost:8000). Stop the server with `Ctrl+C`.

The contact form uses an external service and requires an internet connection. Submitting it sends a real message to the configured recipient.

## Project structure

```text
My-Portfolio/
├── index.html          # Home and profile overview
├── about.html          # Background and education
├── skills.html         # Technologies and learning progress
├── projects.html       # Project showcase
├── contact.html        # Contact form and links
├── style.css           # Shared styles and responsive layouts
├── script.js           # Navigation icons and animations
├── favicon.svg         # Browser tab icon
├── epitech pic.jpg     # Profile photo
├── assets/icons/       # SVG technology and topic icons
├── CNAME               # Custom domain: zaidhsaine.com
└── README.md
```

## Editing the portfolio

Update the relevant HTML page to change text, projects or links. Shared styling lives in `style.css`, and interactive effects live in `script.js`. Keep navigation and shared asset references consistent across all five pages.

Before publishing, check the pages at desktop and mobile widths, follow local links, and confirm that images load. If adapting the site, update the contact form recipient and the custom domain in `CNAME`.

## Contact

Use the [contact page](https://zaidhsaine.com/contact.html) or email [hsainezaid@gmail.com](mailto:hsainezaid@gmail.com).
