"use client";

import { Accordion } from "radix-ui";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface FaqItem {
  question: string;
  answer: string;
}

export function Faq({ items, className }: { items: FaqItem[]; className?: string }) {
  return (
    <Accordion.Root type="single" collapsible className={cn("divide-y divide-border rounded-2xl border border-border bg-surface", className)}>
      {items.map((item, i) => (
        <Accordion.Item key={item.question} value={`item-${i}`} className="px-5">
          <Accordion.Header>
            <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 py-5 text-left text-base font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring">
              {item.question}
              <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-data-[state=open]:rotate-180" aria-hidden />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden text-sm leading-relaxed text-muted-foreground data-[state=open]:animate-fade-in">
            <p className="pb-5 text-pretty">{item.answer}</p>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
