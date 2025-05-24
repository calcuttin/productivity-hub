
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model ResearchPaper
 * 
 */
export type ResearchPaper = $Result.DefaultSelection<Prisma.$ResearchPaperPayload>
/**
 * Model Author
 * 
 */
export type Author = $Result.DefaultSelection<Prisma.$AuthorPayload>
/**
 * Model Citation
 * 
 */
export type Citation = $Result.DefaultSelection<Prisma.$CitationPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more ResearchPapers
 * const researchPapers = await prisma.researchPaper.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more ResearchPapers
   * const researchPapers = await prisma.researchPaper.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.researchPaper`: Exposes CRUD operations for the **ResearchPaper** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ResearchPapers
    * const researchPapers = await prisma.researchPaper.findMany()
    * ```
    */
  get researchPaper(): Prisma.ResearchPaperDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.author`: Exposes CRUD operations for the **Author** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Authors
    * const authors = await prisma.author.findMany()
    * ```
    */
  get author(): Prisma.AuthorDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.citation`: Exposes CRUD operations for the **Citation** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Citations
    * const citations = await prisma.citation.findMany()
    * ```
    */
  get citation(): Prisma.CitationDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.8.2
   * Query Engine version: 2060c79ba17c6bb9f5823312b6f6b7f4a845738e
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    ResearchPaper: 'ResearchPaper',
    Author: 'Author',
    Citation: 'Citation'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "researchPaper" | "author" | "citation"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      ResearchPaper: {
        payload: Prisma.$ResearchPaperPayload<ExtArgs>
        fields: Prisma.ResearchPaperFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ResearchPaperFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResearchPaperPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ResearchPaperFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResearchPaperPayload>
          }
          findFirst: {
            args: Prisma.ResearchPaperFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResearchPaperPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ResearchPaperFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResearchPaperPayload>
          }
          findMany: {
            args: Prisma.ResearchPaperFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResearchPaperPayload>[]
          }
          create: {
            args: Prisma.ResearchPaperCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResearchPaperPayload>
          }
          createMany: {
            args: Prisma.ResearchPaperCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ResearchPaperCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResearchPaperPayload>[]
          }
          delete: {
            args: Prisma.ResearchPaperDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResearchPaperPayload>
          }
          update: {
            args: Prisma.ResearchPaperUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResearchPaperPayload>
          }
          deleteMany: {
            args: Prisma.ResearchPaperDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ResearchPaperUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ResearchPaperUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResearchPaperPayload>[]
          }
          upsert: {
            args: Prisma.ResearchPaperUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResearchPaperPayload>
          }
          aggregate: {
            args: Prisma.ResearchPaperAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateResearchPaper>
          }
          groupBy: {
            args: Prisma.ResearchPaperGroupByArgs<ExtArgs>
            result: $Utils.Optional<ResearchPaperGroupByOutputType>[]
          }
          count: {
            args: Prisma.ResearchPaperCountArgs<ExtArgs>
            result: $Utils.Optional<ResearchPaperCountAggregateOutputType> | number
          }
        }
      }
      Author: {
        payload: Prisma.$AuthorPayload<ExtArgs>
        fields: Prisma.AuthorFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AuthorFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthorPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AuthorFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthorPayload>
          }
          findFirst: {
            args: Prisma.AuthorFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthorPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AuthorFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthorPayload>
          }
          findMany: {
            args: Prisma.AuthorFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthorPayload>[]
          }
          create: {
            args: Prisma.AuthorCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthorPayload>
          }
          createMany: {
            args: Prisma.AuthorCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AuthorCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthorPayload>[]
          }
          delete: {
            args: Prisma.AuthorDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthorPayload>
          }
          update: {
            args: Prisma.AuthorUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthorPayload>
          }
          deleteMany: {
            args: Prisma.AuthorDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AuthorUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AuthorUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthorPayload>[]
          }
          upsert: {
            args: Prisma.AuthorUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthorPayload>
          }
          aggregate: {
            args: Prisma.AuthorAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAuthor>
          }
          groupBy: {
            args: Prisma.AuthorGroupByArgs<ExtArgs>
            result: $Utils.Optional<AuthorGroupByOutputType>[]
          }
          count: {
            args: Prisma.AuthorCountArgs<ExtArgs>
            result: $Utils.Optional<AuthorCountAggregateOutputType> | number
          }
        }
      }
      Citation: {
        payload: Prisma.$CitationPayload<ExtArgs>
        fields: Prisma.CitationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CitationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CitationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CitationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CitationPayload>
          }
          findFirst: {
            args: Prisma.CitationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CitationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CitationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CitationPayload>
          }
          findMany: {
            args: Prisma.CitationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CitationPayload>[]
          }
          create: {
            args: Prisma.CitationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CitationPayload>
          }
          createMany: {
            args: Prisma.CitationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CitationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CitationPayload>[]
          }
          delete: {
            args: Prisma.CitationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CitationPayload>
          }
          update: {
            args: Prisma.CitationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CitationPayload>
          }
          deleteMany: {
            args: Prisma.CitationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CitationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CitationUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CitationPayload>[]
          }
          upsert: {
            args: Prisma.CitationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CitationPayload>
          }
          aggregate: {
            args: Prisma.CitationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCitation>
          }
          groupBy: {
            args: Prisma.CitationGroupByArgs<ExtArgs>
            result: $Utils.Optional<CitationGroupByOutputType>[]
          }
          count: {
            args: Prisma.CitationCountArgs<ExtArgs>
            result: $Utils.Optional<CitationCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    researchPaper?: ResearchPaperOmit
    author?: AuthorOmit
    citation?: CitationOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type ResearchPaperCountOutputType
   */

  export type ResearchPaperCountOutputType = {
    authors: number
    citations: number
  }

  export type ResearchPaperCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    authors?: boolean | ResearchPaperCountOutputTypeCountAuthorsArgs
    citations?: boolean | ResearchPaperCountOutputTypeCountCitationsArgs
  }

  // Custom InputTypes
  /**
   * ResearchPaperCountOutputType without action
   */
  export type ResearchPaperCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ResearchPaperCountOutputType
     */
    select?: ResearchPaperCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ResearchPaperCountOutputType without action
   */
  export type ResearchPaperCountOutputTypeCountAuthorsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AuthorWhereInput
  }

  /**
   * ResearchPaperCountOutputType without action
   */
  export type ResearchPaperCountOutputTypeCountCitationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CitationWhereInput
  }


  /**
   * Count Type AuthorCountOutputType
   */

  export type AuthorCountOutputType = {
    papers: number
  }

  export type AuthorCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    papers?: boolean | AuthorCountOutputTypeCountPapersArgs
  }

  // Custom InputTypes
  /**
   * AuthorCountOutputType without action
   */
  export type AuthorCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthorCountOutputType
     */
    select?: AuthorCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * AuthorCountOutputType without action
   */
  export type AuthorCountOutputTypeCountPapersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ResearchPaperWhereInput
  }


  /**
   * Models
   */

  /**
   * Model ResearchPaper
   */

  export type AggregateResearchPaper = {
    _count: ResearchPaperCountAggregateOutputType | null
    _avg: ResearchPaperAvgAggregateOutputType | null
    _sum: ResearchPaperSumAggregateOutputType | null
    _min: ResearchPaperMinAggregateOutputType | null
    _max: ResearchPaperMaxAggregateOutputType | null
  }

  export type ResearchPaperAvgAggregateOutputType = {
    year: number | null
  }

  export type ResearchPaperSumAggregateOutputType = {
    year: number | null
  }

  export type ResearchPaperMinAggregateOutputType = {
    id: string | null
    title: string | null
    publication: string | null
    year: number | null
    abstract: string | null
    filePath: string | null
    notes: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ResearchPaperMaxAggregateOutputType = {
    id: string | null
    title: string | null
    publication: string | null
    year: number | null
    abstract: string | null
    filePath: string | null
    notes: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ResearchPaperCountAggregateOutputType = {
    id: number
    title: number
    publication: number
    year: number
    abstract: number
    keywords: number
    filePath: number
    notes: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ResearchPaperAvgAggregateInputType = {
    year?: true
  }

  export type ResearchPaperSumAggregateInputType = {
    year?: true
  }

  export type ResearchPaperMinAggregateInputType = {
    id?: true
    title?: true
    publication?: true
    year?: true
    abstract?: true
    filePath?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ResearchPaperMaxAggregateInputType = {
    id?: true
    title?: true
    publication?: true
    year?: true
    abstract?: true
    filePath?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ResearchPaperCountAggregateInputType = {
    id?: true
    title?: true
    publication?: true
    year?: true
    abstract?: true
    keywords?: true
    filePath?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ResearchPaperAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ResearchPaper to aggregate.
     */
    where?: ResearchPaperWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ResearchPapers to fetch.
     */
    orderBy?: ResearchPaperOrderByWithRelationInput | ResearchPaperOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ResearchPaperWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ResearchPapers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ResearchPapers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ResearchPapers
    **/
    _count?: true | ResearchPaperCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ResearchPaperAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ResearchPaperSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ResearchPaperMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ResearchPaperMaxAggregateInputType
  }

  export type GetResearchPaperAggregateType<T extends ResearchPaperAggregateArgs> = {
        [P in keyof T & keyof AggregateResearchPaper]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateResearchPaper[P]>
      : GetScalarType<T[P], AggregateResearchPaper[P]>
  }




  export type ResearchPaperGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ResearchPaperWhereInput
    orderBy?: ResearchPaperOrderByWithAggregationInput | ResearchPaperOrderByWithAggregationInput[]
    by: ResearchPaperScalarFieldEnum[] | ResearchPaperScalarFieldEnum
    having?: ResearchPaperScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ResearchPaperCountAggregateInputType | true
    _avg?: ResearchPaperAvgAggregateInputType
    _sum?: ResearchPaperSumAggregateInputType
    _min?: ResearchPaperMinAggregateInputType
    _max?: ResearchPaperMaxAggregateInputType
  }

  export type ResearchPaperGroupByOutputType = {
    id: string
    title: string
    publication: string | null
    year: number | null
    abstract: string | null
    keywords: string[]
    filePath: string | null
    notes: string | null
    createdAt: Date
    updatedAt: Date
    _count: ResearchPaperCountAggregateOutputType | null
    _avg: ResearchPaperAvgAggregateOutputType | null
    _sum: ResearchPaperSumAggregateOutputType | null
    _min: ResearchPaperMinAggregateOutputType | null
    _max: ResearchPaperMaxAggregateOutputType | null
  }

  type GetResearchPaperGroupByPayload<T extends ResearchPaperGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ResearchPaperGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ResearchPaperGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ResearchPaperGroupByOutputType[P]>
            : GetScalarType<T[P], ResearchPaperGroupByOutputType[P]>
        }
      >
    >


  export type ResearchPaperSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    publication?: boolean
    year?: boolean
    abstract?: boolean
    keywords?: boolean
    filePath?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    authors?: boolean | ResearchPaper$authorsArgs<ExtArgs>
    citations?: boolean | ResearchPaper$citationsArgs<ExtArgs>
    _count?: boolean | ResearchPaperCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["researchPaper"]>

  export type ResearchPaperSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    publication?: boolean
    year?: boolean
    abstract?: boolean
    keywords?: boolean
    filePath?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["researchPaper"]>

  export type ResearchPaperSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    publication?: boolean
    year?: boolean
    abstract?: boolean
    keywords?: boolean
    filePath?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["researchPaper"]>

  export type ResearchPaperSelectScalar = {
    id?: boolean
    title?: boolean
    publication?: boolean
    year?: boolean
    abstract?: boolean
    keywords?: boolean
    filePath?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ResearchPaperOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "title" | "publication" | "year" | "abstract" | "keywords" | "filePath" | "notes" | "createdAt" | "updatedAt", ExtArgs["result"]["researchPaper"]>
  export type ResearchPaperInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    authors?: boolean | ResearchPaper$authorsArgs<ExtArgs>
    citations?: boolean | ResearchPaper$citationsArgs<ExtArgs>
    _count?: boolean | ResearchPaperCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ResearchPaperIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type ResearchPaperIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $ResearchPaperPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ResearchPaper"
    objects: {
      authors: Prisma.$AuthorPayload<ExtArgs>[]
      citations: Prisma.$CitationPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      title: string
      publication: string | null
      year: number | null
      abstract: string | null
      keywords: string[]
      filePath: string | null
      notes: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["researchPaper"]>
    composites: {}
  }

  type ResearchPaperGetPayload<S extends boolean | null | undefined | ResearchPaperDefaultArgs> = $Result.GetResult<Prisma.$ResearchPaperPayload, S>

  type ResearchPaperCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ResearchPaperFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ResearchPaperCountAggregateInputType | true
    }

  export interface ResearchPaperDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ResearchPaper'], meta: { name: 'ResearchPaper' } }
    /**
     * Find zero or one ResearchPaper that matches the filter.
     * @param {ResearchPaperFindUniqueArgs} args - Arguments to find a ResearchPaper
     * @example
     * // Get one ResearchPaper
     * const researchPaper = await prisma.researchPaper.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ResearchPaperFindUniqueArgs>(args: SelectSubset<T, ResearchPaperFindUniqueArgs<ExtArgs>>): Prisma__ResearchPaperClient<$Result.GetResult<Prisma.$ResearchPaperPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ResearchPaper that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ResearchPaperFindUniqueOrThrowArgs} args - Arguments to find a ResearchPaper
     * @example
     * // Get one ResearchPaper
     * const researchPaper = await prisma.researchPaper.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ResearchPaperFindUniqueOrThrowArgs>(args: SelectSubset<T, ResearchPaperFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ResearchPaperClient<$Result.GetResult<Prisma.$ResearchPaperPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ResearchPaper that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ResearchPaperFindFirstArgs} args - Arguments to find a ResearchPaper
     * @example
     * // Get one ResearchPaper
     * const researchPaper = await prisma.researchPaper.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ResearchPaperFindFirstArgs>(args?: SelectSubset<T, ResearchPaperFindFirstArgs<ExtArgs>>): Prisma__ResearchPaperClient<$Result.GetResult<Prisma.$ResearchPaperPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ResearchPaper that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ResearchPaperFindFirstOrThrowArgs} args - Arguments to find a ResearchPaper
     * @example
     * // Get one ResearchPaper
     * const researchPaper = await prisma.researchPaper.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ResearchPaperFindFirstOrThrowArgs>(args?: SelectSubset<T, ResearchPaperFindFirstOrThrowArgs<ExtArgs>>): Prisma__ResearchPaperClient<$Result.GetResult<Prisma.$ResearchPaperPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ResearchPapers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ResearchPaperFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ResearchPapers
     * const researchPapers = await prisma.researchPaper.findMany()
     * 
     * // Get first 10 ResearchPapers
     * const researchPapers = await prisma.researchPaper.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const researchPaperWithIdOnly = await prisma.researchPaper.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ResearchPaperFindManyArgs>(args?: SelectSubset<T, ResearchPaperFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ResearchPaperPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ResearchPaper.
     * @param {ResearchPaperCreateArgs} args - Arguments to create a ResearchPaper.
     * @example
     * // Create one ResearchPaper
     * const ResearchPaper = await prisma.researchPaper.create({
     *   data: {
     *     // ... data to create a ResearchPaper
     *   }
     * })
     * 
     */
    create<T extends ResearchPaperCreateArgs>(args: SelectSubset<T, ResearchPaperCreateArgs<ExtArgs>>): Prisma__ResearchPaperClient<$Result.GetResult<Prisma.$ResearchPaperPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ResearchPapers.
     * @param {ResearchPaperCreateManyArgs} args - Arguments to create many ResearchPapers.
     * @example
     * // Create many ResearchPapers
     * const researchPaper = await prisma.researchPaper.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ResearchPaperCreateManyArgs>(args?: SelectSubset<T, ResearchPaperCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ResearchPapers and returns the data saved in the database.
     * @param {ResearchPaperCreateManyAndReturnArgs} args - Arguments to create many ResearchPapers.
     * @example
     * // Create many ResearchPapers
     * const researchPaper = await prisma.researchPaper.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ResearchPapers and only return the `id`
     * const researchPaperWithIdOnly = await prisma.researchPaper.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ResearchPaperCreateManyAndReturnArgs>(args?: SelectSubset<T, ResearchPaperCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ResearchPaperPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ResearchPaper.
     * @param {ResearchPaperDeleteArgs} args - Arguments to delete one ResearchPaper.
     * @example
     * // Delete one ResearchPaper
     * const ResearchPaper = await prisma.researchPaper.delete({
     *   where: {
     *     // ... filter to delete one ResearchPaper
     *   }
     * })
     * 
     */
    delete<T extends ResearchPaperDeleteArgs>(args: SelectSubset<T, ResearchPaperDeleteArgs<ExtArgs>>): Prisma__ResearchPaperClient<$Result.GetResult<Prisma.$ResearchPaperPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ResearchPaper.
     * @param {ResearchPaperUpdateArgs} args - Arguments to update one ResearchPaper.
     * @example
     * // Update one ResearchPaper
     * const researchPaper = await prisma.researchPaper.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ResearchPaperUpdateArgs>(args: SelectSubset<T, ResearchPaperUpdateArgs<ExtArgs>>): Prisma__ResearchPaperClient<$Result.GetResult<Prisma.$ResearchPaperPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ResearchPapers.
     * @param {ResearchPaperDeleteManyArgs} args - Arguments to filter ResearchPapers to delete.
     * @example
     * // Delete a few ResearchPapers
     * const { count } = await prisma.researchPaper.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ResearchPaperDeleteManyArgs>(args?: SelectSubset<T, ResearchPaperDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ResearchPapers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ResearchPaperUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ResearchPapers
     * const researchPaper = await prisma.researchPaper.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ResearchPaperUpdateManyArgs>(args: SelectSubset<T, ResearchPaperUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ResearchPapers and returns the data updated in the database.
     * @param {ResearchPaperUpdateManyAndReturnArgs} args - Arguments to update many ResearchPapers.
     * @example
     * // Update many ResearchPapers
     * const researchPaper = await prisma.researchPaper.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ResearchPapers and only return the `id`
     * const researchPaperWithIdOnly = await prisma.researchPaper.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ResearchPaperUpdateManyAndReturnArgs>(args: SelectSubset<T, ResearchPaperUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ResearchPaperPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ResearchPaper.
     * @param {ResearchPaperUpsertArgs} args - Arguments to update or create a ResearchPaper.
     * @example
     * // Update or create a ResearchPaper
     * const researchPaper = await prisma.researchPaper.upsert({
     *   create: {
     *     // ... data to create a ResearchPaper
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ResearchPaper we want to update
     *   }
     * })
     */
    upsert<T extends ResearchPaperUpsertArgs>(args: SelectSubset<T, ResearchPaperUpsertArgs<ExtArgs>>): Prisma__ResearchPaperClient<$Result.GetResult<Prisma.$ResearchPaperPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ResearchPapers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ResearchPaperCountArgs} args - Arguments to filter ResearchPapers to count.
     * @example
     * // Count the number of ResearchPapers
     * const count = await prisma.researchPaper.count({
     *   where: {
     *     // ... the filter for the ResearchPapers we want to count
     *   }
     * })
    **/
    count<T extends ResearchPaperCountArgs>(
      args?: Subset<T, ResearchPaperCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ResearchPaperCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ResearchPaper.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ResearchPaperAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ResearchPaperAggregateArgs>(args: Subset<T, ResearchPaperAggregateArgs>): Prisma.PrismaPromise<GetResearchPaperAggregateType<T>>

    /**
     * Group by ResearchPaper.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ResearchPaperGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ResearchPaperGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ResearchPaperGroupByArgs['orderBy'] }
        : { orderBy?: ResearchPaperGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ResearchPaperGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetResearchPaperGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ResearchPaper model
   */
  readonly fields: ResearchPaperFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ResearchPaper.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ResearchPaperClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    authors<T extends ResearchPaper$authorsArgs<ExtArgs> = {}>(args?: Subset<T, ResearchPaper$authorsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuthorPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    citations<T extends ResearchPaper$citationsArgs<ExtArgs> = {}>(args?: Subset<T, ResearchPaper$citationsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CitationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ResearchPaper model
   */
  interface ResearchPaperFieldRefs {
    readonly id: FieldRef<"ResearchPaper", 'String'>
    readonly title: FieldRef<"ResearchPaper", 'String'>
    readonly publication: FieldRef<"ResearchPaper", 'String'>
    readonly year: FieldRef<"ResearchPaper", 'Int'>
    readonly abstract: FieldRef<"ResearchPaper", 'String'>
    readonly keywords: FieldRef<"ResearchPaper", 'String[]'>
    readonly filePath: FieldRef<"ResearchPaper", 'String'>
    readonly notes: FieldRef<"ResearchPaper", 'String'>
    readonly createdAt: FieldRef<"ResearchPaper", 'DateTime'>
    readonly updatedAt: FieldRef<"ResearchPaper", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ResearchPaper findUnique
   */
  export type ResearchPaperFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ResearchPaper
     */
    select?: ResearchPaperSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ResearchPaper
     */
    omit?: ResearchPaperOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResearchPaperInclude<ExtArgs> | null
    /**
     * Filter, which ResearchPaper to fetch.
     */
    where: ResearchPaperWhereUniqueInput
  }

  /**
   * ResearchPaper findUniqueOrThrow
   */
  export type ResearchPaperFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ResearchPaper
     */
    select?: ResearchPaperSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ResearchPaper
     */
    omit?: ResearchPaperOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResearchPaperInclude<ExtArgs> | null
    /**
     * Filter, which ResearchPaper to fetch.
     */
    where: ResearchPaperWhereUniqueInput
  }

  /**
   * ResearchPaper findFirst
   */
  export type ResearchPaperFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ResearchPaper
     */
    select?: ResearchPaperSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ResearchPaper
     */
    omit?: ResearchPaperOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResearchPaperInclude<ExtArgs> | null
    /**
     * Filter, which ResearchPaper to fetch.
     */
    where?: ResearchPaperWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ResearchPapers to fetch.
     */
    orderBy?: ResearchPaperOrderByWithRelationInput | ResearchPaperOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ResearchPapers.
     */
    cursor?: ResearchPaperWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ResearchPapers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ResearchPapers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ResearchPapers.
     */
    distinct?: ResearchPaperScalarFieldEnum | ResearchPaperScalarFieldEnum[]
  }

  /**
   * ResearchPaper findFirstOrThrow
   */
  export type ResearchPaperFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ResearchPaper
     */
    select?: ResearchPaperSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ResearchPaper
     */
    omit?: ResearchPaperOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResearchPaperInclude<ExtArgs> | null
    /**
     * Filter, which ResearchPaper to fetch.
     */
    where?: ResearchPaperWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ResearchPapers to fetch.
     */
    orderBy?: ResearchPaperOrderByWithRelationInput | ResearchPaperOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ResearchPapers.
     */
    cursor?: ResearchPaperWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ResearchPapers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ResearchPapers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ResearchPapers.
     */
    distinct?: ResearchPaperScalarFieldEnum | ResearchPaperScalarFieldEnum[]
  }

  /**
   * ResearchPaper findMany
   */
  export type ResearchPaperFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ResearchPaper
     */
    select?: ResearchPaperSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ResearchPaper
     */
    omit?: ResearchPaperOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResearchPaperInclude<ExtArgs> | null
    /**
     * Filter, which ResearchPapers to fetch.
     */
    where?: ResearchPaperWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ResearchPapers to fetch.
     */
    orderBy?: ResearchPaperOrderByWithRelationInput | ResearchPaperOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ResearchPapers.
     */
    cursor?: ResearchPaperWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ResearchPapers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ResearchPapers.
     */
    skip?: number
    distinct?: ResearchPaperScalarFieldEnum | ResearchPaperScalarFieldEnum[]
  }

  /**
   * ResearchPaper create
   */
  export type ResearchPaperCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ResearchPaper
     */
    select?: ResearchPaperSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ResearchPaper
     */
    omit?: ResearchPaperOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResearchPaperInclude<ExtArgs> | null
    /**
     * The data needed to create a ResearchPaper.
     */
    data: XOR<ResearchPaperCreateInput, ResearchPaperUncheckedCreateInput>
  }

  /**
   * ResearchPaper createMany
   */
  export type ResearchPaperCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ResearchPapers.
     */
    data: ResearchPaperCreateManyInput | ResearchPaperCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ResearchPaper createManyAndReturn
   */
  export type ResearchPaperCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ResearchPaper
     */
    select?: ResearchPaperSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ResearchPaper
     */
    omit?: ResearchPaperOmit<ExtArgs> | null
    /**
     * The data used to create many ResearchPapers.
     */
    data: ResearchPaperCreateManyInput | ResearchPaperCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ResearchPaper update
   */
  export type ResearchPaperUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ResearchPaper
     */
    select?: ResearchPaperSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ResearchPaper
     */
    omit?: ResearchPaperOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResearchPaperInclude<ExtArgs> | null
    /**
     * The data needed to update a ResearchPaper.
     */
    data: XOR<ResearchPaperUpdateInput, ResearchPaperUncheckedUpdateInput>
    /**
     * Choose, which ResearchPaper to update.
     */
    where: ResearchPaperWhereUniqueInput
  }

  /**
   * ResearchPaper updateMany
   */
  export type ResearchPaperUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ResearchPapers.
     */
    data: XOR<ResearchPaperUpdateManyMutationInput, ResearchPaperUncheckedUpdateManyInput>
    /**
     * Filter which ResearchPapers to update
     */
    where?: ResearchPaperWhereInput
    /**
     * Limit how many ResearchPapers to update.
     */
    limit?: number
  }

  /**
   * ResearchPaper updateManyAndReturn
   */
  export type ResearchPaperUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ResearchPaper
     */
    select?: ResearchPaperSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ResearchPaper
     */
    omit?: ResearchPaperOmit<ExtArgs> | null
    /**
     * The data used to update ResearchPapers.
     */
    data: XOR<ResearchPaperUpdateManyMutationInput, ResearchPaperUncheckedUpdateManyInput>
    /**
     * Filter which ResearchPapers to update
     */
    where?: ResearchPaperWhereInput
    /**
     * Limit how many ResearchPapers to update.
     */
    limit?: number
  }

  /**
   * ResearchPaper upsert
   */
  export type ResearchPaperUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ResearchPaper
     */
    select?: ResearchPaperSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ResearchPaper
     */
    omit?: ResearchPaperOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResearchPaperInclude<ExtArgs> | null
    /**
     * The filter to search for the ResearchPaper to update in case it exists.
     */
    where: ResearchPaperWhereUniqueInput
    /**
     * In case the ResearchPaper found by the `where` argument doesn't exist, create a new ResearchPaper with this data.
     */
    create: XOR<ResearchPaperCreateInput, ResearchPaperUncheckedCreateInput>
    /**
     * In case the ResearchPaper was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ResearchPaperUpdateInput, ResearchPaperUncheckedUpdateInput>
  }

  /**
   * ResearchPaper delete
   */
  export type ResearchPaperDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ResearchPaper
     */
    select?: ResearchPaperSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ResearchPaper
     */
    omit?: ResearchPaperOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResearchPaperInclude<ExtArgs> | null
    /**
     * Filter which ResearchPaper to delete.
     */
    where: ResearchPaperWhereUniqueInput
  }

  /**
   * ResearchPaper deleteMany
   */
  export type ResearchPaperDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ResearchPapers to delete
     */
    where?: ResearchPaperWhereInput
    /**
     * Limit how many ResearchPapers to delete.
     */
    limit?: number
  }

  /**
   * ResearchPaper.authors
   */
  export type ResearchPaper$authorsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Author
     */
    select?: AuthorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Author
     */
    omit?: AuthorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthorInclude<ExtArgs> | null
    where?: AuthorWhereInput
    orderBy?: AuthorOrderByWithRelationInput | AuthorOrderByWithRelationInput[]
    cursor?: AuthorWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AuthorScalarFieldEnum | AuthorScalarFieldEnum[]
  }

  /**
   * ResearchPaper.citations
   */
  export type ResearchPaper$citationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Citation
     */
    select?: CitationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Citation
     */
    omit?: CitationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CitationInclude<ExtArgs> | null
    where?: CitationWhereInput
    orderBy?: CitationOrderByWithRelationInput | CitationOrderByWithRelationInput[]
    cursor?: CitationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CitationScalarFieldEnum | CitationScalarFieldEnum[]
  }

  /**
   * ResearchPaper without action
   */
  export type ResearchPaperDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ResearchPaper
     */
    select?: ResearchPaperSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ResearchPaper
     */
    omit?: ResearchPaperOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResearchPaperInclude<ExtArgs> | null
  }


  /**
   * Model Author
   */

  export type AggregateAuthor = {
    _count: AuthorCountAggregateOutputType | null
    _min: AuthorMinAggregateOutputType | null
    _max: AuthorMaxAggregateOutputType | null
  }

  export type AuthorMinAggregateOutputType = {
    id: string | null
    firstName: string | null
    lastName: string | null
    middleName: string | null
    orcid: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AuthorMaxAggregateOutputType = {
    id: string | null
    firstName: string | null
    lastName: string | null
    middleName: string | null
    orcid: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AuthorCountAggregateOutputType = {
    id: number
    firstName: number
    lastName: number
    middleName: number
    orcid: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type AuthorMinAggregateInputType = {
    id?: true
    firstName?: true
    lastName?: true
    middleName?: true
    orcid?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AuthorMaxAggregateInputType = {
    id?: true
    firstName?: true
    lastName?: true
    middleName?: true
    orcid?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AuthorCountAggregateInputType = {
    id?: true
    firstName?: true
    lastName?: true
    middleName?: true
    orcid?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type AuthorAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Author to aggregate.
     */
    where?: AuthorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Authors to fetch.
     */
    orderBy?: AuthorOrderByWithRelationInput | AuthorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AuthorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Authors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Authors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Authors
    **/
    _count?: true | AuthorCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AuthorMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AuthorMaxAggregateInputType
  }

  export type GetAuthorAggregateType<T extends AuthorAggregateArgs> = {
        [P in keyof T & keyof AggregateAuthor]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAuthor[P]>
      : GetScalarType<T[P], AggregateAuthor[P]>
  }




  export type AuthorGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AuthorWhereInput
    orderBy?: AuthorOrderByWithAggregationInput | AuthorOrderByWithAggregationInput[]
    by: AuthorScalarFieldEnum[] | AuthorScalarFieldEnum
    having?: AuthorScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AuthorCountAggregateInputType | true
    _min?: AuthorMinAggregateInputType
    _max?: AuthorMaxAggregateInputType
  }

  export type AuthorGroupByOutputType = {
    id: string
    firstName: string
    lastName: string
    middleName: string | null
    orcid: string | null
    createdAt: Date
    updatedAt: Date
    _count: AuthorCountAggregateOutputType | null
    _min: AuthorMinAggregateOutputType | null
    _max: AuthorMaxAggregateOutputType | null
  }

  type GetAuthorGroupByPayload<T extends AuthorGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AuthorGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AuthorGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AuthorGroupByOutputType[P]>
            : GetScalarType<T[P], AuthorGroupByOutputType[P]>
        }
      >
    >


  export type AuthorSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    firstName?: boolean
    lastName?: boolean
    middleName?: boolean
    orcid?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    papers?: boolean | Author$papersArgs<ExtArgs>
    _count?: boolean | AuthorCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["author"]>

  export type AuthorSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    firstName?: boolean
    lastName?: boolean
    middleName?: boolean
    orcid?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["author"]>

  export type AuthorSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    firstName?: boolean
    lastName?: boolean
    middleName?: boolean
    orcid?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["author"]>

  export type AuthorSelectScalar = {
    id?: boolean
    firstName?: boolean
    lastName?: boolean
    middleName?: boolean
    orcid?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type AuthorOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "firstName" | "lastName" | "middleName" | "orcid" | "createdAt" | "updatedAt", ExtArgs["result"]["author"]>
  export type AuthorInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    papers?: boolean | Author$papersArgs<ExtArgs>
    _count?: boolean | AuthorCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type AuthorIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type AuthorIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $AuthorPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Author"
    objects: {
      papers: Prisma.$ResearchPaperPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      firstName: string
      lastName: string
      middleName: string | null
      orcid: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["author"]>
    composites: {}
  }

  type AuthorGetPayload<S extends boolean | null | undefined | AuthorDefaultArgs> = $Result.GetResult<Prisma.$AuthorPayload, S>

  type AuthorCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AuthorFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AuthorCountAggregateInputType | true
    }

  export interface AuthorDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Author'], meta: { name: 'Author' } }
    /**
     * Find zero or one Author that matches the filter.
     * @param {AuthorFindUniqueArgs} args - Arguments to find a Author
     * @example
     * // Get one Author
     * const author = await prisma.author.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AuthorFindUniqueArgs>(args: SelectSubset<T, AuthorFindUniqueArgs<ExtArgs>>): Prisma__AuthorClient<$Result.GetResult<Prisma.$AuthorPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Author that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AuthorFindUniqueOrThrowArgs} args - Arguments to find a Author
     * @example
     * // Get one Author
     * const author = await prisma.author.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AuthorFindUniqueOrThrowArgs>(args: SelectSubset<T, AuthorFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AuthorClient<$Result.GetResult<Prisma.$AuthorPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Author that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthorFindFirstArgs} args - Arguments to find a Author
     * @example
     * // Get one Author
     * const author = await prisma.author.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AuthorFindFirstArgs>(args?: SelectSubset<T, AuthorFindFirstArgs<ExtArgs>>): Prisma__AuthorClient<$Result.GetResult<Prisma.$AuthorPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Author that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthorFindFirstOrThrowArgs} args - Arguments to find a Author
     * @example
     * // Get one Author
     * const author = await prisma.author.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AuthorFindFirstOrThrowArgs>(args?: SelectSubset<T, AuthorFindFirstOrThrowArgs<ExtArgs>>): Prisma__AuthorClient<$Result.GetResult<Prisma.$AuthorPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Authors that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthorFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Authors
     * const authors = await prisma.author.findMany()
     * 
     * // Get first 10 Authors
     * const authors = await prisma.author.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const authorWithIdOnly = await prisma.author.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AuthorFindManyArgs>(args?: SelectSubset<T, AuthorFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuthorPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Author.
     * @param {AuthorCreateArgs} args - Arguments to create a Author.
     * @example
     * // Create one Author
     * const Author = await prisma.author.create({
     *   data: {
     *     // ... data to create a Author
     *   }
     * })
     * 
     */
    create<T extends AuthorCreateArgs>(args: SelectSubset<T, AuthorCreateArgs<ExtArgs>>): Prisma__AuthorClient<$Result.GetResult<Prisma.$AuthorPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Authors.
     * @param {AuthorCreateManyArgs} args - Arguments to create many Authors.
     * @example
     * // Create many Authors
     * const author = await prisma.author.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AuthorCreateManyArgs>(args?: SelectSubset<T, AuthorCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Authors and returns the data saved in the database.
     * @param {AuthorCreateManyAndReturnArgs} args - Arguments to create many Authors.
     * @example
     * // Create many Authors
     * const author = await prisma.author.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Authors and only return the `id`
     * const authorWithIdOnly = await prisma.author.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AuthorCreateManyAndReturnArgs>(args?: SelectSubset<T, AuthorCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuthorPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Author.
     * @param {AuthorDeleteArgs} args - Arguments to delete one Author.
     * @example
     * // Delete one Author
     * const Author = await prisma.author.delete({
     *   where: {
     *     // ... filter to delete one Author
     *   }
     * })
     * 
     */
    delete<T extends AuthorDeleteArgs>(args: SelectSubset<T, AuthorDeleteArgs<ExtArgs>>): Prisma__AuthorClient<$Result.GetResult<Prisma.$AuthorPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Author.
     * @param {AuthorUpdateArgs} args - Arguments to update one Author.
     * @example
     * // Update one Author
     * const author = await prisma.author.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AuthorUpdateArgs>(args: SelectSubset<T, AuthorUpdateArgs<ExtArgs>>): Prisma__AuthorClient<$Result.GetResult<Prisma.$AuthorPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Authors.
     * @param {AuthorDeleteManyArgs} args - Arguments to filter Authors to delete.
     * @example
     * // Delete a few Authors
     * const { count } = await prisma.author.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AuthorDeleteManyArgs>(args?: SelectSubset<T, AuthorDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Authors.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthorUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Authors
     * const author = await prisma.author.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AuthorUpdateManyArgs>(args: SelectSubset<T, AuthorUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Authors and returns the data updated in the database.
     * @param {AuthorUpdateManyAndReturnArgs} args - Arguments to update many Authors.
     * @example
     * // Update many Authors
     * const author = await prisma.author.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Authors and only return the `id`
     * const authorWithIdOnly = await prisma.author.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AuthorUpdateManyAndReturnArgs>(args: SelectSubset<T, AuthorUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuthorPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Author.
     * @param {AuthorUpsertArgs} args - Arguments to update or create a Author.
     * @example
     * // Update or create a Author
     * const author = await prisma.author.upsert({
     *   create: {
     *     // ... data to create a Author
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Author we want to update
     *   }
     * })
     */
    upsert<T extends AuthorUpsertArgs>(args: SelectSubset<T, AuthorUpsertArgs<ExtArgs>>): Prisma__AuthorClient<$Result.GetResult<Prisma.$AuthorPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Authors.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthorCountArgs} args - Arguments to filter Authors to count.
     * @example
     * // Count the number of Authors
     * const count = await prisma.author.count({
     *   where: {
     *     // ... the filter for the Authors we want to count
     *   }
     * })
    **/
    count<T extends AuthorCountArgs>(
      args?: Subset<T, AuthorCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AuthorCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Author.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthorAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AuthorAggregateArgs>(args: Subset<T, AuthorAggregateArgs>): Prisma.PrismaPromise<GetAuthorAggregateType<T>>

    /**
     * Group by Author.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthorGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AuthorGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AuthorGroupByArgs['orderBy'] }
        : { orderBy?: AuthorGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AuthorGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAuthorGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Author model
   */
  readonly fields: AuthorFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Author.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AuthorClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    papers<T extends Author$papersArgs<ExtArgs> = {}>(args?: Subset<T, Author$papersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ResearchPaperPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Author model
   */
  interface AuthorFieldRefs {
    readonly id: FieldRef<"Author", 'String'>
    readonly firstName: FieldRef<"Author", 'String'>
    readonly lastName: FieldRef<"Author", 'String'>
    readonly middleName: FieldRef<"Author", 'String'>
    readonly orcid: FieldRef<"Author", 'String'>
    readonly createdAt: FieldRef<"Author", 'DateTime'>
    readonly updatedAt: FieldRef<"Author", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Author findUnique
   */
  export type AuthorFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Author
     */
    select?: AuthorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Author
     */
    omit?: AuthorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthorInclude<ExtArgs> | null
    /**
     * Filter, which Author to fetch.
     */
    where: AuthorWhereUniqueInput
  }

  /**
   * Author findUniqueOrThrow
   */
  export type AuthorFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Author
     */
    select?: AuthorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Author
     */
    omit?: AuthorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthorInclude<ExtArgs> | null
    /**
     * Filter, which Author to fetch.
     */
    where: AuthorWhereUniqueInput
  }

  /**
   * Author findFirst
   */
  export type AuthorFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Author
     */
    select?: AuthorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Author
     */
    omit?: AuthorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthorInclude<ExtArgs> | null
    /**
     * Filter, which Author to fetch.
     */
    where?: AuthorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Authors to fetch.
     */
    orderBy?: AuthorOrderByWithRelationInput | AuthorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Authors.
     */
    cursor?: AuthorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Authors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Authors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Authors.
     */
    distinct?: AuthorScalarFieldEnum | AuthorScalarFieldEnum[]
  }

  /**
   * Author findFirstOrThrow
   */
  export type AuthorFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Author
     */
    select?: AuthorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Author
     */
    omit?: AuthorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthorInclude<ExtArgs> | null
    /**
     * Filter, which Author to fetch.
     */
    where?: AuthorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Authors to fetch.
     */
    orderBy?: AuthorOrderByWithRelationInput | AuthorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Authors.
     */
    cursor?: AuthorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Authors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Authors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Authors.
     */
    distinct?: AuthorScalarFieldEnum | AuthorScalarFieldEnum[]
  }

  /**
   * Author findMany
   */
  export type AuthorFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Author
     */
    select?: AuthorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Author
     */
    omit?: AuthorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthorInclude<ExtArgs> | null
    /**
     * Filter, which Authors to fetch.
     */
    where?: AuthorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Authors to fetch.
     */
    orderBy?: AuthorOrderByWithRelationInput | AuthorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Authors.
     */
    cursor?: AuthorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Authors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Authors.
     */
    skip?: number
    distinct?: AuthorScalarFieldEnum | AuthorScalarFieldEnum[]
  }

  /**
   * Author create
   */
  export type AuthorCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Author
     */
    select?: AuthorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Author
     */
    omit?: AuthorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthorInclude<ExtArgs> | null
    /**
     * The data needed to create a Author.
     */
    data: XOR<AuthorCreateInput, AuthorUncheckedCreateInput>
  }

  /**
   * Author createMany
   */
  export type AuthorCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Authors.
     */
    data: AuthorCreateManyInput | AuthorCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Author createManyAndReturn
   */
  export type AuthorCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Author
     */
    select?: AuthorSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Author
     */
    omit?: AuthorOmit<ExtArgs> | null
    /**
     * The data used to create many Authors.
     */
    data: AuthorCreateManyInput | AuthorCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Author update
   */
  export type AuthorUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Author
     */
    select?: AuthorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Author
     */
    omit?: AuthorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthorInclude<ExtArgs> | null
    /**
     * The data needed to update a Author.
     */
    data: XOR<AuthorUpdateInput, AuthorUncheckedUpdateInput>
    /**
     * Choose, which Author to update.
     */
    where: AuthorWhereUniqueInput
  }

  /**
   * Author updateMany
   */
  export type AuthorUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Authors.
     */
    data: XOR<AuthorUpdateManyMutationInput, AuthorUncheckedUpdateManyInput>
    /**
     * Filter which Authors to update
     */
    where?: AuthorWhereInput
    /**
     * Limit how many Authors to update.
     */
    limit?: number
  }

  /**
   * Author updateManyAndReturn
   */
  export type AuthorUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Author
     */
    select?: AuthorSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Author
     */
    omit?: AuthorOmit<ExtArgs> | null
    /**
     * The data used to update Authors.
     */
    data: XOR<AuthorUpdateManyMutationInput, AuthorUncheckedUpdateManyInput>
    /**
     * Filter which Authors to update
     */
    where?: AuthorWhereInput
    /**
     * Limit how many Authors to update.
     */
    limit?: number
  }

  /**
   * Author upsert
   */
  export type AuthorUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Author
     */
    select?: AuthorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Author
     */
    omit?: AuthorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthorInclude<ExtArgs> | null
    /**
     * The filter to search for the Author to update in case it exists.
     */
    where: AuthorWhereUniqueInput
    /**
     * In case the Author found by the `where` argument doesn't exist, create a new Author with this data.
     */
    create: XOR<AuthorCreateInput, AuthorUncheckedCreateInput>
    /**
     * In case the Author was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AuthorUpdateInput, AuthorUncheckedUpdateInput>
  }

  /**
   * Author delete
   */
  export type AuthorDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Author
     */
    select?: AuthorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Author
     */
    omit?: AuthorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthorInclude<ExtArgs> | null
    /**
     * Filter which Author to delete.
     */
    where: AuthorWhereUniqueInput
  }

  /**
   * Author deleteMany
   */
  export type AuthorDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Authors to delete
     */
    where?: AuthorWhereInput
    /**
     * Limit how many Authors to delete.
     */
    limit?: number
  }

  /**
   * Author.papers
   */
  export type Author$papersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ResearchPaper
     */
    select?: ResearchPaperSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ResearchPaper
     */
    omit?: ResearchPaperOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResearchPaperInclude<ExtArgs> | null
    where?: ResearchPaperWhereInput
    orderBy?: ResearchPaperOrderByWithRelationInput | ResearchPaperOrderByWithRelationInput[]
    cursor?: ResearchPaperWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ResearchPaperScalarFieldEnum | ResearchPaperScalarFieldEnum[]
  }

  /**
   * Author without action
   */
  export type AuthorDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Author
     */
    select?: AuthorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Author
     */
    omit?: AuthorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthorInclude<ExtArgs> | null
  }


  /**
   * Model Citation
   */

  export type AggregateCitation = {
    _count: CitationCountAggregateOutputType | null
    _min: CitationMinAggregateOutputType | null
    _max: CitationMaxAggregateOutputType | null
  }

  export type CitationMinAggregateOutputType = {
    id: string | null
    key: string | null
    type: string | null
    createdAt: Date | null
    updatedAt: Date | null
    researchPaperId: string | null
  }

  export type CitationMaxAggregateOutputType = {
    id: string | null
    key: string | null
    type: string | null
    createdAt: Date | null
    updatedAt: Date | null
    researchPaperId: string | null
  }

  export type CitationCountAggregateOutputType = {
    id: number
    key: number
    type: number
    fields: number
    createdAt: number
    updatedAt: number
    researchPaperId: number
    _all: number
  }


  export type CitationMinAggregateInputType = {
    id?: true
    key?: true
    type?: true
    createdAt?: true
    updatedAt?: true
    researchPaperId?: true
  }

  export type CitationMaxAggregateInputType = {
    id?: true
    key?: true
    type?: true
    createdAt?: true
    updatedAt?: true
    researchPaperId?: true
  }

  export type CitationCountAggregateInputType = {
    id?: true
    key?: true
    type?: true
    fields?: true
    createdAt?: true
    updatedAt?: true
    researchPaperId?: true
    _all?: true
  }

  export type CitationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Citation to aggregate.
     */
    where?: CitationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Citations to fetch.
     */
    orderBy?: CitationOrderByWithRelationInput | CitationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CitationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Citations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Citations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Citations
    **/
    _count?: true | CitationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CitationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CitationMaxAggregateInputType
  }

  export type GetCitationAggregateType<T extends CitationAggregateArgs> = {
        [P in keyof T & keyof AggregateCitation]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCitation[P]>
      : GetScalarType<T[P], AggregateCitation[P]>
  }




  export type CitationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CitationWhereInput
    orderBy?: CitationOrderByWithAggregationInput | CitationOrderByWithAggregationInput[]
    by: CitationScalarFieldEnum[] | CitationScalarFieldEnum
    having?: CitationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CitationCountAggregateInputType | true
    _min?: CitationMinAggregateInputType
    _max?: CitationMaxAggregateInputType
  }

  export type CitationGroupByOutputType = {
    id: string
    key: string
    type: string
    fields: JsonValue
    createdAt: Date
    updatedAt: Date
    researchPaperId: string
    _count: CitationCountAggregateOutputType | null
    _min: CitationMinAggregateOutputType | null
    _max: CitationMaxAggregateOutputType | null
  }

  type GetCitationGroupByPayload<T extends CitationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CitationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CitationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CitationGroupByOutputType[P]>
            : GetScalarType<T[P], CitationGroupByOutputType[P]>
        }
      >
    >


  export type CitationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    key?: boolean
    type?: boolean
    fields?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    researchPaperId?: boolean
    researchPaper?: boolean | ResearchPaperDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["citation"]>

  export type CitationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    key?: boolean
    type?: boolean
    fields?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    researchPaperId?: boolean
    researchPaper?: boolean | ResearchPaperDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["citation"]>

  export type CitationSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    key?: boolean
    type?: boolean
    fields?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    researchPaperId?: boolean
    researchPaper?: boolean | ResearchPaperDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["citation"]>

  export type CitationSelectScalar = {
    id?: boolean
    key?: boolean
    type?: boolean
    fields?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    researchPaperId?: boolean
  }

  export type CitationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "key" | "type" | "fields" | "createdAt" | "updatedAt" | "researchPaperId", ExtArgs["result"]["citation"]>
  export type CitationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    researchPaper?: boolean | ResearchPaperDefaultArgs<ExtArgs>
  }
  export type CitationIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    researchPaper?: boolean | ResearchPaperDefaultArgs<ExtArgs>
  }
  export type CitationIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    researchPaper?: boolean | ResearchPaperDefaultArgs<ExtArgs>
  }

  export type $CitationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Citation"
    objects: {
      researchPaper: Prisma.$ResearchPaperPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      key: string
      type: string
      fields: Prisma.JsonValue
      createdAt: Date
      updatedAt: Date
      researchPaperId: string
    }, ExtArgs["result"]["citation"]>
    composites: {}
  }

  type CitationGetPayload<S extends boolean | null | undefined | CitationDefaultArgs> = $Result.GetResult<Prisma.$CitationPayload, S>

  type CitationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CitationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CitationCountAggregateInputType | true
    }

  export interface CitationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Citation'], meta: { name: 'Citation' } }
    /**
     * Find zero or one Citation that matches the filter.
     * @param {CitationFindUniqueArgs} args - Arguments to find a Citation
     * @example
     * // Get one Citation
     * const citation = await prisma.citation.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CitationFindUniqueArgs>(args: SelectSubset<T, CitationFindUniqueArgs<ExtArgs>>): Prisma__CitationClient<$Result.GetResult<Prisma.$CitationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Citation that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CitationFindUniqueOrThrowArgs} args - Arguments to find a Citation
     * @example
     * // Get one Citation
     * const citation = await prisma.citation.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CitationFindUniqueOrThrowArgs>(args: SelectSubset<T, CitationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CitationClient<$Result.GetResult<Prisma.$CitationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Citation that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CitationFindFirstArgs} args - Arguments to find a Citation
     * @example
     * // Get one Citation
     * const citation = await prisma.citation.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CitationFindFirstArgs>(args?: SelectSubset<T, CitationFindFirstArgs<ExtArgs>>): Prisma__CitationClient<$Result.GetResult<Prisma.$CitationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Citation that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CitationFindFirstOrThrowArgs} args - Arguments to find a Citation
     * @example
     * // Get one Citation
     * const citation = await prisma.citation.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CitationFindFirstOrThrowArgs>(args?: SelectSubset<T, CitationFindFirstOrThrowArgs<ExtArgs>>): Prisma__CitationClient<$Result.GetResult<Prisma.$CitationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Citations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CitationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Citations
     * const citations = await prisma.citation.findMany()
     * 
     * // Get first 10 Citations
     * const citations = await prisma.citation.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const citationWithIdOnly = await prisma.citation.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CitationFindManyArgs>(args?: SelectSubset<T, CitationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CitationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Citation.
     * @param {CitationCreateArgs} args - Arguments to create a Citation.
     * @example
     * // Create one Citation
     * const Citation = await prisma.citation.create({
     *   data: {
     *     // ... data to create a Citation
     *   }
     * })
     * 
     */
    create<T extends CitationCreateArgs>(args: SelectSubset<T, CitationCreateArgs<ExtArgs>>): Prisma__CitationClient<$Result.GetResult<Prisma.$CitationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Citations.
     * @param {CitationCreateManyArgs} args - Arguments to create many Citations.
     * @example
     * // Create many Citations
     * const citation = await prisma.citation.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CitationCreateManyArgs>(args?: SelectSubset<T, CitationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Citations and returns the data saved in the database.
     * @param {CitationCreateManyAndReturnArgs} args - Arguments to create many Citations.
     * @example
     * // Create many Citations
     * const citation = await prisma.citation.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Citations and only return the `id`
     * const citationWithIdOnly = await prisma.citation.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CitationCreateManyAndReturnArgs>(args?: SelectSubset<T, CitationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CitationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Citation.
     * @param {CitationDeleteArgs} args - Arguments to delete one Citation.
     * @example
     * // Delete one Citation
     * const Citation = await prisma.citation.delete({
     *   where: {
     *     // ... filter to delete one Citation
     *   }
     * })
     * 
     */
    delete<T extends CitationDeleteArgs>(args: SelectSubset<T, CitationDeleteArgs<ExtArgs>>): Prisma__CitationClient<$Result.GetResult<Prisma.$CitationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Citation.
     * @param {CitationUpdateArgs} args - Arguments to update one Citation.
     * @example
     * // Update one Citation
     * const citation = await prisma.citation.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CitationUpdateArgs>(args: SelectSubset<T, CitationUpdateArgs<ExtArgs>>): Prisma__CitationClient<$Result.GetResult<Prisma.$CitationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Citations.
     * @param {CitationDeleteManyArgs} args - Arguments to filter Citations to delete.
     * @example
     * // Delete a few Citations
     * const { count } = await prisma.citation.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CitationDeleteManyArgs>(args?: SelectSubset<T, CitationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Citations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CitationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Citations
     * const citation = await prisma.citation.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CitationUpdateManyArgs>(args: SelectSubset<T, CitationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Citations and returns the data updated in the database.
     * @param {CitationUpdateManyAndReturnArgs} args - Arguments to update many Citations.
     * @example
     * // Update many Citations
     * const citation = await prisma.citation.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Citations and only return the `id`
     * const citationWithIdOnly = await prisma.citation.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CitationUpdateManyAndReturnArgs>(args: SelectSubset<T, CitationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CitationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Citation.
     * @param {CitationUpsertArgs} args - Arguments to update or create a Citation.
     * @example
     * // Update or create a Citation
     * const citation = await prisma.citation.upsert({
     *   create: {
     *     // ... data to create a Citation
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Citation we want to update
     *   }
     * })
     */
    upsert<T extends CitationUpsertArgs>(args: SelectSubset<T, CitationUpsertArgs<ExtArgs>>): Prisma__CitationClient<$Result.GetResult<Prisma.$CitationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Citations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CitationCountArgs} args - Arguments to filter Citations to count.
     * @example
     * // Count the number of Citations
     * const count = await prisma.citation.count({
     *   where: {
     *     // ... the filter for the Citations we want to count
     *   }
     * })
    **/
    count<T extends CitationCountArgs>(
      args?: Subset<T, CitationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CitationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Citation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CitationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CitationAggregateArgs>(args: Subset<T, CitationAggregateArgs>): Prisma.PrismaPromise<GetCitationAggregateType<T>>

    /**
     * Group by Citation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CitationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CitationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CitationGroupByArgs['orderBy'] }
        : { orderBy?: CitationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CitationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCitationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Citation model
   */
  readonly fields: CitationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Citation.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CitationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    researchPaper<T extends ResearchPaperDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ResearchPaperDefaultArgs<ExtArgs>>): Prisma__ResearchPaperClient<$Result.GetResult<Prisma.$ResearchPaperPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Citation model
   */
  interface CitationFieldRefs {
    readonly id: FieldRef<"Citation", 'String'>
    readonly key: FieldRef<"Citation", 'String'>
    readonly type: FieldRef<"Citation", 'String'>
    readonly fields: FieldRef<"Citation", 'Json'>
    readonly createdAt: FieldRef<"Citation", 'DateTime'>
    readonly updatedAt: FieldRef<"Citation", 'DateTime'>
    readonly researchPaperId: FieldRef<"Citation", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Citation findUnique
   */
  export type CitationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Citation
     */
    select?: CitationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Citation
     */
    omit?: CitationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CitationInclude<ExtArgs> | null
    /**
     * Filter, which Citation to fetch.
     */
    where: CitationWhereUniqueInput
  }

  /**
   * Citation findUniqueOrThrow
   */
  export type CitationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Citation
     */
    select?: CitationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Citation
     */
    omit?: CitationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CitationInclude<ExtArgs> | null
    /**
     * Filter, which Citation to fetch.
     */
    where: CitationWhereUniqueInput
  }

  /**
   * Citation findFirst
   */
  export type CitationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Citation
     */
    select?: CitationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Citation
     */
    omit?: CitationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CitationInclude<ExtArgs> | null
    /**
     * Filter, which Citation to fetch.
     */
    where?: CitationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Citations to fetch.
     */
    orderBy?: CitationOrderByWithRelationInput | CitationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Citations.
     */
    cursor?: CitationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Citations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Citations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Citations.
     */
    distinct?: CitationScalarFieldEnum | CitationScalarFieldEnum[]
  }

  /**
   * Citation findFirstOrThrow
   */
  export type CitationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Citation
     */
    select?: CitationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Citation
     */
    omit?: CitationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CitationInclude<ExtArgs> | null
    /**
     * Filter, which Citation to fetch.
     */
    where?: CitationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Citations to fetch.
     */
    orderBy?: CitationOrderByWithRelationInput | CitationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Citations.
     */
    cursor?: CitationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Citations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Citations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Citations.
     */
    distinct?: CitationScalarFieldEnum | CitationScalarFieldEnum[]
  }

  /**
   * Citation findMany
   */
  export type CitationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Citation
     */
    select?: CitationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Citation
     */
    omit?: CitationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CitationInclude<ExtArgs> | null
    /**
     * Filter, which Citations to fetch.
     */
    where?: CitationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Citations to fetch.
     */
    orderBy?: CitationOrderByWithRelationInput | CitationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Citations.
     */
    cursor?: CitationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Citations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Citations.
     */
    skip?: number
    distinct?: CitationScalarFieldEnum | CitationScalarFieldEnum[]
  }

  /**
   * Citation create
   */
  export type CitationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Citation
     */
    select?: CitationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Citation
     */
    omit?: CitationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CitationInclude<ExtArgs> | null
    /**
     * The data needed to create a Citation.
     */
    data: XOR<CitationCreateInput, CitationUncheckedCreateInput>
  }

  /**
   * Citation createMany
   */
  export type CitationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Citations.
     */
    data: CitationCreateManyInput | CitationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Citation createManyAndReturn
   */
  export type CitationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Citation
     */
    select?: CitationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Citation
     */
    omit?: CitationOmit<ExtArgs> | null
    /**
     * The data used to create many Citations.
     */
    data: CitationCreateManyInput | CitationCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CitationIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Citation update
   */
  export type CitationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Citation
     */
    select?: CitationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Citation
     */
    omit?: CitationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CitationInclude<ExtArgs> | null
    /**
     * The data needed to update a Citation.
     */
    data: XOR<CitationUpdateInput, CitationUncheckedUpdateInput>
    /**
     * Choose, which Citation to update.
     */
    where: CitationWhereUniqueInput
  }

  /**
   * Citation updateMany
   */
  export type CitationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Citations.
     */
    data: XOR<CitationUpdateManyMutationInput, CitationUncheckedUpdateManyInput>
    /**
     * Filter which Citations to update
     */
    where?: CitationWhereInput
    /**
     * Limit how many Citations to update.
     */
    limit?: number
  }

  /**
   * Citation updateManyAndReturn
   */
  export type CitationUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Citation
     */
    select?: CitationSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Citation
     */
    omit?: CitationOmit<ExtArgs> | null
    /**
     * The data used to update Citations.
     */
    data: XOR<CitationUpdateManyMutationInput, CitationUncheckedUpdateManyInput>
    /**
     * Filter which Citations to update
     */
    where?: CitationWhereInput
    /**
     * Limit how many Citations to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CitationIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Citation upsert
   */
  export type CitationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Citation
     */
    select?: CitationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Citation
     */
    omit?: CitationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CitationInclude<ExtArgs> | null
    /**
     * The filter to search for the Citation to update in case it exists.
     */
    where: CitationWhereUniqueInput
    /**
     * In case the Citation found by the `where` argument doesn't exist, create a new Citation with this data.
     */
    create: XOR<CitationCreateInput, CitationUncheckedCreateInput>
    /**
     * In case the Citation was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CitationUpdateInput, CitationUncheckedUpdateInput>
  }

  /**
   * Citation delete
   */
  export type CitationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Citation
     */
    select?: CitationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Citation
     */
    omit?: CitationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CitationInclude<ExtArgs> | null
    /**
     * Filter which Citation to delete.
     */
    where: CitationWhereUniqueInput
  }

  /**
   * Citation deleteMany
   */
  export type CitationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Citations to delete
     */
    where?: CitationWhereInput
    /**
     * Limit how many Citations to delete.
     */
    limit?: number
  }

  /**
   * Citation without action
   */
  export type CitationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Citation
     */
    select?: CitationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Citation
     */
    omit?: CitationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CitationInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const ResearchPaperScalarFieldEnum: {
    id: 'id',
    title: 'title',
    publication: 'publication',
    year: 'year',
    abstract: 'abstract',
    keywords: 'keywords',
    filePath: 'filePath',
    notes: 'notes',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ResearchPaperScalarFieldEnum = (typeof ResearchPaperScalarFieldEnum)[keyof typeof ResearchPaperScalarFieldEnum]


  export const AuthorScalarFieldEnum: {
    id: 'id',
    firstName: 'firstName',
    lastName: 'lastName',
    middleName: 'middleName',
    orcid: 'orcid',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type AuthorScalarFieldEnum = (typeof AuthorScalarFieldEnum)[keyof typeof AuthorScalarFieldEnum]


  export const CitationScalarFieldEnum: {
    id: 'id',
    key: 'key',
    type: 'type',
    fields: 'fields',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    researchPaperId: 'researchPaperId'
  };

  export type CitationScalarFieldEnum = (typeof CitationScalarFieldEnum)[keyof typeof CitationScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type ResearchPaperWhereInput = {
    AND?: ResearchPaperWhereInput | ResearchPaperWhereInput[]
    OR?: ResearchPaperWhereInput[]
    NOT?: ResearchPaperWhereInput | ResearchPaperWhereInput[]
    id?: StringFilter<"ResearchPaper"> | string
    title?: StringFilter<"ResearchPaper"> | string
    publication?: StringNullableFilter<"ResearchPaper"> | string | null
    year?: IntNullableFilter<"ResearchPaper"> | number | null
    abstract?: StringNullableFilter<"ResearchPaper"> | string | null
    keywords?: StringNullableListFilter<"ResearchPaper">
    filePath?: StringNullableFilter<"ResearchPaper"> | string | null
    notes?: StringNullableFilter<"ResearchPaper"> | string | null
    createdAt?: DateTimeFilter<"ResearchPaper"> | Date | string
    updatedAt?: DateTimeFilter<"ResearchPaper"> | Date | string
    authors?: AuthorListRelationFilter
    citations?: CitationListRelationFilter
  }

  export type ResearchPaperOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    publication?: SortOrderInput | SortOrder
    year?: SortOrderInput | SortOrder
    abstract?: SortOrderInput | SortOrder
    keywords?: SortOrder
    filePath?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    authors?: AuthorOrderByRelationAggregateInput
    citations?: CitationOrderByRelationAggregateInput
  }

  export type ResearchPaperWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ResearchPaperWhereInput | ResearchPaperWhereInput[]
    OR?: ResearchPaperWhereInput[]
    NOT?: ResearchPaperWhereInput | ResearchPaperWhereInput[]
    title?: StringFilter<"ResearchPaper"> | string
    publication?: StringNullableFilter<"ResearchPaper"> | string | null
    year?: IntNullableFilter<"ResearchPaper"> | number | null
    abstract?: StringNullableFilter<"ResearchPaper"> | string | null
    keywords?: StringNullableListFilter<"ResearchPaper">
    filePath?: StringNullableFilter<"ResearchPaper"> | string | null
    notes?: StringNullableFilter<"ResearchPaper"> | string | null
    createdAt?: DateTimeFilter<"ResearchPaper"> | Date | string
    updatedAt?: DateTimeFilter<"ResearchPaper"> | Date | string
    authors?: AuthorListRelationFilter
    citations?: CitationListRelationFilter
  }, "id">

  export type ResearchPaperOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    publication?: SortOrderInput | SortOrder
    year?: SortOrderInput | SortOrder
    abstract?: SortOrderInput | SortOrder
    keywords?: SortOrder
    filePath?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ResearchPaperCountOrderByAggregateInput
    _avg?: ResearchPaperAvgOrderByAggregateInput
    _max?: ResearchPaperMaxOrderByAggregateInput
    _min?: ResearchPaperMinOrderByAggregateInput
    _sum?: ResearchPaperSumOrderByAggregateInput
  }

  export type ResearchPaperScalarWhereWithAggregatesInput = {
    AND?: ResearchPaperScalarWhereWithAggregatesInput | ResearchPaperScalarWhereWithAggregatesInput[]
    OR?: ResearchPaperScalarWhereWithAggregatesInput[]
    NOT?: ResearchPaperScalarWhereWithAggregatesInput | ResearchPaperScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ResearchPaper"> | string
    title?: StringWithAggregatesFilter<"ResearchPaper"> | string
    publication?: StringNullableWithAggregatesFilter<"ResearchPaper"> | string | null
    year?: IntNullableWithAggregatesFilter<"ResearchPaper"> | number | null
    abstract?: StringNullableWithAggregatesFilter<"ResearchPaper"> | string | null
    keywords?: StringNullableListFilter<"ResearchPaper">
    filePath?: StringNullableWithAggregatesFilter<"ResearchPaper"> | string | null
    notes?: StringNullableWithAggregatesFilter<"ResearchPaper"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"ResearchPaper"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ResearchPaper"> | Date | string
  }

  export type AuthorWhereInput = {
    AND?: AuthorWhereInput | AuthorWhereInput[]
    OR?: AuthorWhereInput[]
    NOT?: AuthorWhereInput | AuthorWhereInput[]
    id?: StringFilter<"Author"> | string
    firstName?: StringFilter<"Author"> | string
    lastName?: StringFilter<"Author"> | string
    middleName?: StringNullableFilter<"Author"> | string | null
    orcid?: StringNullableFilter<"Author"> | string | null
    createdAt?: DateTimeFilter<"Author"> | Date | string
    updatedAt?: DateTimeFilter<"Author"> | Date | string
    papers?: ResearchPaperListRelationFilter
  }

  export type AuthorOrderByWithRelationInput = {
    id?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    middleName?: SortOrderInput | SortOrder
    orcid?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    papers?: ResearchPaperOrderByRelationAggregateInput
  }

  export type AuthorWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    orcid?: string
    AND?: AuthorWhereInput | AuthorWhereInput[]
    OR?: AuthorWhereInput[]
    NOT?: AuthorWhereInput | AuthorWhereInput[]
    firstName?: StringFilter<"Author"> | string
    lastName?: StringFilter<"Author"> | string
    middleName?: StringNullableFilter<"Author"> | string | null
    createdAt?: DateTimeFilter<"Author"> | Date | string
    updatedAt?: DateTimeFilter<"Author"> | Date | string
    papers?: ResearchPaperListRelationFilter
  }, "id" | "orcid">

  export type AuthorOrderByWithAggregationInput = {
    id?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    middleName?: SortOrderInput | SortOrder
    orcid?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: AuthorCountOrderByAggregateInput
    _max?: AuthorMaxOrderByAggregateInput
    _min?: AuthorMinOrderByAggregateInput
  }

  export type AuthorScalarWhereWithAggregatesInput = {
    AND?: AuthorScalarWhereWithAggregatesInput | AuthorScalarWhereWithAggregatesInput[]
    OR?: AuthorScalarWhereWithAggregatesInput[]
    NOT?: AuthorScalarWhereWithAggregatesInput | AuthorScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Author"> | string
    firstName?: StringWithAggregatesFilter<"Author"> | string
    lastName?: StringWithAggregatesFilter<"Author"> | string
    middleName?: StringNullableWithAggregatesFilter<"Author"> | string | null
    orcid?: StringNullableWithAggregatesFilter<"Author"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Author"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Author"> | Date | string
  }

  export type CitationWhereInput = {
    AND?: CitationWhereInput | CitationWhereInput[]
    OR?: CitationWhereInput[]
    NOT?: CitationWhereInput | CitationWhereInput[]
    id?: StringFilter<"Citation"> | string
    key?: StringFilter<"Citation"> | string
    type?: StringFilter<"Citation"> | string
    fields?: JsonFilter<"Citation">
    createdAt?: DateTimeFilter<"Citation"> | Date | string
    updatedAt?: DateTimeFilter<"Citation"> | Date | string
    researchPaperId?: StringFilter<"Citation"> | string
    researchPaper?: XOR<ResearchPaperScalarRelationFilter, ResearchPaperWhereInput>
  }

  export type CitationOrderByWithRelationInput = {
    id?: SortOrder
    key?: SortOrder
    type?: SortOrder
    fields?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    researchPaperId?: SortOrder
    researchPaper?: ResearchPaperOrderByWithRelationInput
  }

  export type CitationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    researchPaperId_key?: CitationResearchPaperIdKeyCompoundUniqueInput
    AND?: CitationWhereInput | CitationWhereInput[]
    OR?: CitationWhereInput[]
    NOT?: CitationWhereInput | CitationWhereInput[]
    key?: StringFilter<"Citation"> | string
    type?: StringFilter<"Citation"> | string
    fields?: JsonFilter<"Citation">
    createdAt?: DateTimeFilter<"Citation"> | Date | string
    updatedAt?: DateTimeFilter<"Citation"> | Date | string
    researchPaperId?: StringFilter<"Citation"> | string
    researchPaper?: XOR<ResearchPaperScalarRelationFilter, ResearchPaperWhereInput>
  }, "id" | "researchPaperId_key">

  export type CitationOrderByWithAggregationInput = {
    id?: SortOrder
    key?: SortOrder
    type?: SortOrder
    fields?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    researchPaperId?: SortOrder
    _count?: CitationCountOrderByAggregateInput
    _max?: CitationMaxOrderByAggregateInput
    _min?: CitationMinOrderByAggregateInput
  }

  export type CitationScalarWhereWithAggregatesInput = {
    AND?: CitationScalarWhereWithAggregatesInput | CitationScalarWhereWithAggregatesInput[]
    OR?: CitationScalarWhereWithAggregatesInput[]
    NOT?: CitationScalarWhereWithAggregatesInput | CitationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Citation"> | string
    key?: StringWithAggregatesFilter<"Citation"> | string
    type?: StringWithAggregatesFilter<"Citation"> | string
    fields?: JsonWithAggregatesFilter<"Citation">
    createdAt?: DateTimeWithAggregatesFilter<"Citation"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Citation"> | Date | string
    researchPaperId?: StringWithAggregatesFilter<"Citation"> | string
  }

  export type ResearchPaperCreateInput = {
    id?: string
    title: string
    publication?: string | null
    year?: number | null
    abstract?: string | null
    keywords?: ResearchPaperCreatekeywordsInput | string[]
    filePath?: string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    authors?: AuthorCreateNestedManyWithoutPapersInput
    citations?: CitationCreateNestedManyWithoutResearchPaperInput
  }

  export type ResearchPaperUncheckedCreateInput = {
    id?: string
    title: string
    publication?: string | null
    year?: number | null
    abstract?: string | null
    keywords?: ResearchPaperCreatekeywordsInput | string[]
    filePath?: string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    authors?: AuthorUncheckedCreateNestedManyWithoutPapersInput
    citations?: CitationUncheckedCreateNestedManyWithoutResearchPaperInput
  }

  export type ResearchPaperUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    publication?: NullableStringFieldUpdateOperationsInput | string | null
    year?: NullableIntFieldUpdateOperationsInput | number | null
    abstract?: NullableStringFieldUpdateOperationsInput | string | null
    keywords?: ResearchPaperUpdatekeywordsInput | string[]
    filePath?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    authors?: AuthorUpdateManyWithoutPapersNestedInput
    citations?: CitationUpdateManyWithoutResearchPaperNestedInput
  }

  export type ResearchPaperUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    publication?: NullableStringFieldUpdateOperationsInput | string | null
    year?: NullableIntFieldUpdateOperationsInput | number | null
    abstract?: NullableStringFieldUpdateOperationsInput | string | null
    keywords?: ResearchPaperUpdatekeywordsInput | string[]
    filePath?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    authors?: AuthorUncheckedUpdateManyWithoutPapersNestedInput
    citations?: CitationUncheckedUpdateManyWithoutResearchPaperNestedInput
  }

  export type ResearchPaperCreateManyInput = {
    id?: string
    title: string
    publication?: string | null
    year?: number | null
    abstract?: string | null
    keywords?: ResearchPaperCreatekeywordsInput | string[]
    filePath?: string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ResearchPaperUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    publication?: NullableStringFieldUpdateOperationsInput | string | null
    year?: NullableIntFieldUpdateOperationsInput | number | null
    abstract?: NullableStringFieldUpdateOperationsInput | string | null
    keywords?: ResearchPaperUpdatekeywordsInput | string[]
    filePath?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ResearchPaperUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    publication?: NullableStringFieldUpdateOperationsInput | string | null
    year?: NullableIntFieldUpdateOperationsInput | number | null
    abstract?: NullableStringFieldUpdateOperationsInput | string | null
    keywords?: ResearchPaperUpdatekeywordsInput | string[]
    filePath?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuthorCreateInput = {
    id?: string
    firstName: string
    lastName: string
    middleName?: string | null
    orcid?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    papers?: ResearchPaperCreateNestedManyWithoutAuthorsInput
  }

  export type AuthorUncheckedCreateInput = {
    id?: string
    firstName: string
    lastName: string
    middleName?: string | null
    orcid?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    papers?: ResearchPaperUncheckedCreateNestedManyWithoutAuthorsInput
  }

  export type AuthorUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    middleName?: NullableStringFieldUpdateOperationsInput | string | null
    orcid?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    papers?: ResearchPaperUpdateManyWithoutAuthorsNestedInput
  }

  export type AuthorUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    middleName?: NullableStringFieldUpdateOperationsInput | string | null
    orcid?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    papers?: ResearchPaperUncheckedUpdateManyWithoutAuthorsNestedInput
  }

  export type AuthorCreateManyInput = {
    id?: string
    firstName: string
    lastName: string
    middleName?: string | null
    orcid?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AuthorUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    middleName?: NullableStringFieldUpdateOperationsInput | string | null
    orcid?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuthorUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    middleName?: NullableStringFieldUpdateOperationsInput | string | null
    orcid?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CitationCreateInput = {
    id?: string
    key: string
    type: string
    fields: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    researchPaper: ResearchPaperCreateNestedOneWithoutCitationsInput
  }

  export type CitationUncheckedCreateInput = {
    id?: string
    key: string
    type: string
    fields: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    researchPaperId: string
  }

  export type CitationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    fields?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    researchPaper?: ResearchPaperUpdateOneRequiredWithoutCitationsNestedInput
  }

  export type CitationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    fields?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    researchPaperId?: StringFieldUpdateOperationsInput | string
  }

  export type CitationCreateManyInput = {
    id?: string
    key: string
    type: string
    fields: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    researchPaperId: string
  }

  export type CitationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    fields?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CitationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    fields?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    researchPaperId?: StringFieldUpdateOperationsInput | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type AuthorListRelationFilter = {
    every?: AuthorWhereInput
    some?: AuthorWhereInput
    none?: AuthorWhereInput
  }

  export type CitationListRelationFilter = {
    every?: CitationWhereInput
    some?: CitationWhereInput
    none?: CitationWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type AuthorOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CitationOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ResearchPaperCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    publication?: SortOrder
    year?: SortOrder
    abstract?: SortOrder
    keywords?: SortOrder
    filePath?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ResearchPaperAvgOrderByAggregateInput = {
    year?: SortOrder
  }

  export type ResearchPaperMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    publication?: SortOrder
    year?: SortOrder
    abstract?: SortOrder
    filePath?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ResearchPaperMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    publication?: SortOrder
    year?: SortOrder
    abstract?: SortOrder
    filePath?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ResearchPaperSumOrderByAggregateInput = {
    year?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type ResearchPaperListRelationFilter = {
    every?: ResearchPaperWhereInput
    some?: ResearchPaperWhereInput
    none?: ResearchPaperWhereInput
  }

  export type ResearchPaperOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AuthorCountOrderByAggregateInput = {
    id?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    middleName?: SortOrder
    orcid?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AuthorMaxOrderByAggregateInput = {
    id?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    middleName?: SortOrder
    orcid?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AuthorMinOrderByAggregateInput = {
    id?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    middleName?: SortOrder
    orcid?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type ResearchPaperScalarRelationFilter = {
    is?: ResearchPaperWhereInput
    isNot?: ResearchPaperWhereInput
  }

  export type CitationResearchPaperIdKeyCompoundUniqueInput = {
    researchPaperId: string
    key: string
  }

  export type CitationCountOrderByAggregateInput = {
    id?: SortOrder
    key?: SortOrder
    type?: SortOrder
    fields?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    researchPaperId?: SortOrder
  }

  export type CitationMaxOrderByAggregateInput = {
    id?: SortOrder
    key?: SortOrder
    type?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    researchPaperId?: SortOrder
  }

  export type CitationMinOrderByAggregateInput = {
    id?: SortOrder
    key?: SortOrder
    type?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    researchPaperId?: SortOrder
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type ResearchPaperCreatekeywordsInput = {
    set: string[]
  }

  export type AuthorCreateNestedManyWithoutPapersInput = {
    create?: XOR<AuthorCreateWithoutPapersInput, AuthorUncheckedCreateWithoutPapersInput> | AuthorCreateWithoutPapersInput[] | AuthorUncheckedCreateWithoutPapersInput[]
    connectOrCreate?: AuthorCreateOrConnectWithoutPapersInput | AuthorCreateOrConnectWithoutPapersInput[]
    connect?: AuthorWhereUniqueInput | AuthorWhereUniqueInput[]
  }

  export type CitationCreateNestedManyWithoutResearchPaperInput = {
    create?: XOR<CitationCreateWithoutResearchPaperInput, CitationUncheckedCreateWithoutResearchPaperInput> | CitationCreateWithoutResearchPaperInput[] | CitationUncheckedCreateWithoutResearchPaperInput[]
    connectOrCreate?: CitationCreateOrConnectWithoutResearchPaperInput | CitationCreateOrConnectWithoutResearchPaperInput[]
    createMany?: CitationCreateManyResearchPaperInputEnvelope
    connect?: CitationWhereUniqueInput | CitationWhereUniqueInput[]
  }

  export type AuthorUncheckedCreateNestedManyWithoutPapersInput = {
    create?: XOR<AuthorCreateWithoutPapersInput, AuthorUncheckedCreateWithoutPapersInput> | AuthorCreateWithoutPapersInput[] | AuthorUncheckedCreateWithoutPapersInput[]
    connectOrCreate?: AuthorCreateOrConnectWithoutPapersInput | AuthorCreateOrConnectWithoutPapersInput[]
    connect?: AuthorWhereUniqueInput | AuthorWhereUniqueInput[]
  }

  export type CitationUncheckedCreateNestedManyWithoutResearchPaperInput = {
    create?: XOR<CitationCreateWithoutResearchPaperInput, CitationUncheckedCreateWithoutResearchPaperInput> | CitationCreateWithoutResearchPaperInput[] | CitationUncheckedCreateWithoutResearchPaperInput[]
    connectOrCreate?: CitationCreateOrConnectWithoutResearchPaperInput | CitationCreateOrConnectWithoutResearchPaperInput[]
    createMany?: CitationCreateManyResearchPaperInputEnvelope
    connect?: CitationWhereUniqueInput | CitationWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type ResearchPaperUpdatekeywordsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type AuthorUpdateManyWithoutPapersNestedInput = {
    create?: XOR<AuthorCreateWithoutPapersInput, AuthorUncheckedCreateWithoutPapersInput> | AuthorCreateWithoutPapersInput[] | AuthorUncheckedCreateWithoutPapersInput[]
    connectOrCreate?: AuthorCreateOrConnectWithoutPapersInput | AuthorCreateOrConnectWithoutPapersInput[]
    upsert?: AuthorUpsertWithWhereUniqueWithoutPapersInput | AuthorUpsertWithWhereUniqueWithoutPapersInput[]
    set?: AuthorWhereUniqueInput | AuthorWhereUniqueInput[]
    disconnect?: AuthorWhereUniqueInput | AuthorWhereUniqueInput[]
    delete?: AuthorWhereUniqueInput | AuthorWhereUniqueInput[]
    connect?: AuthorWhereUniqueInput | AuthorWhereUniqueInput[]
    update?: AuthorUpdateWithWhereUniqueWithoutPapersInput | AuthorUpdateWithWhereUniqueWithoutPapersInput[]
    updateMany?: AuthorUpdateManyWithWhereWithoutPapersInput | AuthorUpdateManyWithWhereWithoutPapersInput[]
    deleteMany?: AuthorScalarWhereInput | AuthorScalarWhereInput[]
  }

  export type CitationUpdateManyWithoutResearchPaperNestedInput = {
    create?: XOR<CitationCreateWithoutResearchPaperInput, CitationUncheckedCreateWithoutResearchPaperInput> | CitationCreateWithoutResearchPaperInput[] | CitationUncheckedCreateWithoutResearchPaperInput[]
    connectOrCreate?: CitationCreateOrConnectWithoutResearchPaperInput | CitationCreateOrConnectWithoutResearchPaperInput[]
    upsert?: CitationUpsertWithWhereUniqueWithoutResearchPaperInput | CitationUpsertWithWhereUniqueWithoutResearchPaperInput[]
    createMany?: CitationCreateManyResearchPaperInputEnvelope
    set?: CitationWhereUniqueInput | CitationWhereUniqueInput[]
    disconnect?: CitationWhereUniqueInput | CitationWhereUniqueInput[]
    delete?: CitationWhereUniqueInput | CitationWhereUniqueInput[]
    connect?: CitationWhereUniqueInput | CitationWhereUniqueInput[]
    update?: CitationUpdateWithWhereUniqueWithoutResearchPaperInput | CitationUpdateWithWhereUniqueWithoutResearchPaperInput[]
    updateMany?: CitationUpdateManyWithWhereWithoutResearchPaperInput | CitationUpdateManyWithWhereWithoutResearchPaperInput[]
    deleteMany?: CitationScalarWhereInput | CitationScalarWhereInput[]
  }

  export type AuthorUncheckedUpdateManyWithoutPapersNestedInput = {
    create?: XOR<AuthorCreateWithoutPapersInput, AuthorUncheckedCreateWithoutPapersInput> | AuthorCreateWithoutPapersInput[] | AuthorUncheckedCreateWithoutPapersInput[]
    connectOrCreate?: AuthorCreateOrConnectWithoutPapersInput | AuthorCreateOrConnectWithoutPapersInput[]
    upsert?: AuthorUpsertWithWhereUniqueWithoutPapersInput | AuthorUpsertWithWhereUniqueWithoutPapersInput[]
    set?: AuthorWhereUniqueInput | AuthorWhereUniqueInput[]
    disconnect?: AuthorWhereUniqueInput | AuthorWhereUniqueInput[]
    delete?: AuthorWhereUniqueInput | AuthorWhereUniqueInput[]
    connect?: AuthorWhereUniqueInput | AuthorWhereUniqueInput[]
    update?: AuthorUpdateWithWhereUniqueWithoutPapersInput | AuthorUpdateWithWhereUniqueWithoutPapersInput[]
    updateMany?: AuthorUpdateManyWithWhereWithoutPapersInput | AuthorUpdateManyWithWhereWithoutPapersInput[]
    deleteMany?: AuthorScalarWhereInput | AuthorScalarWhereInput[]
  }

  export type CitationUncheckedUpdateManyWithoutResearchPaperNestedInput = {
    create?: XOR<CitationCreateWithoutResearchPaperInput, CitationUncheckedCreateWithoutResearchPaperInput> | CitationCreateWithoutResearchPaperInput[] | CitationUncheckedCreateWithoutResearchPaperInput[]
    connectOrCreate?: CitationCreateOrConnectWithoutResearchPaperInput | CitationCreateOrConnectWithoutResearchPaperInput[]
    upsert?: CitationUpsertWithWhereUniqueWithoutResearchPaperInput | CitationUpsertWithWhereUniqueWithoutResearchPaperInput[]
    createMany?: CitationCreateManyResearchPaperInputEnvelope
    set?: CitationWhereUniqueInput | CitationWhereUniqueInput[]
    disconnect?: CitationWhereUniqueInput | CitationWhereUniqueInput[]
    delete?: CitationWhereUniqueInput | CitationWhereUniqueInput[]
    connect?: CitationWhereUniqueInput | CitationWhereUniqueInput[]
    update?: CitationUpdateWithWhereUniqueWithoutResearchPaperInput | CitationUpdateWithWhereUniqueWithoutResearchPaperInput[]
    updateMany?: CitationUpdateManyWithWhereWithoutResearchPaperInput | CitationUpdateManyWithWhereWithoutResearchPaperInput[]
    deleteMany?: CitationScalarWhereInput | CitationScalarWhereInput[]
  }

  export type ResearchPaperCreateNestedManyWithoutAuthorsInput = {
    create?: XOR<ResearchPaperCreateWithoutAuthorsInput, ResearchPaperUncheckedCreateWithoutAuthorsInput> | ResearchPaperCreateWithoutAuthorsInput[] | ResearchPaperUncheckedCreateWithoutAuthorsInput[]
    connectOrCreate?: ResearchPaperCreateOrConnectWithoutAuthorsInput | ResearchPaperCreateOrConnectWithoutAuthorsInput[]
    connect?: ResearchPaperWhereUniqueInput | ResearchPaperWhereUniqueInput[]
  }

  export type ResearchPaperUncheckedCreateNestedManyWithoutAuthorsInput = {
    create?: XOR<ResearchPaperCreateWithoutAuthorsInput, ResearchPaperUncheckedCreateWithoutAuthorsInput> | ResearchPaperCreateWithoutAuthorsInput[] | ResearchPaperUncheckedCreateWithoutAuthorsInput[]
    connectOrCreate?: ResearchPaperCreateOrConnectWithoutAuthorsInput | ResearchPaperCreateOrConnectWithoutAuthorsInput[]
    connect?: ResearchPaperWhereUniqueInput | ResearchPaperWhereUniqueInput[]
  }

  export type ResearchPaperUpdateManyWithoutAuthorsNestedInput = {
    create?: XOR<ResearchPaperCreateWithoutAuthorsInput, ResearchPaperUncheckedCreateWithoutAuthorsInput> | ResearchPaperCreateWithoutAuthorsInput[] | ResearchPaperUncheckedCreateWithoutAuthorsInput[]
    connectOrCreate?: ResearchPaperCreateOrConnectWithoutAuthorsInput | ResearchPaperCreateOrConnectWithoutAuthorsInput[]
    upsert?: ResearchPaperUpsertWithWhereUniqueWithoutAuthorsInput | ResearchPaperUpsertWithWhereUniqueWithoutAuthorsInput[]
    set?: ResearchPaperWhereUniqueInput | ResearchPaperWhereUniqueInput[]
    disconnect?: ResearchPaperWhereUniqueInput | ResearchPaperWhereUniqueInput[]
    delete?: ResearchPaperWhereUniqueInput | ResearchPaperWhereUniqueInput[]
    connect?: ResearchPaperWhereUniqueInput | ResearchPaperWhereUniqueInput[]
    update?: ResearchPaperUpdateWithWhereUniqueWithoutAuthorsInput | ResearchPaperUpdateWithWhereUniqueWithoutAuthorsInput[]
    updateMany?: ResearchPaperUpdateManyWithWhereWithoutAuthorsInput | ResearchPaperUpdateManyWithWhereWithoutAuthorsInput[]
    deleteMany?: ResearchPaperScalarWhereInput | ResearchPaperScalarWhereInput[]
  }

  export type ResearchPaperUncheckedUpdateManyWithoutAuthorsNestedInput = {
    create?: XOR<ResearchPaperCreateWithoutAuthorsInput, ResearchPaperUncheckedCreateWithoutAuthorsInput> | ResearchPaperCreateWithoutAuthorsInput[] | ResearchPaperUncheckedCreateWithoutAuthorsInput[]
    connectOrCreate?: ResearchPaperCreateOrConnectWithoutAuthorsInput | ResearchPaperCreateOrConnectWithoutAuthorsInput[]
    upsert?: ResearchPaperUpsertWithWhereUniqueWithoutAuthorsInput | ResearchPaperUpsertWithWhereUniqueWithoutAuthorsInput[]
    set?: ResearchPaperWhereUniqueInput | ResearchPaperWhereUniqueInput[]
    disconnect?: ResearchPaperWhereUniqueInput | ResearchPaperWhereUniqueInput[]
    delete?: ResearchPaperWhereUniqueInput | ResearchPaperWhereUniqueInput[]
    connect?: ResearchPaperWhereUniqueInput | ResearchPaperWhereUniqueInput[]
    update?: ResearchPaperUpdateWithWhereUniqueWithoutAuthorsInput | ResearchPaperUpdateWithWhereUniqueWithoutAuthorsInput[]
    updateMany?: ResearchPaperUpdateManyWithWhereWithoutAuthorsInput | ResearchPaperUpdateManyWithWhereWithoutAuthorsInput[]
    deleteMany?: ResearchPaperScalarWhereInput | ResearchPaperScalarWhereInput[]
  }

  export type ResearchPaperCreateNestedOneWithoutCitationsInput = {
    create?: XOR<ResearchPaperCreateWithoutCitationsInput, ResearchPaperUncheckedCreateWithoutCitationsInput>
    connectOrCreate?: ResearchPaperCreateOrConnectWithoutCitationsInput
    connect?: ResearchPaperWhereUniqueInput
  }

  export type ResearchPaperUpdateOneRequiredWithoutCitationsNestedInput = {
    create?: XOR<ResearchPaperCreateWithoutCitationsInput, ResearchPaperUncheckedCreateWithoutCitationsInput>
    connectOrCreate?: ResearchPaperCreateOrConnectWithoutCitationsInput
    upsert?: ResearchPaperUpsertWithoutCitationsInput
    connect?: ResearchPaperWhereUniqueInput
    update?: XOR<XOR<ResearchPaperUpdateToOneWithWhereWithoutCitationsInput, ResearchPaperUpdateWithoutCitationsInput>, ResearchPaperUncheckedUpdateWithoutCitationsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type AuthorCreateWithoutPapersInput = {
    id?: string
    firstName: string
    lastName: string
    middleName?: string | null
    orcid?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AuthorUncheckedCreateWithoutPapersInput = {
    id?: string
    firstName: string
    lastName: string
    middleName?: string | null
    orcid?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AuthorCreateOrConnectWithoutPapersInput = {
    where: AuthorWhereUniqueInput
    create: XOR<AuthorCreateWithoutPapersInput, AuthorUncheckedCreateWithoutPapersInput>
  }

  export type CitationCreateWithoutResearchPaperInput = {
    id?: string
    key: string
    type: string
    fields: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CitationUncheckedCreateWithoutResearchPaperInput = {
    id?: string
    key: string
    type: string
    fields: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CitationCreateOrConnectWithoutResearchPaperInput = {
    where: CitationWhereUniqueInput
    create: XOR<CitationCreateWithoutResearchPaperInput, CitationUncheckedCreateWithoutResearchPaperInput>
  }

  export type CitationCreateManyResearchPaperInputEnvelope = {
    data: CitationCreateManyResearchPaperInput | CitationCreateManyResearchPaperInput[]
    skipDuplicates?: boolean
  }

  export type AuthorUpsertWithWhereUniqueWithoutPapersInput = {
    where: AuthorWhereUniqueInput
    update: XOR<AuthorUpdateWithoutPapersInput, AuthorUncheckedUpdateWithoutPapersInput>
    create: XOR<AuthorCreateWithoutPapersInput, AuthorUncheckedCreateWithoutPapersInput>
  }

  export type AuthorUpdateWithWhereUniqueWithoutPapersInput = {
    where: AuthorWhereUniqueInput
    data: XOR<AuthorUpdateWithoutPapersInput, AuthorUncheckedUpdateWithoutPapersInput>
  }

  export type AuthorUpdateManyWithWhereWithoutPapersInput = {
    where: AuthorScalarWhereInput
    data: XOR<AuthorUpdateManyMutationInput, AuthorUncheckedUpdateManyWithoutPapersInput>
  }

  export type AuthorScalarWhereInput = {
    AND?: AuthorScalarWhereInput | AuthorScalarWhereInput[]
    OR?: AuthorScalarWhereInput[]
    NOT?: AuthorScalarWhereInput | AuthorScalarWhereInput[]
    id?: StringFilter<"Author"> | string
    firstName?: StringFilter<"Author"> | string
    lastName?: StringFilter<"Author"> | string
    middleName?: StringNullableFilter<"Author"> | string | null
    orcid?: StringNullableFilter<"Author"> | string | null
    createdAt?: DateTimeFilter<"Author"> | Date | string
    updatedAt?: DateTimeFilter<"Author"> | Date | string
  }

  export type CitationUpsertWithWhereUniqueWithoutResearchPaperInput = {
    where: CitationWhereUniqueInput
    update: XOR<CitationUpdateWithoutResearchPaperInput, CitationUncheckedUpdateWithoutResearchPaperInput>
    create: XOR<CitationCreateWithoutResearchPaperInput, CitationUncheckedCreateWithoutResearchPaperInput>
  }

  export type CitationUpdateWithWhereUniqueWithoutResearchPaperInput = {
    where: CitationWhereUniqueInput
    data: XOR<CitationUpdateWithoutResearchPaperInput, CitationUncheckedUpdateWithoutResearchPaperInput>
  }

  export type CitationUpdateManyWithWhereWithoutResearchPaperInput = {
    where: CitationScalarWhereInput
    data: XOR<CitationUpdateManyMutationInput, CitationUncheckedUpdateManyWithoutResearchPaperInput>
  }

  export type CitationScalarWhereInput = {
    AND?: CitationScalarWhereInput | CitationScalarWhereInput[]
    OR?: CitationScalarWhereInput[]
    NOT?: CitationScalarWhereInput | CitationScalarWhereInput[]
    id?: StringFilter<"Citation"> | string
    key?: StringFilter<"Citation"> | string
    type?: StringFilter<"Citation"> | string
    fields?: JsonFilter<"Citation">
    createdAt?: DateTimeFilter<"Citation"> | Date | string
    updatedAt?: DateTimeFilter<"Citation"> | Date | string
    researchPaperId?: StringFilter<"Citation"> | string
  }

  export type ResearchPaperCreateWithoutAuthorsInput = {
    id?: string
    title: string
    publication?: string | null
    year?: number | null
    abstract?: string | null
    keywords?: ResearchPaperCreatekeywordsInput | string[]
    filePath?: string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    citations?: CitationCreateNestedManyWithoutResearchPaperInput
  }

  export type ResearchPaperUncheckedCreateWithoutAuthorsInput = {
    id?: string
    title: string
    publication?: string | null
    year?: number | null
    abstract?: string | null
    keywords?: ResearchPaperCreatekeywordsInput | string[]
    filePath?: string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    citations?: CitationUncheckedCreateNestedManyWithoutResearchPaperInput
  }

  export type ResearchPaperCreateOrConnectWithoutAuthorsInput = {
    where: ResearchPaperWhereUniqueInput
    create: XOR<ResearchPaperCreateWithoutAuthorsInput, ResearchPaperUncheckedCreateWithoutAuthorsInput>
  }

  export type ResearchPaperUpsertWithWhereUniqueWithoutAuthorsInput = {
    where: ResearchPaperWhereUniqueInput
    update: XOR<ResearchPaperUpdateWithoutAuthorsInput, ResearchPaperUncheckedUpdateWithoutAuthorsInput>
    create: XOR<ResearchPaperCreateWithoutAuthorsInput, ResearchPaperUncheckedCreateWithoutAuthorsInput>
  }

  export type ResearchPaperUpdateWithWhereUniqueWithoutAuthorsInput = {
    where: ResearchPaperWhereUniqueInput
    data: XOR<ResearchPaperUpdateWithoutAuthorsInput, ResearchPaperUncheckedUpdateWithoutAuthorsInput>
  }

  export type ResearchPaperUpdateManyWithWhereWithoutAuthorsInput = {
    where: ResearchPaperScalarWhereInput
    data: XOR<ResearchPaperUpdateManyMutationInput, ResearchPaperUncheckedUpdateManyWithoutAuthorsInput>
  }

  export type ResearchPaperScalarWhereInput = {
    AND?: ResearchPaperScalarWhereInput | ResearchPaperScalarWhereInput[]
    OR?: ResearchPaperScalarWhereInput[]
    NOT?: ResearchPaperScalarWhereInput | ResearchPaperScalarWhereInput[]
    id?: StringFilter<"ResearchPaper"> | string
    title?: StringFilter<"ResearchPaper"> | string
    publication?: StringNullableFilter<"ResearchPaper"> | string | null
    year?: IntNullableFilter<"ResearchPaper"> | number | null
    abstract?: StringNullableFilter<"ResearchPaper"> | string | null
    keywords?: StringNullableListFilter<"ResearchPaper">
    filePath?: StringNullableFilter<"ResearchPaper"> | string | null
    notes?: StringNullableFilter<"ResearchPaper"> | string | null
    createdAt?: DateTimeFilter<"ResearchPaper"> | Date | string
    updatedAt?: DateTimeFilter<"ResearchPaper"> | Date | string
  }

  export type ResearchPaperCreateWithoutCitationsInput = {
    id?: string
    title: string
    publication?: string | null
    year?: number | null
    abstract?: string | null
    keywords?: ResearchPaperCreatekeywordsInput | string[]
    filePath?: string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    authors?: AuthorCreateNestedManyWithoutPapersInput
  }

  export type ResearchPaperUncheckedCreateWithoutCitationsInput = {
    id?: string
    title: string
    publication?: string | null
    year?: number | null
    abstract?: string | null
    keywords?: ResearchPaperCreatekeywordsInput | string[]
    filePath?: string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    authors?: AuthorUncheckedCreateNestedManyWithoutPapersInput
  }

  export type ResearchPaperCreateOrConnectWithoutCitationsInput = {
    where: ResearchPaperWhereUniqueInput
    create: XOR<ResearchPaperCreateWithoutCitationsInput, ResearchPaperUncheckedCreateWithoutCitationsInput>
  }

  export type ResearchPaperUpsertWithoutCitationsInput = {
    update: XOR<ResearchPaperUpdateWithoutCitationsInput, ResearchPaperUncheckedUpdateWithoutCitationsInput>
    create: XOR<ResearchPaperCreateWithoutCitationsInput, ResearchPaperUncheckedCreateWithoutCitationsInput>
    where?: ResearchPaperWhereInput
  }

  export type ResearchPaperUpdateToOneWithWhereWithoutCitationsInput = {
    where?: ResearchPaperWhereInput
    data: XOR<ResearchPaperUpdateWithoutCitationsInput, ResearchPaperUncheckedUpdateWithoutCitationsInput>
  }

  export type ResearchPaperUpdateWithoutCitationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    publication?: NullableStringFieldUpdateOperationsInput | string | null
    year?: NullableIntFieldUpdateOperationsInput | number | null
    abstract?: NullableStringFieldUpdateOperationsInput | string | null
    keywords?: ResearchPaperUpdatekeywordsInput | string[]
    filePath?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    authors?: AuthorUpdateManyWithoutPapersNestedInput
  }

  export type ResearchPaperUncheckedUpdateWithoutCitationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    publication?: NullableStringFieldUpdateOperationsInput | string | null
    year?: NullableIntFieldUpdateOperationsInput | number | null
    abstract?: NullableStringFieldUpdateOperationsInput | string | null
    keywords?: ResearchPaperUpdatekeywordsInput | string[]
    filePath?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    authors?: AuthorUncheckedUpdateManyWithoutPapersNestedInput
  }

  export type CitationCreateManyResearchPaperInput = {
    id?: string
    key: string
    type: string
    fields: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AuthorUpdateWithoutPapersInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    middleName?: NullableStringFieldUpdateOperationsInput | string | null
    orcid?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuthorUncheckedUpdateWithoutPapersInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    middleName?: NullableStringFieldUpdateOperationsInput | string | null
    orcid?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuthorUncheckedUpdateManyWithoutPapersInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    middleName?: NullableStringFieldUpdateOperationsInput | string | null
    orcid?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CitationUpdateWithoutResearchPaperInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    fields?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CitationUncheckedUpdateWithoutResearchPaperInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    fields?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CitationUncheckedUpdateManyWithoutResearchPaperInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    fields?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ResearchPaperUpdateWithoutAuthorsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    publication?: NullableStringFieldUpdateOperationsInput | string | null
    year?: NullableIntFieldUpdateOperationsInput | number | null
    abstract?: NullableStringFieldUpdateOperationsInput | string | null
    keywords?: ResearchPaperUpdatekeywordsInput | string[]
    filePath?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    citations?: CitationUpdateManyWithoutResearchPaperNestedInput
  }

  export type ResearchPaperUncheckedUpdateWithoutAuthorsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    publication?: NullableStringFieldUpdateOperationsInput | string | null
    year?: NullableIntFieldUpdateOperationsInput | number | null
    abstract?: NullableStringFieldUpdateOperationsInput | string | null
    keywords?: ResearchPaperUpdatekeywordsInput | string[]
    filePath?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    citations?: CitationUncheckedUpdateManyWithoutResearchPaperNestedInput
  }

  export type ResearchPaperUncheckedUpdateManyWithoutAuthorsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    publication?: NullableStringFieldUpdateOperationsInput | string | null
    year?: NullableIntFieldUpdateOperationsInput | number | null
    abstract?: NullableStringFieldUpdateOperationsInput | string | null
    keywords?: ResearchPaperUpdatekeywordsInput | string[]
    filePath?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}