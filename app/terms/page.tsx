
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import Link from 'next/link';
import { safeUrl } from '@/lib/utils';

export default function TermsOfService() {
  return (
    <div className="container max-w-full mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Terms of Service</CardTitle>
            <CardDescription>
              Last Updated: January 2026
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[70vh] pr-4">
              <div className="space-y-6 text-sm md:text-base leading-relaxed">
                <section>
                  <h3 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h3>
                  <p>
                    By accessing or using smalltalk.community (the &quot;Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you disagree with any part of the terms, you may not access the Service.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-xl font-semibold mb-2">2. Eligibility</h3>
                  <p>
                    You must be at least <strong>13 years old</strong> to use this Service. By creating an account, you warrant that you are at least 13 years of age. Accounts found to belong to users under 13 will be terminated immediately.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-xl font-semibold mb-2">3. User Conduct</h3>
                  <p>You agree NOT to use the Service to:</p>
                  <ul className="list-disc pl-5 space-y-1 mt-2">
                    <li>Post content that is illegal, harmful, threatening, abusive, harassing, defamatory, or hateful.</li>
                    <li>Impersonate any person or entity.</li>
                    <li>Transmit any viruses, malware, or destructive code.</li>
                    <li>Attempt to gain unauthorized access to other user accounts or the Service's systems.</li>
                  </ul>
                  <p className="mt-2">
                    We reserve the right to suspend or terminate your account if you violate these rules.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-xl font-semibold mb-2">4. Content Ownership</h3>
                  <p>
                    You retain ownership of the content you post on the Service (&quot;User Content&quot;). However, by posting content, you grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, and display your content in connection with operating the Service.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-xl font-semibold mb-2">5. Disclaimers & Limitation of Liability</h3>
                  <p>
                    The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. We make no warranties, expressed or implied, regarding the reliability, accuracy, or availability of the Service.
                  </p>
                  <p className="mt-2">
                    To the maximum extent permitted by Victorian law, smalltalk.community shall not be liable for any indirect, incidental, special, or consequential damages arising out of your use of the Service.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-xl font-semibold mb-2">6. Governing Law</h3>
                  <p>
                    These Terms shall be governed by and construed in accordance with the laws of <strong>Victoria, Australia</strong>, without regard to its conflict of law provisions.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-xl font-semibold mb-2">7. Changes to Terms</h3>
                  <p>
                    We reserve the right to modify these Terms at any time. We will provide notice of any material changes via email or a prominent notice on the Service. Your continued use of the Service after such changes constitutes your acceptance of the new Terms.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-xl font-semibold mb-2">8. Contact</h3>
                  <p>
                    For any questions regarding these Terms, please contact us at <a href={safeUrl("mailto:support@smalltalk.community")} className="text-primary hover:underline">support@smalltalk.community</a>.
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
