import axios from "axios";

const BASE_URL = 'http://localhost:8080/api';

// --- Servicios de Clientes (cliente_DXC) ---
export const findAllClientes = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/clientes`);
        return response;
    } catch (error) {
        console.error("Error al obtener clientes:", error);
        throw error;
    }
}

export const saveCliente = async (cliente) => {
    try {
        const response = await axios.post(`${BASE_URL}/clientes`, cliente);
        return response;
    } catch (error) {
        console.error("Error al guardar cliente:", error);
        throw error;
    }
}

export const updateCliente = async (cliente) => {
    try {
        const response = await axios.put(`${BASE_URL}/clientes/${cliente.id}`, cliente);
        return response;
    } catch (error) {
        console.error("Error al actualizar cliente:", error);
        throw error;
    }
}

export const removeCliente = async (id) => {
    try {
        const response = await axios.delete(`${BASE_URL}/clientes/${id}`);
        return response;
    } catch (error) {
        console.error("Error al eliminar cliente:", error);
        throw error;
    }
}

// --- Servicios de Productos (producto_DXC) ---
export const findAllProductos = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/productos`);
        return response;
    } catch (error) {
        console.error("Error al obtener productos:", error);
        throw error;
    }
}

export const saveProducto = async (producto) => {
    try {
        const response = await axios.post(`${BASE_URL}/productos`, producto);
        return response;
    } catch (error) {
        console.error("Error al guardar producto:", error);
        throw error;
    }
}

export const updateProducto = async (producto) => {
    try {
        const response = await axios.put(`${BASE_URL}/productos/${producto.id}`, producto);
        return response;
    } catch (error) {
        console.error("Error al actualizar producto:", error);
        throw error;
    }
}

export const removeProducto = async (id) => {
    try {
        const response = await axios.delete(`${BASE_URL}/productos/${id}`);
        return response;
    } catch (error) {
        console.error("Error al eliminar producto:", error);
        throw error;
    }
}

// --- Servicios de Facturas ---
export const findAllFacturas = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/facturas`);
        return response;
    } catch (error) {
        console.error("Error al obtener facturas:", error);
        throw error;
    }
}

export const findFacturaById = async (id) => {
    try {
        const response = await axios.get(`${BASE_URL}/facturas/${id}`);
        return response;
    } catch (error) {
        console.error("Error al obtener factura:", error);
        throw error;
    }
}

export const saveFactura = async (facturaData) => {
    try {
        const response = await axios.post(`${BASE_URL}/facturas`, facturaData);
        return response;
    } catch (error) {
        console.error("Error al guardar factura:", error);
        throw error;
    }
}

export const removeFactura = async (id) => {
    try {
        const response = await axios.delete(`${BASE_URL}/facturas/${id}`);
        return response;
    } catch (error) {
        console.error("Error al eliminar factura:", error);
        throw error;
    }
}
