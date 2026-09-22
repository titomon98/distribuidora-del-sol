// `roles`: qué roles ven cada opción. Si falta, la ve cualquiera.
// Cajero → solo cobro y venta manual. Despachador → solo despacho. Admin → todo.
export const MenuList = [
    {
        title: 'Dashboard',
        iconStyle: "bi bi-grid",
        to: 'dashboard',
        roles: ['ADMINISTRADOR'],
    },
    {
        title: 'Punto de cobro',
        iconStyle: "bi bi-upc-scan",
        to: 'cobro',
        roles: ['ADMINISTRADOR', 'CAJERO'],
    },
    {
        title: 'Venta manual',
        iconStyle: "bi bi-search",
        to: 'venta-manual',
        roles: ['ADMINISTRADOR', 'CAJERO'],
    },
    {
        title: 'Ventas',
        classsChange: 'mm-collapse',
        iconStyle: "bi bi-receipt",
        roles: ['ADMINISTRADOR'],
        content: [
            { title: 'Listado', to: 'ventas' },
            { title: 'Abonos', to: 'abonos' },
        ],
    },
    {
        title: 'Punto de despacho',
        iconStyle: "bi bi-box-seam",
        to: 'despacho',
        roles: ['ADMINISTRADOR', 'DESPACHADOR'],
    },
    {
        title: 'Inventario',
        iconStyle: "bi bi-archive",
        to: 'inventario',
        roles: ['ADMINISTRADOR'],
    },
    {
        title: 'Compras',
        classsChange: 'mm-collapse',
        iconStyle: "bi bi-cart",
        roles: ['ADMINISTRADOR'],
        content: [
            { title: 'Registrar compra', to: 'compras' },
            { title: 'Listado', to: 'compras-listado' },
        ],
    },
    {
        title: 'Clientes',
        iconStyle: "bi bi-person-lines-fill",
        to: 'clientes',
        roles: ['ADMINISTRADOR'],
    },
    {
        title: 'Proveedores',
        iconStyle: "bi bi-truck",
        to: 'proveedores',
        roles: ['ADMINISTRADOR'],
    },
    {
        title: 'Catálogo',
        classsChange: 'mm-collapse',
        iconStyle: "bi bi-tags",
        roles: ['ADMINISTRADOR'],
        content: [
            { title: 'Productos', to: 'productos' },
            { title: 'Categorías', to: 'categorias' },
            { title: 'Marcas', to: 'marcas' },
            { title: 'Presentaciones', to: 'presentaciones' },
        ],
    },
    {
        title: 'Créditos clientes',
        iconStyle: "bi bi-wallet2",
        to: 'creditos-clientes',
        roles: ['ADMINISTRADOR'],
    },
    {
        title: 'Créditos proveedores',
        iconStyle: "bi bi-wallet",
        to: 'creditos-proveedores',
        roles: ['ADMINISTRADOR'],
    },
    {
        title: 'Cierre de caja',
        iconStyle: "bi bi-journal-check",
        to: 'cierre-caja',
        roles: ['ADMINISTRADOR'],
    },
    {
        title: 'Usuarios',
        iconStyle: "bi bi-people",
        to: 'usuarios',
        roles: ['ADMINISTRADOR'],
    },
    {
        title: 'Reportes',
        classsChange: 'mm-collapse',
        iconStyle: "bi bi-bar-chart",
        roles: ['ADMINISTRADOR'],
        content: [
            { title: 'Ventas', to: 'reporte-ventas' },
            { title: 'Compras', to: 'reporte-compras' },
            { title: 'Productos', to: 'reporte-productos' },
            { title: 'Usuarios', to: 'reporte-usuarios' },
        ],
    },
]
