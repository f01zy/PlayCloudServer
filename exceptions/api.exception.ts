import { ValidationError } from "express-validator"

export class ApiError extends Error {
  public status
  public errors

  constructor(status: number, message: string, errors: ValidationError[] = []) {
    super(message)
    this.status = status
    this.errors = errors
  }

  public static UnauthorizedError() {
    return new ApiError(401, "Пользователь не авторизован")
  }

  public static BadRequest(message: string, errors: ValidationError[] = []) {
    return new ApiError(400, message, errors)
  }
}