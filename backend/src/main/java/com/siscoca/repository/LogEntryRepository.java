package com.siscoca.repository;

import com.siscoca.model.LogEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LogEntryRepository extends JpaRepository<LogEntry, Long> {
    
    List<LogEntry> findByUsuario(String usuario);
    
    List<LogEntry> findByEntidadId(String entidadId);
    
    List<LogEntry> findByEntidad(String entidad);
    
    List<LogEntry> findByAccion(String accion);
    
    @Query("SELECT l FROM LogEntry l WHERE l.timestamp BETWEEN :fechaInicio AND :fechaFin ORDER BY l.timestamp DESC")
    List<LogEntry> findByTimestampBetween(@Param("fechaInicio") LocalDateTime fechaInicio, @Param("fechaFin") LocalDateTime fechaFin);
    
    @Query("SELECT l FROM LogEntry l WHERE l.usuario = :usuario AND l.timestamp BETWEEN :fechaInicio AND :fechaFin ORDER BY l.timestamp DESC")
    List<LogEntry> findByUsuarioAndTimestampBetween(@Param("usuario") String usuario, @Param("fechaInicio") LocalDateTime fechaInicio, @Param("fechaFin") LocalDateTime fechaFin);
    
    Page<LogEntry> findAll(Pageable pageable);
    
    @Query("SELECT l.usuario, COUNT(l) FROM LogEntry l GROUP BY l.usuario")
    List<Object[]> countLogsByUsuario();
    
    @Query("SELECT l.accion, COUNT(l) FROM LogEntry l GROUP BY l.accion")
    List<Object[]> countLogsByAccion();
    
    @Query("SELECT l.entidad, COUNT(l) FROM LogEntry l GROUP BY l.entidad")
    List<Object[]> countLogsByEntidad();
    
    @Query("SELECT l FROM LogEntry l WHERE " +
           "(:usuario IS NULL OR LOWER(l.usuario) LIKE LOWER(CONCAT('%', :usuario, '%'))) AND " +
           "(:rol IS NULL OR UPPER(l.rol) = UPPER(:rol)) AND " +
           "(:accion IS NULL OR LOWER(l.accion) LIKE LOWER(CONCAT('%', :accion, '%'))) AND " +
           "(:entidad IS NULL OR UPPER(l.entidad) = UPPER(:entidad)) AND " +
           "(:entidadId IS NULL OR l.entidadId = :entidadId) AND " +
           "(:fechaDesde IS NULL OR l.timestamp >= :fechaDesde) AND " +
           "(:fechaHasta IS NULL OR l.timestamp <= :fechaHasta)")
    List<LogEntry> findByFilters(@Param("usuario") String usuario,
                                 @Param("rol") String rol,
                                 @Param("accion") String accion,
                                 @Param("entidad") String entidad,
                                 @Param("entidadId") String entidadId,
                                 @Param("fechaDesde") LocalDateTime fechaDesde,
                                 @Param("fechaHasta") LocalDateTime fechaHasta,
                                 Sort sort);
}
