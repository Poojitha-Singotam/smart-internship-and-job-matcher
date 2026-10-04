import pymysql
from pymysql.cursors import DictCursor
import os
from config import Config

def get_connection(database=None):
    """
    Establish a connection to MySQL.
    Tries the configured port first, then falls back to 3306 if different.
    """
    ports_to_try = [Config.MYSQL_PORT]
    if Config.MYSQL_PORT != 3306:
        ports_to_try.append(3306)

    last_error = None
    for port in ports_to_try:
        try:
            conn = pymysql.connect(
                host=Config.MYSQL_HOST,
                port=port,
                user=Config.MYSQL_USER,
                password=Config.MYSQL_PASSWORD,
                database=database,
                cursorclass=DictCursor,
                autocommit=True,
                charset='utf8mb4'
            )
            return conn
        except Exception as e:
            last_error = e

    raise ConnectionError(f"Could not connect to MySQL server on ports {ports_to_try}: {last_error}")

def get_db():
    """Returns a connection to the application database."""
    return get_connection(database=Config.MYSQL_DB)

def init_db():
    """
    Initializes the database using schema.sql.
    Creates the database if it doesn't exist and runs table creation scripts.
    """
    # 1. Connect without database to ensure database exists
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{Config.MYSQL_DB}` DEFAULT CHARACTER SET utf8mb4;")
    finally:
        conn.close()

    # 2. Connect to the application database and execute schema.sql statements
    db_conn = get_db()
    try:
        schema_path = os.path.join(os.path.dirname(__file__), 'schema.sql')
        with open(schema_path, 'r', encoding='utf-8') as f:
            sql_script = f.read()

        # Split commands by semicolon while respecting comments and blocks
        statements = sql_script.split(';')
        with db_conn.cursor() as cursor:
            for statement in statements:
                cleaned = statement.strip()
                if cleaned and not cleaned.lower().startswith('create database') and not cleaned.lower().startswith('use '):
                    cursor.execute(cleaned)
        print("Database schema successfully initialized!")
    finally:
        db_conn.close()
