import json
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent
INDEX = ROOT / "index.html"
PROJECTS_FILE = ROOT / "projects.json"
PLACEHOLDER = "<!-- COURSE_LISTINGS -->"

html = INDEX.read_text(encoding="utf-8")
projects_data = json.loads(PROJECTS_FILE.read_text(encoding="utf-8"))

if html.count(PLACEHOLDER) != 1:
    raise SystemExit(
        f"Expected exactly one {PLACEHOLDER} in {INDEX}"
    )

sections = []

for section in projects_data.get("sections", []):
    items = []

    for project in section.get("projects", []):
        name = escape(project["name"])
        description = escape(project.get("description", ""))
        url = escape(project["url"], quote=True)

        description_html = (
            f'<p class="project-description">{description}</p>'
            if description else ""
        )

        items.append(
            '<li class="project-card">\n'
            f'  <h4><a href="{url}">{name} ↗</a></h4>\n'
            f'  {description_html}\n'
            '</li>'
        )

    if not items:
        continue

    section_name = escape(section["name"])

    sections.append(
        '<section class="course-section">\n'
        f'  <h3>{section_name}</h3>\n'
        '  <ul class="project-list">\n'
        + "\n".join(items)
        + '\n  </ul>\n'
        '</section>'
    )

replacement = "\n\n".join(sections)

if not replacement:
    replacement = (
        '<p class="course-empty">'
        'Projects will appear here as they are added.'
        '</p>'
    )

generated = html.replace(PLACEHOLDER, replacement)
INDEX.write_text(generated, encoding="utf-8")

print(f"Generated homepage with {len(sections)} project sections.")
