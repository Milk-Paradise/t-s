import { Plus, Pencil, Trash2 } from "lucide-react";
export default function Toolbar({
  selected,
  disabled,
  onAdd,
  onEdit,
  onDelete,
}) {
  return (
    <div className="toolbar">
      <button className="button primary" disabled={disabled} onClick={onAdd}>
        <Plus size={15} />
        Добавить запись
      </button>
      <button
        className="button"
        disabled={disabled || !selected}
        onClick={onEdit}
      >
        <Pencil size={14} />
        Изменить
      </button>
      <button
        className="button danger"
        disabled={disabled || !selected}
        onClick={onDelete}
      >
        <Trash2 size={14} />
        Удалить
      </button>
    </div>
  );
}
