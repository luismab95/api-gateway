import { ErrorResponse } from "../helpers/response.helper";

export const OK_200 = "Proceso realizado con éxito.";
export const ERR_504 = "Tiempo de espera agotado.";
export const ERR_502 = "Error en la conexión.";
export const ERR_429 = "Demasiadas solicitudes.";
export const ERR_400 = "Solicitud incorrecta.";
export const ERR_401 = "No tiene autorización para ejecutar este proceso.";
export const ERR_404 = "Ruta no encontrada.";
export const ERR_403 = "No tiene permisos para acceder a este recurso.";
export const ERR_500 = "Error interno del servidor.";

export const faliedMiddleware = (message: string, port: number) =>
  new ErrorResponse(`${message}`, port);
