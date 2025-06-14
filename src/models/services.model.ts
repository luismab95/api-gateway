import { Schema, model, Document } from "mongoose";
import { RouteI } from "../shared";

interface ServiceI extends Document, RouteI {
  name: string;
  description: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

const serviceSchema = new Schema<ServiceI>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    protocol: { type: String, required: true },
    host: { type: String, required: true },
    route: { type: String, required: true },
    port: { type: Number, required: true },
    status: { type: Boolean, required: true, default: true },
  },
  {
    timestamps: true,
  }
);

export const serviceModel = model<ServiceI>("Service", serviceSchema);
