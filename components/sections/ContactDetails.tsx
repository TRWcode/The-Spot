import { Icon } from "@/components/brand/Icon";
import { SocialIcon } from "@/components/brand/SocialIcon";
import { site } from "@/lib/content";

/**
 * Mail, phone, address and socials — the block that appears both in the
 * homepage's contact section and on /contact.
 *
 * No directive of its own: it holds no state, so it renders on the server
 * under /contact and comes along as client code inside the homepage section.
 *
 * The icons replace eyebrow labels rather than joining them — "E-MAIL" above
 * an address that is visibly an address was saying the same thing twice.
 */
export function ContactDetails() {
  return (
    // A fragment, not a wrapper: the homepage staggers these rows in one by one
    // by animating the direct children of its Reveal, and an element in between
    // would collapse that into a single block fading in.
    <>
      <a href={`mailto:${site.email}`} className="contact-row">
        <Icon name="mail" className="contact-row__icon" />
        <span>{site.email}</span>
      </a>
      <a href={`tel:${site.phoneHref}`} className="contact-row">
        <Icon name="phone" className="contact-row__icon" />
        <span>{site.phone}</span>
      </a>
      <p className="contact-row is-static">
        <Icon name="pin" className="contact-row__icon" />
        <span>{site.address}</span>
      </p>

      <ul className="mt-3 flex gap-2.5">
        {site.socials.map((s) => (
          <li key={s.label}>
            <a
              href={s.href}
              target="_blank"
              rel="noreferrer noopener"
              className="social-btn"
              aria-label={`${s.label} (opent in nieuw tabblad)`}
            >
              <SocialIcon name={s.label} className="h-[18px] w-[18px]" />
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
