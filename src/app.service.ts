import { Injectable } from "@nestjs/common";

export interface HealthPayload {
  name: string;
  status: "ok";
  time: string;
}

@Injectable()
export class AppService {
  health(): HealthPayload {
    return {
      name: "marinecloudex-backend",
      status: "ok",
      time: new Date().toISOString(),
    };
  }
}
