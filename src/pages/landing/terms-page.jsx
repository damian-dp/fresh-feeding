import { motion } from "framer-motion";
import { LandingNavbar } from "@/components/landing-page/landing-navbar";
import { LandingFooter } from "@/components/landing-page/landing-footer";

export function TermsPage() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col min-h-screen"
        >
            <LandingNavbar />
            <main className="flex w-full flex-col container max-w-[50rem] items-center justify-center mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-14">
                <h1 className="text-4xl text-center font-medium mb-3 tracking-tight">
                    Website Terms of Use
                </h1>
                <p className="text-muted-foreground text-xl">
                    Last updated: {new Date().toLocaleDateString()}
                </p>
                <div className="prose prose-gray dark:prose-invert mt-16 font-light leading-relaxed text-[1.063rem] text-foreground/60">
                    <h2 className="text-2xl mb-3 font-medium mt-4 text-foreground">
                        Ownership of Site; Agreement to Terms of Use
                    </h2>
                    <p className="mb-4">
                        These Terms of Use apply to the Fresh Food Feeding
                        website located at freshfeeding.com.au and all
                        associated services and features. The site is the
                        property of Fresh Food Feeding ("we", "our", or "us").
                        By using the site, you agree to these Terms of Use; if
                        you do not agree, do not use the site.
                    </p>
                    <p className="mb-4">
                        We reserve the right, at our sole discretion, to change,
                        modify, add or remove portions of these Terms of Use at
                        any time. It is your responsibility to check these Terms
                        of Use periodically for changes. Your continued use of
                        the site following the posting of changes constitutes
                        acceptance of those changes.
                    </p>

                    <h2 className="text-2xl mb-2 font-medium mt-12 text-foreground">
                        Content and Intellectual Property
                    </h2>
                    <p className="mb-4">
                        All content on the site, including but not limited to
                        text, graphics, user interfaces, visual interfaces,
                        photographs, trademarks, logos, recipes, nutritional
                        information, and computer code is owned by or licensed
                        to Fresh Food Feeding and is protected by copyright and
                        other intellectual property laws.
                    </p>
                    <p className="mb-4">
                        You may use information from the site for your personal,
                        non-commercial use only, provided that you (1) retain
                        all copyright and proprietary notices, (2) do not modify
                        the content, and (3) do not use the content in any way
                        that suggests an association with Fresh Food Feeding
                        without our express approval.
                    </p>

                    <h2 className="text-2xl mb-2 font-medium mt-12 text-foreground">
                        Your Use of the Site
                    </h2>
                    <p className="mb-4">You agree not to:</p>
                    <ul>
                        <li>
                            Use any automated means to access or collect data
                            from the site
                        </li>
                        <li>
                            Attempt to gain unauthorized access to any portion
                            of the site or any systems or networks
                        </li>
                        <li>
                            Engage in any activity that interferes with or
                            disrupts the site
                        </li>
                        <li>
                            Use the site for any unlawful purpose or in
                            violation of these Terms
                        </li>
                        <li>
                            Attempt to reverse engineer any portion of the site
                        </li>
                        <li>
                            Collect or store personal data about other users
                            without their express consent
                        </li>
                    </ul>

                    <h2 className="text-2xl mb-2 font-medium mt-12 text-foreground">
                        User Accounts and Security
                    </h2>
                    <p className="mb-4">
                        You are responsible for maintaining the confidentiality
                        of your account credentials and for all activities that
                        occur under your account. You agree to notify us
                        immediately of any unauthorized use of your account. We
                        reserve the right to suspend or terminate accounts that
                        violate these terms.
                    </p>

                    <h2 className="text-2xl mb-2 font-medium mt-12 text-foreground">
                        User Content
                    </h2>
                    <p className="mb-4">
                        By submitting content to the site (including recipes,
                        photos, and comments), you grant us a worldwide,
                        non-exclusive, royalty-free license to use, reproduce,
                        modify, adapt, publish, and display such content. You
                        represent that you have all necessary rights to grant
                        this license.
                    </p>
                    <p className="mb-4">
                        We reserve the right to remove any content that violates
                        these terms or that we find objectionable for any
                        reason.
                    </p>

                    <h2 className="text-2xl mb-2 font-medium mt-12 text-foreground">
                        Disclaimers and Limitations
                    </h2>
                    <p className="mb-4">
                        THE SITE AND ALL CONTENT ARE PROVIDED "AS IS" WITHOUT
                        WARRANTY OF ANY KIND. WE DO NOT WARRANT THAT THE SITE
                        WILL BE UNINTERRUPTED OR ERROR-FREE, OR THAT DEFECTS
                        WILL BE CORRECTED. WE DISCLAIM ALL WARRANTIES, EXPRESS
                        OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY,
                        FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                    </p>

                    <h2 className="text-2xl mb-2 font-medium mt-12 text-foreground">
                        Limitation of Liability
                    </h2>
                    <p className="mb-4">
                        IN NO EVENT WILL WE BE LIABLE FOR ANY INDIRECT,
                        CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, OR PUNITIVE
                        DAMAGES, INCLUDING LOST PROFITS. OUR MAXIMUM LIABILITY
                        FOR ANY DAMAGE SHALL NOT EXCEED THE AMOUNT PAID BY YOU,
                        IF ANY, FOR ACCESSING THE SITE.
                    </p>

                    <h2 className="text-2xl mb-2 font-medium mt-12 text-foreground">
                        Indemnification
                    </h2>
                    <p className="mb-4">
                        You agree to indemnify and hold us harmless from any
                        claims, losses, or damages, including legal fees,
                        resulting from your violation of these Terms of Use or
                        your use of the site.
                    </p>

                    <h2 className="text-2xl mb-2 font-medium mt-12 text-foreground">
                        Governing Law
                    </h2>
                    <p className="mb-4">
                        These Terms of Use are governed by the laws of
                        Australia. Any disputes shall be subject to the
                        exclusive jurisdiction of the courts in Australia.
                    </p>

                    <h2 className="text-2xl mb-2 font-medium mt-12 text-foreground">
                        Termination
                    </h2>
                    <p className="mb-4">
                        We may terminate or suspend your access to the site
                        immediately, without prior notice, for any reason,
                        including breach of these Terms of Use. Upon
                        termination, your right to use the site will immediately
                        cease.
                    </p>

                    <h2 className="text-2xl mb-2 font-medium mt-12 text-foreground">
                        Contact Information
                    </h2>
                    <p className="mb-4">
                        For questions about these Terms of Use, please contact
                        us at{" "}
                        <a
                            href="mailto:hello@damianpetrov.com"
                            className="text-foreground hover:underline"
                        >
                            hello@damianpetrov.com
                        </a>
                    </p>
                </div>
            </main>
            <div className="w-full pb-8 pt-6 px-2 max-w-5xl border-t border-border mx-auto">
                <LandingFooter />
            </div>
        </motion.div>
    );
}
