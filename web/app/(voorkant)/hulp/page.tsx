import type { Metadata } from "next";
import { PageFrame } from "@/components/voorkant/PageFrame";
import { JsonLd } from "@/components/voorkant/JsonLd";
import { HelpPage } from "@/components/voorkant/hulp/HelpPage";
import { answerText, HELP_BLOCKS } from "@/components/voorkant/hulp/content";
import { breadcrumbLd, faqLd, pageMetadata } from "@/lib/voorkant/seo";
import { routes } from "@/lib/routes";

export const metadata: Metadata = pageMetadata({
  title: "Hulp voor deelnemers en workshopgevers",
  description:
    "Antwoorden over boeken, het minimum en het beslismoment, annuleren, de pilot en betalen, en workshop geven bij Wicked Workshops. Zoek op een woord of kies een onderwerp.",
  path: routes.help,
  image: "/img/samen.jpg",
});

const faq = HELP_BLOCKS.flatMap((b) => b.faq.map((f) => ({ question: f.q, answer: answerText(f.a) })));

export default function Page() {
  return (
    <PageFrame id="hulp">
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Home", path: routes.home },
            { name: "Hulp", path: routes.help },
          ]),
          faqLd(faq),
        ]}
      />
      <HelpPage />
    </PageFrame>
  );
}
