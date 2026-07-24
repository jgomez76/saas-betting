from datetime import datetime
from pathlib import Path

from jinja2 import (
    Environment,
    FileSystemLoader,
    select_autoescape,
)


TEMPLATES_DIR = (
    Path(__file__).parent / "templates"
)

env = Environment(
    loader=FileSystemLoader(TEMPLATES_DIR),
    autoescape=select_autoescape(
        ["html", "xml"],
    ),
)


def render_template(
    template_name: str,
    **context,
) -> str:
    """
    Renders an email template injecting
    common variables automatically.
    """

    context.setdefault(
        "year",
        datetime.now().year,
    )

    context.setdefault(
        "company_name",
        "Luranix",
    )

    context.setdefault(
        "support_email",
        "support@luranix.com",
    )

    template = env.get_template(
        template_name,
    )

    return template.render(
        **context,
    )