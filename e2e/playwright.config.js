const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
    testDir: "./tests",
    timeout: 60000,
    expect: {
        timeout: 7000,
    },
    fullyParallel: false,
    workers: 1,
    retries: 0,
    reporter: [["list"], ["html", { open: "never" }]],
    use: {
        baseURL: "http://localhost:3000",

        // Por defecto el navegador se ve. Con HEADLESS=1 corre sin ventana.
        headless: process.env.HEADLESS === "1",
        launchOptions: {
            slowMo: process.env.HEADLESS === "1" ? 0 : 500,
        },
        video: "on",
        trace: "on",
        screenshot: "only-on-failure",
    },
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],
});
