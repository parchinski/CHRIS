from enum import Enum
from typing import Literal

# Mirror the TypeScript types from frontend exactly
Role = Literal["plinktern", "staff"]

# Availability options matching frontend AVAILABILITY_OPTIONS
AvailabilityOption = Literal["Saturday", "Sunday"]
AVAILABILITY_OPTIONS: tuple[AvailabilityOption, ...] = ("Saturday", "Sunday")

# Shirt size options matching frontend SHIRT_SIZES
ShirtSize = Literal["S", "M", "L", "XL", "XXL"]
SHIRT_SIZES: tuple[ShirtSize, ...] = ("S", "M", "L", "XL", "XXL")


# Database-compatible enums for SQLModel
class RoleEnum(str, Enum):
    PLINKTERN = "plinktern"
    STAFF = "staff"


class ShirtSizeEnum(str, Enum):
    S = "S"
    M = "M"
    L = "L"
    XL = "XL"
    XXL = "XXL"


class AvailabilityOptionEnum(str, Enum):
    SATURDAY = "Saturday"
    SUNDAY = "Sunday"
