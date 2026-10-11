from html import escape
from pathlib import Path

ROOT = Path(".")
INDEX = ROOT / "index.html"
PLACEHOLDER = "<!-- COURSE_LISTINGS -->"

html = INDEX.read_text(encoding="utf-8")

if PLACEHOLDER not in html:
    raise SystemExit(
        f"Could not find {PLACEHOLDER} in {INDEX}"
    )

sections = []

for section in sorted(ROOT.iterdir()):
    if not section.is_dir() or section.name.startswith("."):
        continue

    projects = sorted(
        path
        for path in section.rglob("index.html")
        if len(path.relative_to(section).parts) >= 2
        and ".git" not in path.parts
        and ".github" not in path.parts
    )

    if not projects:
        continue

    section_name = escape(section.name.replace("_", " "))

    items = []

    for project in projects:
        project_dir = project.parent
        relative_url = project_dir.as_posix().rstrip("/") + "/"
        project_name = escape(project_dir.name.replace("-", " "))

        items.append(
            f'    <li><a href="./{escape(relative_url, quote=True)}">'
            f'{project_name}</a></li>'
        )

    sections.append(
        '<section class="course-section">\n'
        f'  <h3>{section_name}</h3>\n'
        '  <ul>\n'
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

# Write the generated page for the GitHub Pages artifact.
INDEX.write_text(generated, encoding="utf-8")

print(f"Generated homepage with {len(sections)} course sections.")
