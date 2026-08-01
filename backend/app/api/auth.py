from fastapi import APIRouter, Depends
from sqlmodel.ext.asyncio.session import AsyncSession
from app.database.session import get_session
from app.core.security import get_current_user, get_user_via_api_key
from app.models.identity import User

router = APIRouter()

@router.get("/me")
async def get_current_user_info(
    current_user: User = Depends(get_user_via_api_key),
    session: AsyncSession = Depends(get_session)
):
    """
    Returns the currently authenticated user's information.
    """
    return {
        "id": str(current_user.id),
        "name": current_user.name,
        "email": current_user.email
    }
