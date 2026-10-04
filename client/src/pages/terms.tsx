import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { ShieldAlert, Scale, ArrowLeft } from "lucide-react";
import { StopSign, WarningSign, TrafficCone, YieldSign } from "@/components/clipart";
import { StarDivider } from "@/components/americana";

const LAST_UPDATED = "October 4, 2026";

/** Prominent, color-coded rule callout fronted by a road sign. */
function Rule({
  art: Art,
  title,
  tone,
  children,
}: {
  art: (props: { className?: string }) => JSX.Element;
  title: string;
  tone: "red" | "amber";
  children: React.ReactNode;
}) {
  const tones = {
    red: "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400",
    amber: "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400",
  } as const;

  return (
    <div className={`rounded-xl border p-4 ${tones[tone]}`}>
      <div className="flex items-start gap-3">
        <Art className="w-9 h-9 shrink-0 drop-shadow-sm" />
        <div className="min-w-0">
          <h3 className="font-display font-black text-sm uppercase tracking-wide">
            {title}
          </h3>
          <div className="mt-1.5 text-sm text-foreground/80 leading-relaxed space-y-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="font-display font-black text-base flex items-baseline gap-2">
        <span className="text-primary tabular-nums">{number}</span>
        {title}
      </h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
        {children}
      </div>
    </section>
  );
}

export default function Terms() {
  return (
    <div className="p-4 space-y-6 pb-8">
      {/* Header */}
      <div className="space-y-3">
        <Link
          href="/"
          data-testid="link-terms-back"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Feed
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-red-600 flex items-center justify-center shadow-md shrink-0">
            <Scale className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-display font-black text-xl leading-tight">
              Terms &amp; Conditions
            </h1>
            <p className="text-[11px] text-muted-foreground font-semibold tracking-wide uppercase">
              Last updated {LAST_UPDATED}
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Bad Drivers of America exists to make roads safer — never less safe. By
          using this app you agree to the rules below. Violating them may result
          in removal of your content and a permanent ban, and may expose you to
          civil or criminal liability.
        </p>
      </div>

      {/* The non-negotiable safety rules */}
      <div className="space-y-3">
        <StarDivider label="The Non-Negotiable Rules" />

        <Rule art={StopSign} title="Never use this app while driving" tone="red">
          <p>
            <strong className="text-foreground">
              Do not open, browse, record, photograph, type, or submit anything
              in this app while you are operating a vehicle.
            </strong>{" "}
            Not at a red light. Not in stop-and-go traffic. Not "just for a
            second."
          </p>
          <p>
            Reports may only be created by a{" "}
            <strong className="text-foreground">passenger</strong>, or by a
            driver who has{" "}
            <strong className="text-foreground">
              fully stopped, parked, and shifted out of gear
            </strong>{" "}
            in a safe and legal location.
          </p>
          <p>
            Distracted driving is illegal in most jurisdictions and kills
            thousands of people every year. Using this app behind the wheel makes
            you exactly the kind of driver this app was built to report.
          </p>
        </Rule>

        <Rule art={YieldSign} title="No names, addresses, or personal data" tone="red">
          <p>
            Do not post or request a person's{" "}
            <strong className="text-foreground">
              name, home or work address, phone number, email, employer, social
              media profile, VIN, or any other identifying information
            </strong>
            .
          </p>
          <p>
            Reports are about{" "}
            <strong className="text-foreground">driving behavior</strong> — the
            incident, the location, and the vehicle. Nothing more. Do not attempt
            to look up, purchase, or share DMV or registration records tied to a
            plate; doing so is a federal offense under the Driver's Privacy
            Protection Act (18 U.S.C. § 2721).
          </p>
          <p>
            Blur or crop faces, house numbers, and street addresses in any photo
            or video before uploading.
          </p>
        </Rule>

        <Rule art={TrafficCone} title="Never follow, pursue, or confront anyone" tone="red">
          <p>
            <strong className="text-foreground">
              Do not follow another driver to their home, workplace, school, or
              anywhere else.
            </strong>{" "}
            Do not change your route to stay with them. Do not pursue, chase,
            box in, brake-check, or retaliate against another vehicle.
          </p>
          <p>
            Do not approach, confront, or attempt to speak with a driver you are
            reporting. Do not organize, encourage, or participate in harassment,
            doxxing, vigilantism, or any coordinated targeting of an individual.
          </p>
          <p>
            Following someone is stalking. Confronting someone escalates into
            road rage. Both get people killed. If a situation feels dangerous,
            disengage and call 911.
          </p>
        </Rule>

        <Rule art={WarningSign} title="Emergencies go to 911, not to us" tone="amber">
          <p>
            This app is{" "}
            <strong className="text-foreground">not an emergency service</strong>{" "}
            and is not monitored by law enforcement. If you witness a crash,
            an impaired driver, or an immediate threat to life, stop using this
            app and call 911 or your local emergency number.
          </p>
        </Rule>
      </div>

      {/* Full terms */}
      <Card className="p-4 space-y-5">
        <Section number="1." title="Eligibility and Acceptance">
          <p>
            You must be at least 18 years old to submit content. By creating an
            account, submitting a report, or otherwise using the app, you
            acknowledge that you have read, understood, and agree to be bound by
            these Terms. If you do not agree, do not use the app.
          </p>
        </Section>

        <Section number="2." title="Safe Use Requirement">
          <p>
            You agree that you will not interact with this app in any way while
            operating a motor vehicle. You represent that every report you submit
            was created either by a passenger or while your vehicle was safely
            and legally parked and stationary.
          </p>
          <p>
            You are solely responsible for complying with all traffic and
            distracted-driving laws in your jurisdiction. Nothing in this app
            authorizes, excuses, or encourages unlawful or unsafe operation of a
            vehicle.
          </p>
        </Section>

        <Section number="3." title="Privacy of Third Parties">
          <p>
            Reports must be limited to observable driving conduct, the general
            location of the incident, and publicly visible vehicle details such
            as the license plate, make, model, and color.
          </p>
          <p>You expressly agree not to post, link to, or solicit:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Legal names, nicknames, or aliases of a reported driver</li>
            <li>Home addresses, workplaces, schools, or routine locations</li>
            <li>Phone numbers, email addresses, or social media accounts</li>
            <li>Vehicle Identification Numbers or registration records</li>
            <li>Unblurred faces of drivers, passengers, or bystanders</li>
            <li>
              Any information obtained from DMV records, data brokers, or
              plate-lookup services
            </li>
          </ul>
          <p>
            We may remove any content containing personal data without notice. If
            you believe content about you violates this section, contact us for
            removal.
          </p>
        </Section>

        <Section number="4." title="No Stalking, Harassment, or Retaliation">
          <p>
            You agree not to follow, track, surveil, intercept, or attempt to
            locate any person identified in or through this app. You agree not to
            use the app to threaten, intimidate, harass, defame, or incite others
            against any individual. Accounts engaged in such conduct will be
            terminated and may be reported to law enforcement.
          </p>
        </Section>

        <Section number="5." title="Accuracy and Your Content">
          <p>
            You must only report incidents you personally witnessed, and your
            report must be truthful and accurate to the best of your knowledge.
            Knowingly submitting false, misleading, staged, or defamatory content
            is prohibited.
          </p>
          <p>
            You retain ownership of the photos, video, and text you submit, and
            you grant us a non-exclusive, worldwide, royalty-free license to host,
            display, and distribute that content within the app. You represent
            that you captured the content yourself or have the right to share it.
          </p>
        </Section>

        <Section number="6." title="Moderation and Removal">
          <p>
            We may review, edit, remove, or refuse any content for any reason,
            including suspected violations of these Terms. We may suspend or
            permanently ban accounts at our discretion. We are not obligated to
            pre-screen content, and the presence of content in the app is not an
            endorsement of its accuracy.
          </p>
        </Section>

        <Section number="7." title="No Legal or Official Standing">
          <p>
            Reports submitted here are user-generated opinions and observations.
            They are not official records, citations, insurance claims, or police
            reports, and they have no legal effect. Nothing in this app
            constitutes legal advice. To report a crime or a hazard, contact the
            appropriate authorities directly.
          </p>
        </Section>

        <Section number="8." title="Disclaimer and Limitation of Liability">
          <p>
            The app is provided "as is" and "as available," without warranties of
            any kind, express or implied. We do not verify the accuracy of
            user-submitted reports.
          </p>
          <p>
            To the fullest extent permitted by law, we are not liable for any
            indirect, incidental, special, consequential, or punitive damages, or
            for any injury, death, property damage, arrest, citation, or loss
            arising from your use of the app — including any harm resulting from
            using the app while driving, from following or confronting another
            person, or from content posted by other users.
          </p>
        </Section>

        <Section number="9." title="Indemnification">
          <p>
            You agree to indemnify and hold harmless Bad Drivers of America and
            its operators from any claims, damages, liabilities, and expenses
            (including reasonable attorneys' fees) arising out of your content,
            your use of the app, or your violation of these Terms or of any law
            or third-party right.
          </p>
        </Section>

        <Section number="10." title="Changes to These Terms">
          <p>
            We may update these Terms from time to time. Continued use of the app
            after changes are posted constitutes acceptance of the revised Terms.
            The "last updated" date above reflects the current version.
          </p>
        </Section>
      </Card>

      <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-accent">
        <ShieldAlert className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Keep your eyes on the road. Report later, from a safe stop. A safer
          driver is worth more than a faster post.
        </p>
      </div>
    </div>
  );
}
