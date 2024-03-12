from typing import Awaitable, Optional
from core.config import get_settings
from redis.asyncio import Redis
from typing import Union
from asyncio import iscoroutine
from pymongo.mongo_client import MongoClient

# Mongo Database

client = MongoClient(get_settings().DB_URL)

# Redis Database

redis = Redis(
    host=get_settings().REDIS_HOST,
    port=get_settings().REDIS_PORT,
)


class RedisCmd:
    """
    Represents a Redis command.

    Args:
        key (str): The key associated with the Redis command.
        mapping (Optional[dict[str, str | int]]): A dictionary representing the mapping for the Redis command.
        value (Optional[str]): The value associated with the Redis command.
        items (Optional[list[str | int]]): A list of items associated with the Redis command.

    Raises:
        ValueError: If `mapping`, `value`, and `items` are provided at the same time.

    Attributes:
        redis: The Redis instance.
        key (str): The key associated with the Redis command.
        value (Optional[str]): The value associated with the Redis command.
        mapping (Optional[dict[str, str | int]]): A dictionary representing the mapping for the Redis command.
        items (Optional[list[str | int]]): A list of items associated with the Redis command.
    """

    def __init__(
        self,
        key: str,
        mapping: Optional[dict[str, str | int]] = None,
        value: Optional[str | Union[bytes, memoryview]] = None,
        items: Optional[list[str | int]] = None,
    ):
        if mapping is not None and value is not None and items is not None:
            raise ValueError(
                "Cannot provide items, mapping, and value at the same time"
            )
        self.redis = redis
        self.key = key
        self.value = value
        self.mapping = mapping
        self.items = items

    async def redisExp(self, exp: int):
        """
        Sets the expiration time for the Redis key.

        Args:
            exp (int): The expiration time in seconds.

        Returns:
            RedisCmd: The current RedisCmd instance.
        """
        return await self.redis.expire(self.key, exp)

    async def redisExpAt(self, exp: int):
        """
        Sets the expiration time for the Redis key using a UNIX timestamp.

        Args:
            exp (int): The expiration time as a UNIX timestamp.

        Returns:
            RedisCmd: The current RedisCmd instance.
        """
        return await self.redis.expireat(self.key, exp)

    def redisExpTime(self):
        """
        Gets the remaining time to live for the Redis key.

        Returns:
            RedisCmd: The current RedisCmd instance.
        """
        return self.redis.expiretime(self.key)

    async def redisDelete(self):
        """
        Deletes the Redis key.

        Returns:
            RedisCmd: The current RedisCmd instance.
        """
        return await self.redis.delete(self.key)


class RedisHashmap(RedisCmd):
    """
    Represents a Redis Hashmap.

    This class provides methods to interact with a Redis Hashmap.
    """

    async def redisHashmap(self):
        """
        Sets the values of the Redis Hashmap.

        If `mapping` is provided, it sets the mapping in the Redis Hashmap.
        If `items` is provided, it sets the items in the Redis Hashmap.
        If `value` is provided, it sets the value in the Redis Hashmap.

        Returns:
            self: The current instance of RedisHashmap.
        """
        value: Awaitable[int] | int
        if self.mapping:
            value = self.redis.hset(
                self.key,
                mapping=self.mapping,
            )
        if self.items:
            value = self.redis.hset(self.key, items=self.items)
        if self.value:
            value = self.redis.hset(self.key, value=str(self.value))

        if iscoroutine(value):
            return await value

    async def redisHashmapGetAll(self, key: str):
        """
        Retrieves all the fields and values from the Redis Hashmap.

        Args:
            key (str): The key of the Redis Hashmap.

        Returns:
            dict: A dictionary containing all the fields and values from the Redis Hashmap.
        """
        value = self.redis.hgetall(key)
        if iscoroutine(value):
            return await value

    async def redisHashmapGet(self, key: str, field: str):
        """
        Retrieves the value of a specific field from the Redis Hashmap.

        Args:
            key (str): The key of the Redis Hashmap.
            field (str): The field to retrieve the value for.

        Returns:
            bytes: The value of the specified field in the Redis Hashmap.
        """
        value = self.redis.hget(key, field)
        if iscoroutine(value):
            return await value


class RedisString(RedisCmd):
    """
    Represents a Redis string data type.
    """

    async def redisString(self, value: Optional[str | Union[bytes, memoryview]] = None):
        """
        Sets the value of the Redis string.
        If the value is a non-empty string, it is stored in Redis.
        """
        if isinstance(self.value, str) and self.value:
            await self.redis.set(self.key, self.value)
        if value:
            await self.redis.set(self.key, value)
        return self

    async def redisStringGet(self, key: Optional[str] = None):
        """
        Retrieves the value of the Redis string.
        If a key is provided, it retrieves the value associated with that key.
        If no key is provided, it retrieves the value associated with the current key.
        """
        if key:
            return await self.redis.get(key)
        return await self.redis.get(self.key)
