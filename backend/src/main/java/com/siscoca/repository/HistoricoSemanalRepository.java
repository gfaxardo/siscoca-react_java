package com.siscoca.repository;

import com.siscoca.model.HistoricoSemanal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistoricoSemanalRepository extends JpaRepository<HistoricoSemanal, Long> {
    
    List<HistoricoSemanal> findByCampana_Id(Long campanaId);
    
    List<HistoricoSemanal> findBySemanaISO(Integer semanaISO);
    
    @Query("SELECT h FROM HistoricoSemanal h WHERE h.campana.id = :campanaId ORDER BY h.semanaISO DESC")
    List<HistoricoSemanal> findByCampanaIdOrderBySemanaISODesc(@Param("campanaId") Long campanaId);
    
    @Query("SELECT h FROM HistoricoSemanal h WHERE h.semanaISO BETWEEN :semanaInicio AND :semanaFin ORDER BY h.semanaISO DESC")
    List<HistoricoSemanal> findBySemanaISOBetween(@Param("semanaInicio") Integer semanaInicio, @Param("semanaFin") Integer semanaFin);
}
