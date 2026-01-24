
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import Link from 'next/link';
import { safeUrl } from '@/lib/utils';

export default function PrivacyPolicy() {
  return (
    <div className="container max-w-full mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
            <CardDescription>
              Last Updated: January 2026
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[70vh] pr-4">
              <div className="space-y-6 text-sm md:text-base leading-relaxed">
                <section>
                  <h3 className="text-xl font-semibold mb-2">1. Introduction</h3>
                  <p>
                    Welcome to smalltalk.community (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your personal information and your right to privacy.
                    This policy outlines how we handle your data in accordance with the <strong>Privacy Act 1988 (Cth)</strong> and the <strong>Australian Privacy Principles (APPs)</strong>.
                  </p>
                  <p className="mt-2">
                    By accessing or using our platform, you agree to the collection and use of information in accordance with this policy.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-xl font-semibold mb-2">2. Information We Collect</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Personal Identity:</strong> Name, email address, date of birth (for age verification).</li>
                    <li><strong>Profile Data:</strong> Bio, location (suburb/region), interests, and skills.</li>
                    <li><strong>Usage Data:</strong> Interactions with apps, log data, and device information.</li>
                    <li><strong>User Content:</strong> Posts, messages, and uploaded media.</li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h3 className="text-xl font-semibold mb-2">3. Age Restriction (Important)</h3>
                  <p>
                    <strong>Strictly 13+ Service:</strong> Our platform is not intended for children under the age of 13.
                    We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information immediately.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-xl font-semibold mb-2">4. How We Use Your Information</h3>
                  <p>We use your data to:</p>
                  <ul className="list-disc pl-5 space-y-1 mt-2">
                    <li>Provide, operate, and maintain the platform.</li>
                    <li>Improve, personalize, and expand our services.</li>
                    <li>Detect and prevent fraud, abuse, and security incidents.</li>
                    <li>Communicate with you, either directly or through one of our partners (e.g., for customer service or updates).</li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h3 className="text-xl font-semibold mb-2">5. Data Storage & Security</h3>
                  <p>
                    Your data is stored securely using industry-standard encryption. We utilize Supabase (PostgreSQL) with Row Level Security (RLS) to ensure that your private data is only accessible by you and authorized services.
                  </p>
                  <p className="mt-2">
                    While we strive to use commercially acceptable means to protect your Personal Information, no method of transmission over the Internet is 100% secure.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-xl font-semibold mb-2">6. Your Rights</h3>
                  <p>Under the Privacy Act, you have the right to:</p>
                  <ul className="list-disc pl-5 space-y-1 mt-2">
                    <li>Access the personal information we hold about you.</li>
                    <li>Request corrections to any inaccurate data.</li>
                    <li>Request deletion of your account and data (&quot;Right to be Forgotten&quot;).</li>
                    <li>Opt-out of marketing communications.</li>
                  </ul>
                  <p className="mt-2">
                    To exercise these rights, please contact us at <a href={safeUrl("mailto:privacy@smalltalk.community")} className="text-primary hover:underline">privacy@smalltalk.community</a>.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-xl font-semibold mb-2">7. Contact Us</h3>
                  <p>
                    If you have any questions about this Privacy Policy, please contact our Privacy Officer:
                  </p>
                  <p className="mt-2 font-medium">
                    Email: ryanhutchison@outlook.com.au
                  </p>
                </section>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/" className="hover:underline">Return to Home</Link>
        </div>
      </div>
    </div>
  );
}
