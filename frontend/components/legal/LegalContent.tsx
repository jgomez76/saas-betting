import { LegalContent } from "@/lib/legal/types";

type Props = {
  content: LegalContent;
};

export default function LegalContentComponent({
  content,
}: Props) {
  return (
    <>
      {content.sections.map((section) => (
        <section key={section.title}>
          <h2 className="text-xl font-semibold mb-2">
            {section.title}
          </h2>

          {section.content?.map((paragraph) => (
            <p
              key={paragraph}
              className="mb-4"
            >
              {paragraph}
            </p>
          ))}

          {section.contact && (
            <div className="mt-4">
              <p className="text-sm opacity-70">
                {section.contact.label}
              </p>

              <p className="font-semibold text-[var(--accent)]">
                {section.contact.value}
              </p>
            </div>
          )}

          {section.bullets && (
            <ul className="list-disc pl-6 space-y-2">
              {section.bullets.map((bullet) => (
                <li key={bullet}>
                  {bullet}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </>
  );
}