from pydantic import BaseModel


class PlatformResponse(BaseModel):
    id: int
    name: str
    type: str
    enabled: bool

    class Config:
        from_attributes = True
