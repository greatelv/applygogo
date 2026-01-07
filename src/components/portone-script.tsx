"use client";

import Script from "next/script";

export function PortOneScript() {
  return (
    <Script
      src="https://cdn.iamport.kr/v1/iamport.js"
      strategy="lazyOnload"
      onLoad={() => {
        // @ts-ignore
        if (window.IMP) {
          // @ts-ignore
          window.IMP.init(process.env.NEXT_PUBLIC_PORTONE_STORE_ID);
        }
      }}
    />
  );
}
