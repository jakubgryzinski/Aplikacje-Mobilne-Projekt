import type { FieldError, FieldErrors, FieldValues, Resolver } from 'react-hook-form';
import type { ZodType } from 'zod';

function setErrorAtPath(
  fieldErrors: Record<string, unknown>,
  path: (string | number)[],
  fieldError: FieldError
) {
  if (path.length === 0) {
    return;
  }

  const [segment, ...remainingPath] = path;
  const pathKey = String(segment);

  if (remainingPath.length === 0) {
    fieldErrors[pathKey] = fieldError;
    return;
  }

  const nestedErrors =
    typeof fieldErrors[pathKey] === 'object' && fieldErrors[pathKey] !== null
      ? (fieldErrors[pathKey] as Record<string, unknown>)
      : {};

  fieldErrors[pathKey] = nestedErrors;
  setErrorAtPath(nestedErrors, remainingPath, fieldError);
}

export function createZodFormResolver<TFieldValues extends FieldValues>(
  schema: ZodType<TFieldValues>
): Resolver<TFieldValues> {
  return async (formValues) => {
    const parseResult = await schema.safeParseAsync(formValues);

    if (parseResult.success) {
      return {
        errors: {},
        values: parseResult.data,
      };
    }

    const fieldErrors: Record<string, unknown> = {};

    for (const issue of parseResult.error.issues) {
      if (issue.path.length === 0) {
        continue;
      }

      const errorPath = issue.path.filter(
        (pathSegment): pathSegment is string | number => typeof pathSegment !== 'symbol'
      );

      setErrorAtPath(fieldErrors, errorPath, {
        message: issue.message,
        type: issue.code,
      });
    }

    return {
      errors: fieldErrors as FieldErrors<TFieldValues>,
      values: {},
    } as const;
  };
}
