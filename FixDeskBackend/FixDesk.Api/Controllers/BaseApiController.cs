using System.Security.Claims;
using FixDesk.Entities.Enums;
using Microsoft.AspNetCore.Mvc;

namespace FixDesk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class BaseApiController : ControllerBase
{
    protected int CurrentUserId
    {
        get
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                        ?? User.FindFirst("sub")?.Value;
            return int.TryParse(claim, out int id) ? id : 0;
        }
    }

    protected UserRole CurrentUserRole
    {
        get
        {
            var claim = User.FindFirst(ClaimTypes.Role)?.Value
                        ?? User.FindFirst("role")?.Value;
            return Enum.TryParse<UserRole>(claim, true, out var role) ? role : UserRole.BranchEmployee;
        }
    }

    protected int? CurrentBranchId
    {
        get
        {
            var claim = User.FindFirst("branchId")?.Value
                        ?? User.FindFirst("BranchId")?.Value;
            return int.TryParse(claim, out int id) ? id : null;
        }
    }
}
