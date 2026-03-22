import psycopg2

DATABASE_URL = "postgresql://root:password@localhost:5432/n8n"

def main():
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
    tables = cur.fetchall()
    print("Tables in public schema:")
    for t in tables:
        print(t[0])
    conn.close()

if __name__ == "__main__":
    main()
