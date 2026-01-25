import type {ZodTypeAny} from "zod"

declare global {
  type RequiredKeys<T> = {
    [K in keyof T]-?: undefined extends T[K] ? never : K
  }[keyof T]

  type OptionalKeys<T> = {
    [K in keyof T]-?: undefined extends T[K] ? K : never
  }[keyof T]

  // shallow version (top-level object shape only)
  type ZodSchemaFor<T> =
    T extends readonly (infer U)[]
      ? import("zod").ZodArray<ZodSchemaFor<U>>
      : T extends (infer U)[]
        ? import("zod").ZodArray<ZodSchemaFor<U>>
        : T extends object
          ? import("zod").ZodObject<ZodShapeFor<T>>
          : ZodTypeAny

  type OptionalSchemaFor<T> =
    | ZodSchemaFor<T>
    | import("zod").ZodOptional<ZodSchemaFor<T>>

  type ZodShapeFor<T> =
    & { [K in RequiredKeys<T>]: ZodSchemaFor<Exclude<T[K], undefined>> }
    & { [K in OptionalKeys<T>]?: OptionalSchemaFor<Exclude<T[K], undefined>> }
}

export {}
