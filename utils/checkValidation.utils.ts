import { Request } from "express";
import { ApiError } from "../exceptions/api.exception";
import { validationResult } from "express-validator";

export const checkValidation = async (req: Request) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    throw ApiError.BadRequest(errors.array()[0].msg, errors.array())
  }
}