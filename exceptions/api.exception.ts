import { ValidationError } from "express-validator"

export class ApiError extends Error {
  public status
  public errors
  public message

  constructor(status: number, message: string, errors: ValidationError[] = []) {
    super(message)
    this.status = status
    this.errors = errors
    this.message = message
  }

  public static UnauthorizedError() {
    return new ApiError(401, "Пользователь не авторизован")
  }

  public static NotFound() {
    return new ApiError(404, "Не найдено")
  }

  public static BadRequest(message: string, errors: ValidationError[] = []) {
    return new ApiError(400, message, errors)
  }
}