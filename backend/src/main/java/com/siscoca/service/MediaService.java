package com.siscoca.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.*;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.converter.FormHttpMessageConverter;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;

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
            // Extraer el base64 puro
            String base64Puro = base64Data;
            
            if (base64Data.startsWith("data:")) {
                int base64Start = base64Data.indexOf(",") + 1;
                
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
    
    /**
     * Sube un archivo MultipartFile directamente a la API externa de media
     * @param file Archivo a subir
     * @return URL pública de la imagen subida
     * @throws RuntimeException Si falla la subida
     */
    public String subirArchivo(MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                throw new RuntimeException("El archivo está vacío");
            }
            
            // Crear el multipart request
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            
            // Crear el body multipart con bucket y file
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            
            // Agregar el campo bucket (texto)
            body.add("bucket", BUCKET_NAME);
            
            // Crear un InputStreamResource desde el MultipartFile
            InputStreamResource fileResource = new InputStreamResource(file.getInputStream()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
                
                @Override
                public long contentLength() throws IOException {
                    return file.getSize();
                }
            };
            
            // Agregar el archivo como Resource
            body.add("file", fileResource);
            
            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            
            try {
                // Intentar recibir como Map para manejar JSON correctamente
                ParameterizedTypeReference<Map<String, Object>> responseType = 
                    new ParameterizedTypeReference<Map<String, Object>>() {};
                ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    MEDIA_API_URL,
                    HttpMethod.POST,
                    requestEntity,
                    responseType
                );
                
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    Map<String, Object> responseBody = response.getBody();
                    Object urlObj = responseBody.get("url");
                    
                    if (urlObj != null) {
                        String url = urlObj.toString();
                        if (!url.isEmpty()) {
                            return url;
                        }
                    }
                    throw new RuntimeException("La API no devolvió una URL válida. Respuesta: " + responseBody);
                } else {
                    throw new RuntimeException("Error al subir archivo: " + response.getStatusCode() + " - " + response.getBody());
                }
            } catch (RestClientException e) {
                // Si falla con Map, intentar como String y parsear manualmente
                try {
                    ResponseEntity<String> stringResponse = restTemplate.exchange(
                        MEDIA_API_URL,
                        HttpMethod.POST,
                        requestEntity,
                        String.class
                    );
                    
                    if (stringResponse.getStatusCode().is2xxSuccessful() && stringResponse.getBody() != null) {
                        JsonNode jsonResponse = objectMapper.readTree(stringResponse.getBody());
                        String url = jsonResponse.has("url") ? jsonResponse.get("url").asText() : null;
                        
                        if (url != null && !url.isEmpty()) {
                            return url;
                        }
                        throw new RuntimeException("La API no devolvió una URL válida. Respuesta: " + stringResponse.getBody());
                    } else {
                        throw new RuntimeException("Error al subir archivo: " + stringResponse.getStatusCode() + " - " + stringResponse.getBody());
                    }
                } catch (Exception ex) {
                    throw new RuntimeException("Error al subir archivo a la API externa: " + ex.getMessage() + " (original: " + e.getMessage() + ")", ex);
                }
            }
            
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error al subir archivo a la API externa: " + e.getMessage(), e);
        }
    }
}

