import os
import psycopg2
import base64
from dotenv import load_dotenv

load_dotenv()

db_url = os.getenv("ENV_APP_DB_URL")
db_username = os.getenv("ENV_APP_DB_USERNAME")
db_password = base64.b64decode(os.getenv("SECRET_APP_DB_PASSWORD")).decode('utf-8')

try:
    url_parts = db_url.split('://')[1].split('/')
    host_port = url_parts[0]
    dbname = url_parts[1]
    host, port = host_port.split(':')
except IndexError:
    print("Error: The database URL format is incorrect.")
    exit(1)

conn = None
cursor = None
try:
    conn = psycopg2.connect(
        host=host,
        port=port,
        user=db_username,
        password=db_password,
        dbname=dbname
    )
    cursor = conn.cursor()
    cursor.execute("SELECT count(*) FROM events;")
    result = cursor.fetchone()
    print(f"Count from 'events' table: {result[0]}")

except psycopg2.Error as e:
    print(f"An error occurred: {e}")

finally:
    if cursor:
        cursor.close()
    if conn:
        conn.close()
