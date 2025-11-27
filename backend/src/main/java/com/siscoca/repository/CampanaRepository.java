package com.siscoca.repository;

import com.siscoca.model.Campana;
import com.siscoca.model.EstadoCampana;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CampanaRepository extends JpaRepository<Campana, Long> {
    
    // Métodos originales (sin JOIN FETCH para uso simple)
    List<Campana> findByEstado(EstadoCampana estado);
    List<Campana> findByNombreDueno(String nombreDueno);
    List<Campana> findByPais(String pais);
    List<Campana> findByVertical(String vertical);
    List<Campana> findByPlataforma(String plataforma);
    List<Campana> findBySegmento(String segmento);
    Optional<Campana> findByIdPlataformaExterna(String idPlataformaExterna);
    Optional<Campana> findByNombre(String nombre);
    
    // ========================================
    // QUERIES OPTIMIZADAS CON JOIN FETCH
    // Evitan problema N+1 al cargar relaciones
    // ========================================
    
    /**
     * Obtiene TODAS las campañas con sus historicos y creativos en UNA SOLA query
     * Evita N+1: En vez de 1 + N queries, hace solo 1 query
     * Usar este método en vez de findAll() cuando necesites los historicos/creativos
     */
    @Query("SELECT DISTINCT c FROM Campana c " +
           "LEFT JOIN FETCH c.historicoSemanas " +
           "LEFT JOIN FETCH c.creativos")
    List<Campana> findAllWithRelations();
    
    /**
     * Obtiene campañas por estado CON relaciones cargadas
     * Evita N+1 al acceder a historicos/creativos después
     */
    @Query("SELECT DISTINCT c FROM Campana c " +
           "LEFT JOIN FETCH c.historicoSemanas " +
           "LEFT JOIN FETCH c.creativos " +
           "WHERE c.estado = :estado")
    List<Campana> findByEstadoWithRelations(@Param("estado") EstadoCampana estado);
    
    /**
     * Obtiene campaña por ID con relaciones cargadas
     * Evita N+1 al acceder a historicos/creativos después
     */
    @Query("SELECT c FROM Campana c " +
           "LEFT JOIN FETCH c.historicoSemanas " +
           "LEFT JOIN FETCH c.creativos " +
           "WHERE c.id = :id")
    Optional<Campana> findByIdWithRelations(@Param("id") Long id);
    
    // Métodos con queries optimizadas
    @Query("SELECT c FROM Campana c WHERE c.semanaISO = :semanaISO")
    List<Campana> findBySemanaISO(@Param("semanaISO") Integer semanaISO);
    
    @Query("SELECT c FROM Campana c WHERE c.nombre LIKE %:nombre%")
    List<Campana> findByNombreContaining(@Param("nombre") String nombre);
    
    @Query("SELECT c FROM Campana c WHERE c.estado = :estado AND c.nombreDueno = :nombreDueno")
    List<Campana> findByEstadoAndNombreDueno(@Param("estado") EstadoCampana estado, @Param("nombreDueno") String nombreDueno);
}
