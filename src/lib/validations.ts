import * as z from "zod";

export const nameValidation = z
  .string()
  .min(3, "Name must be at least 3 characters")
  .regex(/^[a-zA-Z0-9\s]+$/, "Name must contain only alphanumeric characters");
