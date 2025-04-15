namespace FPP.Models;

public interface IEntity<TId>
{
    TId Id { get; set; }

    string Name { get; set; }
}