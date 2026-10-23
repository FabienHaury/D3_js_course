
import json
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent

INDEX = ROOT / "index.html"
PROJECTS_FILE = ROOT / "projects.json"
PERSONAL_FILE = ROOT / "personal-projects.json"

COURSE_PLACEHOLDER = "<!-- COURSE_LISTINGS -->"
PERSONAL_PLACEHOLDER = "<!-- PERSONAL_PROJECT_LISTINGS -->"


# =========================
# LOAD JSON
# =========================

def load_json(path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        raise SystemExit(f"Missing JSON file: {path}")
    except json.JSONDecodeError as exc:
        raise SystemExit(f"Invalid JSON in {path}: {exc}")


# =========================
# RENDER A PROJECT CARD
# =========================

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
        f'  <a class="project-card-link" href="{url}" '
        'target="_blank" rel="noopener noreferrer">\n'
        f'    <h4>{name}</h4>\n'
        f'    {description_html}\n'
        '    <span class="project-arrow" aria-hidden="true">↗</span>\n'
        '  </a>\n'
        '</li>'
    )


# =========================
# RENDER A PROJECT LIST
# =========================

def render_project_list(projects):
    if not projects:
        return ""

    items = "\n".join(
        render_project(project) for project in projects
    )

    return (
        '<ul class="project-list">\n'
        f'{items}\n'
        '</ul>'
    )


# =========================
# RENDER D3.JS COURSE
# =========================

def render_course(data):
    sections_html = []

    for section in data.get("sections", []):
        projects = section.get("projects", [])

        if not projects:
            continue

        section_name = escape(str(section["name"]))
        project_list = render_project_list(projects)

        sections_html.append(
            '<section class="course-section">\n'
            f'  <h3>{section_name}</h3>\n'
            f'  {project_list}\n'
            '</section>'
        )

    if not sections_html:
        return (
            '<p class="course-empty">'
            'Projects will appear here as they are added.'
            '</p>'
        )

    return "\n\n".join(sections_html)


# =========================
# RENDER PERSONAL PROJECTS
# Supports:
# - Sections with direct projects
# - Sections with nested subsections
# - Sections containing both
# =========================

def render_personal_projects(data):
    sections_html = []

    for section in data.get("sections", []):
        section_name = escape(str(section["name"]))
        content = []

        # Projects directly inside the section
        projects = section.get("projects", [])

        if projects:
            content.append(render_project_list(projects))

        # Nested subsections
        for subsection in section.get("subsections", []):
            subsection_name = escape(str(subsection["name"]))
            subprojects = subsection.get("projects", [])

            if not subprojects:
                continue

            project_list = render_project_list(subprojects)

            content.append(
                '<section class="course-section">\n'
                f'  <h4>{subsection_name}</h4>\n'
                f'  {project_list}\n'
                '</section>'
            )

        # Skip sections with no projects or subsections
        if not content:
            continue

        sections_html.append(
            '<section class="personal-section">\n'
            f'  <h3>{section_name}</h3>\n'
            + "\n".join(content)
            + '\n</section>'
        )

    if not sections_html:
        return (
            '<p class="course-empty">'
            'Personal projects will appear here as they are added.'
            '</p>'
        )

    return "\n\n".join(sections_html)


# =========================
# GENERATE HOMEPAGE
# =========================

def main():
    if not INDEX.exists():
        raise SystemExit(f"Missing HTML file: {INDEX}")

    html = INDEX.read_text(encoding="utf-8")

    # Validate placeholders before processing anything.
    for placeholder in (
        COURSE_PLACEHOLDER,
        PERSONAL_PLACEHOLDER,
    ):
        count = html.count(placeholder)

        if count != 1:
            raise SystemExit(
                f"Expected exactly one {placeholder} "
                f"in {INDEX}, found {count}"
            )

    # Load both JSON files.
    course_data = load_json(PROJECTS_FILE)
    personal_data = load_json(PERSONAL_FILE)

    # Render both project columns.
    course_html = render_course(course_data)
    personal_html = render_personal_projects(personal_data)

    # Replace placeholders in memory.
    generated = html.replace(
        COURSE_PLACEHOLDER,
        course_html,
    )

    generated = generated.replace(
        PERSONAL_PLACEHOLDER,
        personal_html,
    )

    # Write only after all processing succeeds.
    INDEX.write_text(generated, encoding="utf-8")

    course_sections = len(course_data.get("sections", []))
    personal_sections = len(personal_data.get("sections", []))

    print("Homepage generated successfully.")
    print(f"Course sections: {course_sections}")
    print(f"Personal project sections: {personal_sections}")


if __name__ == "__main__":
    main()
