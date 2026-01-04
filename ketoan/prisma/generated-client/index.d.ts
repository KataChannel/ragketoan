
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
 * Model ext_congty
 * Thông tin công ty
 */
export type ext_congty = $Result.DefaultSelection<Prisma.$ext_congtyPayload>
/**
 * Model ext_listhoadon
 * Danh sách hóa đơn - Header
 */
export type ext_listhoadon = $Result.DefaultSelection<Prisma.$ext_listhoadonPayload>
/**
 * Model ext_detailhoadon
 * Chi tiết hóa đơn - Line items
 */
export type ext_detailhoadon = $Result.DefaultSelection<Prisma.$ext_detailhoadonPayload>
/**
 * Model ext_sanphamhoadon
 * Sản phẩm hóa đơn - Normalized products
 */
export type ext_sanphamhoadon = $Result.DefaultSelection<Prisma.$ext_sanphamhoadonPayload>
/**
 * Model ext_apiconfig
 * Cấu hình kết nối API Thuế - Mỗi công ty có config riêng
 */
export type ext_apiconfig = $Result.DefaultSelection<Prisma.$ext_apiconfigPayload>
/**
 * Model ext_synclog
 * Log đồng bộ
 */
export type ext_synclog = $Result.DefaultSelection<Prisma.$ext_synclogPayload>
/**
 * Model ext_tonghop
 * Tổng hợp chi tiết hàng hóa - Denormalized view for RAG & inventory
 */
export type ext_tonghop = $Result.DefaultSelection<Prisma.$ext_tonghopPayload>
/**
 * Model ext_sanpham_dictionary
 * Từ điển chuẩn hóa mặt hàng (Training data)
 */
export type ext_sanpham_dictionary = $Result.DefaultSelection<Prisma.$ext_sanpham_dictionaryPayload>
/**
 * Model ext_daily_stock_v2
 * Bảng lưu trữ tồn kho hàng ngày để tăng tốc báo cáo
 */
export type ext_daily_stock_v2 = $Result.DefaultSelection<Prisma.$ext_daily_stock_v2Payload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Ext_congties
 * const ext_congties = await prisma.ext_congty.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
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
   * // Fetch zero or more Ext_congties
   * const ext_congties = await prisma.ext_congty.findMany()
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
   * `prisma.ext_congty`: Exposes CRUD operations for the **ext_congty** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Ext_congties
    * const ext_congties = await prisma.ext_congty.findMany()
    * ```
    */
  get ext_congty(): Prisma.ext_congtyDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ext_listhoadon`: Exposes CRUD operations for the **ext_listhoadon** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Ext_listhoadons
    * const ext_listhoadons = await prisma.ext_listhoadon.findMany()
    * ```
    */
  get ext_listhoadon(): Prisma.ext_listhoadonDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ext_detailhoadon`: Exposes CRUD operations for the **ext_detailhoadon** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Ext_detailhoadons
    * const ext_detailhoadons = await prisma.ext_detailhoadon.findMany()
    * ```
    */
  get ext_detailhoadon(): Prisma.ext_detailhoadonDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ext_sanphamhoadon`: Exposes CRUD operations for the **ext_sanphamhoadon** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Ext_sanphamhoadons
    * const ext_sanphamhoadons = await prisma.ext_sanphamhoadon.findMany()
    * ```
    */
  get ext_sanphamhoadon(): Prisma.ext_sanphamhoadonDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ext_apiconfig`: Exposes CRUD operations for the **ext_apiconfig** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Ext_apiconfigs
    * const ext_apiconfigs = await prisma.ext_apiconfig.findMany()
    * ```
    */
  get ext_apiconfig(): Prisma.ext_apiconfigDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ext_synclog`: Exposes CRUD operations for the **ext_synclog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Ext_synclogs
    * const ext_synclogs = await prisma.ext_synclog.findMany()
    * ```
    */
  get ext_synclog(): Prisma.ext_synclogDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ext_tonghop`: Exposes CRUD operations for the **ext_tonghop** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Ext_tonghops
    * const ext_tonghops = await prisma.ext_tonghop.findMany()
    * ```
    */
  get ext_tonghop(): Prisma.ext_tonghopDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ext_sanpham_dictionary`: Exposes CRUD operations for the **ext_sanpham_dictionary** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Ext_sanpham_dictionaries
    * const ext_sanpham_dictionaries = await prisma.ext_sanpham_dictionary.findMany()
    * ```
    */
  get ext_sanpham_dictionary(): Prisma.ext_sanpham_dictionaryDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ext_daily_stock_v2`: Exposes CRUD operations for the **ext_daily_stock_v2** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Ext_daily_stock_v2s
    * const ext_daily_stock_v2s = await prisma.ext_daily_stock_v2.findMany()
    * ```
    */
  get ext_daily_stock_v2(): Prisma.ext_daily_stock_v2Delegate<ExtArgs, ClientOptions>;
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
   * Prisma Client JS version: 6.19.0
   * Query Engine version: 2ba551f319ab1df4bc874a89965d8b3641056773
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
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
    ext_congty: 'ext_congty',
    ext_listhoadon: 'ext_listhoadon',
    ext_detailhoadon: 'ext_detailhoadon',
    ext_sanphamhoadon: 'ext_sanphamhoadon',
    ext_apiconfig: 'ext_apiconfig',
    ext_synclog: 'ext_synclog',
    ext_tonghop: 'ext_tonghop',
    ext_sanpham_dictionary: 'ext_sanpham_dictionary',
    ext_daily_stock_v2: 'ext_daily_stock_v2'
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
      modelProps: "ext_congty" | "ext_listhoadon" | "ext_detailhoadon" | "ext_sanphamhoadon" | "ext_apiconfig" | "ext_synclog" | "ext_tonghop" | "ext_sanpham_dictionary" | "ext_daily_stock_v2"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      ext_congty: {
        payload: Prisma.$ext_congtyPayload<ExtArgs>
        fields: Prisma.ext_congtyFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ext_congtyFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_congtyPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ext_congtyFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_congtyPayload>
          }
          findFirst: {
            args: Prisma.ext_congtyFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_congtyPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ext_congtyFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_congtyPayload>
          }
          findMany: {
            args: Prisma.ext_congtyFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_congtyPayload>[]
          }
          create: {
            args: Prisma.ext_congtyCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_congtyPayload>
          }
          createMany: {
            args: Prisma.ext_congtyCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ext_congtyCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_congtyPayload>[]
          }
          delete: {
            args: Prisma.ext_congtyDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_congtyPayload>
          }
          update: {
            args: Prisma.ext_congtyUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_congtyPayload>
          }
          deleteMany: {
            args: Prisma.ext_congtyDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ext_congtyUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ext_congtyUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_congtyPayload>[]
          }
          upsert: {
            args: Prisma.ext_congtyUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_congtyPayload>
          }
          aggregate: {
            args: Prisma.Ext_congtyAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateExt_congty>
          }
          groupBy: {
            args: Prisma.ext_congtyGroupByArgs<ExtArgs>
            result: $Utils.Optional<Ext_congtyGroupByOutputType>[]
          }
          count: {
            args: Prisma.ext_congtyCountArgs<ExtArgs>
            result: $Utils.Optional<Ext_congtyCountAggregateOutputType> | number
          }
        }
      }
      ext_listhoadon: {
        payload: Prisma.$ext_listhoadonPayload<ExtArgs>
        fields: Prisma.ext_listhoadonFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ext_listhoadonFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_listhoadonPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ext_listhoadonFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_listhoadonPayload>
          }
          findFirst: {
            args: Prisma.ext_listhoadonFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_listhoadonPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ext_listhoadonFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_listhoadonPayload>
          }
          findMany: {
            args: Prisma.ext_listhoadonFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_listhoadonPayload>[]
          }
          create: {
            args: Prisma.ext_listhoadonCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_listhoadonPayload>
          }
          createMany: {
            args: Prisma.ext_listhoadonCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ext_listhoadonCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_listhoadonPayload>[]
          }
          delete: {
            args: Prisma.ext_listhoadonDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_listhoadonPayload>
          }
          update: {
            args: Prisma.ext_listhoadonUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_listhoadonPayload>
          }
          deleteMany: {
            args: Prisma.ext_listhoadonDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ext_listhoadonUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ext_listhoadonUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_listhoadonPayload>[]
          }
          upsert: {
            args: Prisma.ext_listhoadonUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_listhoadonPayload>
          }
          aggregate: {
            args: Prisma.Ext_listhoadonAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateExt_listhoadon>
          }
          groupBy: {
            args: Prisma.ext_listhoadonGroupByArgs<ExtArgs>
            result: $Utils.Optional<Ext_listhoadonGroupByOutputType>[]
          }
          count: {
            args: Prisma.ext_listhoadonCountArgs<ExtArgs>
            result: $Utils.Optional<Ext_listhoadonCountAggregateOutputType> | number
          }
        }
      }
      ext_detailhoadon: {
        payload: Prisma.$ext_detailhoadonPayload<ExtArgs>
        fields: Prisma.ext_detailhoadonFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ext_detailhoadonFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_detailhoadonPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ext_detailhoadonFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_detailhoadonPayload>
          }
          findFirst: {
            args: Prisma.ext_detailhoadonFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_detailhoadonPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ext_detailhoadonFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_detailhoadonPayload>
          }
          findMany: {
            args: Prisma.ext_detailhoadonFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_detailhoadonPayload>[]
          }
          create: {
            args: Prisma.ext_detailhoadonCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_detailhoadonPayload>
          }
          createMany: {
            args: Prisma.ext_detailhoadonCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ext_detailhoadonCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_detailhoadonPayload>[]
          }
          delete: {
            args: Prisma.ext_detailhoadonDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_detailhoadonPayload>
          }
          update: {
            args: Prisma.ext_detailhoadonUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_detailhoadonPayload>
          }
          deleteMany: {
            args: Prisma.ext_detailhoadonDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ext_detailhoadonUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ext_detailhoadonUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_detailhoadonPayload>[]
          }
          upsert: {
            args: Prisma.ext_detailhoadonUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_detailhoadonPayload>
          }
          aggregate: {
            args: Prisma.Ext_detailhoadonAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateExt_detailhoadon>
          }
          groupBy: {
            args: Prisma.ext_detailhoadonGroupByArgs<ExtArgs>
            result: $Utils.Optional<Ext_detailhoadonGroupByOutputType>[]
          }
          count: {
            args: Prisma.ext_detailhoadonCountArgs<ExtArgs>
            result: $Utils.Optional<Ext_detailhoadonCountAggregateOutputType> | number
          }
        }
      }
      ext_sanphamhoadon: {
        payload: Prisma.$ext_sanphamhoadonPayload<ExtArgs>
        fields: Prisma.ext_sanphamhoadonFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ext_sanphamhoadonFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_sanphamhoadonPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ext_sanphamhoadonFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_sanphamhoadonPayload>
          }
          findFirst: {
            args: Prisma.ext_sanphamhoadonFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_sanphamhoadonPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ext_sanphamhoadonFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_sanphamhoadonPayload>
          }
          findMany: {
            args: Prisma.ext_sanphamhoadonFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_sanphamhoadonPayload>[]
          }
          create: {
            args: Prisma.ext_sanphamhoadonCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_sanphamhoadonPayload>
          }
          createMany: {
            args: Prisma.ext_sanphamhoadonCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ext_sanphamhoadonCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_sanphamhoadonPayload>[]
          }
          delete: {
            args: Prisma.ext_sanphamhoadonDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_sanphamhoadonPayload>
          }
          update: {
            args: Prisma.ext_sanphamhoadonUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_sanphamhoadonPayload>
          }
          deleteMany: {
            args: Prisma.ext_sanphamhoadonDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ext_sanphamhoadonUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ext_sanphamhoadonUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_sanphamhoadonPayload>[]
          }
          upsert: {
            args: Prisma.ext_sanphamhoadonUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_sanphamhoadonPayload>
          }
          aggregate: {
            args: Prisma.Ext_sanphamhoadonAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateExt_sanphamhoadon>
          }
          groupBy: {
            args: Prisma.ext_sanphamhoadonGroupByArgs<ExtArgs>
            result: $Utils.Optional<Ext_sanphamhoadonGroupByOutputType>[]
          }
          count: {
            args: Prisma.ext_sanphamhoadonCountArgs<ExtArgs>
            result: $Utils.Optional<Ext_sanphamhoadonCountAggregateOutputType> | number
          }
        }
      }
      ext_apiconfig: {
        payload: Prisma.$ext_apiconfigPayload<ExtArgs>
        fields: Prisma.ext_apiconfigFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ext_apiconfigFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_apiconfigPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ext_apiconfigFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_apiconfigPayload>
          }
          findFirst: {
            args: Prisma.ext_apiconfigFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_apiconfigPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ext_apiconfigFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_apiconfigPayload>
          }
          findMany: {
            args: Prisma.ext_apiconfigFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_apiconfigPayload>[]
          }
          create: {
            args: Prisma.ext_apiconfigCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_apiconfigPayload>
          }
          createMany: {
            args: Prisma.ext_apiconfigCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ext_apiconfigCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_apiconfigPayload>[]
          }
          delete: {
            args: Prisma.ext_apiconfigDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_apiconfigPayload>
          }
          update: {
            args: Prisma.ext_apiconfigUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_apiconfigPayload>
          }
          deleteMany: {
            args: Prisma.ext_apiconfigDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ext_apiconfigUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ext_apiconfigUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_apiconfigPayload>[]
          }
          upsert: {
            args: Prisma.ext_apiconfigUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_apiconfigPayload>
          }
          aggregate: {
            args: Prisma.Ext_apiconfigAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateExt_apiconfig>
          }
          groupBy: {
            args: Prisma.ext_apiconfigGroupByArgs<ExtArgs>
            result: $Utils.Optional<Ext_apiconfigGroupByOutputType>[]
          }
          count: {
            args: Prisma.ext_apiconfigCountArgs<ExtArgs>
            result: $Utils.Optional<Ext_apiconfigCountAggregateOutputType> | number
          }
        }
      }
      ext_synclog: {
        payload: Prisma.$ext_synclogPayload<ExtArgs>
        fields: Prisma.ext_synclogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ext_synclogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_synclogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ext_synclogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_synclogPayload>
          }
          findFirst: {
            args: Prisma.ext_synclogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_synclogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ext_synclogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_synclogPayload>
          }
          findMany: {
            args: Prisma.ext_synclogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_synclogPayload>[]
          }
          create: {
            args: Prisma.ext_synclogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_synclogPayload>
          }
          createMany: {
            args: Prisma.ext_synclogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ext_synclogCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_synclogPayload>[]
          }
          delete: {
            args: Prisma.ext_synclogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_synclogPayload>
          }
          update: {
            args: Prisma.ext_synclogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_synclogPayload>
          }
          deleteMany: {
            args: Prisma.ext_synclogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ext_synclogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ext_synclogUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_synclogPayload>[]
          }
          upsert: {
            args: Prisma.ext_synclogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_synclogPayload>
          }
          aggregate: {
            args: Prisma.Ext_synclogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateExt_synclog>
          }
          groupBy: {
            args: Prisma.ext_synclogGroupByArgs<ExtArgs>
            result: $Utils.Optional<Ext_synclogGroupByOutputType>[]
          }
          count: {
            args: Prisma.ext_synclogCountArgs<ExtArgs>
            result: $Utils.Optional<Ext_synclogCountAggregateOutputType> | number
          }
        }
      }
      ext_tonghop: {
        payload: Prisma.$ext_tonghopPayload<ExtArgs>
        fields: Prisma.ext_tonghopFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ext_tonghopFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_tonghopPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ext_tonghopFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_tonghopPayload>
          }
          findFirst: {
            args: Prisma.ext_tonghopFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_tonghopPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ext_tonghopFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_tonghopPayload>
          }
          findMany: {
            args: Prisma.ext_tonghopFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_tonghopPayload>[]
          }
          create: {
            args: Prisma.ext_tonghopCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_tonghopPayload>
          }
          createMany: {
            args: Prisma.ext_tonghopCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ext_tonghopCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_tonghopPayload>[]
          }
          delete: {
            args: Prisma.ext_tonghopDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_tonghopPayload>
          }
          update: {
            args: Prisma.ext_tonghopUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_tonghopPayload>
          }
          deleteMany: {
            args: Prisma.ext_tonghopDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ext_tonghopUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ext_tonghopUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_tonghopPayload>[]
          }
          upsert: {
            args: Prisma.ext_tonghopUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_tonghopPayload>
          }
          aggregate: {
            args: Prisma.Ext_tonghopAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateExt_tonghop>
          }
          groupBy: {
            args: Prisma.ext_tonghopGroupByArgs<ExtArgs>
            result: $Utils.Optional<Ext_tonghopGroupByOutputType>[]
          }
          count: {
            args: Prisma.ext_tonghopCountArgs<ExtArgs>
            result: $Utils.Optional<Ext_tonghopCountAggregateOutputType> | number
          }
        }
      }
      ext_sanpham_dictionary: {
        payload: Prisma.$ext_sanpham_dictionaryPayload<ExtArgs>
        fields: Prisma.ext_sanpham_dictionaryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ext_sanpham_dictionaryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_sanpham_dictionaryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ext_sanpham_dictionaryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_sanpham_dictionaryPayload>
          }
          findFirst: {
            args: Prisma.ext_sanpham_dictionaryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_sanpham_dictionaryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ext_sanpham_dictionaryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_sanpham_dictionaryPayload>
          }
          findMany: {
            args: Prisma.ext_sanpham_dictionaryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_sanpham_dictionaryPayload>[]
          }
          create: {
            args: Prisma.ext_sanpham_dictionaryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_sanpham_dictionaryPayload>
          }
          createMany: {
            args: Prisma.ext_sanpham_dictionaryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ext_sanpham_dictionaryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_sanpham_dictionaryPayload>[]
          }
          delete: {
            args: Prisma.ext_sanpham_dictionaryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_sanpham_dictionaryPayload>
          }
          update: {
            args: Prisma.ext_sanpham_dictionaryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_sanpham_dictionaryPayload>
          }
          deleteMany: {
            args: Prisma.ext_sanpham_dictionaryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ext_sanpham_dictionaryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ext_sanpham_dictionaryUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_sanpham_dictionaryPayload>[]
          }
          upsert: {
            args: Prisma.ext_sanpham_dictionaryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_sanpham_dictionaryPayload>
          }
          aggregate: {
            args: Prisma.Ext_sanpham_dictionaryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateExt_sanpham_dictionary>
          }
          groupBy: {
            args: Prisma.ext_sanpham_dictionaryGroupByArgs<ExtArgs>
            result: $Utils.Optional<Ext_sanpham_dictionaryGroupByOutputType>[]
          }
          count: {
            args: Prisma.ext_sanpham_dictionaryCountArgs<ExtArgs>
            result: $Utils.Optional<Ext_sanpham_dictionaryCountAggregateOutputType> | number
          }
        }
      }
      ext_daily_stock_v2: {
        payload: Prisma.$ext_daily_stock_v2Payload<ExtArgs>
        fields: Prisma.ext_daily_stock_v2FieldRefs
        operations: {
          findUnique: {
            args: Prisma.ext_daily_stock_v2FindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_daily_stock_v2Payload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ext_daily_stock_v2FindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_daily_stock_v2Payload>
          }
          findFirst: {
            args: Prisma.ext_daily_stock_v2FindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_daily_stock_v2Payload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ext_daily_stock_v2FindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_daily_stock_v2Payload>
          }
          findMany: {
            args: Prisma.ext_daily_stock_v2FindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_daily_stock_v2Payload>[]
          }
          create: {
            args: Prisma.ext_daily_stock_v2CreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_daily_stock_v2Payload>
          }
          createMany: {
            args: Prisma.ext_daily_stock_v2CreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ext_daily_stock_v2CreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_daily_stock_v2Payload>[]
          }
          delete: {
            args: Prisma.ext_daily_stock_v2DeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_daily_stock_v2Payload>
          }
          update: {
            args: Prisma.ext_daily_stock_v2UpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_daily_stock_v2Payload>
          }
          deleteMany: {
            args: Prisma.ext_daily_stock_v2DeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ext_daily_stock_v2UpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ext_daily_stock_v2UpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_daily_stock_v2Payload>[]
          }
          upsert: {
            args: Prisma.ext_daily_stock_v2UpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ext_daily_stock_v2Payload>
          }
          aggregate: {
            args: Prisma.Ext_daily_stock_v2AggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateExt_daily_stock_v2>
          }
          groupBy: {
            args: Prisma.ext_daily_stock_v2GroupByArgs<ExtArgs>
            result: $Utils.Optional<Ext_daily_stock_v2GroupByOutputType>[]
          }
          count: {
            args: Prisma.ext_daily_stock_v2CountArgs<ExtArgs>
            result: $Utils.Optional<Ext_daily_stock_v2CountAggregateOutputType> | number
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
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
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
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
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
    ext_congty?: ext_congtyOmit
    ext_listhoadon?: ext_listhoadonOmit
    ext_detailhoadon?: ext_detailhoadonOmit
    ext_sanphamhoadon?: ext_sanphamhoadonOmit
    ext_apiconfig?: ext_apiconfigOmit
    ext_synclog?: ext_synclogOmit
    ext_tonghop?: ext_tonghopOmit
    ext_sanpham_dictionary?: ext_sanpham_dictionaryOmit
    ext_daily_stock_v2?: ext_daily_stock_v2Omit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

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
   * Count Type Ext_congtyCountOutputType
   */

  export type Ext_congtyCountOutputType = {
    apiConfigs: number
    hoadons: number
    synclogs: number
  }

  export type Ext_congtyCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    apiConfigs?: boolean | Ext_congtyCountOutputTypeCountApiConfigsArgs
    hoadons?: boolean | Ext_congtyCountOutputTypeCountHoadonsArgs
    synclogs?: boolean | Ext_congtyCountOutputTypeCountSynclogsArgs
  }

  // Custom InputTypes
  /**
   * Ext_congtyCountOutputType without action
   */
  export type Ext_congtyCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ext_congtyCountOutputType
     */
    select?: Ext_congtyCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * Ext_congtyCountOutputType without action
   */
  export type Ext_congtyCountOutputTypeCountApiConfigsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ext_apiconfigWhereInput
  }

  /**
   * Ext_congtyCountOutputType without action
   */
  export type Ext_congtyCountOutputTypeCountHoadonsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ext_listhoadonWhereInput
  }

  /**
   * Ext_congtyCountOutputType without action
   */
  export type Ext_congtyCountOutputTypeCountSynclogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ext_synclogWhereInput
  }


  /**
   * Count Type Ext_listhoadonCountOutputType
   */

  export type Ext_listhoadonCountOutputType = {
    details: number
  }

  export type Ext_listhoadonCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    details?: boolean | Ext_listhoadonCountOutputTypeCountDetailsArgs
  }

  // Custom InputTypes
  /**
   * Ext_listhoadonCountOutputType without action
   */
  export type Ext_listhoadonCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ext_listhoadonCountOutputType
     */
    select?: Ext_listhoadonCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * Ext_listhoadonCountOutputType without action
   */
  export type Ext_listhoadonCountOutputTypeCountDetailsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ext_detailhoadonWhereInput
  }


  /**
   * Count Type Ext_detailhoadonCountOutputType
   */

  export type Ext_detailhoadonCountOutputType = {
    products: number
  }

  export type Ext_detailhoadonCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    products?: boolean | Ext_detailhoadonCountOutputTypeCountProductsArgs
  }

  // Custom InputTypes
  /**
   * Ext_detailhoadonCountOutputType without action
   */
  export type Ext_detailhoadonCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ext_detailhoadonCountOutputType
     */
    select?: Ext_detailhoadonCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * Ext_detailhoadonCountOutputType without action
   */
  export type Ext_detailhoadonCountOutputTypeCountProductsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ext_sanphamhoadonWhereInput
  }


  /**
   * Count Type Ext_apiconfigCountOutputType
   */

  export type Ext_apiconfigCountOutputType = {
    synclogs: number
  }

  export type Ext_apiconfigCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    synclogs?: boolean | Ext_apiconfigCountOutputTypeCountSynclogsArgs
  }

  // Custom InputTypes
  /**
   * Ext_apiconfigCountOutputType without action
   */
  export type Ext_apiconfigCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ext_apiconfigCountOutputType
     */
    select?: Ext_apiconfigCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * Ext_apiconfigCountOutputType without action
   */
  export type Ext_apiconfigCountOutputTypeCountSynclogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ext_synclogWhereInput
  }


  /**
   * Models
   */

  /**
   * Model ext_congty
   */

  export type AggregateExt_congty = {
    _count: Ext_congtyCountAggregateOutputType | null
    _min: Ext_congtyMinAggregateOutputType | null
    _max: Ext_congtyMaxAggregateOutputType | null
  }

  export type Ext_congtyMinAggregateOutputType = {
    id: string | null
    mst: string | null
    ten: string | null
    tenVietTat: string | null
    diaChi: string | null
    dienThoai: string | null
    email: string | null
    nguoiDaiDien: string | null
    isActive: boolean | null
    isDefault: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type Ext_congtyMaxAggregateOutputType = {
    id: string | null
    mst: string | null
    ten: string | null
    tenVietTat: string | null
    diaChi: string | null
    dienThoai: string | null
    email: string | null
    nguoiDaiDien: string | null
    isActive: boolean | null
    isDefault: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type Ext_congtyCountAggregateOutputType = {
    id: number
    mst: number
    ten: number
    tenVietTat: number
    diaChi: number
    dienThoai: number
    email: number
    nguoiDaiDien: number
    isActive: number
    isDefault: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type Ext_congtyMinAggregateInputType = {
    id?: true
    mst?: true
    ten?: true
    tenVietTat?: true
    diaChi?: true
    dienThoai?: true
    email?: true
    nguoiDaiDien?: true
    isActive?: true
    isDefault?: true
    createdAt?: true
    updatedAt?: true
  }

  export type Ext_congtyMaxAggregateInputType = {
    id?: true
    mst?: true
    ten?: true
    tenVietTat?: true
    diaChi?: true
    dienThoai?: true
    email?: true
    nguoiDaiDien?: true
    isActive?: true
    isDefault?: true
    createdAt?: true
    updatedAt?: true
  }

  export type Ext_congtyCountAggregateInputType = {
    id?: true
    mst?: true
    ten?: true
    tenVietTat?: true
    diaChi?: true
    dienThoai?: true
    email?: true
    nguoiDaiDien?: true
    isActive?: true
    isDefault?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type Ext_congtyAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ext_congty to aggregate.
     */
    where?: ext_congtyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ext_congties to fetch.
     */
    orderBy?: ext_congtyOrderByWithRelationInput | ext_congtyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ext_congtyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ext_congties from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ext_congties.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ext_congties
    **/
    _count?: true | Ext_congtyCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Ext_congtyMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Ext_congtyMaxAggregateInputType
  }

  export type GetExt_congtyAggregateType<T extends Ext_congtyAggregateArgs> = {
        [P in keyof T & keyof AggregateExt_congty]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateExt_congty[P]>
      : GetScalarType<T[P], AggregateExt_congty[P]>
  }




  export type ext_congtyGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ext_congtyWhereInput
    orderBy?: ext_congtyOrderByWithAggregationInput | ext_congtyOrderByWithAggregationInput[]
    by: Ext_congtyScalarFieldEnum[] | Ext_congtyScalarFieldEnum
    having?: ext_congtyScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Ext_congtyCountAggregateInputType | true
    _min?: Ext_congtyMinAggregateInputType
    _max?: Ext_congtyMaxAggregateInputType
  }

  export type Ext_congtyGroupByOutputType = {
    id: string
    mst: string
    ten: string
    tenVietTat: string | null
    diaChi: string | null
    dienThoai: string | null
    email: string | null
    nguoiDaiDien: string | null
    isActive: boolean
    isDefault: boolean
    createdAt: Date
    updatedAt: Date
    _count: Ext_congtyCountAggregateOutputType | null
    _min: Ext_congtyMinAggregateOutputType | null
    _max: Ext_congtyMaxAggregateOutputType | null
  }

  type GetExt_congtyGroupByPayload<T extends ext_congtyGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Ext_congtyGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Ext_congtyGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Ext_congtyGroupByOutputType[P]>
            : GetScalarType<T[P], Ext_congtyGroupByOutputType[P]>
        }
      >
    >


  export type ext_congtySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    mst?: boolean
    ten?: boolean
    tenVietTat?: boolean
    diaChi?: boolean
    dienThoai?: boolean
    email?: boolean
    nguoiDaiDien?: boolean
    isActive?: boolean
    isDefault?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    apiConfigs?: boolean | ext_congty$apiConfigsArgs<ExtArgs>
    hoadons?: boolean | ext_congty$hoadonsArgs<ExtArgs>
    synclogs?: boolean | ext_congty$synclogsArgs<ExtArgs>
    _count?: boolean | Ext_congtyCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ext_congty"]>

  export type ext_congtySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    mst?: boolean
    ten?: boolean
    tenVietTat?: boolean
    diaChi?: boolean
    dienThoai?: boolean
    email?: boolean
    nguoiDaiDien?: boolean
    isActive?: boolean
    isDefault?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["ext_congty"]>

  export type ext_congtySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    mst?: boolean
    ten?: boolean
    tenVietTat?: boolean
    diaChi?: boolean
    dienThoai?: boolean
    email?: boolean
    nguoiDaiDien?: boolean
    isActive?: boolean
    isDefault?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["ext_congty"]>

  export type ext_congtySelectScalar = {
    id?: boolean
    mst?: boolean
    ten?: boolean
    tenVietTat?: boolean
    diaChi?: boolean
    dienThoai?: boolean
    email?: boolean
    nguoiDaiDien?: boolean
    isActive?: boolean
    isDefault?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ext_congtyOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "mst" | "ten" | "tenVietTat" | "diaChi" | "dienThoai" | "email" | "nguoiDaiDien" | "isActive" | "isDefault" | "createdAt" | "updatedAt", ExtArgs["result"]["ext_congty"]>
  export type ext_congtyInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    apiConfigs?: boolean | ext_congty$apiConfigsArgs<ExtArgs>
    hoadons?: boolean | ext_congty$hoadonsArgs<ExtArgs>
    synclogs?: boolean | ext_congty$synclogsArgs<ExtArgs>
    _count?: boolean | Ext_congtyCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ext_congtyIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type ext_congtyIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $ext_congtyPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ext_congty"
    objects: {
      apiConfigs: Prisma.$ext_apiconfigPayload<ExtArgs>[]
      hoadons: Prisma.$ext_listhoadonPayload<ExtArgs>[]
      synclogs: Prisma.$ext_synclogPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      mst: string
      ten: string
      tenVietTat: string | null
      diaChi: string | null
      dienThoai: string | null
      email: string | null
      nguoiDaiDien: string | null
      isActive: boolean
      isDefault: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["ext_congty"]>
    composites: {}
  }

  type ext_congtyGetPayload<S extends boolean | null | undefined | ext_congtyDefaultArgs> = $Result.GetResult<Prisma.$ext_congtyPayload, S>

  type ext_congtyCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ext_congtyFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Ext_congtyCountAggregateInputType | true
    }

  export interface ext_congtyDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ext_congty'], meta: { name: 'ext_congty' } }
    /**
     * Find zero or one Ext_congty that matches the filter.
     * @param {ext_congtyFindUniqueArgs} args - Arguments to find a Ext_congty
     * @example
     * // Get one Ext_congty
     * const ext_congty = await prisma.ext_congty.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ext_congtyFindUniqueArgs>(args: SelectSubset<T, ext_congtyFindUniqueArgs<ExtArgs>>): Prisma__ext_congtyClient<$Result.GetResult<Prisma.$ext_congtyPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Ext_congty that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ext_congtyFindUniqueOrThrowArgs} args - Arguments to find a Ext_congty
     * @example
     * // Get one Ext_congty
     * const ext_congty = await prisma.ext_congty.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ext_congtyFindUniqueOrThrowArgs>(args: SelectSubset<T, ext_congtyFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ext_congtyClient<$Result.GetResult<Prisma.$ext_congtyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ext_congty that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_congtyFindFirstArgs} args - Arguments to find a Ext_congty
     * @example
     * // Get one Ext_congty
     * const ext_congty = await prisma.ext_congty.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ext_congtyFindFirstArgs>(args?: SelectSubset<T, ext_congtyFindFirstArgs<ExtArgs>>): Prisma__ext_congtyClient<$Result.GetResult<Prisma.$ext_congtyPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ext_congty that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_congtyFindFirstOrThrowArgs} args - Arguments to find a Ext_congty
     * @example
     * // Get one Ext_congty
     * const ext_congty = await prisma.ext_congty.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ext_congtyFindFirstOrThrowArgs>(args?: SelectSubset<T, ext_congtyFindFirstOrThrowArgs<ExtArgs>>): Prisma__ext_congtyClient<$Result.GetResult<Prisma.$ext_congtyPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Ext_congties that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_congtyFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Ext_congties
     * const ext_congties = await prisma.ext_congty.findMany()
     * 
     * // Get first 10 Ext_congties
     * const ext_congties = await prisma.ext_congty.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const ext_congtyWithIdOnly = await prisma.ext_congty.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ext_congtyFindManyArgs>(args?: SelectSubset<T, ext_congtyFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ext_congtyPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Ext_congty.
     * @param {ext_congtyCreateArgs} args - Arguments to create a Ext_congty.
     * @example
     * // Create one Ext_congty
     * const Ext_congty = await prisma.ext_congty.create({
     *   data: {
     *     // ... data to create a Ext_congty
     *   }
     * })
     * 
     */
    create<T extends ext_congtyCreateArgs>(args: SelectSubset<T, ext_congtyCreateArgs<ExtArgs>>): Prisma__ext_congtyClient<$Result.GetResult<Prisma.$ext_congtyPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Ext_congties.
     * @param {ext_congtyCreateManyArgs} args - Arguments to create many Ext_congties.
     * @example
     * // Create many Ext_congties
     * const ext_congty = await prisma.ext_congty.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ext_congtyCreateManyArgs>(args?: SelectSubset<T, ext_congtyCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Ext_congties and returns the data saved in the database.
     * @param {ext_congtyCreateManyAndReturnArgs} args - Arguments to create many Ext_congties.
     * @example
     * // Create many Ext_congties
     * const ext_congty = await prisma.ext_congty.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Ext_congties and only return the `id`
     * const ext_congtyWithIdOnly = await prisma.ext_congty.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ext_congtyCreateManyAndReturnArgs>(args?: SelectSubset<T, ext_congtyCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ext_congtyPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Ext_congty.
     * @param {ext_congtyDeleteArgs} args - Arguments to delete one Ext_congty.
     * @example
     * // Delete one Ext_congty
     * const Ext_congty = await prisma.ext_congty.delete({
     *   where: {
     *     // ... filter to delete one Ext_congty
     *   }
     * })
     * 
     */
    delete<T extends ext_congtyDeleteArgs>(args: SelectSubset<T, ext_congtyDeleteArgs<ExtArgs>>): Prisma__ext_congtyClient<$Result.GetResult<Prisma.$ext_congtyPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Ext_congty.
     * @param {ext_congtyUpdateArgs} args - Arguments to update one Ext_congty.
     * @example
     * // Update one Ext_congty
     * const ext_congty = await prisma.ext_congty.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ext_congtyUpdateArgs>(args: SelectSubset<T, ext_congtyUpdateArgs<ExtArgs>>): Prisma__ext_congtyClient<$Result.GetResult<Prisma.$ext_congtyPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Ext_congties.
     * @param {ext_congtyDeleteManyArgs} args - Arguments to filter Ext_congties to delete.
     * @example
     * // Delete a few Ext_congties
     * const { count } = await prisma.ext_congty.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ext_congtyDeleteManyArgs>(args?: SelectSubset<T, ext_congtyDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ext_congties.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_congtyUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Ext_congties
     * const ext_congty = await prisma.ext_congty.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ext_congtyUpdateManyArgs>(args: SelectSubset<T, ext_congtyUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ext_congties and returns the data updated in the database.
     * @param {ext_congtyUpdateManyAndReturnArgs} args - Arguments to update many Ext_congties.
     * @example
     * // Update many Ext_congties
     * const ext_congty = await prisma.ext_congty.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Ext_congties and only return the `id`
     * const ext_congtyWithIdOnly = await prisma.ext_congty.updateManyAndReturn({
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
    updateManyAndReturn<T extends ext_congtyUpdateManyAndReturnArgs>(args: SelectSubset<T, ext_congtyUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ext_congtyPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Ext_congty.
     * @param {ext_congtyUpsertArgs} args - Arguments to update or create a Ext_congty.
     * @example
     * // Update or create a Ext_congty
     * const ext_congty = await prisma.ext_congty.upsert({
     *   create: {
     *     // ... data to create a Ext_congty
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Ext_congty we want to update
     *   }
     * })
     */
    upsert<T extends ext_congtyUpsertArgs>(args: SelectSubset<T, ext_congtyUpsertArgs<ExtArgs>>): Prisma__ext_congtyClient<$Result.GetResult<Prisma.$ext_congtyPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Ext_congties.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_congtyCountArgs} args - Arguments to filter Ext_congties to count.
     * @example
     * // Count the number of Ext_congties
     * const count = await prisma.ext_congty.count({
     *   where: {
     *     // ... the filter for the Ext_congties we want to count
     *   }
     * })
    **/
    count<T extends ext_congtyCountArgs>(
      args?: Subset<T, ext_congtyCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Ext_congtyCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Ext_congty.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Ext_congtyAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Ext_congtyAggregateArgs>(args: Subset<T, Ext_congtyAggregateArgs>): Prisma.PrismaPromise<GetExt_congtyAggregateType<T>>

    /**
     * Group by Ext_congty.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_congtyGroupByArgs} args - Group by arguments.
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
      T extends ext_congtyGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ext_congtyGroupByArgs['orderBy'] }
        : { orderBy?: ext_congtyGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ext_congtyGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetExt_congtyGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ext_congty model
   */
  readonly fields: ext_congtyFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ext_congty.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ext_congtyClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    apiConfigs<T extends ext_congty$apiConfigsArgs<ExtArgs> = {}>(args?: Subset<T, ext_congty$apiConfigsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ext_apiconfigPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    hoadons<T extends ext_congty$hoadonsArgs<ExtArgs> = {}>(args?: Subset<T, ext_congty$hoadonsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ext_listhoadonPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    synclogs<T extends ext_congty$synclogsArgs<ExtArgs> = {}>(args?: Subset<T, ext_congty$synclogsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ext_synclogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the ext_congty model
   */
  interface ext_congtyFieldRefs {
    readonly id: FieldRef<"ext_congty", 'String'>
    readonly mst: FieldRef<"ext_congty", 'String'>
    readonly ten: FieldRef<"ext_congty", 'String'>
    readonly tenVietTat: FieldRef<"ext_congty", 'String'>
    readonly diaChi: FieldRef<"ext_congty", 'String'>
    readonly dienThoai: FieldRef<"ext_congty", 'String'>
    readonly email: FieldRef<"ext_congty", 'String'>
    readonly nguoiDaiDien: FieldRef<"ext_congty", 'String'>
    readonly isActive: FieldRef<"ext_congty", 'Boolean'>
    readonly isDefault: FieldRef<"ext_congty", 'Boolean'>
    readonly createdAt: FieldRef<"ext_congty", 'DateTime'>
    readonly updatedAt: FieldRef<"ext_congty", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ext_congty findUnique
   */
  export type ext_congtyFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_congty
     */
    select?: ext_congtySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_congty
     */
    omit?: ext_congtyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_congtyInclude<ExtArgs> | null
    /**
     * Filter, which ext_congty to fetch.
     */
    where: ext_congtyWhereUniqueInput
  }

  /**
   * ext_congty findUniqueOrThrow
   */
  export type ext_congtyFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_congty
     */
    select?: ext_congtySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_congty
     */
    omit?: ext_congtyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_congtyInclude<ExtArgs> | null
    /**
     * Filter, which ext_congty to fetch.
     */
    where: ext_congtyWhereUniqueInput
  }

  /**
   * ext_congty findFirst
   */
  export type ext_congtyFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_congty
     */
    select?: ext_congtySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_congty
     */
    omit?: ext_congtyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_congtyInclude<ExtArgs> | null
    /**
     * Filter, which ext_congty to fetch.
     */
    where?: ext_congtyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ext_congties to fetch.
     */
    orderBy?: ext_congtyOrderByWithRelationInput | ext_congtyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ext_congties.
     */
    cursor?: ext_congtyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ext_congties from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ext_congties.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ext_congties.
     */
    distinct?: Ext_congtyScalarFieldEnum | Ext_congtyScalarFieldEnum[]
  }

  /**
   * ext_congty findFirstOrThrow
   */
  export type ext_congtyFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_congty
     */
    select?: ext_congtySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_congty
     */
    omit?: ext_congtyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_congtyInclude<ExtArgs> | null
    /**
     * Filter, which ext_congty to fetch.
     */
    where?: ext_congtyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ext_congties to fetch.
     */
    orderBy?: ext_congtyOrderByWithRelationInput | ext_congtyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ext_congties.
     */
    cursor?: ext_congtyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ext_congties from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ext_congties.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ext_congties.
     */
    distinct?: Ext_congtyScalarFieldEnum | Ext_congtyScalarFieldEnum[]
  }

  /**
   * ext_congty findMany
   */
  export type ext_congtyFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_congty
     */
    select?: ext_congtySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_congty
     */
    omit?: ext_congtyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_congtyInclude<ExtArgs> | null
    /**
     * Filter, which ext_congties to fetch.
     */
    where?: ext_congtyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ext_congties to fetch.
     */
    orderBy?: ext_congtyOrderByWithRelationInput | ext_congtyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ext_congties.
     */
    cursor?: ext_congtyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ext_congties from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ext_congties.
     */
    skip?: number
    distinct?: Ext_congtyScalarFieldEnum | Ext_congtyScalarFieldEnum[]
  }

  /**
   * ext_congty create
   */
  export type ext_congtyCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_congty
     */
    select?: ext_congtySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_congty
     */
    omit?: ext_congtyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_congtyInclude<ExtArgs> | null
    /**
     * The data needed to create a ext_congty.
     */
    data: XOR<ext_congtyCreateInput, ext_congtyUncheckedCreateInput>
  }

  /**
   * ext_congty createMany
   */
  export type ext_congtyCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ext_congties.
     */
    data: ext_congtyCreateManyInput | ext_congtyCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ext_congty createManyAndReturn
   */
  export type ext_congtyCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_congty
     */
    select?: ext_congtySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ext_congty
     */
    omit?: ext_congtyOmit<ExtArgs> | null
    /**
     * The data used to create many ext_congties.
     */
    data: ext_congtyCreateManyInput | ext_congtyCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ext_congty update
   */
  export type ext_congtyUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_congty
     */
    select?: ext_congtySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_congty
     */
    omit?: ext_congtyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_congtyInclude<ExtArgs> | null
    /**
     * The data needed to update a ext_congty.
     */
    data: XOR<ext_congtyUpdateInput, ext_congtyUncheckedUpdateInput>
    /**
     * Choose, which ext_congty to update.
     */
    where: ext_congtyWhereUniqueInput
  }

  /**
   * ext_congty updateMany
   */
  export type ext_congtyUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ext_congties.
     */
    data: XOR<ext_congtyUpdateManyMutationInput, ext_congtyUncheckedUpdateManyInput>
    /**
     * Filter which ext_congties to update
     */
    where?: ext_congtyWhereInput
    /**
     * Limit how many ext_congties to update.
     */
    limit?: number
  }

  /**
   * ext_congty updateManyAndReturn
   */
  export type ext_congtyUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_congty
     */
    select?: ext_congtySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ext_congty
     */
    omit?: ext_congtyOmit<ExtArgs> | null
    /**
     * The data used to update ext_congties.
     */
    data: XOR<ext_congtyUpdateManyMutationInput, ext_congtyUncheckedUpdateManyInput>
    /**
     * Filter which ext_congties to update
     */
    where?: ext_congtyWhereInput
    /**
     * Limit how many ext_congties to update.
     */
    limit?: number
  }

  /**
   * ext_congty upsert
   */
  export type ext_congtyUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_congty
     */
    select?: ext_congtySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_congty
     */
    omit?: ext_congtyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_congtyInclude<ExtArgs> | null
    /**
     * The filter to search for the ext_congty to update in case it exists.
     */
    where: ext_congtyWhereUniqueInput
    /**
     * In case the ext_congty found by the `where` argument doesn't exist, create a new ext_congty with this data.
     */
    create: XOR<ext_congtyCreateInput, ext_congtyUncheckedCreateInput>
    /**
     * In case the ext_congty was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ext_congtyUpdateInput, ext_congtyUncheckedUpdateInput>
  }

  /**
   * ext_congty delete
   */
  export type ext_congtyDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_congty
     */
    select?: ext_congtySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_congty
     */
    omit?: ext_congtyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_congtyInclude<ExtArgs> | null
    /**
     * Filter which ext_congty to delete.
     */
    where: ext_congtyWhereUniqueInput
  }

  /**
   * ext_congty deleteMany
   */
  export type ext_congtyDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ext_congties to delete
     */
    where?: ext_congtyWhereInput
    /**
     * Limit how many ext_congties to delete.
     */
    limit?: number
  }

  /**
   * ext_congty.apiConfigs
   */
  export type ext_congty$apiConfigsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_apiconfig
     */
    select?: ext_apiconfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_apiconfig
     */
    omit?: ext_apiconfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_apiconfigInclude<ExtArgs> | null
    where?: ext_apiconfigWhereInput
    orderBy?: ext_apiconfigOrderByWithRelationInput | ext_apiconfigOrderByWithRelationInput[]
    cursor?: ext_apiconfigWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Ext_apiconfigScalarFieldEnum | Ext_apiconfigScalarFieldEnum[]
  }

  /**
   * ext_congty.hoadons
   */
  export type ext_congty$hoadonsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_listhoadon
     */
    select?: ext_listhoadonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_listhoadon
     */
    omit?: ext_listhoadonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_listhoadonInclude<ExtArgs> | null
    where?: ext_listhoadonWhereInput
    orderBy?: ext_listhoadonOrderByWithRelationInput | ext_listhoadonOrderByWithRelationInput[]
    cursor?: ext_listhoadonWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Ext_listhoadonScalarFieldEnum | Ext_listhoadonScalarFieldEnum[]
  }

  /**
   * ext_congty.synclogs
   */
  export type ext_congty$synclogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_synclog
     */
    select?: ext_synclogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_synclog
     */
    omit?: ext_synclogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_synclogInclude<ExtArgs> | null
    where?: ext_synclogWhereInput
    orderBy?: ext_synclogOrderByWithRelationInput | ext_synclogOrderByWithRelationInput[]
    cursor?: ext_synclogWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Ext_synclogScalarFieldEnum | Ext_synclogScalarFieldEnum[]
  }

  /**
   * ext_congty without action
   */
  export type ext_congtyDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_congty
     */
    select?: ext_congtySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_congty
     */
    omit?: ext_congtyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_congtyInclude<ExtArgs> | null
  }


  /**
   * Model ext_listhoadon
   */

  export type AggregateExt_listhoadon = {
    _count: Ext_listhoadonCountAggregateOutputType | null
    _avg: Ext_listhoadonAvgAggregateOutputType | null
    _sum: Ext_listhoadonSumAggregateOutputType | null
    _min: Ext_listhoadonMinAggregateOutputType | null
    _max: Ext_listhoadonMaxAggregateOutputType | null
  }

  export type Ext_listhoadonAvgAggregateOutputType = {
    tgtcthue: Decimal | null
    tgtthue: Decimal | null
    tgtttbso: Decimal | null
  }

  export type Ext_listhoadonSumAggregateOutputType = {
    tgtcthue: Decimal | null
    tgtthue: Decimal | null
    tgtttbso: Decimal | null
  }

  export type Ext_listhoadonMinAggregateOutputType = {
    id: string | null
    idServer: string | null
    brandname: string | null
    congtyId: string | null
    nbmst: string | null
    nbten: string | null
    nbdchi: string | null
    nmmst: string | null
    nmten: string | null
    nmdchi: string | null
    khmshdon: string | null
    khhdon: string | null
    shdon: string | null
    mhso: string | null
    tgtcthue: Decimal | null
    tgtthue: Decimal | null
    tgtttbso: Decimal | null
    tdlap: Date | null
    tthai: string | null
    loaihd: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type Ext_listhoadonMaxAggregateOutputType = {
    id: string | null
    idServer: string | null
    brandname: string | null
    congtyId: string | null
    nbmst: string | null
    nbten: string | null
    nbdchi: string | null
    nmmst: string | null
    nmten: string | null
    nmdchi: string | null
    khmshdon: string | null
    khhdon: string | null
    shdon: string | null
    mhso: string | null
    tgtcthue: Decimal | null
    tgtthue: Decimal | null
    tgtttbso: Decimal | null
    tdlap: Date | null
    tthai: string | null
    loaihd: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type Ext_listhoadonCountAggregateOutputType = {
    id: number
    idServer: number
    brandname: number
    congtyId: number
    nbmst: number
    nbten: number
    nbdchi: number
    nmmst: number
    nmten: number
    nmdchi: number
    khmshdon: number
    khhdon: number
    shdon: number
    mhso: number
    tgtcthue: number
    tgtthue: number
    tgtttbso: number
    tdlap: number
    tthai: number
    loaihd: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type Ext_listhoadonAvgAggregateInputType = {
    tgtcthue?: true
    tgtthue?: true
    tgtttbso?: true
  }

  export type Ext_listhoadonSumAggregateInputType = {
    tgtcthue?: true
    tgtthue?: true
    tgtttbso?: true
  }

  export type Ext_listhoadonMinAggregateInputType = {
    id?: true
    idServer?: true
    brandname?: true
    congtyId?: true
    nbmst?: true
    nbten?: true
    nbdchi?: true
    nmmst?: true
    nmten?: true
    nmdchi?: true
    khmshdon?: true
    khhdon?: true
    shdon?: true
    mhso?: true
    tgtcthue?: true
    tgtthue?: true
    tgtttbso?: true
    tdlap?: true
    tthai?: true
    loaihd?: true
    createdAt?: true
    updatedAt?: true
  }

  export type Ext_listhoadonMaxAggregateInputType = {
    id?: true
    idServer?: true
    brandname?: true
    congtyId?: true
    nbmst?: true
    nbten?: true
    nbdchi?: true
    nmmst?: true
    nmten?: true
    nmdchi?: true
    khmshdon?: true
    khhdon?: true
    shdon?: true
    mhso?: true
    tgtcthue?: true
    tgtthue?: true
    tgtttbso?: true
    tdlap?: true
    tthai?: true
    loaihd?: true
    createdAt?: true
    updatedAt?: true
  }

  export type Ext_listhoadonCountAggregateInputType = {
    id?: true
    idServer?: true
    brandname?: true
    congtyId?: true
    nbmst?: true
    nbten?: true
    nbdchi?: true
    nmmst?: true
    nmten?: true
    nmdchi?: true
    khmshdon?: true
    khhdon?: true
    shdon?: true
    mhso?: true
    tgtcthue?: true
    tgtthue?: true
    tgtttbso?: true
    tdlap?: true
    tthai?: true
    loaihd?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type Ext_listhoadonAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ext_listhoadon to aggregate.
     */
    where?: ext_listhoadonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ext_listhoadons to fetch.
     */
    orderBy?: ext_listhoadonOrderByWithRelationInput | ext_listhoadonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ext_listhoadonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ext_listhoadons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ext_listhoadons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ext_listhoadons
    **/
    _count?: true | Ext_listhoadonCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Ext_listhoadonAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Ext_listhoadonSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Ext_listhoadonMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Ext_listhoadonMaxAggregateInputType
  }

  export type GetExt_listhoadonAggregateType<T extends Ext_listhoadonAggregateArgs> = {
        [P in keyof T & keyof AggregateExt_listhoadon]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateExt_listhoadon[P]>
      : GetScalarType<T[P], AggregateExt_listhoadon[P]>
  }




  export type ext_listhoadonGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ext_listhoadonWhereInput
    orderBy?: ext_listhoadonOrderByWithAggregationInput | ext_listhoadonOrderByWithAggregationInput[]
    by: Ext_listhoadonScalarFieldEnum[] | Ext_listhoadonScalarFieldEnum
    having?: ext_listhoadonScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Ext_listhoadonCountAggregateInputType | true
    _avg?: Ext_listhoadonAvgAggregateInputType
    _sum?: Ext_listhoadonSumAggregateInputType
    _min?: Ext_listhoadonMinAggregateInputType
    _max?: Ext_listhoadonMaxAggregateInputType
  }

  export type Ext_listhoadonGroupByOutputType = {
    id: string
    idServer: string
    brandname: string | null
    congtyId: string | null
    nbmst: string
    nbten: string | null
    nbdchi: string | null
    nmmst: string | null
    nmten: string | null
    nmdchi: string | null
    khmshdon: string
    khhdon: string
    shdon: string
    mhso: string | null
    tgtcthue: Decimal
    tgtthue: Decimal
    tgtttbso: Decimal
    tdlap: Date
    tthai: string | null
    loaihd: string
    createdAt: Date
    updatedAt: Date
    _count: Ext_listhoadonCountAggregateOutputType | null
    _avg: Ext_listhoadonAvgAggregateOutputType | null
    _sum: Ext_listhoadonSumAggregateOutputType | null
    _min: Ext_listhoadonMinAggregateOutputType | null
    _max: Ext_listhoadonMaxAggregateOutputType | null
  }

  type GetExt_listhoadonGroupByPayload<T extends ext_listhoadonGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Ext_listhoadonGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Ext_listhoadonGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Ext_listhoadonGroupByOutputType[P]>
            : GetScalarType<T[P], Ext_listhoadonGroupByOutputType[P]>
        }
      >
    >


  export type ext_listhoadonSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    idServer?: boolean
    brandname?: boolean
    congtyId?: boolean
    nbmst?: boolean
    nbten?: boolean
    nbdchi?: boolean
    nmmst?: boolean
    nmten?: boolean
    nmdchi?: boolean
    khmshdon?: boolean
    khhdon?: boolean
    shdon?: boolean
    mhso?: boolean
    tgtcthue?: boolean
    tgtthue?: boolean
    tgtttbso?: boolean
    tdlap?: boolean
    tthai?: boolean
    loaihd?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    congty?: boolean | ext_listhoadon$congtyArgs<ExtArgs>
    details?: boolean | ext_listhoadon$detailsArgs<ExtArgs>
    _count?: boolean | Ext_listhoadonCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ext_listhoadon"]>

  export type ext_listhoadonSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    idServer?: boolean
    brandname?: boolean
    congtyId?: boolean
    nbmst?: boolean
    nbten?: boolean
    nbdchi?: boolean
    nmmst?: boolean
    nmten?: boolean
    nmdchi?: boolean
    khmshdon?: boolean
    khhdon?: boolean
    shdon?: boolean
    mhso?: boolean
    tgtcthue?: boolean
    tgtthue?: boolean
    tgtttbso?: boolean
    tdlap?: boolean
    tthai?: boolean
    loaihd?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    congty?: boolean | ext_listhoadon$congtyArgs<ExtArgs>
  }, ExtArgs["result"]["ext_listhoadon"]>

  export type ext_listhoadonSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    idServer?: boolean
    brandname?: boolean
    congtyId?: boolean
    nbmst?: boolean
    nbten?: boolean
    nbdchi?: boolean
    nmmst?: boolean
    nmten?: boolean
    nmdchi?: boolean
    khmshdon?: boolean
    khhdon?: boolean
    shdon?: boolean
    mhso?: boolean
    tgtcthue?: boolean
    tgtthue?: boolean
    tgtttbso?: boolean
    tdlap?: boolean
    tthai?: boolean
    loaihd?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    congty?: boolean | ext_listhoadon$congtyArgs<ExtArgs>
  }, ExtArgs["result"]["ext_listhoadon"]>

  export type ext_listhoadonSelectScalar = {
    id?: boolean
    idServer?: boolean
    brandname?: boolean
    congtyId?: boolean
    nbmst?: boolean
    nbten?: boolean
    nbdchi?: boolean
    nmmst?: boolean
    nmten?: boolean
    nmdchi?: boolean
    khmshdon?: boolean
    khhdon?: boolean
    shdon?: boolean
    mhso?: boolean
    tgtcthue?: boolean
    tgtthue?: boolean
    tgtttbso?: boolean
    tdlap?: boolean
    tthai?: boolean
    loaihd?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ext_listhoadonOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "idServer" | "brandname" | "congtyId" | "nbmst" | "nbten" | "nbdchi" | "nmmst" | "nmten" | "nmdchi" | "khmshdon" | "khhdon" | "shdon" | "mhso" | "tgtcthue" | "tgtthue" | "tgtttbso" | "tdlap" | "tthai" | "loaihd" | "createdAt" | "updatedAt", ExtArgs["result"]["ext_listhoadon"]>
  export type ext_listhoadonInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    congty?: boolean | ext_listhoadon$congtyArgs<ExtArgs>
    details?: boolean | ext_listhoadon$detailsArgs<ExtArgs>
    _count?: boolean | Ext_listhoadonCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ext_listhoadonIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    congty?: boolean | ext_listhoadon$congtyArgs<ExtArgs>
  }
  export type ext_listhoadonIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    congty?: boolean | ext_listhoadon$congtyArgs<ExtArgs>
  }

  export type $ext_listhoadonPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ext_listhoadon"
    objects: {
      congty: Prisma.$ext_congtyPayload<ExtArgs> | null
      details: Prisma.$ext_detailhoadonPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      idServer: string
      brandname: string | null
      congtyId: string | null
      nbmst: string
      nbten: string | null
      nbdchi: string | null
      nmmst: string | null
      nmten: string | null
      nmdchi: string | null
      khmshdon: string
      khhdon: string
      shdon: string
      mhso: string | null
      tgtcthue: Prisma.Decimal
      tgtthue: Prisma.Decimal
      tgtttbso: Prisma.Decimal
      tdlap: Date
      tthai: string | null
      loaihd: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["ext_listhoadon"]>
    composites: {}
  }

  type ext_listhoadonGetPayload<S extends boolean | null | undefined | ext_listhoadonDefaultArgs> = $Result.GetResult<Prisma.$ext_listhoadonPayload, S>

  type ext_listhoadonCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ext_listhoadonFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Ext_listhoadonCountAggregateInputType | true
    }

  export interface ext_listhoadonDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ext_listhoadon'], meta: { name: 'ext_listhoadon' } }
    /**
     * Find zero or one Ext_listhoadon that matches the filter.
     * @param {ext_listhoadonFindUniqueArgs} args - Arguments to find a Ext_listhoadon
     * @example
     * // Get one Ext_listhoadon
     * const ext_listhoadon = await prisma.ext_listhoadon.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ext_listhoadonFindUniqueArgs>(args: SelectSubset<T, ext_listhoadonFindUniqueArgs<ExtArgs>>): Prisma__ext_listhoadonClient<$Result.GetResult<Prisma.$ext_listhoadonPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Ext_listhoadon that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ext_listhoadonFindUniqueOrThrowArgs} args - Arguments to find a Ext_listhoadon
     * @example
     * // Get one Ext_listhoadon
     * const ext_listhoadon = await prisma.ext_listhoadon.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ext_listhoadonFindUniqueOrThrowArgs>(args: SelectSubset<T, ext_listhoadonFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ext_listhoadonClient<$Result.GetResult<Prisma.$ext_listhoadonPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ext_listhoadon that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_listhoadonFindFirstArgs} args - Arguments to find a Ext_listhoadon
     * @example
     * // Get one Ext_listhoadon
     * const ext_listhoadon = await prisma.ext_listhoadon.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ext_listhoadonFindFirstArgs>(args?: SelectSubset<T, ext_listhoadonFindFirstArgs<ExtArgs>>): Prisma__ext_listhoadonClient<$Result.GetResult<Prisma.$ext_listhoadonPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ext_listhoadon that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_listhoadonFindFirstOrThrowArgs} args - Arguments to find a Ext_listhoadon
     * @example
     * // Get one Ext_listhoadon
     * const ext_listhoadon = await prisma.ext_listhoadon.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ext_listhoadonFindFirstOrThrowArgs>(args?: SelectSubset<T, ext_listhoadonFindFirstOrThrowArgs<ExtArgs>>): Prisma__ext_listhoadonClient<$Result.GetResult<Prisma.$ext_listhoadonPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Ext_listhoadons that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_listhoadonFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Ext_listhoadons
     * const ext_listhoadons = await prisma.ext_listhoadon.findMany()
     * 
     * // Get first 10 Ext_listhoadons
     * const ext_listhoadons = await prisma.ext_listhoadon.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const ext_listhoadonWithIdOnly = await prisma.ext_listhoadon.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ext_listhoadonFindManyArgs>(args?: SelectSubset<T, ext_listhoadonFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ext_listhoadonPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Ext_listhoadon.
     * @param {ext_listhoadonCreateArgs} args - Arguments to create a Ext_listhoadon.
     * @example
     * // Create one Ext_listhoadon
     * const Ext_listhoadon = await prisma.ext_listhoadon.create({
     *   data: {
     *     // ... data to create a Ext_listhoadon
     *   }
     * })
     * 
     */
    create<T extends ext_listhoadonCreateArgs>(args: SelectSubset<T, ext_listhoadonCreateArgs<ExtArgs>>): Prisma__ext_listhoadonClient<$Result.GetResult<Prisma.$ext_listhoadonPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Ext_listhoadons.
     * @param {ext_listhoadonCreateManyArgs} args - Arguments to create many Ext_listhoadons.
     * @example
     * // Create many Ext_listhoadons
     * const ext_listhoadon = await prisma.ext_listhoadon.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ext_listhoadonCreateManyArgs>(args?: SelectSubset<T, ext_listhoadonCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Ext_listhoadons and returns the data saved in the database.
     * @param {ext_listhoadonCreateManyAndReturnArgs} args - Arguments to create many Ext_listhoadons.
     * @example
     * // Create many Ext_listhoadons
     * const ext_listhoadon = await prisma.ext_listhoadon.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Ext_listhoadons and only return the `id`
     * const ext_listhoadonWithIdOnly = await prisma.ext_listhoadon.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ext_listhoadonCreateManyAndReturnArgs>(args?: SelectSubset<T, ext_listhoadonCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ext_listhoadonPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Ext_listhoadon.
     * @param {ext_listhoadonDeleteArgs} args - Arguments to delete one Ext_listhoadon.
     * @example
     * // Delete one Ext_listhoadon
     * const Ext_listhoadon = await prisma.ext_listhoadon.delete({
     *   where: {
     *     // ... filter to delete one Ext_listhoadon
     *   }
     * })
     * 
     */
    delete<T extends ext_listhoadonDeleteArgs>(args: SelectSubset<T, ext_listhoadonDeleteArgs<ExtArgs>>): Prisma__ext_listhoadonClient<$Result.GetResult<Prisma.$ext_listhoadonPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Ext_listhoadon.
     * @param {ext_listhoadonUpdateArgs} args - Arguments to update one Ext_listhoadon.
     * @example
     * // Update one Ext_listhoadon
     * const ext_listhoadon = await prisma.ext_listhoadon.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ext_listhoadonUpdateArgs>(args: SelectSubset<T, ext_listhoadonUpdateArgs<ExtArgs>>): Prisma__ext_listhoadonClient<$Result.GetResult<Prisma.$ext_listhoadonPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Ext_listhoadons.
     * @param {ext_listhoadonDeleteManyArgs} args - Arguments to filter Ext_listhoadons to delete.
     * @example
     * // Delete a few Ext_listhoadons
     * const { count } = await prisma.ext_listhoadon.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ext_listhoadonDeleteManyArgs>(args?: SelectSubset<T, ext_listhoadonDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ext_listhoadons.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_listhoadonUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Ext_listhoadons
     * const ext_listhoadon = await prisma.ext_listhoadon.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ext_listhoadonUpdateManyArgs>(args: SelectSubset<T, ext_listhoadonUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ext_listhoadons and returns the data updated in the database.
     * @param {ext_listhoadonUpdateManyAndReturnArgs} args - Arguments to update many Ext_listhoadons.
     * @example
     * // Update many Ext_listhoadons
     * const ext_listhoadon = await prisma.ext_listhoadon.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Ext_listhoadons and only return the `id`
     * const ext_listhoadonWithIdOnly = await prisma.ext_listhoadon.updateManyAndReturn({
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
    updateManyAndReturn<T extends ext_listhoadonUpdateManyAndReturnArgs>(args: SelectSubset<T, ext_listhoadonUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ext_listhoadonPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Ext_listhoadon.
     * @param {ext_listhoadonUpsertArgs} args - Arguments to update or create a Ext_listhoadon.
     * @example
     * // Update or create a Ext_listhoadon
     * const ext_listhoadon = await prisma.ext_listhoadon.upsert({
     *   create: {
     *     // ... data to create a Ext_listhoadon
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Ext_listhoadon we want to update
     *   }
     * })
     */
    upsert<T extends ext_listhoadonUpsertArgs>(args: SelectSubset<T, ext_listhoadonUpsertArgs<ExtArgs>>): Prisma__ext_listhoadonClient<$Result.GetResult<Prisma.$ext_listhoadonPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Ext_listhoadons.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_listhoadonCountArgs} args - Arguments to filter Ext_listhoadons to count.
     * @example
     * // Count the number of Ext_listhoadons
     * const count = await prisma.ext_listhoadon.count({
     *   where: {
     *     // ... the filter for the Ext_listhoadons we want to count
     *   }
     * })
    **/
    count<T extends ext_listhoadonCountArgs>(
      args?: Subset<T, ext_listhoadonCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Ext_listhoadonCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Ext_listhoadon.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Ext_listhoadonAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Ext_listhoadonAggregateArgs>(args: Subset<T, Ext_listhoadonAggregateArgs>): Prisma.PrismaPromise<GetExt_listhoadonAggregateType<T>>

    /**
     * Group by Ext_listhoadon.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_listhoadonGroupByArgs} args - Group by arguments.
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
      T extends ext_listhoadonGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ext_listhoadonGroupByArgs['orderBy'] }
        : { orderBy?: ext_listhoadonGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ext_listhoadonGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetExt_listhoadonGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ext_listhoadon model
   */
  readonly fields: ext_listhoadonFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ext_listhoadon.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ext_listhoadonClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    congty<T extends ext_listhoadon$congtyArgs<ExtArgs> = {}>(args?: Subset<T, ext_listhoadon$congtyArgs<ExtArgs>>): Prisma__ext_congtyClient<$Result.GetResult<Prisma.$ext_congtyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    details<T extends ext_listhoadon$detailsArgs<ExtArgs> = {}>(args?: Subset<T, ext_listhoadon$detailsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ext_detailhoadonPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the ext_listhoadon model
   */
  interface ext_listhoadonFieldRefs {
    readonly id: FieldRef<"ext_listhoadon", 'String'>
    readonly idServer: FieldRef<"ext_listhoadon", 'String'>
    readonly brandname: FieldRef<"ext_listhoadon", 'String'>
    readonly congtyId: FieldRef<"ext_listhoadon", 'String'>
    readonly nbmst: FieldRef<"ext_listhoadon", 'String'>
    readonly nbten: FieldRef<"ext_listhoadon", 'String'>
    readonly nbdchi: FieldRef<"ext_listhoadon", 'String'>
    readonly nmmst: FieldRef<"ext_listhoadon", 'String'>
    readonly nmten: FieldRef<"ext_listhoadon", 'String'>
    readonly nmdchi: FieldRef<"ext_listhoadon", 'String'>
    readonly khmshdon: FieldRef<"ext_listhoadon", 'String'>
    readonly khhdon: FieldRef<"ext_listhoadon", 'String'>
    readonly shdon: FieldRef<"ext_listhoadon", 'String'>
    readonly mhso: FieldRef<"ext_listhoadon", 'String'>
    readonly tgtcthue: FieldRef<"ext_listhoadon", 'Decimal'>
    readonly tgtthue: FieldRef<"ext_listhoadon", 'Decimal'>
    readonly tgtttbso: FieldRef<"ext_listhoadon", 'Decimal'>
    readonly tdlap: FieldRef<"ext_listhoadon", 'DateTime'>
    readonly tthai: FieldRef<"ext_listhoadon", 'String'>
    readonly loaihd: FieldRef<"ext_listhoadon", 'String'>
    readonly createdAt: FieldRef<"ext_listhoadon", 'DateTime'>
    readonly updatedAt: FieldRef<"ext_listhoadon", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ext_listhoadon findUnique
   */
  export type ext_listhoadonFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_listhoadon
     */
    select?: ext_listhoadonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_listhoadon
     */
    omit?: ext_listhoadonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_listhoadonInclude<ExtArgs> | null
    /**
     * Filter, which ext_listhoadon to fetch.
     */
    where: ext_listhoadonWhereUniqueInput
  }

  /**
   * ext_listhoadon findUniqueOrThrow
   */
  export type ext_listhoadonFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_listhoadon
     */
    select?: ext_listhoadonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_listhoadon
     */
    omit?: ext_listhoadonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_listhoadonInclude<ExtArgs> | null
    /**
     * Filter, which ext_listhoadon to fetch.
     */
    where: ext_listhoadonWhereUniqueInput
  }

  /**
   * ext_listhoadon findFirst
   */
  export type ext_listhoadonFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_listhoadon
     */
    select?: ext_listhoadonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_listhoadon
     */
    omit?: ext_listhoadonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_listhoadonInclude<ExtArgs> | null
    /**
     * Filter, which ext_listhoadon to fetch.
     */
    where?: ext_listhoadonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ext_listhoadons to fetch.
     */
    orderBy?: ext_listhoadonOrderByWithRelationInput | ext_listhoadonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ext_listhoadons.
     */
    cursor?: ext_listhoadonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ext_listhoadons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ext_listhoadons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ext_listhoadons.
     */
    distinct?: Ext_listhoadonScalarFieldEnum | Ext_listhoadonScalarFieldEnum[]
  }

  /**
   * ext_listhoadon findFirstOrThrow
   */
  export type ext_listhoadonFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_listhoadon
     */
    select?: ext_listhoadonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_listhoadon
     */
    omit?: ext_listhoadonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_listhoadonInclude<ExtArgs> | null
    /**
     * Filter, which ext_listhoadon to fetch.
     */
    where?: ext_listhoadonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ext_listhoadons to fetch.
     */
    orderBy?: ext_listhoadonOrderByWithRelationInput | ext_listhoadonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ext_listhoadons.
     */
    cursor?: ext_listhoadonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ext_listhoadons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ext_listhoadons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ext_listhoadons.
     */
    distinct?: Ext_listhoadonScalarFieldEnum | Ext_listhoadonScalarFieldEnum[]
  }

  /**
   * ext_listhoadon findMany
   */
  export type ext_listhoadonFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_listhoadon
     */
    select?: ext_listhoadonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_listhoadon
     */
    omit?: ext_listhoadonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_listhoadonInclude<ExtArgs> | null
    /**
     * Filter, which ext_listhoadons to fetch.
     */
    where?: ext_listhoadonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ext_listhoadons to fetch.
     */
    orderBy?: ext_listhoadonOrderByWithRelationInput | ext_listhoadonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ext_listhoadons.
     */
    cursor?: ext_listhoadonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ext_listhoadons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ext_listhoadons.
     */
    skip?: number
    distinct?: Ext_listhoadonScalarFieldEnum | Ext_listhoadonScalarFieldEnum[]
  }

  /**
   * ext_listhoadon create
   */
  export type ext_listhoadonCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_listhoadon
     */
    select?: ext_listhoadonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_listhoadon
     */
    omit?: ext_listhoadonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_listhoadonInclude<ExtArgs> | null
    /**
     * The data needed to create a ext_listhoadon.
     */
    data: XOR<ext_listhoadonCreateInput, ext_listhoadonUncheckedCreateInput>
  }

  /**
   * ext_listhoadon createMany
   */
  export type ext_listhoadonCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ext_listhoadons.
     */
    data: ext_listhoadonCreateManyInput | ext_listhoadonCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ext_listhoadon createManyAndReturn
   */
  export type ext_listhoadonCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_listhoadon
     */
    select?: ext_listhoadonSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ext_listhoadon
     */
    omit?: ext_listhoadonOmit<ExtArgs> | null
    /**
     * The data used to create many ext_listhoadons.
     */
    data: ext_listhoadonCreateManyInput | ext_listhoadonCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_listhoadonIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ext_listhoadon update
   */
  export type ext_listhoadonUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_listhoadon
     */
    select?: ext_listhoadonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_listhoadon
     */
    omit?: ext_listhoadonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_listhoadonInclude<ExtArgs> | null
    /**
     * The data needed to update a ext_listhoadon.
     */
    data: XOR<ext_listhoadonUpdateInput, ext_listhoadonUncheckedUpdateInput>
    /**
     * Choose, which ext_listhoadon to update.
     */
    where: ext_listhoadonWhereUniqueInput
  }

  /**
   * ext_listhoadon updateMany
   */
  export type ext_listhoadonUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ext_listhoadons.
     */
    data: XOR<ext_listhoadonUpdateManyMutationInput, ext_listhoadonUncheckedUpdateManyInput>
    /**
     * Filter which ext_listhoadons to update
     */
    where?: ext_listhoadonWhereInput
    /**
     * Limit how many ext_listhoadons to update.
     */
    limit?: number
  }

  /**
   * ext_listhoadon updateManyAndReturn
   */
  export type ext_listhoadonUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_listhoadon
     */
    select?: ext_listhoadonSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ext_listhoadon
     */
    omit?: ext_listhoadonOmit<ExtArgs> | null
    /**
     * The data used to update ext_listhoadons.
     */
    data: XOR<ext_listhoadonUpdateManyMutationInput, ext_listhoadonUncheckedUpdateManyInput>
    /**
     * Filter which ext_listhoadons to update
     */
    where?: ext_listhoadonWhereInput
    /**
     * Limit how many ext_listhoadons to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_listhoadonIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ext_listhoadon upsert
   */
  export type ext_listhoadonUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_listhoadon
     */
    select?: ext_listhoadonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_listhoadon
     */
    omit?: ext_listhoadonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_listhoadonInclude<ExtArgs> | null
    /**
     * The filter to search for the ext_listhoadon to update in case it exists.
     */
    where: ext_listhoadonWhereUniqueInput
    /**
     * In case the ext_listhoadon found by the `where` argument doesn't exist, create a new ext_listhoadon with this data.
     */
    create: XOR<ext_listhoadonCreateInput, ext_listhoadonUncheckedCreateInput>
    /**
     * In case the ext_listhoadon was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ext_listhoadonUpdateInput, ext_listhoadonUncheckedUpdateInput>
  }

  /**
   * ext_listhoadon delete
   */
  export type ext_listhoadonDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_listhoadon
     */
    select?: ext_listhoadonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_listhoadon
     */
    omit?: ext_listhoadonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_listhoadonInclude<ExtArgs> | null
    /**
     * Filter which ext_listhoadon to delete.
     */
    where: ext_listhoadonWhereUniqueInput
  }

  /**
   * ext_listhoadon deleteMany
   */
  export type ext_listhoadonDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ext_listhoadons to delete
     */
    where?: ext_listhoadonWhereInput
    /**
     * Limit how many ext_listhoadons to delete.
     */
    limit?: number
  }

  /**
   * ext_listhoadon.congty
   */
  export type ext_listhoadon$congtyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_congty
     */
    select?: ext_congtySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_congty
     */
    omit?: ext_congtyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_congtyInclude<ExtArgs> | null
    where?: ext_congtyWhereInput
  }

  /**
   * ext_listhoadon.details
   */
  export type ext_listhoadon$detailsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_detailhoadon
     */
    select?: ext_detailhoadonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_detailhoadon
     */
    omit?: ext_detailhoadonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_detailhoadonInclude<ExtArgs> | null
    where?: ext_detailhoadonWhereInput
    orderBy?: ext_detailhoadonOrderByWithRelationInput | ext_detailhoadonOrderByWithRelationInput[]
    cursor?: ext_detailhoadonWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Ext_detailhoadonScalarFieldEnum | Ext_detailhoadonScalarFieldEnum[]
  }

  /**
   * ext_listhoadon without action
   */
  export type ext_listhoadonDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_listhoadon
     */
    select?: ext_listhoadonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_listhoadon
     */
    omit?: ext_listhoadonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_listhoadonInclude<ExtArgs> | null
  }


  /**
   * Model ext_detailhoadon
   */

  export type AggregateExt_detailhoadon = {
    _count: Ext_detailhoadonCountAggregateOutputType | null
    _avg: Ext_detailhoadonAvgAggregateOutputType | null
    _sum: Ext_detailhoadonSumAggregateOutputType | null
    _min: Ext_detailhoadonMinAggregateOutputType | null
    _max: Ext_detailhoadonMaxAggregateOutputType | null
  }

  export type Ext_detailhoadonAvgAggregateOutputType = {
    stt: number | null
    sluong: Decimal | null
    dgia: Decimal | null
    thtien: Decimal | null
    tsuat: Decimal | null
    tthue: Decimal | null
  }

  export type Ext_detailhoadonSumAggregateOutputType = {
    stt: number | null
    sluong: Decimal | null
    dgia: Decimal | null
    thtien: Decimal | null
    tsuat: Decimal | null
    tthue: Decimal | null
  }

  export type Ext_detailhoadonMinAggregateOutputType = {
    id: string | null
    idServer: string | null
    idhdonServer: string | null
    stt: number | null
    ten: string | null
    dvtinh: string | null
    sluong: Decimal | null
    dgia: Decimal | null
    thtien: Decimal | null
    tsuat: Decimal | null
    tthue: Decimal | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type Ext_detailhoadonMaxAggregateOutputType = {
    id: string | null
    idServer: string | null
    idhdonServer: string | null
    stt: number | null
    ten: string | null
    dvtinh: string | null
    sluong: Decimal | null
    dgia: Decimal | null
    thtien: Decimal | null
    tsuat: Decimal | null
    tthue: Decimal | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type Ext_detailhoadonCountAggregateOutputType = {
    id: number
    idServer: number
    idhdonServer: number
    stt: number
    ten: number
    dvtinh: number
    sluong: number
    dgia: number
    thtien: number
    tsuat: number
    tthue: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type Ext_detailhoadonAvgAggregateInputType = {
    stt?: true
    sluong?: true
    dgia?: true
    thtien?: true
    tsuat?: true
    tthue?: true
  }

  export type Ext_detailhoadonSumAggregateInputType = {
    stt?: true
    sluong?: true
    dgia?: true
    thtien?: true
    tsuat?: true
    tthue?: true
  }

  export type Ext_detailhoadonMinAggregateInputType = {
    id?: true
    idServer?: true
    idhdonServer?: true
    stt?: true
    ten?: true
    dvtinh?: true
    sluong?: true
    dgia?: true
    thtien?: true
    tsuat?: true
    tthue?: true
    createdAt?: true
    updatedAt?: true
  }

  export type Ext_detailhoadonMaxAggregateInputType = {
    id?: true
    idServer?: true
    idhdonServer?: true
    stt?: true
    ten?: true
    dvtinh?: true
    sluong?: true
    dgia?: true
    thtien?: true
    tsuat?: true
    tthue?: true
    createdAt?: true
    updatedAt?: true
  }

  export type Ext_detailhoadonCountAggregateInputType = {
    id?: true
    idServer?: true
    idhdonServer?: true
    stt?: true
    ten?: true
    dvtinh?: true
    sluong?: true
    dgia?: true
    thtien?: true
    tsuat?: true
    tthue?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type Ext_detailhoadonAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ext_detailhoadon to aggregate.
     */
    where?: ext_detailhoadonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ext_detailhoadons to fetch.
     */
    orderBy?: ext_detailhoadonOrderByWithRelationInput | ext_detailhoadonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ext_detailhoadonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ext_detailhoadons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ext_detailhoadons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ext_detailhoadons
    **/
    _count?: true | Ext_detailhoadonCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Ext_detailhoadonAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Ext_detailhoadonSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Ext_detailhoadonMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Ext_detailhoadonMaxAggregateInputType
  }

  export type GetExt_detailhoadonAggregateType<T extends Ext_detailhoadonAggregateArgs> = {
        [P in keyof T & keyof AggregateExt_detailhoadon]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateExt_detailhoadon[P]>
      : GetScalarType<T[P], AggregateExt_detailhoadon[P]>
  }




  export type ext_detailhoadonGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ext_detailhoadonWhereInput
    orderBy?: ext_detailhoadonOrderByWithAggregationInput | ext_detailhoadonOrderByWithAggregationInput[]
    by: Ext_detailhoadonScalarFieldEnum[] | Ext_detailhoadonScalarFieldEnum
    having?: ext_detailhoadonScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Ext_detailhoadonCountAggregateInputType | true
    _avg?: Ext_detailhoadonAvgAggregateInputType
    _sum?: Ext_detailhoadonSumAggregateInputType
    _min?: Ext_detailhoadonMinAggregateInputType
    _max?: Ext_detailhoadonMaxAggregateInputType
  }

  export type Ext_detailhoadonGroupByOutputType = {
    id: string
    idServer: string
    idhdonServer: string
    stt: number
    ten: string
    dvtinh: string | null
    sluong: Decimal
    dgia: Decimal
    thtien: Decimal
    tsuat: Decimal
    tthue: Decimal
    createdAt: Date
    updatedAt: Date
    _count: Ext_detailhoadonCountAggregateOutputType | null
    _avg: Ext_detailhoadonAvgAggregateOutputType | null
    _sum: Ext_detailhoadonSumAggregateOutputType | null
    _min: Ext_detailhoadonMinAggregateOutputType | null
    _max: Ext_detailhoadonMaxAggregateOutputType | null
  }

  type GetExt_detailhoadonGroupByPayload<T extends ext_detailhoadonGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Ext_detailhoadonGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Ext_detailhoadonGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Ext_detailhoadonGroupByOutputType[P]>
            : GetScalarType<T[P], Ext_detailhoadonGroupByOutputType[P]>
        }
      >
    >


  export type ext_detailhoadonSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    idServer?: boolean
    idhdonServer?: boolean
    stt?: boolean
    ten?: boolean
    dvtinh?: boolean
    sluong?: boolean
    dgia?: boolean
    thtien?: boolean
    tsuat?: boolean
    tthue?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    invoice?: boolean | ext_listhoadonDefaultArgs<ExtArgs>
    products?: boolean | ext_detailhoadon$productsArgs<ExtArgs>
    _count?: boolean | Ext_detailhoadonCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ext_detailhoadon"]>

  export type ext_detailhoadonSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    idServer?: boolean
    idhdonServer?: boolean
    stt?: boolean
    ten?: boolean
    dvtinh?: boolean
    sluong?: boolean
    dgia?: boolean
    thtien?: boolean
    tsuat?: boolean
    tthue?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    invoice?: boolean | ext_listhoadonDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ext_detailhoadon"]>

  export type ext_detailhoadonSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    idServer?: boolean
    idhdonServer?: boolean
    stt?: boolean
    ten?: boolean
    dvtinh?: boolean
    sluong?: boolean
    dgia?: boolean
    thtien?: boolean
    tsuat?: boolean
    tthue?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    invoice?: boolean | ext_listhoadonDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ext_detailhoadon"]>

  export type ext_detailhoadonSelectScalar = {
    id?: boolean
    idServer?: boolean
    idhdonServer?: boolean
    stt?: boolean
    ten?: boolean
    dvtinh?: boolean
    sluong?: boolean
    dgia?: boolean
    thtien?: boolean
    tsuat?: boolean
    tthue?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ext_detailhoadonOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "idServer" | "idhdonServer" | "stt" | "ten" | "dvtinh" | "sluong" | "dgia" | "thtien" | "tsuat" | "tthue" | "createdAt" | "updatedAt", ExtArgs["result"]["ext_detailhoadon"]>
  export type ext_detailhoadonInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    invoice?: boolean | ext_listhoadonDefaultArgs<ExtArgs>
    products?: boolean | ext_detailhoadon$productsArgs<ExtArgs>
    _count?: boolean | Ext_detailhoadonCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ext_detailhoadonIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    invoice?: boolean | ext_listhoadonDefaultArgs<ExtArgs>
  }
  export type ext_detailhoadonIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    invoice?: boolean | ext_listhoadonDefaultArgs<ExtArgs>
  }

  export type $ext_detailhoadonPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ext_detailhoadon"
    objects: {
      invoice: Prisma.$ext_listhoadonPayload<ExtArgs>
      products: Prisma.$ext_sanphamhoadonPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      idServer: string
      idhdonServer: string
      stt: number
      ten: string
      dvtinh: string | null
      sluong: Prisma.Decimal
      dgia: Prisma.Decimal
      thtien: Prisma.Decimal
      tsuat: Prisma.Decimal
      tthue: Prisma.Decimal
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["ext_detailhoadon"]>
    composites: {}
  }

  type ext_detailhoadonGetPayload<S extends boolean | null | undefined | ext_detailhoadonDefaultArgs> = $Result.GetResult<Prisma.$ext_detailhoadonPayload, S>

  type ext_detailhoadonCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ext_detailhoadonFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Ext_detailhoadonCountAggregateInputType | true
    }

  export interface ext_detailhoadonDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ext_detailhoadon'], meta: { name: 'ext_detailhoadon' } }
    /**
     * Find zero or one Ext_detailhoadon that matches the filter.
     * @param {ext_detailhoadonFindUniqueArgs} args - Arguments to find a Ext_detailhoadon
     * @example
     * // Get one Ext_detailhoadon
     * const ext_detailhoadon = await prisma.ext_detailhoadon.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ext_detailhoadonFindUniqueArgs>(args: SelectSubset<T, ext_detailhoadonFindUniqueArgs<ExtArgs>>): Prisma__ext_detailhoadonClient<$Result.GetResult<Prisma.$ext_detailhoadonPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Ext_detailhoadon that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ext_detailhoadonFindUniqueOrThrowArgs} args - Arguments to find a Ext_detailhoadon
     * @example
     * // Get one Ext_detailhoadon
     * const ext_detailhoadon = await prisma.ext_detailhoadon.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ext_detailhoadonFindUniqueOrThrowArgs>(args: SelectSubset<T, ext_detailhoadonFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ext_detailhoadonClient<$Result.GetResult<Prisma.$ext_detailhoadonPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ext_detailhoadon that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_detailhoadonFindFirstArgs} args - Arguments to find a Ext_detailhoadon
     * @example
     * // Get one Ext_detailhoadon
     * const ext_detailhoadon = await prisma.ext_detailhoadon.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ext_detailhoadonFindFirstArgs>(args?: SelectSubset<T, ext_detailhoadonFindFirstArgs<ExtArgs>>): Prisma__ext_detailhoadonClient<$Result.GetResult<Prisma.$ext_detailhoadonPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ext_detailhoadon that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_detailhoadonFindFirstOrThrowArgs} args - Arguments to find a Ext_detailhoadon
     * @example
     * // Get one Ext_detailhoadon
     * const ext_detailhoadon = await prisma.ext_detailhoadon.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ext_detailhoadonFindFirstOrThrowArgs>(args?: SelectSubset<T, ext_detailhoadonFindFirstOrThrowArgs<ExtArgs>>): Prisma__ext_detailhoadonClient<$Result.GetResult<Prisma.$ext_detailhoadonPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Ext_detailhoadons that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_detailhoadonFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Ext_detailhoadons
     * const ext_detailhoadons = await prisma.ext_detailhoadon.findMany()
     * 
     * // Get first 10 Ext_detailhoadons
     * const ext_detailhoadons = await prisma.ext_detailhoadon.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const ext_detailhoadonWithIdOnly = await prisma.ext_detailhoadon.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ext_detailhoadonFindManyArgs>(args?: SelectSubset<T, ext_detailhoadonFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ext_detailhoadonPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Ext_detailhoadon.
     * @param {ext_detailhoadonCreateArgs} args - Arguments to create a Ext_detailhoadon.
     * @example
     * // Create one Ext_detailhoadon
     * const Ext_detailhoadon = await prisma.ext_detailhoadon.create({
     *   data: {
     *     // ... data to create a Ext_detailhoadon
     *   }
     * })
     * 
     */
    create<T extends ext_detailhoadonCreateArgs>(args: SelectSubset<T, ext_detailhoadonCreateArgs<ExtArgs>>): Prisma__ext_detailhoadonClient<$Result.GetResult<Prisma.$ext_detailhoadonPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Ext_detailhoadons.
     * @param {ext_detailhoadonCreateManyArgs} args - Arguments to create many Ext_detailhoadons.
     * @example
     * // Create many Ext_detailhoadons
     * const ext_detailhoadon = await prisma.ext_detailhoadon.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ext_detailhoadonCreateManyArgs>(args?: SelectSubset<T, ext_detailhoadonCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Ext_detailhoadons and returns the data saved in the database.
     * @param {ext_detailhoadonCreateManyAndReturnArgs} args - Arguments to create many Ext_detailhoadons.
     * @example
     * // Create many Ext_detailhoadons
     * const ext_detailhoadon = await prisma.ext_detailhoadon.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Ext_detailhoadons and only return the `id`
     * const ext_detailhoadonWithIdOnly = await prisma.ext_detailhoadon.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ext_detailhoadonCreateManyAndReturnArgs>(args?: SelectSubset<T, ext_detailhoadonCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ext_detailhoadonPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Ext_detailhoadon.
     * @param {ext_detailhoadonDeleteArgs} args - Arguments to delete one Ext_detailhoadon.
     * @example
     * // Delete one Ext_detailhoadon
     * const Ext_detailhoadon = await prisma.ext_detailhoadon.delete({
     *   where: {
     *     // ... filter to delete one Ext_detailhoadon
     *   }
     * })
     * 
     */
    delete<T extends ext_detailhoadonDeleteArgs>(args: SelectSubset<T, ext_detailhoadonDeleteArgs<ExtArgs>>): Prisma__ext_detailhoadonClient<$Result.GetResult<Prisma.$ext_detailhoadonPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Ext_detailhoadon.
     * @param {ext_detailhoadonUpdateArgs} args - Arguments to update one Ext_detailhoadon.
     * @example
     * // Update one Ext_detailhoadon
     * const ext_detailhoadon = await prisma.ext_detailhoadon.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ext_detailhoadonUpdateArgs>(args: SelectSubset<T, ext_detailhoadonUpdateArgs<ExtArgs>>): Prisma__ext_detailhoadonClient<$Result.GetResult<Prisma.$ext_detailhoadonPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Ext_detailhoadons.
     * @param {ext_detailhoadonDeleteManyArgs} args - Arguments to filter Ext_detailhoadons to delete.
     * @example
     * // Delete a few Ext_detailhoadons
     * const { count } = await prisma.ext_detailhoadon.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ext_detailhoadonDeleteManyArgs>(args?: SelectSubset<T, ext_detailhoadonDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ext_detailhoadons.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_detailhoadonUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Ext_detailhoadons
     * const ext_detailhoadon = await prisma.ext_detailhoadon.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ext_detailhoadonUpdateManyArgs>(args: SelectSubset<T, ext_detailhoadonUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ext_detailhoadons and returns the data updated in the database.
     * @param {ext_detailhoadonUpdateManyAndReturnArgs} args - Arguments to update many Ext_detailhoadons.
     * @example
     * // Update many Ext_detailhoadons
     * const ext_detailhoadon = await prisma.ext_detailhoadon.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Ext_detailhoadons and only return the `id`
     * const ext_detailhoadonWithIdOnly = await prisma.ext_detailhoadon.updateManyAndReturn({
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
    updateManyAndReturn<T extends ext_detailhoadonUpdateManyAndReturnArgs>(args: SelectSubset<T, ext_detailhoadonUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ext_detailhoadonPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Ext_detailhoadon.
     * @param {ext_detailhoadonUpsertArgs} args - Arguments to update or create a Ext_detailhoadon.
     * @example
     * // Update or create a Ext_detailhoadon
     * const ext_detailhoadon = await prisma.ext_detailhoadon.upsert({
     *   create: {
     *     // ... data to create a Ext_detailhoadon
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Ext_detailhoadon we want to update
     *   }
     * })
     */
    upsert<T extends ext_detailhoadonUpsertArgs>(args: SelectSubset<T, ext_detailhoadonUpsertArgs<ExtArgs>>): Prisma__ext_detailhoadonClient<$Result.GetResult<Prisma.$ext_detailhoadonPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Ext_detailhoadons.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_detailhoadonCountArgs} args - Arguments to filter Ext_detailhoadons to count.
     * @example
     * // Count the number of Ext_detailhoadons
     * const count = await prisma.ext_detailhoadon.count({
     *   where: {
     *     // ... the filter for the Ext_detailhoadons we want to count
     *   }
     * })
    **/
    count<T extends ext_detailhoadonCountArgs>(
      args?: Subset<T, ext_detailhoadonCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Ext_detailhoadonCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Ext_detailhoadon.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Ext_detailhoadonAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Ext_detailhoadonAggregateArgs>(args: Subset<T, Ext_detailhoadonAggregateArgs>): Prisma.PrismaPromise<GetExt_detailhoadonAggregateType<T>>

    /**
     * Group by Ext_detailhoadon.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_detailhoadonGroupByArgs} args - Group by arguments.
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
      T extends ext_detailhoadonGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ext_detailhoadonGroupByArgs['orderBy'] }
        : { orderBy?: ext_detailhoadonGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ext_detailhoadonGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetExt_detailhoadonGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ext_detailhoadon model
   */
  readonly fields: ext_detailhoadonFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ext_detailhoadon.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ext_detailhoadonClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    invoice<T extends ext_listhoadonDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ext_listhoadonDefaultArgs<ExtArgs>>): Prisma__ext_listhoadonClient<$Result.GetResult<Prisma.$ext_listhoadonPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    products<T extends ext_detailhoadon$productsArgs<ExtArgs> = {}>(args?: Subset<T, ext_detailhoadon$productsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ext_sanphamhoadonPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the ext_detailhoadon model
   */
  interface ext_detailhoadonFieldRefs {
    readonly id: FieldRef<"ext_detailhoadon", 'String'>
    readonly idServer: FieldRef<"ext_detailhoadon", 'String'>
    readonly idhdonServer: FieldRef<"ext_detailhoadon", 'String'>
    readonly stt: FieldRef<"ext_detailhoadon", 'Int'>
    readonly ten: FieldRef<"ext_detailhoadon", 'String'>
    readonly dvtinh: FieldRef<"ext_detailhoadon", 'String'>
    readonly sluong: FieldRef<"ext_detailhoadon", 'Decimal'>
    readonly dgia: FieldRef<"ext_detailhoadon", 'Decimal'>
    readonly thtien: FieldRef<"ext_detailhoadon", 'Decimal'>
    readonly tsuat: FieldRef<"ext_detailhoadon", 'Decimal'>
    readonly tthue: FieldRef<"ext_detailhoadon", 'Decimal'>
    readonly createdAt: FieldRef<"ext_detailhoadon", 'DateTime'>
    readonly updatedAt: FieldRef<"ext_detailhoadon", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ext_detailhoadon findUnique
   */
  export type ext_detailhoadonFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_detailhoadon
     */
    select?: ext_detailhoadonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_detailhoadon
     */
    omit?: ext_detailhoadonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_detailhoadonInclude<ExtArgs> | null
    /**
     * Filter, which ext_detailhoadon to fetch.
     */
    where: ext_detailhoadonWhereUniqueInput
  }

  /**
   * ext_detailhoadon findUniqueOrThrow
   */
  export type ext_detailhoadonFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_detailhoadon
     */
    select?: ext_detailhoadonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_detailhoadon
     */
    omit?: ext_detailhoadonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_detailhoadonInclude<ExtArgs> | null
    /**
     * Filter, which ext_detailhoadon to fetch.
     */
    where: ext_detailhoadonWhereUniqueInput
  }

  /**
   * ext_detailhoadon findFirst
   */
  export type ext_detailhoadonFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_detailhoadon
     */
    select?: ext_detailhoadonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_detailhoadon
     */
    omit?: ext_detailhoadonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_detailhoadonInclude<ExtArgs> | null
    /**
     * Filter, which ext_detailhoadon to fetch.
     */
    where?: ext_detailhoadonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ext_detailhoadons to fetch.
     */
    orderBy?: ext_detailhoadonOrderByWithRelationInput | ext_detailhoadonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ext_detailhoadons.
     */
    cursor?: ext_detailhoadonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ext_detailhoadons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ext_detailhoadons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ext_detailhoadons.
     */
    distinct?: Ext_detailhoadonScalarFieldEnum | Ext_detailhoadonScalarFieldEnum[]
  }

  /**
   * ext_detailhoadon findFirstOrThrow
   */
  export type ext_detailhoadonFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_detailhoadon
     */
    select?: ext_detailhoadonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_detailhoadon
     */
    omit?: ext_detailhoadonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_detailhoadonInclude<ExtArgs> | null
    /**
     * Filter, which ext_detailhoadon to fetch.
     */
    where?: ext_detailhoadonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ext_detailhoadons to fetch.
     */
    orderBy?: ext_detailhoadonOrderByWithRelationInput | ext_detailhoadonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ext_detailhoadons.
     */
    cursor?: ext_detailhoadonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ext_detailhoadons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ext_detailhoadons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ext_detailhoadons.
     */
    distinct?: Ext_detailhoadonScalarFieldEnum | Ext_detailhoadonScalarFieldEnum[]
  }

  /**
   * ext_detailhoadon findMany
   */
  export type ext_detailhoadonFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_detailhoadon
     */
    select?: ext_detailhoadonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_detailhoadon
     */
    omit?: ext_detailhoadonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_detailhoadonInclude<ExtArgs> | null
    /**
     * Filter, which ext_detailhoadons to fetch.
     */
    where?: ext_detailhoadonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ext_detailhoadons to fetch.
     */
    orderBy?: ext_detailhoadonOrderByWithRelationInput | ext_detailhoadonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ext_detailhoadons.
     */
    cursor?: ext_detailhoadonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ext_detailhoadons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ext_detailhoadons.
     */
    skip?: number
    distinct?: Ext_detailhoadonScalarFieldEnum | Ext_detailhoadonScalarFieldEnum[]
  }

  /**
   * ext_detailhoadon create
   */
  export type ext_detailhoadonCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_detailhoadon
     */
    select?: ext_detailhoadonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_detailhoadon
     */
    omit?: ext_detailhoadonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_detailhoadonInclude<ExtArgs> | null
    /**
     * The data needed to create a ext_detailhoadon.
     */
    data: XOR<ext_detailhoadonCreateInput, ext_detailhoadonUncheckedCreateInput>
  }

  /**
   * ext_detailhoadon createMany
   */
  export type ext_detailhoadonCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ext_detailhoadons.
     */
    data: ext_detailhoadonCreateManyInput | ext_detailhoadonCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ext_detailhoadon createManyAndReturn
   */
  export type ext_detailhoadonCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_detailhoadon
     */
    select?: ext_detailhoadonSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ext_detailhoadon
     */
    omit?: ext_detailhoadonOmit<ExtArgs> | null
    /**
     * The data used to create many ext_detailhoadons.
     */
    data: ext_detailhoadonCreateManyInput | ext_detailhoadonCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_detailhoadonIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ext_detailhoadon update
   */
  export type ext_detailhoadonUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_detailhoadon
     */
    select?: ext_detailhoadonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_detailhoadon
     */
    omit?: ext_detailhoadonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_detailhoadonInclude<ExtArgs> | null
    /**
     * The data needed to update a ext_detailhoadon.
     */
    data: XOR<ext_detailhoadonUpdateInput, ext_detailhoadonUncheckedUpdateInput>
    /**
     * Choose, which ext_detailhoadon to update.
     */
    where: ext_detailhoadonWhereUniqueInput
  }

  /**
   * ext_detailhoadon updateMany
   */
  export type ext_detailhoadonUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ext_detailhoadons.
     */
    data: XOR<ext_detailhoadonUpdateManyMutationInput, ext_detailhoadonUncheckedUpdateManyInput>
    /**
     * Filter which ext_detailhoadons to update
     */
    where?: ext_detailhoadonWhereInput
    /**
     * Limit how many ext_detailhoadons to update.
     */
    limit?: number
  }

  /**
   * ext_detailhoadon updateManyAndReturn
   */
  export type ext_detailhoadonUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_detailhoadon
     */
    select?: ext_detailhoadonSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ext_detailhoadon
     */
    omit?: ext_detailhoadonOmit<ExtArgs> | null
    /**
     * The data used to update ext_detailhoadons.
     */
    data: XOR<ext_detailhoadonUpdateManyMutationInput, ext_detailhoadonUncheckedUpdateManyInput>
    /**
     * Filter which ext_detailhoadons to update
     */
    where?: ext_detailhoadonWhereInput
    /**
     * Limit how many ext_detailhoadons to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_detailhoadonIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ext_detailhoadon upsert
   */
  export type ext_detailhoadonUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_detailhoadon
     */
    select?: ext_detailhoadonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_detailhoadon
     */
    omit?: ext_detailhoadonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_detailhoadonInclude<ExtArgs> | null
    /**
     * The filter to search for the ext_detailhoadon to update in case it exists.
     */
    where: ext_detailhoadonWhereUniqueInput
    /**
     * In case the ext_detailhoadon found by the `where` argument doesn't exist, create a new ext_detailhoadon with this data.
     */
    create: XOR<ext_detailhoadonCreateInput, ext_detailhoadonUncheckedCreateInput>
    /**
     * In case the ext_detailhoadon was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ext_detailhoadonUpdateInput, ext_detailhoadonUncheckedUpdateInput>
  }

  /**
   * ext_detailhoadon delete
   */
  export type ext_detailhoadonDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_detailhoadon
     */
    select?: ext_detailhoadonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_detailhoadon
     */
    omit?: ext_detailhoadonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_detailhoadonInclude<ExtArgs> | null
    /**
     * Filter which ext_detailhoadon to delete.
     */
    where: ext_detailhoadonWhereUniqueInput
  }

  /**
   * ext_detailhoadon deleteMany
   */
  export type ext_detailhoadonDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ext_detailhoadons to delete
     */
    where?: ext_detailhoadonWhereInput
    /**
     * Limit how many ext_detailhoadons to delete.
     */
    limit?: number
  }

  /**
   * ext_detailhoadon.products
   */
  export type ext_detailhoadon$productsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_sanphamhoadon
     */
    select?: ext_sanphamhoadonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_sanphamhoadon
     */
    omit?: ext_sanphamhoadonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_sanphamhoadonInclude<ExtArgs> | null
    where?: ext_sanphamhoadonWhereInput
    orderBy?: ext_sanphamhoadonOrderByWithRelationInput | ext_sanphamhoadonOrderByWithRelationInput[]
    cursor?: ext_sanphamhoadonWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Ext_sanphamhoadonScalarFieldEnum | Ext_sanphamhoadonScalarFieldEnum[]
  }

  /**
   * ext_detailhoadon without action
   */
  export type ext_detailhoadonDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_detailhoadon
     */
    select?: ext_detailhoadonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_detailhoadon
     */
    omit?: ext_detailhoadonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_detailhoadonInclude<ExtArgs> | null
  }


  /**
   * Model ext_sanphamhoadon
   */

  export type AggregateExt_sanphamhoadon = {
    _count: Ext_sanphamhoadonCountAggregateOutputType | null
    _avg: Ext_sanphamhoadonAvgAggregateOutputType | null
    _sum: Ext_sanphamhoadonSumAggregateOutputType | null
    _min: Ext_sanphamhoadonMinAggregateOutputType | null
    _max: Ext_sanphamhoadonMaxAggregateOutputType | null
  }

  export type Ext_sanphamhoadonAvgAggregateOutputType = {
    dgia: Decimal | null
  }

  export type Ext_sanphamhoadonSumAggregateOutputType = {
    dgia: Decimal | null
  }

  export type Ext_sanphamhoadonMinAggregateOutputType = {
    id: string | null
    iddetailhoadon: string | null
    ten: string | null
    ten2: string | null
    ma: string | null
    dvt: string | null
    dgia: Decimal | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type Ext_sanphamhoadonMaxAggregateOutputType = {
    id: string | null
    iddetailhoadon: string | null
    ten: string | null
    ten2: string | null
    ma: string | null
    dvt: string | null
    dgia: Decimal | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type Ext_sanphamhoadonCountAggregateOutputType = {
    id: number
    iddetailhoadon: number
    ten: number
    ten2: number
    ma: number
    dvt: number
    dgia: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type Ext_sanphamhoadonAvgAggregateInputType = {
    dgia?: true
  }

  export type Ext_sanphamhoadonSumAggregateInputType = {
    dgia?: true
  }

  export type Ext_sanphamhoadonMinAggregateInputType = {
    id?: true
    iddetailhoadon?: true
    ten?: true
    ten2?: true
    ma?: true
    dvt?: true
    dgia?: true
    createdAt?: true
    updatedAt?: true
  }

  export type Ext_sanphamhoadonMaxAggregateInputType = {
    id?: true
    iddetailhoadon?: true
    ten?: true
    ten2?: true
    ma?: true
    dvt?: true
    dgia?: true
    createdAt?: true
    updatedAt?: true
  }

  export type Ext_sanphamhoadonCountAggregateInputType = {
    id?: true
    iddetailhoadon?: true
    ten?: true
    ten2?: true
    ma?: true
    dvt?: true
    dgia?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type Ext_sanphamhoadonAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ext_sanphamhoadon to aggregate.
     */
    where?: ext_sanphamhoadonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ext_sanphamhoadons to fetch.
     */
    orderBy?: ext_sanphamhoadonOrderByWithRelationInput | ext_sanphamhoadonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ext_sanphamhoadonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ext_sanphamhoadons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ext_sanphamhoadons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ext_sanphamhoadons
    **/
    _count?: true | Ext_sanphamhoadonCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Ext_sanphamhoadonAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Ext_sanphamhoadonSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Ext_sanphamhoadonMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Ext_sanphamhoadonMaxAggregateInputType
  }

  export type GetExt_sanphamhoadonAggregateType<T extends Ext_sanphamhoadonAggregateArgs> = {
        [P in keyof T & keyof AggregateExt_sanphamhoadon]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateExt_sanphamhoadon[P]>
      : GetScalarType<T[P], AggregateExt_sanphamhoadon[P]>
  }




  export type ext_sanphamhoadonGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ext_sanphamhoadonWhereInput
    orderBy?: ext_sanphamhoadonOrderByWithAggregationInput | ext_sanphamhoadonOrderByWithAggregationInput[]
    by: Ext_sanphamhoadonScalarFieldEnum[] | Ext_sanphamhoadonScalarFieldEnum
    having?: ext_sanphamhoadonScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Ext_sanphamhoadonCountAggregateInputType | true
    _avg?: Ext_sanphamhoadonAvgAggregateInputType
    _sum?: Ext_sanphamhoadonSumAggregateInputType
    _min?: Ext_sanphamhoadonMinAggregateInputType
    _max?: Ext_sanphamhoadonMaxAggregateInputType
  }

  export type Ext_sanphamhoadonGroupByOutputType = {
    id: string
    iddetailhoadon: string
    ten: string
    ten2: string | null
    ma: string | null
    dvt: string | null
    dgia: Decimal
    createdAt: Date
    updatedAt: Date
    _count: Ext_sanphamhoadonCountAggregateOutputType | null
    _avg: Ext_sanphamhoadonAvgAggregateOutputType | null
    _sum: Ext_sanphamhoadonSumAggregateOutputType | null
    _min: Ext_sanphamhoadonMinAggregateOutputType | null
    _max: Ext_sanphamhoadonMaxAggregateOutputType | null
  }

  type GetExt_sanphamhoadonGroupByPayload<T extends ext_sanphamhoadonGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Ext_sanphamhoadonGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Ext_sanphamhoadonGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Ext_sanphamhoadonGroupByOutputType[P]>
            : GetScalarType<T[P], Ext_sanphamhoadonGroupByOutputType[P]>
        }
      >
    >


  export type ext_sanphamhoadonSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    iddetailhoadon?: boolean
    ten?: boolean
    ten2?: boolean
    ma?: boolean
    dvt?: boolean
    dgia?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    detail?: boolean | ext_detailhoadonDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ext_sanphamhoadon"]>

  export type ext_sanphamhoadonSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    iddetailhoadon?: boolean
    ten?: boolean
    ten2?: boolean
    ma?: boolean
    dvt?: boolean
    dgia?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    detail?: boolean | ext_detailhoadonDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ext_sanphamhoadon"]>

  export type ext_sanphamhoadonSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    iddetailhoadon?: boolean
    ten?: boolean
    ten2?: boolean
    ma?: boolean
    dvt?: boolean
    dgia?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    detail?: boolean | ext_detailhoadonDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ext_sanphamhoadon"]>

  export type ext_sanphamhoadonSelectScalar = {
    id?: boolean
    iddetailhoadon?: boolean
    ten?: boolean
    ten2?: boolean
    ma?: boolean
    dvt?: boolean
    dgia?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ext_sanphamhoadonOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "iddetailhoadon" | "ten" | "ten2" | "ma" | "dvt" | "dgia" | "createdAt" | "updatedAt", ExtArgs["result"]["ext_sanphamhoadon"]>
  export type ext_sanphamhoadonInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    detail?: boolean | ext_detailhoadonDefaultArgs<ExtArgs>
  }
  export type ext_sanphamhoadonIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    detail?: boolean | ext_detailhoadonDefaultArgs<ExtArgs>
  }
  export type ext_sanphamhoadonIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    detail?: boolean | ext_detailhoadonDefaultArgs<ExtArgs>
  }

  export type $ext_sanphamhoadonPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ext_sanphamhoadon"
    objects: {
      detail: Prisma.$ext_detailhoadonPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      iddetailhoadon: string
      ten: string
      ten2: string | null
      ma: string | null
      dvt: string | null
      dgia: Prisma.Decimal
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["ext_sanphamhoadon"]>
    composites: {}
  }

  type ext_sanphamhoadonGetPayload<S extends boolean | null | undefined | ext_sanphamhoadonDefaultArgs> = $Result.GetResult<Prisma.$ext_sanphamhoadonPayload, S>

  type ext_sanphamhoadonCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ext_sanphamhoadonFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Ext_sanphamhoadonCountAggregateInputType | true
    }

  export interface ext_sanphamhoadonDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ext_sanphamhoadon'], meta: { name: 'ext_sanphamhoadon' } }
    /**
     * Find zero or one Ext_sanphamhoadon that matches the filter.
     * @param {ext_sanphamhoadonFindUniqueArgs} args - Arguments to find a Ext_sanphamhoadon
     * @example
     * // Get one Ext_sanphamhoadon
     * const ext_sanphamhoadon = await prisma.ext_sanphamhoadon.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ext_sanphamhoadonFindUniqueArgs>(args: SelectSubset<T, ext_sanphamhoadonFindUniqueArgs<ExtArgs>>): Prisma__ext_sanphamhoadonClient<$Result.GetResult<Prisma.$ext_sanphamhoadonPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Ext_sanphamhoadon that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ext_sanphamhoadonFindUniqueOrThrowArgs} args - Arguments to find a Ext_sanphamhoadon
     * @example
     * // Get one Ext_sanphamhoadon
     * const ext_sanphamhoadon = await prisma.ext_sanphamhoadon.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ext_sanphamhoadonFindUniqueOrThrowArgs>(args: SelectSubset<T, ext_sanphamhoadonFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ext_sanphamhoadonClient<$Result.GetResult<Prisma.$ext_sanphamhoadonPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ext_sanphamhoadon that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_sanphamhoadonFindFirstArgs} args - Arguments to find a Ext_sanphamhoadon
     * @example
     * // Get one Ext_sanphamhoadon
     * const ext_sanphamhoadon = await prisma.ext_sanphamhoadon.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ext_sanphamhoadonFindFirstArgs>(args?: SelectSubset<T, ext_sanphamhoadonFindFirstArgs<ExtArgs>>): Prisma__ext_sanphamhoadonClient<$Result.GetResult<Prisma.$ext_sanphamhoadonPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ext_sanphamhoadon that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_sanphamhoadonFindFirstOrThrowArgs} args - Arguments to find a Ext_sanphamhoadon
     * @example
     * // Get one Ext_sanphamhoadon
     * const ext_sanphamhoadon = await prisma.ext_sanphamhoadon.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ext_sanphamhoadonFindFirstOrThrowArgs>(args?: SelectSubset<T, ext_sanphamhoadonFindFirstOrThrowArgs<ExtArgs>>): Prisma__ext_sanphamhoadonClient<$Result.GetResult<Prisma.$ext_sanphamhoadonPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Ext_sanphamhoadons that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_sanphamhoadonFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Ext_sanphamhoadons
     * const ext_sanphamhoadons = await prisma.ext_sanphamhoadon.findMany()
     * 
     * // Get first 10 Ext_sanphamhoadons
     * const ext_sanphamhoadons = await prisma.ext_sanphamhoadon.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const ext_sanphamhoadonWithIdOnly = await prisma.ext_sanphamhoadon.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ext_sanphamhoadonFindManyArgs>(args?: SelectSubset<T, ext_sanphamhoadonFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ext_sanphamhoadonPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Ext_sanphamhoadon.
     * @param {ext_sanphamhoadonCreateArgs} args - Arguments to create a Ext_sanphamhoadon.
     * @example
     * // Create one Ext_sanphamhoadon
     * const Ext_sanphamhoadon = await prisma.ext_sanphamhoadon.create({
     *   data: {
     *     // ... data to create a Ext_sanphamhoadon
     *   }
     * })
     * 
     */
    create<T extends ext_sanphamhoadonCreateArgs>(args: SelectSubset<T, ext_sanphamhoadonCreateArgs<ExtArgs>>): Prisma__ext_sanphamhoadonClient<$Result.GetResult<Prisma.$ext_sanphamhoadonPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Ext_sanphamhoadons.
     * @param {ext_sanphamhoadonCreateManyArgs} args - Arguments to create many Ext_sanphamhoadons.
     * @example
     * // Create many Ext_sanphamhoadons
     * const ext_sanphamhoadon = await prisma.ext_sanphamhoadon.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ext_sanphamhoadonCreateManyArgs>(args?: SelectSubset<T, ext_sanphamhoadonCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Ext_sanphamhoadons and returns the data saved in the database.
     * @param {ext_sanphamhoadonCreateManyAndReturnArgs} args - Arguments to create many Ext_sanphamhoadons.
     * @example
     * // Create many Ext_sanphamhoadons
     * const ext_sanphamhoadon = await prisma.ext_sanphamhoadon.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Ext_sanphamhoadons and only return the `id`
     * const ext_sanphamhoadonWithIdOnly = await prisma.ext_sanphamhoadon.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ext_sanphamhoadonCreateManyAndReturnArgs>(args?: SelectSubset<T, ext_sanphamhoadonCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ext_sanphamhoadonPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Ext_sanphamhoadon.
     * @param {ext_sanphamhoadonDeleteArgs} args - Arguments to delete one Ext_sanphamhoadon.
     * @example
     * // Delete one Ext_sanphamhoadon
     * const Ext_sanphamhoadon = await prisma.ext_sanphamhoadon.delete({
     *   where: {
     *     // ... filter to delete one Ext_sanphamhoadon
     *   }
     * })
     * 
     */
    delete<T extends ext_sanphamhoadonDeleteArgs>(args: SelectSubset<T, ext_sanphamhoadonDeleteArgs<ExtArgs>>): Prisma__ext_sanphamhoadonClient<$Result.GetResult<Prisma.$ext_sanphamhoadonPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Ext_sanphamhoadon.
     * @param {ext_sanphamhoadonUpdateArgs} args - Arguments to update one Ext_sanphamhoadon.
     * @example
     * // Update one Ext_sanphamhoadon
     * const ext_sanphamhoadon = await prisma.ext_sanphamhoadon.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ext_sanphamhoadonUpdateArgs>(args: SelectSubset<T, ext_sanphamhoadonUpdateArgs<ExtArgs>>): Prisma__ext_sanphamhoadonClient<$Result.GetResult<Prisma.$ext_sanphamhoadonPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Ext_sanphamhoadons.
     * @param {ext_sanphamhoadonDeleteManyArgs} args - Arguments to filter Ext_sanphamhoadons to delete.
     * @example
     * // Delete a few Ext_sanphamhoadons
     * const { count } = await prisma.ext_sanphamhoadon.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ext_sanphamhoadonDeleteManyArgs>(args?: SelectSubset<T, ext_sanphamhoadonDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ext_sanphamhoadons.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_sanphamhoadonUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Ext_sanphamhoadons
     * const ext_sanphamhoadon = await prisma.ext_sanphamhoadon.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ext_sanphamhoadonUpdateManyArgs>(args: SelectSubset<T, ext_sanphamhoadonUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ext_sanphamhoadons and returns the data updated in the database.
     * @param {ext_sanphamhoadonUpdateManyAndReturnArgs} args - Arguments to update many Ext_sanphamhoadons.
     * @example
     * // Update many Ext_sanphamhoadons
     * const ext_sanphamhoadon = await prisma.ext_sanphamhoadon.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Ext_sanphamhoadons and only return the `id`
     * const ext_sanphamhoadonWithIdOnly = await prisma.ext_sanphamhoadon.updateManyAndReturn({
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
    updateManyAndReturn<T extends ext_sanphamhoadonUpdateManyAndReturnArgs>(args: SelectSubset<T, ext_sanphamhoadonUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ext_sanphamhoadonPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Ext_sanphamhoadon.
     * @param {ext_sanphamhoadonUpsertArgs} args - Arguments to update or create a Ext_sanphamhoadon.
     * @example
     * // Update or create a Ext_sanphamhoadon
     * const ext_sanphamhoadon = await prisma.ext_sanphamhoadon.upsert({
     *   create: {
     *     // ... data to create a Ext_sanphamhoadon
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Ext_sanphamhoadon we want to update
     *   }
     * })
     */
    upsert<T extends ext_sanphamhoadonUpsertArgs>(args: SelectSubset<T, ext_sanphamhoadonUpsertArgs<ExtArgs>>): Prisma__ext_sanphamhoadonClient<$Result.GetResult<Prisma.$ext_sanphamhoadonPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Ext_sanphamhoadons.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_sanphamhoadonCountArgs} args - Arguments to filter Ext_sanphamhoadons to count.
     * @example
     * // Count the number of Ext_sanphamhoadons
     * const count = await prisma.ext_sanphamhoadon.count({
     *   where: {
     *     // ... the filter for the Ext_sanphamhoadons we want to count
     *   }
     * })
    **/
    count<T extends ext_sanphamhoadonCountArgs>(
      args?: Subset<T, ext_sanphamhoadonCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Ext_sanphamhoadonCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Ext_sanphamhoadon.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Ext_sanphamhoadonAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Ext_sanphamhoadonAggregateArgs>(args: Subset<T, Ext_sanphamhoadonAggregateArgs>): Prisma.PrismaPromise<GetExt_sanphamhoadonAggregateType<T>>

    /**
     * Group by Ext_sanphamhoadon.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_sanphamhoadonGroupByArgs} args - Group by arguments.
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
      T extends ext_sanphamhoadonGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ext_sanphamhoadonGroupByArgs['orderBy'] }
        : { orderBy?: ext_sanphamhoadonGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ext_sanphamhoadonGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetExt_sanphamhoadonGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ext_sanphamhoadon model
   */
  readonly fields: ext_sanphamhoadonFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ext_sanphamhoadon.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ext_sanphamhoadonClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    detail<T extends ext_detailhoadonDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ext_detailhoadonDefaultArgs<ExtArgs>>): Prisma__ext_detailhoadonClient<$Result.GetResult<Prisma.$ext_detailhoadonPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the ext_sanphamhoadon model
   */
  interface ext_sanphamhoadonFieldRefs {
    readonly id: FieldRef<"ext_sanphamhoadon", 'String'>
    readonly iddetailhoadon: FieldRef<"ext_sanphamhoadon", 'String'>
    readonly ten: FieldRef<"ext_sanphamhoadon", 'String'>
    readonly ten2: FieldRef<"ext_sanphamhoadon", 'String'>
    readonly ma: FieldRef<"ext_sanphamhoadon", 'String'>
    readonly dvt: FieldRef<"ext_sanphamhoadon", 'String'>
    readonly dgia: FieldRef<"ext_sanphamhoadon", 'Decimal'>
    readonly createdAt: FieldRef<"ext_sanphamhoadon", 'DateTime'>
    readonly updatedAt: FieldRef<"ext_sanphamhoadon", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ext_sanphamhoadon findUnique
   */
  export type ext_sanphamhoadonFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_sanphamhoadon
     */
    select?: ext_sanphamhoadonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_sanphamhoadon
     */
    omit?: ext_sanphamhoadonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_sanphamhoadonInclude<ExtArgs> | null
    /**
     * Filter, which ext_sanphamhoadon to fetch.
     */
    where: ext_sanphamhoadonWhereUniqueInput
  }

  /**
   * ext_sanphamhoadon findUniqueOrThrow
   */
  export type ext_sanphamhoadonFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_sanphamhoadon
     */
    select?: ext_sanphamhoadonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_sanphamhoadon
     */
    omit?: ext_sanphamhoadonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_sanphamhoadonInclude<ExtArgs> | null
    /**
     * Filter, which ext_sanphamhoadon to fetch.
     */
    where: ext_sanphamhoadonWhereUniqueInput
  }

  /**
   * ext_sanphamhoadon findFirst
   */
  export type ext_sanphamhoadonFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_sanphamhoadon
     */
    select?: ext_sanphamhoadonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_sanphamhoadon
     */
    omit?: ext_sanphamhoadonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_sanphamhoadonInclude<ExtArgs> | null
    /**
     * Filter, which ext_sanphamhoadon to fetch.
     */
    where?: ext_sanphamhoadonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ext_sanphamhoadons to fetch.
     */
    orderBy?: ext_sanphamhoadonOrderByWithRelationInput | ext_sanphamhoadonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ext_sanphamhoadons.
     */
    cursor?: ext_sanphamhoadonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ext_sanphamhoadons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ext_sanphamhoadons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ext_sanphamhoadons.
     */
    distinct?: Ext_sanphamhoadonScalarFieldEnum | Ext_sanphamhoadonScalarFieldEnum[]
  }

  /**
   * ext_sanphamhoadon findFirstOrThrow
   */
  export type ext_sanphamhoadonFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_sanphamhoadon
     */
    select?: ext_sanphamhoadonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_sanphamhoadon
     */
    omit?: ext_sanphamhoadonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_sanphamhoadonInclude<ExtArgs> | null
    /**
     * Filter, which ext_sanphamhoadon to fetch.
     */
    where?: ext_sanphamhoadonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ext_sanphamhoadons to fetch.
     */
    orderBy?: ext_sanphamhoadonOrderByWithRelationInput | ext_sanphamhoadonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ext_sanphamhoadons.
     */
    cursor?: ext_sanphamhoadonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ext_sanphamhoadons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ext_sanphamhoadons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ext_sanphamhoadons.
     */
    distinct?: Ext_sanphamhoadonScalarFieldEnum | Ext_sanphamhoadonScalarFieldEnum[]
  }

  /**
   * ext_sanphamhoadon findMany
   */
  export type ext_sanphamhoadonFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_sanphamhoadon
     */
    select?: ext_sanphamhoadonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_sanphamhoadon
     */
    omit?: ext_sanphamhoadonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_sanphamhoadonInclude<ExtArgs> | null
    /**
     * Filter, which ext_sanphamhoadons to fetch.
     */
    where?: ext_sanphamhoadonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ext_sanphamhoadons to fetch.
     */
    orderBy?: ext_sanphamhoadonOrderByWithRelationInput | ext_sanphamhoadonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ext_sanphamhoadons.
     */
    cursor?: ext_sanphamhoadonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ext_sanphamhoadons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ext_sanphamhoadons.
     */
    skip?: number
    distinct?: Ext_sanphamhoadonScalarFieldEnum | Ext_sanphamhoadonScalarFieldEnum[]
  }

  /**
   * ext_sanphamhoadon create
   */
  export type ext_sanphamhoadonCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_sanphamhoadon
     */
    select?: ext_sanphamhoadonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_sanphamhoadon
     */
    omit?: ext_sanphamhoadonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_sanphamhoadonInclude<ExtArgs> | null
    /**
     * The data needed to create a ext_sanphamhoadon.
     */
    data: XOR<ext_sanphamhoadonCreateInput, ext_sanphamhoadonUncheckedCreateInput>
  }

  /**
   * ext_sanphamhoadon createMany
   */
  export type ext_sanphamhoadonCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ext_sanphamhoadons.
     */
    data: ext_sanphamhoadonCreateManyInput | ext_sanphamhoadonCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ext_sanphamhoadon createManyAndReturn
   */
  export type ext_sanphamhoadonCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_sanphamhoadon
     */
    select?: ext_sanphamhoadonSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ext_sanphamhoadon
     */
    omit?: ext_sanphamhoadonOmit<ExtArgs> | null
    /**
     * The data used to create many ext_sanphamhoadons.
     */
    data: ext_sanphamhoadonCreateManyInput | ext_sanphamhoadonCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_sanphamhoadonIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ext_sanphamhoadon update
   */
  export type ext_sanphamhoadonUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_sanphamhoadon
     */
    select?: ext_sanphamhoadonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_sanphamhoadon
     */
    omit?: ext_sanphamhoadonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_sanphamhoadonInclude<ExtArgs> | null
    /**
     * The data needed to update a ext_sanphamhoadon.
     */
    data: XOR<ext_sanphamhoadonUpdateInput, ext_sanphamhoadonUncheckedUpdateInput>
    /**
     * Choose, which ext_sanphamhoadon to update.
     */
    where: ext_sanphamhoadonWhereUniqueInput
  }

  /**
   * ext_sanphamhoadon updateMany
   */
  export type ext_sanphamhoadonUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ext_sanphamhoadons.
     */
    data: XOR<ext_sanphamhoadonUpdateManyMutationInput, ext_sanphamhoadonUncheckedUpdateManyInput>
    /**
     * Filter which ext_sanphamhoadons to update
     */
    where?: ext_sanphamhoadonWhereInput
    /**
     * Limit how many ext_sanphamhoadons to update.
     */
    limit?: number
  }

  /**
   * ext_sanphamhoadon updateManyAndReturn
   */
  export type ext_sanphamhoadonUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_sanphamhoadon
     */
    select?: ext_sanphamhoadonSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ext_sanphamhoadon
     */
    omit?: ext_sanphamhoadonOmit<ExtArgs> | null
    /**
     * The data used to update ext_sanphamhoadons.
     */
    data: XOR<ext_sanphamhoadonUpdateManyMutationInput, ext_sanphamhoadonUncheckedUpdateManyInput>
    /**
     * Filter which ext_sanphamhoadons to update
     */
    where?: ext_sanphamhoadonWhereInput
    /**
     * Limit how many ext_sanphamhoadons to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_sanphamhoadonIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ext_sanphamhoadon upsert
   */
  export type ext_sanphamhoadonUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_sanphamhoadon
     */
    select?: ext_sanphamhoadonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_sanphamhoadon
     */
    omit?: ext_sanphamhoadonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_sanphamhoadonInclude<ExtArgs> | null
    /**
     * The filter to search for the ext_sanphamhoadon to update in case it exists.
     */
    where: ext_sanphamhoadonWhereUniqueInput
    /**
     * In case the ext_sanphamhoadon found by the `where` argument doesn't exist, create a new ext_sanphamhoadon with this data.
     */
    create: XOR<ext_sanphamhoadonCreateInput, ext_sanphamhoadonUncheckedCreateInput>
    /**
     * In case the ext_sanphamhoadon was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ext_sanphamhoadonUpdateInput, ext_sanphamhoadonUncheckedUpdateInput>
  }

  /**
   * ext_sanphamhoadon delete
   */
  export type ext_sanphamhoadonDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_sanphamhoadon
     */
    select?: ext_sanphamhoadonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_sanphamhoadon
     */
    omit?: ext_sanphamhoadonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_sanphamhoadonInclude<ExtArgs> | null
    /**
     * Filter which ext_sanphamhoadon to delete.
     */
    where: ext_sanphamhoadonWhereUniqueInput
  }

  /**
   * ext_sanphamhoadon deleteMany
   */
  export type ext_sanphamhoadonDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ext_sanphamhoadons to delete
     */
    where?: ext_sanphamhoadonWhereInput
    /**
     * Limit how many ext_sanphamhoadons to delete.
     */
    limit?: number
  }

  /**
   * ext_sanphamhoadon without action
   */
  export type ext_sanphamhoadonDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_sanphamhoadon
     */
    select?: ext_sanphamhoadonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_sanphamhoadon
     */
    omit?: ext_sanphamhoadonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_sanphamhoadonInclude<ExtArgs> | null
  }


  /**
   * Model ext_apiconfig
   */

  export type AggregateExt_apiconfig = {
    _count: Ext_apiconfigCountAggregateOutputType | null
    _avg: Ext_apiconfigAvgAggregateOutputType | null
    _sum: Ext_apiconfigSumAggregateOutputType | null
    _min: Ext_apiconfigMinAggregateOutputType | null
    _max: Ext_apiconfigMaxAggregateOutputType | null
  }

  export type Ext_apiconfigAvgAggregateOutputType = {
    batchSize: number | null
    delayBetweenBatches: number | null
    delayBetweenDetailCalls: number | null
    maxRetries: number | null
  }

  export type Ext_apiconfigSumAggregateOutputType = {
    batchSize: number | null
    delayBetweenBatches: number | null
    delayBetweenDetailCalls: number | null
    maxRetries: number | null
  }

  export type Ext_apiconfigMinAggregateOutputType = {
    id: string | null
    name: string | null
    congtyId: string | null
    bearerToken: string | null
    baseUrl: string | null
    brandname: string | null
    batchSize: number | null
    delayBetweenBatches: number | null
    delayBetweenDetailCalls: number | null
    maxRetries: number | null
    lastSyncAt: Date | null
    lastSyncStatus: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type Ext_apiconfigMaxAggregateOutputType = {
    id: string | null
    name: string | null
    congtyId: string | null
    bearerToken: string | null
    baseUrl: string | null
    brandname: string | null
    batchSize: number | null
    delayBetweenBatches: number | null
    delayBetweenDetailCalls: number | null
    maxRetries: number | null
    lastSyncAt: Date | null
    lastSyncStatus: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type Ext_apiconfigCountAggregateOutputType = {
    id: number
    name: number
    congtyId: number
    bearerToken: number
    baseUrl: number
    brandname: number
    batchSize: number
    delayBetweenBatches: number
    delayBetweenDetailCalls: number
    maxRetries: number
    lastSyncAt: number
    lastSyncStatus: number
    isActive: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type Ext_apiconfigAvgAggregateInputType = {
    batchSize?: true
    delayBetweenBatches?: true
    delayBetweenDetailCalls?: true
    maxRetries?: true
  }

  export type Ext_apiconfigSumAggregateInputType = {
    batchSize?: true
    delayBetweenBatches?: true
    delayBetweenDetailCalls?: true
    maxRetries?: true
  }

  export type Ext_apiconfigMinAggregateInputType = {
    id?: true
    name?: true
    congtyId?: true
    bearerToken?: true
    baseUrl?: true
    brandname?: true
    batchSize?: true
    delayBetweenBatches?: true
    delayBetweenDetailCalls?: true
    maxRetries?: true
    lastSyncAt?: true
    lastSyncStatus?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type Ext_apiconfigMaxAggregateInputType = {
    id?: true
    name?: true
    congtyId?: true
    bearerToken?: true
    baseUrl?: true
    brandname?: true
    batchSize?: true
    delayBetweenBatches?: true
    delayBetweenDetailCalls?: true
    maxRetries?: true
    lastSyncAt?: true
    lastSyncStatus?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type Ext_apiconfigCountAggregateInputType = {
    id?: true
    name?: true
    congtyId?: true
    bearerToken?: true
    baseUrl?: true
    brandname?: true
    batchSize?: true
    delayBetweenBatches?: true
    delayBetweenDetailCalls?: true
    maxRetries?: true
    lastSyncAt?: true
    lastSyncStatus?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type Ext_apiconfigAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ext_apiconfig to aggregate.
     */
    where?: ext_apiconfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ext_apiconfigs to fetch.
     */
    orderBy?: ext_apiconfigOrderByWithRelationInput | ext_apiconfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ext_apiconfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ext_apiconfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ext_apiconfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ext_apiconfigs
    **/
    _count?: true | Ext_apiconfigCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Ext_apiconfigAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Ext_apiconfigSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Ext_apiconfigMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Ext_apiconfigMaxAggregateInputType
  }

  export type GetExt_apiconfigAggregateType<T extends Ext_apiconfigAggregateArgs> = {
        [P in keyof T & keyof AggregateExt_apiconfig]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateExt_apiconfig[P]>
      : GetScalarType<T[P], AggregateExt_apiconfig[P]>
  }




  export type ext_apiconfigGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ext_apiconfigWhereInput
    orderBy?: ext_apiconfigOrderByWithAggregationInput | ext_apiconfigOrderByWithAggregationInput[]
    by: Ext_apiconfigScalarFieldEnum[] | Ext_apiconfigScalarFieldEnum
    having?: ext_apiconfigScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Ext_apiconfigCountAggregateInputType | true
    _avg?: Ext_apiconfigAvgAggregateInputType
    _sum?: Ext_apiconfigSumAggregateInputType
    _min?: Ext_apiconfigMinAggregateInputType
    _max?: Ext_apiconfigMaxAggregateInputType
  }

  export type Ext_apiconfigGroupByOutputType = {
    id: string
    name: string
    congtyId: string
    bearerToken: string
    baseUrl: string
    brandname: string | null
    batchSize: number
    delayBetweenBatches: number
    delayBetweenDetailCalls: number
    maxRetries: number
    lastSyncAt: Date | null
    lastSyncStatus: string | null
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    _count: Ext_apiconfigCountAggregateOutputType | null
    _avg: Ext_apiconfigAvgAggregateOutputType | null
    _sum: Ext_apiconfigSumAggregateOutputType | null
    _min: Ext_apiconfigMinAggregateOutputType | null
    _max: Ext_apiconfigMaxAggregateOutputType | null
  }

  type GetExt_apiconfigGroupByPayload<T extends ext_apiconfigGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Ext_apiconfigGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Ext_apiconfigGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Ext_apiconfigGroupByOutputType[P]>
            : GetScalarType<T[P], Ext_apiconfigGroupByOutputType[P]>
        }
      >
    >


  export type ext_apiconfigSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    congtyId?: boolean
    bearerToken?: boolean
    baseUrl?: boolean
    brandname?: boolean
    batchSize?: boolean
    delayBetweenBatches?: boolean
    delayBetweenDetailCalls?: boolean
    maxRetries?: boolean
    lastSyncAt?: boolean
    lastSyncStatus?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    congty?: boolean | ext_congtyDefaultArgs<ExtArgs>
    synclogs?: boolean | ext_apiconfig$synclogsArgs<ExtArgs>
    _count?: boolean | Ext_apiconfigCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ext_apiconfig"]>

  export type ext_apiconfigSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    congtyId?: boolean
    bearerToken?: boolean
    baseUrl?: boolean
    brandname?: boolean
    batchSize?: boolean
    delayBetweenBatches?: boolean
    delayBetweenDetailCalls?: boolean
    maxRetries?: boolean
    lastSyncAt?: boolean
    lastSyncStatus?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    congty?: boolean | ext_congtyDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ext_apiconfig"]>

  export type ext_apiconfigSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    congtyId?: boolean
    bearerToken?: boolean
    baseUrl?: boolean
    brandname?: boolean
    batchSize?: boolean
    delayBetweenBatches?: boolean
    delayBetweenDetailCalls?: boolean
    maxRetries?: boolean
    lastSyncAt?: boolean
    lastSyncStatus?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    congty?: boolean | ext_congtyDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ext_apiconfig"]>

  export type ext_apiconfigSelectScalar = {
    id?: boolean
    name?: boolean
    congtyId?: boolean
    bearerToken?: boolean
    baseUrl?: boolean
    brandname?: boolean
    batchSize?: boolean
    delayBetweenBatches?: boolean
    delayBetweenDetailCalls?: boolean
    maxRetries?: boolean
    lastSyncAt?: boolean
    lastSyncStatus?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ext_apiconfigOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "congtyId" | "bearerToken" | "baseUrl" | "brandname" | "batchSize" | "delayBetweenBatches" | "delayBetweenDetailCalls" | "maxRetries" | "lastSyncAt" | "lastSyncStatus" | "isActive" | "createdAt" | "updatedAt", ExtArgs["result"]["ext_apiconfig"]>
  export type ext_apiconfigInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    congty?: boolean | ext_congtyDefaultArgs<ExtArgs>
    synclogs?: boolean | ext_apiconfig$synclogsArgs<ExtArgs>
    _count?: boolean | Ext_apiconfigCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ext_apiconfigIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    congty?: boolean | ext_congtyDefaultArgs<ExtArgs>
  }
  export type ext_apiconfigIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    congty?: boolean | ext_congtyDefaultArgs<ExtArgs>
  }

  export type $ext_apiconfigPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ext_apiconfig"
    objects: {
      congty: Prisma.$ext_congtyPayload<ExtArgs>
      synclogs: Prisma.$ext_synclogPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      congtyId: string
      bearerToken: string
      baseUrl: string
      brandname: string | null
      batchSize: number
      delayBetweenBatches: number
      delayBetweenDetailCalls: number
      maxRetries: number
      lastSyncAt: Date | null
      lastSyncStatus: string | null
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["ext_apiconfig"]>
    composites: {}
  }

  type ext_apiconfigGetPayload<S extends boolean | null | undefined | ext_apiconfigDefaultArgs> = $Result.GetResult<Prisma.$ext_apiconfigPayload, S>

  type ext_apiconfigCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ext_apiconfigFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Ext_apiconfigCountAggregateInputType | true
    }

  export interface ext_apiconfigDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ext_apiconfig'], meta: { name: 'ext_apiconfig' } }
    /**
     * Find zero or one Ext_apiconfig that matches the filter.
     * @param {ext_apiconfigFindUniqueArgs} args - Arguments to find a Ext_apiconfig
     * @example
     * // Get one Ext_apiconfig
     * const ext_apiconfig = await prisma.ext_apiconfig.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ext_apiconfigFindUniqueArgs>(args: SelectSubset<T, ext_apiconfigFindUniqueArgs<ExtArgs>>): Prisma__ext_apiconfigClient<$Result.GetResult<Prisma.$ext_apiconfigPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Ext_apiconfig that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ext_apiconfigFindUniqueOrThrowArgs} args - Arguments to find a Ext_apiconfig
     * @example
     * // Get one Ext_apiconfig
     * const ext_apiconfig = await prisma.ext_apiconfig.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ext_apiconfigFindUniqueOrThrowArgs>(args: SelectSubset<T, ext_apiconfigFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ext_apiconfigClient<$Result.GetResult<Prisma.$ext_apiconfigPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ext_apiconfig that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_apiconfigFindFirstArgs} args - Arguments to find a Ext_apiconfig
     * @example
     * // Get one Ext_apiconfig
     * const ext_apiconfig = await prisma.ext_apiconfig.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ext_apiconfigFindFirstArgs>(args?: SelectSubset<T, ext_apiconfigFindFirstArgs<ExtArgs>>): Prisma__ext_apiconfigClient<$Result.GetResult<Prisma.$ext_apiconfigPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ext_apiconfig that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_apiconfigFindFirstOrThrowArgs} args - Arguments to find a Ext_apiconfig
     * @example
     * // Get one Ext_apiconfig
     * const ext_apiconfig = await prisma.ext_apiconfig.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ext_apiconfigFindFirstOrThrowArgs>(args?: SelectSubset<T, ext_apiconfigFindFirstOrThrowArgs<ExtArgs>>): Prisma__ext_apiconfigClient<$Result.GetResult<Prisma.$ext_apiconfigPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Ext_apiconfigs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_apiconfigFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Ext_apiconfigs
     * const ext_apiconfigs = await prisma.ext_apiconfig.findMany()
     * 
     * // Get first 10 Ext_apiconfigs
     * const ext_apiconfigs = await prisma.ext_apiconfig.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const ext_apiconfigWithIdOnly = await prisma.ext_apiconfig.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ext_apiconfigFindManyArgs>(args?: SelectSubset<T, ext_apiconfigFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ext_apiconfigPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Ext_apiconfig.
     * @param {ext_apiconfigCreateArgs} args - Arguments to create a Ext_apiconfig.
     * @example
     * // Create one Ext_apiconfig
     * const Ext_apiconfig = await prisma.ext_apiconfig.create({
     *   data: {
     *     // ... data to create a Ext_apiconfig
     *   }
     * })
     * 
     */
    create<T extends ext_apiconfigCreateArgs>(args: SelectSubset<T, ext_apiconfigCreateArgs<ExtArgs>>): Prisma__ext_apiconfigClient<$Result.GetResult<Prisma.$ext_apiconfigPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Ext_apiconfigs.
     * @param {ext_apiconfigCreateManyArgs} args - Arguments to create many Ext_apiconfigs.
     * @example
     * // Create many Ext_apiconfigs
     * const ext_apiconfig = await prisma.ext_apiconfig.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ext_apiconfigCreateManyArgs>(args?: SelectSubset<T, ext_apiconfigCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Ext_apiconfigs and returns the data saved in the database.
     * @param {ext_apiconfigCreateManyAndReturnArgs} args - Arguments to create many Ext_apiconfigs.
     * @example
     * // Create many Ext_apiconfigs
     * const ext_apiconfig = await prisma.ext_apiconfig.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Ext_apiconfigs and only return the `id`
     * const ext_apiconfigWithIdOnly = await prisma.ext_apiconfig.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ext_apiconfigCreateManyAndReturnArgs>(args?: SelectSubset<T, ext_apiconfigCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ext_apiconfigPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Ext_apiconfig.
     * @param {ext_apiconfigDeleteArgs} args - Arguments to delete one Ext_apiconfig.
     * @example
     * // Delete one Ext_apiconfig
     * const Ext_apiconfig = await prisma.ext_apiconfig.delete({
     *   where: {
     *     // ... filter to delete one Ext_apiconfig
     *   }
     * })
     * 
     */
    delete<T extends ext_apiconfigDeleteArgs>(args: SelectSubset<T, ext_apiconfigDeleteArgs<ExtArgs>>): Prisma__ext_apiconfigClient<$Result.GetResult<Prisma.$ext_apiconfigPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Ext_apiconfig.
     * @param {ext_apiconfigUpdateArgs} args - Arguments to update one Ext_apiconfig.
     * @example
     * // Update one Ext_apiconfig
     * const ext_apiconfig = await prisma.ext_apiconfig.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ext_apiconfigUpdateArgs>(args: SelectSubset<T, ext_apiconfigUpdateArgs<ExtArgs>>): Prisma__ext_apiconfigClient<$Result.GetResult<Prisma.$ext_apiconfigPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Ext_apiconfigs.
     * @param {ext_apiconfigDeleteManyArgs} args - Arguments to filter Ext_apiconfigs to delete.
     * @example
     * // Delete a few Ext_apiconfigs
     * const { count } = await prisma.ext_apiconfig.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ext_apiconfigDeleteManyArgs>(args?: SelectSubset<T, ext_apiconfigDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ext_apiconfigs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_apiconfigUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Ext_apiconfigs
     * const ext_apiconfig = await prisma.ext_apiconfig.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ext_apiconfigUpdateManyArgs>(args: SelectSubset<T, ext_apiconfigUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ext_apiconfigs and returns the data updated in the database.
     * @param {ext_apiconfigUpdateManyAndReturnArgs} args - Arguments to update many Ext_apiconfigs.
     * @example
     * // Update many Ext_apiconfigs
     * const ext_apiconfig = await prisma.ext_apiconfig.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Ext_apiconfigs and only return the `id`
     * const ext_apiconfigWithIdOnly = await prisma.ext_apiconfig.updateManyAndReturn({
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
    updateManyAndReturn<T extends ext_apiconfigUpdateManyAndReturnArgs>(args: SelectSubset<T, ext_apiconfigUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ext_apiconfigPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Ext_apiconfig.
     * @param {ext_apiconfigUpsertArgs} args - Arguments to update or create a Ext_apiconfig.
     * @example
     * // Update or create a Ext_apiconfig
     * const ext_apiconfig = await prisma.ext_apiconfig.upsert({
     *   create: {
     *     // ... data to create a Ext_apiconfig
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Ext_apiconfig we want to update
     *   }
     * })
     */
    upsert<T extends ext_apiconfigUpsertArgs>(args: SelectSubset<T, ext_apiconfigUpsertArgs<ExtArgs>>): Prisma__ext_apiconfigClient<$Result.GetResult<Prisma.$ext_apiconfigPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Ext_apiconfigs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_apiconfigCountArgs} args - Arguments to filter Ext_apiconfigs to count.
     * @example
     * // Count the number of Ext_apiconfigs
     * const count = await prisma.ext_apiconfig.count({
     *   where: {
     *     // ... the filter for the Ext_apiconfigs we want to count
     *   }
     * })
    **/
    count<T extends ext_apiconfigCountArgs>(
      args?: Subset<T, ext_apiconfigCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Ext_apiconfigCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Ext_apiconfig.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Ext_apiconfigAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Ext_apiconfigAggregateArgs>(args: Subset<T, Ext_apiconfigAggregateArgs>): Prisma.PrismaPromise<GetExt_apiconfigAggregateType<T>>

    /**
     * Group by Ext_apiconfig.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_apiconfigGroupByArgs} args - Group by arguments.
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
      T extends ext_apiconfigGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ext_apiconfigGroupByArgs['orderBy'] }
        : { orderBy?: ext_apiconfigGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ext_apiconfigGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetExt_apiconfigGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ext_apiconfig model
   */
  readonly fields: ext_apiconfigFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ext_apiconfig.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ext_apiconfigClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    congty<T extends ext_congtyDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ext_congtyDefaultArgs<ExtArgs>>): Prisma__ext_congtyClient<$Result.GetResult<Prisma.$ext_congtyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    synclogs<T extends ext_apiconfig$synclogsArgs<ExtArgs> = {}>(args?: Subset<T, ext_apiconfig$synclogsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ext_synclogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the ext_apiconfig model
   */
  interface ext_apiconfigFieldRefs {
    readonly id: FieldRef<"ext_apiconfig", 'String'>
    readonly name: FieldRef<"ext_apiconfig", 'String'>
    readonly congtyId: FieldRef<"ext_apiconfig", 'String'>
    readonly bearerToken: FieldRef<"ext_apiconfig", 'String'>
    readonly baseUrl: FieldRef<"ext_apiconfig", 'String'>
    readonly brandname: FieldRef<"ext_apiconfig", 'String'>
    readonly batchSize: FieldRef<"ext_apiconfig", 'Int'>
    readonly delayBetweenBatches: FieldRef<"ext_apiconfig", 'Int'>
    readonly delayBetweenDetailCalls: FieldRef<"ext_apiconfig", 'Int'>
    readonly maxRetries: FieldRef<"ext_apiconfig", 'Int'>
    readonly lastSyncAt: FieldRef<"ext_apiconfig", 'DateTime'>
    readonly lastSyncStatus: FieldRef<"ext_apiconfig", 'String'>
    readonly isActive: FieldRef<"ext_apiconfig", 'Boolean'>
    readonly createdAt: FieldRef<"ext_apiconfig", 'DateTime'>
    readonly updatedAt: FieldRef<"ext_apiconfig", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ext_apiconfig findUnique
   */
  export type ext_apiconfigFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_apiconfig
     */
    select?: ext_apiconfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_apiconfig
     */
    omit?: ext_apiconfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_apiconfigInclude<ExtArgs> | null
    /**
     * Filter, which ext_apiconfig to fetch.
     */
    where: ext_apiconfigWhereUniqueInput
  }

  /**
   * ext_apiconfig findUniqueOrThrow
   */
  export type ext_apiconfigFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_apiconfig
     */
    select?: ext_apiconfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_apiconfig
     */
    omit?: ext_apiconfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_apiconfigInclude<ExtArgs> | null
    /**
     * Filter, which ext_apiconfig to fetch.
     */
    where: ext_apiconfigWhereUniqueInput
  }

  /**
   * ext_apiconfig findFirst
   */
  export type ext_apiconfigFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_apiconfig
     */
    select?: ext_apiconfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_apiconfig
     */
    omit?: ext_apiconfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_apiconfigInclude<ExtArgs> | null
    /**
     * Filter, which ext_apiconfig to fetch.
     */
    where?: ext_apiconfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ext_apiconfigs to fetch.
     */
    orderBy?: ext_apiconfigOrderByWithRelationInput | ext_apiconfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ext_apiconfigs.
     */
    cursor?: ext_apiconfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ext_apiconfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ext_apiconfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ext_apiconfigs.
     */
    distinct?: Ext_apiconfigScalarFieldEnum | Ext_apiconfigScalarFieldEnum[]
  }

  /**
   * ext_apiconfig findFirstOrThrow
   */
  export type ext_apiconfigFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_apiconfig
     */
    select?: ext_apiconfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_apiconfig
     */
    omit?: ext_apiconfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_apiconfigInclude<ExtArgs> | null
    /**
     * Filter, which ext_apiconfig to fetch.
     */
    where?: ext_apiconfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ext_apiconfigs to fetch.
     */
    orderBy?: ext_apiconfigOrderByWithRelationInput | ext_apiconfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ext_apiconfigs.
     */
    cursor?: ext_apiconfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ext_apiconfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ext_apiconfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ext_apiconfigs.
     */
    distinct?: Ext_apiconfigScalarFieldEnum | Ext_apiconfigScalarFieldEnum[]
  }

  /**
   * ext_apiconfig findMany
   */
  export type ext_apiconfigFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_apiconfig
     */
    select?: ext_apiconfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_apiconfig
     */
    omit?: ext_apiconfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_apiconfigInclude<ExtArgs> | null
    /**
     * Filter, which ext_apiconfigs to fetch.
     */
    where?: ext_apiconfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ext_apiconfigs to fetch.
     */
    orderBy?: ext_apiconfigOrderByWithRelationInput | ext_apiconfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ext_apiconfigs.
     */
    cursor?: ext_apiconfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ext_apiconfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ext_apiconfigs.
     */
    skip?: number
    distinct?: Ext_apiconfigScalarFieldEnum | Ext_apiconfigScalarFieldEnum[]
  }

  /**
   * ext_apiconfig create
   */
  export type ext_apiconfigCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_apiconfig
     */
    select?: ext_apiconfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_apiconfig
     */
    omit?: ext_apiconfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_apiconfigInclude<ExtArgs> | null
    /**
     * The data needed to create a ext_apiconfig.
     */
    data: XOR<ext_apiconfigCreateInput, ext_apiconfigUncheckedCreateInput>
  }

  /**
   * ext_apiconfig createMany
   */
  export type ext_apiconfigCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ext_apiconfigs.
     */
    data: ext_apiconfigCreateManyInput | ext_apiconfigCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ext_apiconfig createManyAndReturn
   */
  export type ext_apiconfigCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_apiconfig
     */
    select?: ext_apiconfigSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ext_apiconfig
     */
    omit?: ext_apiconfigOmit<ExtArgs> | null
    /**
     * The data used to create many ext_apiconfigs.
     */
    data: ext_apiconfigCreateManyInput | ext_apiconfigCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_apiconfigIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ext_apiconfig update
   */
  export type ext_apiconfigUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_apiconfig
     */
    select?: ext_apiconfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_apiconfig
     */
    omit?: ext_apiconfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_apiconfigInclude<ExtArgs> | null
    /**
     * The data needed to update a ext_apiconfig.
     */
    data: XOR<ext_apiconfigUpdateInput, ext_apiconfigUncheckedUpdateInput>
    /**
     * Choose, which ext_apiconfig to update.
     */
    where: ext_apiconfigWhereUniqueInput
  }

  /**
   * ext_apiconfig updateMany
   */
  export type ext_apiconfigUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ext_apiconfigs.
     */
    data: XOR<ext_apiconfigUpdateManyMutationInput, ext_apiconfigUncheckedUpdateManyInput>
    /**
     * Filter which ext_apiconfigs to update
     */
    where?: ext_apiconfigWhereInput
    /**
     * Limit how many ext_apiconfigs to update.
     */
    limit?: number
  }

  /**
   * ext_apiconfig updateManyAndReturn
   */
  export type ext_apiconfigUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_apiconfig
     */
    select?: ext_apiconfigSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ext_apiconfig
     */
    omit?: ext_apiconfigOmit<ExtArgs> | null
    /**
     * The data used to update ext_apiconfigs.
     */
    data: XOR<ext_apiconfigUpdateManyMutationInput, ext_apiconfigUncheckedUpdateManyInput>
    /**
     * Filter which ext_apiconfigs to update
     */
    where?: ext_apiconfigWhereInput
    /**
     * Limit how many ext_apiconfigs to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_apiconfigIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ext_apiconfig upsert
   */
  export type ext_apiconfigUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_apiconfig
     */
    select?: ext_apiconfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_apiconfig
     */
    omit?: ext_apiconfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_apiconfigInclude<ExtArgs> | null
    /**
     * The filter to search for the ext_apiconfig to update in case it exists.
     */
    where: ext_apiconfigWhereUniqueInput
    /**
     * In case the ext_apiconfig found by the `where` argument doesn't exist, create a new ext_apiconfig with this data.
     */
    create: XOR<ext_apiconfigCreateInput, ext_apiconfigUncheckedCreateInput>
    /**
     * In case the ext_apiconfig was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ext_apiconfigUpdateInput, ext_apiconfigUncheckedUpdateInput>
  }

  /**
   * ext_apiconfig delete
   */
  export type ext_apiconfigDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_apiconfig
     */
    select?: ext_apiconfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_apiconfig
     */
    omit?: ext_apiconfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_apiconfigInclude<ExtArgs> | null
    /**
     * Filter which ext_apiconfig to delete.
     */
    where: ext_apiconfigWhereUniqueInput
  }

  /**
   * ext_apiconfig deleteMany
   */
  export type ext_apiconfigDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ext_apiconfigs to delete
     */
    where?: ext_apiconfigWhereInput
    /**
     * Limit how many ext_apiconfigs to delete.
     */
    limit?: number
  }

  /**
   * ext_apiconfig.synclogs
   */
  export type ext_apiconfig$synclogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_synclog
     */
    select?: ext_synclogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_synclog
     */
    omit?: ext_synclogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_synclogInclude<ExtArgs> | null
    where?: ext_synclogWhereInput
    orderBy?: ext_synclogOrderByWithRelationInput | ext_synclogOrderByWithRelationInput[]
    cursor?: ext_synclogWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Ext_synclogScalarFieldEnum | Ext_synclogScalarFieldEnum[]
  }

  /**
   * ext_apiconfig without action
   */
  export type ext_apiconfigDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_apiconfig
     */
    select?: ext_apiconfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_apiconfig
     */
    omit?: ext_apiconfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_apiconfigInclude<ExtArgs> | null
  }


  /**
   * Model ext_synclog
   */

  export type AggregateExt_synclog = {
    _count: Ext_synclogCountAggregateOutputType | null
    _avg: Ext_synclogAvgAggregateOutputType | null
    _sum: Ext_synclogSumAggregateOutputType | null
    _min: Ext_synclogMinAggregateOutputType | null
    _max: Ext_synclogMaxAggregateOutputType | null
  }

  export type Ext_synclogAvgAggregateOutputType = {
    totalRecords: number | null
    successCount: number | null
    errorCount: number | null
  }

  export type Ext_synclogSumAggregateOutputType = {
    totalRecords: number | null
    successCount: number | null
    errorCount: number | null
  }

  export type Ext_synclogMinAggregateOutputType = {
    id: string | null
    congtyId: string | null
    configId: string | null
    syncType: string | null
    fromDate: Date | null
    toDate: Date | null
    totalRecords: number | null
    successCount: number | null
    errorCount: number | null
    status: string | null
    errorMessage: string | null
    startedAt: Date | null
    completedAt: Date | null
    createdAt: Date | null
  }

  export type Ext_synclogMaxAggregateOutputType = {
    id: string | null
    congtyId: string | null
    configId: string | null
    syncType: string | null
    fromDate: Date | null
    toDate: Date | null
    totalRecords: number | null
    successCount: number | null
    errorCount: number | null
    status: string | null
    errorMessage: string | null
    startedAt: Date | null
    completedAt: Date | null
    createdAt: Date | null
  }

  export type Ext_synclogCountAggregateOutputType = {
    id: number
    congtyId: number
    configId: number
    syncType: number
    fromDate: number
    toDate: number
    totalRecords: number
    successCount: number
    errorCount: number
    status: number
    errorMessage: number
    startedAt: number
    completedAt: number
    createdAt: number
    _all: number
  }


  export type Ext_synclogAvgAggregateInputType = {
    totalRecords?: true
    successCount?: true
    errorCount?: true
  }

  export type Ext_synclogSumAggregateInputType = {
    totalRecords?: true
    successCount?: true
    errorCount?: true
  }

  export type Ext_synclogMinAggregateInputType = {
    id?: true
    congtyId?: true
    configId?: true
    syncType?: true
    fromDate?: true
    toDate?: true
    totalRecords?: true
    successCount?: true
    errorCount?: true
    status?: true
    errorMessage?: true
    startedAt?: true
    completedAt?: true
    createdAt?: true
  }

  export type Ext_synclogMaxAggregateInputType = {
    id?: true
    congtyId?: true
    configId?: true
    syncType?: true
    fromDate?: true
    toDate?: true
    totalRecords?: true
    successCount?: true
    errorCount?: true
    status?: true
    errorMessage?: true
    startedAt?: true
    completedAt?: true
    createdAt?: true
  }

  export type Ext_synclogCountAggregateInputType = {
    id?: true
    congtyId?: true
    configId?: true
    syncType?: true
    fromDate?: true
    toDate?: true
    totalRecords?: true
    successCount?: true
    errorCount?: true
    status?: true
    errorMessage?: true
    startedAt?: true
    completedAt?: true
    createdAt?: true
    _all?: true
  }

  export type Ext_synclogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ext_synclog to aggregate.
     */
    where?: ext_synclogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ext_synclogs to fetch.
     */
    orderBy?: ext_synclogOrderByWithRelationInput | ext_synclogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ext_synclogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ext_synclogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ext_synclogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ext_synclogs
    **/
    _count?: true | Ext_synclogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Ext_synclogAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Ext_synclogSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Ext_synclogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Ext_synclogMaxAggregateInputType
  }

  export type GetExt_synclogAggregateType<T extends Ext_synclogAggregateArgs> = {
        [P in keyof T & keyof AggregateExt_synclog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateExt_synclog[P]>
      : GetScalarType<T[P], AggregateExt_synclog[P]>
  }




  export type ext_synclogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ext_synclogWhereInput
    orderBy?: ext_synclogOrderByWithAggregationInput | ext_synclogOrderByWithAggregationInput[]
    by: Ext_synclogScalarFieldEnum[] | Ext_synclogScalarFieldEnum
    having?: ext_synclogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Ext_synclogCountAggregateInputType | true
    _avg?: Ext_synclogAvgAggregateInputType
    _sum?: Ext_synclogSumAggregateInputType
    _min?: Ext_synclogMinAggregateInputType
    _max?: Ext_synclogMaxAggregateInputType
  }

  export type Ext_synclogGroupByOutputType = {
    id: string
    congtyId: string | null
    configId: string | null
    syncType: string
    fromDate: Date | null
    toDate: Date | null
    totalRecords: number
    successCount: number
    errorCount: number
    status: string
    errorMessage: string | null
    startedAt: Date
    completedAt: Date | null
    createdAt: Date
    _count: Ext_synclogCountAggregateOutputType | null
    _avg: Ext_synclogAvgAggregateOutputType | null
    _sum: Ext_synclogSumAggregateOutputType | null
    _min: Ext_synclogMinAggregateOutputType | null
    _max: Ext_synclogMaxAggregateOutputType | null
  }

  type GetExt_synclogGroupByPayload<T extends ext_synclogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Ext_synclogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Ext_synclogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Ext_synclogGroupByOutputType[P]>
            : GetScalarType<T[P], Ext_synclogGroupByOutputType[P]>
        }
      >
    >


  export type ext_synclogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    congtyId?: boolean
    configId?: boolean
    syncType?: boolean
    fromDate?: boolean
    toDate?: boolean
    totalRecords?: boolean
    successCount?: boolean
    errorCount?: boolean
    status?: boolean
    errorMessage?: boolean
    startedAt?: boolean
    completedAt?: boolean
    createdAt?: boolean
    congty?: boolean | ext_synclog$congtyArgs<ExtArgs>
    config?: boolean | ext_synclog$configArgs<ExtArgs>
  }, ExtArgs["result"]["ext_synclog"]>

  export type ext_synclogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    congtyId?: boolean
    configId?: boolean
    syncType?: boolean
    fromDate?: boolean
    toDate?: boolean
    totalRecords?: boolean
    successCount?: boolean
    errorCount?: boolean
    status?: boolean
    errorMessage?: boolean
    startedAt?: boolean
    completedAt?: boolean
    createdAt?: boolean
    congty?: boolean | ext_synclog$congtyArgs<ExtArgs>
    config?: boolean | ext_synclog$configArgs<ExtArgs>
  }, ExtArgs["result"]["ext_synclog"]>

  export type ext_synclogSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    congtyId?: boolean
    configId?: boolean
    syncType?: boolean
    fromDate?: boolean
    toDate?: boolean
    totalRecords?: boolean
    successCount?: boolean
    errorCount?: boolean
    status?: boolean
    errorMessage?: boolean
    startedAt?: boolean
    completedAt?: boolean
    createdAt?: boolean
    congty?: boolean | ext_synclog$congtyArgs<ExtArgs>
    config?: boolean | ext_synclog$configArgs<ExtArgs>
  }, ExtArgs["result"]["ext_synclog"]>

  export type ext_synclogSelectScalar = {
    id?: boolean
    congtyId?: boolean
    configId?: boolean
    syncType?: boolean
    fromDate?: boolean
    toDate?: boolean
    totalRecords?: boolean
    successCount?: boolean
    errorCount?: boolean
    status?: boolean
    errorMessage?: boolean
    startedAt?: boolean
    completedAt?: boolean
    createdAt?: boolean
  }

  export type ext_synclogOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "congtyId" | "configId" | "syncType" | "fromDate" | "toDate" | "totalRecords" | "successCount" | "errorCount" | "status" | "errorMessage" | "startedAt" | "completedAt" | "createdAt", ExtArgs["result"]["ext_synclog"]>
  export type ext_synclogInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    congty?: boolean | ext_synclog$congtyArgs<ExtArgs>
    config?: boolean | ext_synclog$configArgs<ExtArgs>
  }
  export type ext_synclogIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    congty?: boolean | ext_synclog$congtyArgs<ExtArgs>
    config?: boolean | ext_synclog$configArgs<ExtArgs>
  }
  export type ext_synclogIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    congty?: boolean | ext_synclog$congtyArgs<ExtArgs>
    config?: boolean | ext_synclog$configArgs<ExtArgs>
  }

  export type $ext_synclogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ext_synclog"
    objects: {
      congty: Prisma.$ext_congtyPayload<ExtArgs> | null
      config: Prisma.$ext_apiconfigPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      congtyId: string | null
      configId: string | null
      syncType: string
      fromDate: Date | null
      toDate: Date | null
      totalRecords: number
      successCount: number
      errorCount: number
      status: string
      errorMessage: string | null
      startedAt: Date
      completedAt: Date | null
      createdAt: Date
    }, ExtArgs["result"]["ext_synclog"]>
    composites: {}
  }

  type ext_synclogGetPayload<S extends boolean | null | undefined | ext_synclogDefaultArgs> = $Result.GetResult<Prisma.$ext_synclogPayload, S>

  type ext_synclogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ext_synclogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Ext_synclogCountAggregateInputType | true
    }

  export interface ext_synclogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ext_synclog'], meta: { name: 'ext_synclog' } }
    /**
     * Find zero or one Ext_synclog that matches the filter.
     * @param {ext_synclogFindUniqueArgs} args - Arguments to find a Ext_synclog
     * @example
     * // Get one Ext_synclog
     * const ext_synclog = await prisma.ext_synclog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ext_synclogFindUniqueArgs>(args: SelectSubset<T, ext_synclogFindUniqueArgs<ExtArgs>>): Prisma__ext_synclogClient<$Result.GetResult<Prisma.$ext_synclogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Ext_synclog that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ext_synclogFindUniqueOrThrowArgs} args - Arguments to find a Ext_synclog
     * @example
     * // Get one Ext_synclog
     * const ext_synclog = await prisma.ext_synclog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ext_synclogFindUniqueOrThrowArgs>(args: SelectSubset<T, ext_synclogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ext_synclogClient<$Result.GetResult<Prisma.$ext_synclogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ext_synclog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_synclogFindFirstArgs} args - Arguments to find a Ext_synclog
     * @example
     * // Get one Ext_synclog
     * const ext_synclog = await prisma.ext_synclog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ext_synclogFindFirstArgs>(args?: SelectSubset<T, ext_synclogFindFirstArgs<ExtArgs>>): Prisma__ext_synclogClient<$Result.GetResult<Prisma.$ext_synclogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ext_synclog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_synclogFindFirstOrThrowArgs} args - Arguments to find a Ext_synclog
     * @example
     * // Get one Ext_synclog
     * const ext_synclog = await prisma.ext_synclog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ext_synclogFindFirstOrThrowArgs>(args?: SelectSubset<T, ext_synclogFindFirstOrThrowArgs<ExtArgs>>): Prisma__ext_synclogClient<$Result.GetResult<Prisma.$ext_synclogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Ext_synclogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_synclogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Ext_synclogs
     * const ext_synclogs = await prisma.ext_synclog.findMany()
     * 
     * // Get first 10 Ext_synclogs
     * const ext_synclogs = await prisma.ext_synclog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const ext_synclogWithIdOnly = await prisma.ext_synclog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ext_synclogFindManyArgs>(args?: SelectSubset<T, ext_synclogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ext_synclogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Ext_synclog.
     * @param {ext_synclogCreateArgs} args - Arguments to create a Ext_synclog.
     * @example
     * // Create one Ext_synclog
     * const Ext_synclog = await prisma.ext_synclog.create({
     *   data: {
     *     // ... data to create a Ext_synclog
     *   }
     * })
     * 
     */
    create<T extends ext_synclogCreateArgs>(args: SelectSubset<T, ext_synclogCreateArgs<ExtArgs>>): Prisma__ext_synclogClient<$Result.GetResult<Prisma.$ext_synclogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Ext_synclogs.
     * @param {ext_synclogCreateManyArgs} args - Arguments to create many Ext_synclogs.
     * @example
     * // Create many Ext_synclogs
     * const ext_synclog = await prisma.ext_synclog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ext_synclogCreateManyArgs>(args?: SelectSubset<T, ext_synclogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Ext_synclogs and returns the data saved in the database.
     * @param {ext_synclogCreateManyAndReturnArgs} args - Arguments to create many Ext_synclogs.
     * @example
     * // Create many Ext_synclogs
     * const ext_synclog = await prisma.ext_synclog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Ext_synclogs and only return the `id`
     * const ext_synclogWithIdOnly = await prisma.ext_synclog.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ext_synclogCreateManyAndReturnArgs>(args?: SelectSubset<T, ext_synclogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ext_synclogPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Ext_synclog.
     * @param {ext_synclogDeleteArgs} args - Arguments to delete one Ext_synclog.
     * @example
     * // Delete one Ext_synclog
     * const Ext_synclog = await prisma.ext_synclog.delete({
     *   where: {
     *     // ... filter to delete one Ext_synclog
     *   }
     * })
     * 
     */
    delete<T extends ext_synclogDeleteArgs>(args: SelectSubset<T, ext_synclogDeleteArgs<ExtArgs>>): Prisma__ext_synclogClient<$Result.GetResult<Prisma.$ext_synclogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Ext_synclog.
     * @param {ext_synclogUpdateArgs} args - Arguments to update one Ext_synclog.
     * @example
     * // Update one Ext_synclog
     * const ext_synclog = await prisma.ext_synclog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ext_synclogUpdateArgs>(args: SelectSubset<T, ext_synclogUpdateArgs<ExtArgs>>): Prisma__ext_synclogClient<$Result.GetResult<Prisma.$ext_synclogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Ext_synclogs.
     * @param {ext_synclogDeleteManyArgs} args - Arguments to filter Ext_synclogs to delete.
     * @example
     * // Delete a few Ext_synclogs
     * const { count } = await prisma.ext_synclog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ext_synclogDeleteManyArgs>(args?: SelectSubset<T, ext_synclogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ext_synclogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_synclogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Ext_synclogs
     * const ext_synclog = await prisma.ext_synclog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ext_synclogUpdateManyArgs>(args: SelectSubset<T, ext_synclogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ext_synclogs and returns the data updated in the database.
     * @param {ext_synclogUpdateManyAndReturnArgs} args - Arguments to update many Ext_synclogs.
     * @example
     * // Update many Ext_synclogs
     * const ext_synclog = await prisma.ext_synclog.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Ext_synclogs and only return the `id`
     * const ext_synclogWithIdOnly = await prisma.ext_synclog.updateManyAndReturn({
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
    updateManyAndReturn<T extends ext_synclogUpdateManyAndReturnArgs>(args: SelectSubset<T, ext_synclogUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ext_synclogPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Ext_synclog.
     * @param {ext_synclogUpsertArgs} args - Arguments to update or create a Ext_synclog.
     * @example
     * // Update or create a Ext_synclog
     * const ext_synclog = await prisma.ext_synclog.upsert({
     *   create: {
     *     // ... data to create a Ext_synclog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Ext_synclog we want to update
     *   }
     * })
     */
    upsert<T extends ext_synclogUpsertArgs>(args: SelectSubset<T, ext_synclogUpsertArgs<ExtArgs>>): Prisma__ext_synclogClient<$Result.GetResult<Prisma.$ext_synclogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Ext_synclogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_synclogCountArgs} args - Arguments to filter Ext_synclogs to count.
     * @example
     * // Count the number of Ext_synclogs
     * const count = await prisma.ext_synclog.count({
     *   where: {
     *     // ... the filter for the Ext_synclogs we want to count
     *   }
     * })
    **/
    count<T extends ext_synclogCountArgs>(
      args?: Subset<T, ext_synclogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Ext_synclogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Ext_synclog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Ext_synclogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Ext_synclogAggregateArgs>(args: Subset<T, Ext_synclogAggregateArgs>): Prisma.PrismaPromise<GetExt_synclogAggregateType<T>>

    /**
     * Group by Ext_synclog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_synclogGroupByArgs} args - Group by arguments.
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
      T extends ext_synclogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ext_synclogGroupByArgs['orderBy'] }
        : { orderBy?: ext_synclogGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ext_synclogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetExt_synclogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ext_synclog model
   */
  readonly fields: ext_synclogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ext_synclog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ext_synclogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    congty<T extends ext_synclog$congtyArgs<ExtArgs> = {}>(args?: Subset<T, ext_synclog$congtyArgs<ExtArgs>>): Prisma__ext_congtyClient<$Result.GetResult<Prisma.$ext_congtyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    config<T extends ext_synclog$configArgs<ExtArgs> = {}>(args?: Subset<T, ext_synclog$configArgs<ExtArgs>>): Prisma__ext_apiconfigClient<$Result.GetResult<Prisma.$ext_apiconfigPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the ext_synclog model
   */
  interface ext_synclogFieldRefs {
    readonly id: FieldRef<"ext_synclog", 'String'>
    readonly congtyId: FieldRef<"ext_synclog", 'String'>
    readonly configId: FieldRef<"ext_synclog", 'String'>
    readonly syncType: FieldRef<"ext_synclog", 'String'>
    readonly fromDate: FieldRef<"ext_synclog", 'DateTime'>
    readonly toDate: FieldRef<"ext_synclog", 'DateTime'>
    readonly totalRecords: FieldRef<"ext_synclog", 'Int'>
    readonly successCount: FieldRef<"ext_synclog", 'Int'>
    readonly errorCount: FieldRef<"ext_synclog", 'Int'>
    readonly status: FieldRef<"ext_synclog", 'String'>
    readonly errorMessage: FieldRef<"ext_synclog", 'String'>
    readonly startedAt: FieldRef<"ext_synclog", 'DateTime'>
    readonly completedAt: FieldRef<"ext_synclog", 'DateTime'>
    readonly createdAt: FieldRef<"ext_synclog", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ext_synclog findUnique
   */
  export type ext_synclogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_synclog
     */
    select?: ext_synclogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_synclog
     */
    omit?: ext_synclogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_synclogInclude<ExtArgs> | null
    /**
     * Filter, which ext_synclog to fetch.
     */
    where: ext_synclogWhereUniqueInput
  }

  /**
   * ext_synclog findUniqueOrThrow
   */
  export type ext_synclogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_synclog
     */
    select?: ext_synclogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_synclog
     */
    omit?: ext_synclogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_synclogInclude<ExtArgs> | null
    /**
     * Filter, which ext_synclog to fetch.
     */
    where: ext_synclogWhereUniqueInput
  }

  /**
   * ext_synclog findFirst
   */
  export type ext_synclogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_synclog
     */
    select?: ext_synclogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_synclog
     */
    omit?: ext_synclogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_synclogInclude<ExtArgs> | null
    /**
     * Filter, which ext_synclog to fetch.
     */
    where?: ext_synclogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ext_synclogs to fetch.
     */
    orderBy?: ext_synclogOrderByWithRelationInput | ext_synclogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ext_synclogs.
     */
    cursor?: ext_synclogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ext_synclogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ext_synclogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ext_synclogs.
     */
    distinct?: Ext_synclogScalarFieldEnum | Ext_synclogScalarFieldEnum[]
  }

  /**
   * ext_synclog findFirstOrThrow
   */
  export type ext_synclogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_synclog
     */
    select?: ext_synclogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_synclog
     */
    omit?: ext_synclogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_synclogInclude<ExtArgs> | null
    /**
     * Filter, which ext_synclog to fetch.
     */
    where?: ext_synclogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ext_synclogs to fetch.
     */
    orderBy?: ext_synclogOrderByWithRelationInput | ext_synclogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ext_synclogs.
     */
    cursor?: ext_synclogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ext_synclogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ext_synclogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ext_synclogs.
     */
    distinct?: Ext_synclogScalarFieldEnum | Ext_synclogScalarFieldEnum[]
  }

  /**
   * ext_synclog findMany
   */
  export type ext_synclogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_synclog
     */
    select?: ext_synclogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_synclog
     */
    omit?: ext_synclogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_synclogInclude<ExtArgs> | null
    /**
     * Filter, which ext_synclogs to fetch.
     */
    where?: ext_synclogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ext_synclogs to fetch.
     */
    orderBy?: ext_synclogOrderByWithRelationInput | ext_synclogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ext_synclogs.
     */
    cursor?: ext_synclogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ext_synclogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ext_synclogs.
     */
    skip?: number
    distinct?: Ext_synclogScalarFieldEnum | Ext_synclogScalarFieldEnum[]
  }

  /**
   * ext_synclog create
   */
  export type ext_synclogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_synclog
     */
    select?: ext_synclogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_synclog
     */
    omit?: ext_synclogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_synclogInclude<ExtArgs> | null
    /**
     * The data needed to create a ext_synclog.
     */
    data: XOR<ext_synclogCreateInput, ext_synclogUncheckedCreateInput>
  }

  /**
   * ext_synclog createMany
   */
  export type ext_synclogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ext_synclogs.
     */
    data: ext_synclogCreateManyInput | ext_synclogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ext_synclog createManyAndReturn
   */
  export type ext_synclogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_synclog
     */
    select?: ext_synclogSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ext_synclog
     */
    omit?: ext_synclogOmit<ExtArgs> | null
    /**
     * The data used to create many ext_synclogs.
     */
    data: ext_synclogCreateManyInput | ext_synclogCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_synclogIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ext_synclog update
   */
  export type ext_synclogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_synclog
     */
    select?: ext_synclogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_synclog
     */
    omit?: ext_synclogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_synclogInclude<ExtArgs> | null
    /**
     * The data needed to update a ext_synclog.
     */
    data: XOR<ext_synclogUpdateInput, ext_synclogUncheckedUpdateInput>
    /**
     * Choose, which ext_synclog to update.
     */
    where: ext_synclogWhereUniqueInput
  }

  /**
   * ext_synclog updateMany
   */
  export type ext_synclogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ext_synclogs.
     */
    data: XOR<ext_synclogUpdateManyMutationInput, ext_synclogUncheckedUpdateManyInput>
    /**
     * Filter which ext_synclogs to update
     */
    where?: ext_synclogWhereInput
    /**
     * Limit how many ext_synclogs to update.
     */
    limit?: number
  }

  /**
   * ext_synclog updateManyAndReturn
   */
  export type ext_synclogUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_synclog
     */
    select?: ext_synclogSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ext_synclog
     */
    omit?: ext_synclogOmit<ExtArgs> | null
    /**
     * The data used to update ext_synclogs.
     */
    data: XOR<ext_synclogUpdateManyMutationInput, ext_synclogUncheckedUpdateManyInput>
    /**
     * Filter which ext_synclogs to update
     */
    where?: ext_synclogWhereInput
    /**
     * Limit how many ext_synclogs to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_synclogIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ext_synclog upsert
   */
  export type ext_synclogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_synclog
     */
    select?: ext_synclogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_synclog
     */
    omit?: ext_synclogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_synclogInclude<ExtArgs> | null
    /**
     * The filter to search for the ext_synclog to update in case it exists.
     */
    where: ext_synclogWhereUniqueInput
    /**
     * In case the ext_synclog found by the `where` argument doesn't exist, create a new ext_synclog with this data.
     */
    create: XOR<ext_synclogCreateInput, ext_synclogUncheckedCreateInput>
    /**
     * In case the ext_synclog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ext_synclogUpdateInput, ext_synclogUncheckedUpdateInput>
  }

  /**
   * ext_synclog delete
   */
  export type ext_synclogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_synclog
     */
    select?: ext_synclogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_synclog
     */
    omit?: ext_synclogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_synclogInclude<ExtArgs> | null
    /**
     * Filter which ext_synclog to delete.
     */
    where: ext_synclogWhereUniqueInput
  }

  /**
   * ext_synclog deleteMany
   */
  export type ext_synclogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ext_synclogs to delete
     */
    where?: ext_synclogWhereInput
    /**
     * Limit how many ext_synclogs to delete.
     */
    limit?: number
  }

  /**
   * ext_synclog.congty
   */
  export type ext_synclog$congtyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_congty
     */
    select?: ext_congtySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_congty
     */
    omit?: ext_congtyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_congtyInclude<ExtArgs> | null
    where?: ext_congtyWhereInput
  }

  /**
   * ext_synclog.config
   */
  export type ext_synclog$configArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_apiconfig
     */
    select?: ext_apiconfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_apiconfig
     */
    omit?: ext_apiconfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_apiconfigInclude<ExtArgs> | null
    where?: ext_apiconfigWhereInput
  }

  /**
   * ext_synclog without action
   */
  export type ext_synclogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_synclog
     */
    select?: ext_synclogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_synclog
     */
    omit?: ext_synclogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ext_synclogInclude<ExtArgs> | null
  }


  /**
   * Model ext_tonghop
   */

  export type AggregateExt_tonghop = {
    _count: Ext_tonghopCountAggregateOutputType | null
    _avg: Ext_tonghopAvgAggregateOutputType | null
    _sum: Ext_tonghopSumAggregateOutputType | null
    _min: Ext_tonghopMinAggregateOutputType | null
    _max: Ext_tonghopMaxAggregateOutputType | null
  }

  export type Ext_tonghopAvgAggregateOutputType = {
    stt: number | null
    sluong: Decimal | null
    dgia: Decimal | null
    thtien: Decimal | null
    tsuat: Decimal | null
    tthue: Decimal | null
    tongTien: Decimal | null
    soLuongNhap: Decimal | null
    soLuongXuat: Decimal | null
    giaTriNhap: Decimal | null
    giaTriXuat: Decimal | null
    nam: number | null
    thang: number | null
    quy: number | null
  }

  export type Ext_tonghopSumAggregateOutputType = {
    stt: number | null
    sluong: Decimal | null
    dgia: Decimal | null
    thtien: Decimal | null
    tsuat: Decimal | null
    tthue: Decimal | null
    tongTien: Decimal | null
    soLuongNhap: Decimal | null
    soLuongXuat: Decimal | null
    giaTriNhap: Decimal | null
    giaTriXuat: Decimal | null
    nam: number | null
    thang: number | null
    quy: number | null
  }

  export type Ext_tonghopMinAggregateOutputType = {
    id: string | null
    idDetailServer: string | null
    idHoadonServer: string | null
    congtyId: string | null
    congtyMst: string | null
    congtyTen: string | null
    khmshdon: string | null
    khhdon: string | null
    shdon: string | null
    mhso: string | null
    tdlap: Date | null
    tthai: string | null
    loaihd: string | null
    nbmst: string | null
    nbten: string | null
    nbdchi: string | null
    nmmst: string | null
    nmten: string | null
    nmdchi: string | null
    stt: number | null
    tenHang: string | null
    tenHangChuan: string | null
    maHang: string | null
    nhomHang: string | null
    dvtinh: string | null
    sluong: Decimal | null
    dgia: Decimal | null
    thtien: Decimal | null
    tsuat: Decimal | null
    tthue: Decimal | null
    tongTien: Decimal | null
    soLuongNhap: Decimal | null
    soLuongXuat: Decimal | null
    giaTriNhap: Decimal | null
    giaTriXuat: Decimal | null
    searchText: string | null
    nam: number | null
    thang: number | null
    quy: number | null
    createdAt: Date | null
    updatedAt: Date | null
    syncedAt: Date | null
  }

  export type Ext_tonghopMaxAggregateOutputType = {
    id: string | null
    idDetailServer: string | null
    idHoadonServer: string | null
    congtyId: string | null
    congtyMst: string | null
    congtyTen: string | null
    khmshdon: string | null
    khhdon: string | null
    shdon: string | null
    mhso: string | null
    tdlap: Date | null
    tthai: string | null
    loaihd: string | null
    nbmst: string | null
    nbten: string | null
    nbdchi: string | null
    nmmst: string | null
    nmten: string | null
    nmdchi: string | null
    stt: number | null
    tenHang: string | null
    tenHangChuan: string | null
    maHang: string | null
    nhomHang: string | null
    dvtinh: string | null
    sluong: Decimal | null
    dgia: Decimal | null
    thtien: Decimal | null
    tsuat: Decimal | null
    tthue: Decimal | null
    tongTien: Decimal | null
    soLuongNhap: Decimal | null
    soLuongXuat: Decimal | null
    giaTriNhap: Decimal | null
    giaTriXuat: Decimal | null
    searchText: string | null
    nam: number | null
    thang: number | null
    quy: number | null
    createdAt: Date | null
    updatedAt: Date | null
    syncedAt: Date | null
  }

  export type Ext_tonghopCountAggregateOutputType = {
    id: number
    idDetailServer: number
    idHoadonServer: number
    congtyId: number
    congtyMst: number
    congtyTen: number
    khmshdon: number
    khhdon: number
    shdon: number
    mhso: number
    tdlap: number
    tthai: number
    loaihd: number
    nbmst: number
    nbten: number
    nbdchi: number
    nmmst: number
    nmten: number
    nmdchi: number
    stt: number
    tenHang: number
    tenHangChuan: number
    maHang: number
    nhomHang: number
    dvtinh: number
    sluong: number
    dgia: number
    thtien: number
    tsuat: number
    tthue: number
    tongTien: number
    soLuongNhap: number
    soLuongXuat: number
    giaTriNhap: number
    giaTriXuat: number
    searchText: number
    tags: number
    nam: number
    thang: number
    quy: number
    createdAt: number
    updatedAt: number
    syncedAt: number
    _all: number
  }


  export type Ext_tonghopAvgAggregateInputType = {
    stt?: true
    sluong?: true
    dgia?: true
    thtien?: true
    tsuat?: true
    tthue?: true
    tongTien?: true
    soLuongNhap?: true
    soLuongXuat?: true
    giaTriNhap?: true
    giaTriXuat?: true
    nam?: true
    thang?: true
    quy?: true
  }

  export type Ext_tonghopSumAggregateInputType = {
    stt?: true
    sluong?: true
    dgia?: true
    thtien?: true
    tsuat?: true
    tthue?: true
    tongTien?: true
    soLuongNhap?: true
    soLuongXuat?: true
    giaTriNhap?: true
    giaTriXuat?: true
    nam?: true
    thang?: true
    quy?: true
  }

  export type Ext_tonghopMinAggregateInputType = {
    id?: true
    idDetailServer?: true
    idHoadonServer?: true
    congtyId?: true
    congtyMst?: true
    congtyTen?: true
    khmshdon?: true
    khhdon?: true
    shdon?: true
    mhso?: true
    tdlap?: true
    tthai?: true
    loaihd?: true
    nbmst?: true
    nbten?: true
    nbdchi?: true
    nmmst?: true
    nmten?: true
    nmdchi?: true
    stt?: true
    tenHang?: true
    tenHangChuan?: true
    maHang?: true
    nhomHang?: true
    dvtinh?: true
    sluong?: true
    dgia?: true
    thtien?: true
    tsuat?: true
    tthue?: true
    tongTien?: true
    soLuongNhap?: true
    soLuongXuat?: true
    giaTriNhap?: true
    giaTriXuat?: true
    searchText?: true
    nam?: true
    thang?: true
    quy?: true
    createdAt?: true
    updatedAt?: true
    syncedAt?: true
  }

  export type Ext_tonghopMaxAggregateInputType = {
    id?: true
    idDetailServer?: true
    idHoadonServer?: true
    congtyId?: true
    congtyMst?: true
    congtyTen?: true
    khmshdon?: true
    khhdon?: true
    shdon?: true
    mhso?: true
    tdlap?: true
    tthai?: true
    loaihd?: true
    nbmst?: true
    nbten?: true
    nbdchi?: true
    nmmst?: true
    nmten?: true
    nmdchi?: true
    stt?: true
    tenHang?: true
    tenHangChuan?: true
    maHang?: true
    nhomHang?: true
    dvtinh?: true
    sluong?: true
    dgia?: true
    thtien?: true
    tsuat?: true
    tthue?: true
    tongTien?: true
    soLuongNhap?: true
    soLuongXuat?: true
    giaTriNhap?: true
    giaTriXuat?: true
    searchText?: true
    nam?: true
    thang?: true
    quy?: true
    createdAt?: true
    updatedAt?: true
    syncedAt?: true
  }

  export type Ext_tonghopCountAggregateInputType = {
    id?: true
    idDetailServer?: true
    idHoadonServer?: true
    congtyId?: true
    congtyMst?: true
    congtyTen?: true
    khmshdon?: true
    khhdon?: true
    shdon?: true
    mhso?: true
    tdlap?: true
    tthai?: true
    loaihd?: true
    nbmst?: true
    nbten?: true
    nbdchi?: true
    nmmst?: true
    nmten?: true
    nmdchi?: true
    stt?: true
    tenHang?: true
    tenHangChuan?: true
    maHang?: true
    nhomHang?: true
    dvtinh?: true
    sluong?: true
    dgia?: true
    thtien?: true
    tsuat?: true
    tthue?: true
    tongTien?: true
    soLuongNhap?: true
    soLuongXuat?: true
    giaTriNhap?: true
    giaTriXuat?: true
    searchText?: true
    tags?: true
    nam?: true
    thang?: true
    quy?: true
    createdAt?: true
    updatedAt?: true
    syncedAt?: true
    _all?: true
  }

  export type Ext_tonghopAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ext_tonghop to aggregate.
     */
    where?: ext_tonghopWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ext_tonghops to fetch.
     */
    orderBy?: ext_tonghopOrderByWithRelationInput | ext_tonghopOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ext_tonghopWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ext_tonghops from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ext_tonghops.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ext_tonghops
    **/
    _count?: true | Ext_tonghopCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Ext_tonghopAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Ext_tonghopSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Ext_tonghopMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Ext_tonghopMaxAggregateInputType
  }

  export type GetExt_tonghopAggregateType<T extends Ext_tonghopAggregateArgs> = {
        [P in keyof T & keyof AggregateExt_tonghop]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateExt_tonghop[P]>
      : GetScalarType<T[P], AggregateExt_tonghop[P]>
  }




  export type ext_tonghopGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ext_tonghopWhereInput
    orderBy?: ext_tonghopOrderByWithAggregationInput | ext_tonghopOrderByWithAggregationInput[]
    by: Ext_tonghopScalarFieldEnum[] | Ext_tonghopScalarFieldEnum
    having?: ext_tonghopScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Ext_tonghopCountAggregateInputType | true
    _avg?: Ext_tonghopAvgAggregateInputType
    _sum?: Ext_tonghopSumAggregateInputType
    _min?: Ext_tonghopMinAggregateInputType
    _max?: Ext_tonghopMaxAggregateInputType
  }

  export type Ext_tonghopGroupByOutputType = {
    id: string
    idDetailServer: string
    idHoadonServer: string
    congtyId: string | null
    congtyMst: string | null
    congtyTen: string | null
    khmshdon: string
    khhdon: string
    shdon: string
    mhso: string | null
    tdlap: Date
    tthai: string | null
    loaihd: string
    nbmst: string
    nbten: string | null
    nbdchi: string | null
    nmmst: string | null
    nmten: string | null
    nmdchi: string | null
    stt: number
    tenHang: string
    tenHangChuan: string | null
    maHang: string | null
    nhomHang: string | null
    dvtinh: string | null
    sluong: Decimal
    dgia: Decimal
    thtien: Decimal
    tsuat: Decimal
    tthue: Decimal
    tongTien: Decimal
    soLuongNhap: Decimal
    soLuongXuat: Decimal
    giaTriNhap: Decimal
    giaTriXuat: Decimal
    searchText: string | null
    tags: string[]
    nam: number
    thang: number
    quy: number
    createdAt: Date
    updatedAt: Date
    syncedAt: Date
    _count: Ext_tonghopCountAggregateOutputType | null
    _avg: Ext_tonghopAvgAggregateOutputType | null
    _sum: Ext_tonghopSumAggregateOutputType | null
    _min: Ext_tonghopMinAggregateOutputType | null
    _max: Ext_tonghopMaxAggregateOutputType | null
  }

  type GetExt_tonghopGroupByPayload<T extends ext_tonghopGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Ext_tonghopGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Ext_tonghopGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Ext_tonghopGroupByOutputType[P]>
            : GetScalarType<T[P], Ext_tonghopGroupByOutputType[P]>
        }
      >
    >


  export type ext_tonghopSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    idDetailServer?: boolean
    idHoadonServer?: boolean
    congtyId?: boolean
    congtyMst?: boolean
    congtyTen?: boolean
    khmshdon?: boolean
    khhdon?: boolean
    shdon?: boolean
    mhso?: boolean
    tdlap?: boolean
    tthai?: boolean
    loaihd?: boolean
    nbmst?: boolean
    nbten?: boolean
    nbdchi?: boolean
    nmmst?: boolean
    nmten?: boolean
    nmdchi?: boolean
    stt?: boolean
    tenHang?: boolean
    tenHangChuan?: boolean
    maHang?: boolean
    nhomHang?: boolean
    dvtinh?: boolean
    sluong?: boolean
    dgia?: boolean
    thtien?: boolean
    tsuat?: boolean
    tthue?: boolean
    tongTien?: boolean
    soLuongNhap?: boolean
    soLuongXuat?: boolean
    giaTriNhap?: boolean
    giaTriXuat?: boolean
    searchText?: boolean
    tags?: boolean
    nam?: boolean
    thang?: boolean
    quy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    syncedAt?: boolean
  }, ExtArgs["result"]["ext_tonghop"]>

  export type ext_tonghopSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    idDetailServer?: boolean
    idHoadonServer?: boolean
    congtyId?: boolean
    congtyMst?: boolean
    congtyTen?: boolean
    khmshdon?: boolean
    khhdon?: boolean
    shdon?: boolean
    mhso?: boolean
    tdlap?: boolean
    tthai?: boolean
    loaihd?: boolean
    nbmst?: boolean
    nbten?: boolean
    nbdchi?: boolean
    nmmst?: boolean
    nmten?: boolean
    nmdchi?: boolean
    stt?: boolean
    tenHang?: boolean
    tenHangChuan?: boolean
    maHang?: boolean
    nhomHang?: boolean
    dvtinh?: boolean
    sluong?: boolean
    dgia?: boolean
    thtien?: boolean
    tsuat?: boolean
    tthue?: boolean
    tongTien?: boolean
    soLuongNhap?: boolean
    soLuongXuat?: boolean
    giaTriNhap?: boolean
    giaTriXuat?: boolean
    searchText?: boolean
    tags?: boolean
    nam?: boolean
    thang?: boolean
    quy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    syncedAt?: boolean
  }, ExtArgs["result"]["ext_tonghop"]>

  export type ext_tonghopSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    idDetailServer?: boolean
    idHoadonServer?: boolean
    congtyId?: boolean
    congtyMst?: boolean
    congtyTen?: boolean
    khmshdon?: boolean
    khhdon?: boolean
    shdon?: boolean
    mhso?: boolean
    tdlap?: boolean
    tthai?: boolean
    loaihd?: boolean
    nbmst?: boolean
    nbten?: boolean
    nbdchi?: boolean
    nmmst?: boolean
    nmten?: boolean
    nmdchi?: boolean
    stt?: boolean
    tenHang?: boolean
    tenHangChuan?: boolean
    maHang?: boolean
    nhomHang?: boolean
    dvtinh?: boolean
    sluong?: boolean
    dgia?: boolean
    thtien?: boolean
    tsuat?: boolean
    tthue?: boolean
    tongTien?: boolean
    soLuongNhap?: boolean
    soLuongXuat?: boolean
    giaTriNhap?: boolean
    giaTriXuat?: boolean
    searchText?: boolean
    tags?: boolean
    nam?: boolean
    thang?: boolean
    quy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    syncedAt?: boolean
  }, ExtArgs["result"]["ext_tonghop"]>

  export type ext_tonghopSelectScalar = {
    id?: boolean
    idDetailServer?: boolean
    idHoadonServer?: boolean
    congtyId?: boolean
    congtyMst?: boolean
    congtyTen?: boolean
    khmshdon?: boolean
    khhdon?: boolean
    shdon?: boolean
    mhso?: boolean
    tdlap?: boolean
    tthai?: boolean
    loaihd?: boolean
    nbmst?: boolean
    nbten?: boolean
    nbdchi?: boolean
    nmmst?: boolean
    nmten?: boolean
    nmdchi?: boolean
    stt?: boolean
    tenHang?: boolean
    tenHangChuan?: boolean
    maHang?: boolean
    nhomHang?: boolean
    dvtinh?: boolean
    sluong?: boolean
    dgia?: boolean
    thtien?: boolean
    tsuat?: boolean
    tthue?: boolean
    tongTien?: boolean
    soLuongNhap?: boolean
    soLuongXuat?: boolean
    giaTriNhap?: boolean
    giaTriXuat?: boolean
    searchText?: boolean
    tags?: boolean
    nam?: boolean
    thang?: boolean
    quy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    syncedAt?: boolean
  }

  export type ext_tonghopOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "idDetailServer" | "idHoadonServer" | "congtyId" | "congtyMst" | "congtyTen" | "khmshdon" | "khhdon" | "shdon" | "mhso" | "tdlap" | "tthai" | "loaihd" | "nbmst" | "nbten" | "nbdchi" | "nmmst" | "nmten" | "nmdchi" | "stt" | "tenHang" | "tenHangChuan" | "maHang" | "nhomHang" | "dvtinh" | "sluong" | "dgia" | "thtien" | "tsuat" | "tthue" | "tongTien" | "soLuongNhap" | "soLuongXuat" | "giaTriNhap" | "giaTriXuat" | "searchText" | "tags" | "nam" | "thang" | "quy" | "createdAt" | "updatedAt" | "syncedAt", ExtArgs["result"]["ext_tonghop"]>

  export type $ext_tonghopPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ext_tonghop"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      idDetailServer: string
      idHoadonServer: string
      congtyId: string | null
      congtyMst: string | null
      congtyTen: string | null
      khmshdon: string
      khhdon: string
      shdon: string
      mhso: string | null
      tdlap: Date
      tthai: string | null
      loaihd: string
      nbmst: string
      nbten: string | null
      nbdchi: string | null
      nmmst: string | null
      nmten: string | null
      nmdchi: string | null
      stt: number
      tenHang: string
      tenHangChuan: string | null
      maHang: string | null
      nhomHang: string | null
      dvtinh: string | null
      sluong: Prisma.Decimal
      dgia: Prisma.Decimal
      thtien: Prisma.Decimal
      tsuat: Prisma.Decimal
      tthue: Prisma.Decimal
      tongTien: Prisma.Decimal
      soLuongNhap: Prisma.Decimal
      soLuongXuat: Prisma.Decimal
      giaTriNhap: Prisma.Decimal
      giaTriXuat: Prisma.Decimal
      searchText: string | null
      tags: string[]
      nam: number
      thang: number
      quy: number
      createdAt: Date
      updatedAt: Date
      syncedAt: Date
    }, ExtArgs["result"]["ext_tonghop"]>
    composites: {}
  }

  type ext_tonghopGetPayload<S extends boolean | null | undefined | ext_tonghopDefaultArgs> = $Result.GetResult<Prisma.$ext_tonghopPayload, S>

  type ext_tonghopCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ext_tonghopFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Ext_tonghopCountAggregateInputType | true
    }

  export interface ext_tonghopDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ext_tonghop'], meta: { name: 'ext_tonghop' } }
    /**
     * Find zero or one Ext_tonghop that matches the filter.
     * @param {ext_tonghopFindUniqueArgs} args - Arguments to find a Ext_tonghop
     * @example
     * // Get one Ext_tonghop
     * const ext_tonghop = await prisma.ext_tonghop.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ext_tonghopFindUniqueArgs>(args: SelectSubset<T, ext_tonghopFindUniqueArgs<ExtArgs>>): Prisma__ext_tonghopClient<$Result.GetResult<Prisma.$ext_tonghopPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Ext_tonghop that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ext_tonghopFindUniqueOrThrowArgs} args - Arguments to find a Ext_tonghop
     * @example
     * // Get one Ext_tonghop
     * const ext_tonghop = await prisma.ext_tonghop.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ext_tonghopFindUniqueOrThrowArgs>(args: SelectSubset<T, ext_tonghopFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ext_tonghopClient<$Result.GetResult<Prisma.$ext_tonghopPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ext_tonghop that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_tonghopFindFirstArgs} args - Arguments to find a Ext_tonghop
     * @example
     * // Get one Ext_tonghop
     * const ext_tonghop = await prisma.ext_tonghop.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ext_tonghopFindFirstArgs>(args?: SelectSubset<T, ext_tonghopFindFirstArgs<ExtArgs>>): Prisma__ext_tonghopClient<$Result.GetResult<Prisma.$ext_tonghopPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ext_tonghop that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_tonghopFindFirstOrThrowArgs} args - Arguments to find a Ext_tonghop
     * @example
     * // Get one Ext_tonghop
     * const ext_tonghop = await prisma.ext_tonghop.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ext_tonghopFindFirstOrThrowArgs>(args?: SelectSubset<T, ext_tonghopFindFirstOrThrowArgs<ExtArgs>>): Prisma__ext_tonghopClient<$Result.GetResult<Prisma.$ext_tonghopPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Ext_tonghops that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_tonghopFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Ext_tonghops
     * const ext_tonghops = await prisma.ext_tonghop.findMany()
     * 
     * // Get first 10 Ext_tonghops
     * const ext_tonghops = await prisma.ext_tonghop.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const ext_tonghopWithIdOnly = await prisma.ext_tonghop.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ext_tonghopFindManyArgs>(args?: SelectSubset<T, ext_tonghopFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ext_tonghopPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Ext_tonghop.
     * @param {ext_tonghopCreateArgs} args - Arguments to create a Ext_tonghop.
     * @example
     * // Create one Ext_tonghop
     * const Ext_tonghop = await prisma.ext_tonghop.create({
     *   data: {
     *     // ... data to create a Ext_tonghop
     *   }
     * })
     * 
     */
    create<T extends ext_tonghopCreateArgs>(args: SelectSubset<T, ext_tonghopCreateArgs<ExtArgs>>): Prisma__ext_tonghopClient<$Result.GetResult<Prisma.$ext_tonghopPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Ext_tonghops.
     * @param {ext_tonghopCreateManyArgs} args - Arguments to create many Ext_tonghops.
     * @example
     * // Create many Ext_tonghops
     * const ext_tonghop = await prisma.ext_tonghop.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ext_tonghopCreateManyArgs>(args?: SelectSubset<T, ext_tonghopCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Ext_tonghops and returns the data saved in the database.
     * @param {ext_tonghopCreateManyAndReturnArgs} args - Arguments to create many Ext_tonghops.
     * @example
     * // Create many Ext_tonghops
     * const ext_tonghop = await prisma.ext_tonghop.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Ext_tonghops and only return the `id`
     * const ext_tonghopWithIdOnly = await prisma.ext_tonghop.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ext_tonghopCreateManyAndReturnArgs>(args?: SelectSubset<T, ext_tonghopCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ext_tonghopPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Ext_tonghop.
     * @param {ext_tonghopDeleteArgs} args - Arguments to delete one Ext_tonghop.
     * @example
     * // Delete one Ext_tonghop
     * const Ext_tonghop = await prisma.ext_tonghop.delete({
     *   where: {
     *     // ... filter to delete one Ext_tonghop
     *   }
     * })
     * 
     */
    delete<T extends ext_tonghopDeleteArgs>(args: SelectSubset<T, ext_tonghopDeleteArgs<ExtArgs>>): Prisma__ext_tonghopClient<$Result.GetResult<Prisma.$ext_tonghopPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Ext_tonghop.
     * @param {ext_tonghopUpdateArgs} args - Arguments to update one Ext_tonghop.
     * @example
     * // Update one Ext_tonghop
     * const ext_tonghop = await prisma.ext_tonghop.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ext_tonghopUpdateArgs>(args: SelectSubset<T, ext_tonghopUpdateArgs<ExtArgs>>): Prisma__ext_tonghopClient<$Result.GetResult<Prisma.$ext_tonghopPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Ext_tonghops.
     * @param {ext_tonghopDeleteManyArgs} args - Arguments to filter Ext_tonghops to delete.
     * @example
     * // Delete a few Ext_tonghops
     * const { count } = await prisma.ext_tonghop.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ext_tonghopDeleteManyArgs>(args?: SelectSubset<T, ext_tonghopDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ext_tonghops.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_tonghopUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Ext_tonghops
     * const ext_tonghop = await prisma.ext_tonghop.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ext_tonghopUpdateManyArgs>(args: SelectSubset<T, ext_tonghopUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ext_tonghops and returns the data updated in the database.
     * @param {ext_tonghopUpdateManyAndReturnArgs} args - Arguments to update many Ext_tonghops.
     * @example
     * // Update many Ext_tonghops
     * const ext_tonghop = await prisma.ext_tonghop.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Ext_tonghops and only return the `id`
     * const ext_tonghopWithIdOnly = await prisma.ext_tonghop.updateManyAndReturn({
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
    updateManyAndReturn<T extends ext_tonghopUpdateManyAndReturnArgs>(args: SelectSubset<T, ext_tonghopUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ext_tonghopPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Ext_tonghop.
     * @param {ext_tonghopUpsertArgs} args - Arguments to update or create a Ext_tonghop.
     * @example
     * // Update or create a Ext_tonghop
     * const ext_tonghop = await prisma.ext_tonghop.upsert({
     *   create: {
     *     // ... data to create a Ext_tonghop
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Ext_tonghop we want to update
     *   }
     * })
     */
    upsert<T extends ext_tonghopUpsertArgs>(args: SelectSubset<T, ext_tonghopUpsertArgs<ExtArgs>>): Prisma__ext_tonghopClient<$Result.GetResult<Prisma.$ext_tonghopPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Ext_tonghops.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_tonghopCountArgs} args - Arguments to filter Ext_tonghops to count.
     * @example
     * // Count the number of Ext_tonghops
     * const count = await prisma.ext_tonghop.count({
     *   where: {
     *     // ... the filter for the Ext_tonghops we want to count
     *   }
     * })
    **/
    count<T extends ext_tonghopCountArgs>(
      args?: Subset<T, ext_tonghopCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Ext_tonghopCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Ext_tonghop.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Ext_tonghopAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Ext_tonghopAggregateArgs>(args: Subset<T, Ext_tonghopAggregateArgs>): Prisma.PrismaPromise<GetExt_tonghopAggregateType<T>>

    /**
     * Group by Ext_tonghop.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_tonghopGroupByArgs} args - Group by arguments.
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
      T extends ext_tonghopGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ext_tonghopGroupByArgs['orderBy'] }
        : { orderBy?: ext_tonghopGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ext_tonghopGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetExt_tonghopGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ext_tonghop model
   */
  readonly fields: ext_tonghopFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ext_tonghop.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ext_tonghopClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
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
   * Fields of the ext_tonghop model
   */
  interface ext_tonghopFieldRefs {
    readonly id: FieldRef<"ext_tonghop", 'String'>
    readonly idDetailServer: FieldRef<"ext_tonghop", 'String'>
    readonly idHoadonServer: FieldRef<"ext_tonghop", 'String'>
    readonly congtyId: FieldRef<"ext_tonghop", 'String'>
    readonly congtyMst: FieldRef<"ext_tonghop", 'String'>
    readonly congtyTen: FieldRef<"ext_tonghop", 'String'>
    readonly khmshdon: FieldRef<"ext_tonghop", 'String'>
    readonly khhdon: FieldRef<"ext_tonghop", 'String'>
    readonly shdon: FieldRef<"ext_tonghop", 'String'>
    readonly mhso: FieldRef<"ext_tonghop", 'String'>
    readonly tdlap: FieldRef<"ext_tonghop", 'DateTime'>
    readonly tthai: FieldRef<"ext_tonghop", 'String'>
    readonly loaihd: FieldRef<"ext_tonghop", 'String'>
    readonly nbmst: FieldRef<"ext_tonghop", 'String'>
    readonly nbten: FieldRef<"ext_tonghop", 'String'>
    readonly nbdchi: FieldRef<"ext_tonghop", 'String'>
    readonly nmmst: FieldRef<"ext_tonghop", 'String'>
    readonly nmten: FieldRef<"ext_tonghop", 'String'>
    readonly nmdchi: FieldRef<"ext_tonghop", 'String'>
    readonly stt: FieldRef<"ext_tonghop", 'Int'>
    readonly tenHang: FieldRef<"ext_tonghop", 'String'>
    readonly tenHangChuan: FieldRef<"ext_tonghop", 'String'>
    readonly maHang: FieldRef<"ext_tonghop", 'String'>
    readonly nhomHang: FieldRef<"ext_tonghop", 'String'>
    readonly dvtinh: FieldRef<"ext_tonghop", 'String'>
    readonly sluong: FieldRef<"ext_tonghop", 'Decimal'>
    readonly dgia: FieldRef<"ext_tonghop", 'Decimal'>
    readonly thtien: FieldRef<"ext_tonghop", 'Decimal'>
    readonly tsuat: FieldRef<"ext_tonghop", 'Decimal'>
    readonly tthue: FieldRef<"ext_tonghop", 'Decimal'>
    readonly tongTien: FieldRef<"ext_tonghop", 'Decimal'>
    readonly soLuongNhap: FieldRef<"ext_tonghop", 'Decimal'>
    readonly soLuongXuat: FieldRef<"ext_tonghop", 'Decimal'>
    readonly giaTriNhap: FieldRef<"ext_tonghop", 'Decimal'>
    readonly giaTriXuat: FieldRef<"ext_tonghop", 'Decimal'>
    readonly searchText: FieldRef<"ext_tonghop", 'String'>
    readonly tags: FieldRef<"ext_tonghop", 'String[]'>
    readonly nam: FieldRef<"ext_tonghop", 'Int'>
    readonly thang: FieldRef<"ext_tonghop", 'Int'>
    readonly quy: FieldRef<"ext_tonghop", 'Int'>
    readonly createdAt: FieldRef<"ext_tonghop", 'DateTime'>
    readonly updatedAt: FieldRef<"ext_tonghop", 'DateTime'>
    readonly syncedAt: FieldRef<"ext_tonghop", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ext_tonghop findUnique
   */
  export type ext_tonghopFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_tonghop
     */
    select?: ext_tonghopSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_tonghop
     */
    omit?: ext_tonghopOmit<ExtArgs> | null
    /**
     * Filter, which ext_tonghop to fetch.
     */
    where: ext_tonghopWhereUniqueInput
  }

  /**
   * ext_tonghop findUniqueOrThrow
   */
  export type ext_tonghopFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_tonghop
     */
    select?: ext_tonghopSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_tonghop
     */
    omit?: ext_tonghopOmit<ExtArgs> | null
    /**
     * Filter, which ext_tonghop to fetch.
     */
    where: ext_tonghopWhereUniqueInput
  }

  /**
   * ext_tonghop findFirst
   */
  export type ext_tonghopFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_tonghop
     */
    select?: ext_tonghopSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_tonghop
     */
    omit?: ext_tonghopOmit<ExtArgs> | null
    /**
     * Filter, which ext_tonghop to fetch.
     */
    where?: ext_tonghopWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ext_tonghops to fetch.
     */
    orderBy?: ext_tonghopOrderByWithRelationInput | ext_tonghopOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ext_tonghops.
     */
    cursor?: ext_tonghopWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ext_tonghops from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ext_tonghops.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ext_tonghops.
     */
    distinct?: Ext_tonghopScalarFieldEnum | Ext_tonghopScalarFieldEnum[]
  }

  /**
   * ext_tonghop findFirstOrThrow
   */
  export type ext_tonghopFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_tonghop
     */
    select?: ext_tonghopSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_tonghop
     */
    omit?: ext_tonghopOmit<ExtArgs> | null
    /**
     * Filter, which ext_tonghop to fetch.
     */
    where?: ext_tonghopWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ext_tonghops to fetch.
     */
    orderBy?: ext_tonghopOrderByWithRelationInput | ext_tonghopOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ext_tonghops.
     */
    cursor?: ext_tonghopWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ext_tonghops from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ext_tonghops.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ext_tonghops.
     */
    distinct?: Ext_tonghopScalarFieldEnum | Ext_tonghopScalarFieldEnum[]
  }

  /**
   * ext_tonghop findMany
   */
  export type ext_tonghopFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_tonghop
     */
    select?: ext_tonghopSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_tonghop
     */
    omit?: ext_tonghopOmit<ExtArgs> | null
    /**
     * Filter, which ext_tonghops to fetch.
     */
    where?: ext_tonghopWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ext_tonghops to fetch.
     */
    orderBy?: ext_tonghopOrderByWithRelationInput | ext_tonghopOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ext_tonghops.
     */
    cursor?: ext_tonghopWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ext_tonghops from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ext_tonghops.
     */
    skip?: number
    distinct?: Ext_tonghopScalarFieldEnum | Ext_tonghopScalarFieldEnum[]
  }

  /**
   * ext_tonghop create
   */
  export type ext_tonghopCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_tonghop
     */
    select?: ext_tonghopSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_tonghop
     */
    omit?: ext_tonghopOmit<ExtArgs> | null
    /**
     * The data needed to create a ext_tonghop.
     */
    data: XOR<ext_tonghopCreateInput, ext_tonghopUncheckedCreateInput>
  }

  /**
   * ext_tonghop createMany
   */
  export type ext_tonghopCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ext_tonghops.
     */
    data: ext_tonghopCreateManyInput | ext_tonghopCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ext_tonghop createManyAndReturn
   */
  export type ext_tonghopCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_tonghop
     */
    select?: ext_tonghopSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ext_tonghop
     */
    omit?: ext_tonghopOmit<ExtArgs> | null
    /**
     * The data used to create many ext_tonghops.
     */
    data: ext_tonghopCreateManyInput | ext_tonghopCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ext_tonghop update
   */
  export type ext_tonghopUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_tonghop
     */
    select?: ext_tonghopSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_tonghop
     */
    omit?: ext_tonghopOmit<ExtArgs> | null
    /**
     * The data needed to update a ext_tonghop.
     */
    data: XOR<ext_tonghopUpdateInput, ext_tonghopUncheckedUpdateInput>
    /**
     * Choose, which ext_tonghop to update.
     */
    where: ext_tonghopWhereUniqueInput
  }

  /**
   * ext_tonghop updateMany
   */
  export type ext_tonghopUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ext_tonghops.
     */
    data: XOR<ext_tonghopUpdateManyMutationInput, ext_tonghopUncheckedUpdateManyInput>
    /**
     * Filter which ext_tonghops to update
     */
    where?: ext_tonghopWhereInput
    /**
     * Limit how many ext_tonghops to update.
     */
    limit?: number
  }

  /**
   * ext_tonghop updateManyAndReturn
   */
  export type ext_tonghopUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_tonghop
     */
    select?: ext_tonghopSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ext_tonghop
     */
    omit?: ext_tonghopOmit<ExtArgs> | null
    /**
     * The data used to update ext_tonghops.
     */
    data: XOR<ext_tonghopUpdateManyMutationInput, ext_tonghopUncheckedUpdateManyInput>
    /**
     * Filter which ext_tonghops to update
     */
    where?: ext_tonghopWhereInput
    /**
     * Limit how many ext_tonghops to update.
     */
    limit?: number
  }

  /**
   * ext_tonghop upsert
   */
  export type ext_tonghopUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_tonghop
     */
    select?: ext_tonghopSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_tonghop
     */
    omit?: ext_tonghopOmit<ExtArgs> | null
    /**
     * The filter to search for the ext_tonghop to update in case it exists.
     */
    where: ext_tonghopWhereUniqueInput
    /**
     * In case the ext_tonghop found by the `where` argument doesn't exist, create a new ext_tonghop with this data.
     */
    create: XOR<ext_tonghopCreateInput, ext_tonghopUncheckedCreateInput>
    /**
     * In case the ext_tonghop was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ext_tonghopUpdateInput, ext_tonghopUncheckedUpdateInput>
  }

  /**
   * ext_tonghop delete
   */
  export type ext_tonghopDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_tonghop
     */
    select?: ext_tonghopSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_tonghop
     */
    omit?: ext_tonghopOmit<ExtArgs> | null
    /**
     * Filter which ext_tonghop to delete.
     */
    where: ext_tonghopWhereUniqueInput
  }

  /**
   * ext_tonghop deleteMany
   */
  export type ext_tonghopDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ext_tonghops to delete
     */
    where?: ext_tonghopWhereInput
    /**
     * Limit how many ext_tonghops to delete.
     */
    limit?: number
  }

  /**
   * ext_tonghop without action
   */
  export type ext_tonghopDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_tonghop
     */
    select?: ext_tonghopSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_tonghop
     */
    omit?: ext_tonghopOmit<ExtArgs> | null
  }


  /**
   * Model ext_sanpham_dictionary
   */

  export type AggregateExt_sanpham_dictionary = {
    _count: Ext_sanpham_dictionaryCountAggregateOutputType | null
    _avg: Ext_sanpham_dictionaryAvgAggregateOutputType | null
    _sum: Ext_sanpham_dictionarySumAggregateOutputType | null
    _min: Ext_sanpham_dictionaryMinAggregateOutputType | null
    _max: Ext_sanpham_dictionaryMaxAggregateOutputType | null
  }

  export type Ext_sanpham_dictionaryAvgAggregateOutputType = {
    frequency: number | null
  }

  export type Ext_sanpham_dictionarySumAggregateOutputType = {
    frequency: number | null
  }

  export type Ext_sanpham_dictionaryMinAggregateOutputType = {
    id: string | null
    tenGoc: string | null
    tenChuan: string | null
    maHang: string | null
    nhomHang: string | null
    dvtinh: string | null
    congtyId: string | null
    frequency: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type Ext_sanpham_dictionaryMaxAggregateOutputType = {
    id: string | null
    tenGoc: string | null
    tenChuan: string | null
    maHang: string | null
    nhomHang: string | null
    dvtinh: string | null
    congtyId: string | null
    frequency: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type Ext_sanpham_dictionaryCountAggregateOutputType = {
    id: number
    tenGoc: number
    tenChuan: number
    maHang: number
    nhomHang: number
    dvtinh: number
    congtyId: number
    frequency: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type Ext_sanpham_dictionaryAvgAggregateInputType = {
    frequency?: true
  }

  export type Ext_sanpham_dictionarySumAggregateInputType = {
    frequency?: true
  }

  export type Ext_sanpham_dictionaryMinAggregateInputType = {
    id?: true
    tenGoc?: true
    tenChuan?: true
    maHang?: true
    nhomHang?: true
    dvtinh?: true
    congtyId?: true
    frequency?: true
    createdAt?: true
    updatedAt?: true
  }

  export type Ext_sanpham_dictionaryMaxAggregateInputType = {
    id?: true
    tenGoc?: true
    tenChuan?: true
    maHang?: true
    nhomHang?: true
    dvtinh?: true
    congtyId?: true
    frequency?: true
    createdAt?: true
    updatedAt?: true
  }

  export type Ext_sanpham_dictionaryCountAggregateInputType = {
    id?: true
    tenGoc?: true
    tenChuan?: true
    maHang?: true
    nhomHang?: true
    dvtinh?: true
    congtyId?: true
    frequency?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type Ext_sanpham_dictionaryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ext_sanpham_dictionary to aggregate.
     */
    where?: ext_sanpham_dictionaryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ext_sanpham_dictionaries to fetch.
     */
    orderBy?: ext_sanpham_dictionaryOrderByWithRelationInput | ext_sanpham_dictionaryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ext_sanpham_dictionaryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ext_sanpham_dictionaries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ext_sanpham_dictionaries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ext_sanpham_dictionaries
    **/
    _count?: true | Ext_sanpham_dictionaryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Ext_sanpham_dictionaryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Ext_sanpham_dictionarySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Ext_sanpham_dictionaryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Ext_sanpham_dictionaryMaxAggregateInputType
  }

  export type GetExt_sanpham_dictionaryAggregateType<T extends Ext_sanpham_dictionaryAggregateArgs> = {
        [P in keyof T & keyof AggregateExt_sanpham_dictionary]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateExt_sanpham_dictionary[P]>
      : GetScalarType<T[P], AggregateExt_sanpham_dictionary[P]>
  }




  export type ext_sanpham_dictionaryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ext_sanpham_dictionaryWhereInput
    orderBy?: ext_sanpham_dictionaryOrderByWithAggregationInput | ext_sanpham_dictionaryOrderByWithAggregationInput[]
    by: Ext_sanpham_dictionaryScalarFieldEnum[] | Ext_sanpham_dictionaryScalarFieldEnum
    having?: ext_sanpham_dictionaryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Ext_sanpham_dictionaryCountAggregateInputType | true
    _avg?: Ext_sanpham_dictionaryAvgAggregateInputType
    _sum?: Ext_sanpham_dictionarySumAggregateInputType
    _min?: Ext_sanpham_dictionaryMinAggregateInputType
    _max?: Ext_sanpham_dictionaryMaxAggregateInputType
  }

  export type Ext_sanpham_dictionaryGroupByOutputType = {
    id: string
    tenGoc: string
    tenChuan: string
    maHang: string | null
    nhomHang: string | null
    dvtinh: string | null
    congtyId: string | null
    frequency: number
    createdAt: Date
    updatedAt: Date
    _count: Ext_sanpham_dictionaryCountAggregateOutputType | null
    _avg: Ext_sanpham_dictionaryAvgAggregateOutputType | null
    _sum: Ext_sanpham_dictionarySumAggregateOutputType | null
    _min: Ext_sanpham_dictionaryMinAggregateOutputType | null
    _max: Ext_sanpham_dictionaryMaxAggregateOutputType | null
  }

  type GetExt_sanpham_dictionaryGroupByPayload<T extends ext_sanpham_dictionaryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Ext_sanpham_dictionaryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Ext_sanpham_dictionaryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Ext_sanpham_dictionaryGroupByOutputType[P]>
            : GetScalarType<T[P], Ext_sanpham_dictionaryGroupByOutputType[P]>
        }
      >
    >


  export type ext_sanpham_dictionarySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenGoc?: boolean
    tenChuan?: boolean
    maHang?: boolean
    nhomHang?: boolean
    dvtinh?: boolean
    congtyId?: boolean
    frequency?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["ext_sanpham_dictionary"]>

  export type ext_sanpham_dictionarySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenGoc?: boolean
    tenChuan?: boolean
    maHang?: boolean
    nhomHang?: boolean
    dvtinh?: boolean
    congtyId?: boolean
    frequency?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["ext_sanpham_dictionary"]>

  export type ext_sanpham_dictionarySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenGoc?: boolean
    tenChuan?: boolean
    maHang?: boolean
    nhomHang?: boolean
    dvtinh?: boolean
    congtyId?: boolean
    frequency?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["ext_sanpham_dictionary"]>

  export type ext_sanpham_dictionarySelectScalar = {
    id?: boolean
    tenGoc?: boolean
    tenChuan?: boolean
    maHang?: boolean
    nhomHang?: boolean
    dvtinh?: boolean
    congtyId?: boolean
    frequency?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ext_sanpham_dictionaryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenGoc" | "tenChuan" | "maHang" | "nhomHang" | "dvtinh" | "congtyId" | "frequency" | "createdAt" | "updatedAt", ExtArgs["result"]["ext_sanpham_dictionary"]>

  export type $ext_sanpham_dictionaryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ext_sanpham_dictionary"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenGoc: string
      tenChuan: string
      maHang: string | null
      nhomHang: string | null
      dvtinh: string | null
      congtyId: string | null
      frequency: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["ext_sanpham_dictionary"]>
    composites: {}
  }

  type ext_sanpham_dictionaryGetPayload<S extends boolean | null | undefined | ext_sanpham_dictionaryDefaultArgs> = $Result.GetResult<Prisma.$ext_sanpham_dictionaryPayload, S>

  type ext_sanpham_dictionaryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ext_sanpham_dictionaryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Ext_sanpham_dictionaryCountAggregateInputType | true
    }

  export interface ext_sanpham_dictionaryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ext_sanpham_dictionary'], meta: { name: 'ext_sanpham_dictionary' } }
    /**
     * Find zero or one Ext_sanpham_dictionary that matches the filter.
     * @param {ext_sanpham_dictionaryFindUniqueArgs} args - Arguments to find a Ext_sanpham_dictionary
     * @example
     * // Get one Ext_sanpham_dictionary
     * const ext_sanpham_dictionary = await prisma.ext_sanpham_dictionary.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ext_sanpham_dictionaryFindUniqueArgs>(args: SelectSubset<T, ext_sanpham_dictionaryFindUniqueArgs<ExtArgs>>): Prisma__ext_sanpham_dictionaryClient<$Result.GetResult<Prisma.$ext_sanpham_dictionaryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Ext_sanpham_dictionary that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ext_sanpham_dictionaryFindUniqueOrThrowArgs} args - Arguments to find a Ext_sanpham_dictionary
     * @example
     * // Get one Ext_sanpham_dictionary
     * const ext_sanpham_dictionary = await prisma.ext_sanpham_dictionary.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ext_sanpham_dictionaryFindUniqueOrThrowArgs>(args: SelectSubset<T, ext_sanpham_dictionaryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ext_sanpham_dictionaryClient<$Result.GetResult<Prisma.$ext_sanpham_dictionaryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ext_sanpham_dictionary that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_sanpham_dictionaryFindFirstArgs} args - Arguments to find a Ext_sanpham_dictionary
     * @example
     * // Get one Ext_sanpham_dictionary
     * const ext_sanpham_dictionary = await prisma.ext_sanpham_dictionary.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ext_sanpham_dictionaryFindFirstArgs>(args?: SelectSubset<T, ext_sanpham_dictionaryFindFirstArgs<ExtArgs>>): Prisma__ext_sanpham_dictionaryClient<$Result.GetResult<Prisma.$ext_sanpham_dictionaryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ext_sanpham_dictionary that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_sanpham_dictionaryFindFirstOrThrowArgs} args - Arguments to find a Ext_sanpham_dictionary
     * @example
     * // Get one Ext_sanpham_dictionary
     * const ext_sanpham_dictionary = await prisma.ext_sanpham_dictionary.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ext_sanpham_dictionaryFindFirstOrThrowArgs>(args?: SelectSubset<T, ext_sanpham_dictionaryFindFirstOrThrowArgs<ExtArgs>>): Prisma__ext_sanpham_dictionaryClient<$Result.GetResult<Prisma.$ext_sanpham_dictionaryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Ext_sanpham_dictionaries that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_sanpham_dictionaryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Ext_sanpham_dictionaries
     * const ext_sanpham_dictionaries = await prisma.ext_sanpham_dictionary.findMany()
     * 
     * // Get first 10 Ext_sanpham_dictionaries
     * const ext_sanpham_dictionaries = await prisma.ext_sanpham_dictionary.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const ext_sanpham_dictionaryWithIdOnly = await prisma.ext_sanpham_dictionary.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ext_sanpham_dictionaryFindManyArgs>(args?: SelectSubset<T, ext_sanpham_dictionaryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ext_sanpham_dictionaryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Ext_sanpham_dictionary.
     * @param {ext_sanpham_dictionaryCreateArgs} args - Arguments to create a Ext_sanpham_dictionary.
     * @example
     * // Create one Ext_sanpham_dictionary
     * const Ext_sanpham_dictionary = await prisma.ext_sanpham_dictionary.create({
     *   data: {
     *     // ... data to create a Ext_sanpham_dictionary
     *   }
     * })
     * 
     */
    create<T extends ext_sanpham_dictionaryCreateArgs>(args: SelectSubset<T, ext_sanpham_dictionaryCreateArgs<ExtArgs>>): Prisma__ext_sanpham_dictionaryClient<$Result.GetResult<Prisma.$ext_sanpham_dictionaryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Ext_sanpham_dictionaries.
     * @param {ext_sanpham_dictionaryCreateManyArgs} args - Arguments to create many Ext_sanpham_dictionaries.
     * @example
     * // Create many Ext_sanpham_dictionaries
     * const ext_sanpham_dictionary = await prisma.ext_sanpham_dictionary.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ext_sanpham_dictionaryCreateManyArgs>(args?: SelectSubset<T, ext_sanpham_dictionaryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Ext_sanpham_dictionaries and returns the data saved in the database.
     * @param {ext_sanpham_dictionaryCreateManyAndReturnArgs} args - Arguments to create many Ext_sanpham_dictionaries.
     * @example
     * // Create many Ext_sanpham_dictionaries
     * const ext_sanpham_dictionary = await prisma.ext_sanpham_dictionary.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Ext_sanpham_dictionaries and only return the `id`
     * const ext_sanpham_dictionaryWithIdOnly = await prisma.ext_sanpham_dictionary.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ext_sanpham_dictionaryCreateManyAndReturnArgs>(args?: SelectSubset<T, ext_sanpham_dictionaryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ext_sanpham_dictionaryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Ext_sanpham_dictionary.
     * @param {ext_sanpham_dictionaryDeleteArgs} args - Arguments to delete one Ext_sanpham_dictionary.
     * @example
     * // Delete one Ext_sanpham_dictionary
     * const Ext_sanpham_dictionary = await prisma.ext_sanpham_dictionary.delete({
     *   where: {
     *     // ... filter to delete one Ext_sanpham_dictionary
     *   }
     * })
     * 
     */
    delete<T extends ext_sanpham_dictionaryDeleteArgs>(args: SelectSubset<T, ext_sanpham_dictionaryDeleteArgs<ExtArgs>>): Prisma__ext_sanpham_dictionaryClient<$Result.GetResult<Prisma.$ext_sanpham_dictionaryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Ext_sanpham_dictionary.
     * @param {ext_sanpham_dictionaryUpdateArgs} args - Arguments to update one Ext_sanpham_dictionary.
     * @example
     * // Update one Ext_sanpham_dictionary
     * const ext_sanpham_dictionary = await prisma.ext_sanpham_dictionary.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ext_sanpham_dictionaryUpdateArgs>(args: SelectSubset<T, ext_sanpham_dictionaryUpdateArgs<ExtArgs>>): Prisma__ext_sanpham_dictionaryClient<$Result.GetResult<Prisma.$ext_sanpham_dictionaryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Ext_sanpham_dictionaries.
     * @param {ext_sanpham_dictionaryDeleteManyArgs} args - Arguments to filter Ext_sanpham_dictionaries to delete.
     * @example
     * // Delete a few Ext_sanpham_dictionaries
     * const { count } = await prisma.ext_sanpham_dictionary.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ext_sanpham_dictionaryDeleteManyArgs>(args?: SelectSubset<T, ext_sanpham_dictionaryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ext_sanpham_dictionaries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_sanpham_dictionaryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Ext_sanpham_dictionaries
     * const ext_sanpham_dictionary = await prisma.ext_sanpham_dictionary.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ext_sanpham_dictionaryUpdateManyArgs>(args: SelectSubset<T, ext_sanpham_dictionaryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ext_sanpham_dictionaries and returns the data updated in the database.
     * @param {ext_sanpham_dictionaryUpdateManyAndReturnArgs} args - Arguments to update many Ext_sanpham_dictionaries.
     * @example
     * // Update many Ext_sanpham_dictionaries
     * const ext_sanpham_dictionary = await prisma.ext_sanpham_dictionary.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Ext_sanpham_dictionaries and only return the `id`
     * const ext_sanpham_dictionaryWithIdOnly = await prisma.ext_sanpham_dictionary.updateManyAndReturn({
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
    updateManyAndReturn<T extends ext_sanpham_dictionaryUpdateManyAndReturnArgs>(args: SelectSubset<T, ext_sanpham_dictionaryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ext_sanpham_dictionaryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Ext_sanpham_dictionary.
     * @param {ext_sanpham_dictionaryUpsertArgs} args - Arguments to update or create a Ext_sanpham_dictionary.
     * @example
     * // Update or create a Ext_sanpham_dictionary
     * const ext_sanpham_dictionary = await prisma.ext_sanpham_dictionary.upsert({
     *   create: {
     *     // ... data to create a Ext_sanpham_dictionary
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Ext_sanpham_dictionary we want to update
     *   }
     * })
     */
    upsert<T extends ext_sanpham_dictionaryUpsertArgs>(args: SelectSubset<T, ext_sanpham_dictionaryUpsertArgs<ExtArgs>>): Prisma__ext_sanpham_dictionaryClient<$Result.GetResult<Prisma.$ext_sanpham_dictionaryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Ext_sanpham_dictionaries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_sanpham_dictionaryCountArgs} args - Arguments to filter Ext_sanpham_dictionaries to count.
     * @example
     * // Count the number of Ext_sanpham_dictionaries
     * const count = await prisma.ext_sanpham_dictionary.count({
     *   where: {
     *     // ... the filter for the Ext_sanpham_dictionaries we want to count
     *   }
     * })
    **/
    count<T extends ext_sanpham_dictionaryCountArgs>(
      args?: Subset<T, ext_sanpham_dictionaryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Ext_sanpham_dictionaryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Ext_sanpham_dictionary.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Ext_sanpham_dictionaryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Ext_sanpham_dictionaryAggregateArgs>(args: Subset<T, Ext_sanpham_dictionaryAggregateArgs>): Prisma.PrismaPromise<GetExt_sanpham_dictionaryAggregateType<T>>

    /**
     * Group by Ext_sanpham_dictionary.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_sanpham_dictionaryGroupByArgs} args - Group by arguments.
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
      T extends ext_sanpham_dictionaryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ext_sanpham_dictionaryGroupByArgs['orderBy'] }
        : { orderBy?: ext_sanpham_dictionaryGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ext_sanpham_dictionaryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetExt_sanpham_dictionaryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ext_sanpham_dictionary model
   */
  readonly fields: ext_sanpham_dictionaryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ext_sanpham_dictionary.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ext_sanpham_dictionaryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
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
   * Fields of the ext_sanpham_dictionary model
   */
  interface ext_sanpham_dictionaryFieldRefs {
    readonly id: FieldRef<"ext_sanpham_dictionary", 'String'>
    readonly tenGoc: FieldRef<"ext_sanpham_dictionary", 'String'>
    readonly tenChuan: FieldRef<"ext_sanpham_dictionary", 'String'>
    readonly maHang: FieldRef<"ext_sanpham_dictionary", 'String'>
    readonly nhomHang: FieldRef<"ext_sanpham_dictionary", 'String'>
    readonly dvtinh: FieldRef<"ext_sanpham_dictionary", 'String'>
    readonly congtyId: FieldRef<"ext_sanpham_dictionary", 'String'>
    readonly frequency: FieldRef<"ext_sanpham_dictionary", 'Int'>
    readonly createdAt: FieldRef<"ext_sanpham_dictionary", 'DateTime'>
    readonly updatedAt: FieldRef<"ext_sanpham_dictionary", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ext_sanpham_dictionary findUnique
   */
  export type ext_sanpham_dictionaryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_sanpham_dictionary
     */
    select?: ext_sanpham_dictionarySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_sanpham_dictionary
     */
    omit?: ext_sanpham_dictionaryOmit<ExtArgs> | null
    /**
     * Filter, which ext_sanpham_dictionary to fetch.
     */
    where: ext_sanpham_dictionaryWhereUniqueInput
  }

  /**
   * ext_sanpham_dictionary findUniqueOrThrow
   */
  export type ext_sanpham_dictionaryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_sanpham_dictionary
     */
    select?: ext_sanpham_dictionarySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_sanpham_dictionary
     */
    omit?: ext_sanpham_dictionaryOmit<ExtArgs> | null
    /**
     * Filter, which ext_sanpham_dictionary to fetch.
     */
    where: ext_sanpham_dictionaryWhereUniqueInput
  }

  /**
   * ext_sanpham_dictionary findFirst
   */
  export type ext_sanpham_dictionaryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_sanpham_dictionary
     */
    select?: ext_sanpham_dictionarySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_sanpham_dictionary
     */
    omit?: ext_sanpham_dictionaryOmit<ExtArgs> | null
    /**
     * Filter, which ext_sanpham_dictionary to fetch.
     */
    where?: ext_sanpham_dictionaryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ext_sanpham_dictionaries to fetch.
     */
    orderBy?: ext_sanpham_dictionaryOrderByWithRelationInput | ext_sanpham_dictionaryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ext_sanpham_dictionaries.
     */
    cursor?: ext_sanpham_dictionaryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ext_sanpham_dictionaries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ext_sanpham_dictionaries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ext_sanpham_dictionaries.
     */
    distinct?: Ext_sanpham_dictionaryScalarFieldEnum | Ext_sanpham_dictionaryScalarFieldEnum[]
  }

  /**
   * ext_sanpham_dictionary findFirstOrThrow
   */
  export type ext_sanpham_dictionaryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_sanpham_dictionary
     */
    select?: ext_sanpham_dictionarySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_sanpham_dictionary
     */
    omit?: ext_sanpham_dictionaryOmit<ExtArgs> | null
    /**
     * Filter, which ext_sanpham_dictionary to fetch.
     */
    where?: ext_sanpham_dictionaryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ext_sanpham_dictionaries to fetch.
     */
    orderBy?: ext_sanpham_dictionaryOrderByWithRelationInput | ext_sanpham_dictionaryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ext_sanpham_dictionaries.
     */
    cursor?: ext_sanpham_dictionaryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ext_sanpham_dictionaries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ext_sanpham_dictionaries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ext_sanpham_dictionaries.
     */
    distinct?: Ext_sanpham_dictionaryScalarFieldEnum | Ext_sanpham_dictionaryScalarFieldEnum[]
  }

  /**
   * ext_sanpham_dictionary findMany
   */
  export type ext_sanpham_dictionaryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_sanpham_dictionary
     */
    select?: ext_sanpham_dictionarySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_sanpham_dictionary
     */
    omit?: ext_sanpham_dictionaryOmit<ExtArgs> | null
    /**
     * Filter, which ext_sanpham_dictionaries to fetch.
     */
    where?: ext_sanpham_dictionaryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ext_sanpham_dictionaries to fetch.
     */
    orderBy?: ext_sanpham_dictionaryOrderByWithRelationInput | ext_sanpham_dictionaryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ext_sanpham_dictionaries.
     */
    cursor?: ext_sanpham_dictionaryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ext_sanpham_dictionaries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ext_sanpham_dictionaries.
     */
    skip?: number
    distinct?: Ext_sanpham_dictionaryScalarFieldEnum | Ext_sanpham_dictionaryScalarFieldEnum[]
  }

  /**
   * ext_sanpham_dictionary create
   */
  export type ext_sanpham_dictionaryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_sanpham_dictionary
     */
    select?: ext_sanpham_dictionarySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_sanpham_dictionary
     */
    omit?: ext_sanpham_dictionaryOmit<ExtArgs> | null
    /**
     * The data needed to create a ext_sanpham_dictionary.
     */
    data: XOR<ext_sanpham_dictionaryCreateInput, ext_sanpham_dictionaryUncheckedCreateInput>
  }

  /**
   * ext_sanpham_dictionary createMany
   */
  export type ext_sanpham_dictionaryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ext_sanpham_dictionaries.
     */
    data: ext_sanpham_dictionaryCreateManyInput | ext_sanpham_dictionaryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ext_sanpham_dictionary createManyAndReturn
   */
  export type ext_sanpham_dictionaryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_sanpham_dictionary
     */
    select?: ext_sanpham_dictionarySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ext_sanpham_dictionary
     */
    omit?: ext_sanpham_dictionaryOmit<ExtArgs> | null
    /**
     * The data used to create many ext_sanpham_dictionaries.
     */
    data: ext_sanpham_dictionaryCreateManyInput | ext_sanpham_dictionaryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ext_sanpham_dictionary update
   */
  export type ext_sanpham_dictionaryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_sanpham_dictionary
     */
    select?: ext_sanpham_dictionarySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_sanpham_dictionary
     */
    omit?: ext_sanpham_dictionaryOmit<ExtArgs> | null
    /**
     * The data needed to update a ext_sanpham_dictionary.
     */
    data: XOR<ext_sanpham_dictionaryUpdateInput, ext_sanpham_dictionaryUncheckedUpdateInput>
    /**
     * Choose, which ext_sanpham_dictionary to update.
     */
    where: ext_sanpham_dictionaryWhereUniqueInput
  }

  /**
   * ext_sanpham_dictionary updateMany
   */
  export type ext_sanpham_dictionaryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ext_sanpham_dictionaries.
     */
    data: XOR<ext_sanpham_dictionaryUpdateManyMutationInput, ext_sanpham_dictionaryUncheckedUpdateManyInput>
    /**
     * Filter which ext_sanpham_dictionaries to update
     */
    where?: ext_sanpham_dictionaryWhereInput
    /**
     * Limit how many ext_sanpham_dictionaries to update.
     */
    limit?: number
  }

  /**
   * ext_sanpham_dictionary updateManyAndReturn
   */
  export type ext_sanpham_dictionaryUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_sanpham_dictionary
     */
    select?: ext_sanpham_dictionarySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ext_sanpham_dictionary
     */
    omit?: ext_sanpham_dictionaryOmit<ExtArgs> | null
    /**
     * The data used to update ext_sanpham_dictionaries.
     */
    data: XOR<ext_sanpham_dictionaryUpdateManyMutationInput, ext_sanpham_dictionaryUncheckedUpdateManyInput>
    /**
     * Filter which ext_sanpham_dictionaries to update
     */
    where?: ext_sanpham_dictionaryWhereInput
    /**
     * Limit how many ext_sanpham_dictionaries to update.
     */
    limit?: number
  }

  /**
   * ext_sanpham_dictionary upsert
   */
  export type ext_sanpham_dictionaryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_sanpham_dictionary
     */
    select?: ext_sanpham_dictionarySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_sanpham_dictionary
     */
    omit?: ext_sanpham_dictionaryOmit<ExtArgs> | null
    /**
     * The filter to search for the ext_sanpham_dictionary to update in case it exists.
     */
    where: ext_sanpham_dictionaryWhereUniqueInput
    /**
     * In case the ext_sanpham_dictionary found by the `where` argument doesn't exist, create a new ext_sanpham_dictionary with this data.
     */
    create: XOR<ext_sanpham_dictionaryCreateInput, ext_sanpham_dictionaryUncheckedCreateInput>
    /**
     * In case the ext_sanpham_dictionary was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ext_sanpham_dictionaryUpdateInput, ext_sanpham_dictionaryUncheckedUpdateInput>
  }

  /**
   * ext_sanpham_dictionary delete
   */
  export type ext_sanpham_dictionaryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_sanpham_dictionary
     */
    select?: ext_sanpham_dictionarySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_sanpham_dictionary
     */
    omit?: ext_sanpham_dictionaryOmit<ExtArgs> | null
    /**
     * Filter which ext_sanpham_dictionary to delete.
     */
    where: ext_sanpham_dictionaryWhereUniqueInput
  }

  /**
   * ext_sanpham_dictionary deleteMany
   */
  export type ext_sanpham_dictionaryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ext_sanpham_dictionaries to delete
     */
    where?: ext_sanpham_dictionaryWhereInput
    /**
     * Limit how many ext_sanpham_dictionaries to delete.
     */
    limit?: number
  }

  /**
   * ext_sanpham_dictionary without action
   */
  export type ext_sanpham_dictionaryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_sanpham_dictionary
     */
    select?: ext_sanpham_dictionarySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ext_sanpham_dictionary
     */
    omit?: ext_sanpham_dictionaryOmit<ExtArgs> | null
  }


  /**
   * Model ext_daily_stock_v2
   */

  export type AggregateExt_daily_stock_v2 = {
    _count: Ext_daily_stock_v2CountAggregateOutputType | null
    _avg: Ext_daily_stock_v2AvgAggregateOutputType | null
    _sum: Ext_daily_stock_v2SumAggregateOutputType | null
    _min: Ext_daily_stock_v2MinAggregateOutputType | null
    _max: Ext_daily_stock_v2MaxAggregateOutputType | null
  }

  export type Ext_daily_stock_v2AvgAggregateOutputType = {
    tonDauQty: Decimal | null
    tonDauVal: Decimal | null
    nhapQty: Decimal | null
    nhapVal: Decimal | null
    xuatQty: Decimal | null
    xuatVal: Decimal | null
    tonCuoiQty: Decimal | null
    tonCuoiVal: Decimal | null
  }

  export type Ext_daily_stock_v2SumAggregateOutputType = {
    tonDauQty: Decimal | null
    tonDauVal: Decimal | null
    nhapQty: Decimal | null
    nhapVal: Decimal | null
    xuatQty: Decimal | null
    xuatVal: Decimal | null
    tonCuoiQty: Decimal | null
    tonCuoiVal: Decimal | null
  }

  export type Ext_daily_stock_v2MinAggregateOutputType = {
    id: string | null
    congtyId: string | null
    date: Date | null
    tenHangChuan: string | null
    maHang: string | null
    dvtinh: string | null
    tonDauQty: Decimal | null
    tonDauVal: Decimal | null
    nhapQty: Decimal | null
    nhapVal: Decimal | null
    xuatQty: Decimal | null
    xuatVal: Decimal | null
    tonCuoiQty: Decimal | null
    tonCuoiVal: Decimal | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type Ext_daily_stock_v2MaxAggregateOutputType = {
    id: string | null
    congtyId: string | null
    date: Date | null
    tenHangChuan: string | null
    maHang: string | null
    dvtinh: string | null
    tonDauQty: Decimal | null
    tonDauVal: Decimal | null
    nhapQty: Decimal | null
    nhapVal: Decimal | null
    xuatQty: Decimal | null
    xuatVal: Decimal | null
    tonCuoiQty: Decimal | null
    tonCuoiVal: Decimal | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type Ext_daily_stock_v2CountAggregateOutputType = {
    id: number
    congtyId: number
    date: number
    tenHangChuan: number
    maHang: number
    dvtinh: number
    tonDauQty: number
    tonDauVal: number
    nhapQty: number
    nhapVal: number
    xuatQty: number
    xuatVal: number
    tonCuoiQty: number
    tonCuoiVal: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type Ext_daily_stock_v2AvgAggregateInputType = {
    tonDauQty?: true
    tonDauVal?: true
    nhapQty?: true
    nhapVal?: true
    xuatQty?: true
    xuatVal?: true
    tonCuoiQty?: true
    tonCuoiVal?: true
  }

  export type Ext_daily_stock_v2SumAggregateInputType = {
    tonDauQty?: true
    tonDauVal?: true
    nhapQty?: true
    nhapVal?: true
    xuatQty?: true
    xuatVal?: true
    tonCuoiQty?: true
    tonCuoiVal?: true
  }

  export type Ext_daily_stock_v2MinAggregateInputType = {
    id?: true
    congtyId?: true
    date?: true
    tenHangChuan?: true
    maHang?: true
    dvtinh?: true
    tonDauQty?: true
    tonDauVal?: true
    nhapQty?: true
    nhapVal?: true
    xuatQty?: true
    xuatVal?: true
    tonCuoiQty?: true
    tonCuoiVal?: true
    createdAt?: true
    updatedAt?: true
  }

  export type Ext_daily_stock_v2MaxAggregateInputType = {
    id?: true
    congtyId?: true
    date?: true
    tenHangChuan?: true
    maHang?: true
    dvtinh?: true
    tonDauQty?: true
    tonDauVal?: true
    nhapQty?: true
    nhapVal?: true
    xuatQty?: true
    xuatVal?: true
    tonCuoiQty?: true
    tonCuoiVal?: true
    createdAt?: true
    updatedAt?: true
  }

  export type Ext_daily_stock_v2CountAggregateInputType = {
    id?: true
    congtyId?: true
    date?: true
    tenHangChuan?: true
    maHang?: true
    dvtinh?: true
    tonDauQty?: true
    tonDauVal?: true
    nhapQty?: true
    nhapVal?: true
    xuatQty?: true
    xuatVal?: true
    tonCuoiQty?: true
    tonCuoiVal?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type Ext_daily_stock_v2AggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ext_daily_stock_v2 to aggregate.
     */
    where?: ext_daily_stock_v2WhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ext_daily_stock_v2s to fetch.
     */
    orderBy?: ext_daily_stock_v2OrderByWithRelationInput | ext_daily_stock_v2OrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ext_daily_stock_v2WhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ext_daily_stock_v2s from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ext_daily_stock_v2s.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ext_daily_stock_v2s
    **/
    _count?: true | Ext_daily_stock_v2CountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Ext_daily_stock_v2AvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Ext_daily_stock_v2SumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Ext_daily_stock_v2MinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Ext_daily_stock_v2MaxAggregateInputType
  }

  export type GetExt_daily_stock_v2AggregateType<T extends Ext_daily_stock_v2AggregateArgs> = {
        [P in keyof T & keyof AggregateExt_daily_stock_v2]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateExt_daily_stock_v2[P]>
      : GetScalarType<T[P], AggregateExt_daily_stock_v2[P]>
  }




  export type ext_daily_stock_v2GroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ext_daily_stock_v2WhereInput
    orderBy?: ext_daily_stock_v2OrderByWithAggregationInput | ext_daily_stock_v2OrderByWithAggregationInput[]
    by: Ext_daily_stock_v2ScalarFieldEnum[] | Ext_daily_stock_v2ScalarFieldEnum
    having?: ext_daily_stock_v2ScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Ext_daily_stock_v2CountAggregateInputType | true
    _avg?: Ext_daily_stock_v2AvgAggregateInputType
    _sum?: Ext_daily_stock_v2SumAggregateInputType
    _min?: Ext_daily_stock_v2MinAggregateInputType
    _max?: Ext_daily_stock_v2MaxAggregateInputType
  }

  export type Ext_daily_stock_v2GroupByOutputType = {
    id: string
    congtyId: string | null
    date: Date
    tenHangChuan: string
    maHang: string | null
    dvtinh: string | null
    tonDauQty: Decimal
    tonDauVal: Decimal
    nhapQty: Decimal
    nhapVal: Decimal
    xuatQty: Decimal
    xuatVal: Decimal
    tonCuoiQty: Decimal
    tonCuoiVal: Decimal
    createdAt: Date
    updatedAt: Date
    _count: Ext_daily_stock_v2CountAggregateOutputType | null
    _avg: Ext_daily_stock_v2AvgAggregateOutputType | null
    _sum: Ext_daily_stock_v2SumAggregateOutputType | null
    _min: Ext_daily_stock_v2MinAggregateOutputType | null
    _max: Ext_daily_stock_v2MaxAggregateOutputType | null
  }

  type GetExt_daily_stock_v2GroupByPayload<T extends ext_daily_stock_v2GroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Ext_daily_stock_v2GroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Ext_daily_stock_v2GroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Ext_daily_stock_v2GroupByOutputType[P]>
            : GetScalarType<T[P], Ext_daily_stock_v2GroupByOutputType[P]>
        }
      >
    >


  export type ext_daily_stock_v2Select<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    congtyId?: boolean
    date?: boolean
    tenHangChuan?: boolean
    maHang?: boolean
    dvtinh?: boolean
    tonDauQty?: boolean
    tonDauVal?: boolean
    nhapQty?: boolean
    nhapVal?: boolean
    xuatQty?: boolean
    xuatVal?: boolean
    tonCuoiQty?: boolean
    tonCuoiVal?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["ext_daily_stock_v2"]>

  export type ext_daily_stock_v2SelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    congtyId?: boolean
    date?: boolean
    tenHangChuan?: boolean
    maHang?: boolean
    dvtinh?: boolean
    tonDauQty?: boolean
    tonDauVal?: boolean
    nhapQty?: boolean
    nhapVal?: boolean
    xuatQty?: boolean
    xuatVal?: boolean
    tonCuoiQty?: boolean
    tonCuoiVal?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["ext_daily_stock_v2"]>

  export type ext_daily_stock_v2SelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    congtyId?: boolean
    date?: boolean
    tenHangChuan?: boolean
    maHang?: boolean
    dvtinh?: boolean
    tonDauQty?: boolean
    tonDauVal?: boolean
    nhapQty?: boolean
    nhapVal?: boolean
    xuatQty?: boolean
    xuatVal?: boolean
    tonCuoiQty?: boolean
    tonCuoiVal?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["ext_daily_stock_v2"]>

  export type ext_daily_stock_v2SelectScalar = {
    id?: boolean
    congtyId?: boolean
    date?: boolean
    tenHangChuan?: boolean
    maHang?: boolean
    dvtinh?: boolean
    tonDauQty?: boolean
    tonDauVal?: boolean
    nhapQty?: boolean
    nhapVal?: boolean
    xuatQty?: boolean
    xuatVal?: boolean
    tonCuoiQty?: boolean
    tonCuoiVal?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ext_daily_stock_v2Omit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "congtyId" | "date" | "tenHangChuan" | "maHang" | "dvtinh" | "tonDauQty" | "tonDauVal" | "nhapQty" | "nhapVal" | "xuatQty" | "xuatVal" | "tonCuoiQty" | "tonCuoiVal" | "createdAt" | "updatedAt", ExtArgs["result"]["ext_daily_stock_v2"]>

  export type $ext_daily_stock_v2Payload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ext_daily_stock_v2"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      congtyId: string | null
      date: Date
      tenHangChuan: string
      maHang: string | null
      dvtinh: string | null
      tonDauQty: Prisma.Decimal
      tonDauVal: Prisma.Decimal
      nhapQty: Prisma.Decimal
      nhapVal: Prisma.Decimal
      xuatQty: Prisma.Decimal
      xuatVal: Prisma.Decimal
      tonCuoiQty: Prisma.Decimal
      tonCuoiVal: Prisma.Decimal
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["ext_daily_stock_v2"]>
    composites: {}
  }

  type ext_daily_stock_v2GetPayload<S extends boolean | null | undefined | ext_daily_stock_v2DefaultArgs> = $Result.GetResult<Prisma.$ext_daily_stock_v2Payload, S>

  type ext_daily_stock_v2CountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ext_daily_stock_v2FindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Ext_daily_stock_v2CountAggregateInputType | true
    }

  export interface ext_daily_stock_v2Delegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ext_daily_stock_v2'], meta: { name: 'ext_daily_stock_v2' } }
    /**
     * Find zero or one Ext_daily_stock_v2 that matches the filter.
     * @param {ext_daily_stock_v2FindUniqueArgs} args - Arguments to find a Ext_daily_stock_v2
     * @example
     * // Get one Ext_daily_stock_v2
     * const ext_daily_stock_v2 = await prisma.ext_daily_stock_v2.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ext_daily_stock_v2FindUniqueArgs>(args: SelectSubset<T, ext_daily_stock_v2FindUniqueArgs<ExtArgs>>): Prisma__ext_daily_stock_v2Client<$Result.GetResult<Prisma.$ext_daily_stock_v2Payload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Ext_daily_stock_v2 that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ext_daily_stock_v2FindUniqueOrThrowArgs} args - Arguments to find a Ext_daily_stock_v2
     * @example
     * // Get one Ext_daily_stock_v2
     * const ext_daily_stock_v2 = await prisma.ext_daily_stock_v2.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ext_daily_stock_v2FindUniqueOrThrowArgs>(args: SelectSubset<T, ext_daily_stock_v2FindUniqueOrThrowArgs<ExtArgs>>): Prisma__ext_daily_stock_v2Client<$Result.GetResult<Prisma.$ext_daily_stock_v2Payload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ext_daily_stock_v2 that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_daily_stock_v2FindFirstArgs} args - Arguments to find a Ext_daily_stock_v2
     * @example
     * // Get one Ext_daily_stock_v2
     * const ext_daily_stock_v2 = await prisma.ext_daily_stock_v2.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ext_daily_stock_v2FindFirstArgs>(args?: SelectSubset<T, ext_daily_stock_v2FindFirstArgs<ExtArgs>>): Prisma__ext_daily_stock_v2Client<$Result.GetResult<Prisma.$ext_daily_stock_v2Payload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ext_daily_stock_v2 that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_daily_stock_v2FindFirstOrThrowArgs} args - Arguments to find a Ext_daily_stock_v2
     * @example
     * // Get one Ext_daily_stock_v2
     * const ext_daily_stock_v2 = await prisma.ext_daily_stock_v2.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ext_daily_stock_v2FindFirstOrThrowArgs>(args?: SelectSubset<T, ext_daily_stock_v2FindFirstOrThrowArgs<ExtArgs>>): Prisma__ext_daily_stock_v2Client<$Result.GetResult<Prisma.$ext_daily_stock_v2Payload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Ext_daily_stock_v2s that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_daily_stock_v2FindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Ext_daily_stock_v2s
     * const ext_daily_stock_v2s = await prisma.ext_daily_stock_v2.findMany()
     * 
     * // Get first 10 Ext_daily_stock_v2s
     * const ext_daily_stock_v2s = await prisma.ext_daily_stock_v2.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const ext_daily_stock_v2WithIdOnly = await prisma.ext_daily_stock_v2.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ext_daily_stock_v2FindManyArgs>(args?: SelectSubset<T, ext_daily_stock_v2FindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ext_daily_stock_v2Payload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Ext_daily_stock_v2.
     * @param {ext_daily_stock_v2CreateArgs} args - Arguments to create a Ext_daily_stock_v2.
     * @example
     * // Create one Ext_daily_stock_v2
     * const Ext_daily_stock_v2 = await prisma.ext_daily_stock_v2.create({
     *   data: {
     *     // ... data to create a Ext_daily_stock_v2
     *   }
     * })
     * 
     */
    create<T extends ext_daily_stock_v2CreateArgs>(args: SelectSubset<T, ext_daily_stock_v2CreateArgs<ExtArgs>>): Prisma__ext_daily_stock_v2Client<$Result.GetResult<Prisma.$ext_daily_stock_v2Payload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Ext_daily_stock_v2s.
     * @param {ext_daily_stock_v2CreateManyArgs} args - Arguments to create many Ext_daily_stock_v2s.
     * @example
     * // Create many Ext_daily_stock_v2s
     * const ext_daily_stock_v2 = await prisma.ext_daily_stock_v2.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ext_daily_stock_v2CreateManyArgs>(args?: SelectSubset<T, ext_daily_stock_v2CreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Ext_daily_stock_v2s and returns the data saved in the database.
     * @param {ext_daily_stock_v2CreateManyAndReturnArgs} args - Arguments to create many Ext_daily_stock_v2s.
     * @example
     * // Create many Ext_daily_stock_v2s
     * const ext_daily_stock_v2 = await prisma.ext_daily_stock_v2.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Ext_daily_stock_v2s and only return the `id`
     * const ext_daily_stock_v2WithIdOnly = await prisma.ext_daily_stock_v2.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ext_daily_stock_v2CreateManyAndReturnArgs>(args?: SelectSubset<T, ext_daily_stock_v2CreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ext_daily_stock_v2Payload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Ext_daily_stock_v2.
     * @param {ext_daily_stock_v2DeleteArgs} args - Arguments to delete one Ext_daily_stock_v2.
     * @example
     * // Delete one Ext_daily_stock_v2
     * const Ext_daily_stock_v2 = await prisma.ext_daily_stock_v2.delete({
     *   where: {
     *     // ... filter to delete one Ext_daily_stock_v2
     *   }
     * })
     * 
     */
    delete<T extends ext_daily_stock_v2DeleteArgs>(args: SelectSubset<T, ext_daily_stock_v2DeleteArgs<ExtArgs>>): Prisma__ext_daily_stock_v2Client<$Result.GetResult<Prisma.$ext_daily_stock_v2Payload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Ext_daily_stock_v2.
     * @param {ext_daily_stock_v2UpdateArgs} args - Arguments to update one Ext_daily_stock_v2.
     * @example
     * // Update one Ext_daily_stock_v2
     * const ext_daily_stock_v2 = await prisma.ext_daily_stock_v2.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ext_daily_stock_v2UpdateArgs>(args: SelectSubset<T, ext_daily_stock_v2UpdateArgs<ExtArgs>>): Prisma__ext_daily_stock_v2Client<$Result.GetResult<Prisma.$ext_daily_stock_v2Payload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Ext_daily_stock_v2s.
     * @param {ext_daily_stock_v2DeleteManyArgs} args - Arguments to filter Ext_daily_stock_v2s to delete.
     * @example
     * // Delete a few Ext_daily_stock_v2s
     * const { count } = await prisma.ext_daily_stock_v2.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ext_daily_stock_v2DeleteManyArgs>(args?: SelectSubset<T, ext_daily_stock_v2DeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ext_daily_stock_v2s.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_daily_stock_v2UpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Ext_daily_stock_v2s
     * const ext_daily_stock_v2 = await prisma.ext_daily_stock_v2.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ext_daily_stock_v2UpdateManyArgs>(args: SelectSubset<T, ext_daily_stock_v2UpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ext_daily_stock_v2s and returns the data updated in the database.
     * @param {ext_daily_stock_v2UpdateManyAndReturnArgs} args - Arguments to update many Ext_daily_stock_v2s.
     * @example
     * // Update many Ext_daily_stock_v2s
     * const ext_daily_stock_v2 = await prisma.ext_daily_stock_v2.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Ext_daily_stock_v2s and only return the `id`
     * const ext_daily_stock_v2WithIdOnly = await prisma.ext_daily_stock_v2.updateManyAndReturn({
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
    updateManyAndReturn<T extends ext_daily_stock_v2UpdateManyAndReturnArgs>(args: SelectSubset<T, ext_daily_stock_v2UpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ext_daily_stock_v2Payload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Ext_daily_stock_v2.
     * @param {ext_daily_stock_v2UpsertArgs} args - Arguments to update or create a Ext_daily_stock_v2.
     * @example
     * // Update or create a Ext_daily_stock_v2
     * const ext_daily_stock_v2 = await prisma.ext_daily_stock_v2.upsert({
     *   create: {
     *     // ... data to create a Ext_daily_stock_v2
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Ext_daily_stock_v2 we want to update
     *   }
     * })
     */
    upsert<T extends ext_daily_stock_v2UpsertArgs>(args: SelectSubset<T, ext_daily_stock_v2UpsertArgs<ExtArgs>>): Prisma__ext_daily_stock_v2Client<$Result.GetResult<Prisma.$ext_daily_stock_v2Payload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Ext_daily_stock_v2s.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_daily_stock_v2CountArgs} args - Arguments to filter Ext_daily_stock_v2s to count.
     * @example
     * // Count the number of Ext_daily_stock_v2s
     * const count = await prisma.ext_daily_stock_v2.count({
     *   where: {
     *     // ... the filter for the Ext_daily_stock_v2s we want to count
     *   }
     * })
    **/
    count<T extends ext_daily_stock_v2CountArgs>(
      args?: Subset<T, ext_daily_stock_v2CountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Ext_daily_stock_v2CountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Ext_daily_stock_v2.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Ext_daily_stock_v2AggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Ext_daily_stock_v2AggregateArgs>(args: Subset<T, Ext_daily_stock_v2AggregateArgs>): Prisma.PrismaPromise<GetExt_daily_stock_v2AggregateType<T>>

    /**
     * Group by Ext_daily_stock_v2.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ext_daily_stock_v2GroupByArgs} args - Group by arguments.
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
      T extends ext_daily_stock_v2GroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ext_daily_stock_v2GroupByArgs['orderBy'] }
        : { orderBy?: ext_daily_stock_v2GroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ext_daily_stock_v2GroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetExt_daily_stock_v2GroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ext_daily_stock_v2 model
   */
  readonly fields: ext_daily_stock_v2FieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ext_daily_stock_v2.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ext_daily_stock_v2Client<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
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
   * Fields of the ext_daily_stock_v2 model
   */
  interface ext_daily_stock_v2FieldRefs {
    readonly id: FieldRef<"ext_daily_stock_v2", 'String'>
    readonly congtyId: FieldRef<"ext_daily_stock_v2", 'String'>
    readonly date: FieldRef<"ext_daily_stock_v2", 'DateTime'>
    readonly tenHangChuan: FieldRef<"ext_daily_stock_v2", 'String'>
    readonly maHang: FieldRef<"ext_daily_stock_v2", 'String'>
    readonly dvtinh: FieldRef<"ext_daily_stock_v2", 'String'>
    readonly tonDauQty: FieldRef<"ext_daily_stock_v2", 'Decimal'>
    readonly tonDauVal: FieldRef<"ext_daily_stock_v2", 'Decimal'>
    readonly nhapQty: FieldRef<"ext_daily_stock_v2", 'Decimal'>
    readonly nhapVal: FieldRef<"ext_daily_stock_v2", 'Decimal'>
    readonly xuatQty: FieldRef<"ext_daily_stock_v2", 'Decimal'>
    readonly xuatVal: FieldRef<"ext_daily_stock_v2", 'Decimal'>
    readonly tonCuoiQty: FieldRef<"ext_daily_stock_v2", 'Decimal'>
    readonly tonCuoiVal: FieldRef<"ext_daily_stock_v2", 'Decimal'>
    readonly createdAt: FieldRef<"ext_daily_stock_v2", 'DateTime'>
    readonly updatedAt: FieldRef<"ext_daily_stock_v2", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ext_daily_stock_v2 findUnique
   */
  export type ext_daily_stock_v2FindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_daily_stock_v2
     */
    select?: ext_daily_stock_v2Select<ExtArgs> | null
    /**
     * Omit specific fields from the ext_daily_stock_v2
     */
    omit?: ext_daily_stock_v2Omit<ExtArgs> | null
    /**
     * Filter, which ext_daily_stock_v2 to fetch.
     */
    where: ext_daily_stock_v2WhereUniqueInput
  }

  /**
   * ext_daily_stock_v2 findUniqueOrThrow
   */
  export type ext_daily_stock_v2FindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_daily_stock_v2
     */
    select?: ext_daily_stock_v2Select<ExtArgs> | null
    /**
     * Omit specific fields from the ext_daily_stock_v2
     */
    omit?: ext_daily_stock_v2Omit<ExtArgs> | null
    /**
     * Filter, which ext_daily_stock_v2 to fetch.
     */
    where: ext_daily_stock_v2WhereUniqueInput
  }

  /**
   * ext_daily_stock_v2 findFirst
   */
  export type ext_daily_stock_v2FindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_daily_stock_v2
     */
    select?: ext_daily_stock_v2Select<ExtArgs> | null
    /**
     * Omit specific fields from the ext_daily_stock_v2
     */
    omit?: ext_daily_stock_v2Omit<ExtArgs> | null
    /**
     * Filter, which ext_daily_stock_v2 to fetch.
     */
    where?: ext_daily_stock_v2WhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ext_daily_stock_v2s to fetch.
     */
    orderBy?: ext_daily_stock_v2OrderByWithRelationInput | ext_daily_stock_v2OrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ext_daily_stock_v2s.
     */
    cursor?: ext_daily_stock_v2WhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ext_daily_stock_v2s from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ext_daily_stock_v2s.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ext_daily_stock_v2s.
     */
    distinct?: Ext_daily_stock_v2ScalarFieldEnum | Ext_daily_stock_v2ScalarFieldEnum[]
  }

  /**
   * ext_daily_stock_v2 findFirstOrThrow
   */
  export type ext_daily_stock_v2FindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_daily_stock_v2
     */
    select?: ext_daily_stock_v2Select<ExtArgs> | null
    /**
     * Omit specific fields from the ext_daily_stock_v2
     */
    omit?: ext_daily_stock_v2Omit<ExtArgs> | null
    /**
     * Filter, which ext_daily_stock_v2 to fetch.
     */
    where?: ext_daily_stock_v2WhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ext_daily_stock_v2s to fetch.
     */
    orderBy?: ext_daily_stock_v2OrderByWithRelationInput | ext_daily_stock_v2OrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ext_daily_stock_v2s.
     */
    cursor?: ext_daily_stock_v2WhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ext_daily_stock_v2s from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ext_daily_stock_v2s.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ext_daily_stock_v2s.
     */
    distinct?: Ext_daily_stock_v2ScalarFieldEnum | Ext_daily_stock_v2ScalarFieldEnum[]
  }

  /**
   * ext_daily_stock_v2 findMany
   */
  export type ext_daily_stock_v2FindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_daily_stock_v2
     */
    select?: ext_daily_stock_v2Select<ExtArgs> | null
    /**
     * Omit specific fields from the ext_daily_stock_v2
     */
    omit?: ext_daily_stock_v2Omit<ExtArgs> | null
    /**
     * Filter, which ext_daily_stock_v2s to fetch.
     */
    where?: ext_daily_stock_v2WhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ext_daily_stock_v2s to fetch.
     */
    orderBy?: ext_daily_stock_v2OrderByWithRelationInput | ext_daily_stock_v2OrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ext_daily_stock_v2s.
     */
    cursor?: ext_daily_stock_v2WhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ext_daily_stock_v2s from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ext_daily_stock_v2s.
     */
    skip?: number
    distinct?: Ext_daily_stock_v2ScalarFieldEnum | Ext_daily_stock_v2ScalarFieldEnum[]
  }

  /**
   * ext_daily_stock_v2 create
   */
  export type ext_daily_stock_v2CreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_daily_stock_v2
     */
    select?: ext_daily_stock_v2Select<ExtArgs> | null
    /**
     * Omit specific fields from the ext_daily_stock_v2
     */
    omit?: ext_daily_stock_v2Omit<ExtArgs> | null
    /**
     * The data needed to create a ext_daily_stock_v2.
     */
    data: XOR<ext_daily_stock_v2CreateInput, ext_daily_stock_v2UncheckedCreateInput>
  }

  /**
   * ext_daily_stock_v2 createMany
   */
  export type ext_daily_stock_v2CreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ext_daily_stock_v2s.
     */
    data: ext_daily_stock_v2CreateManyInput | ext_daily_stock_v2CreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ext_daily_stock_v2 createManyAndReturn
   */
  export type ext_daily_stock_v2CreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_daily_stock_v2
     */
    select?: ext_daily_stock_v2SelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ext_daily_stock_v2
     */
    omit?: ext_daily_stock_v2Omit<ExtArgs> | null
    /**
     * The data used to create many ext_daily_stock_v2s.
     */
    data: ext_daily_stock_v2CreateManyInput | ext_daily_stock_v2CreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ext_daily_stock_v2 update
   */
  export type ext_daily_stock_v2UpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_daily_stock_v2
     */
    select?: ext_daily_stock_v2Select<ExtArgs> | null
    /**
     * Omit specific fields from the ext_daily_stock_v2
     */
    omit?: ext_daily_stock_v2Omit<ExtArgs> | null
    /**
     * The data needed to update a ext_daily_stock_v2.
     */
    data: XOR<ext_daily_stock_v2UpdateInput, ext_daily_stock_v2UncheckedUpdateInput>
    /**
     * Choose, which ext_daily_stock_v2 to update.
     */
    where: ext_daily_stock_v2WhereUniqueInput
  }

  /**
   * ext_daily_stock_v2 updateMany
   */
  export type ext_daily_stock_v2UpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ext_daily_stock_v2s.
     */
    data: XOR<ext_daily_stock_v2UpdateManyMutationInput, ext_daily_stock_v2UncheckedUpdateManyInput>
    /**
     * Filter which ext_daily_stock_v2s to update
     */
    where?: ext_daily_stock_v2WhereInput
    /**
     * Limit how many ext_daily_stock_v2s to update.
     */
    limit?: number
  }

  /**
   * ext_daily_stock_v2 updateManyAndReturn
   */
  export type ext_daily_stock_v2UpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_daily_stock_v2
     */
    select?: ext_daily_stock_v2SelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ext_daily_stock_v2
     */
    omit?: ext_daily_stock_v2Omit<ExtArgs> | null
    /**
     * The data used to update ext_daily_stock_v2s.
     */
    data: XOR<ext_daily_stock_v2UpdateManyMutationInput, ext_daily_stock_v2UncheckedUpdateManyInput>
    /**
     * Filter which ext_daily_stock_v2s to update
     */
    where?: ext_daily_stock_v2WhereInput
    /**
     * Limit how many ext_daily_stock_v2s to update.
     */
    limit?: number
  }

  /**
   * ext_daily_stock_v2 upsert
   */
  export type ext_daily_stock_v2UpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_daily_stock_v2
     */
    select?: ext_daily_stock_v2Select<ExtArgs> | null
    /**
     * Omit specific fields from the ext_daily_stock_v2
     */
    omit?: ext_daily_stock_v2Omit<ExtArgs> | null
    /**
     * The filter to search for the ext_daily_stock_v2 to update in case it exists.
     */
    where: ext_daily_stock_v2WhereUniqueInput
    /**
     * In case the ext_daily_stock_v2 found by the `where` argument doesn't exist, create a new ext_daily_stock_v2 with this data.
     */
    create: XOR<ext_daily_stock_v2CreateInput, ext_daily_stock_v2UncheckedCreateInput>
    /**
     * In case the ext_daily_stock_v2 was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ext_daily_stock_v2UpdateInput, ext_daily_stock_v2UncheckedUpdateInput>
  }

  /**
   * ext_daily_stock_v2 delete
   */
  export type ext_daily_stock_v2DeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_daily_stock_v2
     */
    select?: ext_daily_stock_v2Select<ExtArgs> | null
    /**
     * Omit specific fields from the ext_daily_stock_v2
     */
    omit?: ext_daily_stock_v2Omit<ExtArgs> | null
    /**
     * Filter which ext_daily_stock_v2 to delete.
     */
    where: ext_daily_stock_v2WhereUniqueInput
  }

  /**
   * ext_daily_stock_v2 deleteMany
   */
  export type ext_daily_stock_v2DeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ext_daily_stock_v2s to delete
     */
    where?: ext_daily_stock_v2WhereInput
    /**
     * Limit how many ext_daily_stock_v2s to delete.
     */
    limit?: number
  }

  /**
   * ext_daily_stock_v2 without action
   */
  export type ext_daily_stock_v2DefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ext_daily_stock_v2
     */
    select?: ext_daily_stock_v2Select<ExtArgs> | null
    /**
     * Omit specific fields from the ext_daily_stock_v2
     */
    omit?: ext_daily_stock_v2Omit<ExtArgs> | null
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


  export const Ext_congtyScalarFieldEnum: {
    id: 'id',
    mst: 'mst',
    ten: 'ten',
    tenVietTat: 'tenVietTat',
    diaChi: 'diaChi',
    dienThoai: 'dienThoai',
    email: 'email',
    nguoiDaiDien: 'nguoiDaiDien',
    isActive: 'isActive',
    isDefault: 'isDefault',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type Ext_congtyScalarFieldEnum = (typeof Ext_congtyScalarFieldEnum)[keyof typeof Ext_congtyScalarFieldEnum]


  export const Ext_listhoadonScalarFieldEnum: {
    id: 'id',
    idServer: 'idServer',
    brandname: 'brandname',
    congtyId: 'congtyId',
    nbmst: 'nbmst',
    nbten: 'nbten',
    nbdchi: 'nbdchi',
    nmmst: 'nmmst',
    nmten: 'nmten',
    nmdchi: 'nmdchi',
    khmshdon: 'khmshdon',
    khhdon: 'khhdon',
    shdon: 'shdon',
    mhso: 'mhso',
    tgtcthue: 'tgtcthue',
    tgtthue: 'tgtthue',
    tgtttbso: 'tgtttbso',
    tdlap: 'tdlap',
    tthai: 'tthai',
    loaihd: 'loaihd',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type Ext_listhoadonScalarFieldEnum = (typeof Ext_listhoadonScalarFieldEnum)[keyof typeof Ext_listhoadonScalarFieldEnum]


  export const Ext_detailhoadonScalarFieldEnum: {
    id: 'id',
    idServer: 'idServer',
    idhdonServer: 'idhdonServer',
    stt: 'stt',
    ten: 'ten',
    dvtinh: 'dvtinh',
    sluong: 'sluong',
    dgia: 'dgia',
    thtien: 'thtien',
    tsuat: 'tsuat',
    tthue: 'tthue',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type Ext_detailhoadonScalarFieldEnum = (typeof Ext_detailhoadonScalarFieldEnum)[keyof typeof Ext_detailhoadonScalarFieldEnum]


  export const Ext_sanphamhoadonScalarFieldEnum: {
    id: 'id',
    iddetailhoadon: 'iddetailhoadon',
    ten: 'ten',
    ten2: 'ten2',
    ma: 'ma',
    dvt: 'dvt',
    dgia: 'dgia',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type Ext_sanphamhoadonScalarFieldEnum = (typeof Ext_sanphamhoadonScalarFieldEnum)[keyof typeof Ext_sanphamhoadonScalarFieldEnum]


  export const Ext_apiconfigScalarFieldEnum: {
    id: 'id',
    name: 'name',
    congtyId: 'congtyId',
    bearerToken: 'bearerToken',
    baseUrl: 'baseUrl',
    brandname: 'brandname',
    batchSize: 'batchSize',
    delayBetweenBatches: 'delayBetweenBatches',
    delayBetweenDetailCalls: 'delayBetweenDetailCalls',
    maxRetries: 'maxRetries',
    lastSyncAt: 'lastSyncAt',
    lastSyncStatus: 'lastSyncStatus',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type Ext_apiconfigScalarFieldEnum = (typeof Ext_apiconfigScalarFieldEnum)[keyof typeof Ext_apiconfigScalarFieldEnum]


  export const Ext_synclogScalarFieldEnum: {
    id: 'id',
    congtyId: 'congtyId',
    configId: 'configId',
    syncType: 'syncType',
    fromDate: 'fromDate',
    toDate: 'toDate',
    totalRecords: 'totalRecords',
    successCount: 'successCount',
    errorCount: 'errorCount',
    status: 'status',
    errorMessage: 'errorMessage',
    startedAt: 'startedAt',
    completedAt: 'completedAt',
    createdAt: 'createdAt'
  };

  export type Ext_synclogScalarFieldEnum = (typeof Ext_synclogScalarFieldEnum)[keyof typeof Ext_synclogScalarFieldEnum]


  export const Ext_tonghopScalarFieldEnum: {
    id: 'id',
    idDetailServer: 'idDetailServer',
    idHoadonServer: 'idHoadonServer',
    congtyId: 'congtyId',
    congtyMst: 'congtyMst',
    congtyTen: 'congtyTen',
    khmshdon: 'khmshdon',
    khhdon: 'khhdon',
    shdon: 'shdon',
    mhso: 'mhso',
    tdlap: 'tdlap',
    tthai: 'tthai',
    loaihd: 'loaihd',
    nbmst: 'nbmst',
    nbten: 'nbten',
    nbdchi: 'nbdchi',
    nmmst: 'nmmst',
    nmten: 'nmten',
    nmdchi: 'nmdchi',
    stt: 'stt',
    tenHang: 'tenHang',
    tenHangChuan: 'tenHangChuan',
    maHang: 'maHang',
    nhomHang: 'nhomHang',
    dvtinh: 'dvtinh',
    sluong: 'sluong',
    dgia: 'dgia',
    thtien: 'thtien',
    tsuat: 'tsuat',
    tthue: 'tthue',
    tongTien: 'tongTien',
    soLuongNhap: 'soLuongNhap',
    soLuongXuat: 'soLuongXuat',
    giaTriNhap: 'giaTriNhap',
    giaTriXuat: 'giaTriXuat',
    searchText: 'searchText',
    tags: 'tags',
    nam: 'nam',
    thang: 'thang',
    quy: 'quy',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    syncedAt: 'syncedAt'
  };

  export type Ext_tonghopScalarFieldEnum = (typeof Ext_tonghopScalarFieldEnum)[keyof typeof Ext_tonghopScalarFieldEnum]


  export const Ext_sanpham_dictionaryScalarFieldEnum: {
    id: 'id',
    tenGoc: 'tenGoc',
    tenChuan: 'tenChuan',
    maHang: 'maHang',
    nhomHang: 'nhomHang',
    dvtinh: 'dvtinh',
    congtyId: 'congtyId',
    frequency: 'frequency',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type Ext_sanpham_dictionaryScalarFieldEnum = (typeof Ext_sanpham_dictionaryScalarFieldEnum)[keyof typeof Ext_sanpham_dictionaryScalarFieldEnum]


  export const Ext_daily_stock_v2ScalarFieldEnum: {
    id: 'id',
    congtyId: 'congtyId',
    date: 'date',
    tenHangChuan: 'tenHangChuan',
    maHang: 'maHang',
    dvtinh: 'dvtinh',
    tonDauQty: 'tonDauQty',
    tonDauVal: 'tonDauVal',
    nhapQty: 'nhapQty',
    nhapVal: 'nhapVal',
    xuatQty: 'xuatQty',
    xuatVal: 'xuatVal',
    tonCuoiQty: 'tonCuoiQty',
    tonCuoiVal: 'tonCuoiVal',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type Ext_daily_stock_v2ScalarFieldEnum = (typeof Ext_daily_stock_v2ScalarFieldEnum)[keyof typeof Ext_daily_stock_v2ScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


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
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Decimal[]'
   */
  export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


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


  export type ext_congtyWhereInput = {
    AND?: ext_congtyWhereInput | ext_congtyWhereInput[]
    OR?: ext_congtyWhereInput[]
    NOT?: ext_congtyWhereInput | ext_congtyWhereInput[]
    id?: StringFilter<"ext_congty"> | string
    mst?: StringFilter<"ext_congty"> | string
    ten?: StringFilter<"ext_congty"> | string
    tenVietTat?: StringNullableFilter<"ext_congty"> | string | null
    diaChi?: StringNullableFilter<"ext_congty"> | string | null
    dienThoai?: StringNullableFilter<"ext_congty"> | string | null
    email?: StringNullableFilter<"ext_congty"> | string | null
    nguoiDaiDien?: StringNullableFilter<"ext_congty"> | string | null
    isActive?: BoolFilter<"ext_congty"> | boolean
    isDefault?: BoolFilter<"ext_congty"> | boolean
    createdAt?: DateTimeFilter<"ext_congty"> | Date | string
    updatedAt?: DateTimeFilter<"ext_congty"> | Date | string
    apiConfigs?: Ext_apiconfigListRelationFilter
    hoadons?: Ext_listhoadonListRelationFilter
    synclogs?: Ext_synclogListRelationFilter
  }

  export type ext_congtyOrderByWithRelationInput = {
    id?: SortOrder
    mst?: SortOrder
    ten?: SortOrder
    tenVietTat?: SortOrderInput | SortOrder
    diaChi?: SortOrderInput | SortOrder
    dienThoai?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    nguoiDaiDien?: SortOrderInput | SortOrder
    isActive?: SortOrder
    isDefault?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    apiConfigs?: ext_apiconfigOrderByRelationAggregateInput
    hoadons?: ext_listhoadonOrderByRelationAggregateInput
    synclogs?: ext_synclogOrderByRelationAggregateInput
  }

  export type ext_congtyWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    mst?: string
    AND?: ext_congtyWhereInput | ext_congtyWhereInput[]
    OR?: ext_congtyWhereInput[]
    NOT?: ext_congtyWhereInput | ext_congtyWhereInput[]
    ten?: StringFilter<"ext_congty"> | string
    tenVietTat?: StringNullableFilter<"ext_congty"> | string | null
    diaChi?: StringNullableFilter<"ext_congty"> | string | null
    dienThoai?: StringNullableFilter<"ext_congty"> | string | null
    email?: StringNullableFilter<"ext_congty"> | string | null
    nguoiDaiDien?: StringNullableFilter<"ext_congty"> | string | null
    isActive?: BoolFilter<"ext_congty"> | boolean
    isDefault?: BoolFilter<"ext_congty"> | boolean
    createdAt?: DateTimeFilter<"ext_congty"> | Date | string
    updatedAt?: DateTimeFilter<"ext_congty"> | Date | string
    apiConfigs?: Ext_apiconfigListRelationFilter
    hoadons?: Ext_listhoadonListRelationFilter
    synclogs?: Ext_synclogListRelationFilter
  }, "id" | "mst">

  export type ext_congtyOrderByWithAggregationInput = {
    id?: SortOrder
    mst?: SortOrder
    ten?: SortOrder
    tenVietTat?: SortOrderInput | SortOrder
    diaChi?: SortOrderInput | SortOrder
    dienThoai?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    nguoiDaiDien?: SortOrderInput | SortOrder
    isActive?: SortOrder
    isDefault?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ext_congtyCountOrderByAggregateInput
    _max?: ext_congtyMaxOrderByAggregateInput
    _min?: ext_congtyMinOrderByAggregateInput
  }

  export type ext_congtyScalarWhereWithAggregatesInput = {
    AND?: ext_congtyScalarWhereWithAggregatesInput | ext_congtyScalarWhereWithAggregatesInput[]
    OR?: ext_congtyScalarWhereWithAggregatesInput[]
    NOT?: ext_congtyScalarWhereWithAggregatesInput | ext_congtyScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ext_congty"> | string
    mst?: StringWithAggregatesFilter<"ext_congty"> | string
    ten?: StringWithAggregatesFilter<"ext_congty"> | string
    tenVietTat?: StringNullableWithAggregatesFilter<"ext_congty"> | string | null
    diaChi?: StringNullableWithAggregatesFilter<"ext_congty"> | string | null
    dienThoai?: StringNullableWithAggregatesFilter<"ext_congty"> | string | null
    email?: StringNullableWithAggregatesFilter<"ext_congty"> | string | null
    nguoiDaiDien?: StringNullableWithAggregatesFilter<"ext_congty"> | string | null
    isActive?: BoolWithAggregatesFilter<"ext_congty"> | boolean
    isDefault?: BoolWithAggregatesFilter<"ext_congty"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"ext_congty"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ext_congty"> | Date | string
  }

  export type ext_listhoadonWhereInput = {
    AND?: ext_listhoadonWhereInput | ext_listhoadonWhereInput[]
    OR?: ext_listhoadonWhereInput[]
    NOT?: ext_listhoadonWhereInput | ext_listhoadonWhereInput[]
    id?: StringFilter<"ext_listhoadon"> | string
    idServer?: StringFilter<"ext_listhoadon"> | string
    brandname?: StringNullableFilter<"ext_listhoadon"> | string | null
    congtyId?: StringNullableFilter<"ext_listhoadon"> | string | null
    nbmst?: StringFilter<"ext_listhoadon"> | string
    nbten?: StringNullableFilter<"ext_listhoadon"> | string | null
    nbdchi?: StringNullableFilter<"ext_listhoadon"> | string | null
    nmmst?: StringNullableFilter<"ext_listhoadon"> | string | null
    nmten?: StringNullableFilter<"ext_listhoadon"> | string | null
    nmdchi?: StringNullableFilter<"ext_listhoadon"> | string | null
    khmshdon?: StringFilter<"ext_listhoadon"> | string
    khhdon?: StringFilter<"ext_listhoadon"> | string
    shdon?: StringFilter<"ext_listhoadon"> | string
    mhso?: StringNullableFilter<"ext_listhoadon"> | string | null
    tgtcthue?: DecimalFilter<"ext_listhoadon"> | Decimal | DecimalJsLike | number | string
    tgtthue?: DecimalFilter<"ext_listhoadon"> | Decimal | DecimalJsLike | number | string
    tgtttbso?: DecimalFilter<"ext_listhoadon"> | Decimal | DecimalJsLike | number | string
    tdlap?: DateTimeFilter<"ext_listhoadon"> | Date | string
    tthai?: StringNullableFilter<"ext_listhoadon"> | string | null
    loaihd?: StringFilter<"ext_listhoadon"> | string
    createdAt?: DateTimeFilter<"ext_listhoadon"> | Date | string
    updatedAt?: DateTimeFilter<"ext_listhoadon"> | Date | string
    congty?: XOR<Ext_congtyNullableScalarRelationFilter, ext_congtyWhereInput> | null
    details?: Ext_detailhoadonListRelationFilter
  }

  export type ext_listhoadonOrderByWithRelationInput = {
    id?: SortOrder
    idServer?: SortOrder
    brandname?: SortOrderInput | SortOrder
    congtyId?: SortOrderInput | SortOrder
    nbmst?: SortOrder
    nbten?: SortOrderInput | SortOrder
    nbdchi?: SortOrderInput | SortOrder
    nmmst?: SortOrderInput | SortOrder
    nmten?: SortOrderInput | SortOrder
    nmdchi?: SortOrderInput | SortOrder
    khmshdon?: SortOrder
    khhdon?: SortOrder
    shdon?: SortOrder
    mhso?: SortOrderInput | SortOrder
    tgtcthue?: SortOrder
    tgtthue?: SortOrder
    tgtttbso?: SortOrder
    tdlap?: SortOrder
    tthai?: SortOrderInput | SortOrder
    loaihd?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    congty?: ext_congtyOrderByWithRelationInput
    details?: ext_detailhoadonOrderByRelationAggregateInput
  }

  export type ext_listhoadonWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    idServer?: string
    AND?: ext_listhoadonWhereInput | ext_listhoadonWhereInput[]
    OR?: ext_listhoadonWhereInput[]
    NOT?: ext_listhoadonWhereInput | ext_listhoadonWhereInput[]
    brandname?: StringNullableFilter<"ext_listhoadon"> | string | null
    congtyId?: StringNullableFilter<"ext_listhoadon"> | string | null
    nbmst?: StringFilter<"ext_listhoadon"> | string
    nbten?: StringNullableFilter<"ext_listhoadon"> | string | null
    nbdchi?: StringNullableFilter<"ext_listhoadon"> | string | null
    nmmst?: StringNullableFilter<"ext_listhoadon"> | string | null
    nmten?: StringNullableFilter<"ext_listhoadon"> | string | null
    nmdchi?: StringNullableFilter<"ext_listhoadon"> | string | null
    khmshdon?: StringFilter<"ext_listhoadon"> | string
    khhdon?: StringFilter<"ext_listhoadon"> | string
    shdon?: StringFilter<"ext_listhoadon"> | string
    mhso?: StringNullableFilter<"ext_listhoadon"> | string | null
    tgtcthue?: DecimalFilter<"ext_listhoadon"> | Decimal | DecimalJsLike | number | string
    tgtthue?: DecimalFilter<"ext_listhoadon"> | Decimal | DecimalJsLike | number | string
    tgtttbso?: DecimalFilter<"ext_listhoadon"> | Decimal | DecimalJsLike | number | string
    tdlap?: DateTimeFilter<"ext_listhoadon"> | Date | string
    tthai?: StringNullableFilter<"ext_listhoadon"> | string | null
    loaihd?: StringFilter<"ext_listhoadon"> | string
    createdAt?: DateTimeFilter<"ext_listhoadon"> | Date | string
    updatedAt?: DateTimeFilter<"ext_listhoadon"> | Date | string
    congty?: XOR<Ext_congtyNullableScalarRelationFilter, ext_congtyWhereInput> | null
    details?: Ext_detailhoadonListRelationFilter
  }, "id" | "idServer">

  export type ext_listhoadonOrderByWithAggregationInput = {
    id?: SortOrder
    idServer?: SortOrder
    brandname?: SortOrderInput | SortOrder
    congtyId?: SortOrderInput | SortOrder
    nbmst?: SortOrder
    nbten?: SortOrderInput | SortOrder
    nbdchi?: SortOrderInput | SortOrder
    nmmst?: SortOrderInput | SortOrder
    nmten?: SortOrderInput | SortOrder
    nmdchi?: SortOrderInput | SortOrder
    khmshdon?: SortOrder
    khhdon?: SortOrder
    shdon?: SortOrder
    mhso?: SortOrderInput | SortOrder
    tgtcthue?: SortOrder
    tgtthue?: SortOrder
    tgtttbso?: SortOrder
    tdlap?: SortOrder
    tthai?: SortOrderInput | SortOrder
    loaihd?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ext_listhoadonCountOrderByAggregateInput
    _avg?: ext_listhoadonAvgOrderByAggregateInput
    _max?: ext_listhoadonMaxOrderByAggregateInput
    _min?: ext_listhoadonMinOrderByAggregateInput
    _sum?: ext_listhoadonSumOrderByAggregateInput
  }

  export type ext_listhoadonScalarWhereWithAggregatesInput = {
    AND?: ext_listhoadonScalarWhereWithAggregatesInput | ext_listhoadonScalarWhereWithAggregatesInput[]
    OR?: ext_listhoadonScalarWhereWithAggregatesInput[]
    NOT?: ext_listhoadonScalarWhereWithAggregatesInput | ext_listhoadonScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ext_listhoadon"> | string
    idServer?: StringWithAggregatesFilter<"ext_listhoadon"> | string
    brandname?: StringNullableWithAggregatesFilter<"ext_listhoadon"> | string | null
    congtyId?: StringNullableWithAggregatesFilter<"ext_listhoadon"> | string | null
    nbmst?: StringWithAggregatesFilter<"ext_listhoadon"> | string
    nbten?: StringNullableWithAggregatesFilter<"ext_listhoadon"> | string | null
    nbdchi?: StringNullableWithAggregatesFilter<"ext_listhoadon"> | string | null
    nmmst?: StringNullableWithAggregatesFilter<"ext_listhoadon"> | string | null
    nmten?: StringNullableWithAggregatesFilter<"ext_listhoadon"> | string | null
    nmdchi?: StringNullableWithAggregatesFilter<"ext_listhoadon"> | string | null
    khmshdon?: StringWithAggregatesFilter<"ext_listhoadon"> | string
    khhdon?: StringWithAggregatesFilter<"ext_listhoadon"> | string
    shdon?: StringWithAggregatesFilter<"ext_listhoadon"> | string
    mhso?: StringNullableWithAggregatesFilter<"ext_listhoadon"> | string | null
    tgtcthue?: DecimalWithAggregatesFilter<"ext_listhoadon"> | Decimal | DecimalJsLike | number | string
    tgtthue?: DecimalWithAggregatesFilter<"ext_listhoadon"> | Decimal | DecimalJsLike | number | string
    tgtttbso?: DecimalWithAggregatesFilter<"ext_listhoadon"> | Decimal | DecimalJsLike | number | string
    tdlap?: DateTimeWithAggregatesFilter<"ext_listhoadon"> | Date | string
    tthai?: StringNullableWithAggregatesFilter<"ext_listhoadon"> | string | null
    loaihd?: StringWithAggregatesFilter<"ext_listhoadon"> | string
    createdAt?: DateTimeWithAggregatesFilter<"ext_listhoadon"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ext_listhoadon"> | Date | string
  }

  export type ext_detailhoadonWhereInput = {
    AND?: ext_detailhoadonWhereInput | ext_detailhoadonWhereInput[]
    OR?: ext_detailhoadonWhereInput[]
    NOT?: ext_detailhoadonWhereInput | ext_detailhoadonWhereInput[]
    id?: StringFilter<"ext_detailhoadon"> | string
    idServer?: StringFilter<"ext_detailhoadon"> | string
    idhdonServer?: StringFilter<"ext_detailhoadon"> | string
    stt?: IntFilter<"ext_detailhoadon"> | number
    ten?: StringFilter<"ext_detailhoadon"> | string
    dvtinh?: StringNullableFilter<"ext_detailhoadon"> | string | null
    sluong?: DecimalFilter<"ext_detailhoadon"> | Decimal | DecimalJsLike | number | string
    dgia?: DecimalFilter<"ext_detailhoadon"> | Decimal | DecimalJsLike | number | string
    thtien?: DecimalFilter<"ext_detailhoadon"> | Decimal | DecimalJsLike | number | string
    tsuat?: DecimalFilter<"ext_detailhoadon"> | Decimal | DecimalJsLike | number | string
    tthue?: DecimalFilter<"ext_detailhoadon"> | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFilter<"ext_detailhoadon"> | Date | string
    updatedAt?: DateTimeFilter<"ext_detailhoadon"> | Date | string
    invoice?: XOR<Ext_listhoadonScalarRelationFilter, ext_listhoadonWhereInput>
    products?: Ext_sanphamhoadonListRelationFilter
  }

  export type ext_detailhoadonOrderByWithRelationInput = {
    id?: SortOrder
    idServer?: SortOrder
    idhdonServer?: SortOrder
    stt?: SortOrder
    ten?: SortOrder
    dvtinh?: SortOrderInput | SortOrder
    sluong?: SortOrder
    dgia?: SortOrder
    thtien?: SortOrder
    tsuat?: SortOrder
    tthue?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    invoice?: ext_listhoadonOrderByWithRelationInput
    products?: ext_sanphamhoadonOrderByRelationAggregateInput
  }

  export type ext_detailhoadonWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    idServer?: string
    AND?: ext_detailhoadonWhereInput | ext_detailhoadonWhereInput[]
    OR?: ext_detailhoadonWhereInput[]
    NOT?: ext_detailhoadonWhereInput | ext_detailhoadonWhereInput[]
    idhdonServer?: StringFilter<"ext_detailhoadon"> | string
    stt?: IntFilter<"ext_detailhoadon"> | number
    ten?: StringFilter<"ext_detailhoadon"> | string
    dvtinh?: StringNullableFilter<"ext_detailhoadon"> | string | null
    sluong?: DecimalFilter<"ext_detailhoadon"> | Decimal | DecimalJsLike | number | string
    dgia?: DecimalFilter<"ext_detailhoadon"> | Decimal | DecimalJsLike | number | string
    thtien?: DecimalFilter<"ext_detailhoadon"> | Decimal | DecimalJsLike | number | string
    tsuat?: DecimalFilter<"ext_detailhoadon"> | Decimal | DecimalJsLike | number | string
    tthue?: DecimalFilter<"ext_detailhoadon"> | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFilter<"ext_detailhoadon"> | Date | string
    updatedAt?: DateTimeFilter<"ext_detailhoadon"> | Date | string
    invoice?: XOR<Ext_listhoadonScalarRelationFilter, ext_listhoadonWhereInput>
    products?: Ext_sanphamhoadonListRelationFilter
  }, "id" | "idServer">

  export type ext_detailhoadonOrderByWithAggregationInput = {
    id?: SortOrder
    idServer?: SortOrder
    idhdonServer?: SortOrder
    stt?: SortOrder
    ten?: SortOrder
    dvtinh?: SortOrderInput | SortOrder
    sluong?: SortOrder
    dgia?: SortOrder
    thtien?: SortOrder
    tsuat?: SortOrder
    tthue?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ext_detailhoadonCountOrderByAggregateInput
    _avg?: ext_detailhoadonAvgOrderByAggregateInput
    _max?: ext_detailhoadonMaxOrderByAggregateInput
    _min?: ext_detailhoadonMinOrderByAggregateInput
    _sum?: ext_detailhoadonSumOrderByAggregateInput
  }

  export type ext_detailhoadonScalarWhereWithAggregatesInput = {
    AND?: ext_detailhoadonScalarWhereWithAggregatesInput | ext_detailhoadonScalarWhereWithAggregatesInput[]
    OR?: ext_detailhoadonScalarWhereWithAggregatesInput[]
    NOT?: ext_detailhoadonScalarWhereWithAggregatesInput | ext_detailhoadonScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ext_detailhoadon"> | string
    idServer?: StringWithAggregatesFilter<"ext_detailhoadon"> | string
    idhdonServer?: StringWithAggregatesFilter<"ext_detailhoadon"> | string
    stt?: IntWithAggregatesFilter<"ext_detailhoadon"> | number
    ten?: StringWithAggregatesFilter<"ext_detailhoadon"> | string
    dvtinh?: StringNullableWithAggregatesFilter<"ext_detailhoadon"> | string | null
    sluong?: DecimalWithAggregatesFilter<"ext_detailhoadon"> | Decimal | DecimalJsLike | number | string
    dgia?: DecimalWithAggregatesFilter<"ext_detailhoadon"> | Decimal | DecimalJsLike | number | string
    thtien?: DecimalWithAggregatesFilter<"ext_detailhoadon"> | Decimal | DecimalJsLike | number | string
    tsuat?: DecimalWithAggregatesFilter<"ext_detailhoadon"> | Decimal | DecimalJsLike | number | string
    tthue?: DecimalWithAggregatesFilter<"ext_detailhoadon"> | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeWithAggregatesFilter<"ext_detailhoadon"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ext_detailhoadon"> | Date | string
  }

  export type ext_sanphamhoadonWhereInput = {
    AND?: ext_sanphamhoadonWhereInput | ext_sanphamhoadonWhereInput[]
    OR?: ext_sanphamhoadonWhereInput[]
    NOT?: ext_sanphamhoadonWhereInput | ext_sanphamhoadonWhereInput[]
    id?: StringFilter<"ext_sanphamhoadon"> | string
    iddetailhoadon?: StringFilter<"ext_sanphamhoadon"> | string
    ten?: StringFilter<"ext_sanphamhoadon"> | string
    ten2?: StringNullableFilter<"ext_sanphamhoadon"> | string | null
    ma?: StringNullableFilter<"ext_sanphamhoadon"> | string | null
    dvt?: StringNullableFilter<"ext_sanphamhoadon"> | string | null
    dgia?: DecimalFilter<"ext_sanphamhoadon"> | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFilter<"ext_sanphamhoadon"> | Date | string
    updatedAt?: DateTimeFilter<"ext_sanphamhoadon"> | Date | string
    detail?: XOR<Ext_detailhoadonScalarRelationFilter, ext_detailhoadonWhereInput>
  }

  export type ext_sanphamhoadonOrderByWithRelationInput = {
    id?: SortOrder
    iddetailhoadon?: SortOrder
    ten?: SortOrder
    ten2?: SortOrderInput | SortOrder
    ma?: SortOrderInput | SortOrder
    dvt?: SortOrderInput | SortOrder
    dgia?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    detail?: ext_detailhoadonOrderByWithRelationInput
  }

  export type ext_sanphamhoadonWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ext_sanphamhoadonWhereInput | ext_sanphamhoadonWhereInput[]
    OR?: ext_sanphamhoadonWhereInput[]
    NOT?: ext_sanphamhoadonWhereInput | ext_sanphamhoadonWhereInput[]
    iddetailhoadon?: StringFilter<"ext_sanphamhoadon"> | string
    ten?: StringFilter<"ext_sanphamhoadon"> | string
    ten2?: StringNullableFilter<"ext_sanphamhoadon"> | string | null
    ma?: StringNullableFilter<"ext_sanphamhoadon"> | string | null
    dvt?: StringNullableFilter<"ext_sanphamhoadon"> | string | null
    dgia?: DecimalFilter<"ext_sanphamhoadon"> | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFilter<"ext_sanphamhoadon"> | Date | string
    updatedAt?: DateTimeFilter<"ext_sanphamhoadon"> | Date | string
    detail?: XOR<Ext_detailhoadonScalarRelationFilter, ext_detailhoadonWhereInput>
  }, "id">

  export type ext_sanphamhoadonOrderByWithAggregationInput = {
    id?: SortOrder
    iddetailhoadon?: SortOrder
    ten?: SortOrder
    ten2?: SortOrderInput | SortOrder
    ma?: SortOrderInput | SortOrder
    dvt?: SortOrderInput | SortOrder
    dgia?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ext_sanphamhoadonCountOrderByAggregateInput
    _avg?: ext_sanphamhoadonAvgOrderByAggregateInput
    _max?: ext_sanphamhoadonMaxOrderByAggregateInput
    _min?: ext_sanphamhoadonMinOrderByAggregateInput
    _sum?: ext_sanphamhoadonSumOrderByAggregateInput
  }

  export type ext_sanphamhoadonScalarWhereWithAggregatesInput = {
    AND?: ext_sanphamhoadonScalarWhereWithAggregatesInput | ext_sanphamhoadonScalarWhereWithAggregatesInput[]
    OR?: ext_sanphamhoadonScalarWhereWithAggregatesInput[]
    NOT?: ext_sanphamhoadonScalarWhereWithAggregatesInput | ext_sanphamhoadonScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ext_sanphamhoadon"> | string
    iddetailhoadon?: StringWithAggregatesFilter<"ext_sanphamhoadon"> | string
    ten?: StringWithAggregatesFilter<"ext_sanphamhoadon"> | string
    ten2?: StringNullableWithAggregatesFilter<"ext_sanphamhoadon"> | string | null
    ma?: StringNullableWithAggregatesFilter<"ext_sanphamhoadon"> | string | null
    dvt?: StringNullableWithAggregatesFilter<"ext_sanphamhoadon"> | string | null
    dgia?: DecimalWithAggregatesFilter<"ext_sanphamhoadon"> | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeWithAggregatesFilter<"ext_sanphamhoadon"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ext_sanphamhoadon"> | Date | string
  }

  export type ext_apiconfigWhereInput = {
    AND?: ext_apiconfigWhereInput | ext_apiconfigWhereInput[]
    OR?: ext_apiconfigWhereInput[]
    NOT?: ext_apiconfigWhereInput | ext_apiconfigWhereInput[]
    id?: StringFilter<"ext_apiconfig"> | string
    name?: StringFilter<"ext_apiconfig"> | string
    congtyId?: StringFilter<"ext_apiconfig"> | string
    bearerToken?: StringFilter<"ext_apiconfig"> | string
    baseUrl?: StringFilter<"ext_apiconfig"> | string
    brandname?: StringNullableFilter<"ext_apiconfig"> | string | null
    batchSize?: IntFilter<"ext_apiconfig"> | number
    delayBetweenBatches?: IntFilter<"ext_apiconfig"> | number
    delayBetweenDetailCalls?: IntFilter<"ext_apiconfig"> | number
    maxRetries?: IntFilter<"ext_apiconfig"> | number
    lastSyncAt?: DateTimeNullableFilter<"ext_apiconfig"> | Date | string | null
    lastSyncStatus?: StringNullableFilter<"ext_apiconfig"> | string | null
    isActive?: BoolFilter<"ext_apiconfig"> | boolean
    createdAt?: DateTimeFilter<"ext_apiconfig"> | Date | string
    updatedAt?: DateTimeFilter<"ext_apiconfig"> | Date | string
    congty?: XOR<Ext_congtyScalarRelationFilter, ext_congtyWhereInput>
    synclogs?: Ext_synclogListRelationFilter
  }

  export type ext_apiconfigOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    congtyId?: SortOrder
    bearerToken?: SortOrder
    baseUrl?: SortOrder
    brandname?: SortOrderInput | SortOrder
    batchSize?: SortOrder
    delayBetweenBatches?: SortOrder
    delayBetweenDetailCalls?: SortOrder
    maxRetries?: SortOrder
    lastSyncAt?: SortOrderInput | SortOrder
    lastSyncStatus?: SortOrderInput | SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    congty?: ext_congtyOrderByWithRelationInput
    synclogs?: ext_synclogOrderByRelationAggregateInput
  }

  export type ext_apiconfigWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    congtyId_name?: ext_apiconfigCongtyIdNameCompoundUniqueInput
    AND?: ext_apiconfigWhereInput | ext_apiconfigWhereInput[]
    OR?: ext_apiconfigWhereInput[]
    NOT?: ext_apiconfigWhereInput | ext_apiconfigWhereInput[]
    name?: StringFilter<"ext_apiconfig"> | string
    congtyId?: StringFilter<"ext_apiconfig"> | string
    bearerToken?: StringFilter<"ext_apiconfig"> | string
    baseUrl?: StringFilter<"ext_apiconfig"> | string
    brandname?: StringNullableFilter<"ext_apiconfig"> | string | null
    batchSize?: IntFilter<"ext_apiconfig"> | number
    delayBetweenBatches?: IntFilter<"ext_apiconfig"> | number
    delayBetweenDetailCalls?: IntFilter<"ext_apiconfig"> | number
    maxRetries?: IntFilter<"ext_apiconfig"> | number
    lastSyncAt?: DateTimeNullableFilter<"ext_apiconfig"> | Date | string | null
    lastSyncStatus?: StringNullableFilter<"ext_apiconfig"> | string | null
    isActive?: BoolFilter<"ext_apiconfig"> | boolean
    createdAt?: DateTimeFilter<"ext_apiconfig"> | Date | string
    updatedAt?: DateTimeFilter<"ext_apiconfig"> | Date | string
    congty?: XOR<Ext_congtyScalarRelationFilter, ext_congtyWhereInput>
    synclogs?: Ext_synclogListRelationFilter
  }, "id" | "congtyId_name">

  export type ext_apiconfigOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    congtyId?: SortOrder
    bearerToken?: SortOrder
    baseUrl?: SortOrder
    brandname?: SortOrderInput | SortOrder
    batchSize?: SortOrder
    delayBetweenBatches?: SortOrder
    delayBetweenDetailCalls?: SortOrder
    maxRetries?: SortOrder
    lastSyncAt?: SortOrderInput | SortOrder
    lastSyncStatus?: SortOrderInput | SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ext_apiconfigCountOrderByAggregateInput
    _avg?: ext_apiconfigAvgOrderByAggregateInput
    _max?: ext_apiconfigMaxOrderByAggregateInput
    _min?: ext_apiconfigMinOrderByAggregateInput
    _sum?: ext_apiconfigSumOrderByAggregateInput
  }

  export type ext_apiconfigScalarWhereWithAggregatesInput = {
    AND?: ext_apiconfigScalarWhereWithAggregatesInput | ext_apiconfigScalarWhereWithAggregatesInput[]
    OR?: ext_apiconfigScalarWhereWithAggregatesInput[]
    NOT?: ext_apiconfigScalarWhereWithAggregatesInput | ext_apiconfigScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ext_apiconfig"> | string
    name?: StringWithAggregatesFilter<"ext_apiconfig"> | string
    congtyId?: StringWithAggregatesFilter<"ext_apiconfig"> | string
    bearerToken?: StringWithAggregatesFilter<"ext_apiconfig"> | string
    baseUrl?: StringWithAggregatesFilter<"ext_apiconfig"> | string
    brandname?: StringNullableWithAggregatesFilter<"ext_apiconfig"> | string | null
    batchSize?: IntWithAggregatesFilter<"ext_apiconfig"> | number
    delayBetweenBatches?: IntWithAggregatesFilter<"ext_apiconfig"> | number
    delayBetweenDetailCalls?: IntWithAggregatesFilter<"ext_apiconfig"> | number
    maxRetries?: IntWithAggregatesFilter<"ext_apiconfig"> | number
    lastSyncAt?: DateTimeNullableWithAggregatesFilter<"ext_apiconfig"> | Date | string | null
    lastSyncStatus?: StringNullableWithAggregatesFilter<"ext_apiconfig"> | string | null
    isActive?: BoolWithAggregatesFilter<"ext_apiconfig"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"ext_apiconfig"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ext_apiconfig"> | Date | string
  }

  export type ext_synclogWhereInput = {
    AND?: ext_synclogWhereInput | ext_synclogWhereInput[]
    OR?: ext_synclogWhereInput[]
    NOT?: ext_synclogWhereInput | ext_synclogWhereInput[]
    id?: StringFilter<"ext_synclog"> | string
    congtyId?: StringNullableFilter<"ext_synclog"> | string | null
    configId?: StringNullableFilter<"ext_synclog"> | string | null
    syncType?: StringFilter<"ext_synclog"> | string
    fromDate?: DateTimeNullableFilter<"ext_synclog"> | Date | string | null
    toDate?: DateTimeNullableFilter<"ext_synclog"> | Date | string | null
    totalRecords?: IntFilter<"ext_synclog"> | number
    successCount?: IntFilter<"ext_synclog"> | number
    errorCount?: IntFilter<"ext_synclog"> | number
    status?: StringFilter<"ext_synclog"> | string
    errorMessage?: StringNullableFilter<"ext_synclog"> | string | null
    startedAt?: DateTimeFilter<"ext_synclog"> | Date | string
    completedAt?: DateTimeNullableFilter<"ext_synclog"> | Date | string | null
    createdAt?: DateTimeFilter<"ext_synclog"> | Date | string
    congty?: XOR<Ext_congtyNullableScalarRelationFilter, ext_congtyWhereInput> | null
    config?: XOR<Ext_apiconfigNullableScalarRelationFilter, ext_apiconfigWhereInput> | null
  }

  export type ext_synclogOrderByWithRelationInput = {
    id?: SortOrder
    congtyId?: SortOrderInput | SortOrder
    configId?: SortOrderInput | SortOrder
    syncType?: SortOrder
    fromDate?: SortOrderInput | SortOrder
    toDate?: SortOrderInput | SortOrder
    totalRecords?: SortOrder
    successCount?: SortOrder
    errorCount?: SortOrder
    status?: SortOrder
    errorMessage?: SortOrderInput | SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    congty?: ext_congtyOrderByWithRelationInput
    config?: ext_apiconfigOrderByWithRelationInput
  }

  export type ext_synclogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ext_synclogWhereInput | ext_synclogWhereInput[]
    OR?: ext_synclogWhereInput[]
    NOT?: ext_synclogWhereInput | ext_synclogWhereInput[]
    congtyId?: StringNullableFilter<"ext_synclog"> | string | null
    configId?: StringNullableFilter<"ext_synclog"> | string | null
    syncType?: StringFilter<"ext_synclog"> | string
    fromDate?: DateTimeNullableFilter<"ext_synclog"> | Date | string | null
    toDate?: DateTimeNullableFilter<"ext_synclog"> | Date | string | null
    totalRecords?: IntFilter<"ext_synclog"> | number
    successCount?: IntFilter<"ext_synclog"> | number
    errorCount?: IntFilter<"ext_synclog"> | number
    status?: StringFilter<"ext_synclog"> | string
    errorMessage?: StringNullableFilter<"ext_synclog"> | string | null
    startedAt?: DateTimeFilter<"ext_synclog"> | Date | string
    completedAt?: DateTimeNullableFilter<"ext_synclog"> | Date | string | null
    createdAt?: DateTimeFilter<"ext_synclog"> | Date | string
    congty?: XOR<Ext_congtyNullableScalarRelationFilter, ext_congtyWhereInput> | null
    config?: XOR<Ext_apiconfigNullableScalarRelationFilter, ext_apiconfigWhereInput> | null
  }, "id">

  export type ext_synclogOrderByWithAggregationInput = {
    id?: SortOrder
    congtyId?: SortOrderInput | SortOrder
    configId?: SortOrderInput | SortOrder
    syncType?: SortOrder
    fromDate?: SortOrderInput | SortOrder
    toDate?: SortOrderInput | SortOrder
    totalRecords?: SortOrder
    successCount?: SortOrder
    errorCount?: SortOrder
    status?: SortOrder
    errorMessage?: SortOrderInput | SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: ext_synclogCountOrderByAggregateInput
    _avg?: ext_synclogAvgOrderByAggregateInput
    _max?: ext_synclogMaxOrderByAggregateInput
    _min?: ext_synclogMinOrderByAggregateInput
    _sum?: ext_synclogSumOrderByAggregateInput
  }

  export type ext_synclogScalarWhereWithAggregatesInput = {
    AND?: ext_synclogScalarWhereWithAggregatesInput | ext_synclogScalarWhereWithAggregatesInput[]
    OR?: ext_synclogScalarWhereWithAggregatesInput[]
    NOT?: ext_synclogScalarWhereWithAggregatesInput | ext_synclogScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ext_synclog"> | string
    congtyId?: StringNullableWithAggregatesFilter<"ext_synclog"> | string | null
    configId?: StringNullableWithAggregatesFilter<"ext_synclog"> | string | null
    syncType?: StringWithAggregatesFilter<"ext_synclog"> | string
    fromDate?: DateTimeNullableWithAggregatesFilter<"ext_synclog"> | Date | string | null
    toDate?: DateTimeNullableWithAggregatesFilter<"ext_synclog"> | Date | string | null
    totalRecords?: IntWithAggregatesFilter<"ext_synclog"> | number
    successCount?: IntWithAggregatesFilter<"ext_synclog"> | number
    errorCount?: IntWithAggregatesFilter<"ext_synclog"> | number
    status?: StringWithAggregatesFilter<"ext_synclog"> | string
    errorMessage?: StringNullableWithAggregatesFilter<"ext_synclog"> | string | null
    startedAt?: DateTimeWithAggregatesFilter<"ext_synclog"> | Date | string
    completedAt?: DateTimeNullableWithAggregatesFilter<"ext_synclog"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"ext_synclog"> | Date | string
  }

  export type ext_tonghopWhereInput = {
    AND?: ext_tonghopWhereInput | ext_tonghopWhereInput[]
    OR?: ext_tonghopWhereInput[]
    NOT?: ext_tonghopWhereInput | ext_tonghopWhereInput[]
    id?: StringFilter<"ext_tonghop"> | string
    idDetailServer?: StringFilter<"ext_tonghop"> | string
    idHoadonServer?: StringFilter<"ext_tonghop"> | string
    congtyId?: StringNullableFilter<"ext_tonghop"> | string | null
    congtyMst?: StringNullableFilter<"ext_tonghop"> | string | null
    congtyTen?: StringNullableFilter<"ext_tonghop"> | string | null
    khmshdon?: StringFilter<"ext_tonghop"> | string
    khhdon?: StringFilter<"ext_tonghop"> | string
    shdon?: StringFilter<"ext_tonghop"> | string
    mhso?: StringNullableFilter<"ext_tonghop"> | string | null
    tdlap?: DateTimeFilter<"ext_tonghop"> | Date | string
    tthai?: StringNullableFilter<"ext_tonghop"> | string | null
    loaihd?: StringFilter<"ext_tonghop"> | string
    nbmst?: StringFilter<"ext_tonghop"> | string
    nbten?: StringNullableFilter<"ext_tonghop"> | string | null
    nbdchi?: StringNullableFilter<"ext_tonghop"> | string | null
    nmmst?: StringNullableFilter<"ext_tonghop"> | string | null
    nmten?: StringNullableFilter<"ext_tonghop"> | string | null
    nmdchi?: StringNullableFilter<"ext_tonghop"> | string | null
    stt?: IntFilter<"ext_tonghop"> | number
    tenHang?: StringFilter<"ext_tonghop"> | string
    tenHangChuan?: StringNullableFilter<"ext_tonghop"> | string | null
    maHang?: StringNullableFilter<"ext_tonghop"> | string | null
    nhomHang?: StringNullableFilter<"ext_tonghop"> | string | null
    dvtinh?: StringNullableFilter<"ext_tonghop"> | string | null
    sluong?: DecimalFilter<"ext_tonghop"> | Decimal | DecimalJsLike | number | string
    dgia?: DecimalFilter<"ext_tonghop"> | Decimal | DecimalJsLike | number | string
    thtien?: DecimalFilter<"ext_tonghop"> | Decimal | DecimalJsLike | number | string
    tsuat?: DecimalFilter<"ext_tonghop"> | Decimal | DecimalJsLike | number | string
    tthue?: DecimalFilter<"ext_tonghop"> | Decimal | DecimalJsLike | number | string
    tongTien?: DecimalFilter<"ext_tonghop"> | Decimal | DecimalJsLike | number | string
    soLuongNhap?: DecimalFilter<"ext_tonghop"> | Decimal | DecimalJsLike | number | string
    soLuongXuat?: DecimalFilter<"ext_tonghop"> | Decimal | DecimalJsLike | number | string
    giaTriNhap?: DecimalFilter<"ext_tonghop"> | Decimal | DecimalJsLike | number | string
    giaTriXuat?: DecimalFilter<"ext_tonghop"> | Decimal | DecimalJsLike | number | string
    searchText?: StringNullableFilter<"ext_tonghop"> | string | null
    tags?: StringNullableListFilter<"ext_tonghop">
    nam?: IntFilter<"ext_tonghop"> | number
    thang?: IntFilter<"ext_tonghop"> | number
    quy?: IntFilter<"ext_tonghop"> | number
    createdAt?: DateTimeFilter<"ext_tonghop"> | Date | string
    updatedAt?: DateTimeFilter<"ext_tonghop"> | Date | string
    syncedAt?: DateTimeFilter<"ext_tonghop"> | Date | string
  }

  export type ext_tonghopOrderByWithRelationInput = {
    id?: SortOrder
    idDetailServer?: SortOrder
    idHoadonServer?: SortOrder
    congtyId?: SortOrderInput | SortOrder
    congtyMst?: SortOrderInput | SortOrder
    congtyTen?: SortOrderInput | SortOrder
    khmshdon?: SortOrder
    khhdon?: SortOrder
    shdon?: SortOrder
    mhso?: SortOrderInput | SortOrder
    tdlap?: SortOrder
    tthai?: SortOrderInput | SortOrder
    loaihd?: SortOrder
    nbmst?: SortOrder
    nbten?: SortOrderInput | SortOrder
    nbdchi?: SortOrderInput | SortOrder
    nmmst?: SortOrderInput | SortOrder
    nmten?: SortOrderInput | SortOrder
    nmdchi?: SortOrderInput | SortOrder
    stt?: SortOrder
    tenHang?: SortOrder
    tenHangChuan?: SortOrderInput | SortOrder
    maHang?: SortOrderInput | SortOrder
    nhomHang?: SortOrderInput | SortOrder
    dvtinh?: SortOrderInput | SortOrder
    sluong?: SortOrder
    dgia?: SortOrder
    thtien?: SortOrder
    tsuat?: SortOrder
    tthue?: SortOrder
    tongTien?: SortOrder
    soLuongNhap?: SortOrder
    soLuongXuat?: SortOrder
    giaTriNhap?: SortOrder
    giaTriXuat?: SortOrder
    searchText?: SortOrderInput | SortOrder
    tags?: SortOrder
    nam?: SortOrder
    thang?: SortOrder
    quy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    syncedAt?: SortOrder
  }

  export type ext_tonghopWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    idDetailServer?: string
    AND?: ext_tonghopWhereInput | ext_tonghopWhereInput[]
    OR?: ext_tonghopWhereInput[]
    NOT?: ext_tonghopWhereInput | ext_tonghopWhereInput[]
    idHoadonServer?: StringFilter<"ext_tonghop"> | string
    congtyId?: StringNullableFilter<"ext_tonghop"> | string | null
    congtyMst?: StringNullableFilter<"ext_tonghop"> | string | null
    congtyTen?: StringNullableFilter<"ext_tonghop"> | string | null
    khmshdon?: StringFilter<"ext_tonghop"> | string
    khhdon?: StringFilter<"ext_tonghop"> | string
    shdon?: StringFilter<"ext_tonghop"> | string
    mhso?: StringNullableFilter<"ext_tonghop"> | string | null
    tdlap?: DateTimeFilter<"ext_tonghop"> | Date | string
    tthai?: StringNullableFilter<"ext_tonghop"> | string | null
    loaihd?: StringFilter<"ext_tonghop"> | string
    nbmst?: StringFilter<"ext_tonghop"> | string
    nbten?: StringNullableFilter<"ext_tonghop"> | string | null
    nbdchi?: StringNullableFilter<"ext_tonghop"> | string | null
    nmmst?: StringNullableFilter<"ext_tonghop"> | string | null
    nmten?: StringNullableFilter<"ext_tonghop"> | string | null
    nmdchi?: StringNullableFilter<"ext_tonghop"> | string | null
    stt?: IntFilter<"ext_tonghop"> | number
    tenHang?: StringFilter<"ext_tonghop"> | string
    tenHangChuan?: StringNullableFilter<"ext_tonghop"> | string | null
    maHang?: StringNullableFilter<"ext_tonghop"> | string | null
    nhomHang?: StringNullableFilter<"ext_tonghop"> | string | null
    dvtinh?: StringNullableFilter<"ext_tonghop"> | string | null
    sluong?: DecimalFilter<"ext_tonghop"> | Decimal | DecimalJsLike | number | string
    dgia?: DecimalFilter<"ext_tonghop"> | Decimal | DecimalJsLike | number | string
    thtien?: DecimalFilter<"ext_tonghop"> | Decimal | DecimalJsLike | number | string
    tsuat?: DecimalFilter<"ext_tonghop"> | Decimal | DecimalJsLike | number | string
    tthue?: DecimalFilter<"ext_tonghop"> | Decimal | DecimalJsLike | number | string
    tongTien?: DecimalFilter<"ext_tonghop"> | Decimal | DecimalJsLike | number | string
    soLuongNhap?: DecimalFilter<"ext_tonghop"> | Decimal | DecimalJsLike | number | string
    soLuongXuat?: DecimalFilter<"ext_tonghop"> | Decimal | DecimalJsLike | number | string
    giaTriNhap?: DecimalFilter<"ext_tonghop"> | Decimal | DecimalJsLike | number | string
    giaTriXuat?: DecimalFilter<"ext_tonghop"> | Decimal | DecimalJsLike | number | string
    searchText?: StringNullableFilter<"ext_tonghop"> | string | null
    tags?: StringNullableListFilter<"ext_tonghop">
    nam?: IntFilter<"ext_tonghop"> | number
    thang?: IntFilter<"ext_tonghop"> | number
    quy?: IntFilter<"ext_tonghop"> | number
    createdAt?: DateTimeFilter<"ext_tonghop"> | Date | string
    updatedAt?: DateTimeFilter<"ext_tonghop"> | Date | string
    syncedAt?: DateTimeFilter<"ext_tonghop"> | Date | string
  }, "id" | "idDetailServer">

  export type ext_tonghopOrderByWithAggregationInput = {
    id?: SortOrder
    idDetailServer?: SortOrder
    idHoadonServer?: SortOrder
    congtyId?: SortOrderInput | SortOrder
    congtyMst?: SortOrderInput | SortOrder
    congtyTen?: SortOrderInput | SortOrder
    khmshdon?: SortOrder
    khhdon?: SortOrder
    shdon?: SortOrder
    mhso?: SortOrderInput | SortOrder
    tdlap?: SortOrder
    tthai?: SortOrderInput | SortOrder
    loaihd?: SortOrder
    nbmst?: SortOrder
    nbten?: SortOrderInput | SortOrder
    nbdchi?: SortOrderInput | SortOrder
    nmmst?: SortOrderInput | SortOrder
    nmten?: SortOrderInput | SortOrder
    nmdchi?: SortOrderInput | SortOrder
    stt?: SortOrder
    tenHang?: SortOrder
    tenHangChuan?: SortOrderInput | SortOrder
    maHang?: SortOrderInput | SortOrder
    nhomHang?: SortOrderInput | SortOrder
    dvtinh?: SortOrderInput | SortOrder
    sluong?: SortOrder
    dgia?: SortOrder
    thtien?: SortOrder
    tsuat?: SortOrder
    tthue?: SortOrder
    tongTien?: SortOrder
    soLuongNhap?: SortOrder
    soLuongXuat?: SortOrder
    giaTriNhap?: SortOrder
    giaTriXuat?: SortOrder
    searchText?: SortOrderInput | SortOrder
    tags?: SortOrder
    nam?: SortOrder
    thang?: SortOrder
    quy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    syncedAt?: SortOrder
    _count?: ext_tonghopCountOrderByAggregateInput
    _avg?: ext_tonghopAvgOrderByAggregateInput
    _max?: ext_tonghopMaxOrderByAggregateInput
    _min?: ext_tonghopMinOrderByAggregateInput
    _sum?: ext_tonghopSumOrderByAggregateInput
  }

  export type ext_tonghopScalarWhereWithAggregatesInput = {
    AND?: ext_tonghopScalarWhereWithAggregatesInput | ext_tonghopScalarWhereWithAggregatesInput[]
    OR?: ext_tonghopScalarWhereWithAggregatesInput[]
    NOT?: ext_tonghopScalarWhereWithAggregatesInput | ext_tonghopScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ext_tonghop"> | string
    idDetailServer?: StringWithAggregatesFilter<"ext_tonghop"> | string
    idHoadonServer?: StringWithAggregatesFilter<"ext_tonghop"> | string
    congtyId?: StringNullableWithAggregatesFilter<"ext_tonghop"> | string | null
    congtyMst?: StringNullableWithAggregatesFilter<"ext_tonghop"> | string | null
    congtyTen?: StringNullableWithAggregatesFilter<"ext_tonghop"> | string | null
    khmshdon?: StringWithAggregatesFilter<"ext_tonghop"> | string
    khhdon?: StringWithAggregatesFilter<"ext_tonghop"> | string
    shdon?: StringWithAggregatesFilter<"ext_tonghop"> | string
    mhso?: StringNullableWithAggregatesFilter<"ext_tonghop"> | string | null
    tdlap?: DateTimeWithAggregatesFilter<"ext_tonghop"> | Date | string
    tthai?: StringNullableWithAggregatesFilter<"ext_tonghop"> | string | null
    loaihd?: StringWithAggregatesFilter<"ext_tonghop"> | string
    nbmst?: StringWithAggregatesFilter<"ext_tonghop"> | string
    nbten?: StringNullableWithAggregatesFilter<"ext_tonghop"> | string | null
    nbdchi?: StringNullableWithAggregatesFilter<"ext_tonghop"> | string | null
    nmmst?: StringNullableWithAggregatesFilter<"ext_tonghop"> | string | null
    nmten?: StringNullableWithAggregatesFilter<"ext_tonghop"> | string | null
    nmdchi?: StringNullableWithAggregatesFilter<"ext_tonghop"> | string | null
    stt?: IntWithAggregatesFilter<"ext_tonghop"> | number
    tenHang?: StringWithAggregatesFilter<"ext_tonghop"> | string
    tenHangChuan?: StringNullableWithAggregatesFilter<"ext_tonghop"> | string | null
    maHang?: StringNullableWithAggregatesFilter<"ext_tonghop"> | string | null
    nhomHang?: StringNullableWithAggregatesFilter<"ext_tonghop"> | string | null
    dvtinh?: StringNullableWithAggregatesFilter<"ext_tonghop"> | string | null
    sluong?: DecimalWithAggregatesFilter<"ext_tonghop"> | Decimal | DecimalJsLike | number | string
    dgia?: DecimalWithAggregatesFilter<"ext_tonghop"> | Decimal | DecimalJsLike | number | string
    thtien?: DecimalWithAggregatesFilter<"ext_tonghop"> | Decimal | DecimalJsLike | number | string
    tsuat?: DecimalWithAggregatesFilter<"ext_tonghop"> | Decimal | DecimalJsLike | number | string
    tthue?: DecimalWithAggregatesFilter<"ext_tonghop"> | Decimal | DecimalJsLike | number | string
    tongTien?: DecimalWithAggregatesFilter<"ext_tonghop"> | Decimal | DecimalJsLike | number | string
    soLuongNhap?: DecimalWithAggregatesFilter<"ext_tonghop"> | Decimal | DecimalJsLike | number | string
    soLuongXuat?: DecimalWithAggregatesFilter<"ext_tonghop"> | Decimal | DecimalJsLike | number | string
    giaTriNhap?: DecimalWithAggregatesFilter<"ext_tonghop"> | Decimal | DecimalJsLike | number | string
    giaTriXuat?: DecimalWithAggregatesFilter<"ext_tonghop"> | Decimal | DecimalJsLike | number | string
    searchText?: StringNullableWithAggregatesFilter<"ext_tonghop"> | string | null
    tags?: StringNullableListFilter<"ext_tonghop">
    nam?: IntWithAggregatesFilter<"ext_tonghop"> | number
    thang?: IntWithAggregatesFilter<"ext_tonghop"> | number
    quy?: IntWithAggregatesFilter<"ext_tonghop"> | number
    createdAt?: DateTimeWithAggregatesFilter<"ext_tonghop"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ext_tonghop"> | Date | string
    syncedAt?: DateTimeWithAggregatesFilter<"ext_tonghop"> | Date | string
  }

  export type ext_sanpham_dictionaryWhereInput = {
    AND?: ext_sanpham_dictionaryWhereInput | ext_sanpham_dictionaryWhereInput[]
    OR?: ext_sanpham_dictionaryWhereInput[]
    NOT?: ext_sanpham_dictionaryWhereInput | ext_sanpham_dictionaryWhereInput[]
    id?: StringFilter<"ext_sanpham_dictionary"> | string
    tenGoc?: StringFilter<"ext_sanpham_dictionary"> | string
    tenChuan?: StringFilter<"ext_sanpham_dictionary"> | string
    maHang?: StringNullableFilter<"ext_sanpham_dictionary"> | string | null
    nhomHang?: StringNullableFilter<"ext_sanpham_dictionary"> | string | null
    dvtinh?: StringNullableFilter<"ext_sanpham_dictionary"> | string | null
    congtyId?: StringNullableFilter<"ext_sanpham_dictionary"> | string | null
    frequency?: IntFilter<"ext_sanpham_dictionary"> | number
    createdAt?: DateTimeFilter<"ext_sanpham_dictionary"> | Date | string
    updatedAt?: DateTimeFilter<"ext_sanpham_dictionary"> | Date | string
  }

  export type ext_sanpham_dictionaryOrderByWithRelationInput = {
    id?: SortOrder
    tenGoc?: SortOrder
    tenChuan?: SortOrder
    maHang?: SortOrderInput | SortOrder
    nhomHang?: SortOrderInput | SortOrder
    dvtinh?: SortOrderInput | SortOrder
    congtyId?: SortOrderInput | SortOrder
    frequency?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ext_sanpham_dictionaryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tenGoc?: string
    AND?: ext_sanpham_dictionaryWhereInput | ext_sanpham_dictionaryWhereInput[]
    OR?: ext_sanpham_dictionaryWhereInput[]
    NOT?: ext_sanpham_dictionaryWhereInput | ext_sanpham_dictionaryWhereInput[]
    tenChuan?: StringFilter<"ext_sanpham_dictionary"> | string
    maHang?: StringNullableFilter<"ext_sanpham_dictionary"> | string | null
    nhomHang?: StringNullableFilter<"ext_sanpham_dictionary"> | string | null
    dvtinh?: StringNullableFilter<"ext_sanpham_dictionary"> | string | null
    congtyId?: StringNullableFilter<"ext_sanpham_dictionary"> | string | null
    frequency?: IntFilter<"ext_sanpham_dictionary"> | number
    createdAt?: DateTimeFilter<"ext_sanpham_dictionary"> | Date | string
    updatedAt?: DateTimeFilter<"ext_sanpham_dictionary"> | Date | string
  }, "id" | "tenGoc">

  export type ext_sanpham_dictionaryOrderByWithAggregationInput = {
    id?: SortOrder
    tenGoc?: SortOrder
    tenChuan?: SortOrder
    maHang?: SortOrderInput | SortOrder
    nhomHang?: SortOrderInput | SortOrder
    dvtinh?: SortOrderInput | SortOrder
    congtyId?: SortOrderInput | SortOrder
    frequency?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ext_sanpham_dictionaryCountOrderByAggregateInput
    _avg?: ext_sanpham_dictionaryAvgOrderByAggregateInput
    _max?: ext_sanpham_dictionaryMaxOrderByAggregateInput
    _min?: ext_sanpham_dictionaryMinOrderByAggregateInput
    _sum?: ext_sanpham_dictionarySumOrderByAggregateInput
  }

  export type ext_sanpham_dictionaryScalarWhereWithAggregatesInput = {
    AND?: ext_sanpham_dictionaryScalarWhereWithAggregatesInput | ext_sanpham_dictionaryScalarWhereWithAggregatesInput[]
    OR?: ext_sanpham_dictionaryScalarWhereWithAggregatesInput[]
    NOT?: ext_sanpham_dictionaryScalarWhereWithAggregatesInput | ext_sanpham_dictionaryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ext_sanpham_dictionary"> | string
    tenGoc?: StringWithAggregatesFilter<"ext_sanpham_dictionary"> | string
    tenChuan?: StringWithAggregatesFilter<"ext_sanpham_dictionary"> | string
    maHang?: StringNullableWithAggregatesFilter<"ext_sanpham_dictionary"> | string | null
    nhomHang?: StringNullableWithAggregatesFilter<"ext_sanpham_dictionary"> | string | null
    dvtinh?: StringNullableWithAggregatesFilter<"ext_sanpham_dictionary"> | string | null
    congtyId?: StringNullableWithAggregatesFilter<"ext_sanpham_dictionary"> | string | null
    frequency?: IntWithAggregatesFilter<"ext_sanpham_dictionary"> | number
    createdAt?: DateTimeWithAggregatesFilter<"ext_sanpham_dictionary"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ext_sanpham_dictionary"> | Date | string
  }

  export type ext_daily_stock_v2WhereInput = {
    AND?: ext_daily_stock_v2WhereInput | ext_daily_stock_v2WhereInput[]
    OR?: ext_daily_stock_v2WhereInput[]
    NOT?: ext_daily_stock_v2WhereInput | ext_daily_stock_v2WhereInput[]
    id?: StringFilter<"ext_daily_stock_v2"> | string
    congtyId?: StringNullableFilter<"ext_daily_stock_v2"> | string | null
    date?: DateTimeFilter<"ext_daily_stock_v2"> | Date | string
    tenHangChuan?: StringFilter<"ext_daily_stock_v2"> | string
    maHang?: StringNullableFilter<"ext_daily_stock_v2"> | string | null
    dvtinh?: StringNullableFilter<"ext_daily_stock_v2"> | string | null
    tonDauQty?: DecimalFilter<"ext_daily_stock_v2"> | Decimal | DecimalJsLike | number | string
    tonDauVal?: DecimalFilter<"ext_daily_stock_v2"> | Decimal | DecimalJsLike | number | string
    nhapQty?: DecimalFilter<"ext_daily_stock_v2"> | Decimal | DecimalJsLike | number | string
    nhapVal?: DecimalFilter<"ext_daily_stock_v2"> | Decimal | DecimalJsLike | number | string
    xuatQty?: DecimalFilter<"ext_daily_stock_v2"> | Decimal | DecimalJsLike | number | string
    xuatVal?: DecimalFilter<"ext_daily_stock_v2"> | Decimal | DecimalJsLike | number | string
    tonCuoiQty?: DecimalFilter<"ext_daily_stock_v2"> | Decimal | DecimalJsLike | number | string
    tonCuoiVal?: DecimalFilter<"ext_daily_stock_v2"> | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFilter<"ext_daily_stock_v2"> | Date | string
    updatedAt?: DateTimeFilter<"ext_daily_stock_v2"> | Date | string
  }

  export type ext_daily_stock_v2OrderByWithRelationInput = {
    id?: SortOrder
    congtyId?: SortOrderInput | SortOrder
    date?: SortOrder
    tenHangChuan?: SortOrder
    maHang?: SortOrderInput | SortOrder
    dvtinh?: SortOrderInput | SortOrder
    tonDauQty?: SortOrder
    tonDauVal?: SortOrder
    nhapQty?: SortOrder
    nhapVal?: SortOrder
    xuatQty?: SortOrder
    xuatVal?: SortOrder
    tonCuoiQty?: SortOrder
    tonCuoiVal?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ext_daily_stock_v2WhereUniqueInput = Prisma.AtLeast<{
    id?: string
    congtyId_date_tenHangChuan?: ext_daily_stock_v2CongtyIdDateTenHangChuanCompoundUniqueInput
    AND?: ext_daily_stock_v2WhereInput | ext_daily_stock_v2WhereInput[]
    OR?: ext_daily_stock_v2WhereInput[]
    NOT?: ext_daily_stock_v2WhereInput | ext_daily_stock_v2WhereInput[]
    congtyId?: StringNullableFilter<"ext_daily_stock_v2"> | string | null
    date?: DateTimeFilter<"ext_daily_stock_v2"> | Date | string
    tenHangChuan?: StringFilter<"ext_daily_stock_v2"> | string
    maHang?: StringNullableFilter<"ext_daily_stock_v2"> | string | null
    dvtinh?: StringNullableFilter<"ext_daily_stock_v2"> | string | null
    tonDauQty?: DecimalFilter<"ext_daily_stock_v2"> | Decimal | DecimalJsLike | number | string
    tonDauVal?: DecimalFilter<"ext_daily_stock_v2"> | Decimal | DecimalJsLike | number | string
    nhapQty?: DecimalFilter<"ext_daily_stock_v2"> | Decimal | DecimalJsLike | number | string
    nhapVal?: DecimalFilter<"ext_daily_stock_v2"> | Decimal | DecimalJsLike | number | string
    xuatQty?: DecimalFilter<"ext_daily_stock_v2"> | Decimal | DecimalJsLike | number | string
    xuatVal?: DecimalFilter<"ext_daily_stock_v2"> | Decimal | DecimalJsLike | number | string
    tonCuoiQty?: DecimalFilter<"ext_daily_stock_v2"> | Decimal | DecimalJsLike | number | string
    tonCuoiVal?: DecimalFilter<"ext_daily_stock_v2"> | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFilter<"ext_daily_stock_v2"> | Date | string
    updatedAt?: DateTimeFilter<"ext_daily_stock_v2"> | Date | string
  }, "id" | "congtyId_date_tenHangChuan">

  export type ext_daily_stock_v2OrderByWithAggregationInput = {
    id?: SortOrder
    congtyId?: SortOrderInput | SortOrder
    date?: SortOrder
    tenHangChuan?: SortOrder
    maHang?: SortOrderInput | SortOrder
    dvtinh?: SortOrderInput | SortOrder
    tonDauQty?: SortOrder
    tonDauVal?: SortOrder
    nhapQty?: SortOrder
    nhapVal?: SortOrder
    xuatQty?: SortOrder
    xuatVal?: SortOrder
    tonCuoiQty?: SortOrder
    tonCuoiVal?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ext_daily_stock_v2CountOrderByAggregateInput
    _avg?: ext_daily_stock_v2AvgOrderByAggregateInput
    _max?: ext_daily_stock_v2MaxOrderByAggregateInput
    _min?: ext_daily_stock_v2MinOrderByAggregateInput
    _sum?: ext_daily_stock_v2SumOrderByAggregateInput
  }

  export type ext_daily_stock_v2ScalarWhereWithAggregatesInput = {
    AND?: ext_daily_stock_v2ScalarWhereWithAggregatesInput | ext_daily_stock_v2ScalarWhereWithAggregatesInput[]
    OR?: ext_daily_stock_v2ScalarWhereWithAggregatesInput[]
    NOT?: ext_daily_stock_v2ScalarWhereWithAggregatesInput | ext_daily_stock_v2ScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ext_daily_stock_v2"> | string
    congtyId?: StringNullableWithAggregatesFilter<"ext_daily_stock_v2"> | string | null
    date?: DateTimeWithAggregatesFilter<"ext_daily_stock_v2"> | Date | string
    tenHangChuan?: StringWithAggregatesFilter<"ext_daily_stock_v2"> | string
    maHang?: StringNullableWithAggregatesFilter<"ext_daily_stock_v2"> | string | null
    dvtinh?: StringNullableWithAggregatesFilter<"ext_daily_stock_v2"> | string | null
    tonDauQty?: DecimalWithAggregatesFilter<"ext_daily_stock_v2"> | Decimal | DecimalJsLike | number | string
    tonDauVal?: DecimalWithAggregatesFilter<"ext_daily_stock_v2"> | Decimal | DecimalJsLike | number | string
    nhapQty?: DecimalWithAggregatesFilter<"ext_daily_stock_v2"> | Decimal | DecimalJsLike | number | string
    nhapVal?: DecimalWithAggregatesFilter<"ext_daily_stock_v2"> | Decimal | DecimalJsLike | number | string
    xuatQty?: DecimalWithAggregatesFilter<"ext_daily_stock_v2"> | Decimal | DecimalJsLike | number | string
    xuatVal?: DecimalWithAggregatesFilter<"ext_daily_stock_v2"> | Decimal | DecimalJsLike | number | string
    tonCuoiQty?: DecimalWithAggregatesFilter<"ext_daily_stock_v2"> | Decimal | DecimalJsLike | number | string
    tonCuoiVal?: DecimalWithAggregatesFilter<"ext_daily_stock_v2"> | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeWithAggregatesFilter<"ext_daily_stock_v2"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ext_daily_stock_v2"> | Date | string
  }

  export type ext_congtyCreateInput = {
    id?: string
    mst: string
    ten: string
    tenVietTat?: string | null
    diaChi?: string | null
    dienThoai?: string | null
    email?: string | null
    nguoiDaiDien?: string | null
    isActive?: boolean
    isDefault?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    apiConfigs?: ext_apiconfigCreateNestedManyWithoutCongtyInput
    hoadons?: ext_listhoadonCreateNestedManyWithoutCongtyInput
    synclogs?: ext_synclogCreateNestedManyWithoutCongtyInput
  }

  export type ext_congtyUncheckedCreateInput = {
    id?: string
    mst: string
    ten: string
    tenVietTat?: string | null
    diaChi?: string | null
    dienThoai?: string | null
    email?: string | null
    nguoiDaiDien?: string | null
    isActive?: boolean
    isDefault?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    apiConfigs?: ext_apiconfigUncheckedCreateNestedManyWithoutCongtyInput
    hoadons?: ext_listhoadonUncheckedCreateNestedManyWithoutCongtyInput
    synclogs?: ext_synclogUncheckedCreateNestedManyWithoutCongtyInput
  }

  export type ext_congtyUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    mst?: StringFieldUpdateOperationsInput | string
    ten?: StringFieldUpdateOperationsInput | string
    tenVietTat?: NullableStringFieldUpdateOperationsInput | string | null
    diaChi?: NullableStringFieldUpdateOperationsInput | string | null
    dienThoai?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    nguoiDaiDien?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    apiConfigs?: ext_apiconfigUpdateManyWithoutCongtyNestedInput
    hoadons?: ext_listhoadonUpdateManyWithoutCongtyNestedInput
    synclogs?: ext_synclogUpdateManyWithoutCongtyNestedInput
  }

  export type ext_congtyUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    mst?: StringFieldUpdateOperationsInput | string
    ten?: StringFieldUpdateOperationsInput | string
    tenVietTat?: NullableStringFieldUpdateOperationsInput | string | null
    diaChi?: NullableStringFieldUpdateOperationsInput | string | null
    dienThoai?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    nguoiDaiDien?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    apiConfigs?: ext_apiconfigUncheckedUpdateManyWithoutCongtyNestedInput
    hoadons?: ext_listhoadonUncheckedUpdateManyWithoutCongtyNestedInput
    synclogs?: ext_synclogUncheckedUpdateManyWithoutCongtyNestedInput
  }

  export type ext_congtyCreateManyInput = {
    id?: string
    mst: string
    ten: string
    tenVietTat?: string | null
    diaChi?: string | null
    dienThoai?: string | null
    email?: string | null
    nguoiDaiDien?: string | null
    isActive?: boolean
    isDefault?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ext_congtyUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    mst?: StringFieldUpdateOperationsInput | string
    ten?: StringFieldUpdateOperationsInput | string
    tenVietTat?: NullableStringFieldUpdateOperationsInput | string | null
    diaChi?: NullableStringFieldUpdateOperationsInput | string | null
    dienThoai?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    nguoiDaiDien?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ext_congtyUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    mst?: StringFieldUpdateOperationsInput | string
    ten?: StringFieldUpdateOperationsInput | string
    tenVietTat?: NullableStringFieldUpdateOperationsInput | string | null
    diaChi?: NullableStringFieldUpdateOperationsInput | string | null
    dienThoai?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    nguoiDaiDien?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ext_listhoadonCreateInput = {
    id?: string
    idServer: string
    brandname?: string | null
    nbmst: string
    nbten?: string | null
    nbdchi?: string | null
    nmmst?: string | null
    nmten?: string | null
    nmdchi?: string | null
    khmshdon: string
    khhdon: string
    shdon: string
    mhso?: string | null
    tgtcthue?: Decimal | DecimalJsLike | number | string
    tgtthue?: Decimal | DecimalJsLike | number | string
    tgtttbso?: Decimal | DecimalJsLike | number | string
    tdlap: Date | string
    tthai?: string | null
    loaihd?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    congty?: ext_congtyCreateNestedOneWithoutHoadonsInput
    details?: ext_detailhoadonCreateNestedManyWithoutInvoiceInput
  }

  export type ext_listhoadonUncheckedCreateInput = {
    id?: string
    idServer: string
    brandname?: string | null
    congtyId?: string | null
    nbmst: string
    nbten?: string | null
    nbdchi?: string | null
    nmmst?: string | null
    nmten?: string | null
    nmdchi?: string | null
    khmshdon: string
    khhdon: string
    shdon: string
    mhso?: string | null
    tgtcthue?: Decimal | DecimalJsLike | number | string
    tgtthue?: Decimal | DecimalJsLike | number | string
    tgtttbso?: Decimal | DecimalJsLike | number | string
    tdlap: Date | string
    tthai?: string | null
    loaihd?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    details?: ext_detailhoadonUncheckedCreateNestedManyWithoutInvoiceInput
  }

  export type ext_listhoadonUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    idServer?: StringFieldUpdateOperationsInput | string
    brandname?: NullableStringFieldUpdateOperationsInput | string | null
    nbmst?: StringFieldUpdateOperationsInput | string
    nbten?: NullableStringFieldUpdateOperationsInput | string | null
    nbdchi?: NullableStringFieldUpdateOperationsInput | string | null
    nmmst?: NullableStringFieldUpdateOperationsInput | string | null
    nmten?: NullableStringFieldUpdateOperationsInput | string | null
    nmdchi?: NullableStringFieldUpdateOperationsInput | string | null
    khmshdon?: StringFieldUpdateOperationsInput | string
    khhdon?: StringFieldUpdateOperationsInput | string
    shdon?: StringFieldUpdateOperationsInput | string
    mhso?: NullableStringFieldUpdateOperationsInput | string | null
    tgtcthue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tgtthue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tgtttbso?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tdlap?: DateTimeFieldUpdateOperationsInput | Date | string
    tthai?: NullableStringFieldUpdateOperationsInput | string | null
    loaihd?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    congty?: ext_congtyUpdateOneWithoutHoadonsNestedInput
    details?: ext_detailhoadonUpdateManyWithoutInvoiceNestedInput
  }

  export type ext_listhoadonUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    idServer?: StringFieldUpdateOperationsInput | string
    brandname?: NullableStringFieldUpdateOperationsInput | string | null
    congtyId?: NullableStringFieldUpdateOperationsInput | string | null
    nbmst?: StringFieldUpdateOperationsInput | string
    nbten?: NullableStringFieldUpdateOperationsInput | string | null
    nbdchi?: NullableStringFieldUpdateOperationsInput | string | null
    nmmst?: NullableStringFieldUpdateOperationsInput | string | null
    nmten?: NullableStringFieldUpdateOperationsInput | string | null
    nmdchi?: NullableStringFieldUpdateOperationsInput | string | null
    khmshdon?: StringFieldUpdateOperationsInput | string
    khhdon?: StringFieldUpdateOperationsInput | string
    shdon?: StringFieldUpdateOperationsInput | string
    mhso?: NullableStringFieldUpdateOperationsInput | string | null
    tgtcthue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tgtthue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tgtttbso?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tdlap?: DateTimeFieldUpdateOperationsInput | Date | string
    tthai?: NullableStringFieldUpdateOperationsInput | string | null
    loaihd?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    details?: ext_detailhoadonUncheckedUpdateManyWithoutInvoiceNestedInput
  }

  export type ext_listhoadonCreateManyInput = {
    id?: string
    idServer: string
    brandname?: string | null
    congtyId?: string | null
    nbmst: string
    nbten?: string | null
    nbdchi?: string | null
    nmmst?: string | null
    nmten?: string | null
    nmdchi?: string | null
    khmshdon: string
    khhdon: string
    shdon: string
    mhso?: string | null
    tgtcthue?: Decimal | DecimalJsLike | number | string
    tgtthue?: Decimal | DecimalJsLike | number | string
    tgtttbso?: Decimal | DecimalJsLike | number | string
    tdlap: Date | string
    tthai?: string | null
    loaihd?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ext_listhoadonUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    idServer?: StringFieldUpdateOperationsInput | string
    brandname?: NullableStringFieldUpdateOperationsInput | string | null
    nbmst?: StringFieldUpdateOperationsInput | string
    nbten?: NullableStringFieldUpdateOperationsInput | string | null
    nbdchi?: NullableStringFieldUpdateOperationsInput | string | null
    nmmst?: NullableStringFieldUpdateOperationsInput | string | null
    nmten?: NullableStringFieldUpdateOperationsInput | string | null
    nmdchi?: NullableStringFieldUpdateOperationsInput | string | null
    khmshdon?: StringFieldUpdateOperationsInput | string
    khhdon?: StringFieldUpdateOperationsInput | string
    shdon?: StringFieldUpdateOperationsInput | string
    mhso?: NullableStringFieldUpdateOperationsInput | string | null
    tgtcthue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tgtthue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tgtttbso?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tdlap?: DateTimeFieldUpdateOperationsInput | Date | string
    tthai?: NullableStringFieldUpdateOperationsInput | string | null
    loaihd?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ext_listhoadonUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    idServer?: StringFieldUpdateOperationsInput | string
    brandname?: NullableStringFieldUpdateOperationsInput | string | null
    congtyId?: NullableStringFieldUpdateOperationsInput | string | null
    nbmst?: StringFieldUpdateOperationsInput | string
    nbten?: NullableStringFieldUpdateOperationsInput | string | null
    nbdchi?: NullableStringFieldUpdateOperationsInput | string | null
    nmmst?: NullableStringFieldUpdateOperationsInput | string | null
    nmten?: NullableStringFieldUpdateOperationsInput | string | null
    nmdchi?: NullableStringFieldUpdateOperationsInput | string | null
    khmshdon?: StringFieldUpdateOperationsInput | string
    khhdon?: StringFieldUpdateOperationsInput | string
    shdon?: StringFieldUpdateOperationsInput | string
    mhso?: NullableStringFieldUpdateOperationsInput | string | null
    tgtcthue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tgtthue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tgtttbso?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tdlap?: DateTimeFieldUpdateOperationsInput | Date | string
    tthai?: NullableStringFieldUpdateOperationsInput | string | null
    loaihd?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ext_detailhoadonCreateInput = {
    id?: string
    idServer: string
    stt?: number
    ten: string
    dvtinh?: string | null
    sluong?: Decimal | DecimalJsLike | number | string
    dgia?: Decimal | DecimalJsLike | number | string
    thtien?: Decimal | DecimalJsLike | number | string
    tsuat?: Decimal | DecimalJsLike | number | string
    tthue?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
    invoice: ext_listhoadonCreateNestedOneWithoutDetailsInput
    products?: ext_sanphamhoadonCreateNestedManyWithoutDetailInput
  }

  export type ext_detailhoadonUncheckedCreateInput = {
    id?: string
    idServer: string
    idhdonServer: string
    stt?: number
    ten: string
    dvtinh?: string | null
    sluong?: Decimal | DecimalJsLike | number | string
    dgia?: Decimal | DecimalJsLike | number | string
    thtien?: Decimal | DecimalJsLike | number | string
    tsuat?: Decimal | DecimalJsLike | number | string
    tthue?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
    products?: ext_sanphamhoadonUncheckedCreateNestedManyWithoutDetailInput
  }

  export type ext_detailhoadonUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    idServer?: StringFieldUpdateOperationsInput | string
    stt?: IntFieldUpdateOperationsInput | number
    ten?: StringFieldUpdateOperationsInput | string
    dvtinh?: NullableStringFieldUpdateOperationsInput | string | null
    sluong?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    dgia?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    thtien?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tsuat?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tthue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    invoice?: ext_listhoadonUpdateOneRequiredWithoutDetailsNestedInput
    products?: ext_sanphamhoadonUpdateManyWithoutDetailNestedInput
  }

  export type ext_detailhoadonUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    idServer?: StringFieldUpdateOperationsInput | string
    idhdonServer?: StringFieldUpdateOperationsInput | string
    stt?: IntFieldUpdateOperationsInput | number
    ten?: StringFieldUpdateOperationsInput | string
    dvtinh?: NullableStringFieldUpdateOperationsInput | string | null
    sluong?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    dgia?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    thtien?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tsuat?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tthue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    products?: ext_sanphamhoadonUncheckedUpdateManyWithoutDetailNestedInput
  }

  export type ext_detailhoadonCreateManyInput = {
    id?: string
    idServer: string
    idhdonServer: string
    stt?: number
    ten: string
    dvtinh?: string | null
    sluong?: Decimal | DecimalJsLike | number | string
    dgia?: Decimal | DecimalJsLike | number | string
    thtien?: Decimal | DecimalJsLike | number | string
    tsuat?: Decimal | DecimalJsLike | number | string
    tthue?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ext_detailhoadonUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    idServer?: StringFieldUpdateOperationsInput | string
    stt?: IntFieldUpdateOperationsInput | number
    ten?: StringFieldUpdateOperationsInput | string
    dvtinh?: NullableStringFieldUpdateOperationsInput | string | null
    sluong?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    dgia?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    thtien?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tsuat?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tthue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ext_detailhoadonUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    idServer?: StringFieldUpdateOperationsInput | string
    idhdonServer?: StringFieldUpdateOperationsInput | string
    stt?: IntFieldUpdateOperationsInput | number
    ten?: StringFieldUpdateOperationsInput | string
    dvtinh?: NullableStringFieldUpdateOperationsInput | string | null
    sluong?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    dgia?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    thtien?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tsuat?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tthue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ext_sanphamhoadonCreateInput = {
    id?: string
    ten: string
    ten2?: string | null
    ma?: string | null
    dvt?: string | null
    dgia?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
    detail: ext_detailhoadonCreateNestedOneWithoutProductsInput
  }

  export type ext_sanphamhoadonUncheckedCreateInput = {
    id?: string
    iddetailhoadon: string
    ten: string
    ten2?: string | null
    ma?: string | null
    dvt?: string | null
    dgia?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ext_sanphamhoadonUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    ten?: StringFieldUpdateOperationsInput | string
    ten2?: NullableStringFieldUpdateOperationsInput | string | null
    ma?: NullableStringFieldUpdateOperationsInput | string | null
    dvt?: NullableStringFieldUpdateOperationsInput | string | null
    dgia?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    detail?: ext_detailhoadonUpdateOneRequiredWithoutProductsNestedInput
  }

  export type ext_sanphamhoadonUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    iddetailhoadon?: StringFieldUpdateOperationsInput | string
    ten?: StringFieldUpdateOperationsInput | string
    ten2?: NullableStringFieldUpdateOperationsInput | string | null
    ma?: NullableStringFieldUpdateOperationsInput | string | null
    dvt?: NullableStringFieldUpdateOperationsInput | string | null
    dgia?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ext_sanphamhoadonCreateManyInput = {
    id?: string
    iddetailhoadon: string
    ten: string
    ten2?: string | null
    ma?: string | null
    dvt?: string | null
    dgia?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ext_sanphamhoadonUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    ten?: StringFieldUpdateOperationsInput | string
    ten2?: NullableStringFieldUpdateOperationsInput | string | null
    ma?: NullableStringFieldUpdateOperationsInput | string | null
    dvt?: NullableStringFieldUpdateOperationsInput | string | null
    dgia?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ext_sanphamhoadonUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    iddetailhoadon?: StringFieldUpdateOperationsInput | string
    ten?: StringFieldUpdateOperationsInput | string
    ten2?: NullableStringFieldUpdateOperationsInput | string | null
    ma?: NullableStringFieldUpdateOperationsInput | string | null
    dvt?: NullableStringFieldUpdateOperationsInput | string | null
    dgia?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ext_apiconfigCreateInput = {
    id?: string
    name: string
    bearerToken: string
    baseUrl?: string
    brandname?: string | null
    batchSize?: number
    delayBetweenBatches?: number
    delayBetweenDetailCalls?: number
    maxRetries?: number
    lastSyncAt?: Date | string | null
    lastSyncStatus?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    congty: ext_congtyCreateNestedOneWithoutApiConfigsInput
    synclogs?: ext_synclogCreateNestedManyWithoutConfigInput
  }

  export type ext_apiconfigUncheckedCreateInput = {
    id?: string
    name: string
    congtyId: string
    bearerToken: string
    baseUrl?: string
    brandname?: string | null
    batchSize?: number
    delayBetweenBatches?: number
    delayBetweenDetailCalls?: number
    maxRetries?: number
    lastSyncAt?: Date | string | null
    lastSyncStatus?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    synclogs?: ext_synclogUncheckedCreateNestedManyWithoutConfigInput
  }

  export type ext_apiconfigUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    bearerToken?: StringFieldUpdateOperationsInput | string
    baseUrl?: StringFieldUpdateOperationsInput | string
    brandname?: NullableStringFieldUpdateOperationsInput | string | null
    batchSize?: IntFieldUpdateOperationsInput | number
    delayBetweenBatches?: IntFieldUpdateOperationsInput | number
    delayBetweenDetailCalls?: IntFieldUpdateOperationsInput | number
    maxRetries?: IntFieldUpdateOperationsInput | number
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastSyncStatus?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    congty?: ext_congtyUpdateOneRequiredWithoutApiConfigsNestedInput
    synclogs?: ext_synclogUpdateManyWithoutConfigNestedInput
  }

  export type ext_apiconfigUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    congtyId?: StringFieldUpdateOperationsInput | string
    bearerToken?: StringFieldUpdateOperationsInput | string
    baseUrl?: StringFieldUpdateOperationsInput | string
    brandname?: NullableStringFieldUpdateOperationsInput | string | null
    batchSize?: IntFieldUpdateOperationsInput | number
    delayBetweenBatches?: IntFieldUpdateOperationsInput | number
    delayBetweenDetailCalls?: IntFieldUpdateOperationsInput | number
    maxRetries?: IntFieldUpdateOperationsInput | number
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastSyncStatus?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    synclogs?: ext_synclogUncheckedUpdateManyWithoutConfigNestedInput
  }

  export type ext_apiconfigCreateManyInput = {
    id?: string
    name: string
    congtyId: string
    bearerToken: string
    baseUrl?: string
    brandname?: string | null
    batchSize?: number
    delayBetweenBatches?: number
    delayBetweenDetailCalls?: number
    maxRetries?: number
    lastSyncAt?: Date | string | null
    lastSyncStatus?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ext_apiconfigUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    bearerToken?: StringFieldUpdateOperationsInput | string
    baseUrl?: StringFieldUpdateOperationsInput | string
    brandname?: NullableStringFieldUpdateOperationsInput | string | null
    batchSize?: IntFieldUpdateOperationsInput | number
    delayBetweenBatches?: IntFieldUpdateOperationsInput | number
    delayBetweenDetailCalls?: IntFieldUpdateOperationsInput | number
    maxRetries?: IntFieldUpdateOperationsInput | number
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastSyncStatus?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ext_apiconfigUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    congtyId?: StringFieldUpdateOperationsInput | string
    bearerToken?: StringFieldUpdateOperationsInput | string
    baseUrl?: StringFieldUpdateOperationsInput | string
    brandname?: NullableStringFieldUpdateOperationsInput | string | null
    batchSize?: IntFieldUpdateOperationsInput | number
    delayBetweenBatches?: IntFieldUpdateOperationsInput | number
    delayBetweenDetailCalls?: IntFieldUpdateOperationsInput | number
    maxRetries?: IntFieldUpdateOperationsInput | number
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastSyncStatus?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ext_synclogCreateInput = {
    id?: string
    syncType: string
    fromDate?: Date | string | null
    toDate?: Date | string | null
    totalRecords?: number
    successCount?: number
    errorCount?: number
    status?: string
    errorMessage?: string | null
    startedAt?: Date | string
    completedAt?: Date | string | null
    createdAt?: Date | string
    congty?: ext_congtyCreateNestedOneWithoutSynclogsInput
    config?: ext_apiconfigCreateNestedOneWithoutSynclogsInput
  }

  export type ext_synclogUncheckedCreateInput = {
    id?: string
    congtyId?: string | null
    configId?: string | null
    syncType: string
    fromDate?: Date | string | null
    toDate?: Date | string | null
    totalRecords?: number
    successCount?: number
    errorCount?: number
    status?: string
    errorMessage?: string | null
    startedAt?: Date | string
    completedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type ext_synclogUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    syncType?: StringFieldUpdateOperationsInput | string
    fromDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    toDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalRecords?: IntFieldUpdateOperationsInput | number
    successCount?: IntFieldUpdateOperationsInput | number
    errorCount?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    congty?: ext_congtyUpdateOneWithoutSynclogsNestedInput
    config?: ext_apiconfigUpdateOneWithoutSynclogsNestedInput
  }

  export type ext_synclogUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    congtyId?: NullableStringFieldUpdateOperationsInput | string | null
    configId?: NullableStringFieldUpdateOperationsInput | string | null
    syncType?: StringFieldUpdateOperationsInput | string
    fromDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    toDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalRecords?: IntFieldUpdateOperationsInput | number
    successCount?: IntFieldUpdateOperationsInput | number
    errorCount?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ext_synclogCreateManyInput = {
    id?: string
    congtyId?: string | null
    configId?: string | null
    syncType: string
    fromDate?: Date | string | null
    toDate?: Date | string | null
    totalRecords?: number
    successCount?: number
    errorCount?: number
    status?: string
    errorMessage?: string | null
    startedAt?: Date | string
    completedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type ext_synclogUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    syncType?: StringFieldUpdateOperationsInput | string
    fromDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    toDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalRecords?: IntFieldUpdateOperationsInput | number
    successCount?: IntFieldUpdateOperationsInput | number
    errorCount?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ext_synclogUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    congtyId?: NullableStringFieldUpdateOperationsInput | string | null
    configId?: NullableStringFieldUpdateOperationsInput | string | null
    syncType?: StringFieldUpdateOperationsInput | string
    fromDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    toDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalRecords?: IntFieldUpdateOperationsInput | number
    successCount?: IntFieldUpdateOperationsInput | number
    errorCount?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ext_tonghopCreateInput = {
    id?: string
    idDetailServer: string
    idHoadonServer: string
    congtyId?: string | null
    congtyMst?: string | null
    congtyTen?: string | null
    khmshdon: string
    khhdon: string
    shdon: string
    mhso?: string | null
    tdlap: Date | string
    tthai?: string | null
    loaihd: string
    nbmst: string
    nbten?: string | null
    nbdchi?: string | null
    nmmst?: string | null
    nmten?: string | null
    nmdchi?: string | null
    stt?: number
    tenHang: string
    tenHangChuan?: string | null
    maHang?: string | null
    nhomHang?: string | null
    dvtinh?: string | null
    sluong?: Decimal | DecimalJsLike | number | string
    dgia?: Decimal | DecimalJsLike | number | string
    thtien?: Decimal | DecimalJsLike | number | string
    tsuat?: Decimal | DecimalJsLike | number | string
    tthue?: Decimal | DecimalJsLike | number | string
    tongTien?: Decimal | DecimalJsLike | number | string
    soLuongNhap?: Decimal | DecimalJsLike | number | string
    soLuongXuat?: Decimal | DecimalJsLike | number | string
    giaTriNhap?: Decimal | DecimalJsLike | number | string
    giaTriXuat?: Decimal | DecimalJsLike | number | string
    searchText?: string | null
    tags?: ext_tonghopCreatetagsInput | string[]
    nam: number
    thang: number
    quy: number
    createdAt?: Date | string
    updatedAt?: Date | string
    syncedAt?: Date | string
  }

  export type ext_tonghopUncheckedCreateInput = {
    id?: string
    idDetailServer: string
    idHoadonServer: string
    congtyId?: string | null
    congtyMst?: string | null
    congtyTen?: string | null
    khmshdon: string
    khhdon: string
    shdon: string
    mhso?: string | null
    tdlap: Date | string
    tthai?: string | null
    loaihd: string
    nbmst: string
    nbten?: string | null
    nbdchi?: string | null
    nmmst?: string | null
    nmten?: string | null
    nmdchi?: string | null
    stt?: number
    tenHang: string
    tenHangChuan?: string | null
    maHang?: string | null
    nhomHang?: string | null
    dvtinh?: string | null
    sluong?: Decimal | DecimalJsLike | number | string
    dgia?: Decimal | DecimalJsLike | number | string
    thtien?: Decimal | DecimalJsLike | number | string
    tsuat?: Decimal | DecimalJsLike | number | string
    tthue?: Decimal | DecimalJsLike | number | string
    tongTien?: Decimal | DecimalJsLike | number | string
    soLuongNhap?: Decimal | DecimalJsLike | number | string
    soLuongXuat?: Decimal | DecimalJsLike | number | string
    giaTriNhap?: Decimal | DecimalJsLike | number | string
    giaTriXuat?: Decimal | DecimalJsLike | number | string
    searchText?: string | null
    tags?: ext_tonghopCreatetagsInput | string[]
    nam: number
    thang: number
    quy: number
    createdAt?: Date | string
    updatedAt?: Date | string
    syncedAt?: Date | string
  }

  export type ext_tonghopUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    idDetailServer?: StringFieldUpdateOperationsInput | string
    idHoadonServer?: StringFieldUpdateOperationsInput | string
    congtyId?: NullableStringFieldUpdateOperationsInput | string | null
    congtyMst?: NullableStringFieldUpdateOperationsInput | string | null
    congtyTen?: NullableStringFieldUpdateOperationsInput | string | null
    khmshdon?: StringFieldUpdateOperationsInput | string
    khhdon?: StringFieldUpdateOperationsInput | string
    shdon?: StringFieldUpdateOperationsInput | string
    mhso?: NullableStringFieldUpdateOperationsInput | string | null
    tdlap?: DateTimeFieldUpdateOperationsInput | Date | string
    tthai?: NullableStringFieldUpdateOperationsInput | string | null
    loaihd?: StringFieldUpdateOperationsInput | string
    nbmst?: StringFieldUpdateOperationsInput | string
    nbten?: NullableStringFieldUpdateOperationsInput | string | null
    nbdchi?: NullableStringFieldUpdateOperationsInput | string | null
    nmmst?: NullableStringFieldUpdateOperationsInput | string | null
    nmten?: NullableStringFieldUpdateOperationsInput | string | null
    nmdchi?: NullableStringFieldUpdateOperationsInput | string | null
    stt?: IntFieldUpdateOperationsInput | number
    tenHang?: StringFieldUpdateOperationsInput | string
    tenHangChuan?: NullableStringFieldUpdateOperationsInput | string | null
    maHang?: NullableStringFieldUpdateOperationsInput | string | null
    nhomHang?: NullableStringFieldUpdateOperationsInput | string | null
    dvtinh?: NullableStringFieldUpdateOperationsInput | string | null
    sluong?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    dgia?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    thtien?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tsuat?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tthue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tongTien?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    soLuongNhap?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    soLuongXuat?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    giaTriNhap?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    giaTriXuat?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    searchText?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: ext_tonghopUpdatetagsInput | string[]
    nam?: IntFieldUpdateOperationsInput | number
    thang?: IntFieldUpdateOperationsInput | number
    quy?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    syncedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ext_tonghopUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    idDetailServer?: StringFieldUpdateOperationsInput | string
    idHoadonServer?: StringFieldUpdateOperationsInput | string
    congtyId?: NullableStringFieldUpdateOperationsInput | string | null
    congtyMst?: NullableStringFieldUpdateOperationsInput | string | null
    congtyTen?: NullableStringFieldUpdateOperationsInput | string | null
    khmshdon?: StringFieldUpdateOperationsInput | string
    khhdon?: StringFieldUpdateOperationsInput | string
    shdon?: StringFieldUpdateOperationsInput | string
    mhso?: NullableStringFieldUpdateOperationsInput | string | null
    tdlap?: DateTimeFieldUpdateOperationsInput | Date | string
    tthai?: NullableStringFieldUpdateOperationsInput | string | null
    loaihd?: StringFieldUpdateOperationsInput | string
    nbmst?: StringFieldUpdateOperationsInput | string
    nbten?: NullableStringFieldUpdateOperationsInput | string | null
    nbdchi?: NullableStringFieldUpdateOperationsInput | string | null
    nmmst?: NullableStringFieldUpdateOperationsInput | string | null
    nmten?: NullableStringFieldUpdateOperationsInput | string | null
    nmdchi?: NullableStringFieldUpdateOperationsInput | string | null
    stt?: IntFieldUpdateOperationsInput | number
    tenHang?: StringFieldUpdateOperationsInput | string
    tenHangChuan?: NullableStringFieldUpdateOperationsInput | string | null
    maHang?: NullableStringFieldUpdateOperationsInput | string | null
    nhomHang?: NullableStringFieldUpdateOperationsInput | string | null
    dvtinh?: NullableStringFieldUpdateOperationsInput | string | null
    sluong?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    dgia?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    thtien?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tsuat?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tthue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tongTien?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    soLuongNhap?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    soLuongXuat?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    giaTriNhap?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    giaTriXuat?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    searchText?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: ext_tonghopUpdatetagsInput | string[]
    nam?: IntFieldUpdateOperationsInput | number
    thang?: IntFieldUpdateOperationsInput | number
    quy?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    syncedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ext_tonghopCreateManyInput = {
    id?: string
    idDetailServer: string
    idHoadonServer: string
    congtyId?: string | null
    congtyMst?: string | null
    congtyTen?: string | null
    khmshdon: string
    khhdon: string
    shdon: string
    mhso?: string | null
    tdlap: Date | string
    tthai?: string | null
    loaihd: string
    nbmst: string
    nbten?: string | null
    nbdchi?: string | null
    nmmst?: string | null
    nmten?: string | null
    nmdchi?: string | null
    stt?: number
    tenHang: string
    tenHangChuan?: string | null
    maHang?: string | null
    nhomHang?: string | null
    dvtinh?: string | null
    sluong?: Decimal | DecimalJsLike | number | string
    dgia?: Decimal | DecimalJsLike | number | string
    thtien?: Decimal | DecimalJsLike | number | string
    tsuat?: Decimal | DecimalJsLike | number | string
    tthue?: Decimal | DecimalJsLike | number | string
    tongTien?: Decimal | DecimalJsLike | number | string
    soLuongNhap?: Decimal | DecimalJsLike | number | string
    soLuongXuat?: Decimal | DecimalJsLike | number | string
    giaTriNhap?: Decimal | DecimalJsLike | number | string
    giaTriXuat?: Decimal | DecimalJsLike | number | string
    searchText?: string | null
    tags?: ext_tonghopCreatetagsInput | string[]
    nam: number
    thang: number
    quy: number
    createdAt?: Date | string
    updatedAt?: Date | string
    syncedAt?: Date | string
  }

  export type ext_tonghopUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    idDetailServer?: StringFieldUpdateOperationsInput | string
    idHoadonServer?: StringFieldUpdateOperationsInput | string
    congtyId?: NullableStringFieldUpdateOperationsInput | string | null
    congtyMst?: NullableStringFieldUpdateOperationsInput | string | null
    congtyTen?: NullableStringFieldUpdateOperationsInput | string | null
    khmshdon?: StringFieldUpdateOperationsInput | string
    khhdon?: StringFieldUpdateOperationsInput | string
    shdon?: StringFieldUpdateOperationsInput | string
    mhso?: NullableStringFieldUpdateOperationsInput | string | null
    tdlap?: DateTimeFieldUpdateOperationsInput | Date | string
    tthai?: NullableStringFieldUpdateOperationsInput | string | null
    loaihd?: StringFieldUpdateOperationsInput | string
    nbmst?: StringFieldUpdateOperationsInput | string
    nbten?: NullableStringFieldUpdateOperationsInput | string | null
    nbdchi?: NullableStringFieldUpdateOperationsInput | string | null
    nmmst?: NullableStringFieldUpdateOperationsInput | string | null
    nmten?: NullableStringFieldUpdateOperationsInput | string | null
    nmdchi?: NullableStringFieldUpdateOperationsInput | string | null
    stt?: IntFieldUpdateOperationsInput | number
    tenHang?: StringFieldUpdateOperationsInput | string
    tenHangChuan?: NullableStringFieldUpdateOperationsInput | string | null
    maHang?: NullableStringFieldUpdateOperationsInput | string | null
    nhomHang?: NullableStringFieldUpdateOperationsInput | string | null
    dvtinh?: NullableStringFieldUpdateOperationsInput | string | null
    sluong?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    dgia?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    thtien?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tsuat?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tthue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tongTien?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    soLuongNhap?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    soLuongXuat?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    giaTriNhap?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    giaTriXuat?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    searchText?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: ext_tonghopUpdatetagsInput | string[]
    nam?: IntFieldUpdateOperationsInput | number
    thang?: IntFieldUpdateOperationsInput | number
    quy?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    syncedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ext_tonghopUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    idDetailServer?: StringFieldUpdateOperationsInput | string
    idHoadonServer?: StringFieldUpdateOperationsInput | string
    congtyId?: NullableStringFieldUpdateOperationsInput | string | null
    congtyMst?: NullableStringFieldUpdateOperationsInput | string | null
    congtyTen?: NullableStringFieldUpdateOperationsInput | string | null
    khmshdon?: StringFieldUpdateOperationsInput | string
    khhdon?: StringFieldUpdateOperationsInput | string
    shdon?: StringFieldUpdateOperationsInput | string
    mhso?: NullableStringFieldUpdateOperationsInput | string | null
    tdlap?: DateTimeFieldUpdateOperationsInput | Date | string
    tthai?: NullableStringFieldUpdateOperationsInput | string | null
    loaihd?: StringFieldUpdateOperationsInput | string
    nbmst?: StringFieldUpdateOperationsInput | string
    nbten?: NullableStringFieldUpdateOperationsInput | string | null
    nbdchi?: NullableStringFieldUpdateOperationsInput | string | null
    nmmst?: NullableStringFieldUpdateOperationsInput | string | null
    nmten?: NullableStringFieldUpdateOperationsInput | string | null
    nmdchi?: NullableStringFieldUpdateOperationsInput | string | null
    stt?: IntFieldUpdateOperationsInput | number
    tenHang?: StringFieldUpdateOperationsInput | string
    tenHangChuan?: NullableStringFieldUpdateOperationsInput | string | null
    maHang?: NullableStringFieldUpdateOperationsInput | string | null
    nhomHang?: NullableStringFieldUpdateOperationsInput | string | null
    dvtinh?: NullableStringFieldUpdateOperationsInput | string | null
    sluong?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    dgia?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    thtien?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tsuat?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tthue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tongTien?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    soLuongNhap?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    soLuongXuat?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    giaTriNhap?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    giaTriXuat?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    searchText?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: ext_tonghopUpdatetagsInput | string[]
    nam?: IntFieldUpdateOperationsInput | number
    thang?: IntFieldUpdateOperationsInput | number
    quy?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    syncedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ext_sanpham_dictionaryCreateInput = {
    id?: string
    tenGoc: string
    tenChuan: string
    maHang?: string | null
    nhomHang?: string | null
    dvtinh?: string | null
    congtyId?: string | null
    frequency?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ext_sanpham_dictionaryUncheckedCreateInput = {
    id?: string
    tenGoc: string
    tenChuan: string
    maHang?: string | null
    nhomHang?: string | null
    dvtinh?: string | null
    congtyId?: string | null
    frequency?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ext_sanpham_dictionaryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenGoc?: StringFieldUpdateOperationsInput | string
    tenChuan?: StringFieldUpdateOperationsInput | string
    maHang?: NullableStringFieldUpdateOperationsInput | string | null
    nhomHang?: NullableStringFieldUpdateOperationsInput | string | null
    dvtinh?: NullableStringFieldUpdateOperationsInput | string | null
    congtyId?: NullableStringFieldUpdateOperationsInput | string | null
    frequency?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ext_sanpham_dictionaryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenGoc?: StringFieldUpdateOperationsInput | string
    tenChuan?: StringFieldUpdateOperationsInput | string
    maHang?: NullableStringFieldUpdateOperationsInput | string | null
    nhomHang?: NullableStringFieldUpdateOperationsInput | string | null
    dvtinh?: NullableStringFieldUpdateOperationsInput | string | null
    congtyId?: NullableStringFieldUpdateOperationsInput | string | null
    frequency?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ext_sanpham_dictionaryCreateManyInput = {
    id?: string
    tenGoc: string
    tenChuan: string
    maHang?: string | null
    nhomHang?: string | null
    dvtinh?: string | null
    congtyId?: string | null
    frequency?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ext_sanpham_dictionaryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenGoc?: StringFieldUpdateOperationsInput | string
    tenChuan?: StringFieldUpdateOperationsInput | string
    maHang?: NullableStringFieldUpdateOperationsInput | string | null
    nhomHang?: NullableStringFieldUpdateOperationsInput | string | null
    dvtinh?: NullableStringFieldUpdateOperationsInput | string | null
    congtyId?: NullableStringFieldUpdateOperationsInput | string | null
    frequency?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ext_sanpham_dictionaryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenGoc?: StringFieldUpdateOperationsInput | string
    tenChuan?: StringFieldUpdateOperationsInput | string
    maHang?: NullableStringFieldUpdateOperationsInput | string | null
    nhomHang?: NullableStringFieldUpdateOperationsInput | string | null
    dvtinh?: NullableStringFieldUpdateOperationsInput | string | null
    congtyId?: NullableStringFieldUpdateOperationsInput | string | null
    frequency?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ext_daily_stock_v2CreateInput = {
    id?: string
    congtyId?: string | null
    date: Date | string
    tenHangChuan: string
    maHang?: string | null
    dvtinh?: string | null
    tonDauQty?: Decimal | DecimalJsLike | number | string
    tonDauVal?: Decimal | DecimalJsLike | number | string
    nhapQty?: Decimal | DecimalJsLike | number | string
    nhapVal?: Decimal | DecimalJsLike | number | string
    xuatQty?: Decimal | DecimalJsLike | number | string
    xuatVal?: Decimal | DecimalJsLike | number | string
    tonCuoiQty?: Decimal | DecimalJsLike | number | string
    tonCuoiVal?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ext_daily_stock_v2UncheckedCreateInput = {
    id?: string
    congtyId?: string | null
    date: Date | string
    tenHangChuan: string
    maHang?: string | null
    dvtinh?: string | null
    tonDauQty?: Decimal | DecimalJsLike | number | string
    tonDauVal?: Decimal | DecimalJsLike | number | string
    nhapQty?: Decimal | DecimalJsLike | number | string
    nhapVal?: Decimal | DecimalJsLike | number | string
    xuatQty?: Decimal | DecimalJsLike | number | string
    xuatVal?: Decimal | DecimalJsLike | number | string
    tonCuoiQty?: Decimal | DecimalJsLike | number | string
    tonCuoiVal?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ext_daily_stock_v2UpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    congtyId?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    tenHangChuan?: StringFieldUpdateOperationsInput | string
    maHang?: NullableStringFieldUpdateOperationsInput | string | null
    dvtinh?: NullableStringFieldUpdateOperationsInput | string | null
    tonDauQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tonDauVal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    nhapQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    nhapVal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    xuatQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    xuatVal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tonCuoiQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tonCuoiVal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ext_daily_stock_v2UncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    congtyId?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    tenHangChuan?: StringFieldUpdateOperationsInput | string
    maHang?: NullableStringFieldUpdateOperationsInput | string | null
    dvtinh?: NullableStringFieldUpdateOperationsInput | string | null
    tonDauQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tonDauVal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    nhapQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    nhapVal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    xuatQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    xuatVal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tonCuoiQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tonCuoiVal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ext_daily_stock_v2CreateManyInput = {
    id?: string
    congtyId?: string | null
    date: Date | string
    tenHangChuan: string
    maHang?: string | null
    dvtinh?: string | null
    tonDauQty?: Decimal | DecimalJsLike | number | string
    tonDauVal?: Decimal | DecimalJsLike | number | string
    nhapQty?: Decimal | DecimalJsLike | number | string
    nhapVal?: Decimal | DecimalJsLike | number | string
    xuatQty?: Decimal | DecimalJsLike | number | string
    xuatVal?: Decimal | DecimalJsLike | number | string
    tonCuoiQty?: Decimal | DecimalJsLike | number | string
    tonCuoiVal?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ext_daily_stock_v2UpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    congtyId?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    tenHangChuan?: StringFieldUpdateOperationsInput | string
    maHang?: NullableStringFieldUpdateOperationsInput | string | null
    dvtinh?: NullableStringFieldUpdateOperationsInput | string | null
    tonDauQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tonDauVal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    nhapQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    nhapVal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    xuatQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    xuatVal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tonCuoiQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tonCuoiVal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ext_daily_stock_v2UncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    congtyId?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    tenHangChuan?: StringFieldUpdateOperationsInput | string
    maHang?: NullableStringFieldUpdateOperationsInput | string | null
    dvtinh?: NullableStringFieldUpdateOperationsInput | string | null
    tonDauQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tonDauVal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    nhapQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    nhapVal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    xuatQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    xuatVal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tonCuoiQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tonCuoiVal?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
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

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
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

  export type Ext_apiconfigListRelationFilter = {
    every?: ext_apiconfigWhereInput
    some?: ext_apiconfigWhereInput
    none?: ext_apiconfigWhereInput
  }

  export type Ext_listhoadonListRelationFilter = {
    every?: ext_listhoadonWhereInput
    some?: ext_listhoadonWhereInput
    none?: ext_listhoadonWhereInput
  }

  export type Ext_synclogListRelationFilter = {
    every?: ext_synclogWhereInput
    some?: ext_synclogWhereInput
    none?: ext_synclogWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type ext_apiconfigOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ext_listhoadonOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ext_synclogOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ext_congtyCountOrderByAggregateInput = {
    id?: SortOrder
    mst?: SortOrder
    ten?: SortOrder
    tenVietTat?: SortOrder
    diaChi?: SortOrder
    dienThoai?: SortOrder
    email?: SortOrder
    nguoiDaiDien?: SortOrder
    isActive?: SortOrder
    isDefault?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ext_congtyMaxOrderByAggregateInput = {
    id?: SortOrder
    mst?: SortOrder
    ten?: SortOrder
    tenVietTat?: SortOrder
    diaChi?: SortOrder
    dienThoai?: SortOrder
    email?: SortOrder
    nguoiDaiDien?: SortOrder
    isActive?: SortOrder
    isDefault?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ext_congtyMinOrderByAggregateInput = {
    id?: SortOrder
    mst?: SortOrder
    ten?: SortOrder
    tenVietTat?: SortOrder
    diaChi?: SortOrder
    dienThoai?: SortOrder
    email?: SortOrder
    nguoiDaiDien?: SortOrder
    isActive?: SortOrder
    isDefault?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
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

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
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

  export type DecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type Ext_congtyNullableScalarRelationFilter = {
    is?: ext_congtyWhereInput | null
    isNot?: ext_congtyWhereInput | null
  }

  export type Ext_detailhoadonListRelationFilter = {
    every?: ext_detailhoadonWhereInput
    some?: ext_detailhoadonWhereInput
    none?: ext_detailhoadonWhereInput
  }

  export type ext_detailhoadonOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ext_listhoadonCountOrderByAggregateInput = {
    id?: SortOrder
    idServer?: SortOrder
    brandname?: SortOrder
    congtyId?: SortOrder
    nbmst?: SortOrder
    nbten?: SortOrder
    nbdchi?: SortOrder
    nmmst?: SortOrder
    nmten?: SortOrder
    nmdchi?: SortOrder
    khmshdon?: SortOrder
    khhdon?: SortOrder
    shdon?: SortOrder
    mhso?: SortOrder
    tgtcthue?: SortOrder
    tgtthue?: SortOrder
    tgtttbso?: SortOrder
    tdlap?: SortOrder
    tthai?: SortOrder
    loaihd?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ext_listhoadonAvgOrderByAggregateInput = {
    tgtcthue?: SortOrder
    tgtthue?: SortOrder
    tgtttbso?: SortOrder
  }

  export type ext_listhoadonMaxOrderByAggregateInput = {
    id?: SortOrder
    idServer?: SortOrder
    brandname?: SortOrder
    congtyId?: SortOrder
    nbmst?: SortOrder
    nbten?: SortOrder
    nbdchi?: SortOrder
    nmmst?: SortOrder
    nmten?: SortOrder
    nmdchi?: SortOrder
    khmshdon?: SortOrder
    khhdon?: SortOrder
    shdon?: SortOrder
    mhso?: SortOrder
    tgtcthue?: SortOrder
    tgtthue?: SortOrder
    tgtttbso?: SortOrder
    tdlap?: SortOrder
    tthai?: SortOrder
    loaihd?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ext_listhoadonMinOrderByAggregateInput = {
    id?: SortOrder
    idServer?: SortOrder
    brandname?: SortOrder
    congtyId?: SortOrder
    nbmst?: SortOrder
    nbten?: SortOrder
    nbdchi?: SortOrder
    nmmst?: SortOrder
    nmten?: SortOrder
    nmdchi?: SortOrder
    khmshdon?: SortOrder
    khhdon?: SortOrder
    shdon?: SortOrder
    mhso?: SortOrder
    tgtcthue?: SortOrder
    tgtthue?: SortOrder
    tgtttbso?: SortOrder
    tdlap?: SortOrder
    tthai?: SortOrder
    loaihd?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ext_listhoadonSumOrderByAggregateInput = {
    tgtcthue?: SortOrder
    tgtthue?: SortOrder
    tgtttbso?: SortOrder
  }

  export type DecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type Ext_listhoadonScalarRelationFilter = {
    is?: ext_listhoadonWhereInput
    isNot?: ext_listhoadonWhereInput
  }

  export type Ext_sanphamhoadonListRelationFilter = {
    every?: ext_sanphamhoadonWhereInput
    some?: ext_sanphamhoadonWhereInput
    none?: ext_sanphamhoadonWhereInput
  }

  export type ext_sanphamhoadonOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ext_detailhoadonCountOrderByAggregateInput = {
    id?: SortOrder
    idServer?: SortOrder
    idhdonServer?: SortOrder
    stt?: SortOrder
    ten?: SortOrder
    dvtinh?: SortOrder
    sluong?: SortOrder
    dgia?: SortOrder
    thtien?: SortOrder
    tsuat?: SortOrder
    tthue?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ext_detailhoadonAvgOrderByAggregateInput = {
    stt?: SortOrder
    sluong?: SortOrder
    dgia?: SortOrder
    thtien?: SortOrder
    tsuat?: SortOrder
    tthue?: SortOrder
  }

  export type ext_detailhoadonMaxOrderByAggregateInput = {
    id?: SortOrder
    idServer?: SortOrder
    idhdonServer?: SortOrder
    stt?: SortOrder
    ten?: SortOrder
    dvtinh?: SortOrder
    sluong?: SortOrder
    dgia?: SortOrder
    thtien?: SortOrder
    tsuat?: SortOrder
    tthue?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ext_detailhoadonMinOrderByAggregateInput = {
    id?: SortOrder
    idServer?: SortOrder
    idhdonServer?: SortOrder
    stt?: SortOrder
    ten?: SortOrder
    dvtinh?: SortOrder
    sluong?: SortOrder
    dgia?: SortOrder
    thtien?: SortOrder
    tsuat?: SortOrder
    tthue?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ext_detailhoadonSumOrderByAggregateInput = {
    stt?: SortOrder
    sluong?: SortOrder
    dgia?: SortOrder
    thtien?: SortOrder
    tsuat?: SortOrder
    tthue?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type Ext_detailhoadonScalarRelationFilter = {
    is?: ext_detailhoadonWhereInput
    isNot?: ext_detailhoadonWhereInput
  }

  export type ext_sanphamhoadonCountOrderByAggregateInput = {
    id?: SortOrder
    iddetailhoadon?: SortOrder
    ten?: SortOrder
    ten2?: SortOrder
    ma?: SortOrder
    dvt?: SortOrder
    dgia?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ext_sanphamhoadonAvgOrderByAggregateInput = {
    dgia?: SortOrder
  }

  export type ext_sanphamhoadonMaxOrderByAggregateInput = {
    id?: SortOrder
    iddetailhoadon?: SortOrder
    ten?: SortOrder
    ten2?: SortOrder
    ma?: SortOrder
    dvt?: SortOrder
    dgia?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ext_sanphamhoadonMinOrderByAggregateInput = {
    id?: SortOrder
    iddetailhoadon?: SortOrder
    ten?: SortOrder
    ten2?: SortOrder
    ma?: SortOrder
    dvt?: SortOrder
    dgia?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ext_sanphamhoadonSumOrderByAggregateInput = {
    dgia?: SortOrder
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type Ext_congtyScalarRelationFilter = {
    is?: ext_congtyWhereInput
    isNot?: ext_congtyWhereInput
  }

  export type ext_apiconfigCongtyIdNameCompoundUniqueInput = {
    congtyId: string
    name: string
  }

  export type ext_apiconfigCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    congtyId?: SortOrder
    bearerToken?: SortOrder
    baseUrl?: SortOrder
    brandname?: SortOrder
    batchSize?: SortOrder
    delayBetweenBatches?: SortOrder
    delayBetweenDetailCalls?: SortOrder
    maxRetries?: SortOrder
    lastSyncAt?: SortOrder
    lastSyncStatus?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ext_apiconfigAvgOrderByAggregateInput = {
    batchSize?: SortOrder
    delayBetweenBatches?: SortOrder
    delayBetweenDetailCalls?: SortOrder
    maxRetries?: SortOrder
  }

  export type ext_apiconfigMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    congtyId?: SortOrder
    bearerToken?: SortOrder
    baseUrl?: SortOrder
    brandname?: SortOrder
    batchSize?: SortOrder
    delayBetweenBatches?: SortOrder
    delayBetweenDetailCalls?: SortOrder
    maxRetries?: SortOrder
    lastSyncAt?: SortOrder
    lastSyncStatus?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ext_apiconfigMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    congtyId?: SortOrder
    bearerToken?: SortOrder
    baseUrl?: SortOrder
    brandname?: SortOrder
    batchSize?: SortOrder
    delayBetweenBatches?: SortOrder
    delayBetweenDetailCalls?: SortOrder
    maxRetries?: SortOrder
    lastSyncAt?: SortOrder
    lastSyncStatus?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ext_apiconfigSumOrderByAggregateInput = {
    batchSize?: SortOrder
    delayBetweenBatches?: SortOrder
    delayBetweenDetailCalls?: SortOrder
    maxRetries?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type Ext_apiconfigNullableScalarRelationFilter = {
    is?: ext_apiconfigWhereInput | null
    isNot?: ext_apiconfigWhereInput | null
  }

  export type ext_synclogCountOrderByAggregateInput = {
    id?: SortOrder
    congtyId?: SortOrder
    configId?: SortOrder
    syncType?: SortOrder
    fromDate?: SortOrder
    toDate?: SortOrder
    totalRecords?: SortOrder
    successCount?: SortOrder
    errorCount?: SortOrder
    status?: SortOrder
    errorMessage?: SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type ext_synclogAvgOrderByAggregateInput = {
    totalRecords?: SortOrder
    successCount?: SortOrder
    errorCount?: SortOrder
  }

  export type ext_synclogMaxOrderByAggregateInput = {
    id?: SortOrder
    congtyId?: SortOrder
    configId?: SortOrder
    syncType?: SortOrder
    fromDate?: SortOrder
    toDate?: SortOrder
    totalRecords?: SortOrder
    successCount?: SortOrder
    errorCount?: SortOrder
    status?: SortOrder
    errorMessage?: SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type ext_synclogMinOrderByAggregateInput = {
    id?: SortOrder
    congtyId?: SortOrder
    configId?: SortOrder
    syncType?: SortOrder
    fromDate?: SortOrder
    toDate?: SortOrder
    totalRecords?: SortOrder
    successCount?: SortOrder
    errorCount?: SortOrder
    status?: SortOrder
    errorMessage?: SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type ext_synclogSumOrderByAggregateInput = {
    totalRecords?: SortOrder
    successCount?: SortOrder
    errorCount?: SortOrder
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type ext_tonghopCountOrderByAggregateInput = {
    id?: SortOrder
    idDetailServer?: SortOrder
    idHoadonServer?: SortOrder
    congtyId?: SortOrder
    congtyMst?: SortOrder
    congtyTen?: SortOrder
    khmshdon?: SortOrder
    khhdon?: SortOrder
    shdon?: SortOrder
    mhso?: SortOrder
    tdlap?: SortOrder
    tthai?: SortOrder
    loaihd?: SortOrder
    nbmst?: SortOrder
    nbten?: SortOrder
    nbdchi?: SortOrder
    nmmst?: SortOrder
    nmten?: SortOrder
    nmdchi?: SortOrder
    stt?: SortOrder
    tenHang?: SortOrder
    tenHangChuan?: SortOrder
    maHang?: SortOrder
    nhomHang?: SortOrder
    dvtinh?: SortOrder
    sluong?: SortOrder
    dgia?: SortOrder
    thtien?: SortOrder
    tsuat?: SortOrder
    tthue?: SortOrder
    tongTien?: SortOrder
    soLuongNhap?: SortOrder
    soLuongXuat?: SortOrder
    giaTriNhap?: SortOrder
    giaTriXuat?: SortOrder
    searchText?: SortOrder
    tags?: SortOrder
    nam?: SortOrder
    thang?: SortOrder
    quy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    syncedAt?: SortOrder
  }

  export type ext_tonghopAvgOrderByAggregateInput = {
    stt?: SortOrder
    sluong?: SortOrder
    dgia?: SortOrder
    thtien?: SortOrder
    tsuat?: SortOrder
    tthue?: SortOrder
    tongTien?: SortOrder
    soLuongNhap?: SortOrder
    soLuongXuat?: SortOrder
    giaTriNhap?: SortOrder
    giaTriXuat?: SortOrder
    nam?: SortOrder
    thang?: SortOrder
    quy?: SortOrder
  }

  export type ext_tonghopMaxOrderByAggregateInput = {
    id?: SortOrder
    idDetailServer?: SortOrder
    idHoadonServer?: SortOrder
    congtyId?: SortOrder
    congtyMst?: SortOrder
    congtyTen?: SortOrder
    khmshdon?: SortOrder
    khhdon?: SortOrder
    shdon?: SortOrder
    mhso?: SortOrder
    tdlap?: SortOrder
    tthai?: SortOrder
    loaihd?: SortOrder
    nbmst?: SortOrder
    nbten?: SortOrder
    nbdchi?: SortOrder
    nmmst?: SortOrder
    nmten?: SortOrder
    nmdchi?: SortOrder
    stt?: SortOrder
    tenHang?: SortOrder
    tenHangChuan?: SortOrder
    maHang?: SortOrder
    nhomHang?: SortOrder
    dvtinh?: SortOrder
    sluong?: SortOrder
    dgia?: SortOrder
    thtien?: SortOrder
    tsuat?: SortOrder
    tthue?: SortOrder
    tongTien?: SortOrder
    soLuongNhap?: SortOrder
    soLuongXuat?: SortOrder
    giaTriNhap?: SortOrder
    giaTriXuat?: SortOrder
    searchText?: SortOrder
    nam?: SortOrder
    thang?: SortOrder
    quy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    syncedAt?: SortOrder
  }

  export type ext_tonghopMinOrderByAggregateInput = {
    id?: SortOrder
    idDetailServer?: SortOrder
    idHoadonServer?: SortOrder
    congtyId?: SortOrder
    congtyMst?: SortOrder
    congtyTen?: SortOrder
    khmshdon?: SortOrder
    khhdon?: SortOrder
    shdon?: SortOrder
    mhso?: SortOrder
    tdlap?: SortOrder
    tthai?: SortOrder
    loaihd?: SortOrder
    nbmst?: SortOrder
    nbten?: SortOrder
    nbdchi?: SortOrder
    nmmst?: SortOrder
    nmten?: SortOrder
    nmdchi?: SortOrder
    stt?: SortOrder
    tenHang?: SortOrder
    tenHangChuan?: SortOrder
    maHang?: SortOrder
    nhomHang?: SortOrder
    dvtinh?: SortOrder
    sluong?: SortOrder
    dgia?: SortOrder
    thtien?: SortOrder
    tsuat?: SortOrder
    tthue?: SortOrder
    tongTien?: SortOrder
    soLuongNhap?: SortOrder
    soLuongXuat?: SortOrder
    giaTriNhap?: SortOrder
    giaTriXuat?: SortOrder
    searchText?: SortOrder
    nam?: SortOrder
    thang?: SortOrder
    quy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    syncedAt?: SortOrder
  }

  export type ext_tonghopSumOrderByAggregateInput = {
    stt?: SortOrder
    sluong?: SortOrder
    dgia?: SortOrder
    thtien?: SortOrder
    tsuat?: SortOrder
    tthue?: SortOrder
    tongTien?: SortOrder
    soLuongNhap?: SortOrder
    soLuongXuat?: SortOrder
    giaTriNhap?: SortOrder
    giaTriXuat?: SortOrder
    nam?: SortOrder
    thang?: SortOrder
    quy?: SortOrder
  }

  export type ext_sanpham_dictionaryCountOrderByAggregateInput = {
    id?: SortOrder
    tenGoc?: SortOrder
    tenChuan?: SortOrder
    maHang?: SortOrder
    nhomHang?: SortOrder
    dvtinh?: SortOrder
    congtyId?: SortOrder
    frequency?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ext_sanpham_dictionaryAvgOrderByAggregateInput = {
    frequency?: SortOrder
  }

  export type ext_sanpham_dictionaryMaxOrderByAggregateInput = {
    id?: SortOrder
    tenGoc?: SortOrder
    tenChuan?: SortOrder
    maHang?: SortOrder
    nhomHang?: SortOrder
    dvtinh?: SortOrder
    congtyId?: SortOrder
    frequency?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ext_sanpham_dictionaryMinOrderByAggregateInput = {
    id?: SortOrder
    tenGoc?: SortOrder
    tenChuan?: SortOrder
    maHang?: SortOrder
    nhomHang?: SortOrder
    dvtinh?: SortOrder
    congtyId?: SortOrder
    frequency?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ext_sanpham_dictionarySumOrderByAggregateInput = {
    frequency?: SortOrder
  }

  export type ext_daily_stock_v2CongtyIdDateTenHangChuanCompoundUniqueInput = {
    congtyId: string
    date: Date | string
    tenHangChuan: string
  }

  export type ext_daily_stock_v2CountOrderByAggregateInput = {
    id?: SortOrder
    congtyId?: SortOrder
    date?: SortOrder
    tenHangChuan?: SortOrder
    maHang?: SortOrder
    dvtinh?: SortOrder
    tonDauQty?: SortOrder
    tonDauVal?: SortOrder
    nhapQty?: SortOrder
    nhapVal?: SortOrder
    xuatQty?: SortOrder
    xuatVal?: SortOrder
    tonCuoiQty?: SortOrder
    tonCuoiVal?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ext_daily_stock_v2AvgOrderByAggregateInput = {
    tonDauQty?: SortOrder
    tonDauVal?: SortOrder
    nhapQty?: SortOrder
    nhapVal?: SortOrder
    xuatQty?: SortOrder
    xuatVal?: SortOrder
    tonCuoiQty?: SortOrder
    tonCuoiVal?: SortOrder
  }

  export type ext_daily_stock_v2MaxOrderByAggregateInput = {
    id?: SortOrder
    congtyId?: SortOrder
    date?: SortOrder
    tenHangChuan?: SortOrder
    maHang?: SortOrder
    dvtinh?: SortOrder
    tonDauQty?: SortOrder
    tonDauVal?: SortOrder
    nhapQty?: SortOrder
    nhapVal?: SortOrder
    xuatQty?: SortOrder
    xuatVal?: SortOrder
    tonCuoiQty?: SortOrder
    tonCuoiVal?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ext_daily_stock_v2MinOrderByAggregateInput = {
    id?: SortOrder
    congtyId?: SortOrder
    date?: SortOrder
    tenHangChuan?: SortOrder
    maHang?: SortOrder
    dvtinh?: SortOrder
    tonDauQty?: SortOrder
    tonDauVal?: SortOrder
    nhapQty?: SortOrder
    nhapVal?: SortOrder
    xuatQty?: SortOrder
    xuatVal?: SortOrder
    tonCuoiQty?: SortOrder
    tonCuoiVal?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ext_daily_stock_v2SumOrderByAggregateInput = {
    tonDauQty?: SortOrder
    tonDauVal?: SortOrder
    nhapQty?: SortOrder
    nhapVal?: SortOrder
    xuatQty?: SortOrder
    xuatVal?: SortOrder
    tonCuoiQty?: SortOrder
    tonCuoiVal?: SortOrder
  }

  export type ext_apiconfigCreateNestedManyWithoutCongtyInput = {
    create?: XOR<ext_apiconfigCreateWithoutCongtyInput, ext_apiconfigUncheckedCreateWithoutCongtyInput> | ext_apiconfigCreateWithoutCongtyInput[] | ext_apiconfigUncheckedCreateWithoutCongtyInput[]
    connectOrCreate?: ext_apiconfigCreateOrConnectWithoutCongtyInput | ext_apiconfigCreateOrConnectWithoutCongtyInput[]
    createMany?: ext_apiconfigCreateManyCongtyInputEnvelope
    connect?: ext_apiconfigWhereUniqueInput | ext_apiconfigWhereUniqueInput[]
  }

  export type ext_listhoadonCreateNestedManyWithoutCongtyInput = {
    create?: XOR<ext_listhoadonCreateWithoutCongtyInput, ext_listhoadonUncheckedCreateWithoutCongtyInput> | ext_listhoadonCreateWithoutCongtyInput[] | ext_listhoadonUncheckedCreateWithoutCongtyInput[]
    connectOrCreate?: ext_listhoadonCreateOrConnectWithoutCongtyInput | ext_listhoadonCreateOrConnectWithoutCongtyInput[]
    createMany?: ext_listhoadonCreateManyCongtyInputEnvelope
    connect?: ext_listhoadonWhereUniqueInput | ext_listhoadonWhereUniqueInput[]
  }

  export type ext_synclogCreateNestedManyWithoutCongtyInput = {
    create?: XOR<ext_synclogCreateWithoutCongtyInput, ext_synclogUncheckedCreateWithoutCongtyInput> | ext_synclogCreateWithoutCongtyInput[] | ext_synclogUncheckedCreateWithoutCongtyInput[]
    connectOrCreate?: ext_synclogCreateOrConnectWithoutCongtyInput | ext_synclogCreateOrConnectWithoutCongtyInput[]
    createMany?: ext_synclogCreateManyCongtyInputEnvelope
    connect?: ext_synclogWhereUniqueInput | ext_synclogWhereUniqueInput[]
  }

  export type ext_apiconfigUncheckedCreateNestedManyWithoutCongtyInput = {
    create?: XOR<ext_apiconfigCreateWithoutCongtyInput, ext_apiconfigUncheckedCreateWithoutCongtyInput> | ext_apiconfigCreateWithoutCongtyInput[] | ext_apiconfigUncheckedCreateWithoutCongtyInput[]
    connectOrCreate?: ext_apiconfigCreateOrConnectWithoutCongtyInput | ext_apiconfigCreateOrConnectWithoutCongtyInput[]
    createMany?: ext_apiconfigCreateManyCongtyInputEnvelope
    connect?: ext_apiconfigWhereUniqueInput | ext_apiconfigWhereUniqueInput[]
  }

  export type ext_listhoadonUncheckedCreateNestedManyWithoutCongtyInput = {
    create?: XOR<ext_listhoadonCreateWithoutCongtyInput, ext_listhoadonUncheckedCreateWithoutCongtyInput> | ext_listhoadonCreateWithoutCongtyInput[] | ext_listhoadonUncheckedCreateWithoutCongtyInput[]
    connectOrCreate?: ext_listhoadonCreateOrConnectWithoutCongtyInput | ext_listhoadonCreateOrConnectWithoutCongtyInput[]
    createMany?: ext_listhoadonCreateManyCongtyInputEnvelope
    connect?: ext_listhoadonWhereUniqueInput | ext_listhoadonWhereUniqueInput[]
  }

  export type ext_synclogUncheckedCreateNestedManyWithoutCongtyInput = {
    create?: XOR<ext_synclogCreateWithoutCongtyInput, ext_synclogUncheckedCreateWithoutCongtyInput> | ext_synclogCreateWithoutCongtyInput[] | ext_synclogUncheckedCreateWithoutCongtyInput[]
    connectOrCreate?: ext_synclogCreateOrConnectWithoutCongtyInput | ext_synclogCreateOrConnectWithoutCongtyInput[]
    createMany?: ext_synclogCreateManyCongtyInputEnvelope
    connect?: ext_synclogWhereUniqueInput | ext_synclogWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type ext_apiconfigUpdateManyWithoutCongtyNestedInput = {
    create?: XOR<ext_apiconfigCreateWithoutCongtyInput, ext_apiconfigUncheckedCreateWithoutCongtyInput> | ext_apiconfigCreateWithoutCongtyInput[] | ext_apiconfigUncheckedCreateWithoutCongtyInput[]
    connectOrCreate?: ext_apiconfigCreateOrConnectWithoutCongtyInput | ext_apiconfigCreateOrConnectWithoutCongtyInput[]
    upsert?: ext_apiconfigUpsertWithWhereUniqueWithoutCongtyInput | ext_apiconfigUpsertWithWhereUniqueWithoutCongtyInput[]
    createMany?: ext_apiconfigCreateManyCongtyInputEnvelope
    set?: ext_apiconfigWhereUniqueInput | ext_apiconfigWhereUniqueInput[]
    disconnect?: ext_apiconfigWhereUniqueInput | ext_apiconfigWhereUniqueInput[]
    delete?: ext_apiconfigWhereUniqueInput | ext_apiconfigWhereUniqueInput[]
    connect?: ext_apiconfigWhereUniqueInput | ext_apiconfigWhereUniqueInput[]
    update?: ext_apiconfigUpdateWithWhereUniqueWithoutCongtyInput | ext_apiconfigUpdateWithWhereUniqueWithoutCongtyInput[]
    updateMany?: ext_apiconfigUpdateManyWithWhereWithoutCongtyInput | ext_apiconfigUpdateManyWithWhereWithoutCongtyInput[]
    deleteMany?: ext_apiconfigScalarWhereInput | ext_apiconfigScalarWhereInput[]
  }

  export type ext_listhoadonUpdateManyWithoutCongtyNestedInput = {
    create?: XOR<ext_listhoadonCreateWithoutCongtyInput, ext_listhoadonUncheckedCreateWithoutCongtyInput> | ext_listhoadonCreateWithoutCongtyInput[] | ext_listhoadonUncheckedCreateWithoutCongtyInput[]
    connectOrCreate?: ext_listhoadonCreateOrConnectWithoutCongtyInput | ext_listhoadonCreateOrConnectWithoutCongtyInput[]
    upsert?: ext_listhoadonUpsertWithWhereUniqueWithoutCongtyInput | ext_listhoadonUpsertWithWhereUniqueWithoutCongtyInput[]
    createMany?: ext_listhoadonCreateManyCongtyInputEnvelope
    set?: ext_listhoadonWhereUniqueInput | ext_listhoadonWhereUniqueInput[]
    disconnect?: ext_listhoadonWhereUniqueInput | ext_listhoadonWhereUniqueInput[]
    delete?: ext_listhoadonWhereUniqueInput | ext_listhoadonWhereUniqueInput[]
    connect?: ext_listhoadonWhereUniqueInput | ext_listhoadonWhereUniqueInput[]
    update?: ext_listhoadonUpdateWithWhereUniqueWithoutCongtyInput | ext_listhoadonUpdateWithWhereUniqueWithoutCongtyInput[]
    updateMany?: ext_listhoadonUpdateManyWithWhereWithoutCongtyInput | ext_listhoadonUpdateManyWithWhereWithoutCongtyInput[]
    deleteMany?: ext_listhoadonScalarWhereInput | ext_listhoadonScalarWhereInput[]
  }

  export type ext_synclogUpdateManyWithoutCongtyNestedInput = {
    create?: XOR<ext_synclogCreateWithoutCongtyInput, ext_synclogUncheckedCreateWithoutCongtyInput> | ext_synclogCreateWithoutCongtyInput[] | ext_synclogUncheckedCreateWithoutCongtyInput[]
    connectOrCreate?: ext_synclogCreateOrConnectWithoutCongtyInput | ext_synclogCreateOrConnectWithoutCongtyInput[]
    upsert?: ext_synclogUpsertWithWhereUniqueWithoutCongtyInput | ext_synclogUpsertWithWhereUniqueWithoutCongtyInput[]
    createMany?: ext_synclogCreateManyCongtyInputEnvelope
    set?: ext_synclogWhereUniqueInput | ext_synclogWhereUniqueInput[]
    disconnect?: ext_synclogWhereUniqueInput | ext_synclogWhereUniqueInput[]
    delete?: ext_synclogWhereUniqueInput | ext_synclogWhereUniqueInput[]
    connect?: ext_synclogWhereUniqueInput | ext_synclogWhereUniqueInput[]
    update?: ext_synclogUpdateWithWhereUniqueWithoutCongtyInput | ext_synclogUpdateWithWhereUniqueWithoutCongtyInput[]
    updateMany?: ext_synclogUpdateManyWithWhereWithoutCongtyInput | ext_synclogUpdateManyWithWhereWithoutCongtyInput[]
    deleteMany?: ext_synclogScalarWhereInput | ext_synclogScalarWhereInput[]
  }

  export type ext_apiconfigUncheckedUpdateManyWithoutCongtyNestedInput = {
    create?: XOR<ext_apiconfigCreateWithoutCongtyInput, ext_apiconfigUncheckedCreateWithoutCongtyInput> | ext_apiconfigCreateWithoutCongtyInput[] | ext_apiconfigUncheckedCreateWithoutCongtyInput[]
    connectOrCreate?: ext_apiconfigCreateOrConnectWithoutCongtyInput | ext_apiconfigCreateOrConnectWithoutCongtyInput[]
    upsert?: ext_apiconfigUpsertWithWhereUniqueWithoutCongtyInput | ext_apiconfigUpsertWithWhereUniqueWithoutCongtyInput[]
    createMany?: ext_apiconfigCreateManyCongtyInputEnvelope
    set?: ext_apiconfigWhereUniqueInput | ext_apiconfigWhereUniqueInput[]
    disconnect?: ext_apiconfigWhereUniqueInput | ext_apiconfigWhereUniqueInput[]
    delete?: ext_apiconfigWhereUniqueInput | ext_apiconfigWhereUniqueInput[]
    connect?: ext_apiconfigWhereUniqueInput | ext_apiconfigWhereUniqueInput[]
    update?: ext_apiconfigUpdateWithWhereUniqueWithoutCongtyInput | ext_apiconfigUpdateWithWhereUniqueWithoutCongtyInput[]
    updateMany?: ext_apiconfigUpdateManyWithWhereWithoutCongtyInput | ext_apiconfigUpdateManyWithWhereWithoutCongtyInput[]
    deleteMany?: ext_apiconfigScalarWhereInput | ext_apiconfigScalarWhereInput[]
  }

  export type ext_listhoadonUncheckedUpdateManyWithoutCongtyNestedInput = {
    create?: XOR<ext_listhoadonCreateWithoutCongtyInput, ext_listhoadonUncheckedCreateWithoutCongtyInput> | ext_listhoadonCreateWithoutCongtyInput[] | ext_listhoadonUncheckedCreateWithoutCongtyInput[]
    connectOrCreate?: ext_listhoadonCreateOrConnectWithoutCongtyInput | ext_listhoadonCreateOrConnectWithoutCongtyInput[]
    upsert?: ext_listhoadonUpsertWithWhereUniqueWithoutCongtyInput | ext_listhoadonUpsertWithWhereUniqueWithoutCongtyInput[]
    createMany?: ext_listhoadonCreateManyCongtyInputEnvelope
    set?: ext_listhoadonWhereUniqueInput | ext_listhoadonWhereUniqueInput[]
    disconnect?: ext_listhoadonWhereUniqueInput | ext_listhoadonWhereUniqueInput[]
    delete?: ext_listhoadonWhereUniqueInput | ext_listhoadonWhereUniqueInput[]
    connect?: ext_listhoadonWhereUniqueInput | ext_listhoadonWhereUniqueInput[]
    update?: ext_listhoadonUpdateWithWhereUniqueWithoutCongtyInput | ext_listhoadonUpdateWithWhereUniqueWithoutCongtyInput[]
    updateMany?: ext_listhoadonUpdateManyWithWhereWithoutCongtyInput | ext_listhoadonUpdateManyWithWhereWithoutCongtyInput[]
    deleteMany?: ext_listhoadonScalarWhereInput | ext_listhoadonScalarWhereInput[]
  }

  export type ext_synclogUncheckedUpdateManyWithoutCongtyNestedInput = {
    create?: XOR<ext_synclogCreateWithoutCongtyInput, ext_synclogUncheckedCreateWithoutCongtyInput> | ext_synclogCreateWithoutCongtyInput[] | ext_synclogUncheckedCreateWithoutCongtyInput[]
    connectOrCreate?: ext_synclogCreateOrConnectWithoutCongtyInput | ext_synclogCreateOrConnectWithoutCongtyInput[]
    upsert?: ext_synclogUpsertWithWhereUniqueWithoutCongtyInput | ext_synclogUpsertWithWhereUniqueWithoutCongtyInput[]
    createMany?: ext_synclogCreateManyCongtyInputEnvelope
    set?: ext_synclogWhereUniqueInput | ext_synclogWhereUniqueInput[]
    disconnect?: ext_synclogWhereUniqueInput | ext_synclogWhereUniqueInput[]
    delete?: ext_synclogWhereUniqueInput | ext_synclogWhereUniqueInput[]
    connect?: ext_synclogWhereUniqueInput | ext_synclogWhereUniqueInput[]
    update?: ext_synclogUpdateWithWhereUniqueWithoutCongtyInput | ext_synclogUpdateWithWhereUniqueWithoutCongtyInput[]
    updateMany?: ext_synclogUpdateManyWithWhereWithoutCongtyInput | ext_synclogUpdateManyWithWhereWithoutCongtyInput[]
    deleteMany?: ext_synclogScalarWhereInput | ext_synclogScalarWhereInput[]
  }

  export type ext_congtyCreateNestedOneWithoutHoadonsInput = {
    create?: XOR<ext_congtyCreateWithoutHoadonsInput, ext_congtyUncheckedCreateWithoutHoadonsInput>
    connectOrCreate?: ext_congtyCreateOrConnectWithoutHoadonsInput
    connect?: ext_congtyWhereUniqueInput
  }

  export type ext_detailhoadonCreateNestedManyWithoutInvoiceInput = {
    create?: XOR<ext_detailhoadonCreateWithoutInvoiceInput, ext_detailhoadonUncheckedCreateWithoutInvoiceInput> | ext_detailhoadonCreateWithoutInvoiceInput[] | ext_detailhoadonUncheckedCreateWithoutInvoiceInput[]
    connectOrCreate?: ext_detailhoadonCreateOrConnectWithoutInvoiceInput | ext_detailhoadonCreateOrConnectWithoutInvoiceInput[]
    createMany?: ext_detailhoadonCreateManyInvoiceInputEnvelope
    connect?: ext_detailhoadonWhereUniqueInput | ext_detailhoadonWhereUniqueInput[]
  }

  export type ext_detailhoadonUncheckedCreateNestedManyWithoutInvoiceInput = {
    create?: XOR<ext_detailhoadonCreateWithoutInvoiceInput, ext_detailhoadonUncheckedCreateWithoutInvoiceInput> | ext_detailhoadonCreateWithoutInvoiceInput[] | ext_detailhoadonUncheckedCreateWithoutInvoiceInput[]
    connectOrCreate?: ext_detailhoadonCreateOrConnectWithoutInvoiceInput | ext_detailhoadonCreateOrConnectWithoutInvoiceInput[]
    createMany?: ext_detailhoadonCreateManyInvoiceInputEnvelope
    connect?: ext_detailhoadonWhereUniqueInput | ext_detailhoadonWhereUniqueInput[]
  }

  export type DecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type ext_congtyUpdateOneWithoutHoadonsNestedInput = {
    create?: XOR<ext_congtyCreateWithoutHoadonsInput, ext_congtyUncheckedCreateWithoutHoadonsInput>
    connectOrCreate?: ext_congtyCreateOrConnectWithoutHoadonsInput
    upsert?: ext_congtyUpsertWithoutHoadonsInput
    disconnect?: ext_congtyWhereInput | boolean
    delete?: ext_congtyWhereInput | boolean
    connect?: ext_congtyWhereUniqueInput
    update?: XOR<XOR<ext_congtyUpdateToOneWithWhereWithoutHoadonsInput, ext_congtyUpdateWithoutHoadonsInput>, ext_congtyUncheckedUpdateWithoutHoadonsInput>
  }

  export type ext_detailhoadonUpdateManyWithoutInvoiceNestedInput = {
    create?: XOR<ext_detailhoadonCreateWithoutInvoiceInput, ext_detailhoadonUncheckedCreateWithoutInvoiceInput> | ext_detailhoadonCreateWithoutInvoiceInput[] | ext_detailhoadonUncheckedCreateWithoutInvoiceInput[]
    connectOrCreate?: ext_detailhoadonCreateOrConnectWithoutInvoiceInput | ext_detailhoadonCreateOrConnectWithoutInvoiceInput[]
    upsert?: ext_detailhoadonUpsertWithWhereUniqueWithoutInvoiceInput | ext_detailhoadonUpsertWithWhereUniqueWithoutInvoiceInput[]
    createMany?: ext_detailhoadonCreateManyInvoiceInputEnvelope
    set?: ext_detailhoadonWhereUniqueInput | ext_detailhoadonWhereUniqueInput[]
    disconnect?: ext_detailhoadonWhereUniqueInput | ext_detailhoadonWhereUniqueInput[]
    delete?: ext_detailhoadonWhereUniqueInput | ext_detailhoadonWhereUniqueInput[]
    connect?: ext_detailhoadonWhereUniqueInput | ext_detailhoadonWhereUniqueInput[]
    update?: ext_detailhoadonUpdateWithWhereUniqueWithoutInvoiceInput | ext_detailhoadonUpdateWithWhereUniqueWithoutInvoiceInput[]
    updateMany?: ext_detailhoadonUpdateManyWithWhereWithoutInvoiceInput | ext_detailhoadonUpdateManyWithWhereWithoutInvoiceInput[]
    deleteMany?: ext_detailhoadonScalarWhereInput | ext_detailhoadonScalarWhereInput[]
  }

  export type ext_detailhoadonUncheckedUpdateManyWithoutInvoiceNestedInput = {
    create?: XOR<ext_detailhoadonCreateWithoutInvoiceInput, ext_detailhoadonUncheckedCreateWithoutInvoiceInput> | ext_detailhoadonCreateWithoutInvoiceInput[] | ext_detailhoadonUncheckedCreateWithoutInvoiceInput[]
    connectOrCreate?: ext_detailhoadonCreateOrConnectWithoutInvoiceInput | ext_detailhoadonCreateOrConnectWithoutInvoiceInput[]
    upsert?: ext_detailhoadonUpsertWithWhereUniqueWithoutInvoiceInput | ext_detailhoadonUpsertWithWhereUniqueWithoutInvoiceInput[]
    createMany?: ext_detailhoadonCreateManyInvoiceInputEnvelope
    set?: ext_detailhoadonWhereUniqueInput | ext_detailhoadonWhereUniqueInput[]
    disconnect?: ext_detailhoadonWhereUniqueInput | ext_detailhoadonWhereUniqueInput[]
    delete?: ext_detailhoadonWhereUniqueInput | ext_detailhoadonWhereUniqueInput[]
    connect?: ext_detailhoadonWhereUniqueInput | ext_detailhoadonWhereUniqueInput[]
    update?: ext_detailhoadonUpdateWithWhereUniqueWithoutInvoiceInput | ext_detailhoadonUpdateWithWhereUniqueWithoutInvoiceInput[]
    updateMany?: ext_detailhoadonUpdateManyWithWhereWithoutInvoiceInput | ext_detailhoadonUpdateManyWithWhereWithoutInvoiceInput[]
    deleteMany?: ext_detailhoadonScalarWhereInput | ext_detailhoadonScalarWhereInput[]
  }

  export type ext_listhoadonCreateNestedOneWithoutDetailsInput = {
    create?: XOR<ext_listhoadonCreateWithoutDetailsInput, ext_listhoadonUncheckedCreateWithoutDetailsInput>
    connectOrCreate?: ext_listhoadonCreateOrConnectWithoutDetailsInput
    connect?: ext_listhoadonWhereUniqueInput
  }

  export type ext_sanphamhoadonCreateNestedManyWithoutDetailInput = {
    create?: XOR<ext_sanphamhoadonCreateWithoutDetailInput, ext_sanphamhoadonUncheckedCreateWithoutDetailInput> | ext_sanphamhoadonCreateWithoutDetailInput[] | ext_sanphamhoadonUncheckedCreateWithoutDetailInput[]
    connectOrCreate?: ext_sanphamhoadonCreateOrConnectWithoutDetailInput | ext_sanphamhoadonCreateOrConnectWithoutDetailInput[]
    createMany?: ext_sanphamhoadonCreateManyDetailInputEnvelope
    connect?: ext_sanphamhoadonWhereUniqueInput | ext_sanphamhoadonWhereUniqueInput[]
  }

  export type ext_sanphamhoadonUncheckedCreateNestedManyWithoutDetailInput = {
    create?: XOR<ext_sanphamhoadonCreateWithoutDetailInput, ext_sanphamhoadonUncheckedCreateWithoutDetailInput> | ext_sanphamhoadonCreateWithoutDetailInput[] | ext_sanphamhoadonUncheckedCreateWithoutDetailInput[]
    connectOrCreate?: ext_sanphamhoadonCreateOrConnectWithoutDetailInput | ext_sanphamhoadonCreateOrConnectWithoutDetailInput[]
    createMany?: ext_sanphamhoadonCreateManyDetailInputEnvelope
    connect?: ext_sanphamhoadonWhereUniqueInput | ext_sanphamhoadonWhereUniqueInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type ext_listhoadonUpdateOneRequiredWithoutDetailsNestedInput = {
    create?: XOR<ext_listhoadonCreateWithoutDetailsInput, ext_listhoadonUncheckedCreateWithoutDetailsInput>
    connectOrCreate?: ext_listhoadonCreateOrConnectWithoutDetailsInput
    upsert?: ext_listhoadonUpsertWithoutDetailsInput
    connect?: ext_listhoadonWhereUniqueInput
    update?: XOR<XOR<ext_listhoadonUpdateToOneWithWhereWithoutDetailsInput, ext_listhoadonUpdateWithoutDetailsInput>, ext_listhoadonUncheckedUpdateWithoutDetailsInput>
  }

  export type ext_sanphamhoadonUpdateManyWithoutDetailNestedInput = {
    create?: XOR<ext_sanphamhoadonCreateWithoutDetailInput, ext_sanphamhoadonUncheckedCreateWithoutDetailInput> | ext_sanphamhoadonCreateWithoutDetailInput[] | ext_sanphamhoadonUncheckedCreateWithoutDetailInput[]
    connectOrCreate?: ext_sanphamhoadonCreateOrConnectWithoutDetailInput | ext_sanphamhoadonCreateOrConnectWithoutDetailInput[]
    upsert?: ext_sanphamhoadonUpsertWithWhereUniqueWithoutDetailInput | ext_sanphamhoadonUpsertWithWhereUniqueWithoutDetailInput[]
    createMany?: ext_sanphamhoadonCreateManyDetailInputEnvelope
    set?: ext_sanphamhoadonWhereUniqueInput | ext_sanphamhoadonWhereUniqueInput[]
    disconnect?: ext_sanphamhoadonWhereUniqueInput | ext_sanphamhoadonWhereUniqueInput[]
    delete?: ext_sanphamhoadonWhereUniqueInput | ext_sanphamhoadonWhereUniqueInput[]
    connect?: ext_sanphamhoadonWhereUniqueInput | ext_sanphamhoadonWhereUniqueInput[]
    update?: ext_sanphamhoadonUpdateWithWhereUniqueWithoutDetailInput | ext_sanphamhoadonUpdateWithWhereUniqueWithoutDetailInput[]
    updateMany?: ext_sanphamhoadonUpdateManyWithWhereWithoutDetailInput | ext_sanphamhoadonUpdateManyWithWhereWithoutDetailInput[]
    deleteMany?: ext_sanphamhoadonScalarWhereInput | ext_sanphamhoadonScalarWhereInput[]
  }

  export type ext_sanphamhoadonUncheckedUpdateManyWithoutDetailNestedInput = {
    create?: XOR<ext_sanphamhoadonCreateWithoutDetailInput, ext_sanphamhoadonUncheckedCreateWithoutDetailInput> | ext_sanphamhoadonCreateWithoutDetailInput[] | ext_sanphamhoadonUncheckedCreateWithoutDetailInput[]
    connectOrCreate?: ext_sanphamhoadonCreateOrConnectWithoutDetailInput | ext_sanphamhoadonCreateOrConnectWithoutDetailInput[]
    upsert?: ext_sanphamhoadonUpsertWithWhereUniqueWithoutDetailInput | ext_sanphamhoadonUpsertWithWhereUniqueWithoutDetailInput[]
    createMany?: ext_sanphamhoadonCreateManyDetailInputEnvelope
    set?: ext_sanphamhoadonWhereUniqueInput | ext_sanphamhoadonWhereUniqueInput[]
    disconnect?: ext_sanphamhoadonWhereUniqueInput | ext_sanphamhoadonWhereUniqueInput[]
    delete?: ext_sanphamhoadonWhereUniqueInput | ext_sanphamhoadonWhereUniqueInput[]
    connect?: ext_sanphamhoadonWhereUniqueInput | ext_sanphamhoadonWhereUniqueInput[]
    update?: ext_sanphamhoadonUpdateWithWhereUniqueWithoutDetailInput | ext_sanphamhoadonUpdateWithWhereUniqueWithoutDetailInput[]
    updateMany?: ext_sanphamhoadonUpdateManyWithWhereWithoutDetailInput | ext_sanphamhoadonUpdateManyWithWhereWithoutDetailInput[]
    deleteMany?: ext_sanphamhoadonScalarWhereInput | ext_sanphamhoadonScalarWhereInput[]
  }

  export type ext_detailhoadonCreateNestedOneWithoutProductsInput = {
    create?: XOR<ext_detailhoadonCreateWithoutProductsInput, ext_detailhoadonUncheckedCreateWithoutProductsInput>
    connectOrCreate?: ext_detailhoadonCreateOrConnectWithoutProductsInput
    connect?: ext_detailhoadonWhereUniqueInput
  }

  export type ext_detailhoadonUpdateOneRequiredWithoutProductsNestedInput = {
    create?: XOR<ext_detailhoadonCreateWithoutProductsInput, ext_detailhoadonUncheckedCreateWithoutProductsInput>
    connectOrCreate?: ext_detailhoadonCreateOrConnectWithoutProductsInput
    upsert?: ext_detailhoadonUpsertWithoutProductsInput
    connect?: ext_detailhoadonWhereUniqueInput
    update?: XOR<XOR<ext_detailhoadonUpdateToOneWithWhereWithoutProductsInput, ext_detailhoadonUpdateWithoutProductsInput>, ext_detailhoadonUncheckedUpdateWithoutProductsInput>
  }

  export type ext_congtyCreateNestedOneWithoutApiConfigsInput = {
    create?: XOR<ext_congtyCreateWithoutApiConfigsInput, ext_congtyUncheckedCreateWithoutApiConfigsInput>
    connectOrCreate?: ext_congtyCreateOrConnectWithoutApiConfigsInput
    connect?: ext_congtyWhereUniqueInput
  }

  export type ext_synclogCreateNestedManyWithoutConfigInput = {
    create?: XOR<ext_synclogCreateWithoutConfigInput, ext_synclogUncheckedCreateWithoutConfigInput> | ext_synclogCreateWithoutConfigInput[] | ext_synclogUncheckedCreateWithoutConfigInput[]
    connectOrCreate?: ext_synclogCreateOrConnectWithoutConfigInput | ext_synclogCreateOrConnectWithoutConfigInput[]
    createMany?: ext_synclogCreateManyConfigInputEnvelope
    connect?: ext_synclogWhereUniqueInput | ext_synclogWhereUniqueInput[]
  }

  export type ext_synclogUncheckedCreateNestedManyWithoutConfigInput = {
    create?: XOR<ext_synclogCreateWithoutConfigInput, ext_synclogUncheckedCreateWithoutConfigInput> | ext_synclogCreateWithoutConfigInput[] | ext_synclogUncheckedCreateWithoutConfigInput[]
    connectOrCreate?: ext_synclogCreateOrConnectWithoutConfigInput | ext_synclogCreateOrConnectWithoutConfigInput[]
    createMany?: ext_synclogCreateManyConfigInputEnvelope
    connect?: ext_synclogWhereUniqueInput | ext_synclogWhereUniqueInput[]
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type ext_congtyUpdateOneRequiredWithoutApiConfigsNestedInput = {
    create?: XOR<ext_congtyCreateWithoutApiConfigsInput, ext_congtyUncheckedCreateWithoutApiConfigsInput>
    connectOrCreate?: ext_congtyCreateOrConnectWithoutApiConfigsInput
    upsert?: ext_congtyUpsertWithoutApiConfigsInput
    connect?: ext_congtyWhereUniqueInput
    update?: XOR<XOR<ext_congtyUpdateToOneWithWhereWithoutApiConfigsInput, ext_congtyUpdateWithoutApiConfigsInput>, ext_congtyUncheckedUpdateWithoutApiConfigsInput>
  }

  export type ext_synclogUpdateManyWithoutConfigNestedInput = {
    create?: XOR<ext_synclogCreateWithoutConfigInput, ext_synclogUncheckedCreateWithoutConfigInput> | ext_synclogCreateWithoutConfigInput[] | ext_synclogUncheckedCreateWithoutConfigInput[]
    connectOrCreate?: ext_synclogCreateOrConnectWithoutConfigInput | ext_synclogCreateOrConnectWithoutConfigInput[]
    upsert?: ext_synclogUpsertWithWhereUniqueWithoutConfigInput | ext_synclogUpsertWithWhereUniqueWithoutConfigInput[]
    createMany?: ext_synclogCreateManyConfigInputEnvelope
    set?: ext_synclogWhereUniqueInput | ext_synclogWhereUniqueInput[]
    disconnect?: ext_synclogWhereUniqueInput | ext_synclogWhereUniqueInput[]
    delete?: ext_synclogWhereUniqueInput | ext_synclogWhereUniqueInput[]
    connect?: ext_synclogWhereUniqueInput | ext_synclogWhereUniqueInput[]
    update?: ext_synclogUpdateWithWhereUniqueWithoutConfigInput | ext_synclogUpdateWithWhereUniqueWithoutConfigInput[]
    updateMany?: ext_synclogUpdateManyWithWhereWithoutConfigInput | ext_synclogUpdateManyWithWhereWithoutConfigInput[]
    deleteMany?: ext_synclogScalarWhereInput | ext_synclogScalarWhereInput[]
  }

  export type ext_synclogUncheckedUpdateManyWithoutConfigNestedInput = {
    create?: XOR<ext_synclogCreateWithoutConfigInput, ext_synclogUncheckedCreateWithoutConfigInput> | ext_synclogCreateWithoutConfigInput[] | ext_synclogUncheckedCreateWithoutConfigInput[]
    connectOrCreate?: ext_synclogCreateOrConnectWithoutConfigInput | ext_synclogCreateOrConnectWithoutConfigInput[]
    upsert?: ext_synclogUpsertWithWhereUniqueWithoutConfigInput | ext_synclogUpsertWithWhereUniqueWithoutConfigInput[]
    createMany?: ext_synclogCreateManyConfigInputEnvelope
    set?: ext_synclogWhereUniqueInput | ext_synclogWhereUniqueInput[]
    disconnect?: ext_synclogWhereUniqueInput | ext_synclogWhereUniqueInput[]
    delete?: ext_synclogWhereUniqueInput | ext_synclogWhereUniqueInput[]
    connect?: ext_synclogWhereUniqueInput | ext_synclogWhereUniqueInput[]
    update?: ext_synclogUpdateWithWhereUniqueWithoutConfigInput | ext_synclogUpdateWithWhereUniqueWithoutConfigInput[]
    updateMany?: ext_synclogUpdateManyWithWhereWithoutConfigInput | ext_synclogUpdateManyWithWhereWithoutConfigInput[]
    deleteMany?: ext_synclogScalarWhereInput | ext_synclogScalarWhereInput[]
  }

  export type ext_congtyCreateNestedOneWithoutSynclogsInput = {
    create?: XOR<ext_congtyCreateWithoutSynclogsInput, ext_congtyUncheckedCreateWithoutSynclogsInput>
    connectOrCreate?: ext_congtyCreateOrConnectWithoutSynclogsInput
    connect?: ext_congtyWhereUniqueInput
  }

  export type ext_apiconfigCreateNestedOneWithoutSynclogsInput = {
    create?: XOR<ext_apiconfigCreateWithoutSynclogsInput, ext_apiconfigUncheckedCreateWithoutSynclogsInput>
    connectOrCreate?: ext_apiconfigCreateOrConnectWithoutSynclogsInput
    connect?: ext_apiconfigWhereUniqueInput
  }

  export type ext_congtyUpdateOneWithoutSynclogsNestedInput = {
    create?: XOR<ext_congtyCreateWithoutSynclogsInput, ext_congtyUncheckedCreateWithoutSynclogsInput>
    connectOrCreate?: ext_congtyCreateOrConnectWithoutSynclogsInput
    upsert?: ext_congtyUpsertWithoutSynclogsInput
    disconnect?: ext_congtyWhereInput | boolean
    delete?: ext_congtyWhereInput | boolean
    connect?: ext_congtyWhereUniqueInput
    update?: XOR<XOR<ext_congtyUpdateToOneWithWhereWithoutSynclogsInput, ext_congtyUpdateWithoutSynclogsInput>, ext_congtyUncheckedUpdateWithoutSynclogsInput>
  }

  export type ext_apiconfigUpdateOneWithoutSynclogsNestedInput = {
    create?: XOR<ext_apiconfigCreateWithoutSynclogsInput, ext_apiconfigUncheckedCreateWithoutSynclogsInput>
    connectOrCreate?: ext_apiconfigCreateOrConnectWithoutSynclogsInput
    upsert?: ext_apiconfigUpsertWithoutSynclogsInput
    disconnect?: ext_apiconfigWhereInput | boolean
    delete?: ext_apiconfigWhereInput | boolean
    connect?: ext_apiconfigWhereUniqueInput
    update?: XOR<XOR<ext_apiconfigUpdateToOneWithWhereWithoutSynclogsInput, ext_apiconfigUpdateWithoutSynclogsInput>, ext_apiconfigUncheckedUpdateWithoutSynclogsInput>
  }

  export type ext_tonghopCreatetagsInput = {
    set: string[]
  }

  export type ext_tonghopUpdatetagsInput = {
    set?: string[]
    push?: string | string[]
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

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
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

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
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

  export type NestedDecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type NestedDecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type ext_apiconfigCreateWithoutCongtyInput = {
    id?: string
    name: string
    bearerToken: string
    baseUrl?: string
    brandname?: string | null
    batchSize?: number
    delayBetweenBatches?: number
    delayBetweenDetailCalls?: number
    maxRetries?: number
    lastSyncAt?: Date | string | null
    lastSyncStatus?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    synclogs?: ext_synclogCreateNestedManyWithoutConfigInput
  }

  export type ext_apiconfigUncheckedCreateWithoutCongtyInput = {
    id?: string
    name: string
    bearerToken: string
    baseUrl?: string
    brandname?: string | null
    batchSize?: number
    delayBetweenBatches?: number
    delayBetweenDetailCalls?: number
    maxRetries?: number
    lastSyncAt?: Date | string | null
    lastSyncStatus?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    synclogs?: ext_synclogUncheckedCreateNestedManyWithoutConfigInput
  }

  export type ext_apiconfigCreateOrConnectWithoutCongtyInput = {
    where: ext_apiconfigWhereUniqueInput
    create: XOR<ext_apiconfigCreateWithoutCongtyInput, ext_apiconfigUncheckedCreateWithoutCongtyInput>
  }

  export type ext_apiconfigCreateManyCongtyInputEnvelope = {
    data: ext_apiconfigCreateManyCongtyInput | ext_apiconfigCreateManyCongtyInput[]
    skipDuplicates?: boolean
  }

  export type ext_listhoadonCreateWithoutCongtyInput = {
    id?: string
    idServer: string
    brandname?: string | null
    nbmst: string
    nbten?: string | null
    nbdchi?: string | null
    nmmst?: string | null
    nmten?: string | null
    nmdchi?: string | null
    khmshdon: string
    khhdon: string
    shdon: string
    mhso?: string | null
    tgtcthue?: Decimal | DecimalJsLike | number | string
    tgtthue?: Decimal | DecimalJsLike | number | string
    tgtttbso?: Decimal | DecimalJsLike | number | string
    tdlap: Date | string
    tthai?: string | null
    loaihd?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    details?: ext_detailhoadonCreateNestedManyWithoutInvoiceInput
  }

  export type ext_listhoadonUncheckedCreateWithoutCongtyInput = {
    id?: string
    idServer: string
    brandname?: string | null
    nbmst: string
    nbten?: string | null
    nbdchi?: string | null
    nmmst?: string | null
    nmten?: string | null
    nmdchi?: string | null
    khmshdon: string
    khhdon: string
    shdon: string
    mhso?: string | null
    tgtcthue?: Decimal | DecimalJsLike | number | string
    tgtthue?: Decimal | DecimalJsLike | number | string
    tgtttbso?: Decimal | DecimalJsLike | number | string
    tdlap: Date | string
    tthai?: string | null
    loaihd?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    details?: ext_detailhoadonUncheckedCreateNestedManyWithoutInvoiceInput
  }

  export type ext_listhoadonCreateOrConnectWithoutCongtyInput = {
    where: ext_listhoadonWhereUniqueInput
    create: XOR<ext_listhoadonCreateWithoutCongtyInput, ext_listhoadonUncheckedCreateWithoutCongtyInput>
  }

  export type ext_listhoadonCreateManyCongtyInputEnvelope = {
    data: ext_listhoadonCreateManyCongtyInput | ext_listhoadonCreateManyCongtyInput[]
    skipDuplicates?: boolean
  }

  export type ext_synclogCreateWithoutCongtyInput = {
    id?: string
    syncType: string
    fromDate?: Date | string | null
    toDate?: Date | string | null
    totalRecords?: number
    successCount?: number
    errorCount?: number
    status?: string
    errorMessage?: string | null
    startedAt?: Date | string
    completedAt?: Date | string | null
    createdAt?: Date | string
    config?: ext_apiconfigCreateNestedOneWithoutSynclogsInput
  }

  export type ext_synclogUncheckedCreateWithoutCongtyInput = {
    id?: string
    configId?: string | null
    syncType: string
    fromDate?: Date | string | null
    toDate?: Date | string | null
    totalRecords?: number
    successCount?: number
    errorCount?: number
    status?: string
    errorMessage?: string | null
    startedAt?: Date | string
    completedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type ext_synclogCreateOrConnectWithoutCongtyInput = {
    where: ext_synclogWhereUniqueInput
    create: XOR<ext_synclogCreateWithoutCongtyInput, ext_synclogUncheckedCreateWithoutCongtyInput>
  }

  export type ext_synclogCreateManyCongtyInputEnvelope = {
    data: ext_synclogCreateManyCongtyInput | ext_synclogCreateManyCongtyInput[]
    skipDuplicates?: boolean
  }

  export type ext_apiconfigUpsertWithWhereUniqueWithoutCongtyInput = {
    where: ext_apiconfigWhereUniqueInput
    update: XOR<ext_apiconfigUpdateWithoutCongtyInput, ext_apiconfigUncheckedUpdateWithoutCongtyInput>
    create: XOR<ext_apiconfigCreateWithoutCongtyInput, ext_apiconfigUncheckedCreateWithoutCongtyInput>
  }

  export type ext_apiconfigUpdateWithWhereUniqueWithoutCongtyInput = {
    where: ext_apiconfigWhereUniqueInput
    data: XOR<ext_apiconfigUpdateWithoutCongtyInput, ext_apiconfigUncheckedUpdateWithoutCongtyInput>
  }

  export type ext_apiconfigUpdateManyWithWhereWithoutCongtyInput = {
    where: ext_apiconfigScalarWhereInput
    data: XOR<ext_apiconfigUpdateManyMutationInput, ext_apiconfigUncheckedUpdateManyWithoutCongtyInput>
  }

  export type ext_apiconfigScalarWhereInput = {
    AND?: ext_apiconfigScalarWhereInput | ext_apiconfigScalarWhereInput[]
    OR?: ext_apiconfigScalarWhereInput[]
    NOT?: ext_apiconfigScalarWhereInput | ext_apiconfigScalarWhereInput[]
    id?: StringFilter<"ext_apiconfig"> | string
    name?: StringFilter<"ext_apiconfig"> | string
    congtyId?: StringFilter<"ext_apiconfig"> | string
    bearerToken?: StringFilter<"ext_apiconfig"> | string
    baseUrl?: StringFilter<"ext_apiconfig"> | string
    brandname?: StringNullableFilter<"ext_apiconfig"> | string | null
    batchSize?: IntFilter<"ext_apiconfig"> | number
    delayBetweenBatches?: IntFilter<"ext_apiconfig"> | number
    delayBetweenDetailCalls?: IntFilter<"ext_apiconfig"> | number
    maxRetries?: IntFilter<"ext_apiconfig"> | number
    lastSyncAt?: DateTimeNullableFilter<"ext_apiconfig"> | Date | string | null
    lastSyncStatus?: StringNullableFilter<"ext_apiconfig"> | string | null
    isActive?: BoolFilter<"ext_apiconfig"> | boolean
    createdAt?: DateTimeFilter<"ext_apiconfig"> | Date | string
    updatedAt?: DateTimeFilter<"ext_apiconfig"> | Date | string
  }

  export type ext_listhoadonUpsertWithWhereUniqueWithoutCongtyInput = {
    where: ext_listhoadonWhereUniqueInput
    update: XOR<ext_listhoadonUpdateWithoutCongtyInput, ext_listhoadonUncheckedUpdateWithoutCongtyInput>
    create: XOR<ext_listhoadonCreateWithoutCongtyInput, ext_listhoadonUncheckedCreateWithoutCongtyInput>
  }

  export type ext_listhoadonUpdateWithWhereUniqueWithoutCongtyInput = {
    where: ext_listhoadonWhereUniqueInput
    data: XOR<ext_listhoadonUpdateWithoutCongtyInput, ext_listhoadonUncheckedUpdateWithoutCongtyInput>
  }

  export type ext_listhoadonUpdateManyWithWhereWithoutCongtyInput = {
    where: ext_listhoadonScalarWhereInput
    data: XOR<ext_listhoadonUpdateManyMutationInput, ext_listhoadonUncheckedUpdateManyWithoutCongtyInput>
  }

  export type ext_listhoadonScalarWhereInput = {
    AND?: ext_listhoadonScalarWhereInput | ext_listhoadonScalarWhereInput[]
    OR?: ext_listhoadonScalarWhereInput[]
    NOT?: ext_listhoadonScalarWhereInput | ext_listhoadonScalarWhereInput[]
    id?: StringFilter<"ext_listhoadon"> | string
    idServer?: StringFilter<"ext_listhoadon"> | string
    brandname?: StringNullableFilter<"ext_listhoadon"> | string | null
    congtyId?: StringNullableFilter<"ext_listhoadon"> | string | null
    nbmst?: StringFilter<"ext_listhoadon"> | string
    nbten?: StringNullableFilter<"ext_listhoadon"> | string | null
    nbdchi?: StringNullableFilter<"ext_listhoadon"> | string | null
    nmmst?: StringNullableFilter<"ext_listhoadon"> | string | null
    nmten?: StringNullableFilter<"ext_listhoadon"> | string | null
    nmdchi?: StringNullableFilter<"ext_listhoadon"> | string | null
    khmshdon?: StringFilter<"ext_listhoadon"> | string
    khhdon?: StringFilter<"ext_listhoadon"> | string
    shdon?: StringFilter<"ext_listhoadon"> | string
    mhso?: StringNullableFilter<"ext_listhoadon"> | string | null
    tgtcthue?: DecimalFilter<"ext_listhoadon"> | Decimal | DecimalJsLike | number | string
    tgtthue?: DecimalFilter<"ext_listhoadon"> | Decimal | DecimalJsLike | number | string
    tgtttbso?: DecimalFilter<"ext_listhoadon"> | Decimal | DecimalJsLike | number | string
    tdlap?: DateTimeFilter<"ext_listhoadon"> | Date | string
    tthai?: StringNullableFilter<"ext_listhoadon"> | string | null
    loaihd?: StringFilter<"ext_listhoadon"> | string
    createdAt?: DateTimeFilter<"ext_listhoadon"> | Date | string
    updatedAt?: DateTimeFilter<"ext_listhoadon"> | Date | string
  }

  export type ext_synclogUpsertWithWhereUniqueWithoutCongtyInput = {
    where: ext_synclogWhereUniqueInput
    update: XOR<ext_synclogUpdateWithoutCongtyInput, ext_synclogUncheckedUpdateWithoutCongtyInput>
    create: XOR<ext_synclogCreateWithoutCongtyInput, ext_synclogUncheckedCreateWithoutCongtyInput>
  }

  export type ext_synclogUpdateWithWhereUniqueWithoutCongtyInput = {
    where: ext_synclogWhereUniqueInput
    data: XOR<ext_synclogUpdateWithoutCongtyInput, ext_synclogUncheckedUpdateWithoutCongtyInput>
  }

  export type ext_synclogUpdateManyWithWhereWithoutCongtyInput = {
    where: ext_synclogScalarWhereInput
    data: XOR<ext_synclogUpdateManyMutationInput, ext_synclogUncheckedUpdateManyWithoutCongtyInput>
  }

  export type ext_synclogScalarWhereInput = {
    AND?: ext_synclogScalarWhereInput | ext_synclogScalarWhereInput[]
    OR?: ext_synclogScalarWhereInput[]
    NOT?: ext_synclogScalarWhereInput | ext_synclogScalarWhereInput[]
    id?: StringFilter<"ext_synclog"> | string
    congtyId?: StringNullableFilter<"ext_synclog"> | string | null
    configId?: StringNullableFilter<"ext_synclog"> | string | null
    syncType?: StringFilter<"ext_synclog"> | string
    fromDate?: DateTimeNullableFilter<"ext_synclog"> | Date | string | null
    toDate?: DateTimeNullableFilter<"ext_synclog"> | Date | string | null
    totalRecords?: IntFilter<"ext_synclog"> | number
    successCount?: IntFilter<"ext_synclog"> | number
    errorCount?: IntFilter<"ext_synclog"> | number
    status?: StringFilter<"ext_synclog"> | string
    errorMessage?: StringNullableFilter<"ext_synclog"> | string | null
    startedAt?: DateTimeFilter<"ext_synclog"> | Date | string
    completedAt?: DateTimeNullableFilter<"ext_synclog"> | Date | string | null
    createdAt?: DateTimeFilter<"ext_synclog"> | Date | string
  }

  export type ext_congtyCreateWithoutHoadonsInput = {
    id?: string
    mst: string
    ten: string
    tenVietTat?: string | null
    diaChi?: string | null
    dienThoai?: string | null
    email?: string | null
    nguoiDaiDien?: string | null
    isActive?: boolean
    isDefault?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    apiConfigs?: ext_apiconfigCreateNestedManyWithoutCongtyInput
    synclogs?: ext_synclogCreateNestedManyWithoutCongtyInput
  }

  export type ext_congtyUncheckedCreateWithoutHoadonsInput = {
    id?: string
    mst: string
    ten: string
    tenVietTat?: string | null
    diaChi?: string | null
    dienThoai?: string | null
    email?: string | null
    nguoiDaiDien?: string | null
    isActive?: boolean
    isDefault?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    apiConfigs?: ext_apiconfigUncheckedCreateNestedManyWithoutCongtyInput
    synclogs?: ext_synclogUncheckedCreateNestedManyWithoutCongtyInput
  }

  export type ext_congtyCreateOrConnectWithoutHoadonsInput = {
    where: ext_congtyWhereUniqueInput
    create: XOR<ext_congtyCreateWithoutHoadonsInput, ext_congtyUncheckedCreateWithoutHoadonsInput>
  }

  export type ext_detailhoadonCreateWithoutInvoiceInput = {
    id?: string
    idServer: string
    stt?: number
    ten: string
    dvtinh?: string | null
    sluong?: Decimal | DecimalJsLike | number | string
    dgia?: Decimal | DecimalJsLike | number | string
    thtien?: Decimal | DecimalJsLike | number | string
    tsuat?: Decimal | DecimalJsLike | number | string
    tthue?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
    products?: ext_sanphamhoadonCreateNestedManyWithoutDetailInput
  }

  export type ext_detailhoadonUncheckedCreateWithoutInvoiceInput = {
    id?: string
    idServer: string
    stt?: number
    ten: string
    dvtinh?: string | null
    sluong?: Decimal | DecimalJsLike | number | string
    dgia?: Decimal | DecimalJsLike | number | string
    thtien?: Decimal | DecimalJsLike | number | string
    tsuat?: Decimal | DecimalJsLike | number | string
    tthue?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
    products?: ext_sanphamhoadonUncheckedCreateNestedManyWithoutDetailInput
  }

  export type ext_detailhoadonCreateOrConnectWithoutInvoiceInput = {
    where: ext_detailhoadonWhereUniqueInput
    create: XOR<ext_detailhoadonCreateWithoutInvoiceInput, ext_detailhoadonUncheckedCreateWithoutInvoiceInput>
  }

  export type ext_detailhoadonCreateManyInvoiceInputEnvelope = {
    data: ext_detailhoadonCreateManyInvoiceInput | ext_detailhoadonCreateManyInvoiceInput[]
    skipDuplicates?: boolean
  }

  export type ext_congtyUpsertWithoutHoadonsInput = {
    update: XOR<ext_congtyUpdateWithoutHoadonsInput, ext_congtyUncheckedUpdateWithoutHoadonsInput>
    create: XOR<ext_congtyCreateWithoutHoadonsInput, ext_congtyUncheckedCreateWithoutHoadonsInput>
    where?: ext_congtyWhereInput
  }

  export type ext_congtyUpdateToOneWithWhereWithoutHoadonsInput = {
    where?: ext_congtyWhereInput
    data: XOR<ext_congtyUpdateWithoutHoadonsInput, ext_congtyUncheckedUpdateWithoutHoadonsInput>
  }

  export type ext_congtyUpdateWithoutHoadonsInput = {
    id?: StringFieldUpdateOperationsInput | string
    mst?: StringFieldUpdateOperationsInput | string
    ten?: StringFieldUpdateOperationsInput | string
    tenVietTat?: NullableStringFieldUpdateOperationsInput | string | null
    diaChi?: NullableStringFieldUpdateOperationsInput | string | null
    dienThoai?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    nguoiDaiDien?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    apiConfigs?: ext_apiconfigUpdateManyWithoutCongtyNestedInput
    synclogs?: ext_synclogUpdateManyWithoutCongtyNestedInput
  }

  export type ext_congtyUncheckedUpdateWithoutHoadonsInput = {
    id?: StringFieldUpdateOperationsInput | string
    mst?: StringFieldUpdateOperationsInput | string
    ten?: StringFieldUpdateOperationsInput | string
    tenVietTat?: NullableStringFieldUpdateOperationsInput | string | null
    diaChi?: NullableStringFieldUpdateOperationsInput | string | null
    dienThoai?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    nguoiDaiDien?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    apiConfigs?: ext_apiconfigUncheckedUpdateManyWithoutCongtyNestedInput
    synclogs?: ext_synclogUncheckedUpdateManyWithoutCongtyNestedInput
  }

  export type ext_detailhoadonUpsertWithWhereUniqueWithoutInvoiceInput = {
    where: ext_detailhoadonWhereUniqueInput
    update: XOR<ext_detailhoadonUpdateWithoutInvoiceInput, ext_detailhoadonUncheckedUpdateWithoutInvoiceInput>
    create: XOR<ext_detailhoadonCreateWithoutInvoiceInput, ext_detailhoadonUncheckedCreateWithoutInvoiceInput>
  }

  export type ext_detailhoadonUpdateWithWhereUniqueWithoutInvoiceInput = {
    where: ext_detailhoadonWhereUniqueInput
    data: XOR<ext_detailhoadonUpdateWithoutInvoiceInput, ext_detailhoadonUncheckedUpdateWithoutInvoiceInput>
  }

  export type ext_detailhoadonUpdateManyWithWhereWithoutInvoiceInput = {
    where: ext_detailhoadonScalarWhereInput
    data: XOR<ext_detailhoadonUpdateManyMutationInput, ext_detailhoadonUncheckedUpdateManyWithoutInvoiceInput>
  }

  export type ext_detailhoadonScalarWhereInput = {
    AND?: ext_detailhoadonScalarWhereInput | ext_detailhoadonScalarWhereInput[]
    OR?: ext_detailhoadonScalarWhereInput[]
    NOT?: ext_detailhoadonScalarWhereInput | ext_detailhoadonScalarWhereInput[]
    id?: StringFilter<"ext_detailhoadon"> | string
    idServer?: StringFilter<"ext_detailhoadon"> | string
    idhdonServer?: StringFilter<"ext_detailhoadon"> | string
    stt?: IntFilter<"ext_detailhoadon"> | number
    ten?: StringFilter<"ext_detailhoadon"> | string
    dvtinh?: StringNullableFilter<"ext_detailhoadon"> | string | null
    sluong?: DecimalFilter<"ext_detailhoadon"> | Decimal | DecimalJsLike | number | string
    dgia?: DecimalFilter<"ext_detailhoadon"> | Decimal | DecimalJsLike | number | string
    thtien?: DecimalFilter<"ext_detailhoadon"> | Decimal | DecimalJsLike | number | string
    tsuat?: DecimalFilter<"ext_detailhoadon"> | Decimal | DecimalJsLike | number | string
    tthue?: DecimalFilter<"ext_detailhoadon"> | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFilter<"ext_detailhoadon"> | Date | string
    updatedAt?: DateTimeFilter<"ext_detailhoadon"> | Date | string
  }

  export type ext_listhoadonCreateWithoutDetailsInput = {
    id?: string
    idServer: string
    brandname?: string | null
    nbmst: string
    nbten?: string | null
    nbdchi?: string | null
    nmmst?: string | null
    nmten?: string | null
    nmdchi?: string | null
    khmshdon: string
    khhdon: string
    shdon: string
    mhso?: string | null
    tgtcthue?: Decimal | DecimalJsLike | number | string
    tgtthue?: Decimal | DecimalJsLike | number | string
    tgtttbso?: Decimal | DecimalJsLike | number | string
    tdlap: Date | string
    tthai?: string | null
    loaihd?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    congty?: ext_congtyCreateNestedOneWithoutHoadonsInput
  }

  export type ext_listhoadonUncheckedCreateWithoutDetailsInput = {
    id?: string
    idServer: string
    brandname?: string | null
    congtyId?: string | null
    nbmst: string
    nbten?: string | null
    nbdchi?: string | null
    nmmst?: string | null
    nmten?: string | null
    nmdchi?: string | null
    khmshdon: string
    khhdon: string
    shdon: string
    mhso?: string | null
    tgtcthue?: Decimal | DecimalJsLike | number | string
    tgtthue?: Decimal | DecimalJsLike | number | string
    tgtttbso?: Decimal | DecimalJsLike | number | string
    tdlap: Date | string
    tthai?: string | null
    loaihd?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ext_listhoadonCreateOrConnectWithoutDetailsInput = {
    where: ext_listhoadonWhereUniqueInput
    create: XOR<ext_listhoadonCreateWithoutDetailsInput, ext_listhoadonUncheckedCreateWithoutDetailsInput>
  }

  export type ext_sanphamhoadonCreateWithoutDetailInput = {
    id?: string
    ten: string
    ten2?: string | null
    ma?: string | null
    dvt?: string | null
    dgia?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ext_sanphamhoadonUncheckedCreateWithoutDetailInput = {
    id?: string
    ten: string
    ten2?: string | null
    ma?: string | null
    dvt?: string | null
    dgia?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ext_sanphamhoadonCreateOrConnectWithoutDetailInput = {
    where: ext_sanphamhoadonWhereUniqueInput
    create: XOR<ext_sanphamhoadonCreateWithoutDetailInput, ext_sanphamhoadonUncheckedCreateWithoutDetailInput>
  }

  export type ext_sanphamhoadonCreateManyDetailInputEnvelope = {
    data: ext_sanphamhoadonCreateManyDetailInput | ext_sanphamhoadonCreateManyDetailInput[]
    skipDuplicates?: boolean
  }

  export type ext_listhoadonUpsertWithoutDetailsInput = {
    update: XOR<ext_listhoadonUpdateWithoutDetailsInput, ext_listhoadonUncheckedUpdateWithoutDetailsInput>
    create: XOR<ext_listhoadonCreateWithoutDetailsInput, ext_listhoadonUncheckedCreateWithoutDetailsInput>
    where?: ext_listhoadonWhereInput
  }

  export type ext_listhoadonUpdateToOneWithWhereWithoutDetailsInput = {
    where?: ext_listhoadonWhereInput
    data: XOR<ext_listhoadonUpdateWithoutDetailsInput, ext_listhoadonUncheckedUpdateWithoutDetailsInput>
  }

  export type ext_listhoadonUpdateWithoutDetailsInput = {
    id?: StringFieldUpdateOperationsInput | string
    idServer?: StringFieldUpdateOperationsInput | string
    brandname?: NullableStringFieldUpdateOperationsInput | string | null
    nbmst?: StringFieldUpdateOperationsInput | string
    nbten?: NullableStringFieldUpdateOperationsInput | string | null
    nbdchi?: NullableStringFieldUpdateOperationsInput | string | null
    nmmst?: NullableStringFieldUpdateOperationsInput | string | null
    nmten?: NullableStringFieldUpdateOperationsInput | string | null
    nmdchi?: NullableStringFieldUpdateOperationsInput | string | null
    khmshdon?: StringFieldUpdateOperationsInput | string
    khhdon?: StringFieldUpdateOperationsInput | string
    shdon?: StringFieldUpdateOperationsInput | string
    mhso?: NullableStringFieldUpdateOperationsInput | string | null
    tgtcthue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tgtthue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tgtttbso?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tdlap?: DateTimeFieldUpdateOperationsInput | Date | string
    tthai?: NullableStringFieldUpdateOperationsInput | string | null
    loaihd?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    congty?: ext_congtyUpdateOneWithoutHoadonsNestedInput
  }

  export type ext_listhoadonUncheckedUpdateWithoutDetailsInput = {
    id?: StringFieldUpdateOperationsInput | string
    idServer?: StringFieldUpdateOperationsInput | string
    brandname?: NullableStringFieldUpdateOperationsInput | string | null
    congtyId?: NullableStringFieldUpdateOperationsInput | string | null
    nbmst?: StringFieldUpdateOperationsInput | string
    nbten?: NullableStringFieldUpdateOperationsInput | string | null
    nbdchi?: NullableStringFieldUpdateOperationsInput | string | null
    nmmst?: NullableStringFieldUpdateOperationsInput | string | null
    nmten?: NullableStringFieldUpdateOperationsInput | string | null
    nmdchi?: NullableStringFieldUpdateOperationsInput | string | null
    khmshdon?: StringFieldUpdateOperationsInput | string
    khhdon?: StringFieldUpdateOperationsInput | string
    shdon?: StringFieldUpdateOperationsInput | string
    mhso?: NullableStringFieldUpdateOperationsInput | string | null
    tgtcthue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tgtthue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tgtttbso?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tdlap?: DateTimeFieldUpdateOperationsInput | Date | string
    tthai?: NullableStringFieldUpdateOperationsInput | string | null
    loaihd?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ext_sanphamhoadonUpsertWithWhereUniqueWithoutDetailInput = {
    where: ext_sanphamhoadonWhereUniqueInput
    update: XOR<ext_sanphamhoadonUpdateWithoutDetailInput, ext_sanphamhoadonUncheckedUpdateWithoutDetailInput>
    create: XOR<ext_sanphamhoadonCreateWithoutDetailInput, ext_sanphamhoadonUncheckedCreateWithoutDetailInput>
  }

  export type ext_sanphamhoadonUpdateWithWhereUniqueWithoutDetailInput = {
    where: ext_sanphamhoadonWhereUniqueInput
    data: XOR<ext_sanphamhoadonUpdateWithoutDetailInput, ext_sanphamhoadonUncheckedUpdateWithoutDetailInput>
  }

  export type ext_sanphamhoadonUpdateManyWithWhereWithoutDetailInput = {
    where: ext_sanphamhoadonScalarWhereInput
    data: XOR<ext_sanphamhoadonUpdateManyMutationInput, ext_sanphamhoadonUncheckedUpdateManyWithoutDetailInput>
  }

  export type ext_sanphamhoadonScalarWhereInput = {
    AND?: ext_sanphamhoadonScalarWhereInput | ext_sanphamhoadonScalarWhereInput[]
    OR?: ext_sanphamhoadonScalarWhereInput[]
    NOT?: ext_sanphamhoadonScalarWhereInput | ext_sanphamhoadonScalarWhereInput[]
    id?: StringFilter<"ext_sanphamhoadon"> | string
    iddetailhoadon?: StringFilter<"ext_sanphamhoadon"> | string
    ten?: StringFilter<"ext_sanphamhoadon"> | string
    ten2?: StringNullableFilter<"ext_sanphamhoadon"> | string | null
    ma?: StringNullableFilter<"ext_sanphamhoadon"> | string | null
    dvt?: StringNullableFilter<"ext_sanphamhoadon"> | string | null
    dgia?: DecimalFilter<"ext_sanphamhoadon"> | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFilter<"ext_sanphamhoadon"> | Date | string
    updatedAt?: DateTimeFilter<"ext_sanphamhoadon"> | Date | string
  }

  export type ext_detailhoadonCreateWithoutProductsInput = {
    id?: string
    idServer: string
    stt?: number
    ten: string
    dvtinh?: string | null
    sluong?: Decimal | DecimalJsLike | number | string
    dgia?: Decimal | DecimalJsLike | number | string
    thtien?: Decimal | DecimalJsLike | number | string
    tsuat?: Decimal | DecimalJsLike | number | string
    tthue?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
    invoice: ext_listhoadonCreateNestedOneWithoutDetailsInput
  }

  export type ext_detailhoadonUncheckedCreateWithoutProductsInput = {
    id?: string
    idServer: string
    idhdonServer: string
    stt?: number
    ten: string
    dvtinh?: string | null
    sluong?: Decimal | DecimalJsLike | number | string
    dgia?: Decimal | DecimalJsLike | number | string
    thtien?: Decimal | DecimalJsLike | number | string
    tsuat?: Decimal | DecimalJsLike | number | string
    tthue?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ext_detailhoadonCreateOrConnectWithoutProductsInput = {
    where: ext_detailhoadonWhereUniqueInput
    create: XOR<ext_detailhoadonCreateWithoutProductsInput, ext_detailhoadonUncheckedCreateWithoutProductsInput>
  }

  export type ext_detailhoadonUpsertWithoutProductsInput = {
    update: XOR<ext_detailhoadonUpdateWithoutProductsInput, ext_detailhoadonUncheckedUpdateWithoutProductsInput>
    create: XOR<ext_detailhoadonCreateWithoutProductsInput, ext_detailhoadonUncheckedCreateWithoutProductsInput>
    where?: ext_detailhoadonWhereInput
  }

  export type ext_detailhoadonUpdateToOneWithWhereWithoutProductsInput = {
    where?: ext_detailhoadonWhereInput
    data: XOR<ext_detailhoadonUpdateWithoutProductsInput, ext_detailhoadonUncheckedUpdateWithoutProductsInput>
  }

  export type ext_detailhoadonUpdateWithoutProductsInput = {
    id?: StringFieldUpdateOperationsInput | string
    idServer?: StringFieldUpdateOperationsInput | string
    stt?: IntFieldUpdateOperationsInput | number
    ten?: StringFieldUpdateOperationsInput | string
    dvtinh?: NullableStringFieldUpdateOperationsInput | string | null
    sluong?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    dgia?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    thtien?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tsuat?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tthue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    invoice?: ext_listhoadonUpdateOneRequiredWithoutDetailsNestedInput
  }

  export type ext_detailhoadonUncheckedUpdateWithoutProductsInput = {
    id?: StringFieldUpdateOperationsInput | string
    idServer?: StringFieldUpdateOperationsInput | string
    idhdonServer?: StringFieldUpdateOperationsInput | string
    stt?: IntFieldUpdateOperationsInput | number
    ten?: StringFieldUpdateOperationsInput | string
    dvtinh?: NullableStringFieldUpdateOperationsInput | string | null
    sluong?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    dgia?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    thtien?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tsuat?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tthue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ext_congtyCreateWithoutApiConfigsInput = {
    id?: string
    mst: string
    ten: string
    tenVietTat?: string | null
    diaChi?: string | null
    dienThoai?: string | null
    email?: string | null
    nguoiDaiDien?: string | null
    isActive?: boolean
    isDefault?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    hoadons?: ext_listhoadonCreateNestedManyWithoutCongtyInput
    synclogs?: ext_synclogCreateNestedManyWithoutCongtyInput
  }

  export type ext_congtyUncheckedCreateWithoutApiConfigsInput = {
    id?: string
    mst: string
    ten: string
    tenVietTat?: string | null
    diaChi?: string | null
    dienThoai?: string | null
    email?: string | null
    nguoiDaiDien?: string | null
    isActive?: boolean
    isDefault?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    hoadons?: ext_listhoadonUncheckedCreateNestedManyWithoutCongtyInput
    synclogs?: ext_synclogUncheckedCreateNestedManyWithoutCongtyInput
  }

  export type ext_congtyCreateOrConnectWithoutApiConfigsInput = {
    where: ext_congtyWhereUniqueInput
    create: XOR<ext_congtyCreateWithoutApiConfigsInput, ext_congtyUncheckedCreateWithoutApiConfigsInput>
  }

  export type ext_synclogCreateWithoutConfigInput = {
    id?: string
    syncType: string
    fromDate?: Date | string | null
    toDate?: Date | string | null
    totalRecords?: number
    successCount?: number
    errorCount?: number
    status?: string
    errorMessage?: string | null
    startedAt?: Date | string
    completedAt?: Date | string | null
    createdAt?: Date | string
    congty?: ext_congtyCreateNestedOneWithoutSynclogsInput
  }

  export type ext_synclogUncheckedCreateWithoutConfigInput = {
    id?: string
    congtyId?: string | null
    syncType: string
    fromDate?: Date | string | null
    toDate?: Date | string | null
    totalRecords?: number
    successCount?: number
    errorCount?: number
    status?: string
    errorMessage?: string | null
    startedAt?: Date | string
    completedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type ext_synclogCreateOrConnectWithoutConfigInput = {
    where: ext_synclogWhereUniqueInput
    create: XOR<ext_synclogCreateWithoutConfigInput, ext_synclogUncheckedCreateWithoutConfigInput>
  }

  export type ext_synclogCreateManyConfigInputEnvelope = {
    data: ext_synclogCreateManyConfigInput | ext_synclogCreateManyConfigInput[]
    skipDuplicates?: boolean
  }

  export type ext_congtyUpsertWithoutApiConfigsInput = {
    update: XOR<ext_congtyUpdateWithoutApiConfigsInput, ext_congtyUncheckedUpdateWithoutApiConfigsInput>
    create: XOR<ext_congtyCreateWithoutApiConfigsInput, ext_congtyUncheckedCreateWithoutApiConfigsInput>
    where?: ext_congtyWhereInput
  }

  export type ext_congtyUpdateToOneWithWhereWithoutApiConfigsInput = {
    where?: ext_congtyWhereInput
    data: XOR<ext_congtyUpdateWithoutApiConfigsInput, ext_congtyUncheckedUpdateWithoutApiConfigsInput>
  }

  export type ext_congtyUpdateWithoutApiConfigsInput = {
    id?: StringFieldUpdateOperationsInput | string
    mst?: StringFieldUpdateOperationsInput | string
    ten?: StringFieldUpdateOperationsInput | string
    tenVietTat?: NullableStringFieldUpdateOperationsInput | string | null
    diaChi?: NullableStringFieldUpdateOperationsInput | string | null
    dienThoai?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    nguoiDaiDien?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    hoadons?: ext_listhoadonUpdateManyWithoutCongtyNestedInput
    synclogs?: ext_synclogUpdateManyWithoutCongtyNestedInput
  }

  export type ext_congtyUncheckedUpdateWithoutApiConfigsInput = {
    id?: StringFieldUpdateOperationsInput | string
    mst?: StringFieldUpdateOperationsInput | string
    ten?: StringFieldUpdateOperationsInput | string
    tenVietTat?: NullableStringFieldUpdateOperationsInput | string | null
    diaChi?: NullableStringFieldUpdateOperationsInput | string | null
    dienThoai?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    nguoiDaiDien?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    hoadons?: ext_listhoadonUncheckedUpdateManyWithoutCongtyNestedInput
    synclogs?: ext_synclogUncheckedUpdateManyWithoutCongtyNestedInput
  }

  export type ext_synclogUpsertWithWhereUniqueWithoutConfigInput = {
    where: ext_synclogWhereUniqueInput
    update: XOR<ext_synclogUpdateWithoutConfigInput, ext_synclogUncheckedUpdateWithoutConfigInput>
    create: XOR<ext_synclogCreateWithoutConfigInput, ext_synclogUncheckedCreateWithoutConfigInput>
  }

  export type ext_synclogUpdateWithWhereUniqueWithoutConfigInput = {
    where: ext_synclogWhereUniqueInput
    data: XOR<ext_synclogUpdateWithoutConfigInput, ext_synclogUncheckedUpdateWithoutConfigInput>
  }

  export type ext_synclogUpdateManyWithWhereWithoutConfigInput = {
    where: ext_synclogScalarWhereInput
    data: XOR<ext_synclogUpdateManyMutationInput, ext_synclogUncheckedUpdateManyWithoutConfigInput>
  }

  export type ext_congtyCreateWithoutSynclogsInput = {
    id?: string
    mst: string
    ten: string
    tenVietTat?: string | null
    diaChi?: string | null
    dienThoai?: string | null
    email?: string | null
    nguoiDaiDien?: string | null
    isActive?: boolean
    isDefault?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    apiConfigs?: ext_apiconfigCreateNestedManyWithoutCongtyInput
    hoadons?: ext_listhoadonCreateNestedManyWithoutCongtyInput
  }

  export type ext_congtyUncheckedCreateWithoutSynclogsInput = {
    id?: string
    mst: string
    ten: string
    tenVietTat?: string | null
    diaChi?: string | null
    dienThoai?: string | null
    email?: string | null
    nguoiDaiDien?: string | null
    isActive?: boolean
    isDefault?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    apiConfigs?: ext_apiconfigUncheckedCreateNestedManyWithoutCongtyInput
    hoadons?: ext_listhoadonUncheckedCreateNestedManyWithoutCongtyInput
  }

  export type ext_congtyCreateOrConnectWithoutSynclogsInput = {
    where: ext_congtyWhereUniqueInput
    create: XOR<ext_congtyCreateWithoutSynclogsInput, ext_congtyUncheckedCreateWithoutSynclogsInput>
  }

  export type ext_apiconfigCreateWithoutSynclogsInput = {
    id?: string
    name: string
    bearerToken: string
    baseUrl?: string
    brandname?: string | null
    batchSize?: number
    delayBetweenBatches?: number
    delayBetweenDetailCalls?: number
    maxRetries?: number
    lastSyncAt?: Date | string | null
    lastSyncStatus?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    congty: ext_congtyCreateNestedOneWithoutApiConfigsInput
  }

  export type ext_apiconfigUncheckedCreateWithoutSynclogsInput = {
    id?: string
    name: string
    congtyId: string
    bearerToken: string
    baseUrl?: string
    brandname?: string | null
    batchSize?: number
    delayBetweenBatches?: number
    delayBetweenDetailCalls?: number
    maxRetries?: number
    lastSyncAt?: Date | string | null
    lastSyncStatus?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ext_apiconfigCreateOrConnectWithoutSynclogsInput = {
    where: ext_apiconfigWhereUniqueInput
    create: XOR<ext_apiconfigCreateWithoutSynclogsInput, ext_apiconfigUncheckedCreateWithoutSynclogsInput>
  }

  export type ext_congtyUpsertWithoutSynclogsInput = {
    update: XOR<ext_congtyUpdateWithoutSynclogsInput, ext_congtyUncheckedUpdateWithoutSynclogsInput>
    create: XOR<ext_congtyCreateWithoutSynclogsInput, ext_congtyUncheckedCreateWithoutSynclogsInput>
    where?: ext_congtyWhereInput
  }

  export type ext_congtyUpdateToOneWithWhereWithoutSynclogsInput = {
    where?: ext_congtyWhereInput
    data: XOR<ext_congtyUpdateWithoutSynclogsInput, ext_congtyUncheckedUpdateWithoutSynclogsInput>
  }

  export type ext_congtyUpdateWithoutSynclogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    mst?: StringFieldUpdateOperationsInput | string
    ten?: StringFieldUpdateOperationsInput | string
    tenVietTat?: NullableStringFieldUpdateOperationsInput | string | null
    diaChi?: NullableStringFieldUpdateOperationsInput | string | null
    dienThoai?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    nguoiDaiDien?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    apiConfigs?: ext_apiconfigUpdateManyWithoutCongtyNestedInput
    hoadons?: ext_listhoadonUpdateManyWithoutCongtyNestedInput
  }

  export type ext_congtyUncheckedUpdateWithoutSynclogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    mst?: StringFieldUpdateOperationsInput | string
    ten?: StringFieldUpdateOperationsInput | string
    tenVietTat?: NullableStringFieldUpdateOperationsInput | string | null
    diaChi?: NullableStringFieldUpdateOperationsInput | string | null
    dienThoai?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    nguoiDaiDien?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    apiConfigs?: ext_apiconfigUncheckedUpdateManyWithoutCongtyNestedInput
    hoadons?: ext_listhoadonUncheckedUpdateManyWithoutCongtyNestedInput
  }

  export type ext_apiconfigUpsertWithoutSynclogsInput = {
    update: XOR<ext_apiconfigUpdateWithoutSynclogsInput, ext_apiconfigUncheckedUpdateWithoutSynclogsInput>
    create: XOR<ext_apiconfigCreateWithoutSynclogsInput, ext_apiconfigUncheckedCreateWithoutSynclogsInput>
    where?: ext_apiconfigWhereInput
  }

  export type ext_apiconfigUpdateToOneWithWhereWithoutSynclogsInput = {
    where?: ext_apiconfigWhereInput
    data: XOR<ext_apiconfigUpdateWithoutSynclogsInput, ext_apiconfigUncheckedUpdateWithoutSynclogsInput>
  }

  export type ext_apiconfigUpdateWithoutSynclogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    bearerToken?: StringFieldUpdateOperationsInput | string
    baseUrl?: StringFieldUpdateOperationsInput | string
    brandname?: NullableStringFieldUpdateOperationsInput | string | null
    batchSize?: IntFieldUpdateOperationsInput | number
    delayBetweenBatches?: IntFieldUpdateOperationsInput | number
    delayBetweenDetailCalls?: IntFieldUpdateOperationsInput | number
    maxRetries?: IntFieldUpdateOperationsInput | number
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastSyncStatus?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    congty?: ext_congtyUpdateOneRequiredWithoutApiConfigsNestedInput
  }

  export type ext_apiconfigUncheckedUpdateWithoutSynclogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    congtyId?: StringFieldUpdateOperationsInput | string
    bearerToken?: StringFieldUpdateOperationsInput | string
    baseUrl?: StringFieldUpdateOperationsInput | string
    brandname?: NullableStringFieldUpdateOperationsInput | string | null
    batchSize?: IntFieldUpdateOperationsInput | number
    delayBetweenBatches?: IntFieldUpdateOperationsInput | number
    delayBetweenDetailCalls?: IntFieldUpdateOperationsInput | number
    maxRetries?: IntFieldUpdateOperationsInput | number
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastSyncStatus?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ext_apiconfigCreateManyCongtyInput = {
    id?: string
    name: string
    bearerToken: string
    baseUrl?: string
    brandname?: string | null
    batchSize?: number
    delayBetweenBatches?: number
    delayBetweenDetailCalls?: number
    maxRetries?: number
    lastSyncAt?: Date | string | null
    lastSyncStatus?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ext_listhoadonCreateManyCongtyInput = {
    id?: string
    idServer: string
    brandname?: string | null
    nbmst: string
    nbten?: string | null
    nbdchi?: string | null
    nmmst?: string | null
    nmten?: string | null
    nmdchi?: string | null
    khmshdon: string
    khhdon: string
    shdon: string
    mhso?: string | null
    tgtcthue?: Decimal | DecimalJsLike | number | string
    tgtthue?: Decimal | DecimalJsLike | number | string
    tgtttbso?: Decimal | DecimalJsLike | number | string
    tdlap: Date | string
    tthai?: string | null
    loaihd?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ext_synclogCreateManyCongtyInput = {
    id?: string
    configId?: string | null
    syncType: string
    fromDate?: Date | string | null
    toDate?: Date | string | null
    totalRecords?: number
    successCount?: number
    errorCount?: number
    status?: string
    errorMessage?: string | null
    startedAt?: Date | string
    completedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type ext_apiconfigUpdateWithoutCongtyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    bearerToken?: StringFieldUpdateOperationsInput | string
    baseUrl?: StringFieldUpdateOperationsInput | string
    brandname?: NullableStringFieldUpdateOperationsInput | string | null
    batchSize?: IntFieldUpdateOperationsInput | number
    delayBetweenBatches?: IntFieldUpdateOperationsInput | number
    delayBetweenDetailCalls?: IntFieldUpdateOperationsInput | number
    maxRetries?: IntFieldUpdateOperationsInput | number
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastSyncStatus?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    synclogs?: ext_synclogUpdateManyWithoutConfigNestedInput
  }

  export type ext_apiconfigUncheckedUpdateWithoutCongtyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    bearerToken?: StringFieldUpdateOperationsInput | string
    baseUrl?: StringFieldUpdateOperationsInput | string
    brandname?: NullableStringFieldUpdateOperationsInput | string | null
    batchSize?: IntFieldUpdateOperationsInput | number
    delayBetweenBatches?: IntFieldUpdateOperationsInput | number
    delayBetweenDetailCalls?: IntFieldUpdateOperationsInput | number
    maxRetries?: IntFieldUpdateOperationsInput | number
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastSyncStatus?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    synclogs?: ext_synclogUncheckedUpdateManyWithoutConfigNestedInput
  }

  export type ext_apiconfigUncheckedUpdateManyWithoutCongtyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    bearerToken?: StringFieldUpdateOperationsInput | string
    baseUrl?: StringFieldUpdateOperationsInput | string
    brandname?: NullableStringFieldUpdateOperationsInput | string | null
    batchSize?: IntFieldUpdateOperationsInput | number
    delayBetweenBatches?: IntFieldUpdateOperationsInput | number
    delayBetweenDetailCalls?: IntFieldUpdateOperationsInput | number
    maxRetries?: IntFieldUpdateOperationsInput | number
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastSyncStatus?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ext_listhoadonUpdateWithoutCongtyInput = {
    id?: StringFieldUpdateOperationsInput | string
    idServer?: StringFieldUpdateOperationsInput | string
    brandname?: NullableStringFieldUpdateOperationsInput | string | null
    nbmst?: StringFieldUpdateOperationsInput | string
    nbten?: NullableStringFieldUpdateOperationsInput | string | null
    nbdchi?: NullableStringFieldUpdateOperationsInput | string | null
    nmmst?: NullableStringFieldUpdateOperationsInput | string | null
    nmten?: NullableStringFieldUpdateOperationsInput | string | null
    nmdchi?: NullableStringFieldUpdateOperationsInput | string | null
    khmshdon?: StringFieldUpdateOperationsInput | string
    khhdon?: StringFieldUpdateOperationsInput | string
    shdon?: StringFieldUpdateOperationsInput | string
    mhso?: NullableStringFieldUpdateOperationsInput | string | null
    tgtcthue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tgtthue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tgtttbso?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tdlap?: DateTimeFieldUpdateOperationsInput | Date | string
    tthai?: NullableStringFieldUpdateOperationsInput | string | null
    loaihd?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    details?: ext_detailhoadonUpdateManyWithoutInvoiceNestedInput
  }

  export type ext_listhoadonUncheckedUpdateWithoutCongtyInput = {
    id?: StringFieldUpdateOperationsInput | string
    idServer?: StringFieldUpdateOperationsInput | string
    brandname?: NullableStringFieldUpdateOperationsInput | string | null
    nbmst?: StringFieldUpdateOperationsInput | string
    nbten?: NullableStringFieldUpdateOperationsInput | string | null
    nbdchi?: NullableStringFieldUpdateOperationsInput | string | null
    nmmst?: NullableStringFieldUpdateOperationsInput | string | null
    nmten?: NullableStringFieldUpdateOperationsInput | string | null
    nmdchi?: NullableStringFieldUpdateOperationsInput | string | null
    khmshdon?: StringFieldUpdateOperationsInput | string
    khhdon?: StringFieldUpdateOperationsInput | string
    shdon?: StringFieldUpdateOperationsInput | string
    mhso?: NullableStringFieldUpdateOperationsInput | string | null
    tgtcthue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tgtthue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tgtttbso?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tdlap?: DateTimeFieldUpdateOperationsInput | Date | string
    tthai?: NullableStringFieldUpdateOperationsInput | string | null
    loaihd?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    details?: ext_detailhoadonUncheckedUpdateManyWithoutInvoiceNestedInput
  }

  export type ext_listhoadonUncheckedUpdateManyWithoutCongtyInput = {
    id?: StringFieldUpdateOperationsInput | string
    idServer?: StringFieldUpdateOperationsInput | string
    brandname?: NullableStringFieldUpdateOperationsInput | string | null
    nbmst?: StringFieldUpdateOperationsInput | string
    nbten?: NullableStringFieldUpdateOperationsInput | string | null
    nbdchi?: NullableStringFieldUpdateOperationsInput | string | null
    nmmst?: NullableStringFieldUpdateOperationsInput | string | null
    nmten?: NullableStringFieldUpdateOperationsInput | string | null
    nmdchi?: NullableStringFieldUpdateOperationsInput | string | null
    khmshdon?: StringFieldUpdateOperationsInput | string
    khhdon?: StringFieldUpdateOperationsInput | string
    shdon?: StringFieldUpdateOperationsInput | string
    mhso?: NullableStringFieldUpdateOperationsInput | string | null
    tgtcthue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tgtthue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tgtttbso?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tdlap?: DateTimeFieldUpdateOperationsInput | Date | string
    tthai?: NullableStringFieldUpdateOperationsInput | string | null
    loaihd?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ext_synclogUpdateWithoutCongtyInput = {
    id?: StringFieldUpdateOperationsInput | string
    syncType?: StringFieldUpdateOperationsInput | string
    fromDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    toDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalRecords?: IntFieldUpdateOperationsInput | number
    successCount?: IntFieldUpdateOperationsInput | number
    errorCount?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    config?: ext_apiconfigUpdateOneWithoutSynclogsNestedInput
  }

  export type ext_synclogUncheckedUpdateWithoutCongtyInput = {
    id?: StringFieldUpdateOperationsInput | string
    configId?: NullableStringFieldUpdateOperationsInput | string | null
    syncType?: StringFieldUpdateOperationsInput | string
    fromDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    toDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalRecords?: IntFieldUpdateOperationsInput | number
    successCount?: IntFieldUpdateOperationsInput | number
    errorCount?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ext_synclogUncheckedUpdateManyWithoutCongtyInput = {
    id?: StringFieldUpdateOperationsInput | string
    configId?: NullableStringFieldUpdateOperationsInput | string | null
    syncType?: StringFieldUpdateOperationsInput | string
    fromDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    toDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalRecords?: IntFieldUpdateOperationsInput | number
    successCount?: IntFieldUpdateOperationsInput | number
    errorCount?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ext_detailhoadonCreateManyInvoiceInput = {
    id?: string
    idServer: string
    stt?: number
    ten: string
    dvtinh?: string | null
    sluong?: Decimal | DecimalJsLike | number | string
    dgia?: Decimal | DecimalJsLike | number | string
    thtien?: Decimal | DecimalJsLike | number | string
    tsuat?: Decimal | DecimalJsLike | number | string
    tthue?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ext_detailhoadonUpdateWithoutInvoiceInput = {
    id?: StringFieldUpdateOperationsInput | string
    idServer?: StringFieldUpdateOperationsInput | string
    stt?: IntFieldUpdateOperationsInput | number
    ten?: StringFieldUpdateOperationsInput | string
    dvtinh?: NullableStringFieldUpdateOperationsInput | string | null
    sluong?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    dgia?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    thtien?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tsuat?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tthue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    products?: ext_sanphamhoadonUpdateManyWithoutDetailNestedInput
  }

  export type ext_detailhoadonUncheckedUpdateWithoutInvoiceInput = {
    id?: StringFieldUpdateOperationsInput | string
    idServer?: StringFieldUpdateOperationsInput | string
    stt?: IntFieldUpdateOperationsInput | number
    ten?: StringFieldUpdateOperationsInput | string
    dvtinh?: NullableStringFieldUpdateOperationsInput | string | null
    sluong?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    dgia?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    thtien?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tsuat?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tthue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    products?: ext_sanphamhoadonUncheckedUpdateManyWithoutDetailNestedInput
  }

  export type ext_detailhoadonUncheckedUpdateManyWithoutInvoiceInput = {
    id?: StringFieldUpdateOperationsInput | string
    idServer?: StringFieldUpdateOperationsInput | string
    stt?: IntFieldUpdateOperationsInput | number
    ten?: StringFieldUpdateOperationsInput | string
    dvtinh?: NullableStringFieldUpdateOperationsInput | string | null
    sluong?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    dgia?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    thtien?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tsuat?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    tthue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ext_sanphamhoadonCreateManyDetailInput = {
    id?: string
    ten: string
    ten2?: string | null
    ma?: string | null
    dvt?: string | null
    dgia?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ext_sanphamhoadonUpdateWithoutDetailInput = {
    id?: StringFieldUpdateOperationsInput | string
    ten?: StringFieldUpdateOperationsInput | string
    ten2?: NullableStringFieldUpdateOperationsInput | string | null
    ma?: NullableStringFieldUpdateOperationsInput | string | null
    dvt?: NullableStringFieldUpdateOperationsInput | string | null
    dgia?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ext_sanphamhoadonUncheckedUpdateWithoutDetailInput = {
    id?: StringFieldUpdateOperationsInput | string
    ten?: StringFieldUpdateOperationsInput | string
    ten2?: NullableStringFieldUpdateOperationsInput | string | null
    ma?: NullableStringFieldUpdateOperationsInput | string | null
    dvt?: NullableStringFieldUpdateOperationsInput | string | null
    dgia?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ext_sanphamhoadonUncheckedUpdateManyWithoutDetailInput = {
    id?: StringFieldUpdateOperationsInput | string
    ten?: StringFieldUpdateOperationsInput | string
    ten2?: NullableStringFieldUpdateOperationsInput | string | null
    ma?: NullableStringFieldUpdateOperationsInput | string | null
    dvt?: NullableStringFieldUpdateOperationsInput | string | null
    dgia?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ext_synclogCreateManyConfigInput = {
    id?: string
    congtyId?: string | null
    syncType: string
    fromDate?: Date | string | null
    toDate?: Date | string | null
    totalRecords?: number
    successCount?: number
    errorCount?: number
    status?: string
    errorMessage?: string | null
    startedAt?: Date | string
    completedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type ext_synclogUpdateWithoutConfigInput = {
    id?: StringFieldUpdateOperationsInput | string
    syncType?: StringFieldUpdateOperationsInput | string
    fromDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    toDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalRecords?: IntFieldUpdateOperationsInput | number
    successCount?: IntFieldUpdateOperationsInput | number
    errorCount?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    congty?: ext_congtyUpdateOneWithoutSynclogsNestedInput
  }

  export type ext_synclogUncheckedUpdateWithoutConfigInput = {
    id?: StringFieldUpdateOperationsInput | string
    congtyId?: NullableStringFieldUpdateOperationsInput | string | null
    syncType?: StringFieldUpdateOperationsInput | string
    fromDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    toDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalRecords?: IntFieldUpdateOperationsInput | number
    successCount?: IntFieldUpdateOperationsInput | number
    errorCount?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ext_synclogUncheckedUpdateManyWithoutConfigInput = {
    id?: StringFieldUpdateOperationsInput | string
    congtyId?: NullableStringFieldUpdateOperationsInput | string | null
    syncType?: StringFieldUpdateOperationsInput | string
    fromDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    toDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalRecords?: IntFieldUpdateOperationsInput | number
    successCount?: IntFieldUpdateOperationsInput | number
    errorCount?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
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