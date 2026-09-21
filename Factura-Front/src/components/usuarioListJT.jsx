import { UsuarioFilaJT } from "./usuarioFilaJT"

export const UsuarioListJT = ({ manejarSelectUsuario, manejarDeleteUsuario, usuariosJT = [] }) => {
  return (
    <div>
      <h1>UsuarioListJT</h1>
      <table className="table">
        <thead>
          <tr>
            <th>id</th>
            <th>Nombre</th>
            <th>cedula</th>
            <th>edad</th>
            <th>telefono</th>
            <th>eliminar</th>
          </tr>
        </thead>
        <tbody>
          {usuariosJT.map((usuario) => (
            <UsuarioFilaJT
              key={usuario.id}
              id={usuario.id}
              usrnombre={usuario.usrnombre}
              cedula={usuario.cedula}
              edad={usuario.edad}
              telefono={usuario.telefono}
              manejarSelectUsuario={manejarSelectUsuario}
              manejarDeleteUsuario={manejarDeleteUsuario}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
