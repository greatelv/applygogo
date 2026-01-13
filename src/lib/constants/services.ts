import { Category } from "@/lib/constants/categories";
import { Service } from "@/lib/types";
import servicesData from "@/lib/data/services.json";

// JSON 데이터를 Service 타입으로 변환
const convertToServices = (
  data: Record<string, any>
): Record<string, Service> => {
  const services: Record<string, Service> = {};

  for (const [key, value] of Object.entries(data)) {
    services[key] = {
      ...value,
      category: Category[value.category as keyof typeof Category],
    } as Service;
  }

  return services;
};

export const SERVICES: Record<string, Service> =
  convertToServices(servicesData);
