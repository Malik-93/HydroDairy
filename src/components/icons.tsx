import type { SVGProps } from "react";

export function MilkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M8 2h8v3.5a2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 0-5 0V2" />
      <path d="M5 5.5v15a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-15" />
      <path d="m12 9-1.5 3h3L12 9z" />
    </svg>
  );
}
