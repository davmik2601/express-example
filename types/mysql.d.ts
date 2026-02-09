import mysql2 from "mysql2/promise";

declare module 'mysql2' {
  interface Pool {
    _freeConnections?: readonly unknown[]
    _allConnections?: readonly unknown[]
    _connectionQueue?: readonly unknown[]
  }
}

declare global {
  namespace Mysql {
    type Pool = mysql2.Pool
    type PoolConnection = mysql2.PoolConnection
    type ResultSetHeader = import('mysql2/promise').ResultSetHeader
    type FieldPacket = import('mysql2').FieldPacket
    type RowDataPacket = import('mysql2').RowDataPacket
    type QueryResult = import('mysql2').QueryResult
    // ...
    // ... other mysql related types can be added here if needed
  }
}

export {}
