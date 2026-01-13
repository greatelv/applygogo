import * as fs from "fs/promises";
import * as path from "path";

interface LogoResult {
  serviceId: string;
  success: boolean;
  logoUrl?: string;
  localPath?: string;
  error?: string;
}

async function updateServicesJson() {
  const servicesPath = path.join(process.cwd(), "lib/data/services.json");
  const resultsPath = path.join(process.cwd(), "logo-fetch-results.json");

  // Load services.json
  const servicesData = JSON.parse(await fs.readFile(servicesPath, "utf-8"));

  // Load logo fetch results
  const results: LogoResult[] = JSON.parse(
    await fs.readFile(resultsPath, "utf-8")
  );

  let updateCount = 0;

  // Update logo paths for successful fetches
  for (const result of results) {
    if (result.success && result.localPath) {
      const serviceId = result.serviceId;

      if (servicesData[serviceId]) {
        const oldLogo = servicesData[serviceId].logo;
        servicesData[serviceId].logo = result.localPath;
        console.log(
          `✅ Updated ${serviceId}: ${oldLogo} -> ${result.localPath}`
        );
        updateCount++;
      }
    }
  }

  // Save updated services.json
  await fs.writeFile(
    servicesPath,
    JSON.stringify(servicesData, null, 2),
    "utf-8"
  );

  console.log(`\n\n📊 Summary:`);
  console.log(`✅ Updated ${updateCount} service logos in services.json`);
  console.log(`💾 Saved to: ${servicesPath}`);

  // List services that still need manual logo updates
  const failedServices = results.filter((r) => !r.success);
  if (failedServices.length > 0) {
    console.log(`\n\n⚠️  Services with existing logos (no update needed):`);
    failedServices.forEach((r) => {
      console.log(`  - ${r.serviceId}: ${r.error}`);
    });
  }
}

updateServicesJson().catch(console.error);
