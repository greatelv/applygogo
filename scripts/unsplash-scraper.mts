import puppeteer, { Browser } from "puppeteer";

export class UnsplashScraper {
  private browser: Browser | null = null;

  async init() {
    if (!this.browser) {
      console.log("Launching headless browser...");
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        ],
      });
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async searchPhoto(query: string): Promise<{
    url: string;
    photographer: string;
    photographerUrl: string;
  } | null> {
    if (!this.browser) await this.init();
    const page = await this.browser!.newPage();

    // Set viewport to get good quality images
    await page.setViewport({ width: 1280, height: 800 });

    try {
      const searchUrl = `https://unsplash.com/s/photos/${encodeURIComponent(
        query
      )}`;
      console.log(`Scraping Unsplash: ${searchUrl}`);

      // Navigate and wait for network idle to ensure hydration
      await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 15000 });

      const photoData = await page.evaluate(() => {
        // Try precise selector first, then generic
        const figures = document.querySelectorAll("figure");

        if (figures.length === 0) return null;

        // Iterate figures to find one that looks like a photo result (has an image with unsplash url)
        let targetFigure: Element | null = null;
        let targetImg: HTMLImageElement | null = null;

        for (const fig of figures) {
          const img = fig.querySelector("img");

          if (img && img.src) {
            // 1. Filter: Must be from images.unsplash.com/photo- (Free images)
            // 2. Filter: Must NOT be from plus.unsplash.com (Premium/Unsplash+)
            const isFreeUnsplash =
              img.src.includes("images.unsplash.com/photo-") &&
              !img.src.includes("plus.unsplash.com");

            // 3. Filter: Not an icon or tiny thumbnail
            // Use clientWidth/Height as naturalWidth might be 0 if not fully loaded
            const width = img.naturalWidth || img.width || img.clientWidth || 0;
            const isLargeEnough = width > 200;

            if (isFreeUnsplash && isLargeEnough) {
              targetFigure = fig;
              targetImg = img;
              break;
            }
          }
        }

        if (!targetFigure || !targetImg) return null;

        // Get the source set or src.
        let src = targetImg.currentSrc || targetImg.src;

        // Modify URL to get 1200px width for quality/size balance
        const urlObj = new URL(src);
        urlObj.searchParams.set("w", "1200");
        urlObj.searchParams.set("q", "80");
        urlObj.searchParams.set("auto", "format"); // Ensure modern format like WebP/AVIF if supported

        const photoUrl = urlObj.toString();

        // Try to find photographer info
        const links = Array.from(targetFigure.querySelectorAll("a"));
        let photographer = "Unsplash Photographer";
        let photographerUrl = "https://unsplash.com";

        // 1. Look for a link that has /@ (indicates a user profile)
        const profileLink = links.find((a) => {
          const href = a.getAttribute("href") || "";
          return (
            href.includes("/@") &&
            !href.includes("unsplash.com/") && // Don't match full URLs yet
            !href.includes("/plus")
          );
        });

        if (profileLink) {
          const name = profileLink.textContent?.trim();
          if (name && name !== "" && !name.toLowerCase().includes("unsplash")) {
            photographer = name;
          } else {
            // Try to find a link that doesn't contain "Unsplash" or "Download"
            const nameLink = links.find((l) => {
              const ln = l.textContent?.trim();
              return (
                ln &&
                ln !== "" &&
                !ln.toLowerCase().includes("unsplash") &&
                !ln.toLowerCase().includes("download")
              );
            });
            if (nameLink)
              photographer = nameLink.textContent?.trim() || photographer;
          }

          const href = profileLink.getAttribute("href") || "";
          photographerUrl = href.startsWith("http")
            ? href
            : `https://unsplash.com${href}`;
        } else {
          // Fallback: any link that looks like a name
          const fallbackLink = links.find((l) => {
            const ln = l.textContent?.trim();
            return (
              ln &&
              ln.length > 2 &&
              !ln.toLowerCase().includes("unsplash") &&
              !ln.toLowerCase().includes("download")
            );
          });
          if (fallbackLink) {
            photographer = fallbackLink.textContent?.trim() || photographer;
            const href = fallbackLink.getAttribute("href") || "";
            photographerUrl = href.startsWith("http")
              ? href
              : `https://unsplash.com${href}`;
          }
        }

        return {
          url: photoUrl,
          photographer: photographer.replace(/\s+/g, " "),
          photographerUrl: photographerUrl,
        };
      });

      return photoData;
    } catch (e) {
      console.error(`Error scraping query "${query}":`, e);
      return null;
    } finally {
      await page.close();
    }
  }
}
