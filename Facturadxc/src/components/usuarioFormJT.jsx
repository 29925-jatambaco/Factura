import { useState, useEffect } from "react";

const inicioUsuarioFormJT = {
  usrnombre: 'Dario',
  cedula: '1723456789',
  edad: '22',
  telefono: ''
}

export const UsuarioFormJT = ({ usuarioJTSelect, manejarAddUsuario, manejarUpdateUsuario }) => {
  const [usuarioJTForm, setUsuarioJTForm] = useState(inicioUsuarioFormJT);
  const { id, usrnombre, cedula, edad, telefono } = usuarioJTForm;

  useEffect(() => {
    if (usuarioJTSelect && usuarioJTSelect.id) {
      setUsuarioJTForm({
        ...usuarioJTSelect
      });
    } else {
      setUsuarioJTForm(inicioUsuarioFormJT);
    }
  }, [usuarioJTSelect]);

  const onInputChange = ({ target }) => {
    const { name, value } = target;
    setUsuarioJTForm({
      ...usuarioJTForm,
      [name]: value
    });
  }

  const onSubmit = (event) => {
    event.preventDefault();
    if (!usrnombre || !cedula || !edad) {
      alert("Por favor complete todos los campos");
      return;
    }
    
    if (id) {
      manejarUpdateUsuario(usuarioJTForm);
    } else {
      manejarAddUsuario(usuarioJTForm);
    }
    setUsuarioJTForm(inicioUsuarioFormJT);
  }

  return (
    <>
      <div className="container mt-4">
        <h1>UsuarioFormJT</h1>
        <form onSubmit={onSubmit}>
          <input type="text" placeholder="Nombre" className="form-control mb-2"
            name="usrnombre"
            value={usrnombre || ""}
            onChange={onInputChange}
          />
          <input type="cedula" placeholder="Cedula" className="form-control mb-2"
            name="cedula"
            value={cedula || ""}
            onChange={onInputChange}
          />
          <input type="number" placeholder="Edad" className="form-control mb-2"
            name="edad"
            value={edad || ""}
            onChange={onInputChange}
          />
          <input type="tel" placeholder="Teléfono" className="form-control mb-2"
            name="telefono"
            value={telefono || ""}
            onChange={onInputChange}
          />
          <button className="btn btn-primary">{id ? "Actualizar" : "Agregar"}</button>
        </form>
      </div>
    </>
  )
}
