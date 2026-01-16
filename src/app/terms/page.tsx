export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Article 1 (Purpose)
          </h2>
          <p>
            These terms aim to define the rights, obligations, responsibilities,
            and other necessary matters between Cake Corporation (hereinafter
            referred to as "Company") and its members regarding the use of the
            ApplyGoGo service (hereinafter referred to as "Service") operated by
            the Company.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Article 2 (Definitions)
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              "Service" refers to the AI-based resume conversion and all related
              services provided by the Company.
            </li>
            <li>
              "Member" refers to an individual who has entered into a service
              use agreement with the Company and uses the Service.
            </li>
            <li>
              "Paid Service" refers to various digital content and services
              provided by the Company for a fee.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Article 3 (Effectiveness and Amendment of Terms)
          </h2>
          <p>
            The Company shall post the contents of these terms on the initial
            service screen so that members can easily access them. The Company
            may amend these terms within the scope that does not violate
            relevant laws and regulations. When amended, the effective date and
            reason for the amendment shall be specified and announced along with
            the current terms on the initial service screen.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Article 4 (Membership Registration)
          </h2>
          <p>
            Membership is established when a user agrees to the terms and
            applies for registration, and the Company accepts the application.
            The Company may defer or refuse acceptance in the following cases:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              If the applicant has previously lost their membership status under
              these terms.
            </li>
            <li>If the applicant uses someone else's identity.</li>
            <li>
              If false information is provided or required information is not
              included.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Article 5 (Provision and Change of Service)
          </h2>
          <p>
            The Company provides services such as AI resume summarization,
            translation, and PDF conversion to members. The Company may change
            the content of the Service provided based on technical
            specifications or operational needs. In such cases, the change and
            effective date will be announced in advance.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Article 6 (Fees and Payment)
          </h2>
          <p>
            Services are provided as Free and Paid (passes, etc.). The fees and
            payment methods for Paid Services are as specified on the respective
            service pages.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Article 7 (Cancellation and Refund Policy)
          </h2>
          <p>
            The Company applies the following refund policy considering the
            nature of digital content and services:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-2">
            <li>
              <strong>Full Refund:</strong> Possible within 7 days of purchase,
              provided that no credits provided through the pass have been used
              and no services (such as AI processing) have been utilized even
              once.
            </li>
            <li>
              <strong>No Refund:</strong> If 7 days have passed since purchase,
              or if credits haven been used or AI processing has occurred even
              once, refunds are not possible as the value of the digital content
              is considered significantly diminished.
            </li>
            <li>
              <strong>No Partial Refunds:</strong> Since this service is
              provided through fixed-term passes and credit charging, no partial
              refunds are provided for mid-term cancellations.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Article 8 (Personal Information Protection)
          </h2>
          <p>
            The Company strives to protect members' personal information in
            accordance with relevant laws. The protection and use of personal
            information are governed by relevant laws and the Company's Privacy
            Policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Article 9 (Obligations of Members)
          </h2>
          <p>Members must not perform the following actions:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Registration of false information when applying or changing</li>
            <li>Identity theft of others</li>
            <li>Changing information posted by the Company</li>
            <li>
              Actions that interfere with the legitimate operation of the
              Service
            </li>
          </ul>
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
