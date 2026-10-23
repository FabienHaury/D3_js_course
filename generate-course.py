
import json
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent
INDEX = ROOT / "index.html"
PROJECTS_FILE = ROOT / "projects.json"
PERSONAL_FILE = ROOT / "personal-projects.json"

COURSE_PLACEHOLDER = "<!-- COURSE_LISTINGS -->"
PERSONAL_PLACEHOLDER = "<!-- PERSONAL_PROJECT_LISTINGS -->"


def load_json(path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        raise SystemExit(f"Missing JSON file: {path}")
    except json.JSONDecodeError as exc:
        raise SystemExit(f"Invalid JSON in {path}: {exc}")


def render_project(project):
    name = escape(str(project["name"]))
    description = escape(str(project.get("description", "")))
    url = escape(str(project["url"]), quote=True)

    description_html = (
        f'<p class="project-description">{description}</p>'
        if description else ""
    )

    return (
        '<li class="project-card">\n'
        f'  <h4><a href="{url}" target="_blank" '
        f'rel="noopener noreferrer">{name}</a></h4>\n'
        f'  {description_html}\n'
        '</li>'
    )


def render_course(data):
    sections = []

    for section in data.get("sections", []):
        projects = [
            render_project(project)
            for project in section.get("projects", [])
        ]

        if not projects:
            continue

        section_name = escape(str(section["name"]))

        sections.append(
            '<section class="course-section">\n'
            f'  <h3>{section_name}</h3>\n'
            '  <ul class="project-list">\n'
            + "\n".join(projects)
            + '\n  </ul>\n'
            '</section>'
        )

    if not sections:
        return (
            '<p class="course-empty">'
            'Projects will appear here as they are added.'
            '</p>'
        )

    return "\n\n".join(sections)


def render_personal_projects(data):
    projects = [
        render_project(project)
        for project in data.get("projects", [])
    ]

    if not projects:
        return (
            '<p class="course-empty">'
            'Personal projects will appear here as they are added.'
            '</p>'
        )

    return (
        '<ul class="project-list">\n'
        + "\n".join(projects)
        + '\n</ul>'
    )


html = INDEX.read_text(encoding="utf-8")

# Validate both placeholders before modifying the file.
for placeholder in (COURSE_PLACEHOLDER, PERSONAL_PLACEHOLDER):
    count = html.count(placeholder)

    if count != 1:
        raise SystemExit(
            f"Expected exactly one {placeholder} in {INDEX}, found {count}"
        )

# Load and render both project collections.
course_data = load_json(PROJECTS_FILE)
personal_data = load_json(PERSONAL_FILE)

course_html = render_course(course_data)
personal_html = render_personal_projects(personal_data)

# Replace both placeholders in memory.
generated = html.replace(COURSE_PLACEHOLDER, course_html)
generated = generated.replace(PERSONAL_PLACEHOLDER, personal_html)

# Write only after both collections have been processed successfully.
INDEX.write_text(generated, encoding="utf-8")

print("Generated homepage with course and personal projects.")
