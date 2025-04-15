namespace FPP.Models;

public class EntityBase<TId> : IEntity<TId>
{
    public TId Id { get; set; }

    public string Name { get; set; }
}