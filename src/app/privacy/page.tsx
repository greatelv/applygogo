export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
        <section>
          <p>
            Cake Corporation (hereinafter referred to as "Company") establishes
            and discloses this Privacy Policy in accordance with relevant laws,
            including the Act on Promotion of Information and Communications
            Network Utilization and Information Protection and the Personal
            Information Protection Act, to protect users' personal information
            and to handle related complaints quickly and smoothly.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Article 1 (Purpose of Collection and Use of Personal Information)
          </h2>
          <p>
            The Company processes personal information for the following
            purposes. The personal information being processed will not be used
            for purposes other than the following, and if the purpose of use
            changes, necessary measures such as obtaining separate consent will
            be implemented.
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              <span className="font-medium text-foreground">
                Membership Registration and Management:
              </span>{" "}
              Identity verification for use of membership services, personal
              identification, prevention of unauthorized and improper use by
              unauthorized members, confirmation of intent to join, age
              verification, handling of complaints, and delivery of notices.
            </li>
            <li>
              <span className="font-medium text-foreground">
                Service Provision:
              </span>{" "}
              AI resume generation, translation, summarization, PDF conversion,
              content provision, and customized service provision.
            </li>
            <li>
              <span className="font-medium text-foreground">
                Marketing and Advertising:
              </span>{" "}
              Development of new services (products), provision of customized
              services, delivery of event and promotional information, and
              provision of opportunities to participate.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Article 2 (Items of Personal Information Collected)
          </h2>
          <p>
            The Company collects the following personal information for
            membership registration, consultation, and service application.
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              Required Items: Name, Email address, Profile image (when using
              social login)
            </li>
            <li>
              Information collected during service use: Access logs, cookies,
              access IP information, resume data (experience, education, skill
              stack, etc.)
            </li>
            <li>
              Information collected during payment: Card issuer name, card
              number (partial), payment approval history (processed through PG)
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Article 3 (Retention and Use Period of Personal Information)
          </h2>
          <p>
            The Company processes and retains personal information within the
            personal information retention and use period according to laws or
            the period agreed upon when collecting personal information from the
            data subject.
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              Membership Registration and Management: Until membership
              withdrawal (however, if an investigation due to violation of
              related laws is in progress, until the end of the investigation)
            </li>
            <li>
              Provision of Goods or Services: Until the completion of supply and
              fee settlement/payment
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Article 4 (Procedures and Methods for Destruction of Personal
            Information)
          </h2>
          <p>
            The Company destroys the information without delay after the purpose
            of collecting and using personal information has been achieved.
            Information in the form of electronic files is deleted using
            technical methods that cannot reproduce the records.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Article 5 (Personal Information Protection Officer)
          </h2>
          <p>
            The Company is responsible for overall personal information
            processing and designates the following Personal Information
            Protection Officer to handle complaints and remedy damages related
            to personal information processing.
          </p>
          <div className="mt-4 p-4 bg-muted rounded-md text-sm">
            <p>
              <span className="font-semibold">Officer:</span> Taekyoung Jun
              (CEO)
            </p>
            <p>
              <span className="font-semibold">Department:</span> Personal
              Information Protection Team
            </p>
            <p>
              <span className="font-semibold">Email:</span> patakeique@gmail.com
            </p>
          </div>
        </section>

        <hr className="my-8 border-border" />

        <div className="text-sm">
          <p>Announcement Date: January 9, 2026</p>
          <p>Effective Date: January 9, 2026</p>
        </div>
      </div>
    </div>
  );
}
