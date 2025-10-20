package com.siscoca.repository;

import com.siscoca.model.LogEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LogEntryRepository extends JpaRepository<LogEntry, Long> {
    
    List<LogEntry> findByUsuarioId(Long usuarioId);
    
    List<LogEntry> findByCampanaId(Long campanaId);
    
    List<LogEntry> findByEntidad(String entidad);
    
    List<LogEntry> findByAccion(String accion);
    
    @Query("SELECT l FROM LogEntry l WHERE l.fechaCreacion BETWEEN :fechaInicio AND :fechaFin ORDER BY l.fechaCreacion DESC")
    List<LogEntry> findByFechaCreacionBetween(@Param("fechaInicio") LocalDateTime fechaInicio, @Param("fechaFin") LocalDateTime fechaFin);
    
    @Query("SELECT l FROM LogEntry l WHERE l.usuario.id = :usuarioId AND l.fechaCreacion BETWEEN :fechaInicio AND :fechaFin ORDER BY l.fechaCreacion DESC")
    List<LogEntry> findByUsuarioIdAndFechaCreacionBetween(@Param("usuarioId") Long usuarioId, @Param("fechaInicio") LocalDateTime fechaInicio, @Param("fechaFin") LocalDateTime fechaFin);
    
    @Query("SELECT COUNT(l) FROM LogEntry l WHERE l.usuario.id = :usuarioId")
    Long countByUsuarioId(@Param("usuarioId") Long usuarioId);
    
    @Query("SELECT l.accion, COUNT(l) FROM LogEntry l GROUP BY l.accion")
    List<Object[]> countByAccion();
    
    @Query("SELECT l.entidad, COUNT(l) FROM LogEntry l GROUP BY l.entidad")
    List<Object[]> countByEntidad();
}
