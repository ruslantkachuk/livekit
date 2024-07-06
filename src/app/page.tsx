import { Suspense } from 'react';
import GetStartedForm from "@/components/get-started";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "CopyStake demo livestream",
};

export default function IndexPage() {
  return (
      <Suspense>
        <section className="items-start px-6 container mx-auto flex max-w-[680px] flex-1 flex-col pt-6 pb-8">
          <div className="mx-auto flex w-full flex-col items-start gap-4">
            <div className="flex items-center gap-2">
              <h1 className="text-[48pt] leading-tight tracking-tighter text-primary">
                CopyStake
              </h1>
            </div>
            <div className="flex flex-col gap-6 text-foreground">
              <p>To get started, enter a channel ID below and select an option:</p>
              <GetStartedForm/>
            </div>
          </div>
        </section>
      </Suspense>
  );
}
