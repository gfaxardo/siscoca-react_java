package com.siscoca.repository;

import com.siscoca.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MetricaIdealRepository extends JpaRepository<MetricaIdeal, Long> {
    
    List<MetricaIdeal> findByVerticalAndPaisAndPlataformaAndSegmentoAndActivaTrue(
        Vertical vertical, Pais pais, Plataforma plataforma, Segmento segmento
    );
    
    List<MetricaIdeal> findByVerticalAndActivaTrue(Vertical vertical);
    
    List<MetricaIdeal> findByPaisAndActivaTrue(Pais pais);
    
    List<MetricaIdeal> findByPlataformaAndActivaTrue(Plataforma plataforma);
    
    List<MetricaIdeal> findBySegmentoAndActivaTrue(Segmento segmento);
    
    List<MetricaIdeal> findByActivaTrue();
}
