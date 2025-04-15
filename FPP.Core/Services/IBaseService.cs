
namespace FPP.Core.Services;

using Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using Fanex.Data.Repository;

public interface IBaseService
{
    Task<IEnumerable<T>> GetDataAsync<T>(ICriteria criteria);

    Task<CommandResult> ExecuteNonQueryAsync(ICriteria command);

    Task<T> GetDataEntityAsync<T>(ICriteria criteria);

    Task<(IEnumerable<TFirst>, IEnumerable<TSecond>)> FetchMultipleAsync<TFirst, TSecond>(ICriteria criteria);

    Task<(IEnumerable<TFirst>, IEnumerable<TSecond>, IEnumerable<TThird>)> FetchMultipleAsync<TFirst, TSecond, TThird>(ICriteria criteria);
}