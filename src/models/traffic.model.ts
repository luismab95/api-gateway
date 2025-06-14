import { Schema, model, Document } from "mongoose";

interface TrafficI extends Document {
  time: string;
  requests: number;
}

const trafficSchema = new Schema<TrafficI>(
  {
    time: { type: String, required: true },
    requests: { type: Number, required: true },
  },
  { versionKey: false }
);

export const trafficModel = model<TrafficI>("Traffic", trafficSchema);
