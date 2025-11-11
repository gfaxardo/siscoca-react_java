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
    
    List<Campana> findByEstado(EstadoCampana estado);
    
    List<Campana> findByNombreDueno(String nombreDueno);
    
    List<Campana> findByPais(String pais);
    
    List<Campana> findByVertical(String vertical);
    
    List<Campana> findByPlataforma(String plataforma);
    
    List<Campana> findBySegmento(String segmento);
    
    @Query("SELECT c FROM Campana c WHERE c.semanaISO = :semanaISO")
    List<Campana> findBySemanaISO(@Param("semanaISO") Integer semanaISO);
    
    @Query("SELECT c FROM Campana c WHERE c.nombre LIKE %:nombre%")
    List<Campana> findByNombreContaining(@Param("nombre") String nombre);
    
    @Query("SELECT c FROM Campana c WHERE c.estado = :estado AND c.nombreDueno = :nombreDueno")
    List<Campana> findByEstadoAndNombreDueno(@Param("estado") EstadoCampana estado, @Param("nombreDueno") String nombreDueno);
    
    Optional<Campana> findByIdPlataformaExterna(String idPlataformaExterna);
    
    Optional<Campana> findByNombre(String nombre);
}
