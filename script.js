const URL_CSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTixvGS4Wl4P77N5fLAGoI1vixhrYJvwW1d7LiWtkjibvEBskkHjx5OtkVXHaSM3xoVM9_sg2Scqwkc/pub?output=csv';
let productosBase = [];
let currentSlide = 0;

const subcategorias = {
    'Ropa': [
        //{ nombre: 'Mujer', slug: 'Mujer', foto: 'fotos/mujer.jpg' },
       // { nombre: 'Hombre', slug: 'Hombre', foto: 'fotos/hombre.jpg' },
       // { nombre: 'Nena', slug: 'Nena', foto: 'fotos/nena.jpg' },
       // { nombre: 'Nene', slug: 'Nene', foto: 'fotos/nene.jpg' }
    ],
    'Electrónica': [
        { nombre: 'Parlantes', slug: 'Parlante', foto: 'fotos/categoria-parlantes.webp' },
        { nombre: 'Auriculares', slug: 'Auricular', foto: 'fotos/categoria-auriculares.webp' },
        { nombre: 'Humidificadores', slug: 'Humidificador', foto: 'fotos/categoria-humidificador.webp' },
        { nombre: 'Accesorios de celular/pendrive', slug: 'Cargador', foto: 'fotos/categoria-cargador.webp' }
    ],
 'Juguetes': [
       
    { nombre: 'accesorios para el Agua', slug: 'Agua', foto: 'fotos/categoria-agua.webp' }


    ], // <-- Coma muy importante
    'Decoración': [
        { 
            nombre: 'Iluminación', 
            slug: 'Lampara', 
            foto: 'fotos/categoria-iluminacion.webp' 
        }, 
       //  { 
           // nombre: 'Mini electronico', 
           // slug: 'Mini', 
          //  foto: 'fotos/categoria-iluminacion.webp' 
      //  }
    ],

     'Cuidado Personal': [
        { 
            nombre: 'Belleza', 
            slug: 'Belleza', 
            foto: 'fotos/categoria-cuidado.webp' 
        },

          { 
            nombre: 'Accesorios', 
            slug: 'Accesorios', 
            foto: 'fotos/categoria-accesorios.webp' 
        },
    ],
    'Novedades': [
        { nombre: 'Ofertas', slug: 'Novedades', foto: 'fotos/categoria-novedades.webp' },
    
    ],

        'Librería': [
        { nombre: 'Librería', slug: 'Librería', foto: 'fotos/categoria-libreria.webp' },
    
    ],

    
}; // <-- ESTA LLAVE CIERRA TODO EL OBJETO SUBCATEGORIAS
async function cargarDatos() {
    try {
        const res = await fetch(URL_CSV);
        const csv = await res.text();
        // Esto nos mostrará en la consola cómo viene la primera fila de datos
        console.log("Contenido crudo del CSV (primera fila):", csv.split('\n')[1]);
        
        const filas = csv.split('\n').slice(1);
       productosBase = filas.map(f => {
    // Esta línea es mágica: divide por coma o punto y coma automáticamente
    const c = f.split(/[;,]/); 
    return { 
        nombre: (c[0] || '').trim(), 
        categoria: (c[1] || '').trim(), 
        precio: (c[2] || '').trim(), 
        foto: (c[3] || '').trim(), 
        etiqueta: (c[4] || '').trim() 
    };
}).filter(p => p.nombre !== '');
        console.log("Productos procesados:", productosBase);
        configurarCarrusel();
    } catch (e) { 
        console.error("Error cargando datos:", e); 
    }
}

function obtenerUrlsFotos(fotoString) {
    if (!fotoString || fotoString.trim() === "") {
        return ['fotos/mi-logo.jpeg'];
    }
    
    // Separamos por la barra y limpiamos cada nombre
    const listaFotos = fotoString.split('|')
        .map(f => f.trim()) // Quitamos espacios
        .filter(f => f !== ""); // Eliminamos elementos vacíos por si hay barras de más
    
    console.log("Lista de fotos procesada:", listaFotos); // Veremos esto en F12

    return listaFotos.map(f => {
        if (f.startsWith('http')) return f;
        return `fotos/${f}`;
    });
}

function renderizarGrid(lista) {
    const grid = document.getElementById('product-grid-categoria');
    if (lista.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 20px;">No se encontraron productos.</p>';
        return;
    }

    grid.innerHTML = lista.map((p, indexP) => {
        // Obtenemos el array de fotos (siempre devuelve al menos una)
        const fotos = obtenerUrlsFotos(p.foto);
        const tieneVarias = fotos.length > 1;
        
        return `
        <div class="product-card">
            <div class="product-image-container">
                
                ${tieneVarias ? `<button class="btn-mini-slider prev-btn" onclick="moverMiniSlider(${indexP}, -1)">❮</button>` : ''}
                
                <div class="product-slides" id="slides-${indexP}" data-index="0">
${fotos.map((f, i) => `
<img src="${f.trim()}" 
     onclick="abrirModal('${f.trim()}', '${p.nombre}')" 
     style="min-width:100%; height:100%; object-fit:contain; cursor:pointer;" 
     onerror="this.src='fotos/mi-logo.jpeg'">
`).join('')}
                </div>

                ${tieneVarias ? `<button class="btn-mini-slider next-btn" onclick="moverMiniSlider(${indexP}, 1)">❯</button>` : ''}

                ${tieneVarias ? `
                    <div class="product-dots" id="dots-${indexP}">
                        ${fotos.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}"></span>`).join('')}
                    </div>
                ` : ''}
            </div>

            <h3>${p.nombre}</h3>
            <span class="price">$${p.precio}</span>
            <a href="https://wa.me/5491136500552?text=Hola! Me interesa: ${encodeURIComponent(p.nombre)}" 
               target="_blank" class="btn-rs bg-ws" style="font-size: 0.8rem; width: 100%; justify-content: center; display: flex;">
               <i class="fab fa-whatsapp" style="margin-right: 8px;"></i> Consultar
            </a>
        </div>
        `;
    }).join('');
}
// LOGICA DE MOVIMIENTO CORREGIDA
window.moverMiniSlider = function(id, direccion) {
    const slider = document.getElementById(`slides-${id}`);
    if (!slider) return;
    const totalFotos = slider.querySelectorAll('img').length;
    let indexActual = parseInt(slider.getAttribute('data-index') || 0);
    
    indexActual += direccion;
    
    // Si llega al final, vuelve al principio y viceversa
    if (indexActual >= totalFotos) indexActual = 0;
    if (indexActual < 0) indexActual = totalFotos - 1;
    
    slider.setAttribute('data-index', indexActual);
    slider.style.transform = `translateX(-${indexActual * 100}%)`;
};

// --- TODO LO DEMAS SE MANTIENE EXACTAMENTE IGUAL A TU CODIGO ORIGINAL ---

function cambiarSeccion(cat) {
    const inicio = document.getElementById('seccion-inicio');
    const categ = document.getElementById('seccion-categorias');
    const submenu = document.getElementById('submenu-burbujas');
    const grid = document.getElementById('product-grid-categoria');
    const btnVolver = document.getElementById('btn-volver');

    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.querySelectorAll('.nav-menu a').forEach(a => a.classList.remove('active'));

    if (cat === 'inicio') {
        inicio.style.display = 'block';
        categ.style.display = 'none';
        document.querySelector('[data-categoria="inicio"]').classList.add('active');
    } else {
        inicio.style.display = 'none'; // <-- Asegúrate de tener esta línea
        categ.style.display = 'block'; // <-- Asegúrate de tener esta línea
        
        const navLink = document.querySelector(`[data-categoria="${cat}"]`);
        if (navLink) navLink.classList.add('active');

       if (subcategorias[cat]) {
            submenu.style.display = 'flex';
            grid.innerHTML = '';
            document.getElementById('titulo-categoria').innerText = cat;

            // Nueva lógica: Si la lista está vacía []
            if (subcategorias[cat].length === 0) {
                submenu.innerHTML = `
                    <div style="width: 100%; text-align: center; padding: 40px;">
                        <i class="fas fa-clock" style="font-size: 2.5rem; color: var(--naranja); margin-bottom: 15px; display: block;"></i>
                        <h3 style="color: var(--texto);">Próximamente productos de ${cat}</h3>
                        <p style="color: #888; margin-top: 10px;">¡Estamos trabajando en esta sección!</p>
                    </div>`;
            } else {
                // Si tiene datos, mostramos las burbujas
                submenu.innerHTML = subcategorias[cat].map(sub => `
                    <div class="burbuja" onclick="filtrarPorSubcategoria('${cat}', '${sub.slug}', '${sub.nombre}')">
                        <img src="${sub.foto}" class="burbuja-img" onerror="this.src='fotos/mi-logo.jpeg'">
                        <span>${sub.nombre}</span>
                    </div>
                `).join('');
            }
        }
         else {
            submenu.style.display = 'none';
            document.getElementById('titulo-categoria').innerText = cat;
            renderizarGrid(productosBase.filter(p => p.categoria.toLowerCase().includes(cat.toLowerCase())));
        }
    } // <-- ESTA ES LA LLAVE QUE SEGURAMENTE TE FALTA PARA CERRAR EL ELSE
} // <-- Y ESTA CIERRA LA FUNCIÓN COMPLETA

function filtrarPorSubcategoria(catPadre, slug, nombreSub) {
    document.getElementById('submenu-burbujas').style.display = 'none';
    document.getElementById('titulo-categoria').innerText = nombreSub;
    const btnVolver = document.getElementById('btn-volver');
    btnVolver.innerHTML = `<i class="fas fa-arrow-left"></i> Volver a ${catPadre}`;
    btnVolver.onclick = () => cambiarSeccion(catPadre);

    const filtrados = productosBase.filter(p => {
        // Verifica si la categoría principal (Decoración) está presente
        const coincidePadre = p.categoria.toLowerCase().includes(catPadre.toLowerCase());
        
        // Verifica si el slug (Lampara) está en el nombre O en la categoría
        const coincideSlug = p.nombre.toLowerCase().includes(slug.toLowerCase()) || 
                             p.categoria.toLowerCase().includes(slug.toLowerCase());
                             
        return coincidePadre && coincideSlug;
    });
    renderizarGrid(filtrados);
}
function configurarCarrusel() {
    const sliderBox = document.getElementById('slider-box');
    const destacados = productosBase.filter(p => p.etiqueta.toLowerCase().includes('carrusel'));
    
    if (destacados.length === 0) return;

    // Generamos el contenido usando la clase "slide" para que el CSS funcione correctamente
    sliderBox.innerHTML = destacados.map((p, indexP) => {
        const fotos = obtenerUrlsFotos(p.foto);
        return `
        <div class="slide">
            <div class="product-card" style="width: 100%; margin: 10px; height: 95%;">
                <div class="product-image-container" style="height: 180px;">
                    <img src="${fotos[0]}" 
                         onclick="abrirModal('${fotos[0]}', '${p.nombre}')" 
                         style="width:100%; height:100%; object-fit:contain; cursor:pointer;"
                         onerror="this.src='fotos/mi-logo.jpeg'">
                </div>
                <h3 style="font-size: 0.9rem;">${p.nombre}</h3>
                <span class="price" style="font-size: 1rem;">$${p.precio}</span>
                <a href="https://wa.me/5491136500552?text=Hola! Me interesa: ${encodeURIComponent(p.nombre)}" 
                   target="_blank" class="btn-rs bg-ws" style="font-size: 0.7rem; width: 100%; justify-content: center; display: flex;">
                   <i class="fab fa-whatsapp" style="margin-right: 8px;"></i> Consultar
                </a>
            </div>
        </div>
        `;
    }).join('');

    // Control de flechas de navegación
    const botonesNav = document.querySelectorAll('.btn-nav-slider');
    if (destacados.length <= 1) {
        botonesNav.forEach(boton => boton.style.display = 'none');
    } else {
        botonesNav.forEach(boton => boton.style.display = 'block');
    }
}
function moveSlide(step) {
    const slides = document.querySelectorAll('.slide');
    if (slides.length <= 1) return;

    let stepWidth;
    const width = window.innerWidth;

    if (width <= 480) {
        stepWidth = 100; // Celular: 1 foto completa 📱
    } else if (width <= 1024) {
        stepWidth = 50;  // Tablet: 2 fotos (50% cada una) 📑
    } else {
        stepWidth = 33.333; // Computadora: 3 fotos 💻
    }

    currentSlide = (currentSlide + step + slides.length) % slides.length;
    document.getElementById('slider-box').style.transform = `translateX(-${currentSlide * stepWidth}%)`;
}
document.getElementById('input-buscador').addEventListener('input', (e) => {
    const texto = e.target.value.toLowerCase().trim();
    if (texto.length > 0) {
        document.getElementById('seccion-inicio').style.display = 'none';
        document.getElementById('seccion-categorias').style.display = 'block';
        document.getElementById('submenu-burbujas').style.display = 'none';
        document.getElementById('titulo-categoria').innerText = `Buscando: ${texto}`;
        const filtrados = productosBase.filter(p => 
            p.nombre.toLowerCase().includes(texto) || p.categoria.toLowerCase().includes(texto)
        );
        renderizarGrid(filtrados);
    } else {
        cambiarSeccion('inicio');
    }
});

document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-categoria]');
    if (el) { 
        e.preventDefault(); 
        cambiarSeccion(el.dataset.categoria); 
    }
});

setInterval(() => moveSlide(1), 5000);
document.addEventListener('DOMContentLoaded', cargarDatos);

// Variables globales para controlar el modal
let fotosModalActuales = [];
let indiceModalActual = 0;

window.abrirModal = function(urlFotoCompleta, nombreProducto) {
    // Buscamos el producto por su nombre exacto en lugar de por su posición
    const producto = productosBase.find(p => p.nombre === nombreProducto);
    
    if (producto) {
        fotosModalActuales = obtenerUrlsFotos(producto.foto);
        // Encontramos el índice de la foto actual dentro del array de sus fotos
        // Usamos include para comparar solo el nombre del archivo
        indiceModalActual = fotosModalActuales.findIndex(f => urlFotoCompleta.includes(f));
        if (indiceModalActual === -1) indiceModalActual = 0;
    } else {
        fotosModalActuales = [urlFotoCompleta];
        indiceModalActual = 0;
    }

    document.getElementById('modal-imagen').style.display = 'flex';
    document.getElementById('img-ampliada').src = urlFotoCompleta;

    const btnPrev = document.getElementById('modal-prev');
    const btnNext = document.getElementById('modal-next');

    if (fotosModalActuales.length <= 1) {
        btnPrev.style.display = 'none';
        btnNext.style.display = 'none';
    } else {
        btnPrev.style.display = 'block';
        btnNext.style.display = 'block';
    }
};

window.cerrarModal = function() {
    document.getElementById('modal-imagen').style.display = 'none';
};

window.cambiarFotoModal = function(direccion) {
    indiceModalActual += direccion;

    if (indiceModalActual >= fotosModalActuales.length) {
        indiceModalActual = 0;
    }
    if (indiceModalActual < 0) {
        indiceModalActual = fotosModalActuales.length - 1;
    }

    document.getElementById('img-ampliada').src = fotosModalActuales[indiceModalActual];
};
