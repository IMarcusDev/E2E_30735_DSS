# Pruebas E2E (Playwright) — Sistema de Reservas

Dos pruebas end-to-end que **detectan bugs** manejando la aplicación como lo haría un usuario real.

## Requisitos

La aplicación debe estar **corriendo** antes de ejecutar las pruebas:

- Frontend en `http://localhost:3000` (`npm start` en `/frontend`)
- Backend en `http://localhost:8080` (`mvn spring-boot:run` en `/backend`)
- PostgreSQL levantado

Usuario administrador usado por las pruebas: `admin@reservas.com` / `password`.

## Instalación

```bash
cd e2e
npm install
npx playwright install chromium
```

## Ejecutar

```bash
npm test
npm run test:ui
npm run test:debug
npm run test:headless
npm run report
```

Por defecto el navegador **se abre y se ve moverse**: `headless: false` y
`slowMo: 500` (medio segundo entre acciones) en `playwright.config.js`. Si te
resulta lento o rápido, ajustá `slowMo` ahí.

Para una sola prueba:

```bash
npx playwright test usuarios-no-se-muestran.spec.js
```

## Evidencia que queda de cada corrida

En `test-results/<nombre-de-la-prueba>/`:

- `video.webm` — grabación de **todas** las pruebas (`video: 'on'`)
- `trace.zip` — trace navegable: `npx playwright show-trace test-results/.../trace.zip`
- `test-failed-1.png` — screenshot del momento exacto de la falla

El reporte HTML (`npm run report`) reúne todo: video, trace, screenshot y el
mensaje `BUG DETECTADO: ...` de cada prueba.

## Qué prueba cada test (y qué bug detecta)

| Archivo                                  | Qué valida                                                                                         | Bug que detecta                                                                                                                                                                  |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tests/usuarios-no-se-muestran.spec.js`  | Crea un usuario con rol **Cliente** desde el panel admin y espera verlo en la lista de usuarios.   | El front pide `soloAdministrativos=true` y el backend (`findUsuariosAdministrativos`) excluye a los `CLIENTE`, así que **los clientes nunca aparecen** en "Gestión de Usuarios". |
| `tests/reserva-doble-validacion.spec.js` | Reserva dos veces el mismo servicio en la misma fecha y hora, y cuenta las reservas en el backend. | No hay validación de solapamiento en `ReservaService.crearReserva` ni unicidad en BD: **se permite la reserva doble**.                                                           |

> Nota: estas pruebas están escritas para **fallar con el código actual**: cada
> falla es la evidencia del bug. Cuando los bugs se corrijan, las pruebas pasarán.
