import Image from "next/image";

const icons = [
  "netflix.png",
  "youtube.png",
  "disney.png",
  "spotify.png",
  "notion.png",
  "chatgpt.png",
  "adobe.png",
  "office.png",
  "canva.png",
  "zoom.png",
  "slack.png",
  "figma.png",
  "agoda.png",
  "aliexpress.png",
  "baemin.png",
  "biccamera.png",
  "coupang.png",
  "donki.png",
  "gamsgo.png",
  "genshin.png",
  "goingbus.png",
  "honkai-star-rail.png",
  "inflean.png",
  "kkday.png",
  "klook.png",
  "lightroom.png",
  "myrealtrip.png",
  "naver.png",
  "nordpass.png",
  "nordvpn.png",
  "oliveyoung.png",
  "saily.png",
  "speak.png",
  "trip.png",
  "usimsa.png",
  "zenless-zone-zero.png",
];

// Clean up the list to strictly match what exists in public/service-icons to avoid 404s
// Based on the 'list_dir' output earlier:
const existingIcons = [
  "agoda.png",
  "aliexpress.png",
  "baemin.png",
  "biccamera.png",
  "coupang.png",
  "donki.png",
  "figma.png",
  "gamsgo.png",
  "genshin.png",
  "goingbus.png",
  "honkai-star-rail.png",
  "inflean.png",
  "kkday.png",
  "klook.png",
  "lightroom.png",
  "myrealtrip.png",
  "naver.png",
  "netflix.png",
  "nordpass.png",
  "nordvpn.png",
  "notion.png",
  "oliveyoung.png",
  "saily.png",
  "speak.png",
  "trip.png",
  "usimsa.png",
  "zenless-zone-zero.png",
];

export function ServiceTicker() {
  return (
    <div className="w-full relative overflow-hidden py-4 [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]">
      <div className="flex w-max animate-scroll gap-4 items-center">
        {[...existingIcons, ...existingIcons].map((icon, index) => (
          <div
            key={`${icon}-${index}`}
            className="relative flex items-center justify-center min-w-[80px] md:min-w-[100px] h-[80px] md:h-[100px] transition-all duration-300 hover:scale-110"
          >
            <Image
              src={`/service-icons/${icon}`}
              alt={icon.replace(".png", "")}
              width={60}
              height={60}
              className="object-contain w-full h-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
