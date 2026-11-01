import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base = (props: P) => ({
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  width: 20,
  height: 20,
  ...props,
});

export const IconShip = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 15.5 5 9h14l2 6.5" />
    <path d="M2 16c1.8 0 1.8 1.6 3.6 1.6S7.4 16 9.2 16s1.8 1.6 3.6 1.6S14.6 16 16.4 16s1.8 1.6 3.6 1.6" />
    <path d="M6 21c1.8 0 1.8-1.4 3.6-1.4S11.4 21 13.2 21 15 19.6 16.8 19.6" />
    <path d="M9 9V5h6v4" />
    <path d="M12 5V2" />
  </svg>
);

export const IconContainer = (p: P) => (
  <svg {...base(p)}>
    <rect x="2.5" y="6.5" width="19" height="11" rx="1" />
    <path d="M7 6.5v11M11 6.5v11M15 6.5v11M19 6.5v11" />
  </svg>
);

export const IconCar = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 16v2.2a.8.8 0 0 0 .8.8h1.6a.8.8 0 0 0 .8-.8V16" />
    <path d="M16.8 16v2.2a.8.8 0 0 0 .8.8H19.2a.8.8 0 0 0 .8-.8V16" />
    <path d="M2.8 16h18.4v-3.2c0-.7-.4-1.3-1-1.6l-1.6-.8-2-3.4A2 2 0 0 0 14.9 6H9.1a2 2 0 0 0-1.7 1l-2 3.4-1.6.8c-.6.3-1 .9-1 1.6Z" />
    <path d="M6.6 12.8h10.8" />
    <path d="M6 14.4h.01M18 14.4h.01" />
  </svg>
);

export const IconTruck = (p: P) => (
  <svg {...base(p)}>
    <path d="M2.5 6.5h11v10h-11z" />
    <path d="M13.5 10h4l3 3v3.5h-7z" />
    <circle cx="7" cy="18" r="1.8" />
    <circle cx="17" cy="18" r="1.8" />
  </svg>
);

export const IconDoc = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 2.8h8L18.5 7v14.2H6z" />
    <path d="M13.8 2.9V7.2h4.4" />
    <path d="M8.8 12h6.4M8.8 15.2h6.4M8.8 18h4" />
  </svg>
);

export const IconAlert = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3.5 21.2 19.5H2.8z" />
    <path d="M12 9.5v4.2M12 16.8h.01" />
  </svg>
);

export const IconCheck = (p: P) => (
  <svg {...base(p)}>
    <path d="M4.5 12.5 9.5 17.5 19.5 6.5" />
  </svg>
);

export const IconSearch = (p: P) => (
  <svg {...base(p)}>
    <circle cx="10.8" cy="10.8" r="6.6" />
    <path d="m15.6 15.6 4.2 4.2" />
  </svg>
);

export const IconArrow = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 12h15" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

export const IconPin = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.6" />
  </svg>
);

export const IconClock = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.8" />
    <path d="M12 7v5.3l3.4 2" />
  </svg>
);

export const IconGauge = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 17a8.5 8.5 0 1 1 16 0" />
    <path d="m12 13 4-3.4" />
    <circle cx="12" cy="17" r="1.4" />
  </svg>
);

export const IconFuel = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 20.5V4.6A1.6 1.6 0 0 1 6.6 3h6.1A1.6 1.6 0 0 1 14.3 4.6v15.9" />
    <path d="M3.6 20.5h12.2" />
    <path d="M6.8 7.2h5.7v4H6.8z" />
    <path d="M14.3 9h2.2a2 2 0 0 1 2 2v5.2a1.6 1.6 0 0 0 3.2 0V9.6L19 7" />
  </svg>
);

export const IconGear = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="3.1" />
    <path d="M19.4 14.4a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.3a2 2 0 1 1-4 0v-.2a1.6 1.6 0 0 0-2.8-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7h-.3a2 2 0 1 1 0-4h.2a1.6 1.6 0 0 0 1.1-2.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 2.7-1.1v-.3a2 2 0 1 1 4 0v.2a1.6 1.6 0 0 0 2.8 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.3a2 2 0 1 1 0 4h-.2a1.6 1.6 0 0 0-1.4 1Z" />
  </svg>
);

export const IconCalendar = (p: P) => (
  <svg {...base(p)}>
    <rect x="3.4" y="5" width="17.2" height="15.6" rx="1.6" />
    <path d="M3.4 9.8h17.2M8.2 3.2v3.6M15.8 3.2v3.6" />
  </svg>
);

export const IconYen = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 4.5 12 12l6-7.5" />
    <path d="M12 12v8" />
    <path d="M7.5 14h9M7.5 17.2h9" />
  </svg>
);

export const IconShield = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 2.8 20 5.6v6c0 4.6-3.3 8.4-8 9.6-4.7-1.2-8-5-8-9.6v-6Z" />
    <path d="m8.8 12 2.2 2.2 4.2-4.4" />
  </svg>
);

export const IconChat = (p: P) => (
  <svg {...base(p)}>
    <path d="M20.5 12.2c0 4-3.8 7.2-8.5 7.2a9.8 9.8 0 0 1-2.6-.35L4.5 20.8l1.3-3.4A6.9 6.9 0 0 1 3.5 12.2C3.5 8.2 7.3 5 12 5s8.5 3.2 8.5 7.2Z" />
  </svg>
);

export const IconLike = (p: P) => (
  <svg {...base(p)}>
    <path d="M7 10.5v9H4.6a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z" />
    <path d="M7 10.5 11.4 3a2.2 2.2 0 0 1 2.2 2.2V9h4.9a2 2 0 0 1 2 2.4l-1.3 6A2 2 0 0 1 17.2 19H7" />
  </svg>
);

export const IconHeart = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 20s-7.4-4.4-8.8-9A4.6 4.6 0 0 1 12 7.2 4.6 4.6 0 0 1 20.8 11c-1.4 4.6-8.8 9-8.8 9Z" />
  </svg>
);

export const IconFire = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 21c3.6 0 6-2.4 6-5.6 0-4.4-4.2-5.6-3.6-11.4C11 5.4 12.6 7.8 12.6 9.6c-1.2-.6-1.8-1.8-1.8-3.2C8.4 8 6 11 6 15.4 6 18.6 8.4 21 12 21Z" />
  </svg>
);

export const IconMenu = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const IconClose = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const IconChevron = (p: P) => (
  <svg {...base(p)}>
    <path d="m8 5 7 7-7 7" />
  </svg>
);

export const IconWhatsApp = (p: P) => (
  <svg {...base(p)} strokeWidth={1.5}>
    <path d="M3.6 20.4 5 16.6a7.9 7.9 0 1 1 3 3Z" />
    <path d="M9 8.6c.4 2.4 3.2 5.3 5.6 5.8l1-1.5 2 .9v1.5c-3.4.8-8.2-3.6-8.9-7.1Z" />
  </svg>
);

export const IconPhone = (p: P) => (
  <svg {...base(p)}>
    <path d="M6.2 3.5h3l1.5 3.8-2 1.4a11.6 11.6 0 0 0 5.6 5.6l1.4-2 3.8 1.5v3a1.7 1.7 0 0 1-1.9 1.7C11.3 19.8 4.2 12.7 3.4 5.4A1.7 1.7 0 0 1 5.1 3.5Z" />
  </svg>
);

export const IconMail = (p: P) => (
  <svg {...base(p)}>
    <rect x="2.8" y="5" width="18.4" height="14" rx="1.8" />
    <path d="m3.4 6.6 8.6 6 8.6-6" />
  </svg>
);

export const IconRoute = (p: P) => (
  <svg {...base(p)}>
    <circle cx="5.5" cy="6" r="2.6" />
    <circle cx="18.5" cy="18" r="2.6" />
    <path d="M8.1 6h6.2a3.4 3.4 0 0 1 0 6.8H9.7a3.4 3.4 0 0 0 0 5.2h6.2" strokeDasharray="0" />
  </svg>
);

export const IconAnchor = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="5" r="2.2" />
    <path d="M12 7.2V21" />
    <path d="M8 10.4h8" />
    <path d="M4 14.5a8 8 0 0 0 16 0" />
  </svg>
);

export const IconStar = (p: P) => (
  <svg {...base(p)}>
    <path d="m12 3.6 2.6 5.4 5.9.8-4.3 4.1 1.1 5.9-5.3-2.9-5.3 2.9 1.1-5.9L3.5 9.8l5.9-.8Z" />
  </svg>
);

export const IconGlobe = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.8" />
    <path d="M3.4 12h17.2" />
    <path d="M12 3.2c2.4 2.4 3.6 5.4 3.6 8.8s-1.2 6.4-3.6 8.8c-2.4-2.4-3.6-5.4-3.6-8.8S9.6 5.6 12 3.2Z" />
  </svg>
);

export const IconPlus = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconUsers = (p: P) => (
  <svg {...base(p)}>
    <circle cx="9" cy="8.4" r="3.4" />
    <path d="M2.8 20c.6-3.4 3.2-5.4 6.2-5.4S14.6 16.6 15.2 20" />
    <path d="M16.4 5.6a3.4 3.4 0 0 1 0 6.6" />
    <path d="M17.6 14.8c2.2.6 3.5 2.4 3.8 5.2" />
  </svg>
);
