from core.db.database import client


async def get_user(email: str):
    try:
        users = client["demo"]["users"]

        if users is None:
            return None

        value = users.find_one({"email": email})

        value['_id'] = str(value['_id'])
        value["created_at"] = value["created_at"].isoformat()

        return value

    except Exception as e:
        print(e)
