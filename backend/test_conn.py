import asyncio
import asyncpg

async def test():
    try:
        conn = await asyncpg.connect(
            host='db.ohqfdnulaflszesoujji.supabase.co',
            port=5432,
            user='postgres',
            password='Jf9u0QgFnrUNCYFI',
            database='postgres',
            server_settings={'application_name': 'test'}
        )
        print("Connected successfully!")
        await conn.close()
        return True
    except Exception as e:
        print(f"Connection failed: {e}")
        return False

asyncio.run(test())
