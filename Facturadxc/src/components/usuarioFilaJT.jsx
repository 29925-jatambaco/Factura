export const UsuarioFilaJT = ({ manejarDeleteUsuario, manejarSelectUsuario, id, usrnombre, cedula, edad, telefono }) => {
  const onDelete = () => {
    manejarDeleteUsuario(id);
  }

  return (
    <tr key={id}>
      <td>{id}</td>
      <td>{usrnombre}</td>
      <td>{cedula}</td>
      <td>{edad}</td>
      <td>{telefono || ""}</td>
      <td>
        <button className="btn btn-warning" onClick={() =>
          manejarSelectUsuario({
            id, usrnombre, cedula, edad, telefono
          })}>Actualizar</button>
      </td>
      <td>
        <button className="btn btn-danger" onClick={() => onDelete(id)}>
          Eliminar
        </button>
      </td>
    </tr>
  )
}
