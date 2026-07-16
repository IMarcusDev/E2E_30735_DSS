package com.reservas.dto;

import com.reservas.entity.Usuario;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertTrue;

class UsuarioRequestValidationTest {

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

    private UsuarioRequest usuarioBase() {
        UsuarioRequest req = new UsuarioRequest();
        req.setNombre("Empleado Nuevo");
        req.setEmail("empleado.nuevo@empresa.com");
        req.setTelefono("0981123456");
        req.setRol(Usuario.Rol.EMPLEADO);
        req.setActivo(true);
        return req;
    }

    @Test
    @DisplayName("Contraseña corta (< 6 caracteres) es rechazada correctamente")
    void contrasenaCortaEsInvalida() {
        UsuarioRequest req = usuarioBase();
        req.setPassword("123");

        Set<ConstraintViolation<UsuarioRequest>> violaciones = validator.validate(req);

        boolean passwordRechazada = violaciones.stream()
                .anyMatch(v -> v.getPropertyPath().toString().equals("password"));

        assertTrue(passwordRechazada,
                "Una contraseña de 3 caracteres debería ser rechazada por @Size(min = 6).");
    }

    @Test
    @DisplayName("BUG: el backend acepta crear un usuario sin contraseña (null)")
    void usuarioSinContrasenaDeberiaSerInvalido() {
        UsuarioRequest req = usuarioBase();
        req.setPassword(null); // no se envía contraseña

        Set<ConstraintViolation<UsuarioRequest>> violaciones = validator.validate(req);

        boolean passwordRequerida = violaciones.stream()
                .anyMatch(v -> v.getPropertyPath().toString().equals("password"));

        assertTrue(passwordRequerida,
                "BUG DETECTADO: se permite crear un usuario administrativo sin contraseña. "
                        + "Falta @NotBlank en UsuarioRequest.password.");
    }
}
