import { Schema, model, Document } from "mongoose";
import { MiddlewareI, RouteI } from "../shared";

interface ServiceI extends Document, RouteI {
  status: boolean;
}
interface MiddlewareSchemaI extends Document, MiddlewareI {}

const MiddlewareSchema = new Schema<MiddlewareSchemaI>(
  {
    name: { type: String, required: true },
    props: { type: Schema.Types.Mixed, required: true },
  },
  { _id: false }
);

const serviceSchema = new Schema<ServiceI>({
  protocol: { type: String, required: true },
  host: { type: String, required: true },
  route: { type: String, required: true },
  port: { type: Number, required: true },
  status: { type: Boolean, required: true, default: true },
  middlewares: { type: [MiddlewareSchema], default: [] },
});

export const serviceModel = model<ServiceI>("Service", serviceSchema);
