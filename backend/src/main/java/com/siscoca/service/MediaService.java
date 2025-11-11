package com.siscoca.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.http.converter.FormHttpMessageConverter;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@Service
public class MediaService {
    
    private static final String MEDIA_API_URL = "http://178.156.204.129:3000/media";
    private static final String BUCKET_NAME = "siscoca";
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    public MediaService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
        
        // Configurar RestTemplate para manejar multipart correctamente
        List<HttpMessageConverter<?>> converters = new ArrayList<>();
        converters.add(new FormHttpMessageConverter());
        converters.add(new MappingJackson2HttpMessageConverter());
        restTemplate.setMessageConverters(converters);
    }
    
    /**
     * Sube una imagen en base64 a la API externa de media
     * @param base64Data Data URL completo (data:image/png;base64,...)
     * @param nombreArchivo Nombre del archivo
     * @return URL pública de la imagen subida
     * @throws RuntimeException Si falla la subida
     */
    public String subirImagen(String base64Data, String nombreArchivo) {
        try {
            // Extraer el base64 puro y el tipo MIME
            String mimeType = "image/jpeg";
            String base64Puro = base64Data;
            
            if (base64Data.startsWith("data:")) {
                int mimeEnd = base64Data.indexOf(";");
                int base64Start = base64Data.indexOf(",") + 1;
                
                if (mimeEnd > 0) {
                    mimeType = base64Data.substring(5, mimeEnd);
                }
                if (base64Start > 0) {
                    base64Puro = base64Data.substring(base64Start);
                }
            }
            
            // Decodificar base64 a bytes
            byte[] imagenBytes = Base64.getDecoder().decode(base64Puro);
            
            // Crear un ByteArrayResource desde los bytes
            ByteArrayResource fileResource = new ByteArrayResource(imagenBytes) {
                @Override
                public String getFilename() {
                    return nombreArchivo;
                }
            };
            
            // Crear el multipart request
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            
            // Crear el body multipart con bucket y file
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            
            // Agregar el campo bucket (texto)
            body.add("bucket", BUCKET_NAME);
            
            // Agregar el archivo como Resource
            body.add("file", fileResource);
            
            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                MEDIA_API_URL,
                HttpMethod.POST,
                requestEntity,
                String.class
            );
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                // Parsear la respuesta JSON
                JsonNode jsonResponse = objectMapper.readTree(response.getBody());
                String url = jsonResponse.has("url") ? jsonResponse.get("url").asText() : null;
                
                if (url != null && !url.isEmpty()) {
                    return url;
                } else {
                    throw new RuntimeException("La API no devolvió una URL válida. Respuesta: " + response.getBody());
                }
            } else {
                throw new RuntimeException("Error al subir imagen: " + response.getStatusCode() + " - " + response.getBody());
            }
            
        } catch (Exception e) {
            throw new RuntimeException("Error al subir imagen a la API externa: " + e.getMessage(), e);
        }
    }
}

