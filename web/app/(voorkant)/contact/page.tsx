import type { Metadata } from "next";
import { PageFrame } from "@/components/voorkant/PageFrame";
import { JsonLd } from "@/components/voorkant/JsonLd";
import { ContactPage } from "@/components/voorkant/contact/ContactPage";
import { breadcrumbLd, pageMetadata } from "@/lib/voorkant/seo";
import { routes } from "@/lib/routes";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description: "Neem contact op met Wicked Workshops. Kies waar je bericht over gaat en schrijf ons; je antwoord komt per mail. Zakelijke aanvragen beantwoorden we binnen één werkdag.",
  path: routes.contact,
  image: "/img/keramiek.jpg",
});

export default function Page() {
  return (
    <PageFrame id="contact">
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: routes.home },
          { name: "Contact", path: routes.contact },
        ])}
      />
      <ContactPage />
    </PageFrame>
  );
}
