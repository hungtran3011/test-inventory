import type { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import type { AppError } from "./error.middleware.js";

export const validateRequest =
  (schema: z.ZodTypeAny) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Trả về lỗi 400 Bad Request kèm chi tiết từ Zod
        const err = new Error("Validation failed") as AppError;
        err.statusCode = 400;
        err.errors = error.issues.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        }));
        return next(err);
      }
      return next(error);
    }
  };
