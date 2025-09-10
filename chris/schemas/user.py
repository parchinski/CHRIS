from typing import Optional

from pydantic import BaseModel, EmailStr

from chris.types import AvailabilityOption, ShirtSize


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    team_name: Optional[str] = None
    availability: Optional[list[AvailabilityOption]] = None
    shirt_size: Optional[ShirtSize] = None
    dietary_restrictions: Optional[str] = None
    notes: Optional[str] = None
    can_take_photos: Optional[bool] = None
