const { test, expect } = require("@playwright/test");

const API = "http://localhost:8080/api";

function fechaFutura(diasAdelante) {
    const d = new Date();
    d.setDate(d.getDate() + diasAdelante);
    return d.toISOString().split("T")[0];
}

async function crearReserva(page, datos) {
    await page.goto("/reservar");

    const servicioSelect = page.locator("select").first();
    await expect(servicioSelect.locator("option")).not.toHaveCount(1);

    await page.getByPlaceholder("Tu nombre completo").fill(datos.nombre);
    await page.getByPlaceholder("Ej: +57 300 123 4567").fill(datos.telefono);
    await page.getByPlaceholder("tu@email.com").fill(datos.email);

    await servicioSelect.selectOption({ index: 1 });

    await page.locator('input[type="date"]').fill(datos.fecha);
    await page.locator("select").nth(1).selectOption(datos.hora);

    await page.getByRole("button", { name: "Confirmar Reserva" }).click();
}

async function contarReservas(request, datos) {
    const resp = await request.get(`${API}/reservas`, { params: { fecha: datos.fecha } });
    const lista = await resp.json();
    return lista.filter(r => r.emailCliente === datos.email && String(r.hora).startsWith(datos.hora)).length;
}

test("el sistema debe impedir reservar dos veces el mismo servicio en el mismo horario", async ({ page, request }) => {
    const sufijo = Date.now();
    const datos = {
        nombre: "Paciente Prueba",
        telefono: "0981123456",
        email: `paciente.${sufijo}@example.com`,
        fecha: fechaFutura(10),
        hora: "09:00",
    };

    await crearReserva(page, datos);
    await expect(page.getByText("Reserva creada exitosamente")).toBeVisible({ timeout: 10000 });

    await crearReserva(page, datos);

    await expect
        .poll(async () => contarReservas(request, datos), {
            timeout: 10000,
            message:
                "BUG DETECTADO: se permitió una reserva doble para el mismo servicio, " +
                "fecha y hora. Falta validación de solapamiento en el backend " +
                "(ReservaService.crearReserva) o una restricción de unicidad en la BD.",
        })
        .toBeLessThanOrEqual(1);
});
