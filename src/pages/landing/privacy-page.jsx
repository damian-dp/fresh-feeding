import { motion } from "framer-motion";
import { LandingNavbar } from "@/components/landing-page/landing-navbar";
import { LandingFooter } from "@/components/landing-page/landing-footer";

export function PrivacyPage() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col min-h-screen"
        >
            <LandingNavbar />
            <main className="flex w-full flex-col container max-w-[50rem] items-center justify-center mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-14">
                <h1 className="text-4xl text-center font-medium mb-3 tracking-tight">
                    Privacy Policy
                </h1>
                <p className="text-muted-foreground text-xl">
                    Last updated: {new Date().toLocaleDateString()}
                </p>
                <div className="prose prose-gray dark:prose-invert mt-16 font-light leading-relaxed text-[1.063rem] text-foreground/60">
                    <p className="mb-8">
                        Fresh Food Feeding's Privacy Policy describes how we
                        collect, use, and protect your personal data. We believe
                        strongly in fundamental privacy rights and that these
                        rights should not differ depending on where you live in
                        the world.
                    </p>

                    <h2 className="text-2xl mb-2 font-medium mt-12 text-foreground">
                        What Is Personal Data at Fresh Food Feeding
                    </h2>
                    <p className="mb-4">
                        At Fresh Food Feeding, we treat any data that relates to
                        an identified or identifiable individual as "personal
                        data." This includes information that directly
                        identifies you, such as your name or email address, as
                        well as information that doesn't directly identify you
                        but can reasonably be used to do so, such as your dog's
                        profile data or your account preferences. When you
                        create recipes, track feeding patterns, or interact with
                        our services, this information is considered personal
                        data when it can be linked to you.
                    </p>

                    <h2 className="text-2xl mb-2 font-medium mt-12 text-foreground">
                        Your Privacy Rights at Fresh Food Feeding
                    </h2>
                    <p className="mb-4">
                        We respect your ability to know, access, correct,
                        transfer, restrict the processing of, and delete your
                        personal data. If you choose to exercise these privacy
                        rights, you have the right not to be treated in a
                        discriminatory way nor to receive a lesser degree of
                        service from Fresh Food Feeding. Where you are requested
                        to consent to the processing of your personal data, you
                        have the right to withdraw your consent at any time.
                    </p>
                    <p className="mb-4">
                        To exercise your privacy rights, you can contact us at
                        hello@damianpetrov.com. A dedicated team reviews your
                        inquiry to determine how best to respond to your
                        question or concern. In most cases, all substantive
                        contacts receive a response within seven days. There may
                        be situations where we cannot grant your request – for
                        example, if you ask us to delete data that we are
                        legally required to keep.
                    </p>

                    <h2 className="text-2xl mb-2 font-medium mt-12 text-foreground">
                        Personal Data Fresh Food Feeding Collects from You
                    </h2>
                    <p className="mb-4">
                        At Fresh Food Feeding, we believe that you can have
                        great products and great privacy. This means that we
                        strive to collect only the personal data that we need.
                        When you create an account, add a dog profile, create
                        recipes, or interact with our services, we may collect a
                        variety of information to provide and improve your
                        experience.
                    </p>
                    <p className="mb-4">
                        Your account and profile information includes your email
                        address, name, and contact details, as well as any
                        profile pictures or preferences you choose to provide.
                        When you create dog profiles, we collect information
                        such as your dogs' names, breeds, ages, weights, and
                        health information to provide accurate feeding
                        recommendations. This may also include photos of your
                        dogs and their dietary requirements.
                    </p>
                    <p className="mb-4">
                        As you use our service, we collect information about the
                        recipes you create, including custom meal plans,
                        ingredient preferences, feeding history, and nutritional
                        calculations. This helps us provide personalized
                        recommendations and improve our service. We also collect
                        certain device information, such as browser type and
                        usage patterns, to ensure our service works effectively
                        for you.
                    </p>

                    <h2 className="text-2xl mb-2 font-medium mt-12 text-foreground">
                        Fresh Food Feeding's Use of Personal Data
                    </h2>
                    <p className="mb-4">
                        We use personal data only when we have a valid legal
                        basis to do so. Depending on the circumstance, we may
                        rely on your consent or the fact that the processing is
                        necessary to fulfill our services to you. Your personal
                        data powers core functionality such as creating and
                        managing your account, generating personalized feeding
                        recommendations, and calculating nutritional
                        requirements for your dogs.
                    </p>
                    <p className="mb-4">
                        To improve our services, we analyze usage patterns,
                        develop new features, and provide customer support. This
                        processing is always done with respect for your privacy
                        and in accordance with applicable law. We do not use
                        algorithms or profiling to make any decision that would
                        significantly affect you without the opportunity for
                        human review.
                    </p>

                    <h2 className="text-2xl mb-2 font-medium mt-12 text-foreground">
                        Protection of Personal Data at Fresh Food Feeding
                    </h2>
                    <p className="mb-4">
                        At Fresh Food Feeding, we believe that great privacy
                        rests on great security. Your data is stored on secure
                        servers in the United States through our service
                        provider, Supabase. We implement comprehensive security
                        measures including end-to-end encryption for data
                        transmission, regular security audits, and secure access
                        controls. Our security practices are regularly updated
                        to maintain the highest standards of data protection.
                    </p>

                    <h2 className="text-2xl mb-2 font-medium mt-12 text-foreground">
                        Fresh Food Feeding's Sharing of Personal Data
                    </h2>
                    <p className="mb-4">
                        Fresh Food Feeding may share personal data with service
                        providers who act on our behalf, including Supabase for
                        database storage and authentication, and Vercel for
                        hosting and analytics. These service providers are
                        obligated to handle personal data consistent with this
                        Privacy Policy and according to our instructions. They
                        cannot use the personal data we share for their own
                        purposes and must delete or return the personal data
                        once they've fulfilled our request.
                    </p>
                    <p className="mb-4">
                        We do not sell or rent your personal data to third
                        parties. Any sharing of data is strictly limited to what
                        is necessary for providing our services. We may also
                        disclose information about you if we determine that
                        disclosure is reasonably necessary to enforce our terms
                        and conditions or protect our operations or users.
                    </p>

                    <h2 className="text-2xl mb-2 font-medium mt-12 text-foreground">
                        Changes to This Policy
                    </h2>
                    <p className="mb-4">
                        When there is a material change to this Privacy Policy,
                        we'll post a notice on this website at least a week in
                        advance of doing so and contact you directly about the
                        change if we have your data on file.
                    </p>

                    <h2 className="text-2xl mb-2 font-medium mt-12 text-foreground">
                        Privacy Questions
                    </h2>
                    <p className="mb-4">
                        If you have questions about Fresh Food Feeding's Privacy
                        Policy or privacy practices, you can contact us at{" "}
                        <a
                            href="mailto:hello@damianpetrov.com"
                            className="text-foreground hover:underline"
                        >
                            hello@damianpetrov.com
                        </a>
                        . We take your privacy questions seriously. A dedicated
                        team reviews your inquiry to determine how best to
                        respond to your question or concern. In most cases, all
                        substantive contacts receive a response within seven
                        days.
                    </p>
                </div>
            </main>
            <div className="w-full pb-8 pt-6 px-2 max-w-5xl border-t border-border mx-auto">
                <LandingFooter />
            </div>
        </motion.div>
    );
}
