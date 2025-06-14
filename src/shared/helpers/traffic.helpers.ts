import { trafficModel } from "../../models/traffic.model";

export const saveTraffic = async (requestCount: number) => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const time = hours + ":" + minutes;

  const trafficData = new trafficModel({
    time,
    requests: requestCount,
  });
  await trafficData.save();
};
