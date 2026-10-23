# Fabien Haury — Portfolio

A personal portfolio showcasing my work in **D3.js, data visualization, and creative coding**.

🌐 **Live website:** [fabienhaury.github.io/portfolio](https://fabienhaury.github.io/portfolio/)

## Overview

This repository contains my personal portfolio website, bringing together projects developed through the D3.js course and independent experiments.

The website features a responsive design, a light/dark theme toggle, and an animated D3.js visualization illustrating how raw data can reveal patterns and trends.

## Features

- **D3.js Course:** A collection of exercises, data analyses, and visualizations.
- **Personal Projects:** Independent experiments and creative coding projects.
- **Animated Visualization:** A scatter plot with group-specific regression lines.
- **Light and Dark Themes:** A theme toggle with saved preferences.
- **Responsive Design:** A layout designed for different screen sizes.
- **Automated Deployment:** GitHub Actions generates project listings and deploys the website to GitHub Pages.

## Built With

- HTML5
- CSS3
- JavaScript
- [D3.js](https://d3js.org/)
- Python 3
- GitHub Actions
- GitHub Pages

## Project Structure

```text
.
├── index.html
├── style.css
├── script.js
├── generate-course.py
├── projects.json
├── personal-projects.json
├── Images/
│   └── photo_profile.jpg
└── .github/
    └── workflows/
        └── deploy.yml
```

## Adding Projects

Project listings are generated from JSON files, so new projects can be added without manually editing the HTML.

### D3.js Course Projects

Add projects to `projects.json`:

```json
{
  "sections": [
    {
      "name": "Data Visualization",
      "projects": [
        {
          "name": "My Project",
          "description": "A short project description.",
          "url": "https://github.com/username/project"
        }
      ]
    }
  ]
}
```

### Personal Projects

Add projects to `personal-projects.json`. Projects can be organized into sections and optional nested subsections.

Each project requires a `name` and a `url`. The `description` field is optional.

## Run Locally

Clone the repository:

```bash
git clone https://github.com/FabienHaury/portfolio.git
cd portfolio
```

Start a local development server:

```bash
python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000) in your browser.

To regenerate the project listings after modifying the JSON files, run:

```bash
python3 generate-course.py
```

This updates `index.html` with the latest project listings.

## Deployment

The website is hosted on GitHub Pages and deployed automatically through GitHub Actions whenever changes are pushed to the `main` branch.

The workflow:

1. Checks out the repository.
2. Configures GitHub Pages.
3. Generates project listings using Python.
4. Uploads the website as a Pages artifact.
5. Deploys the website.

## Contact

- 📧 [Email](mailto:67912775+FabienHaury@users.noreply.github.com)
- 💼 [LinkedIn](https://www.linkedin.com/in/fabienhaury/)
- 📄 [Mon CV](https://github.com/FabienHaury/CV-Resume/blob/main/CV_Haury_Fabien.pdf)
- 💻 [GitHub](https://github.com/FabienHaury)

---

*Built with curiosity for data, code, and visual storytelling.*
