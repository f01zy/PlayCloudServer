import { ValidationError } from "express-validator"

export class ApiError extends Error {
  public status
  public errors
  public errorMessage

  constructor(status: number, message: string, errors: ValidationError[] = []) {
    super(message)
    this.status = status
    this.errors = errors
    this.errorMessage = message
  }

  public static UnauthorizedError() {
    return new ApiError(401, "User is not auth")
  }

  public static NotFound() {
    return new ApiError(404, "Not found")
  }

  public static BadRequest(message: string, errors: ValidationError[] = []) {
    return new ApiError(400, message, errors)
  }
}