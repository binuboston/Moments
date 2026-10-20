import * as React from "react";
import { cn } from "@/lib/utils/cn";

type ContainerProps<T extends React.ElementType = "div"> = {
  as?: T;
  size?: "default" | "narrow" | "wide";
} & Omit<React.ComponentPropsWithoutRef<T>, "as">;

export function Container<T extends React.ElementType = "div">({ as, size = "default", className, ...props }: ContainerProps<T>) {
  const Comp = (as ?? "div") as React.ElementType;
  return (
    <Comp
      className={cn(
        "container-page",
        size === "narrow" && "max-w-3xl",
        size === "wide" && "max-w-[88rem]",
        className,
      )}
      {...props}
    />
  );
}
