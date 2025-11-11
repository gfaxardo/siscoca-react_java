package com.siscoca.repository;

import com.siscoca.model.Creativo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CreativoRepository extends JpaRepository<Creativo, Long> {
    
    List<Creativo> findByCampana_Id(Long campanaId);
    
    @Query("SELECT c FROM Creativo c WHERE c.campana.id = :campanaId ORDER BY c.orden ASC, c.fechaCreacion DESC")
    List<Creativo> findByCampanaIdOrderByOrdenAsc(@Param("campanaId") Long campanaId);
    
    @Query("SELECT c FROM Creativo c WHERE c.campana.id = :campanaId AND c.activo = true ORDER BY c.orden ASC, c.fechaCreacion DESC")
    List<Creativo> findActivosByCampanaId(@Param("campanaId") Long campanaId);
    
    @Query("SELECT c FROM Creativo c WHERE c.campana.id = :campanaId AND c.activo = false ORDER BY c.fechaCreacion DESC")
    List<Creativo> findDescartadosByCampanaId(@Param("campanaId") Long campanaId);
    
    long countByCampana_Id(Long campanaId);
    
    long countByCampana_IdAndActivoTrue(Long campanaId);
}

