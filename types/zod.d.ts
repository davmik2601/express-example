import type {ZodTypeAny} from "zod"

declare global {
  type RequiredKeys<T> = {
    [K in keyof T]-?: undefined extends T[K] ? never : K
  }[keyof T]

  type OptionalKeys<T> = {
    [K in keyof T]-?: undefined extends T[K] ? K : never
  }[keyof T]

  type IsAny<T> = 0 extends (1 & T) ? true : false

  type IsFiniteStringKeyRecord<T> =
    T extends object
      ? keyof T extends string
        ? string extends keyof T
          ? false
          : true
        : false
      : false

  // shallow version (top-level object shape only)
  type ZodSchemaFor<T> =
    IsAny<T> extends true
      ? ZodTypeAny
      : T extends Date
        ? import("zod").ZodDate
        : T extends readonly (infer U)[]
          ? import("zod").ZodArray<ZodSchemaFor<U>>
          : T extends (infer U)[]
            ? import("zod").ZodArray<ZodSchemaFor<U>>
            : T extends object
              ? string extends keyof T
                ? import("zod").ZodRecord<import("zod").ZodString, ZodSchemaFor<T[string]>>
                : number extends keyof T
                  ? import("zod").ZodRecord<import("zod").ZodNumber, ZodSchemaFor<T[number]>>
                  : symbol extends keyof T
                    ? import("zod").ZodRecord<import("zod").ZodSymbol, ZodSchemaFor<T[symbol]>>
                    : IsFiniteStringKeyRecord<T> extends true
                      ? (
                        | import("zod").ZodObject<ZodShapeFor<T>>
                        | import("zod").ZodRecord<
                        import("zod").ZodEnum<Record<keyof T & string, keyof T & string>>,
                        ZodSchemaFor<T[keyof T & string]>
                      >
                        )
                      : import("zod").ZodObject<ZodShapeFor<T>>
              : ZodTypeAny

  type OptionalSchemaFor<T> =
    | ZodSchemaFor<T>
    | import("zod").ZodOptional<ZodSchemaFor<T>>

  type ZodShapeFor<T> =
    & { [K in RequiredKeys<T>]: ZodSchemaFor<Exclude<T[K], undefined>> }
    & { [K in OptionalKeys<T>]?: OptionalSchemaFor<Exclude<T[K], undefined>> }
}

export {}
