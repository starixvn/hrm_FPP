using FPP.Core.Criteria.ActivityLog;
using FPP.Core.Models;

namespace FPP.Core.Services;

public interface IActivityLogService
{
    Task LogActivity(InsertActivityLogCriteria criteria);
    Task<IEnumerable<ActivityLog>> GetLogActivity(GetActivityLogCriteria criteria);
}

public class ActivityLogService(IBaseService baseService) : IActivityLogService
{
    public async Task LogActivity(InsertActivityLogCriteria criteria)
    {
        await baseService.ExecuteNonQueryAsync(criteria);
    }

    public async Task<IEnumerable<ActivityLog>> GetLogActivity(GetActivityLogCriteria criteria)
    {
        return await baseService.GetDataAsync<ActivityLog>(criteria);

    }
}
