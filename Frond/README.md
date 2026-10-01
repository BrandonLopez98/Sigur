# Frontend de Verifik

Interfaz de Verifik construida con React y Vite.

## Configuración

Desde la raíz del repositorio:

```bash
cp Frond/.env.example Frond/.env
npm ci --prefix Frond
```

`VITE_API_URL` debe apuntar al backend correspondiente al entorno. No incluyas secretos en
variables `VITE_*`: Vite incorpora esos valores en el código entregado al navegador.

## Comandos

```bash
# Desarrollo
npm run dev

# Validación estática
npm run lint

# Compilación de producción
npm run build

# Vista previa local de la compilación
npm run preview
```

El servidor de desarrollo escucha normalmente en `http://localhost:5173`. La compilación queda en
`Frond/dist`.

`vite preview` no es un servidor recomendado para producción. Publica `dist` mediante un servicio
de archivos estáticos con HTTPS, encabezados de seguridad y una estrategia de reversión del
artefacto.

Actualmente no existe una suite automatizada del frontend; su incorporación está prevista en las
fases de exactitud y calidad del plan técnico.

La preparación completa del repositorio está documentada en [../README.md](../README.md).
