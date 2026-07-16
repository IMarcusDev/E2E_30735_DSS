const { test, expect } = require("@playwright/test");

const ADMIN_EMAIL = "admin@reservas.com";
const ADMIN_PASSWORD = "password";

async function login(page) {
    await page.goto("/");
    await page.getByPlaceholder("admin@reservas.com").fill(ADMIN_EMAIL);
    await page.getByPlaceholder("Tu contraseña").fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Iniciar Sesión" }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
}

test("un usuario con rol Cliente creado en el panel debe aparecer en la lista de usuarios", async ({ page }) => {
    await login(page);

    const sufijo = Date.now();
    const nombre = `Cliente Prueba ${sufijo}`;
    const email = `cliente.prueba.${sufijo}@example.com`;

    await page.getByRole("button", { name: "Usuarios", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Gestión de Usuarios" })).toBeVisible();

    await page.getByRole("button", { name: "Nuevo Usuario" }).first().click();
    await expect(page.getByRole("heading", { name: "Nuevo Usuario" })).toBeVisible();

    await page.getByPlaceholder("Ej: Juan Pérez").fill(nombre);
    await page.getByPlaceholder("Ej: juan@empresa.com").fill(email);
    await page.getByPlaceholder("Ej: 0981-123456").fill("0981123456");
    await page.getByPlaceholder("Mínimo 6 caracteres").fill("secreta123");
    await page.locator('select[name="rol"]').selectOption({ label: "Cliente" });

    await page.getByRole("button", { name: "Crear Usuario" }).click();
    await expect(page.getByText("Usuario creado exitosamente")).toBeVisible({ timeout: 10000 });

    await expect(
        page.getByText(email),
        "BUG DETECTADO: el usuario con rol Cliente fue creado pero NO aparece en la " +
            "lista de usuarios (el front pide soloAdministrativos=true y el backend " +
            "excluye a los CLIENTE).",
    ).toBeVisible();
});
