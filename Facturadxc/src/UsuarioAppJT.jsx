import { useEffect, useState } from "react";
import * as api from "./services/useServices";

export const UsuarioAppJT = () => {
    // Datos del Estudiante
    const estudianteNombre = 'Jonathan Tambaco';
    const estudianteInitials = 'JT';

    // Sección activa de navegación
    const [seccion, setSeccion] = useState('facturar'); // facturar, clientes, productos, historial

    // Listados de datos
    const [clientes, setClientes] = useState([]);
    const [productos, setProductos] = useState([]);
    const [facturas, setFacturas] = useState([]);

    // Estado del Formulario de Cliente
    const [clienteForm, setClienteForm] = useState({
        id: null,
        nombre: '',
        cedula: '',
        edad: '',
        telefono: ''
    });

    // Estado del Formulario de Producto
    const [productoForm, setProductoForm] = useState({
        id: null,
        nombre: '',
        precio_unitario: '',
        cantidad: ''
    });

    // Estado de Factura Actual
    const [facturaClienteId, setFacturaClienteId] = useState('');
    const [facturaItems, setFacturaItems] = useState([]);
    const [descuentoPorcentaje, setDescuentoPorcentaje] = useState(0);

    // Selección temporal de producto a agregar a la factura
    const [tempProductoId, setTempProductoId] = useState('');
    const [tempCantidad, setTempCantidad] = useState(1);

    // Factura seleccionada para ver detalles
    const [selectedFactura, setSelectedFactura] = useState(null);

    // Cargar datos del backend al iniciar la aplicación
    const cargarDatos = async () => {
        try {
            const resClientes = await api.findAllClientes();
            const resProductos = await api.findAllProductos();
            const resFacturas = await api.findAllFacturas();
            
            if (resClientes && resClientes.data) setClientes(resClientes.data);
            if (resProductos && resProductos.data) setProductos(resProductos.data);
            if (resFacturas && resFacturas.data) setFacturas(resFacturas.data);
        } catch (error) {
            console.error("Error de conexión con el backend:", error);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    // --- CRUD Clientes (cliente_DXC) ---
    const manejarCambioCliente = (e) => {
        const { name, value } = e.target;
        setClienteForm({ ...clienteForm, [name]: value });
    };

    const guardarCliente = async (e) => {
        e.preventDefault();
        const { id, nombre, cedula, edad, telefono } = clienteForm;
        if (!nombre || !cedula || !edad || !telefono) {
            alert("Complete todos los campos del cliente.");
            return;
        }

        try {
            if (id) {
                await api.updateCliente(clienteForm);
                alert("Cliente actualizado con éxito.");
            } else {
                await api.saveCliente(clienteForm);
                alert("Cliente guardado con éxito.");
            }
            setClienteForm({ id: null, nombre: '', cedula: '', edad: '', telefono: '' });
            cargarDatos();
        } catch (error) {
            alert("Error al procesar cliente: " + (error.response?.data?.error || error.message));
        }
    };

    const editarCliente = (cli) => {
        setClienteForm({ ...cli });
    };

    const eliminarCliente = async (id) => {
        if (window.confirm("¿Seguro que desea eliminar este cliente?")) {
            try {
                await api.removeCliente(id);
                cargarDatos();
                if (facturaClienteId === id) setFacturaClienteId('');
            } catch (error) {
                alert("Error al eliminar cliente: " + (error.response?.data?.error || error.message));
            }
        }
    };

    // --- CRUD Productos (producto_JTX) ---
    const manejarCambioProducto = (e) => {
        const { name, value } = e.target;
        setProductoForm({ ...productoForm, [name]: value });
    };

    const guardarProducto = async (e) => {
        e.preventDefault();
        const { id, nombre, precio_unitario, cantidad } = productoForm;
        if (!nombre || precio_unitario === '' || cantidad === '') {
            alert("Complete todos los campos del producto.");
            return;
        }

        try {
            if (id) {
                await api.updateProducto(productoForm);
                alert("Producto actualizado con éxito.");
            } else {
                await api.saveProducto(productoForm);
                alert("Producto guardado con éxito.");
            }
            setProductoForm({ id: null, nombre: '', precio_unitario: '', cantidad: '' });
            cargarDatos();
        } catch (error) {
            alert("Error al procesar producto: " + (error.response?.data?.error || error.message));
        }
    };

    const editarProducto = (prod) => {
        setProductoForm({ ...prod });
    };

    const eliminarProducto = async (id) => {
        if (window.confirm("¿Seguro que desea eliminar este producto?")) {
            try {
                await api.removeProducto(id);
                cargarDatos();
            } catch (error) {
                alert("Error al eliminar producto: " + (error.response?.data?.error || error.message));
            }
        }
    };

    // --- LOGICA DE DETALLE DE LA FACTURA ---
    const agregarItemAFactura = () => {
        if (!tempProductoId) {
            alert("Seleccione un producto");
            return;
        }
        const prod = productos.find(p => p.id === parseInt(tempProductoId));
        if (!prod) return;

        const cantidadInt = parseInt(tempCantidad) || 0;
        if (cantidadInt <= 0) {
            alert("La cantidad debe ser mayor a 0");
            return;
        }

        const precioNum = parseFloat(prod.precio_unitario) || 0;
        const stockNum = parseInt(prod.cantidad) || 0;

        if (stockNum < cantidadInt) {
            alert(`Stock insuficiente. Solo quedan ${stockNum} unidades.`);
            return;
        }

        // Revisar si ya existe en la lista
        const itemExistenteIndex = facturaItems.findIndex(item => item.producto_id === prod.id);
        if (itemExistenteIndex !== -1) {
            const nuevosItems = [...facturaItems];
            const itemActual = nuevosItems[itemExistenteIndex];
            const precioActual = parseFloat(itemActual.precio_unitario) || precioNum;
            const nuevaCantAcumulada = (parseInt(itemActual.cantidad) || 0) + cantidadInt;

            if (stockNum < nuevaCantAcumulada) {
                alert(`Stock insuficiente para acumular. Solo quedan ${stockNum} unidades.`);
                return;
            }
            itemActual.cantidad = nuevaCantAcumulada;
            itemActual.precio_unitario = precioActual;
            itemActual.subtotal = nuevaCantAcumulada * precioActual;
            setFacturaItems(nuevosItems);
        } else {
            setFacturaItems([...facturaItems, {
                producto_id: prod.id,
                nombre: prod.nombre,
                precio_unitario: precioNum,
                cantidad: cantidadInt,
                subtotal: precioNum * cantidadInt
            }]);
        }
        setTempProductoId('');
        setTempCantidad(1);
    };

    const eliminarItemDeFactura = (idx) => {
        const nuevosItems = facturaItems.filter((_, i) => i !== idx);
        setFacturaItems(nuevosItems);
    };

    const cambiarCantidadItem = (idx, nuevaCant) => {
        const cant = parseInt(nuevaCant) || 0;
        if (cant <= 0) {
            eliminarItemDeFactura(idx);
            return;
        }
        const nuevosItems = [...facturaItems];
        const item = nuevosItems[idx];
        const prod = productos.find(p => p.id === item.producto_id);
        if (!prod) return;

        const stockNum = parseInt(prod.cantidad) || 0;
        const precioNum = parseFloat(item.precio_unitario) || 0;

        if (stockNum < cant) {
            alert(`Stock insuficiente. Máximo disponible: ${stockNum}`);
            item.cantidad = stockNum;
        } else {
            item.cantidad = cant;
        }
        item.subtotal = item.cantidad * precioNum;
        setFacturaItems(nuevosItems);
    };

    // --- CÁLCULOS EN TIEMPO REAL (IVA y Descuento) ---
    const subtotalFactura = facturaItems.reduce((acc, item) => acc + (parseFloat(item.subtotal) || 0), 0);

    // Calcular descuento
    let pctDescuento = parseFloat(descuentoPorcentaje) || 0;
    // Regla de descuento automático del 10% si subtotal > 100 y descuentoPorcentaje es 0
    if (pctDescuento === 0 && subtotalFactura > 100) {
        pctDescuento = 10;
    }
    const descuentoFactura = subtotalFactura * (pctDescuento / 100);
    const subtotalConDescuento = subtotalFactura - descuentoFactura;
    // 15% IVA
    const ivaFactura = subtotalConDescuento * 0.15;
    const totalFactura = subtotalConDescuento + ivaFactura;

    // --- PERSISTENCIA DE FACTURA ---
    const guardarFacturaCompleta = async () => {
        if (!facturaClienteId) {
            alert("Seleccione un cliente para la factura.");
            return;
        }
        if (facturaItems.length === 0) {
            alert("Agregue al menos un producto a la factura.");
            return;
        }

// PAYLOAD CORREGIDO: Enviamos exactamente lo que pide Spring Boot
        const payload = {
            cliente_id: parseInt(facturaClienteId),
            subtotal: subtotalFactura,
            descuento: descuentoFactura,
            iva: ivaFactura,
            total: totalFactura,
            items: facturaItems.map(item => ({
                producto_id: item.producto_id,
                cantidad: item.cantidad,
                precio_unitario: item.precio_unitario,
                subtotal: item.subtotal
            }))
        };

        try {
            const res = await api.saveFactura(payload);
            alert("Factura guardada correctamente en la Base de Datos.");
            
            // Limpiar factura
            setFacturaClienteId('');
            setFacturaItems([]);
            setDescuentoPorcentaje(0);
            cargarDatos();
            
            // Ver la factura guardada inmediatamente
            if (res && res.data) {
                verDetallesFactura(res.data);
            }
        } catch (error) {
            alert("Error al guardar la factura: " + (error.response?.data?.error || error.message));
        }
    };

    const verDetallesFactura = async (factura) => {
        try {
            const res = await api.findFacturaById(factura.id);
            if (res && res.data) {
                setSelectedFactura(res.data);
                setSeccion('historial');
            }
        } catch (error) {
            alert("Error al cargar detalles de factura: " + error.message);
        }
    };

    const eliminarFactura = async (id) => {
        if (window.confirm("¿Seguro que desea eliminar esta factura? Esto restaurará el stock de los productos.")) {
            try {
                await api.removeFactura(id);
                alert("Factura eliminada con éxito.");
                if (selectedFactura && selectedFactura.id === id) {
                    setSelectedFactura(null);
                }
                cargarDatos();
            } catch (error) {
                alert("Error al eliminar factura: " + (error.response?.data?.error || error.message));
            }
        }
    };

    const padId = (id) => {
        if (!id) return '';
        return String(id).padStart(4, '0');
    };

    const getNombreCliente = (id) => {
        const c = clientes.find(cli => cli.id === parseInt(id));
        return c ? c.nombre : 'Cliente Desconocido';
    };

    return (
        <div className="container-fluid px-4 py-3">
            {/* Header ESPE */}
            <header className="espe-header p-4 mb-4 rounded-3 shadow-sm d-flex flex-wrap align-items-center justify-content-between text-white" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)', borderBottom: '5px solid #f8c21a' }}>

                <div className="text-md-end text-start mt-2 mt-md-0 d-flex align-items-center gap-4 justify-content-end flex-wrap">
                    <div className="d-flex gap-4 align-items-center">
                        <img
                            src="/ESPEtransparente.png"
                            alt="Logo ESPE"
                            style={{ height: '110px', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))', backgroundColor: 'white', padding: '6px', borderRadius: '12px' }}
                        />
                        <img
                            src="/masc.jpg"
                            alt="Mascota"
                            style={{ height: '110px', width: '110px', objectFit: 'cover', borderRadius: '50%', border: '4px solid #f8c21a', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                        />
                    </div>
                    <div className="text-end">
                        <h5 className="mb-0 fw-bold">Estudiante: {estudianteNombre}</h5>
                        <span className="badge" style={{ backgroundColor: '#f8c21a', color: '#1e293b', fontWeight: 'bold' }}>Iniciales: {estudianteInitials}</span>
                    </div>
                </div>
            </header>



            {/* Menu de Navegación */}
            <ul className="nav nav-pills mb-4 gap-2 bg-dark p-2 rounded-3 shadow-sm">

                <li className="nav-item">
                    <button className={`nav-link text-white ${seccion === 'clientes' ? 'active bg-warning text-dark fw-bold' : ''}`} onClick={() => setSeccion('clientes')}>
                        Clientes 
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link text-white ${seccion === 'productos' ? 'active bg-warning text-dark fw-bold' : ''}`} onClick={() => setSeccion('productos')}>
                        Productos
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link text-white ${seccion === 'historial' ? 'active bg-warning text-dark fw-bold' : ''}`} onClick={() => setSeccion('historial')}>
                        Historial y Detalles
                    </button>
                </li>
                                <li className="nav-item">
                    <button className={`nav-link text-white ${seccion === 'facturar' ? 'active bg-warning text-dark fw-bold' : ''}`} onClick={() => setSeccion('facturar')}>
                        Generar Factura
                    </button>
                </li>
            </ul>

            {/* Secciones del Aplicativo */}

            {/* SECCIÓN 1: FACTURAR */}
            {seccion === 'facturar' && (
                <div className="row">
                    <div className="col-lg-5 mb-4">
                        <div className="card shadow-sm p-4 bg-white border-0 rounded-3">
                            <h4 className="fw-bold mb-3 text-primary">Nueva Factura</h4>
                            <hr />
                            
                            <div className="mb-3">
                                <label className="form-label fw-bold">Seleccionar Cliente</label>
                                <select className="form-select" value={facturaClienteId} onChange={(e) => setFacturaClienteId(e.target.value)}>
                                    <option value="">-- Seleccione un cliente --</option>
                                    {clientes.map(cli => (
                                        <option key={cli.id} value={cli.id}>{cli.nombre} - Cédula: {cli.cedula}</option>
                                    ))}
                                </select>
                            </div>

                            <h5 className="fw-bold mt-4 mb-3 text-secondary">Agregar Producto</h5>
                            <div className="row g-2">
                                <div className="col-8">
                                    <label className="form-label small fw-bold">Producto</label>
                                    <select className="form-select" value={tempProductoId} onChange={(e) => setTempProductoId(e.target.value)}>
                                        <option value="">-- Seleccione un producto --</option>
                                        {productos.map(p => (
                                            <option key={p.id} value={p.id}>{p.nombre} (${parseFloat(p.precio_unitario).toFixed(2)} - Stock: {p.cantidad})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-4">
                                    <label className="form-label small fw-bold">Cantidad</label>
                                    <input type="number" className="form-control" value={tempCantidad} onChange={(e) => setTempCantidad(e.target.value)} min="1" />
                                </div>
                            </div>
                            <button className="btn btn-primary mt-3 w-100 fw-bold" onClick={agregarItemAFactura}>
                                Agregar Producto a Factura
                            </button>

                            <div className="mb-3 mt-4">
                                <label className="form-label fw-bold">Porcentaje Descuento Especial (%)</label>
                                <input type="number" className="form-control" value={descuentoPorcentaje} onChange={(e) => setDescuentoPorcentaje(e.target.value)} min="0" max="100" />
                                <div className="form-text">Si se mantiene en 0%, se aplica un 10% automático si el subtotal supera los $100.</div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-7 mb-4">
                        <div className="card shadow-sm p-4 bg-white border-0 rounded-3" style={{ borderLeft: '5px solid #1e40af' }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="fw-bold mb-0 text-primary">Detalle de Factura</h4>
                                <button className="btn btn-outline-danger btn-sm" onClick={() => setFacturaItems([])} disabled={facturaItems.length === 0}>Limpiar</button>
                            </div>
                            <hr />

                            {facturaClienteId && (
                                <div className="mb-3 p-3 bg-light rounded small">
                                    <strong>Cliente:</strong> {getNombreCliente(facturaClienteId)}
                                </div>
                            )}

                            <div className="table-responsive" style={{ minHeight: '200px' }}>
                                <table className="table align-middle">
                                    <thead>
                                        <tr>
                                            <th>Producto</th>
                                            <th className="text-end" style={{ width: '100px' }}>Precio U.</th>
                                            <th className="text-center" style={{ width: '100px' }}>Cantidad</th>
                                            <th className="text-end" style={{ width: '100px' }}>Subtotal</th>
                                            <th className="text-center" style={{ width: '80px' }}>Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {facturaItems.length === 0 ? (
                                            <tr>
                                                <td colspan="5" className="text-center py-5 text-muted">No hay ítems en la factura.</td>
                                            </tr>
                                        ) : (
                                            facturaItems.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="fw-bold">{item.nombre}</td>
                                                    <td className="text-end">${item.precio_unitario.toFixed(2)}</td>
                                                    <td className="text-center">
                                                        <input type="number" className="form-control form-control-sm text-center" value={item.cantidad} onChange={(e) => cambiarCantidadItem(idx, e.target.value)} min="1" />
                                                    </td>
                                                    <td className="text-end font-monospace">${item.subtotal.toFixed(2)}</td>
                                                    <td className="text-center">
                                                        <button className="btn btn-sm btn-outline-danger py-0 px-2" onClick={() => eliminarItemDeFactura(idx)}>&times;</button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="card bg-light p-3 border-0 mt-3">
                                <div className="d-flex justify-content-between mb-1 small text-muted">
                                    <span>Subtotal:</span>
                                    <span>${subtotalFactura.toFixed(2)}</span>
                                </div>
                                {descuentoFactura > 0 && (
                                    <div className="d-flex justify-content-between mb-1 small text-danger fw-bold">
                                        <span>Descuento aplicado:</span>
                                        <span>-${descuentoFactura.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="d-flex justify-content-between mb-1 small text-muted">
                                    <span>Subtotal Neto:</span>
                                    <span>${subtotalConDescuento.toFixed(2)}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-1 small text-muted">
                                    <span>IVA (15%):</span>
                                    <span>${ivaFactura.toFixed(2)}</span>
                                </div>
                                <div className="d-flex justify-content-between pt-2 border-top fw-bold text-primary" style={{ fontSize: '1.2rem' }}>
                                    <span>TOTAL A PAGAR:</span>
                                    <span>${totalFactura.toFixed(2)}</span>
                                </div>
                            </div>

                            <button className="btn btn-primary mt-4 w-100 py-3 fw-bold" onClick={guardarFacturaCompleta} disabled={facturaItems.length === 0 || !facturaClienteId}>
                                Guardar Factura en Base de Datos
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* SECCIÓN 2: CLIENTES */}
            {seccion === 'clientes' && (
                <div className="row">
                    <div className="col-md-4 mb-4">
                        <div className="card shadow-sm p-4 bg-white border-0 rounded-3">
                            <h4 className="fw-bold mb-3 text-primary">{clienteForm.id ? 'Actualizar Cliente' : 'Nuevo Cliente'}</h4>
                            <hr />
                            <form onSubmit={guardarCliente}>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Nombre Completo</label>
                                    <input type="text" className="form-control" name="nombre" value={clienteForm.nombre} onChange={manejarCambioCliente} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Cédula</label>
                                    <input type="text" className="form-control" name="cedula" value={clienteForm.cedula} onChange={manejarCambioCliente} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Edad</label>
                                    <input type="number" className="form-control" name="edad" value={clienteForm.edad} onChange={manejarCambioCliente} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Teléfono</label>
                                    <input type="text" className="form-control" name="telefono" value={clienteForm.telefono} onChange={manejarCambioCliente} required />
                                </div>
                                <div className="d-flex gap-2 mt-4">
                                    <button type="submit" className="btn btn-primary flex-grow-1 py-2 fw-bold">
                                        {clienteForm.id ? 'Actualizar' : 'Guardar Cliente'}
                                    </button>
                                    {clienteForm.id && (
                                        <button type="button" className="btn btn-outline-secondary" onClick={() => setClienteForm({ id: null, nombre: '', cedula: '', edad: '', telefono: '' })}>
                                            Cancelar
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="col-md-8 mb-4">
                        <div className="card shadow-sm p-4 bg-white border-0 rounded-3">
                            <h4 className="fw-bold mb-3 text-primary">Listado de Clientes</h4>
                            <hr />
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead>
                                        <tr>
                                            <th>Nombre</th>
                                            <th>Cédula</th>
                                            <th className="text-center">Edad</th>
                                            <th>Teléfono</th>
                                            <th className="text-center">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {clientes.length === 0 ? (
                                            <tr>
                                                <td colspan="5" className="text-center py-3 text-muted">No hay clientes registrados.</td>
                                            </tr>
                                        ) : (
                                            clientes.map(cli => (
                                                <tr key={cli.id}>
                                                    <td className="fw-bold">{cli.nombre}</td>
                                                    <td>{cli.cedula}</td>
                                                    <td className="text-center">{cli.edad} años</td>
                                                    <td>{cli.telefono}</td>
                                                    <td className="text-center">
                                                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => editarCliente(cli)}>Editar</button>
                                                        <button className="btn btn-sm btn-outline-danger" onClick={() => eliminarCliente(cli.id)}>Eliminar</button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SECCIÓN 3: PRODUCTOS */}
            {seccion === 'productos' && (
                <div className="row">
                    <div className="col-md-4 mb-4">
                        <div className="card shadow-sm p-4 bg-white border-0 rounded-3">
                            <h4 className="fw-bold mb-3 text-primary">{productoForm.id ? 'Actualizar Producto' : 'Nuevo Producto'}</h4>
                            <hr />
                            <form onSubmit={guardarProducto}>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Nombre del Producto</label>
                                    <input type="text" className="form-control" name="nombre" value={productoForm.nombre} onChange={manejarCambioProducto} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Precio Unitario ($)</label>
                                    <input type="number" className="form-control" name="precio_unitario" step="0.01" value={productoForm.precio_unitario} onChange={manejarCambioProducto} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Stock Inicial</label>
                                    <input type="number" className="form-control" name="cantidad" value={productoForm.cantidad} onChange={manejarCambioProducto} required />
                                </div>
                                <div className="d-flex gap-2 mt-4">
                                    <button type="submit" className="btn btn-primary flex-grow-1 py-2 fw-bold">
                                        {productoForm.id ? 'Actualizar' : 'Guardar Producto'}
                                    </button>
                                    {productoForm.id && (
                                        <button type="button" className="btn btn-outline-secondary" onClick={() => setProductoForm({ id: null, nombre: '', precio_unitario: '', cantidad: '' })}>
                                            Cancelar
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="col-md-8 mb-4">
                        <div className="card shadow-sm p-4 bg-white border-0 rounded-3">
                            <h4 className="fw-bold mb-3 text-primary">Inventario de Productos</h4>
                            <hr />
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead>
                                        <tr>
                                            <th>Nombre</th>
                                            <th className="text-end">Precio Unitario</th>
                                            <th className="text-center">Stock</th>
                                            <th className="text-center">Estado</th>
                                            <th className="text-center">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productos.length === 0 ? (
                                            <tr>
                                                <td colspan="5" className="text-center py-3 text-muted">No hay productos registrados.</td>
                                            </tr>
                                        ) : (
                                            productos.map(prod => (
                                                <tr key={prod.id}>
                                                    <td className="fw-bold">{prod.nombre}</td>
                                                    <td className="text-end">${parseFloat(prod.precio_unitario).toFixed(2)}</td>
                                                    <td className="text-center">{prod.cantidad}</td>
                                                    <td className="text-center">
                                                        {prod.cantidad > 10 ? (
                                                            <span className="badge bg-primary">Disponible</span>
                                                        ) : prod.cantidad > 0 ? (
                                                            <span className="badge bg-warning text-dark">Stock Bajo</span>
                                                        ) : (
                                                            <span className="badge bg-danger">Agotado</span>
                                                        )}
                                                    </td>
                                                    <td className="text-center">
                                                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => editarProducto(prod)}>Editar</button>
                                                        <button className="btn btn-sm btn-outline-danger" onClick={() => eliminarProducto(prod.id)}>Eliminar</button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SECCIÓN 4: HISTORIAL */}
            {seccion === 'historial' && (
                <div className="row">
                    <div className="col-lg-6 mb-4">
                        <div className="card shadow-sm p-4 bg-white border-0 rounded-3 h-100">
                            <h4 className="fw-bold mb-3 text-primary">Facturas Guardadas</h4>
                            <hr />
                            <div className="table-responsive" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                                <table className="table table-hover align-middle">
                                    <thead>
                                        <tr>
                                            <th>Factura #</th>
                                            <th>Cliente</th>
                                            <th>Fecha</th>
                                            <th className="text-end">Total</th>
                                            <th className="text-center">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {facturas.length === 0 ? (
                                            <tr>
                                                <td colspan="5" className="text-center py-3 text-muted">No hay facturas guardadas.</td>
                                            </tr>
                                        ) : (
                                            facturas.map(fact => (
                                                <tr key={fact.id} className={selectedFactura && selectedFactura.id === fact.id ? 'table-primary' : ''}>
                                                    <td className="fw-bold font-monospace">FACT-{padId(fact.id)}</td>
                                                    <td>{fact.cliente?.nombre || 'Desconocido'}</td>
                                                    <td className="small">{new Date(fact.fecha).toLocaleString()}</td>
                                                    <td className="text-end font-monospace fw-bold">${parseFloat(fact.total).toFixed(2)}</td>
                                                    <td className="text-center">
                                                        <button className="btn btn-sm btn-outline-success me-2" onClick={() => verDetallesFactura(fact)}>Detalle</button>
                                                        <button className="btn btn-sm btn-outline-danger" onClick={() => eliminarFactura(fact.id)}>Eliminar</button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-6 mb-4">
                        {selectedFactura ? (
                            <div className="card shadow-sm p-4 bg-white border-0 rounded-3 h-100">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h4 className="fw-bold mb-0 text-primary">Detalle de Factura #{selectedFactura.id}</h4>
                                    <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedFactura(null)}>Cerrar</button>
                                </div>
                                <hr />
                                <div className="row mb-4 small">
                                    <div className="col-6">
                                        <h6 className="fw-bold text-muted mb-1">CLIENTE</h6>
                                        <div><strong>Nombre:</strong> {selectedFactura.cliente?.nombre}</div>
                                        <div><strong>Cédula:</strong> {selectedFactura.cliente?.cedula}</div>
                                        <div><strong>Edad:</strong> {selectedFactura.cliente?.edad} años</div>
                                        <div><strong>Teléfono:</strong> {selectedFactura.cliente?.telefono}</div>
                                    </div>
                                    <div className="col-6 text-end">
                                        <h6 className="fw-bold text-muted mb-1">FACTURACIÓN</h6>
                                        <div><strong>Número:</strong> FACT-{padId(selectedFactura.id)}</div>
                                        <div><strong>Fecha:</strong> {new Date(selectedFactura.fecha).toLocaleString()}</div>
                                        <div><strong>Estado:</strong> <span className="badge bg-primary">Persistida</span></div>
                                    </div>
                                </div>

                                <div className="table-responsive">
                                    <table className="table table-bordered">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Producto</th>
                                                <th className="text-end">Precio U.</th>
                                                <th className="text-center">Cant.</th>
                                                <th className="text-end">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedFactura.items?.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td>{item.producto?.nombre || 'Producto Eliminado'}</td>
                                                    <td className="text-end">${parseFloat(item.precio_unitario).toFixed(2)}</td>
                                                    <td className="text-center">{item.cantidad}</td>
                                                    <td className="text-end font-monospace">${parseFloat(item.subtotal).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="row justify-content-end mt-4">
                                    <div className="col-md-7">
                                        <div className="p-3 bg-light rounded">
                                            <div className="d-flex justify-content-between mb-1 small text-muted">
                                                <span>Subtotal:</span>
                                                <span>${parseFloat(selectedFactura.subtotal).toFixed(2)}</span>
                                            </div>
                                            {parseFloat(selectedFactura.descuento) > 0 && (
                                                <div className="d-flex justify-content-between mb-1 small text-danger fw-bold">
                                                    <span>Descuento:</span>
                                                    <span>-${parseFloat(selectedFactura.descuento).toFixed(2)}</span>
                                                </div>
                                            )}
                                            <div className="d-flex justify-content-between mb-1 small text-muted">
                                                <span>IVA (15%):</span>
                                                <span>${parseFloat(selectedFactura.iva).toFixed(2)}</span>
                                            </div>
                                            <div className="d-flex justify-content-between pt-2 border-top fw-bold text-primary">
                                                <span>Total Facturado:</span>
                                                <span>${parseFloat(selectedFactura.total).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="card shadow-sm p-4 bg-white border-0 rounded-3 h-100 d-flex align-items-center justify-content-center text-muted">
                                <div className="text-center py-5">
                                    <i className="bi bi-file-earmark-spreadsheet" style={{ fontSize: '3rem' }}></i>
                                    <p className="mt-3">Seleccione una factura del listado para ver su detalle completo.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="text-center py-4 mt-5 text-muted border-top bg-light rounded-3">
                <p className="mb-1">Universidad de las Fuerzas Armadas ESPE | Integración de Componentes (PIC)</p>
                <small className="text-secondary">&copy; 2026 - Diseñado por <strong>{estudianteNombre} ({estudianteInitials})</strong></small>
            </footer>
        </div>
    );
};
