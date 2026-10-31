import '../home.css';
import Image from 'next/image';
import Link from 'next/link';
import { Fragment } from 'react';
import { CandleCover } from '@/components/candle-cover';
import { HeadTracker } from '@/components/head-tracker';
import { HomeFx } from '@/components/home/fx';
import { Quiz } from '@/components/home/quiz';
import { HeroStage } from '@/components/home/stage';
import { LeadForm } from '@/components/lead-form';
import { publicFileExists } from '@/components/project-cards';
import { PromoBanner } from '@/components/promo';
import { FaqSection } from '@/components/sections/leads';
import { Tabs } from '@/components/tabs';
import { TrackedLink } from '@/components/tracked-link';
import { homeCopy } from '@/lib/home';
import { fill, getDict } from '@/lib/i18n';
import { promoPrice, servicePrice } from '@/lib/pricing';
import { ABOUT_PHOTO, marketOf, PROMO, promoActive, REVIEWS_URL, SITE, TELEGRAM_URL, type Locale } from '@/lib/site';

const HEAD = '/about/head/h_{y}_{x}.webp';
const HEAD_GRID = 5;

/**
 * Главная: обещание и цены на первом экране → работы с цифрами → расчёт стоимости в 3 шага →
 * что сколько стоит → как проходит работа → что остаётся у клиента → отзывы → обо мне → вопросы → заявка.
 * Стили — app/home.css, тексты — lib/home.ts, цены — lib/site.ts.
 */
export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = homeCopy(locale);
  const dict = getDict(locale);
  const market = marketOf(locale);
  const w = dict.common;
  const home = `/${locale}`;
  const p = (slug: string) => `${home}/projects/${slug}`;

  // акция: тексты с подставленными названием, процентом и датой (как в старом блоке цен)
  const date = new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-GB', { day: 'numeric', month: 'long', timeZone: 'Europe/Moscow' }).format(new Date(PROMO.until));
  const vars = { name: PROMO.name[locale], percent: String(PROMO.percent), date };
  const pc = dict.promo;
  const promo = promoActive(market)
    ? { title: fill(pc.title, vars), text: fill(pc.text, vars), left: pc.left, days: pc.days, hours: pc.hours, minutes: pc.minutes, terms: fill(pc.terms, vars) }
    : null;

  const hasHead = Array.from({ length: HEAD_GRID * HEAD_GRID }, (_, i) => HEAD.replace('{x}', String(i % HEAD_GRID)).replace('{y}', String(Math.floor(i / HEAD_GRID)))).every(publicFileExists);
  const reviews = dict.testimonials.items;
  const picked = [reviews[0], reviews[1], reviews[3], reviews[6], reviews[7]].filter(Boolean);
  const words = t.hero.title.split(' ');

  return (
    <div className="hm">
      <HomeFx />

      {/* ---------- первый экран ---------- */}
      <section className="hero">
        <div className="wrap">
          <div className="hero-grid">
            <div>
              <h1 className="hm-display">
                {words.map((word, i) => (
                  <Fragment key={word + i}>
                    <span className="w">
                      <span style={{ animationDelay: `${i * 70}ms` }}>{word}</span>
                    </span>
                    {i < words.length - 1 && ' '}
                  </Fragment>
                ))}
              </h1>
              <p className="sub">{t.hero.sub}</p>
              <div className="mprices">
                {t.hero.prices.map((x) => (
                  <a key={x.label} href="#pricing" className={'hl' in x && x.hl ? 'hl' : undefined}>
                    <small>{x.label}</small>
                    <b>{x.price}</b>
                  </a>
                ))}
              </div>
              <div className="ctas">
                <a className="hm-btn hm-main" href="#start">
                  {t.hero.cta} →
                </a>
                <a className="hm-btn hm-ghost" href="#calc">
                  {t.hero.calc}
                </a>
              </div>
              <div className="who">
                <Image src="/about/avatar.jpg" alt="" width={52} height={52} />
                <div>
                  <b>{dict.about.name}</b>
                  <span>{t.hero.who}</span>
                </div>
              </div>
            </div>
            <HeroStage copy={t.stage} />
          </div>

          <div className="prices">
            {t.hero.prices.map((x) => (
              <a key={x.label} href="#pricing" className={'hl' in x && x.hl ? 'hl' : undefined}>
                <small>{x.label}</small>
                <b>{x.price}</b>
                <em>{x.term}</em>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- работы ---------- */}
      <section id="projects">
        <span id="works" aria-hidden="true" />
        <div className="wrap">
          <div className="works-head rv-up">
            <div>
              <h2 className="hm-h2">{t.works.title}</h2>
              <p className="hm-lead">{t.works.sub}</p>
            </div>
          </div>
          <div className="works">
            <Link prefetch={false} className="case c-big rv-up" href={p('ads-lumos')}>
              <div className="pic">
                {locale === 'ru' ? (
                  <Image src="/projects/ads-lumos/cover.webp" alt="" width={1440} height={900} sizes="(min-width: 980px) 800px, 100vw" />
                ) : (
                  <CandleCover locale={locale} size="lg" className="absolute inset-0" />
                )}
              </div>
              <div className="txt">
                <div className="kind">{t.works.lumos.kind}</div>
                <h3>{t.works.lumos.title}</h3>
                <div className="res">
                  {t.works.lumos.res.map((r) => (
                    <div key={r.label}>
                      <b>
                        {r.prefix}
                        {r.value}
                        {r.suffix}
                      </b>
                      <span>{r.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Link>
            <Link prefetch={false} className="case c-side rv-up" href={p('site-mdk')}>
              <div className="pic">
                <Image src="/home/mdk.webp" alt="" width={1440} height={900} sizes="(min-width: 980px) 400px, 100vw" />
              </div>
              <div className="txt">
                <div className="kind">{t.works.mdk.kind}</div>
                <h3>{t.works.mdk.title}</h3>
              </div>
            </Link>
            <a className="case c-third rv-up" href="https://kodgoda.ru" target="_blank" rel="noopener">
              <div className="pic">
                <Image src="/home/kodgoda.webp" alt="" width={1440} height={900} sizes="(min-width: 980px) 400px, 100vw" />
                <span className="ext">kodgoda.ru ↗</span>
              </div>
              <div className="txt">
                <div className="kind">{t.works.kodgoda.kind}</div>
                <h3>{t.works.kodgoda.title}</h3>
              </div>
            </a>
            <Link prefetch={false} className="case c-third rv-up" href={p('ads-barber')}>
              <div className="pic">
                <Image src="/projects/ads-barber/report.webp" alt="" width={1440} height={900} sizes="(min-width: 980px) 400px, 100vw" />
              </div>
              <div className="txt">
                <div className="kind">{t.works.barber.kind}</div>
                <h3>{t.works.barber.title}</h3>
              </div>
            </Link>
            <Link prefetch={false} className="case c-third rv-up" href={p('maps-cafe-1')}>
              <div className="pic">
                <div className="ba">
                  <div>
                    <Image src="/projects/maps-cafe-1/before.webp" alt="" fill sizes="(min-width: 980px) 200px, 50vw" />
                    <span>{t.works.cafe.before}</span>
                  </div>
                  <div>
                    <Image src="/projects/maps-cafe-1/after.webp" alt="" fill sizes="(min-width: 980px) 200px, 50vw" />
                    <span>{t.works.cafe.after}</span>
                  </div>
                </div>
              </div>
              <div className="txt">
                <div className="kind">{t.works.cafe.kind}</div>
                <h3>{t.works.cafe.title}</h3>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- расчёт стоимости ---------- */}
      <section className="quiz-sec" id="calc">
        <div className="wrap quiz-grid">
          <div className="rv-up">
            <h2 className="hm-h2">{t.calc.title}</h2>
            <p className="hm-lead">{t.calc.sub}</p>
          </div>
          <div className="rv-up">
            <Quiz copy={t.calc} />
          </div>
        </div>
      </section>

      {/* ---------- цены ---------- */}
      <section className="svc" id="pricing">
        <span id="services" aria-hidden="true" />
        <span id="prices" aria-hidden="true" />
        <div className="wrap">
          <div className="rv-up">
            <h2 className="hm-h2">{t.pricing.title}</h2>
            <p className="hm-lead">{t.pricing.sub}</p>
          </div>
          {promo && (
            <div style={{ marginTop: 32 }}>
              <PromoBanner until={PROMO.until} copy={promo} />
            </div>
          )}
          <div className="svc-grid">
            {t.pricing.cols.map((c) => (
              <div key={c.title} className="col rv-up">
                <h3>{c.title}</h3>
                <p className="for">{c.for}</p>
                <div className="rows">
                  {c.rows.map((r) => {
                    const sale = promoPrice('service', r.id, market, locale, w);
                    return (
                      <div key={r.name} className="row">
                        <div>
                          <b>{r.name}</b>
                          <small>{r.note}</small>
                        </div>
                        <div className="p">
                          {sale ?? servicePrice(r.id, market, locale, w)}
                          {sale && <s>{servicePrice(r.id, market, locale, w)}</s>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="gap" />
                <a className="hm-btn hm-ghost" href="#start">
                  {c.cta}
                </a>
                <Link prefetch={false} className="more" href={`${home}/services/${c.href}`}>
                  {t.pricing.more} →
                </Link>
              </div>
            ))}
            <div className="col dark rv-up">
              <span className="badge">{t.pricing.bundle.badge}</span>
              <h3>{t.pricing.bundle.title}</h3>
              <p className="for">{t.pricing.bundle.for}</p>
              <div className="rows">
                {t.pricing.bundle.items.map((x) => (
                  <div key={x} className="row">
                    <div>
                      <b>{x}</b>
                    </div>
                    <div className="p">✓</div>
                  </div>
                ))}
                <div className="row">
                  <div>
                    <b>{t.pricing.bundle.name}</b>
                  </div>
                  <div className="p" style={{ fontSize: 22 }}>
                    {t.pricing.bundle.price}
                  </div>
                </div>
              </div>
              <div className="gap" />
              <a className="hm-btn hm-main" href="#start">
                {t.pricing.bundle.cta} →
              </a>
            </div>
          </div>
          <p className="note">
            {t.pricing.note} {t.pricing.bots.text}{' '}
            <Link prefetch={false} href={`${home}/services/telegram-bots`}>
              {t.pricing.bots.link}
            </Link>
            .{promo && <> {promo.terms}</>}
          </p>
        </div>
      </section>

      {/* ---------- как проходит работа ---------- */}
      <section id="process">
        <div className="wrap">
          <div className="rv-up">
            <h2 className="hm-h2">{t.process.title}</h2>
            <p className="hm-lead">{t.process.sub}</p>
          </div>
          <div className="steps">
            {t.process.steps.map((s) => (
              <div key={s.title} className="step rv-up">
                <div className="day">{s.day}</div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <div className="get">
                  <b>{t.process.get}</b>
                  {s.get}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- что остаётся у клиента ---------- */}
      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <h2 className="hm-h2 rv-up">{t.keep.title}</h2>
          <div className="get-grid">
            {t.keep.items.map((g, i) => (
              <div key={g.title} className="gt rv-up">
                <div className="ic">{String(i + 1).padStart(2, '0')}</div>
                <h3>{g.title}</h3>
                <p>{g.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- отзывы ---------- */}
      <section className="svc" id="reviews">
        <div className="wrap">
          <h2 className="hm-h2 rv-up">{t.reviews.title}</h2>
          <div className="rev-grid">
            {picked.map((r, i) => (
              <figure key={r.who + i} className={i === 0 ? 'rv big rv-up' : 'rv rv-up'}>
                <blockquote>{r.text}</blockquote>
                <figcaption className="by">
                  <b>{r.who}</b> <span>— {r.tag}</span>
                </figcaption>
              </figure>
            ))}
          </div>
          {locale === 'ru' && (
            <TrackedLink goalName="click_telegram" href={REVIEWS_URL} className="rev-more">
              {t.reviews.all} →
            </TrackedLink>
          )}
        </div>
      </section>

      {/* ---------- обо мне ---------- */}
      <section className="about" id="about">
        <div className="wrap about-grid">
          <div className="photo rv-up">
            {hasHead ? (
              <HeadTracker pattern={HEAD} grid={HEAD_GRID} alt={dict.about.photoAlt} className="absolute inset-0" />
            ) : (
              <Image src={ABOUT_PHOTO} alt={dict.about.photoAlt} fill sizes="(min-width: 980px) 460px, 90vw" style={{ objectFit: 'cover' }} />
            )}
          </div>
          <div className="rv-up">
            <h2 className="hm-h2">{t.about.title}</h2>
            {dict.about.paragraphs.slice(1).map((x) => (
              <p key={x.slice(0, 24)}>{x}</p>
            ))}
            <div className="stats">
              {t.about.stats.map((s) => (
                <div key={s.label}>
                  <b>{s.value}</b>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <FaqSection locale={locale} />

      {/* ---------- заявка ---------- */}
      <section className="final" id="start">
        <span id="audit" aria-hidden="true" />
        <span id="contact" aria-hidden="true" />
        <div className="wrap">
          <div className="final-box">
            <div>
              <h2 className="hm-h2">{t.final.title}</h2>
              <p className="sub">{t.final.sub}</p>
              <div className="contacts">
                <TrackedLink goalName="click_telegram" href={TELEGRAM_URL}>
                  Telegram
                </TrackedLink>
                <a href={`https://wa.me/${SITE.phoneDigits}`} target="_blank" rel="noopener">
                  WhatsApp
                </a>
                {SITE.email && (
                  <TrackedLink goalName="click_email" href={`mailto:${SITE.email}`}>
                    {SITE.email}
                  </TrackedLink>
                )}
              </div>
              {SITE.phone && (
                <p className="sub" style={{ fontSize: 15 }}>
                  {SITE.phone} — {dict.footer.messengers}
                </p>
              )}
            </div>
            <div className="form">
              <Tabs
                id="lead"
                hashes={['contact', 'audit']}
                labels={[dict.contact.title, dict.audit.title]}
                panels={[
                  <div key="contact">
                    <p className="text-[15px] text-muted">{dict.contact.sub}</p>
                    <div className="mt-5">
                      <LeadForm variant="contact" />
                    </div>
                  </div>,
                  <div key="audit">
                    <p className="text-[15px] text-muted">{dict.audit.sub}</p>
                    <div className="mt-5">
                      <LeadForm variant="audit" />
                    </div>
                  </div>,
                ]}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
