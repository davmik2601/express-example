import type {ZodTypeAny} from "zod"

declare global {
  type IsAny<T> = 0 extends (1 & T) ? true : false

  type RequiredKeys<T extends object> = keyof {
    [K in keyof T as {} extends Pick<T, K> ? never : K]: T[K]
  }

  type OptionalKeys<T extends object> = keyof {
    [K in keyof T as {} extends Pick<T, K> ? K : never]: T[K]
  }

  // shallow version (top-level object shape only)
  type ZodSchemaFor<T> =
    IsAny<T> extends true
      ? ZodTypeAny
      : T extends Date
        ? import("zod").ZodDate
        : T extends readonly (infer U)[]
          ? U extends object
            ? import("zod").ZodArray<import("zod").ZodObject<ZodShapeFor<U>>>
            : import("zod").ZodArray<ZodTypeAny>
          : T extends (infer U)[]
            ? U extends object
              ? import("zod").ZodArray<import("zod").ZodObject<ZodShapeFor<U>>>
              : import("zod").ZodArray<ZodTypeAny>
            : T extends object
              ? string extends keyof T
                ? ZodTypeAny
                : number extends keyof T
                  ? ZodTypeAny
                  : symbol extends keyof T
                    ? ZodTypeAny
                    : import("zod").ZodObject<ZodShapeFor<T>>
              : ZodTypeAny

  type OptionalSchemaFor<T> =
    | ZodSchemaFor<T>
    | import("zod").ZodOptional<ZodSchemaFor<T>>
    | import("zod").ZodNullable<ZodSchemaFor<T>>
    | import("zod").ZodOptional<import("zod").ZodNullable<ZodSchemaFor<T>>>
    | import("zod").ZodNullable<import("zod").ZodOptional<ZodSchemaFor<T>>>
    | import("zod").ZodDefault<ZodSchemaFor<T>>
    | import("zod").ZodDefault<import("zod").ZodOptional<ZodSchemaFor<T>>>

  type ZodShapeFor<T extends object> =
    & { [K in RequiredKeys<T>]: ZodSchemaFor<Exclude<T[K], undefined>> }
    & { [K in OptionalKeys<T>]?: OptionalSchemaFor<Exclude<T[K], undefined>> }
}

export {}
