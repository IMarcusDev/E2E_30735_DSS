package com.reservas.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertTrue;


class ReservaRequestValidationTest {

    private static ValidatorFactory factory;
    private static Validator validator;

    @BeforeAll
    static void setUp() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @AfterAll
    static void tearDown() {
        if (factory != null) {
            factory.close();
        }
    }

    private ReservaRequest reservaBase() {
        ReservaRequest req = new ReservaRequest();
        req.setNombre("Juan Perez");
        req.setTelefono("0981123456");
        req.setEmail("juan@example.com");
        req.setIdServicio(1L);
        req.setHora(LocalTime.of(9, 0));
        return req;
    }

    @Test
    @DisplayName("Reserva válida con fecha futura: sin violaciones")
    void reservaValidaNoTieneViolaciones() {
        ReservaRequest req = reservaBase();
        req.setFecha(LocalDate.now().plusDays(3));

        Set<ConstraintViolation<ReservaRequest>> violaciones = validator.validate(req);

        assertTrue(violaciones.isEmpty(),
                "Una reserva con datos válidos no debería tener violaciones, pero se encontraron: " + violaciones);
    }

    @Test
    @DisplayName("BUG: el backend acepta reservas con fecha pasada")
    void reservaConFechaPasadaDeberiaSerInvalida() {
        ReservaRequest req = reservaBase();
        req.setFecha(LocalDate.now().minusDays(5)); // fecha en el pasado

        Set<ConstraintViolation<ReservaRequest>> violaciones = validator.validate(req);

        boolean fechaRechazada = violaciones.stream()
                .anyMatch(v -> v.getPropertyPath().toString().equals("fecha"));

        assertTrue(fechaRechazada,
                "BUG DETECTADO: se permite crear una reserva con fecha pasada. "
                        + "Falta la validación @FutureOrPresent en ReservaRequest.fecha.");
    }
}
